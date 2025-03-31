

export interface FastEventMessage<P=any>{
    type    : string
    payload?: P
}
export type FastEventListener<P=any> = (event: FastEventMessage<P>) => any | Promise<any>

