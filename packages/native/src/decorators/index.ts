/**
 * 
 * 提供一些类装饰器，用于简化事件监听的代码
 * 
 * const emitter = new FastEvent()
 * 
 * class MyClass{
 *    // 监听事件时传入onEvent,this指向的是当前类实例
 *    @emitter.on("event",options)
 *    onEvent(message,args){
 *    }
 *    // 监听事件时传入onEvent,this指向的是当前类实例
 *    @emitter.once("event",options)
 *    onEvent(message,args){
 *    }
 *    // 将接收到的消息的message.payload值写入count
 *    @emitter.on("event",options)
 *    count:number = 0
 * }
 * 
 * 
 * 
 * 
 */
export { }