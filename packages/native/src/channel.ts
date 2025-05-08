
/**
const channel = emitter.channel("net:start", source)

channel.emit("data", 1)
channel.emit("data", 2)
channel.emit("data", 3)


emitter.on("net:start",* (channel)=> {
    // 读取数据
    channel.on("data", (data) => {

    })
    // 状态管理
    while(true) {


        // 等待连接
        const [connMsg] = yield channel.take('connect', { timeout: 1000 })

        // 从队列中拉取数据
        const data = yield channel.pop()

        // 等待断开连接事件
        const [disconnMsg] = yield channel.take('disconnect')


        yield channel.sleep(1000)


    }

})
    
*/