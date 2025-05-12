# Event Bus

Develop a simple event bus based on `FastEvent` to help build event-driven modular applications.

Generally, in modular applications:

- The application includes 1 `FastEventBus` instance + multiple `FastEventBusNode` instances
- The `FastEventBus` instance serves as a message center, managing various `FastEventBusNode` instances
- Each application module is bound to a `FastEventBusNode` instance and connects to the bus
- Supports three communication methods: `broadcast messages`, `publish and subscribe`, and `point-to-point messages`
- Both `FastEventBus` and `FastEventBusNode` inherit from `FastEvent`


## Usage

### Step 1: Create an Event Bus

```ts
import { FastEventBus } from 'fastevent/eventbus';

const eventbus = new FastEventBus();

```
### Step 2: Create Nodes

```ts
import { FastEventBusNode } from 'fastevent/eventbus';

const node1 = new FastEventBusNode({id:'node1'});
node1.connect(eventubs) // [!code ++]

const node2 = new FastEventBusNode({id:'node2'});
node2.connect(eventubs) // [!code ++]

```
### Step 3: Point-to-Point Messages

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
// Send message to node2
node1.send('node2','hello node2')


```

### Step 4: Broadcast Messages

```ts
node1.onMessage = (message,args)=>{ }
node2.onMessage = (message,args)=>{ }
node3.onMessage = (message,args)=>{ }

// Broadcast message to all nodes
node1.broadcast('hello all')
```

### Step 5: Publish and Subscribe

Each `FastEventbusNode` instance is itself a `FastEvent` instance.
In addition to its own publishing and subscribing, it also supports publishing and subscribing messages to other nodes.

```ts
const node1 = new FastEventBusNode({id:'node1'});
const node2 = new FastEventBusNode({id:'node2'});
const node3 = new FastEventBusNode({id:'node3'});
const node4 = new FastEventBusNode({id:'node4'});
const node5 = new FastEventBusNode({id:'node5'});
eventbus.add(node1,node2,node3,node4,node5)

// Trigger an event on node2
node1.emit('node2::test','hello node2')

// Subscribe to events on node2
node1.on('node2::test',(message,args)=>{
    console.log('receive message from node2',message,args);
})
```

## Guide

### Creating Nodes

Each `Node` instance can be created independently or through inheritance.

- **Independent Creation**

```ts
import { FastEventBus,FastEventBusNode } from 'fastevent/eventbus';

const eventbus = new FastEventBus()

const node = new FastEventBusNode({
    // Node must have a globally unique id
    id:'node1'      // [!code ++],
    // Receive point-to-point messages and broadcast messages here
    onMessage:(message,args)=>{        // [!code ++],
    }
});

node.connect(eventbus)//[!code ++]
// Or
eventbus.add(node)//[!code ++]
```

- **Creation through Inheritance**

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
      Receive point-to-point messages and broadcast messages here //[!code ++]
    }
}
node.connect(eventbus)//[!code ++]
// Or
eventbus.add(node)//[!code ++]
```

- `onMessage` is used to receive point-to-point messages and broadcast messages, no subscription needed.


### Broadcast Messages

Each `Node` instance can receive and send broadcast messages.

```ts
import { FastEventBus,FastEventBusNode } from 'fastevent/eventbus';

const eventbus = new FastEventBus()

// Broadcast message, all nodes can receive
eventbus.broadcast('message')
// Broadcast message, retain message, all nodes joining later can also receive
eventbus.broadcast('message',{retain:true})
// Broadcast message
eventbus.broadcast({
    type:'xxx',
    payload:100
})

```

- Nodes do not need to subscribe; they can receive broadcast messages in `onMessage` after connecting.
- `FastEventBus` inherits from `FastEvent`, so `broadcast` essentially calls the `emit` method.


### Point-to-Point Sending

Each node has a unique `id`, through which point-to-point messages can be sent.

```ts
import { FastEventBus,FastEventBusNode } from 'fastevent/eventbus'; 

const eventbus = new FastEventBus()
const node1 = new FastEventBusNode({id:'node1',onMessage:(message,args)=>{
    // Receive point-to-point and broadcast messages here
});
const node2 = new FastEventBusNode({id:'node2'},onMessage:(message,args)=>{
    // Receive point-to-point and broadcast messages here
});
eventbus.add(node1,node2)

// Send message to node2
node1.send('node2','message')

```

- The `send` method also uses the `emit` method internally to send messages, so it can also receive return values and all features of `FastEvent`.


### Publish and Subscribe

Both `FastEventBus` and `FastEventBusNode` inherit from `FastEvent`, so they can use all features of `FastEvent`.

In addition to internal publishing and subscribing within nodes, `FastEventBusNode` also provides a simplified mechanism for nodes to publish and subscribe to each other.

That is, when the event name is in the form of `<target node name>::<event type>`, it will automatically publish and subscribe on the target node.

```ts
import { FastEventBus,FastEventBusNode } from 'fastevent/eventbus'; 

const eventbus = new FastEventBus()
const node1 = new FastEventBusNode({id:'node1');
const node2 = new FastEventBusNode({id:'node2'});
eventbus.add(node1,node2)

// Subscribe to events on node2
node1.on('node2::message',(message,args)=>{})
// Trigger an event on node2
node1.emit('node2::message',payload)

```

:::warning Note
In cross-node publishing and subscribing, apart from the naming convention, other features are completely consistent with local node publishing and subscribing.
:::