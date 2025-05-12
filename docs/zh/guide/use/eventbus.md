# 事件总线

基于`FastEvent`开发一个简单的事件总线，用于帮助开发事件驱动的模块化应用程序。

一般情况下，在模块化应用程序中：

- 应用包括1个`FastEventBus`实例+多个`FastEventBusNode`实例
- `FastEventBus`实例作为消息中心，管理各个`FastEventBusNode`实例。
- 每个应用模块绑定一个`FastEventBusNode`实例，并连接到总线。
- 支持`广播消息`、`发布与订阅`、`点对点消息`三种通讯方式
- `FastEventBus`和`FastEventBusNode`均继承自`FastEvent`


## 使用方法

### 第1步：创建事件总线

```ts
import { FastEventBus } from 'fastevent/eventbus';

const eventbus = new FastEventBus();

```
### 第2步：创建节点

```ts
import { FastEventBusNode } from 'fastevent/eventbus';

const node1 = new FastEventBusNode({id:'node1'});
node1.connect(eventubs) // [!code ++]

const node2 = new FastEventBusNode({id:'node2'});
node2.connect(eventubs) // [!code ++]

```
### 第3步：点对点消息

```ts

node1.onMessage = (message,args)=>{
    console.log('node1 receive message',message,args);
}

node2.onMessage = (message,args)=>{
    // message.type='data'
    // message.from==='node'
    // message.to==='node1'
    // message.payload==='hello node2'
}
// 向node2发送消息
node1.send('node2','hello node2')


```

### 第4步：广播消息

```ts
node1.onMessage = (message,args)=>{ }
node2.onMessage = (message,args)=>{ }
node3.onMessage = (message,args)=>{ }

// 向所有节点广播消息
node1.broadcast('hello all')
```

### 第5步：发布与订阅

每个`FastEventbusNode`实例本身就是一个`FastEvent`实例。
除了自身的发布与订阅外，还支持向其他节点发布与订阅消息。

```ts
const node1 = new FastEventBusNode({id:'node1'});
const node2 = new FastEventBusNode({id:'node2'});
const node3 = new FastEventBusNode({id:'node3'});
const node4 = new FastEventBusNode({id:'node4'});
const node5 = new FastEventBusNode({id:'node5'});
eventbus.add(node1,node2,node3,node4,node5)

// 在node2节点上触发事件
node1.emit('node2::test','hello node2')

// 订阅node2节点上的事件
node1.on('node2::test',(message,args)=>{
    console.log('receive message from node2',message,args);
})
```

## 指南

### 创建节点

每个`Node`实例可以单独创建，也可以通过继承方式创建。

- **独立创建**

```ts
import { FastEventBus,FastEventBusNode } from 'fastevent/eventbus';

const eventbus = new FastEventBus()

const node = new FastEventBusNode({
    // 节点必须有一个全局唯一的id
    id:'node1'      // [!code ++],
    // 在此接收点对点消息和广播消息
    onMessage:(message,args)=>{        // [!code ++],
    }
});

node.connect(eventbus)//[!code ++]
// 或者
eventbus.add(node)//[!code ++]
```

- **继承创建**

```ts
import { FastEventBus,FastEventBusNode } from 'fastevent/eventbus';

const eventbus = new FastEventBus()

class MyNode extends FastEventBusNode{
    constructor(){
        super({
            id:'node1'      // [!code ++]
        });
    }
    onMessage(message,args){
      在此接收点对点消息和广播消息 //[!code ++]
    }
}
node.connect(eventbus)//[!code ++]
// 或者
eventbus.add(node)//[!code ++]
```

- `onMessage`用于接收点对点消息和广播消息，不需要订阅。


### 广播消息

每个`Node`实例均可以接收和发送广播消息。

```ts
import { FastEventBus,FastEventBusNode } from 'fastevent/eventbus';

const eventbus = new FastEventBus()

// 广播消息，所有节点均可以接收
eventbus.broadcast('message')
// 广播消息，保留消息,所有后续加入的节点均可以接收到
eventbus.broadcast('message',{retain:true})
// 广播消息，
eventbus.broadcast({
    type:'xxx',
    payload:100
})

```

- 节点不需要订阅，在连接后就可以在`onMessage`接收广播消息。
- `FastEventBus`继承自`FastEvent`，`broadcast`本质上也就是调用了`emit`方法。


### 点对点发送

每个节点均具有唯一的`id`，通过`id`可以发送点对点消息。

```ts
import { FastEventBus,FastEventBusNode } from 'fastevent/eventbus'; 

const eventbus = new FastEventBus()
const node1 = new FastEventBusNode({id:'node1',onMessage:(message,args)=>{
    // 在此接收对点对点和广播消息
});
const node2 = new FastEventBusNode({id:'node2'},onMessage:(message,args)=>{
    // 在此接收对点对点和广播消息
});
eventbus.add(node1,node2)

// 向node2节点发送消息
node1.send('node2','message')

```

- `send`方法内部也是使用`emit`方法发送消息，因此也可以接收返回值，以及`FastEvent`的所有特性。


### 发布与订阅

`FastEventBus`和`FastEventBusNode`均继承自`FastEvent`，因此可以使用`FastEvent`的所有特性。

除了节点内部的发布与订阅外，`FastEventBusNode`还提供了一种简化节点之间可以相互发布和订阅的机制。

即当事件名称形如`<目标节点名称>::<事件类型>`时，会自动在目标节点上进行发布与订阅。

```ts
import { FastEventBus,FastEventBusNode } from 'fastevent/eventbus'; 

const eventbus = new FastEventBus()
const node1 = new FastEventBusNode({id:'node1');
const node2 = new FastEventBusNode({id:'node2'});
eventbus.add(node1,node2)

// 订阅node2上的事件
node1.on('node2::message',(message,args)=>{})
// 在node2上触发事件
node1.emit('node2::message',payload)

```

:::warning 提示
在跨节点的发布和订阅除了名称上的约定外，其他特性与本地节点的发布订阅完全一致。
:::