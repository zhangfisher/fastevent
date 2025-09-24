/**
 *
 * Channel 用于创建一个异步的数据流，可以用于在多个协程之间传递数据
 *
 *
 *
 *
 * const emitter = new FastEvent()
 *
 *
 * channel = emitter.channel("a.b.c.d", *(channel)=>{
 *
 * })
 *
 * channel.push(1)
 * channel.push(2)
 *
 * channel.close()
 *
 * emitter.on("a.b.c.d",*(channel) => {
 *    while(true){
 *         const value = yield channel.pop(1)
 *    }
 * })
 *
 * emitter.emit("a.b.c.d",1)
 *
 * for(let data of await channel){
 *    console.log(d)
 * }
 *
 * emitter.on('ssss',*(channel)=>{
 *    while(true){
 *         const value = yield channel.pop(1)
 *         console.log(value)
 *    }
 * })
 *
 * emitter.publish("xxxx")
 *
 *
 *
 *
 *
 */

export {};
