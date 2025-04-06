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
        return type===undefined ? undefined : this.prefix + type
    }   
    public on<P=any>(type: string, listener: FastEventListener<P >, count?:number ): FastEventSubscriber
    public on(type: Types, listener: FastEventListener<Events[Types],Types>, count?:number ): FastEventSubscriber
    public on(type: '**', listener: FastEventListener<any>): FastEventSubscriber
    public on(): FastEventSubscriber{
        const args = [...arguments] as [any,any,any]
        args[0]    = this._getScopeType(args[0])
        args[1]    = this._getScopeListener(args[1])
        return this.emitter.on(...args)
    }
    public once<P=any>(type: string, listener: FastEventListener<P,string>): FastEventSubscriber
    public once(type: Types, listener: FastEventListener<Events[Types],Types> ): FastEventSubscriber
    public once(): FastEventSubscriber{
        return this.on(arguments[0],arguments[1],1)
    }
    onAny<P=any>(listener: FastEventListener<P, string>): FastEventSubscriber {
        const type = this.prefix + '**'
        return this.on(type,listener)
    }   
    offAll(){
        this.emitter.offAll(this.prefix)
    } 
    off(listener: FastEventListener<any, any>):void    
    off(type: string, listener: FastEventListener<any, any>):void
    off(type: string):void
    off(){
        const args = arguments as unknown as [any,any]
        if(typeof(args[0])==='string'){
            args[0] = this._getScopeType(args[0])
        }
        this.emitter.off(...args)
    }
}