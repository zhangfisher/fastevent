import { FastEventListener, Event, FastEventOptions, FastEvents, FastEventSubscribers, FastSubscriberNode, FastEventSubscriber } from './types';


 

export class FastEvent<Events extends FastEvents> {
    private _subscribers: FastEventSubscribers = { __listeners__: [] } as unknown as FastEventSubscribers
    private _onceSubscribers: FastEventSubscribers = { __listeners__:[] } as unknown as FastEventSubscribers
    private _retainEvents
    private _options: Required<FastEventOptions>
    private _delimiter:string
    private _context:any

    constructor(options?:FastEventOptions) { 
        this._options = Object.assign({
            delimiter: '.',
            context  : null
        }, options)
        this._delimiter = this._options.delimiter
        this._context = this._options.context || this
    }
    get options(){
        return this._options
    }

    private _addListener(parts:string[],listener:FastEventListener<any,any>,once?:boolean):FastSubscriberNode | undefined{
        if(parts.length === 0) return 
        let current =once ? this._onceSubscribers : this._subscribers
        let curPath:string[] = []
        for(let i=0;i<parts.length;i++){
            const part = parts[i]
            curPath.push(part)
            if(!(part in current)){
                current[part] = {
                    __listeners__: [],
                    __path__: curPath.join(this._delimiter)
                } as unknown as FastEventSubscribers
            }
            if(i===parts.length-1){ 
                const node = current[part]
                node.__listeners__.push(listener)
                return node
            }else{                
                current = current[part]
            }
        }
        return undefined
    }    

    private _removeListener(node:FastSubscriberNode,listener:FastEventListener<any,any>):void{
        while(true){
            const index = node.__listeners__.indexOf(listener)
            if(index === -1) break
            node.__listeners__.splice(index,1)
        }
    }

    public on<K extends keyof Events & string>(event: K,listener: FastEventListener<K, Events[K]>): FastEventSubscriber{
        if(event.length===0) throw new Error('event name cannot be empty')
        if(['*','**'].includes(event)){
            return this.onAny(listener)
        }
        const parts = event.split(this._options.delimiter);
        const node = this._addListener(parts,listener)

        if(node) this._emitForRatian(node)

        return {
            off: ()=>node && this._removeListener(node,listener)
        }
    } 

    public once<K extends keyof Events & string>(event: K,listener: FastEventListener<K, Events[K]>): FastEventSubscriber{
        const parts = event.split(this._options.delimiter);
        const node = this._addListener(parts,listener,true)
        if(node) this._emitForRatian(node)
        return {
            off:()=>node && this._removeListener(node,listener)
        }
    }
    /**
     * 注册一个监听器，用于监听所有事件
     * @param listener 事件监听器函数，可以接收任意类型的事件数据
     * @returns {FastEventSubscriber} 返回一个订阅者对象，包含 off 方法用于取消监听
     * @example
     * ```ts
     * const subscriber = emitter.onAny((eventName, data) => {
     *   console.log(eventName, data);
     * });
     * 
     * // 取消监听
     * subscriber.off();
     * ```
     */
    onAny(listener: FastEventListener<any, any>): FastEventSubscriber {
        const listeners = this._subscribers.__listeners__
        listeners.push(listener)
        return {
            off:()=>this._removeListener(this._subscribers,listener)
        }
    }

    private _emitForRatian(node: FastSubscriberNode){   
        if(node && node.__last__){
            this._executeListeners(node,node.__last__)
        }
    }
 
    private _forEachSubscribers(node: FastSubscriberNode, parts: string[], callback: (node: FastSubscriberNode) => void): void {
        // If no more parts to traverse, process current node's listeners
        if (parts.length === 0) {
            if (node.__listeners__ && node.__listeners__.length > 0) {
                callback(node);
            }
            return;
        }    
        const [currentPart, ...remainingParts] = parts;        
        // Check if current part exists in the node
        if (currentPart in node) {
            this._forEachSubscribers(node[currentPart], remainingParts, callback);
        }        
        // Also check wildcard if it exists (common pattern in event systems)
        if ('*' in node) {
            this._forEachSubscribers(node['*'], remainingParts, callback);
        }
    } 

    private _executeListeners(node: FastSubscriberNode,event:Event): void {
        node && node.__listeners__.forEach(listener => {                
            listener.call(this._context,event)
        });
    }

    public emit(type:string,payload?:any,retain?:boolean):void
    public emit(event:Event,retain?:boolean):void
    public emit():void{
        const args = arguments
        const event:Event = {
            type:typeof(args[0])==='string' ? args[0] : args[0].type,
            payload:typeof(args[0]) ? args[1] : args[0].payload
        }
        const retain = typeof(args[args.length-1])==='boolean' ? args[args.length-1] : false
        const parts = event.type.split(this._options.delimiter); 
        
        this._forEachSubscribers(this._subscribers,parts,(node)=>{  
            if(retain) node.__last__ = event
            this._executeListeners(node,event)
        }) 

        this._forEachSubscribers(this._onceSubscribers,parts,(node)=>{  
            if(retain) node.__last__ = event
            this._executeListeners(node,event)
            node.__listeners__=[]
        }) 

    }



} 
