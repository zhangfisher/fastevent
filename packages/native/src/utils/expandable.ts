/**
 * 
 * 
 * 用于包括输入值为可展开的对象
 * 
 * 
 * 用在emit事件
 * 
 * emitter1 = new FastEvent()
 * emitter2 = new FastEvent()
 * 
 * emitter1.on("xxx",(message)=>{
 *      return emitter2.emit(message)
 * })
 * 
 * emitter2.on("xxx",()=>1)
 * emitter2.on("xxx",()=>2)
 * 
 * const results = emitter1.emit("xxx")
 * // results == [[1,2]] 而不 [1,2]，因为emitter2.emit返回的是一个[]
 * 
 * expandable的作用就是对emit结果进行包括，当isExpandable时，在emit内部进行展开
 * 
 * 
 * 
 * 
 * emitter1.on("xxx",(message)=>{
 *      // 告诉emitter2.emit返回的是一个expandable对象
 *      // 然后在内部就展开此对象
 *      return emitter2.emit(message)
 * })
 * 
*  const results = emitter1.emit("xxx")
 * // results ==  [1,2]
 * 
 * 为了实现对结果数据的展开处理，在emit内部需要对监听器的执行结果进行依次检查
 * 这多了一个迭代操作，为了不影响性能，可以关闭此特性
 * options.expandEmitResults = false
 * 
 * 
 */

export const __expandable__ = Symbol.for('__expandable__')

export function expandable(value: any) {
    value[__expandable__] = true
    return value
}

export function isExpandable(value: any) {
    return value && value[__expandable__]
}