import { FastEventListener, Event, FastEventOptions, FastEvents, FastEventSubscribers, FastSubscriberNode, FastEventSubscriber } from './types';


 

export class FastEvent<Events extends FastEvents> {
    private _subscribers: FastEventSubscribers = { __listeners__: [] } as unknown as FastEventSubscribers
    private _onceSubscribers: FastEventSubscribers = { __listeners__:[] } as unknown as FastEventSubscribers
    
    private _options: Required<FastEventOptions>
    private _delimiter:string

    constructor(options?:FastEventOptions) { 
        this._options = Object.assign({
            delimiter: '.'
        }, options)
        this._delimiter = this._options.delimiter
    }
    get options(){
        return this._options
    }

    private _addListener(parts:string[],listener:FastEventListener<any,any>,once?:boolean):FastEventListener<any,any>[]{
        if(parts.length === 0) return []        
        let current =once ? this._onceSubscribers : this._subscribers 

        for(let i=0;i<parts.length;i++){
            const part = parts[i]
            if(!(part in current)){
                current[part] = {
                    __listeners__: [],
                } as unknown as FastEventSubscribers
            }
            if(i===parts.length-1){ 
                const listeners = current[part].__listeners__
                listeners.push(listener)
                return listeners
            }else{                
                current = current[part]
            }
        }
        return []
    }    

    private _removeListener(listeners:any[],listener:FastEventListener<any,any>):void{
        while(true){
            const index = listeners.indexOf(listener)
            if(index === -1) break
            listeners.splice(index,1)
        }
    }

    public on<K extends keyof Events & string>(event: K,listener: FastEventListener<K, Events[K]>): FastEventSubscriber{
        const parts = event.split(this._options.delimiter);
        const listeners = this._addListener(parts,listener)
        return {
            off:()=>this._removeListener(listeners,listener)
        }
    } 
    public once<K extends keyof Events & string>(event: K,listener: FastEventListener<K, Events[K]>): FastEventSubscriber{
        const parts = event.split(this._options.delimiter);
        const listeners = this._addListener(parts,listener,true)
        return {
            off:()=>this._removeListener(listeners,listener)
        }
    } 
    onAny(listener:FastEventListener<any,any>):FastEventSubscriber{
        const listeners = this._addListener([],listener)
        return {
            off:()=>this._removeListener(listeners,listener)
        }
    }



    public emit(event,string,payload?:any):void{
        const parts = event.split(this._options.delimiter); 
        
      

    }
} 
