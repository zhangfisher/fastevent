// oxlint-disable no-unused-vars
import { FastEventDirectives, UnboundError } from "./consts";
import type { FastEvent } from "./event";
import { FastListenerExecutor } from "./executors/types";
import {
    TypedFastEventAnyListener,
    FastEventEmitMessage,
    TypedFastEventListener,
    FastEventListenerArgs,
    FastEventListenOptions,
    TypedFastEventMessage,
    FastEventSubscriber,
    ScopeEvents,
    FastEventMeta,
    DeepPartial,
    Fallback,
    Dict,
    TypedFastEventMessageOptional,
    RecordValues,
    GetMatchedEvents,
    FastEventListenerFlags,
    OmitTransformedEvents,
    PickTransformedEvents,
    FastEventMessage,
    GetClosestEvents,
    IsTransformedKey,
    ExtendWildcardEvents,
    MutableRecord,
    FastEventCommonListener,
    KeyOf,
    IsTransformed,
    PayloadValues,
} from "./types";
import { parseEmitArgs } from "./utils/parseEmitArgs";
import { parseScopeArgs } from "./utils/parseScopeArgs";
import { renameFn } from "./utils/renameFn";
import { PickPayload, AtPayloads } from "./types/index";
import { isFunction } from "./utils/isFunction";
import { FastEventIterator } from "./utils/eventIterator";

export type FastEventScopeOptions<Meta = Record<string, any>, Context = never> = {
    meta: FastEventScopeMeta & FastEventMeta & Meta;
    context: Context;
    executor?: FastListenerExecutor;
    // 默认监听器，优先级高类方法onMessage
    onMessage?: TypedFastEventListener;
    /**
     * 对接收到的消息进行转换，用于将消息转换成其他格式
     *
     * new FastEvent({
     *    transform:(message)=>{
     *        message.payload
     *    }
     * })
     */
    transform?: (message: FastEventMessage) => any;
};

export interface FastEventScopeMeta {
    scope: string;
}

export interface IFastEventScope<
    Events extends Record<string, any> = Record<string, any>,
    Meta extends Record<string, any> = Record<string, any>,
    Context = never,
> {
    __FastEventScope__: boolean;
}

export class FastEventScope<
    Events extends Record<string, any> = Record<string, any>,
    Meta extends Record<string, any> = Record<string, any>,
    Context = never,
    Types extends keyof Events = keyof Events,
    FinalMeta extends Record<string, any> = FastEventMeta & FastEventScopeMeta & Meta,
> {
    __FastEventScope__: boolean = true;
    // 添加类型标记
    readonly __events__!: Events;
    readonly __meta__!: Meta & FastEventScopeMeta;
    readonly __context__!: Context;
    private _options: DeepPartial<FastEventScopeOptions<FinalMeta, Context>> = {};

    // types = {
    //     events: undefined as unknown as Events,
    //     meta: undefined as unknown as FinalMeta,
    //     context: undefined as unknown as Fallback<Context, typeof this>,
    //     message: undefined as unknown as TypedFastEventMessageOptional<Events, FinalMeta>,
    //     listeners: undefined as unknown as FastEventListeners<Events, FinalMeta>,
    //     anyListener: undefined as unknown as TypedFastEventAnyListener<
    //         Events,
    //         FinalMeta,
    //         Fallback<Context, typeof this>
    //     >,
    // };
    // declare types: {
    //     // 基本类型字段（不依赖 this）
    //     events: Events;
    //     meta: FinalMeta;
    //     message: TypedFastEventMessageOptional<Events, FinalMeta>;
    //     listeners: FastEventListeners<Events, FinalMeta>;

    //     // 需要使用 this 的字段 - 使用当前类作为占位符
    //     // 在实际使用时，TypeScript 会正确推断为实例类型
    //     context: Fallback<Context, FastEventScope<Events, Meta, Context, Types, FinalMeta>>;
    //     anyListener: TypedFastEventAnyListener<
    //         Events,
    //         FinalMeta,
    //         Fallback<Context, FastEventScope<Events, Meta, Context, Types, FinalMeta>>
    //     >;
    // };
    declare types: {
        events: ExtendWildcardEvents<Events>;
        meta: FinalMeta;
        message: TypedFastEventMessageOptional<Events, FinalMeta>;
    };
    prefix: string = "";
    emitter!: FastEvent<any>;
    constructor(options?: DeepPartial<FastEventScopeOptions<FinalMeta, Context>>) {
        this._options = Object.assign(
            {},
            this._initOptions(options),
        ) as unknown as FastEventScopeOptions<FinalMeta, Context>;
    }
    get context(): Fallback<Context, typeof this> {
        return (this.options.context || this) as Fallback<Context, typeof this>;
    }
    get options() {
        return this._options as FastEventScopeOptions<FinalMeta, Context>;
    }
    /**
     * 获取监听器
     * @returns 监听器
     */
    get listeners() {
        return this.emitter.getListeners(this.prefix);
    }
    bind(
        emitter: FastEvent<any>,
        prefix: string,
        options?: DeepPartial<FastEventScopeOptions<FinalMeta, Context>>,
    ) {
        this.emitter = emitter;
        this._options = Object.assign(
            this._options,
            {
                scope: prefix,
            },
            options,
        ) as unknown as Required<FastEventScopeOptions<FinalMeta, Context>>;
        if (prefix.length > 0 && !prefix.endsWith(emitter.options.delimiter!)) {
            this.prefix = prefix + emitter.options.delimiter;
        }
    }
    /**
     * 初始化选项
     *
     * 本方法主要供子类重载
     *
     * @param initial - 可选的初始字典对象
     * @returns 返回传入的初始字典对象
     */
    _initOptions(initial: Dict | undefined) {
        return initial;
    }
    /**
     * 获取作用域监听器
     * 当启用作用域时,对原始监听器进行包装,添加作用域前缀处理逻辑
     * @param listener 原始事件监听器
     * @returns 包装后的作用域监听器
     * @private
     */
    private _getScopeListener(listener: TypedFastEventListener): TypedFastEventListener {
        const scopePrefix = this.prefix;
        if (scopePrefix.length === 0) return listener;
        // 如果没有指定监听器，则使用onMessage作为监听器
        if (!listener) {
            throw new Error();
        }
        const scopeThis = this;
        const scopeListener = renameFn(function (
            message: TypedFastEventMessage,
            args: FastEventListenerArgs,
        ) {
            const type = args.rawEventType || message.type;
            if (type.startsWith(scopePrefix)) {
                // 1. 判断是否经过全局Transform转换
                // 消息是否经过转换，如果经过转换，由于结果不确定，所以不进行前缀处理，直接将消息传递给监听器
                const isTransformed = ((args.flags || 0) & FastEventListenerFlags.Transformed) > 0;
                let msg = isTransformed
                    ? message
                    : Object.assign({}, message, {
                          type: type.substring(scopePrefix.length),
                      });

                return listener.call(scopeThis.context, msg, args);
            }
        }, listener.name) as TypedFastEventListener;
        return scopeListener;
    }
    private _getScopeType(type: string) {
        return type === undefined ? undefined : this.prefix + type;
    }
    private _fixScopeType(type: string) {
        return type.startsWith(this.prefix) ? type.substring(this.prefix.length) : type;
    }

    // 返回事件迭代器
    public on<T extends string = KeyOf<Events> | "**">(
        type: T,
        options?: FastEventListenOptions<Events, Meta>,
    ): T extends IsTransformedKey<Events, T>
        ? FastEventIterator<
              T extends "**"
                  ? IsTransformed<Events> extends true
                      ? PayloadValues<Events>
                      : any
                  : PickPayload<RecordValues<GetClosestEvents<Events, T>>>
          >
        : FastEventIterator<
              TypedFastEventMessage<GetClosestEvents<Events, T, Record<T, any>>, Meta>
          >;
    // 使用标准监听器
    public on<T extends string = KeyOf<Events> | "**">(
        type: T,
        listener: FastEventCommonListener<
            T extends IsTransformedKey<Events, T>
                ? PickPayload<RecordValues<GetClosestEvents<Events, T>>>
                : TypedFastEventMessage<
                      T extends "**" ? Events : GetClosestEvents<Events, T, Record<T, any>>,
                      FinalMeta
                  >,
            FinalMeta,
            Fallback<Context, typeof this>
        >,
        options?: FastEventListenOptions,
    ): FastEventSubscriber;

    public on(): FastEventSubscriber | FastEventIterator<any> {
        if (!this.emitter) throw new UnboundError();
        const args = [...arguments] as [any, any, any];
        args[0] = this._getScopeType(args[0]);
        args[1] = this._getScopeListener(args[1]);
        return this.emitter.on(...args);
    }
    /**
     * 只订阅一次
     * @param type
     * @param options
     */
    public once<T extends Types = Types>(
        type: T,
        options?: FastEventListenOptions<Events, FinalMeta>,
    ): FastEventSubscriber;
    public once<T extends Exclude<string, Types>>(
        type: T,
        options?: FastEventListenOptions<Events, FinalMeta>,
    ): FastEventSubscriber;

    // 传入监听器
    public once<T extends keyof OmitTransformedEvents<Events>>(
        type: T,
        listener: TypedFastEventListener<
            Exclude<T, number | symbol>,
            Events[T],
            FinalMeta,
            Fallback<Context, typeof this>
        >,
        options?: FastEventListenOptions,
    ): FastEventSubscriber;

    // 处理使用 NotPayload 标识的事件类型
    public once<T extends keyof PickTransformedEvents<Events>>(
        type: T,
        listener: (
            message: PickPayload<
                RecordValues<GetClosestEvents<Events, Exclude<T, number | symbol>>>
            >,
            args: FastEventListenerArgs<FinalMeta>,
        ) => any | Promise<any>,
        options?: FastEventListenOptions<Events, FinalMeta>,
    ): FastEventSubscriber;

    public once<T extends Exclude<string, Types>>(
        type: T,
        listener: TypedFastEventAnyListener<
            GetClosestEvents<Events, T>,
            FinalMeta,
            Fallback<Context, typeof this>
        >,
        options?: FastEventListenOptions,
    ): FastEventSubscriber;
    public once(): FastEventSubscriber {
        return this.on(arguments[0], arguments[1], Object.assign({}, arguments[2], { count: 1 }));
    }

    onAny(
        options?: Pick<FastEventListenOptions, "prepend">,
    ): FastEventIterator<TypedFastEventMessage<Events, FinalMeta>>;
    onAny<P = any>(
        listener: TypedFastEventAnyListener<
            { [K: string]: P },
            FinalMeta,
            Fallback<Context, typeof this>
        >,
        options?: Pick<FastEventListenOptions, "prepend">,
    ): FastEventSubscriber;
    onAny() {
        return this.on("**" as any, ...(arguments as any)) as any;
    }

    off(listener: TypedFastEventListener<any, any, any>): void;
    off(type: string, listener: TypedFastEventListener<any, any, any>): void;
    off(type: Types, listener: TypedFastEventListener<any, any, any>): void;
    off(type: string): void;
    off(type: Types): void;
    off() {
        const args = arguments as unknown as [any, any];
        if (typeof args[0] === "string") {
            args[0] = this._getScopeType(args[0]);
        }
        this.emitter.off(...args);
    }
    offAll() {
        this.emitter.offAll(this.prefix.substring(0, this.prefix.length - 1));
    }
    clear() {
        this.emitter.clear(this.prefix.substring(0, this.prefix.length - 1));
    }

    public emit(type: Types, directive: symbol): void;
    public emit(type: string, directive: symbol): void;
    public emit<R = any, T extends Types = Types>(
        type: T,
        payload?: PickPayload<Events[T]>,
        retain?: boolean,
    ): R[];
    public emit<R = any, T extends string = string>(
        type: T,
        payload?: PickPayload<
            T extends Types ? Events[T] : RecordValues<GetMatchedEvents<Events, T>>
        >,
        retain?: boolean,
    ): R[];
    public emit<R = any, T extends string = string>(
        type: T,
        payload?: PickPayload<
            T extends Types ? Events[T] : RecordValues<GetMatchedEvents<Events, T>>
        >,
        options?: FastEventListenerArgs<FinalMeta>,
    ): R[];
    public emit<R = any>(
        message: FastEventEmitMessage<AtPayloads<Events>, FinalMeta>,
        options?: FastEventListenerArgs<FinalMeta>,
    ): R[];
    public emit<R = any, T extends string = string>(
        message: FastEventEmitMessage<
            {
                [K in T]: PickPayload<K extends Types ? Events[K] : any>;
            },
            FinalMeta
        >,
        options?: FastEventListenerArgs<FinalMeta>,
    ): R[];
    public emit() {
        // 清除保留事件
        if (
            arguments.length === 2 &&
            typeof arguments[0] === "string" &&
            arguments[1] === FastEventDirectives.clearRetain
        ) {
            return this.emitter.emit(this._getScopeType(arguments[0])!);
        }
        let [message, args] = parseEmitArgs(
            arguments,
            this.emitter.options.meta,
            this.options.meta,
            this.options.executor,
        );

        this._transformMessage(message, args);
        message.type = this._getScopeType(message.type)!;

        return this.emitter.emit(message as TypedFastEventMessage<Events, FinalMeta>, args);
    }

    private _transformMessage(message: FastEventMessage, args: FastEventListenerArgs<FinalMeta>) {
        if (isFunction(this._options.transform)) {
            args.rawEventType = this._getScopeType(message.type)!;
            args.flags = (args.flags || 0) | FastEventListenerFlags.Transformed;
            message.payload = this._options.transform.call(this, message);
        }
    }

    public async emitAsync<R = any, T extends Types = Types>(
        type: T,
        payload?: PickPayload<Events[T]>,
        retain?: boolean,
    ): Promise<[R | Error][]>;
    public async emitAsync<R = any, T extends string = string>(
        type: T,
        payload?: PickPayload<T extends Types ? Events[T] : any>,
        retain?: boolean,
    ): Promise<[R | Error][]>;
    public async emitAsync<R = any, T extends Types = Types>(
        type: T,
        payload?: PickPayload<Events[T]>,
        options?: FastEventListenerArgs<FinalMeta>,
    ): Promise<[R | Error][]>;
    public async emitAsync<R = any, T extends string = string>(
        type: T,
        payload?: PickPayload<T extends Types ? Events[T] : any>,
        options?: FastEventListenerArgs<FinalMeta>,
    ): Promise<[R | Error][]>;
    public async emitAsync<R = any, T extends string = string>(
        message: FastEventEmitMessage<
            {
                [K in T]: PickPayload<K extends Types ? Events[K] : any>;
            },
            FinalMeta
        >,
        options?: FastEventListenerArgs<FinalMeta>,
    ): Promise<[R | Error][]>;
    public async emitAsync<R = any>(): Promise<[R | Error][]> {
        const results = await Promise.allSettled(this.emit.apply(this, arguments as any));
        return results.map((result) => {
            if (result.status === "fulfilled") {
                return result.value;
            } else {
                return result.reason;
            }
        });
    }

    public async waitFor<T extends Types>(
        type: T,
        timeout?: number,
    ): Promise<TypedFastEventMessage<{ [key in T]: Events[T] }, FinalMeta>>;
    public async waitFor(
        type: string,
        timeout?: number,
    ): Promise<TypedFastEventMessage<{ [key: string]: any }, FinalMeta>>;
    public async waitFor<P = any>(
        type: string,
        timeout?: number,
    ): Promise<TypedFastEventMessage<{ [key: string]: P }, FinalMeta>>;
    public async waitFor(): Promise<TypedFastEventMessage<Events, FinalMeta>> {
        const type = arguments[0] as string;
        const timeout = arguments[1] as number;
        const message = await this.emitter.waitFor(this._getScopeType(type)!, timeout);
        const scopeMessage = Object.assign({}, message, {
            type: this._fixScopeType(message.type),
        });
        return scopeMessage as unknown as TypedFastEventMessage<Events, FinalMeta>;
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

    scope<
        E extends Record<string, any> = Record<string, any>,
        P extends string = string,
        M extends Record<string, any> = Record<string, any>,
        C = Context,
    >(
        prefix: P,
        options?: DeepPartial<FastEventScopeOptions<Partial<FinalMeta> & M, C>>,
    ): FastEventScope<ScopeEvents<Events & E, P>, FinalMeta & M, C>;
    scope<
        E extends Record<string, any> = Record<string, any>,
        P extends string = string,
        M extends Record<string, any> = Record<string, any>,
        C = Context,
        ScopeInstance extends IFastEventScope<Record<string, any>, any, any> = FastEventScope<
            Record<string, any>,
            any,
            any
        >,
    >(
        prefix: P,
        scopeObj: ScopeInstance,
        options?: DeepPartial<FastEventScopeOptions<Partial<FinalMeta> & M, C>>,
    ): FastEventScopeExtend<Events & E, P, ScopeInstance, Meta>;
    scope<
        E extends Record<string, any> = Record<string, any>,
        P extends string = string,
        M extends Record<string, any> = Record<string, any>,
        C = Context,
    >(): any {
        const [prefix, scopeObj, options] = parseScopeArgs(
            arguments,
            this.options.meta,
            this.options.context,
        );
        let scope: FastEventScope<ScopeEvents<Events, P> & E, FinalMeta & M, C>;
        if (scopeObj) {
            scope = scopeObj;
        } else {
            scope = new FastEventScope<ScopeEvents<Events, P> & E, FinalMeta & M, C>();
        }
        scope.bind(this.emitter as any, this.prefix + prefix, options);
        return scope;
    }
}

type ExtractScopeMeta<T> = T extends { __meta__: infer Meta } ? Meta : Record<string, any>;
type ExtractScopeEvents<T> = T extends { __events__: infer Events } ? Events : Record<string, any>;
type ExtractScopeContext<T> = T extends { __context__: infer Context } ? Context : never;
export type FastEventScopeExtend<
    Events extends Record<string, any>,
    Prefix extends string,
    T extends IFastEventScope = FastEventScope<any, any, any>,
    EmitterMeta extends Record<string, any> = Record<string, any>,
> = FastEventScope<
    ScopeEvents<Events, Prefix> & ExtractScopeEvents<T>,
    EmitterMeta & ExtractScopeMeta<T> & FastEventScopeMeta,
    ExtractScopeContext<T>
> &
    Omit<T, keyof FastEventScope>;
