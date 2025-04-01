

export interface Event<E=string,P=any>{
    type    : E
    payload?: P
}

export type FastEventListener<E=string, P=any> = (event: Event<E,P>) => any | Promise<any>


export type FastSubscriberNode  = {
    __listeners__: FastEventListener<any,any>[];    
} & {
    [key:string]: FastSubscriberNode
}

export type FastEventSubscriber = {
    off:()=>void
}



export type FastEventSubscribers = FastSubscriberNode

export type FastEventOptions = {
    delimiter?:string
}
 

export type FastEvents = Record<string,any>
