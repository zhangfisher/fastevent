/**
 * 
 * EventChannel用于提供一个事件流功能
 * 
 * 创建一个事件频道
 * 

const channel = emitter.channel("network", source)

const listener = *(channel)=> {
    
    // 状态管理
    while(true) {
        // 等待连接
        const [action] = yield channel.take(['open','error'], { timeout: 1000 })

        if(action.type==='error'){
            // 处理错误
            yield channel.sleep(1000)
        }else{
            //等待断开连接事件
            const [action] = yield channel.take('close')                
        }

        
        // 从队列中拉取数据
        while(true){
            const data = yield channel.pop()
        }
        
        
        
        // 等待断开连接事件

        const [disconnMsg] = yield channel.take('close')
        yield channel.sleep(1000)
    
        yield channel.put({ type: 'open', data: connMsg.data})
    }

}

class Channel extends FastEventScope{
    socket
    buffer:any[]
    onStart(){
        this.socket = new WebSocket('ws://localhost:8888');
        this.socket.onopen = (event) =>  channel.emit("open", event,true)
        this.socket.onmessage = (event) => channel.emit("data", event.data)
        this.socket.onclose = (event) => channel.emit("close", event,true)
        this.socket.onerror = (err) => channel.emit("error",err)
    }
    onNext(){

    }
    onStop(){
    }

    
}


//
channel.action('open',(message)=>{
    socket.open()
})
channel.action('close',(message)=>{
    socket.close()
})
 
channel.emit("data", 1)
channel.emit("data", 2)
channel.emit("data", 3) 

emitter.on("data",*(channel)=>{
    for(let i=0;i<10;i++){
        const data = yield channel.pop()
        yield channel.run(handleData(data))
        yield channel.sleep(1000)
    }
})

    
*/

import { FastEventScope, FastEventScopeOptions } from "./scope";

export type FastEventChannelOptions<
    Meta = Record<string, any>,
    Context = any
> = FastEventScopeOptions<Meta, Context>
export class FastEventChannel<
    Events extends Record<string, any> = Record<string, any>,
    Meta extends Record<string, any> = Record<string, any>,
    Context = never
> extends FastEventScope<Events, Meta, Context> {

}