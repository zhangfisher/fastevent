import { FastEvent } from "./event";
import { FastEventListener, FastEventListenOptions, FastEventMessage, FastEvents, FastEventSubscriber } from "./types";

export class FastEventScope<
    Events extends FastEvents = FastEvents,
    Meta extends Record<string, any> = Record<string, any>,
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

    public on<T extends string>(type: T, listener: FastEventListener<T, Events[T], Meta>, options?: FastEventListenOptions): FastEventSubscriber
    public on<T extends Types = Types>(type: T, listener: FastEventListener<T, Events[T], Meta>, options?: FastEventListenOptions): FastEventSubscriber
    public on(type: '**', listener: FastEventListener<any, any, Meta>): FastEventSubscriber
    public on(): FastEventSubscriber {
        const args = [...arguments] as [any, any, any]
        args[0] = this._getScopeType(args[0])
        args[1] = this._getScopeListener(args[1])
        return this.emitter.on(...args)
    }

    public once<T extends string>(type: T, listener: FastEventListener<T, Events[T], Meta>, options?: FastEventListenOptions): FastEventSubscriber
    public once<T extends Types = Types>(type: T, listener: FastEventListener<Types, Events[T], Meta>, options?: FastEventListenOptions): FastEventSubscriber
    public once(): FastEventSubscriber {
        return this.on(arguments[0], arguments[1], Object.assign({}, arguments[2], { count: 1 }))
    }

    onAny<P = any>(listener: FastEventListener<Types, P, Meta>, options?: FastEventListenOptions): FastEventSubscriber {
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
    public emit<R = any>(type: string, payload?: any, retain?: boolean): R[]
    public emit<R = any>(type: Types, payload?: Events[Types], retain?: boolean): R[]
    public emit<R = any>(): R[] {
        const type = arguments[0] as string
        const payload = arguments[1]
        const retain = arguments[2] as boolean
        return this.emitter.emit(this._getScopeType(type)!, payload, retain)
    }
    public waitFor<R = any>(type: string, timeout?: number): Promise<R>
    public waitFor<R = any>(type: Types, timeout?: number): Promise<R>
    public waitFor<R = any>(): Promise<R> {
        const type = arguments[0] as string
        const timeout = arguments[1] as number
        return this.emitter.waitFor(this._getScopeType(type)!, timeout)
    }
    public scope(prefix: string) {
        return this.emitter.scope(this._getScopeType(prefix)!)
    }
}