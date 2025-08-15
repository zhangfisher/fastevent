import { FastEventScope, type FastEventScopeOptions } from './scope';
import {
    TypedFastEventListener,
    FastEventOptions,
    FastListeners,
    FastListenerNode,
    FastEventSubscriber,
    FastEventListenOptions,
    TypedFastEventMessage,
    TypedFastEventAnyListener,
    Fallback,
    FastEventEmitMessage,
    FastEventListenerArgs,
    FastListenerMeta,
    FastEvents,
    DeepPartial,
    FastEventMeta,
    Expand,
    TypedFastEventMessageOptional,
    FastEventListeners
} from './types';
import { parseEmitArgs } from './utils/parseEmitArgs';
import { isPathMatched } from './utils/isPathMatched';
import { removeItem } from './utils/removeItem';
import { renameFn } from './utils/renameFn';
import { isFunction } from './utils/isFunction';
import { ScopeEvents } from './types';
import { FastListenerPipe } from './pipes';
import { AbortError, CancelError, FastEventDirectives } from './consts';
import { parseScopeArgs } from './utils/parseScopeArgs';
import { FastListenerExecutor } from './executors';
import { expandEmitResults } from './utils/expandEmitResults';
import { isSubsctiber } from './utils/isSubsctiber';
import { tryReturnError } from './utils/tryReturnError';

/**
 * FastEvent 事件发射器类
 * 
 * @template Events - 事件类型定义，继承自FastEvents接口
 * @template Meta - 事件元数据类型，默认为任意键值对对象
 * @template Types - 事件类型的键名类型，默认为Events的键名类型
 */
export class FastEvent<
    Events extends Record<string, any> = Record<string, any>,
    Meta extends Record<string, any> = Record<string, any>,
    Context = never,
    // 泛型快捷方式
    AllEvents extends Record<string, any> = Events & FastEvents,
    Types extends keyof AllEvents = Expand<Exclude<keyof (AllEvents), number | symbol>>
> {
    __FastEvent__: boolean = true
    /** 事件监听器树结构，存储所有注册的事件监听器 */
    public listeners: FastListeners = { __listeners: [] } as unknown as FastListeners

    /** 事件发射器的配置选项 */
    private _options: FastEventOptions<Meta, Context>

    /** 事件名称的分隔符，默认为'/' */
    private _delimiter: string = '/'

    /** 事件监听器执行时的上下文对象 */
    private _context: Context

    /** 保留的事件消息映射，Key是事件名称，Value是保留的事件消息 */
    retainedMessages: Map<string, any> = new Map<string, any>()

    /** 当前注册的监听器总数 */
    listenerCount: number = 0
    types = {
        events: undefined as unknown as AllEvents,
        meta: undefined as unknown as Expand<FastEventMeta & Meta & Record<string, any>>,
        context: undefined as unknown as Expand<Fallback<Context, typeof this>>,
        message: undefined as unknown as TypedFastEventMessageOptional<AllEvents, Expand<FastEventMeta & Meta & Record<string, any>>>,
        listeners: undefined as unknown as FastEventListeners<AllEvents, Expand<FastEventMeta & Meta & Record<string, any>>>,
        anyListener: undefined as unknown as TypedFastEventAnyListener<AllEvents, Expand<FastEventMeta & Meta & Record<string, any>>, Expand<Fallback<Context, typeof this>>>
    }

    /**
     * 创建FastEvent实例
     * @param options - 事件发射器的配置选项
     * 
     * 默认配置：
     * - debug: false - 是否启用调试模式
     * - id: 随机字符串 - 实例唯一标识符
     * - delimiter: '/' - 事件名称分隔符
     * - context: null - 监听器执行上下文
     * - ignoreErrors: true - 是否忽略监听器执行错误
     */
    constructor(options?: Partial<FastEventOptions<Meta, Context>>) {
        this._options = Object.assign({
            debug: false,
            id: Math.random().toString(36).substring(2),
            delimiter: '/',
            context: null,
            ignoreErrors: true,
            meta: undefined,
            expandEmitResults: true
        }, this._initOptions(options)) as unknown as FastEventOptions<Meta, Context>
        this._delimiter = this._options.delimiter!
        this._context = this._options.context as Context
        this._enableDevTools()
    }

    /** 获取事件发射器的配置选项 */
    get options() { return this._options }
    get context(): Fallback<Context, typeof this> { return (this.options.context || this) as Fallback<Context, typeof this> }
    get meta() { return this.options.meta }
    /** 获取事件发射器的唯一标识符 */
    get id() { return this._options.id! }

    /**
     * 初始化选项
     * 
     * 本方法主要供子类重载
     * 
     * @param initial - 可选的初始字典对象
     * @returns 返回传入的初始字典对象
     */
    _initOptions(initial?: Partial<FastEventOptions<Meta, Context>>) {
        return initial
    }
    /**
     * 添加事件监听器到事件树中
     * @param parts - 事件路径数组
     * @param listener - 事件监听器函数
     * @param options - 监听器配置选项
     * @param options.count - 监听器触发次数限制
     * @param options.prepend - 是否将监听器添加到监听器列表开头
     * @returns [节点, 监听器索引] - 返回监听器所在节点和在节点监听器列表中的索引
     * @private
     */
    private _addListener(parts: string[], listener: TypedFastEventListener<any, any>, options: Required<FastEventListenOptions>): [FastListenerNode | undefined, number] {
        const { count, prepend } = options
        let index: number = 0
        const node = this._forEachNodes(parts, (node) => {
            const newListener = [listener, count, 0] as unknown as FastListenerMeta
            if (options.tag) newListener.push(options.tag)
            if (prepend) {
                node.__listeners.splice(0, 0, newListener)
                index = 0
            } else {
                node.__listeners.push(newListener)
                index = node.__listeners.length - 1
            }
            this.listenerCount++
        })
        return [node, index]
    }
    private _enableDevTools() {
        if (this.options.debug) {
            // @ts-ignore
            globalThis.__FLEXEVENT_DEVTOOLS__ && globalThis.__FLEXEVENT_DEVTOOLS__.add(this)
        }
    }
    /**
     * 
     * 根据parts路径遍历监听器树，并在最后的节点上执行回调函数
     * 
     * @param parts 
     * @param callback 
     * @returns 
     */
    private _forEachNodes(parts: string[], callback: (node: FastListenerNode, parent: FastListenerNode) => void): FastListenerNode | undefined {
        if (parts.length === 0) return
        let current = this.listeners
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i]
            if (!(part in current)) {
                current[part] = {
                    __listeners: []
                } as unknown as FastListeners
            }
            if (i === parts.length - 1) {
                const node = current[part]
                callback(node, current)
                return node
            } else {
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
    private _removeListener(node: FastListenerNode, path: string[], listener: TypedFastEventListener<any, any, any>): void {
        if (!listener) return
        removeItem(node.__listeners, (item: any) => {
            item = Array.isArray(item) ? item[0] : item
            const isRemove = item === listener
            if (isRemove) {
                this.listenerCount--
                if (isFunction(this._options.onRemoveListener)) {
                    this._options.onRemoveListener(path.join(this._delimiter), listener)
                }
            }
            return isRemove
        })
    }
    private _pipeListener(listener: TypedFastEventListener<any, any, any, any>, pipes: FastListenerPipe[]): TypedFastEventListener<any, any, any, any> {
        pipes.forEach(decorator => {
            listener = renameFn(decorator(listener), listener.name)
        })
        return listener
    }

    /**
     * 注册事件监听器
     * @param type - 事件类型，支持以下格式：
     *   - 普通字符串：'user/login'
     *   - 通配符：'user/*'（匹配单层）或'user/**'（匹配多层）
     *   - 全局监听：'**'（监听所有事件）
     * @param listener - 事件监听器函数
     * @param options - 监听器配置选项：
     *   - count: 触发次数限制，0表示无限制
     *   - prepend: 是否将监听器添加到监听器队列开头
     * @returns 返回订阅者对象，包含off方法用于取消监听
     * 
     * @example
     * ```ts
     * // 监听特定事件
     * emitter.on('user/login', (data) => console.log(data));
     * 
     * // 使用通配符
     * emitter.on('user/*', (data) => console.log(data));
     * 
     * // 限制触发次数
     * emitter.on('event', handler, { count: 3 });
     * ```
     */
    public on<T extends Types = Types>(type: T, options?: FastEventListenOptions<AllEvents, Meta>): FastEventSubscriber
    public on<T extends string>(type: T, options?: FastEventListenOptions<AllEvents, Meta>): FastEventSubscriber
    public on(type: '**', options?: FastEventListenOptions<AllEvents, Meta>): FastEventSubscriber

    public on<T extends Types = Types>(type: T, listener: TypedFastEventListener<Exclude<T, number | symbol>, AllEvents[T], Meta, Fallback<Context, typeof this>>, options?: FastEventListenOptions<AllEvents, Meta>): FastEventSubscriber
    public on<T extends string>(type: T, listener: TypedFastEventAnyListener<AllEvents, Meta, Fallback<Context, typeof this>>, options?: FastEventListenOptions<AllEvents, Meta>): FastEventSubscriber
    public on(type: '**', listener: TypedFastEventAnyListener<Record<string, any>, Meta, Fallback<Context, typeof this>>, options?: FastEventListenOptions<AllEvents, Meta>): FastEventSubscriber
    public on(): FastEventSubscriber {
        const type = arguments[0] as string
        let listener = isFunction(arguments[1]) ? arguments[1] : (this._options.onMessage || this.onMessage).bind(this)

        const options = Object.assign({
            count: 0,
            prepend: false
        }, isFunction(arguments[1]) ? arguments[2] : arguments[1]) as Required<FastEventListenOptions>

        if (type.length === 0) throw new Error('event type cannot be empty')

        //
        if (isFunction(this._options.onAddListener)) {
            const r = this._options.onAddListener(type, listener, options)
            if (r === false) {
                throw new CancelError()
            } else if (isSubsctiber(r)) {
                return r
            }
        }

        const parts = type.split(this._delimiter);

        if (options.pipes && options.pipes.length > 0) {
            listener = this._pipeListener(listener, options.pipes)
        }

        if (isFunction(options.filter) || isFunction(options.off)) {
            const oldListener = listener
            listener = renameFn<TypedFastEventListener>(function (message, args) {
                // 如果满足条件就退订
                if (isFunction(options.off) && options.off.call(this, message, args)) {
                    off()
                    return
                }
                // 如果满足条件就触发监听器
                if (isFunction(options.filter)) {
                    if (options.filter.call(this, message, args!)) return oldListener.call(this, message, args)
                } else {
                    return oldListener.call(this, message, args)
                }
            }, listener.name)
        }

        const [node, index] = this._addListener(parts, listener, options)
        const off = () => node && this._removeListener(node, parts, listener)
        // 触发监听器保留消息
        this._emitRetainMessage(type, node, index)

        return { off, listener }
    }

    /**
     * 注册一次性事件监听器
     * @param type - 事件类型，支持与on方法相同的格式：
     *   - 普通字符串：'user/login'
     *   - 通配符：'user/*'（匹配单层）或'user/**'（匹配多层）
     * @param listener - 事件监听器函数
     * @returns 返回订阅者对象，包含off方法用于取消监听
     * 
     * @description
     * 监听器只会在事件首次触发时被调用一次，之后会自动解除注册。
     * 这是on方法的特例，相当于设置options.count = 1。
     * 如果事件有保留消息，新注册的监听器会立即收到最近一次的保留消息并解除注册。
     * 
     * @example
     * ```ts
     * // 只监听一次登录事件
     * emitter.once('user/login', (data) => {
     *   console.log('用户登录:', data);
     * });
     * ```
     */
    public once<T extends Types = Types>(type: T, options?: FastEventListenOptions<AllEvents, Meta>): FastEventSubscriber
    public once<T extends string>(type: T, options?: FastEventListenOptions<AllEvents, Meta>): FastEventSubscriber
    public once<T extends Types = Types>(type: T, listener: TypedFastEventListener<Exclude<T, number | symbol>, AllEvents[T], Meta, Fallback<Context, typeof this>>, options?: FastEventListenOptions<AllEvents, Meta>): FastEventSubscriber
    public once<T extends string>(type: T, listener: TypedFastEventAnyListener<AllEvents, Meta, Fallback<Context, typeof this>>, options?: FastEventListenOptions<AllEvents, Meta>): FastEventSubscriber
    public once(): FastEventSubscriber {
        if (isFunction(arguments[1])) {
            return this.on(arguments[0], arguments[1], Object.assign({}, arguments[2], { count: 1 }))
        } else {
            return this.on(arguments[0], Object.assign({}, arguments[2], { count: 1 }))
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
     * ```listener: FastEventAnyListener<AllEvents, Meta, Fallback<Context, typeof this>>): FastEventSubscriber
     */
    onAny(options?: Omit<FastEventListenOptions<AllEvents, Meta>, 'count'>): FastEventSubscriber
    onAny<P = any>(listener: TypedFastEventAnyListener<Record<string, P>, Meta, Fallback<Context, typeof this>>, options?: Omit<FastEventListenOptions<AllEvents, Meta>, 'count'>): FastEventSubscriber
    onAny(): FastEventSubscriber {
        return this.on("**", arguments[0], arguments[1])
    }
    /**
     * 
     * 当调用on/once/onAny时如果没有指定监听器，则调用此方法
     * 
     * 此方法供子类继承
     * 
     */
    //  eslint-disable-next-line
    onMessage(message: TypedFastEventMessage<AllEvents, Meta>, args: FastEventListenerArgs<Meta>) {

    }
    off(listener: TypedFastEventListener<any, any, any>): void
    off(type: string, listener: TypedFastEventListener<any, any, any>): void
    off(type: Types, listener: TypedFastEventListener<any, any, any>): void
    off(type: string): void
    off(type: Types): void
    off() {
        const args = arguments
        const type = isFunction(args[0]) ? undefined : args[0]
        const listener = isFunction(args[0]) ? args[0] : args[1]
        const parts = type ? type.split(this._delimiter) : []
        const hasWildcard = type ? type.includes('*') : false
        if (type && !hasWildcard) {
            this._traverseToPath(this.listeners, parts, (node) => {
                if (listener) { // 只删除指定的监听器
                    this._removeListener(node, parts, listener)
                } else if (type) {
                    node.__listeners = []
                }
            })
        } else { // 仅删除指定的监听器
            const entryParts: string[] = hasWildcard ? [] : parts
            this._traverseListeners(this.listeners, entryParts, (path, node) => {
                if (listener !== undefined || (hasWildcard && isPathMatched(path, parts))) {
                    if (listener) {
                        this._removeListener(node, parts, listener)
                    } else {
                        node.__listeners = []
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
        if (entry) {
            const parts = entry.split(this._delimiter)
            let count = 0
            this._traverseListeners(this.listeners, parts, (path, node) => {
                count += node.__listeners.length
                node.__listeners = []
            })
            this.listenerCount -= count
            this._removeRetainedEvents(entry)
        } else {
            let count = 0
            this._traverseListeners(this.listeners, [], (path, node) => {
                count += node.__listeners.length
            })
            this.listenerCount -= count
            this.retainedMessages.clear()
            this.listeners = { __listeners: [] } as unknown as FastListeners
        }
        if (isFunction(this._options.onClearListeners)) this._options.onClearListeners.call(this)
    }
    /**
     * 移除保留的事件
     * @param prefix - 事件前缀。如果不提供，将清除所有保留的事件。
     *                如果提供前缀，将删除所有以该前缀开头的事件。
     *                如果前缀不以分隔符结尾，会自动添加分隔符。
     * @private
     */
    private _removeRetainedEvents(prefix?: string) {
        if (!prefix) this.retainedMessages.clear()
        if (prefix?.endsWith(this._delimiter)) {
            prefix += this._delimiter
        }
        this.retainedMessages.delete(prefix!)
        for (let key of this.retainedMessages.keys()) {
            if (key.startsWith(prefix!)) {
                this.retainedMessages.delete(key)
            }
        }
    }
    clear(prefix?: string) {
        this.offAll(prefix)
        this._removeRetainedEvents(prefix)
    }

    /**
     * 发送最后一次事件的消息给对应的监听器
     * 
     * @param type - 事件类型,支持通配符(*)匹配
     * @private
     * 
     * 处理流程:
     * 1. 如果事件类型包含通配符,则遍历所有保留的消息,匹配符合模式的事件
     * 2. 如果是普通事件类型,则直接获取对应的保留消息
     * 3. 遍历匹配到的消息,查找对应路径的监听器节点
     * 4. 执行所有匹配到的监听器
     */
    private _emitRetainMessage(type: string, listenerNode: FastListenerNode | undefined, index: number) {
        let messages = [] as TypedFastEventMessage[]
        if (type.includes('*')) {
            // 找出所有保留的消息
            const patterns = type.split(this._delimiter)
            this.retainedMessages.forEach((message, type) => {
                const parts = type.split(this._delimiter);
                if (isPathMatched(parts, patterns)) {
                    messages.push(message)
                }
            })
        } else if (this.retainedMessages.has(type)) {
            messages.push(this.retainedMessages.get(type))
        }
        if (listenerNode) {
            messages.forEach((message) => {
                this._executeListeners([listenerNode], message, {}, (listenerMeta) => {
                    return listenerMeta[0] === listenerNode.__listeners[index][0]
                })
            })
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
    private _traverseToPath(node: FastListenerNode, parts: string[], callback: (node: FastListenerNode) => void, index: number = 0, lastFollowing?: boolean): void {

        if (index >= parts.length) {
            callback(node)
            return
        }
        const part = parts[index]

        if (lastFollowing === true) {
            this._traverseToPath(node, parts, callback, index + 1, true)
            return
        }

        if ('*' in node) {
            this._traverseToPath(node['*'], parts, callback, index + 1)
        }
        // 
        if ('**' in node) {
            this._traverseToPath(node['**'], parts, callback, index + 1, true)
        }

        if (part in node) {
            this._traverseToPath(node[part], parts, callback, index + 1)
        }
    }

    private _traverseListeners(node: FastListenerNode, entry: string[], callback: (path: string[], node: FastListenerNode) => void): void {
        let entryNode: FastListenerNode = node
        // 如果指定了entry路径，则按照路径遍历
        if (entry && entry.length > 0) {
            this._traverseToPath(node, entry, (node) => {
                entryNode = node
            });
        }
        const traverseNodes = (node: FastListenerNode, callback: (path: string[], node: FastListenerNode) => void, parentPath: string[]) => {
            callback(parentPath, node);
            for (let [key, childNode] of Object.entries(node)) {
                if (key.startsWith("__")) continue
                if (childNode) {
                    traverseNodes(childNode as FastListenerNode, callback, [...parentPath, key]);
                }
            }
        }
        // 如果没有指定entry或entry为空数组，则递归遍历所有节点
        traverseNodes(entryNode, callback, []);
    }

    private _onListenerError(listener: TypedFastEventListener, message: TypedFastEventMessage, args: FastEventListenerArgs<any> | undefined, e: any) {
        if (e instanceof Error) {
            // @ts-ignore
            e._emitter = `${listener.name || 'anonymous'}:${message.type}`
        }
        if (isFunction(this._options.onListenerError)) {
            try { this._options.onListenerError.call(this, e, listener, message, args) } catch { }
        }
        if (this._options.ignoreErrors) {
            return e
        } else {
            throw e
        }
    }
    /**
     * 执行单个监听器函数
     * @param listener - 要执行的监听器函数或包装过的监听器对象
     * @param message - 事件消息对象，包含type、payload和meta
     * @param args - 监听器参数
     * @param catchErrors - 是否捕获并处理执行过程中的错误
     * @returns 监听器的执行结果或错误对象（如果配置了ignoreErrors）
     * @private
     * 
     * @description
     * 执行单个监听器函数，处理以下情况：
     * - 如果监听器是包装过的（有__wrappedListener属性），调用包装的函数
     * - 否则直接调用监听器函数
     * - 使用配置的上下文（_context）作为this
     * - 捕获并处理执行过程中的错误：
     *   - 如果有onListenerError回调，调用它
     *   - 如果配置了ignoreErrors，返回错误对象
     *   - 否则抛出错误
     */
    private _executeListener(listener: TypedFastEventListener<any, any>, message: TypedFastEventMessage, args: FastEventListenerArgs<any> | undefined, catchErrors: boolean = false): Promise<any> | any {
        try {
            // 如果传入已经aborted的abortSignal，则直接返回
            if (args && args.abortSignal && args.abortSignal.aborted) {
                return this._onListenerError(listener, message, args, new AbortError(listener.name))
            }
            let result = listener.call(this.context, message, args!)
            // 自动处理reject Promise
            if (catchErrors && result && result instanceof Promise) {
                result = tryReturnError(result, e => this._onListenerError(listener, message, args, e))
            }
            return result
        } catch (e: any) {
            return this._onListenerError(listener, message, args, e)
        }
    }
    private _getListenerExecutor(args: FastEventListenerArgs): FastListenerExecutor | undefined {
        if (!args) return
        const executor = args.executor || this._options.executor
        if (isFunction(executor)) return executor
    }
    /**
     * 执行监听器节点列表中的所有监听器函数
     * @param nodes 监听器节点列表
     * @param message 事件消息对象
     * @param args 监听器参数
     * @param args 监听器参数
     * @returns 所有监听器函数的执行结果数组
     * @private
     * 
     * 执行流程:
     * 1. 将所有节点中的监听器函数展平为一维数组
     * 2. 通过执行器执行所有监听器函数
     * 3. 更新监听器的执行次数,并移除达到执行次数限制的监听器
     */
    private _executeListeners(
        nodes: FastListenerNode[],
        message: TypedFastEventMessage,
        args: FastEventListenerArgs<Meta>,
        filter?: (listener: FastListenerMeta, node: FastListenerNode) => boolean
    ): any[] {
        if (!nodes || nodes.length === 0) return []
        // 1. 遍历所有监听器任务,即需要执行的监听器函数[]
        const listeners = nodes.reduce<[FastListenerMeta, number, FastListenerMeta[]][]>((result, node) => {
            return result.concat(node.__listeners
                .filter((listener) => {
                    if (!isFunction(filter)) return true
                    return filter(listener, node)
                })
                .map((listener, i) => [listener, i, node.__listeners] as [FastListenerMeta, number, FastListenerMeta[]]));
        }, []);

        // 执行监听器前计数选减一，否则如果在监听器函数中再次触发时会导致重复执行。
        // 比如：在once('x')监听函数中执行再次emit('x')就会导致循环
        this._decListenerExecCount(listeners)
        
        const executeor = this._getListenerExecutor(args)
        if (executeor) {
            const r = executeor(listeners.map(listener => listener[0]), message, args, this._executeListener.bind(this)) as any[]
            return Array.isArray(r) ? r : [r]
        } else {
            return listeners.map(listener => this._executeListener(listener[0][0], message, args, true))
        } 
    }
    /**
     * 减少侦听器的执行次数
     * @param listeners 
     */
    _decListenerExecCount(listeners: [FastListenerMeta, number, FastListenerMeta[]][]){
        // 由于可能涉及到删除修改__listeners，所以需要倒序， 从后往前删除
        for (let i = listeners.length - 1; i >= 0; i--) {
            const meta = listeners[i][0] as FastListenerMeta
            meta[2]++  // 实际执行的次数
            // =0不限执行次数，>0时代表执行次数限制
            if (meta[1] > 0 && meta[1] <= meta[2]) {
                listeners[i][2].splice(i, 1)
            }
        }
    }
    /**
     * 触发事件并执行对应的监听器
     * 
     * @param type - 事件类型字符串或包含事件信息的对象
     * @param payload - 事件携带的数据负载
     * @param retain - 是否保留该事件(用于新订阅者)
     * @param meta - 事件元数据
     * @returns 所有监听器的执行结果数组
     * 
     * @example
     * // 方式1: 参数形式
     * emit('user.login', { id: 1 }, true)
     * 
     * // 方式2: 对象形式
     * emit({ type: 'user.login', payload: { id: 1 } ,meta:{...}}}, true)
     */
    /**
     * 同步触发事件
     * @param type - 事件类型，可以是字符串或预定义的事件类型
     * @param payload - 事件数据负载
     * @param retain - 是否保留该事件，用于后续新的订阅者
     * @param meta - 事件元数据
     * @returns 所有监听器的执行结果数组
     * 
     * @description
     * 同步触发指定类型的事件，支持两种调用方式：
     * 1. 参数形式：emit(type, payload, retain, meta)
     * 2. 对象形式：emit({ type, payload, meta }, retain)
     * 
     * 特性：
     * - 支持通配符匹配，一个事件可能触发多个监听器
     * - 如果设置了retain为true，会保存最后一次的事件数据
     * - 按照注册顺序同步调用所有匹配的监听器
     * - 如果配置了ignoreErrors，监听器抛出的错误会被捕获并返回
     * 
     * @example
     * ```ts
     * // 简单事件触发
     * emitter.emit('user/login', { userId: 123 });
     * 
     * // 带保留的事件触发
     * emitter.emit('status/change', { online: true }, true);
     * 
     * // 带元数据的事件触发
     * emitter.emit('data/update', newData, false, { timestamp: Date.now() });
     * 
     * // 使用对象形式触发
     * emitter.emit({
     *   type: 'user/login',
     *   payload: { userId: 123 },
     *   meta: { time: Date.now() }
     * }, true);
     * 
     * // 清除保留事件
     * emitter.emit("user/login")
     * 
     * ```
     */
    // 用于清除保留事件
    public emit<T extends Types = Types>(type: T, directive: symbol): any[]
    public emit(type: string, directive: symbol): any[]
    // 支持retain参数
    public emit<R = any, T extends Types = Types>(type: T, payload?: AllEvents[T], retain?: boolean): R[]
    public emit<R = any, T extends string = string>(type: T, payload?: T extends Types ? AllEvents[Types] : any, retain?: boolean): R[]
    public emit<R = any, T extends string = string>(message: FastEventEmitMessage<{ [K in T]: K extends Types ? AllEvents[K] : any }, Meta>, retain?: boolean): R[]
    public emit<R = any>(message: FastEventEmitMessage<AllEvents, Meta>, retain?: boolean): R[]
    // 使用完整的配置选项
    public emit<R = any, T extends Types = Types>(type: T, payload?: AllEvents[T], options?: FastEventListenerArgs<Meta>): R[]
    public emit<R = any, T extends string = string>(type: T, payload?: T extends Types ? AllEvents[Types] : any, options?: FastEventListenerArgs<Meta>): R[]
    public emit<R = any, T extends string = string>(message: FastEventEmitMessage<{ [K in T]: K extends Types ? AllEvents[K] : any }, Meta>, options?: FastEventListenerArgs<Meta>): R[]
    public emit<R = any>(message: FastEventEmitMessage<AllEvents, Meta>, options?: FastEventListenerArgs<Meta>): R[]
    public emit(): any {
        // 清除保留事件
        if (arguments.length === 2 && typeof (arguments[0]) === 'string' && arguments[1] === FastEventDirectives.clearRetain) {
            this.retainedMessages.delete(arguments[0])
            return []
        }
        const [message, args] = parseEmitArgs<AllEvents, Meta>(arguments, this.options.meta)

        if (isFunction(args.parseArgs)) {
            args.parseArgs(message, args)
        }
        const parts = message.type.split(this._delimiter);
        if (args.retain) {
            this.retainedMessages.set(message.type, message)
        }
        const results: any[] = []
        const nodes: FastListenerNode[] = []

        this._traverseToPath(this.listeners, parts, (node) => {
            nodes.push(node)
        })
        if (isFunction(this._options.onBeforeExecuteListener)) {
            const r = this._options.onBeforeExecuteListener.call(this, message, args)
            if (Array.isArray(r)) {
                return r
            } else if (r === false) {
                throw new AbortError(message.type)
            }
        }
        // 执行监听器
        results.push(...this._executeListeners(nodes, message, args))

        if (isFunction(this._options.onAfterExecuteListener)) {
            this._options.onAfterExecuteListener.call(this, message, results, nodes)
        }
        // 将results内部所有expandable的项展开，见utils\expandable.ts说明
        if (this._options.expandEmitResults) {
            expandEmitResults(results)
        }
        return results
    }

    getListeners(type: keyof AllEvents): FastListenerMeta[]
    getListeners(type: string): FastListenerMeta[] {
        const nodes: FastListenerNode[] = []
        const parts = type.split(this._delimiter);
        this._traverseToPath(this.listeners, parts, (node) => {
            nodes.push(node)
        })
        return nodes[0].__listeners
    }
    /**
     * 异步触发事件
     * @param type - 事件类型，可以是字符串或预定义的事件类型
     * @param payload - 事件数据负载
     * @param retain - 是否保留该事件，用于后续新的订阅者
     * @param meta - 事件元数据
     * @returns Promise，解析为所有监听器的执行结果数组
     * 
     * @description
     * 异步触发指定类型的事件，与emit方法类似，但有以下区别：
     * - 返回Promise，等待所有异步监听器执行完成
     * - 使用Promise.allSettled处理监听器的执行结果
     * - 即使某些监听器失败，也会等待所有监听器执行完成
     * - 返回结果包含成功值或错误信息
     * 
     * @example
     * ```ts
     * // 异步事件处理
     * const results = await emitter.emitAsync('data/process', rawData);
     * 
     * // 处理结果包含成功和失败的情况
     * results.forEach(result => {
     *   if (result instanceof Error) {
     *     console.error('处理失败:', result);
     *   } else {
     *     console.log('处理成功:', result);
     *   }
     * });
     * 
     * // 带元数据的异步事件
     * await emitter.emitAsync('batch/process', items, false, {
     *   batchId: 'batch-001',
     *   timestamp: Date.now()
     * });
     * ```
     */
    public async emitAsync<R = any>(type: string, payload?: any, retain?: boolean): Promise<[R | Error][]>
    public async emitAsync<R = any>(type: Types, payload?: AllEvents[Types], retain?: boolean): Promise<[R | Error][]>
    public async emitAsync<R = any, T extends string = string>(message: FastEventEmitMessage<{ [K in T]: K extends Types ? AllEvents[K] : any }, Meta>, retain?: boolean): Promise<[R | Error][]>
    public async emitAsync<R = any>(message: FastEventEmitMessage<AllEvents, Meta>, retain?: boolean): Promise<[R | Error][]>
    // ---    
    public async emitAsync<R = any>(type: string, payload?: any, options?: FastEventListenerArgs<Meta>): Promise<[R | Error][]>
    public async emitAsync<R = any>(type: Types, payload?: AllEvents[Types], options?: FastEventListenerArgs<Meta>): Promise<[R | Error][]>
    public async emitAsync<R = any, T extends string = string>(message: FastEventEmitMessage<{ [K in T]: K extends Types ? AllEvents[K] : any }, Meta>, options?: FastEventListenerArgs<Meta>): Promise<[R | Error][]>
    public async emitAsync<R = any>(message: FastEventEmitMessage<AllEvents, Meta>, options?: FastEventListenerArgs<Meta>): Promise<[R | Error][]>

    public async emitAsync<R = any>(): Promise<[R | Error][]> {
        const results = await Promise.allSettled(this.emit.apply(this, arguments as any))
        return results.map((result) => {
            if (result.status === 'fulfilled') {
                return result.value
            } else {
                return result.reason
            }
        })
    }

    /**
     * 等待指定事件发生，返回一个Promise
     * @param type - 要等待的事件类型
     * @param timeout - 超时时间（毫秒），默认为0表示永不超时
     * @returns Promise，解析为事件消息对象，包含type、payload和meta
     * 
     * @description
     * 创建一个Promise，在指定事件发生时解析。
     * - 当事件触发时，Promise会解析为事件消息对象
     * - 如果设置了timeout且超时，Promise会被拒绝
     * - 一旦事件发生或超时，会自动取消事件监听
     * 
     * @example
     * ```ts
     * try {
     *   // 等待登录事件，最多等待5秒
     *   const event = await emitter.waitFor('user/login', 5000);
     *   console.log('用户登录成功:', event.payload);
     * } catch (error) {
     *   console.error('等待登录超时');
     * }
     * 
     * // 无限等待事件
     * const event = await emitter.waitFor('server/ready');
     * console.log('服务器就绪');
     * ```
     */
    public waitFor<T extends Types>(type: T, timeout?: number): Promise<TypedFastEventMessage<{ [key in T]: AllEvents[T] }, Meta>>
    public waitFor(type: string, timeout?: number): Promise<TypedFastEventMessage<AllEvents, Meta>>
    public waitFor<P = any>(type: string, timeout?: number): Promise<TypedFastEventMessage<{ [key: string]: P }, Meta>>
    public waitFor(): Promise<TypedFastEventMessage<AllEvents, Meta>> {
        const type = arguments[0] as any
        const timeout = arguments[1] as number
        return new Promise<TypedFastEventMessage<AllEvents, Meta>>((resolve, reject) => {
            let tid: any
            let subscriber: FastEventSubscriber
            const listener = (message: TypedFastEventMessage<AllEvents, Meta>) => {
                clearTimeout(tid)
                subscriber && subscriber.off()
                resolve(message)
            }
            if (timeout && timeout > 0) {
                tid = setTimeout(() => {
                    subscriber && subscriber.off()
                    reject(new Error('wait for event<' + type + '> is timeout'))
                }, timeout)
            }
            subscriber = this.on(type, listener as any) as unknown as FastEventSubscriber
        })
    }

    /**
     * 创建一个新的事件作用域
     * @param prefix - 作用域前缀，将自动添加到该作用域下所有事件名称前
     * @returns 新的FastEventScope实例
     * 
     * @description
     * 创建一个新的事件作用域，用于在特定命名空间下管理事件。
     * 
     * 重要特性：
     * - 作用域与父事件发射器共享同一个监听器表
     * - 作用域中的事件会自动添加前缀
     * - 作用域的所有操作都会映射到父事件发射器上
     * - 作用域不是完全隔离的，只是提供了事件名称的命名空间
     * 
     * @example
     * ```ts
     * const emitter = new FastEvent();
     * 
     * // 创建用户相关事件的作用域
     * const userEvents = emitter.scope('user');
     * 
     * // 在作用域中监听事件
     * userEvents.on('login', (data) => {
     *   // 实际监听的是 'user/login'
     *   console.log('用户登录:', data);
     * });
     * 
     * // 在作用域中触发事件
     * userEvents.emit('login', { userId: 123 });
     * // 等同于 emitter.emit('user/login', { userId: 123 })
     * 
     * // 创建嵌套作用域
     * const profileEvents = userEvents.scope('profile');
     * profileEvents.emit('update', { name: 'John' });
     * // 等同于 emitter.emit('user/profile/update', { name: 'John' })
     * 
     * // 清理作用域
     * userEvents.offAll();  // 清理 'user' 前缀下的所有事件
     * ```
     */
    scope<
        E extends Record<string, any> = Record<string, any>,
        P extends string = string,
        M extends Record<string, any> = Record<string, any>,
        C = Context
    >(prefix: P, options?: DeepPartial<FastEventScopeOptions<Meta & M, C>>): FastEventScope<ScopeEvents<AllEvents, P> & E, Meta & M, C>
    scope<
        E extends Record<string, any> = Record<string, any>,
        P extends string = string,
        M extends Record<string, any> = Record<string, any>,
        C = Context,
        ScopeObject extends FastEventScope<any, any, any> = FastEventScope<ScopeEvents<AllEvents, P> & E, Meta & M, C>
    >(prefix: P, scopeObj: ScopeObject, options?: DeepPartial<FastEventScopeOptions<Meta & M, C>>): ScopeObject
    scope<
        E extends Record<string, any> = Record<string, any>,
        P extends string = string,
        M extends Record<string, any> = Record<string, any>,
        C = Context
    >() {
        const [prefix, scopeObj, options] = parseScopeArgs(arguments, this.options.meta, this.options.context)
        let scope
        if (scopeObj) {
            scope = scopeObj
        } else {
            scope = new FastEventScope<ScopeEvents<AllEvents, P> & E, Meta & M, C>()
        }
        scope.bind(this as any, prefix, options as FastEventScopeOptions<Meta & M, C>)
        return scope
    }
}

