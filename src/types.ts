
export type FastEventListener<P=any,T=string> = ( payload:P, type: T ) => any | Promise<any>

export type FastListenerNode  = {
    __listeners: (FastEventListener<any,any> | [FastEventListener<any,any>,number])[];  
} & {
    [key:string]: FastListenerNode
}

export type FastEventSubscriber = {
    off:()=>void
}


export interface FastEventListenerMeta{
    emitter?:string
}


export type FastListeners = FastListenerNode

export type FastEventOptions = {
    // 事件分隔符
    delimiter?: string
    // 侦听器函数执行上下文
    context?  : any    
    // 当执行侦听器函数出错时是否忽略,默认true
    ignoreErrors?: boolean       
    // 当侦听器函数执行出错时的回调，用于诊断时使用,可以打印错误信息
    onListenerError?: ((type:string,error:Error)=>void) 
    // 事件前缀,当创建scope时使用
    scopePreifx?: string
    // 额外的元数据，当触发事件时传递给侦听器
    meta?:Record<string,any>
    // 当创建新侦听器时回调
    onNewListener?:(path:string,listener:FastEventListener)=>void
}
 

export type FastEvents = Record<string,any>


export interface IFastEvent{
    
}
 