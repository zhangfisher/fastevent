/**
 * 
 * EventChannel用于提供一个事件流功能
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 创建一个事件频道
 * 

const channel = emitter.channel("network", source)

const listener = *(channel)=> {
    
    // 状态管理
    while(true) {
        // 等待连接
        const [connMsg] = yield channel.take('open', { timeout: 1000 })

        
        // 从队列中拉取数据
        while(true){
            const data = yield channel.pop()
        }
        
        
        
        // 等待断开连接事件

        const [disconnMsg] = yield channel.take('close')
        yield channel.sleep(1000)


    }

}

channel.on(listener)
channel.on(listener)



const socket = new WebSocket('ws://localhost:8888');
socket.onopen = (event) =>  channel.emit("open", event,true)
socket.onmessage = (event) => channel.emit("data", event.data)
socket.onclose = (event) => {
    channel.emit("open")
    channel.emit("close", event,true)
}
socket.onerror = (err) => channel.emit("error",err)

 
channel.emit("data", 1)
channel.emit("data", 2)
channel.emit("data", 3) 

    
*/

export { }