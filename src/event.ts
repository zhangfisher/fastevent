import { FastEventScope } from './scope';
import { 
    FastEventListener,  
    FastEventOptions, 
    FastEvents, 
    FastListeners, 
    FastListenerNode, 
    FastEventSubscriber, 
    ScopeEvents,
    FastEventMeta
} from './types'; 
import { isPathMatched } from './utils/isPathMatched';
import { removeItem } from './utils/removeItem';
 
export class FastEvent<
    Events extends FastEvents  = FastEvents, 
    Types extends keyof Events = keyof Events,
    Meta                       = unknown
>{
    public listeners        : FastListeners = { __listeners: [] } as unknown as FastListeners
    private _options        : FastEventOptions
    private _delimiter      : string = '/'
    private _context        : any
    private _retainedEvents : Map<string,any> = new Map<string,any>() 
    constructor(options?:FastEventOptions<Meta>) { 
        this._options = Object.assign({
            delimiter          : '/',
            context            : null,
            ignoreErrors       : true
        }, options)
        this._delimiter = this._options.delimiter!
        this._context = this._options.context || this
    }
    get options(){ return this._options  }
    private _addListener(parts:string[],listener:FastEventListener<any,any>,count?:number):FastListenerNode | undefined{
        return this._forEachNodes(parts,(node)=>{
            node.__listeners.push(count && count >0 ? [listener,count]: listener)
            if(typeof(this._options.onAddListener)==='function'){
                this._options.onAddListener(parts,listener)
            }
        }) 
    }
    /**
     * 
     * 根据parts路径遍历侦听器树，并在最后的节点上执行回调函数
     * 
     * @param parts 
     * @param callback 
     * @returns 
     */
    private _forEachNodes(parts:string[],callback:(node:FastListenerNode,parent:FastListenerNode)=>void):FastListenerNode | undefined{
        if(parts.length === 0) return 
        let current = this.listeners
        for(let i=0;i<parts.length;i++){
            const part = parts[i]
            if(!(part in current)){
                current[part] = {
                    __listeners: []
                } as unknown as FastListeners
            }
            if(i===parts.length-1){ 
                const node = current[part]
                callback(node,current)
                return node
            }else{                
                current = current[part]
            }
        }
        return undefined
    }    


    /**
     * 从监听器节点中移除指定的事件监听器
     * @private
     * @param node - 监听器节点
     * @param listener - 需要移除的事件监听器
     * @description 遍历节点的监听器列表,移除所有匹配的监听器。支持移除普通函数和数组形式的监听器
     */
    private _removeListener(node: FastListenerNode, path:string[],listener: FastEventListener<any,any,any>): void {
        if(!listener) return 
        removeItem(node.__listeners,(item:any)=>{
            item =  Array.isArray(item) ? item[0] : item 
            const isRemove = item === listener 
            if(isRemove && typeof(this._options.onRemoveListener)==='function'){
                this._options.onRemoveListener(path,listener)
            }
            return isRemove
        }) 
    }
    public on<T extends string>(type: T, listener: FastEventListener<T,Events[T],Meta>, count?:number ): FastEventSubscriber
    public on<T extends Types=Types>(type: T, listener: FastEventListener<Types,Events[T],Meta>, count?:number ): FastEventSubscriber
    public on<P=any>(type: '**', listener: FastEventListener<Types,P,Meta>): FastEventSubscriber
    public on(): FastEventSubscriber{
        const type = arguments[0] as string
        const listener = arguments[1] as FastEventListener 
        const count = arguments[2] as number
        if(type.length===0) throw new Error('event type cannot be empty')

        if(type==='**'){
            return this.onAny(listener)
        }

        const parts = type.split(this._delimiter);
        const node = this._addListener(parts,listener,count)
        
        // Retain不支持通配符
        if(node && !type.includes('*')) this._emitForLastEvent(type) 

        return {
            off: ()=>node && this._removeListener(node,parts,listener)
        }
    } 

    public once<T extends string>(type: T, listener: FastEventListener<T,Events[T],Meta> ): FastEventSubscriber
    public once<T extends Types=Types>(type: T, listener: FastEventListener<Types,Events[T],Meta> ): FastEventSubscriber
    public once(): FastEventSubscriber{
        return this.on(arguments[0],arguments[1],1)
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
    onAny<P=any>(listener: FastEventListener<string,P,Meta>): FastEventSubscriber {
        const listeners = this.listeners.__listeners
        listeners.push(listener)
        return {
            off:()=>this._removeListener(this.listeners,[],listener)
        }
    }

    off(listener: FastEventListener<any, any, any>):void    
    off(type: string, listener: FastEventListener<any, any, any>):void
    off(type: Types, listener: FastEventListener<any, any, any>):void
    off(type: string):void
    off(type: Types):void
    off(){
        const args = arguments
        const type = typeof(args[0])==='function' ? undefined : args[0]
        const listener = typeof(args[0])==='function' ? args[0] : args[1]
        const parts = type ? type.split(this._delimiter) : []
        const hasWildcard= type ? type.includes('*') : false
        if(type && !hasWildcard){
            this._traverseToPath(this.listeners,parts,(node)=>{
                if(listener){ // 只删除指定的监听器
                    this._removeListener(node,parts,listener)
                }else if(type){
                    node.__listeners=[]
                }
            })
        }else{ // 仅删除指定的侦听器
            const entryParts:string[] = hasWildcard ? [] : parts
            this._traverseListeners(this.listeners,entryParts,(path,node)=>{       
                if(listener!==undefined || (hasWildcard && isPathMatched(path,parts))){
                    if(listener){
                        this._removeListener(node,parts,listener)
                    }else{
                        node.__listeners=[]
                    }        
                }
            })
        }
    }
 
    /**
     * 移除所有事件监听器
     * @param entry - 可选的事件前缀,如果提供则只移除指定前缀下的的监听器
     * @description 
     * - 如果提供了prefix参数,则只清除该前缀下的所有监听器
     * - 如果没有提供prefix,则清除所有监听器
     * - 同时会清空保留的事件(_retainedEvents)
     * - 重置监听器对象为空

    * @example
     * 
     * ```ts
     * emitter.offAll();    // 清除所有监听器
     * emitter.offAll('a/b'); // 清除a/b下的所有监听器
     * 
     */
    offAll(entry?: string) {        
        if(entry){
            const entryNode = this._getListenerNode(entry.split(this._delimiter))
            if(entryNode) entryNode.__listeners = []
            this._removeRetainedEvents(entry)
        }else{           
            this._retainedEvents.clear() 
            this.listeners = { __listeners: [] } as unknown as FastListeners
        }
    }

    private _getListenerNode(parts:string[]):FastListenerNode | undefined{
        let entryNode: FastListenerNode | undefined
        this._forEachNodes(parts,(node)=>{
            entryNode = node
        })
        return entryNode
    }
    /**
     * 移除保留的事件
     * @param prefix - 事件前缀。如果不提供，将清除所有保留的事件。
     *                如果提供前缀，将删除所有以该前缀开头的事件。
     *                如果前缀不以分隔符结尾，会自动添加分隔符。
     * @private
     */
    private _removeRetainedEvents(prefix?: string) {
        if (!prefix) this._retainedEvents.clear()
        if(prefix?.endsWith(this._delimiter)){
            prefix+=this._delimiter
        }            
        this._retainedEvents.delete(prefix!)
        for(let key of this._retainedEvents.keys()){
            if(key.startsWith(prefix!)){
                this._retainedEvents.delete(key)
            }
        }
    } 
    clear(){
        this.offAll()
    }
    private _getMeta(extra:Record<string,any>){
        if(!this._options.meta) return extra
        return Object.assign({},this._options.meta,extra) as FastEventMeta<any,any>       
    }
    private _emitForLastEvent(type:string){   
        if(this._retainedEvents.has(type)){
            const payload = this._retainedEvents.get(type)
            const parts = type.split(this._delimiter);            
            this._traverseToPath(this.listeners,parts,(node)=>{  
                this._executeListeners(node,payload,this._getMeta({type}))
            }) 
            // onAny侦听器保存在根节点中，所以需要执行
            this._executeListeners(this.listeners,payload,this._getMeta({type}))
        }        
    }

    /**
     * 遍历监听器节点树
     * @param node 当前遍历的监听器节点
     * @param parts 事件名称按'.'分割的部分数组
     * @param callback 遍历到目标节点时的回调函数
     * @param index 当前遍历的parts数组索引,默认为0
     * @param lastFollowing  当命中**时该值为true, 注意**只能作在路径的最后面，如a.**有效，而a.**.b无效
     * @private
     * 
     * 支持三种匹配模式:
     * - 精确匹配: 'a.b.c'
     * - 单层通配: 'a.*.c' 
     * - 多层通配: 'a.**'
     */
    private _traverseToPath(node: FastListenerNode, parts: string[], callback: (node: FastListenerNode) => void, index: number = 0, lastFollowing?:boolean): void {

        if (index >= parts.length) {
            callback(node)
            return
        }    
        const part = parts[index]         

        if(lastFollowing===true){
            this._traverseToPath(node, parts, callback, index + 1,true)
            return
        }

        if (part in node) {
            this._traverseToPath(node[part], parts, callback, index + 1)
        }

        if ('*' in node) {
            this._traverseToPath(node['*'], parts, callback, index + 1)
        }
        // 
        if ('**' in node) {
            this._traverseToPath(node['**'], parts, callback, index + 1,true)
        }
    }

    private _traverseListeners(node: FastListenerNode, entry:string[], callback: (path:string[],node: FastListenerNode) => void): void {
        let entryNode: FastListenerNode = node
        // 如果指定了entry路径，则按照路径遍历
        if (entry && entry.length > 0) {            
            this._traverseToPath(node, entry,(node)=>{
                entryNode= node
            });
        }
        const traverseNodes = (node: FastListenerNode, callback: (path:string[],node: FastListenerNode) => void,parentPath:string[])=>{
            callback(parentPath, node);        
            for(let [key,childNode] of Object.entries(node)){
                if(key.startsWith("__")) continue
                if(childNode){
                    traverseNodes(childNode as FastListenerNode, callback,[...parentPath,key]);
                }
            }
        }
        // 如果没有指定entry或entry为空数组，则递归遍历所有节点
        traverseNodes(entryNode, callback,[]);
    }        

    private _executeListener(listener:any, payload: any,meta: FastEventMeta<any,any> ):any{
        try{
            if(typeof(listener.__wrappedListener)==='function'){
                return listener.__wrappedListener.call(this._context,payload,meta)
            }else{
                return listener.call(this._context,payload,meta)
            }
        }catch(e:any){
            e._trigger = meta.type
            if(typeof(this._options.onListenerError)==='function'){
                this._options.onListenerError.call(this,meta.type,e)
            }
            // 如果忽略错误，则返回错误对象
            if(this._options.ignoreErrors){
                return e
            }else{
                throw e
            }
        }
    }

    /**
     * 执行监听器节点中的所有监听函数
     * @param node - FastListenerNode类型的监听器节点
     * @param payload - 事件携带的数据
     * @param type - 事件类型
     * @returns 返回所有监听函数的执行结果数组
     * @private
     * 
     * @description
     * 遍历执行节点中的所有监听函数:
     * - 对于普通监听器，直接执行并收集结果
     * - 对于带次数限制的监听器(数组形式)，执行后递减次数，当次数为0时移除该监听器
     */
    private _executeListeners(node: FastListenerNode, payload: any, meta: Meta): any[] {
        if (!node || !node.__listeners) return []
        let i = 0
        const listeners = node.__listeners
        let result:any[] = []
        while(i<listeners.length){
            const listener = listeners[i]
            if(Array.isArray(listener)){
                result.push(this._executeListener(listener[0],payload,meta))                
                listener[1]-- 
                if(listener[1]===0) {
                    listeners.splice(i,1)
                    i-- // 抵消后面的i++
                }
            }else{
                result.push(this._executeListener(listener,payload,meta))                
            }  
            i++            
        }
        return result
    }

    public emit<R=any>(type:string,payload?:any,retain?:boolean,meta?:Meta):R[]
    public emit<R=any>(type:Types,payload?:Events[Types],retain?:boolean,meta?:Meta):R[]
    public emit<R=any>():R[]{
        const type = arguments[0] as string
        const payload = arguments[1] as any
        const retain = arguments[2] as boolean
        const meta = (arguments[3] || {}) as Meta

        const parts = type.split(this._delimiter);         
        if(retain) {
            this._retainedEvents.set(type,payload)
        }   
        const results:any[] = []
        this._traverseToPath(this.listeners,parts,(node)=>{  
            results.push(...this._executeListeners(node,payload,this._getMeta({...meta,type})))
        })        
        // onAny侦听器保存在根节点中，所以需要执行 
        results.push(...this._executeListeners(this.listeners,payload,this._getMeta({...meta,type})))
        return results
    }

    public async emitAsync<R=any>(type:string,payload?:any,retain?:boolean,meta?:Meta):Promise<[R|Error][]>
    public async emitAsync<R=any>(type:Types,payload?:Events[Types],retain?:boolean,meta?:Meta):Promise<[R|Error][]>
    public async emitAsync<P=any>():Promise<[P|Error][]>{
        const type = arguments[0] as string
        const payload = arguments[1] as any
        const retain = arguments[2] as boolean
        const meta = (arguments[3] || {}) as Meta

        const results = await Promise.allSettled(this.emit<P>(type,payload,retain,this._getMeta({...meta,type})))
        return results.map((result)=>{
            if(result.status==='fulfilled'){
                return result.value
            }else{
                return result.reason
            }
        })
    }

    /**
     * 等待指定事件发生
     * 
     * @param type 
     * @param timeout  超时时间，单位毫秒，默认为 0，表示无限等待
     */
    public waitFor<R=any>(type:string,timeout?:number):Promise<R>
    public waitFor<R=any>(type:Types,timeout?:number):Promise<R>
    public waitFor<R=any>():Promise<R>{
        const type = arguments[0] as string
        const timeout = arguments[1] as number
        return new Promise<R>((resolve,reject)=>{
            let tid:any
            let subscriber:FastEventSubscriber
            const listener = (payload:any)=>{
                clearTimeout(tid)
                subscriber.off()                
                resolve(payload)                
            }
            if(timeout && timeout>0){
                tid = setTimeout(()=>{
                    subscriber && subscriber.off()
                    reject(new Error('wait for event<'+ type +'> is timeout'))
                },timeout)
            }
            subscriber = this.on(type,listener)            
        })        
    }

    /**
     * 创建事件域
     * 
     * 注意：
     * 
     *  事件域与当前事件对象共享相同的侦听器表
     *  也就是说，如果在事件域中触发事件，当前事件对象也会触发该事件
     *  两者工不是完全隔离的,仅是事件侦听和触发时的事件类型不同而已
     * 
     * const emitter = new FastEvent()
     * 
     * const scope= emitter.scope("a/b")
     * 
     * scope.on("x",()=>{})   == emitter.on("a/b/x",()=>{})
     * scope.emit("x",1)      == emitter.emit("a/b/x",1) 
     * scope.offAll()         == emitter.offAll("a/b")
     * 
     */
    scope<T extends string>(prefix:T){         
        return new FastEventScope<ScopeEvents<Events,T>>(this as unknown as FastEvent<ScopeEvents<Events,T>>,prefix)
    }

} 