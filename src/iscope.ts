import { FastEventAnyListener, FastEventListener, FastEventListenOptions, FastEventMessage, FastEvents, FastEventSubscriber } from "./types";

export type FastEventScopeOptions<Meta = unknown> = {
    meta?: Meta
}

export interface IFastEventScope<
    Events extends FastEvents = FastEvents,
    Meta = any,
    Context = any,
    Types extends keyof Events = keyof Events
> {
    on<T extends Types = Types>(type: T, listener: FastEventListener<Exclude<T, number | symbol>, Events[T], Meta, Context>, options?: FastEventListenOptions): FastEventSubscriber
    on<T extends string>(type: T, listener: FastEventAnyListener<Events, Meta, Context>, options?: FastEventListenOptions): FastEventSubscriber
    on(type: '**', listener: FastEventAnyListener<Events, Meta, Context>): FastEventSubscriber
    on(): FastEventSubscriber

    once<T extends Types = Types>(type: T, listener: FastEventListener<Exclude<T, number | symbol>, Events[T], Meta, Context>, options?: FastEventListenOptions): FastEventSubscriber
    once<T extends string>(type: T, listener: FastEventAnyListener<Events, Meta, Context>, options?: FastEventListenOptions): FastEventSubscriber
    once(): FastEventSubscriber

    onAny<P = any>(listener: FastEventAnyListener<{ [K: string]: P }, Meta, Context>, options?: Pick<FastEventListenOptions, 'prepend'>): FastEventSubscriber

    off(listener: FastEventListener<any, any, any>): void
    off(type: string, listener: FastEventListener<any, any, any>): void
    off(type: Types, listener: FastEventListener<any, any, any>): void
    off(type: string): void
    off(type: Types): void

    offAll(): void
    clear(): void

    emit<R = any>(type: string, payload?: any, retain?: boolean, meta?: Meta): R[]
    emit<R = any>(type: Types, payload?: Events[Types], retain?: boolean, meta?: Meta): R[]
    emit<R = any>(message: FastEventMessage<Events, Meta>, retain?: boolean): R[]
    emit<R = any>(message: FastEventMessage<Events, Meta>, retain?: boolean): R[]
    emit<R = any>(): R[]

    waitFor<T extends Types>(type: T, timeout?: number): Promise<FastEventMessage<Events, Meta>>
    waitFor(type: string, timeout?: number): Promise<FastEventMessage<Events, Meta>>
    waitFor(): Promise<FastEventMessage<Events, Meta>>

    scope(prefix: string): IFastEventScope
}