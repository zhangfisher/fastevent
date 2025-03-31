import { signal, effectScope, effect, Signal } from 'alien-signals';
import { FastEventListener, FastEventMessage } from './types';


export type FastEventOptions = {
    delimiter?:string
}

type Signal = ReturnType<typeof signal>

type Subscribers = Map<string, Signal[]>

export class FastEvent {
    private _subscribers: Subscribers = new Map<string,Signal[]>();
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

    public on<Payload=any>(event: string, listener: FastEventListener<Payload>): void {
        const parts = event.split(this._options.delimiter);
        if(this._subscribers.has(event)){
            this._subscribers.set(event,[]);
        }
    } 
    public emit(event,string,payload?:any):void{
        const parts = event.split(this._options.delimiter);


        for(let i=0;i<parts.length;i++){
            const part = parts[i];

        }
      

    }
}

/**
 * 
 * .on("a.b",()=>{})
 * .on("a.b.*",()=>{})
 * .on("*.b.*",()=>{})
 * 
 * .emit("a.b.c")
 * 
 */
const listeners = {
    a:{
        _signals:[signal()],
        b:{
            _signals:[signal()],
            '*':{
                _signals:[signal()],
            }
        }
    },
    "*":{
        _signals:[signal()],
        b:{
            _signals:[signal()],
            '*':{
                _signals:[signal()],
            }
        }
    }
}

function FastEventMessage<T>() {
    throw new Error('Function not implemented.');
}
