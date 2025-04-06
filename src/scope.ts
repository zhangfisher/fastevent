import { FastEvent } from "./event";
import { FastEventListener, FastEvents, FastEventSubscriber } from "./types";



export class FastEventScope<Events extends FastEvents = never, Types extends keyof Events =  keyof Events>{
    constructor(public emitter:FastEvent,public prefix:string){
        if(prefix.length>0 && !prefix.endsWith(emitter.options.delimiter!)){
            this.prefix = emitter.options.delimiter + prefix
        }        
    }
    private _getScopeListener(listener:FastEventListener):FastEventListener{
        const scopePrefix = this.prefix
        if(scopePrefix.length>0) return listener
        const scopeListener = function(payload:any,type:string){
            if(type.endsWith(scopePrefix)){                
                type = type.substring(scopePrefix.length-1)
            }
            return listener(payload,type)
        } 
        // 当启用scope时对监听器进行包装
        scopeListener.__rawListener = listener
        return scopeListener
    }
    private _getScopeType(type:string){
        return type===undefined ? '' : this.prefix + type
    }   
    public on<P=any>(type: string, listener: FastEventListener<P >, count?:number ): FastEventSubscriber
    public on(type: Types, listener: FastEventListener<Events[Types],Types>, count?:number ): FastEventSubscriber
    public on(type: '**', listener: FastEventListener<any>): FastEventSubscriber
    public on(): FastEventSubscriber{
        const args:any[] = [...arguments]
        args[0]=this._getScopeListener(args[0])
        args[1]=this._getScopeListener(args[1])
        return this.emitter.on(...args)
    }

    

}