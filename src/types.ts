

export interface Event<E=string,P=any>{
    type    : E
    payload?: P
}

export type FastEventListener<E=string, P=any> = (event: Event<E,P>) => any | Promise<any>


export type FastSubscriberNode  = {
    __listeners__: (FastEventListener<any,any> | [FastEventListener<any,any>,number])[];  
    __last__ : any  
} & {
    [key:string]: FastSubscriberNode
}

export type FastEventSubscriber = {
    off:()=>void
}



export type FastEventSubscribers = FastSubscriberNode

export type FastEventOptions = {
    delimiter?: string
    context?  : any
}
 

export type FastEvents = Record<string,any>
