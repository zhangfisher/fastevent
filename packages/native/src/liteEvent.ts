/**
 * FastLiteEvent 轻量级事件发射器
 *
 * 从 FastEvent 派生的精简版本，移除了以下高级特性：
 *   scope / hook / meta / pipe / executor / 异步迭代 / context
 *   debug / abortSignal / 订阅时的 filter+off / 监听优先级 prepend
 *
 * 仅保留核心的事件收发能力：on / once / onAny / off / offAll / clear /
 * emit / emitAsync / waitFor / getListeners / clearRetainMessages，以及通配符
 * （* / **）、retain 保留事件、count / tag / flags、ignoreErrors、transform
 * 消息转换、expandEmitResults 等基础特性。
 *
 * 类型与 FastEvent 同源派生（Omit / 复用），监听器、消息、订阅者与 FastEvent
 * 双向兼容——同一监听器函数可同时挂到 FastEvent 与 FastLiteEvent 上。
 */
import {
    type GetClosestEvents,
    type KeyOf,
    type MutableMessage,
    type Expand,
    type ReplaceWildcard,
    type UnTransformedEvents,
    type FastEventMessage,
    type TypedFastEventMessage,
    type FastEventEmitMessage,
    type FastListeners,
    type FastEventListenerNode,
    type FastEventListenerMeta,
    type FastEventCommonListener,
    type FastEventSubscriber,
    type FastEventOptions,
    type FastEventListenOptions,
    type FastEventListenerArgs,
    type FastEvents,
    type IsTransformedEvent,
    type PickPayload,
    type ValueOf,
    type GetPayload,
    FastEventListenerFlags,
} from "./types";
import type { InMatchedEvent } from "./types/wildcards/InMatchedEvent";
import type { GetClosestMessage } from "./types/closest/GetClosestMessage";
import { isPathMatched } from "./utils/isPathMatched";
import { removeItem } from "./utils/removeItem";
import { isFunction } from "./utils/isFunction";
import { expandEmitResults } from "./utils/expandEmitResults";
import { tryReturnError } from "./utils/tryReturnError";
import { getPromiseResults } from "./utils/getPromiseResults";

// —— 从原始类型 Omit 派生：剥离被移除特性对应的字段 ——
export type FastLiteMessage<T extends string = string, P = any> = Omit<
    FastEventMessage<T, P>,
    "meta"
>;

export type FastLiteListenerArgs = Omit<
    FastEventListenerArgs,
    "meta" | "executor" | "parseArgs" | "abortSignal" | "broadcast"
>;

export type FastLiteListenOptions<Events extends Record<string, any> = Record<string, any>> = Omit<
    FastEventListenOptions<Events>,
    "pipes" | "iterable" | "filter" | "off" | "prepend"
>;

export type FastLiteEventOptions = Omit<
    FastEventOptions,
    | "context"
    | "meta"
    | "executor"
    | "debug"
    | "onAddBeforeListener"
    | "onAddAfterListener"
    | "onRemoveListener"
    | "onClearListeners"
    | "onListenerError"
    | "onBeforeExecuteListener"
    | "onAfterExecuteListener"
>;

// —— 完全复用原始类型（与 FastEvent 互换兼容）——
export type FastLiteSubscriber = FastEventSubscriber;
export type FastLiteListener<T extends string = string, P = any> = FastEventCommonListener<
    FastLiteMessage<T, P>,
    any,
    any
>;

/**
 * 解析 emit 参数（简化版，不复用 parseEmitArgs）
 *
 * 仅支持两种形态：
 *   (type, payload, retain?)
 *   (message, retain?)
 *
 * @param args - emit 的 arguments
 * @returns [消息, 监听器参数]
 */
function parseLiteEmitArgs(args: IArguments): [TypedFastEventMessage, FastLiteListenerArgs] {
    // 最常见路径优先：emit(type, payload[, retain|options])
    if (typeof args[0] === "string") {
        const opt = args[2];
        return [
            { type: args[0], payload: args[1] } as TypedFastEventMessage,
            opt === undefined ? {} : typeof opt === "boolean" ? { retain: opt } : opt,
        ];
    }
    // 对象形式：emit(message[, retain|options])
    const opt = args[1];
    return [
        Object.assign({} as TypedFastEventMessage, args[0]),
        opt === undefined ? {} : typeof opt === "boolean" ? { retain: opt } : opt,
    ];
}

/**
 * FastLiteEvent 轻量级事件发射器类
 *
 * @template Events - 事件类型定义，继承自 FastEvents 接口
 */
export class FastLiteEvent<
    Events extends Record<string, any> = Record<string, any>,
    AllEvents extends Record<string, any> = Expand<Events & FastEvents>,
    Types extends keyof AllEvents = KeyOf<AllEvents>,
> {
    __FastLiteEvent__: boolean = true;

    /** 事件监听器树结构，存储所有注册的事件监听器 */
    public listeners: FastListeners = {
        __listeners: [],
    } as unknown as FastListeners;

    /** 事件发射器的配置选项 */
    private _options: FastLiteEventOptions;

    /** 事件名称的分隔符，默认为 '/' */
    private _delimiter: string = "/";

    /** 缓存的 transform 函数（构造时规范化：非函数则 undefined）。emit 热路径直接判断，省属性链 + isFunction */
    private _transform: any;

    /** 缓存的 expandEmitResults 开关（构造时读取，默认 true） */
    private _expandResults: boolean = true;

    /** 保留的事件消息映射，Key 是事件名称，Value 是保留的事件消息 */
    retainedMessages: Map<string, any> = new Map<string, any>();

    /** 当前注册的监听器总数 */
    listenerCount: number = 0;

    /**
     * 创建 FastLiteEvent 实例
     * @param options - 事件发射器的配置选项
     *
     * 默认配置：
     * - id: 随机字符串 - 实例唯一标识符
     * - delimiter: '/' - 事件名称分隔符
     * - ignoreErrors: true - 是否忽略监听器执行错误
     * - expandEmitResults: true - 是否展开 emit 返回值
     */
    constructor(options?: Partial<FastLiteEventOptions>) {
        this._options = Object.assign(
            {
                id: Math.random().toString(36).substring(2),
                delimiter: "/",
                ignoreErrors: true,
                expandEmitResults: true,
            },
            this._initOptions(options),
        ) as unknown as FastLiteEventOptions;
        this._delimiter = this._options.delimiter!;
        // 缓存热路径配置，避免 emit 每次读取属性链 + isFunction
        const transformOpt = this._options.transform;
        this._transform = typeof transformOpt === "function" ? transformOpt : undefined;
        this._expandResults = this._options.expandEmitResults !== false;
    }

    /** 获取事件发射器的配置选项 */
    get options() {
        return this._options;
    }
    /** 获取事件发射器的唯一标识符 */
    get id() {
        return this._options.id!;
    }
    /** 获取事件发射器的标题 */
    get title() {
        return this._options.title || this.id || "FastLiteEvent";
    }

    /**
     * 初始化选项（供子类重载）
     * @param initial - 可选的初始选项
     */
    _initOptions(initial?: Partial<FastLiteEventOptions>) {
        return initial;
    }

    /**
     * 添加事件监听器到事件树（仅尾插，已移除 prepend 插队）
     * @param parts - 事件路径数组
     * @param listener - 事件监听器函数
     * @param options - 监听器配置（count / tag / flags）
     * @returns [节点, 监听器索引]
     */
    private _addListener(
        parts: string[],
        listener: Function,
        options: { count: number; tag?: string; flags?: number },
    ): [FastEventListenerNode | undefined, number] {
        let index: number = 0;
        const node = this._forEachNodes(parts, (node) => {
            const newListener = [
                listener,
                options.count,
                0,
                options.tag,
                options.flags,
            ] as unknown as FastEventListenerMeta;
            node.__listeners.push(newListener);
            index = node.__listeners.length - 1;
            this.listenerCount++;
        });
        return [node, index];
    }

    /**
     * 根据 parts 路径遍历监听器树，并在最后的节点上执行回调
     */
    private _forEachNodes(
        parts: string[],
        callback: (node: FastEventListenerNode, parent: FastEventListenerNode) => void,
    ): FastEventListenerNode | undefined {
        if (parts.length === 0) return;
        let current = this.listeners;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!(part in current)) {
                current[part] = {
                    __listeners: [],
                } as unknown as FastListeners;
            }
            if (i === parts.length - 1) {
                const node = current[part];
                callback(node, current);
                return node;
            } else {
                current = current[part];
            }
        }
        return undefined;
    }

    /**
     * 从监听器节点中移除指定的事件监听器
     */
    private _removeListener(node: FastEventListenerNode, path: string[], listener: Function): void {
        if (!listener) return;
        removeItem(node.__listeners, (item: any) => {
            item = Array.isArray(item) ? item[0] : item;
            const isRemove = item === listener;
            if (isRemove) this.listenerCount--;
            return isRemove;
        });
    }

    /**
     * 注册事件监听器
     * @param type - 事件类型，支持普通字符串、通配符（user/*）、全局监听（**）
     * @param listener - 事件监听器函数
     * @param options - 监听器配置（count / tag / flags）
     * @returns 订阅者对象，包含 off 方法用于取消监听
     */
    public on<T extends string = KeyOf<Events> | "**">(
        type: T,
        listener: FastEventCommonListener<
            T extends IsTransformedEvent<AllEvents, T>
                ? PickPayload<ValueOf<GetClosestEvents<Events, T>>>
                : T extends "**"
                  ? MutableMessage<Events>
                  : GetClosestMessage<Events, T, any>,
            any,
            any
        >,
        options?: FastLiteListenOptions,
    ): FastEventSubscriber {
        if (type.length === 0) throw new Error("event cannot be empty");
        const finalOptions = Object.assign(
            { count: 0, flags: 0 },
            options,
        ) as Required<FastLiteListenOptions> & { count: number; flags: number };

        const parts = type.split(this._delimiter);
        const [node, index] = this._addListener(parts, listener as any, finalOptions);
        const off = () => node && this._removeListener(node, parts, listener as any);

        // 触发监听器保留消息（retain）
        this._emitRetainMessage(type, node, index);

        return {
            off,
            listener: listener as any,
            [Symbol.dispose]() {
                off();
            },
        };
    }

    /**
     * 注册一次性事件监听器（触发一次后自动注销）
     */
    public once<T extends string = KeyOf<Events> | "**">(
        type: T,
        listener: FastEventCommonListener<
            T extends IsTransformedEvent<AllEvents, T>
                ? PickPayload<ValueOf<GetClosestEvents<Events, T>>>
                : T extends "**"
                  ? MutableMessage<Events>
                  : GetClosestMessage<Events, T, any>,
            any,
            any
        >,
        options?: FastLiteListenOptions,
    ): FastEventSubscriber {
        return this.on(type, listener, Object.assign({}, options, { count: 1 }));
    }

    /**
     * 注册一个监听所有事件的监听器（等同 on('**', listener)）
     */
    public onAny(
        listener: FastEventCommonListener<MutableMessage<AllEvents, any>, any, any>,
        options?: FastLiteListenOptions,
    ): FastEventSubscriber {
        return this.on("**", listener as any, options as any) as FastEventSubscriber;
    }

    /**
     * 移除事件监听器
     */
    off(listener: Function): void;
    off(type: string, listener: Function): void;
    off(type: Types): void;
    off(type: string): void;
    off() {
        const args = arguments;
        const type = isFunction(args[0]) ? undefined : args[0];
        const listener = isFunction(args[0]) ? args[0] : args[1];
        const parts = type ? type.split(this._delimiter) : [];
        const hasWildcard = type ? type.includes("*") : false;
        if (type && !hasWildcard) {
            this._traverseToPath(this.listeners, parts, (node) => {
                if (listener) {
                    this._removeListener(node, parts, listener);
                } else if (type) {
                    node.__listeners = [];
                }
            });
        } else {
            const entryParts: string[] = hasWildcard ? [] : parts;
            this._traverseListeners(this.listeners, entryParts, (path, node) => {
                if (listener !== undefined || (hasWildcard && isPathMatched(path, parts))) {
                    if (listener) {
                        this._removeListener(node, parts, listener);
                    } else {
                        node.__listeners = [];
                    }
                }
            });
        }
    }

    /**
     * 移除所有事件监听器
     * @param entry - 可选的事件前缀，提供则只移除该前缀下的监听器
     */
    offAll(entry?: string) {
        if (entry) {
            const parts = entry.split(this._delimiter);
            let count = 0;
            this._traverseListeners(this.listeners, parts, (_path, node) => {
                count += node.__listeners.length;
                node.__listeners = [];
            });
            this.listenerCount -= count;
            this._removeRetainedEvents(entry);
        } else {
            let count = 0;
            this._traverseListeners(this.listeners, [], (_path, node) => {
                count += node.__listeners.length;
            });
            this.listenerCount -= count;
            this.retainedMessages.clear();
            this.listeners = { __listeners: [] } as unknown as FastListeners;
        }
    }

    /**
     * 移除保留的事件
     */
    private _removeRetainedEvents(prefix?: string) {
        if (!prefix) this.retainedMessages.clear();
        if (prefix?.endsWith(this._delimiter)) {
            prefix += this._delimiter;
        }
        this.retainedMessages.delete(prefix!);
        for (let key of this.retainedMessages.keys()) {
            if (key.startsWith(prefix!)) {
                this.retainedMessages.delete(key);
            }
        }
    }

    /**
     * 清除所有事件或指定前缀的事件（含保留消息）
     */
    clear(prefix?: string) {
        this.offAll(prefix);
        this._removeRetainedEvents(prefix);
    }

    /**
     * 发送最后一次事件的消息给对应的监听器（用于 retain）
     */
    private _emitRetainMessage(
        type: string,
        listenerNode: FastEventListenerNode | undefined,
        index: number,
    ) {
        let messages = [] as TypedFastEventMessage[];
        if (type.includes("*")) {
            const patterns = type.split(this._delimiter);
            this.retainedMessages.forEach((message, t) => {
                const parts = t.split(this._delimiter);
                if (isPathMatched(parts, patterns)) {
                    messages.push(message);
                }
            });
        } else if (this.retainedMessages.has(type)) {
            messages.push(this.retainedMessages.get(type));
        }
        if (listenerNode) {
            messages.forEach((message) => {
                this._executeListeners([listenerNode], message, {}, (listenerMeta) => {
                    return listenerMeta[0] === listenerNode.__listeners[index][0];
                });
            });
        }
    }

    /**
     * 遍历监听器节点树，支持三种匹配模式：精确 / 单层通配 * / 多层通配 **
     */
    private _traverseToPath(
        node: FastEventListenerNode,
        parts: string[],
        callback: (node: FastEventListenerNode) => void,
        index: number = 0,
        lastFollowing?: boolean,
    ): void {
        if (index >= parts.length) {
            callback(node);
            return;
        }
        const part = parts[index];
        if (lastFollowing === true) {
            this._traverseToPath(node, parts, callback, index + 1, true);
            return;
        }
        if ("*" in node) {
            this._traverseToPath(node["*"], parts, callback, index + 1);
        }
        if ("**" in node) {
            this._traverseToPath(node["**"], parts, callback, index + 1, true);
        }
        if (part in node) {
            this._traverseToPath(node[part], parts, callback, index + 1);
        }
    }

    private _traverseListeners(
        node: FastEventListenerNode,
        entry: string[],
        callback: (path: string[], node: FastEventListenerNode) => void,
    ): void {
        let entryNode: FastEventListenerNode = node;
        if (entry && entry.length > 0) {
            this._traverseToPath(node, entry, (n) => {
                entryNode = n;
            });
        }
        const traverseNodes = (
            node: FastEventListenerNode,
            callback: (path: string[], node: FastEventListenerNode) => void,
            parentPath: string[],
        ) => {
            callback(parentPath, node);
            for (let [key, childNode] of Object.entries(node)) {
                if (key.startsWith("__")) continue;
                if (childNode) {
                    traverseNodes(childNode as FastEventListenerNode, callback, [
                        ...parentPath,
                        key,
                    ]);
                }
            }
        };
        traverseNodes(entryNode, callback, []);
    }

    /**
     * 监听器执行出错处理（移除了 ListenerError hook）
     */
    private _onListenerError(
        listener: Function,
        message: TypedFastEventMessage,
        _args: FastLiteListenerArgs | undefined,
        e: any,
    ) {
        if (e instanceof Error) {
            // @ts-ignore
            e._emitter = `${listener.name || "anonymous"}:${message.type}`;
        }
        if (this._options.ignoreErrors) {
            return e;
        } else {
            throw e;
        }
    }

    /**
     * 执行单个监听器函数（移除了 debug / abortSignal 分支，this 指向实例）
     */
    private _executeListener(
        listener: FastEventListenerMeta,
        message: TypedFastEventMessage,
        args: FastLiteListenerArgs | undefined,
        catchErrors: boolean = false,
    ): Promise<any> | any {
        const listenerFn = listener[0];
        try {
            const isTransformed = ((args?.flags || 0) & FastEventListenerFlags.Transformed) > 0;
            let result = listenerFn.call(this, isTransformed ? message.payload : message, args!);
            // 自动处理 reject Promise
            if (catchErrors && result && result instanceof Promise) {
                result = tryReturnError(result, (e) =>
                    this._onListenerError(listenerFn, message, args, e),
                );
            }
            return result;
        } catch (e: any) {
            return this._onListenerError(listenerFn, message, args, e);
        }
    }

    /**
     * 执行监听器节点列表中的所有监听器（移除了 executor，退化为同步顺序执行）
     */
    private _executeListeners(
        nodes: FastEventListenerNode[],
        message: TypedFastEventMessage,
        args: FastLiteListenerArgs,
        filter?: (listener: FastEventListenerMeta, node: FastEventListenerNode) => boolean,
    ): any[] {
        if (!nodes || nodes.length === 0) return [];
        // A3 三遍合一：原"收集 → _decListenerExecCount(计数+splice) → map 执行"
        // 合并为"收集含计数 → 倒序 splice → 执行"，省一遍全量遍历与临时元组分配。
        // 计数仍严格先于执行，保留"避免监听器内再次触发导致重复执行"的语义。
        const metas: FastEventListenerMeta[] = [];
        const toRemove: [FastEventListenerMeta[], number][] = [];
        for (const node of nodes) {
            // localIdx 必须等于 listener 在 __listeners 中的真实数组下标，
            // 因此 i 对每个 listener 都递增（含被 filter 跳过的），不能只在命中时递增
            const arr = node.__listeners as unknown as FastEventListenerMeta[];
            let i = 0;
            for (const meta of arr) {
                if (!filter || filter(meta, node)) {
                    meta[2]++; // 实际执行次数
                    metas.push(meta);
                    // count > 0 时代表执行次数限制：达标则标记移除
                    if (meta[1] > 0 && meta[1] <= meta[2]) {
                        toRemove.push([arr, i]);
                        this.listenerCount--; // 同步递减，与 off/offAll 路径一致
                    }
                }
                i++;
            }
        }
        // 倒序 splice：toRemove 收集顺序为升序，倒序遍历使同节点内 idx 降序，避免删元素错位
        for (let i = toRemove.length - 1; i >= 0; i--) {
            toRemove[i][0].splice(toRemove[i][1], 1);
        }
        // 执行
        const results: any[] = [];
        for (let i = 0; i < metas.length; i++) {
            results.push(this._executeListener(metas[i], message, args, true));
        }
        return results;
    }

    /**
     * 同步触发事件
     *
     * 支持两种调用方式：
     *   emit(type, payload, retain?)
     *   emit({ type, payload }, retain?)
     */
    public emit<R = any, T extends Types = Types>(
        type: T,
        payload?: UnTransformedEvents<AllEvents>[T],
        retain?: boolean,
    ): R[];
    public emit<R = any, T extends string = string>(
        type: ReplaceWildcard<T> | Types,
        payload?: InMatchedEvent<Events, T> extends true
            ? GetPayload<UnTransformedEvents<AllEvents>, T>
            : any,
        retain?: boolean,
    ): R[];
    public emit<R = any, T extends KeyOf<AllEvents> = KeyOf<AllEvents>>(
        message: FastEventEmitMessage<T, UnTransformedEvents<AllEvents>[T], any>,
        retain?: boolean,
    ): R[];
    public emit<R = any>(message: MutableMessage<AllEvents, any>, retain?: boolean): R[];
    public emit<R = any>(message: { type: keyof AllEvents }, retain?: boolean): R[];
    public emit<R = any>(message: FastEventMessage, retain?: boolean): R[];
    public emit(): any {
        const [message, args] = parseLiteEmitArgs(arguments);
        const type = message.type;
        const delimiter = this._delimiter;
        const root = this.listeners;

        if (args.retain) {
            this.retainedMessages.set(type, message);
        }

        const results: any[] = [];
        const normalNodes: FastEventListenerNode[] = [];
        // A1 单段快路径:type 不含分隔符时跳过 split + _traverseToPath 递归,
        // 直接查 root 的 * / ** / type 三子节点(顺序与 _traverseToPath 一致:先通配后精确)
        const singleSegment = type.indexOf(delimiter) === -1;
        if (singleSegment) {
            if ("*" in root) normalNodes.push(root["*"]);
            if ("**" in root) normalNodes.push(root["**"]);
            if (type in root) normalNodes.push(root[type]);
        } else {
            const parts = type.split(delimiter);
            this._traverseToPath(root, parts, (node) => {
                normalNodes.push(node);
            });
        }

        // A2 transform 内联:消除原 applyTransform 闭包每次重建 + isFunction 检查。
        // 不突变输入 message——返回新对象,保护正常匹配监听器与各后代互不污染。
        const transformFn = this._transform;
        let normalMsg = message;
        let normalArgs = args;
        if (transformFn) {
            const transformed = transformFn.call(this, message);
            if (transformed !== message) {
                normalMsg = { ...message, payload: transformed } as TypedFastEventMessage;
                normalArgs = {
                    ...args,
                    rawEventType: message.type,
                    flags: (args.flags || 0) | FastEventListenerFlags.Transformed,
                };
            }
        }
        results.push(...this._executeListeners(normalNodes, normalMsg, normalArgs));

        // 展开 expandable 结果(A4:用缓存标志,省每次属性链读取)
        if (this._expandResults) {
            expandEmitResults(results);
        }
        return results;
    }

    /**
     * 异步触发事件（使用 Promise.allSettled，等待所有异步监听器完成）
     */
    public async emitAsync<R = any, T extends Types = Types>(
        type: T,
        payload?: UnTransformedEvents<AllEvents>[T],
        retain?: boolean,
    ): Promise<(R | Error)[]>;

    public async emitAsync<R = any, T extends string = string>(
        type: ReplaceWildcard<T> | Types,
        payload?: InMatchedEvent<Events, T> extends true
            ? GetPayload<UnTransformedEvents<AllEvents>, T>
            : any,
        retain?: boolean,
    ): Promise<(R | Error)[]>;
    public async emitAsync<R = any, T extends KeyOf<AllEvents> = KeyOf<AllEvents>>(
        message: FastEventEmitMessage<T, UnTransformedEvents<AllEvents>[T], any>,
        retain?: boolean,
    ): Promise<(R | Error)[]>;
    public async emitAsync<R = any>(
        message: MutableMessage<AllEvents, any>,
        retain?: boolean,
    ): Promise<(R | Error)[]>;
    public async emitAsync<R = any>(
        message: { type: keyof AllEvents },
        retain?: boolean,
    ): Promise<(R | Error)[]>;
    public async emitAsync<R = any>(): Promise<(R | Error)[]> {
        const results = await Promise.allSettled(this.emit.apply(this, arguments as any));
        return getPromiseResults(results);
    }
}
