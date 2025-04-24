import { FastEvent } from "./event";
import { FastEventListener, FastEventListenOptions, FastEventMessage, FastEvents, FastEventSubscriber } from "./types";

export class FastEventScope<
    Events extends FastEvents = FastEvents,
    Meta extends Record<string, any> = Record<string, any>,
    Context = any,
    Types extends keyof Events = keyof Events
> {
    constructor(public emitter: FastEvent<Events, Meta, Types>, public prefix: string) {
        if (prefix.length > 0 && !prefix.endsWith(emitter.options.delimiter!)) {
            this.prefix = prefix + emitter.options.delimiter
        }
    }
    private _getScopeListener(listener: FastEventListener): FastEventListener {
        const scopePrefix = this.prefix
        if (scopePrefix.length === 0) return listener
        const scopeListener = function (message: FastEventMessage) {
            if (message.type.startsWith(scopePrefix)) {
                return listener(Object.assign({}, message, {
                    type: message.type.substring(scopePrefix.length)
                }))
            }
        }
        // 当启用scope时对监听器进行包装
        //@ts-ignore
        listener.__wrappedListener = scopeListener
        return listener
    }
    private _getScopeType(type: string) {
        return type === undefined ? undefined : this.prefix + type
    }
    private _fixScopeType(type: string) {
        return type.startsWith(this.prefix) ? type.substring(this.prefix.length) : type
    }

    public on<T extends Types = Types>(type: T, listener: FastEventListener<T, Events[T], Meta, Context>, options?: FastEventListenOptions): FastEventSubscriber
    public on<T extends string>(type: T, listener: FastEventListener<T, Events[T], Meta, Context>, options?: FastEventListenOptions): FastEventSubscriber
    public on(type: '**', listener: FastEventListener<any, any, Meta, Context>): FastEventSubscriber
    public on(): FastEventSubscriber {
        const args = [...arguments] as [any, any, any]
        args[0] = this._getScopeType(args[0])
        args[1] = this._getScopeListener(args[1])
        return this.emitter.on(...args)
    }

    public once<T extends string>(type: T, listener: FastEventListener<T, Events[T], Meta, Context>, options?: FastEventListenOptions): FastEventSubscriber
    public once<T extends Types = Types>(type: T, listener: FastEventListener<Types, Events[T], Meta, Context>, options?: FastEventListenOptions): FastEventSubscriber
    public once(): FastEventSubscriber {
        return this.on(arguments[0], arguments[1], Object.assign({}, arguments[2], { count: 1 }))
    }

    onAny<P = any>(listener: FastEventListener<Types, P, Meta, Context>, options?: FastEventListenOptions): FastEventSubscriber {
        const type = this.prefix + '**'
        return this.on(type as any, listener, options)
    }
    offAll() {
        this.emitter.offAll(this.prefix)
    }
    off(listener: FastEventListener<any, any, any>): void
    off(type: string, listener: FastEventListener<any, any, any>): void
    off(type: Types, listener: FastEventListener<any, any, any>): void
    off(type: string): void
    off(type: Types): void
    off() {
        const args = arguments as unknown as [any, any]
        if (typeof (args[0]) === 'string') {
            args[0] = this._getScopeType(args[0])
        }
        this.emitter.off(...args)
    }
    clear() {
        this.offAll()
    }

    public emit<R = any>(type: Types, payload?: Events[Types], retain?: boolean): R[]
    public emit<R = any>(type: string, payload?: any, retain?: boolean): R[]
    public emit<R = any>(): R[] {
        const type = arguments[0] as string
        const payload = arguments[1]
        const retain = arguments[2] as boolean
        return this.emitter.emit(this._getScopeType(type)!, payload, retain)
    }
    public async waitFor<T extends Types, P = Events[T], M = Meta>(type: T, timeout?: number): Promise<FastEventMessage<T, P, M>>
    public async waitFor<T extends string, P = Events[T], M = Meta>(type: string, timeout?: number): Promise<FastEventMessage<T, P, M>>
    public async waitFor<T extends string, P = Events[T], M = Meta>(): Promise<FastEventMessage<T, P, M>> {
        const type = arguments[0] as string
        const timeout = arguments[1] as number
        const message = await this.emitter.waitFor(this._getScopeType(type)!, timeout)
        const scopeMessage = Object.assign({}, message, {
            type: this._fixScopeType(message.type)
        })
        return scopeMessage as unknown as FastEventMessage<T, P, M>
    }
    /**
     * 创建一个新的作用域实例
     * @param prefix - 作用域前缀
     * @returns 新的FastEventScope实例
     * 
     * @description
     * 基于当前作用域创建一个新的子作用域。新作用域会继承当前作用域的所有特性，
     * 并在事件类型前添加额外的前缀。这允许创建层级化的事件命名空间。
     * 
     * 作用域的特性：
     * - 自动为所有事件类型添加前缀
     * - 在触发事件时自动添加前缀
     * - 在接收事件时自动移除前缀
     * - 支持多层级的作用域嵌套
     * 
     * @example
     * ```ts
     * const emitter = new FastEvent();
     * const userScope = emitter.scope('user');
     * const profileScope = userScope.scope('profile');
     * 
     * // 在profileScope中监听'update'事件
     * // 实际监听的是'user/profile/update'
     * profileScope.on('update', (data) => {
     *   console.log('Profile updated:', data);
     * });
     * 
     * // 在profileScope中触发'update'事件
     * // 实际触发的是'user/profile/update'
     * profileScope.emit('update', { name: 'John' });
     * ```
     */
    public scope(prefix: string) {
        return this.emitter.scope(this._getScopeType(prefix)!)
    }
}