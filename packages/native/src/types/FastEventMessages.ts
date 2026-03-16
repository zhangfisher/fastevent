/**
 * 事件消息相关
 */
import { DeepPartial } from "./utils/DeepPartial";
import { OptionalKeys } from "./utils/OptionalKeys";
import { ReplaceWildcard } from "./wildcards/ReplaceWildcard";

// 用来扩展全局Meta类型

export interface FastEventMeta {}
export interface FastEventMessageExtends {}

export type FastEventMessage<
    T extends string = string,
    P = any,
    M extends Record<string, any> = Record<string, any>,
> = {
    type: T;
    payload: P;
    meta?: FastEventMeta & M & Record<string, any>;
} & FastEventMessageExtends;

/**
 * 用于emit方法，允许meta可选，更加宽泛
 */
export type FastEventEmitMessage<
    T extends string = string,
    P = any,
    M extends Record<string, any> = Record<string, any>,
> = OptionalKeys<FastEventMessage<T, P, M>, "meta">;

export type WildcardStyle =
    | `*`
    | `**`
    | `${string}/*`
    | `*/${string}`
    | `${string}/*/${string}`
    | `${string}/**`;

export type TypedFastEventMessage<
    Events extends Record<string, any> = Record<string, any>,
    M = any,
> = ({
    [K in keyof Events as K extends WildcardStyle ? ReplaceWildcard<K> : never]: {
        type: ReplaceWildcard<K>;
        payload: Events[K];
        meta?: Partial<FastEventMeta & M> & Record<string, any>;
    };
} & {
    [K in keyof Events as K extends WildcardStyle ? never : K]: {
        type: Exclude<K, number | symbol>;
        payload: Events[K];
        meta?: Partial<FastEventMeta> & M & Record<string, any>;
    };
})[Exclude<keyof Events, number | symbol>] &
    FastEventMessageExtends;

// 用于构建消息时使用，meta是可选的

export type TypedFastEventMessageOptional<
    Events extends Record<string, any> = Record<string, any>,
    M = any,
> = {
    [K in keyof Events]: {
        type: Exclude<K, number | symbol>;
        payload: Events[K];
        meta?: DeepPartial<FastEventMeta & M & Record<string, any>>;
    };
}[Exclude<keyof Events, number | symbol>] &
    FastEventMessageExtends;
// 用于emit方法使用

export type FastMessagePayload<P = any> = {
    type: P;
    __IS_FAST_MESSAGE__: true;
};
/**
 * 通用事件消息类型
 * @description 根据 Events 类型生成联合类型，每个成员包含 type 和 payload 字段
 *
 * @example
 * type Events = {
 *     userCreated: { id: number; name: string };
 *     userDeleted: number;
 *     statusChanged: 'active' | 'inactive';
 * };
 *
 * type Message = FastEventCommonMessage<Events>;
 * // 等价于:
 * // type Message = {
 * //     type: 'userCreated';
 * //     payload: { id: number; name: string };
 * // } | {
 * //     type: 'userDeleted';
 * //     payload: number;
 * // } | {
 * //     type: 'statusChanged';
 * //     payload: 'active' | 'inactive';
 * // }
 */

export type FastEventCommonMessage<Events extends Record<string, any>> = {
    [K in keyof Events]: {
        type: Exclude<K, number | symbol>;
        payload: Events[K];
    };
}[Exclude<keyof Events, number | symbol>];
// /**
//  * 支持通配符的通用事件消息类型
//  * @description 创建一个消息类型，type 可以是任意字符串，payload 类型根据 type 匹配的通配符模式自动推导
//  */

// export type FastEventWildcardMessage<Events extends Record<string, any>, T extends string> = {
//     type: T;
//     payload: PickPayload<ValueOf<GetMatchedEvents<Events, T>>>;
// };

/**
 * 声明事件类型时，一般情况下，K=事件名称，V=事件Payload参数类型
 *
 * AssertFastMessage用于声明V是一个FastMessage类型，而不是Payload类型
 *
 * 一般配合transform参数使用
 *
 * 例如：
 * type CustomEvents = {
       click: NotPayload<{ x: number; y: number }>;
       <事件名称,即type>:<事件负载，即payload>
    }
    常规情况下，事件的K=事件名称，V=事件Payload参数类型

    但是如我们使用了transform对事件进行了转换时，此时接收到的消息可能就不是标准事件消息{type,payload}

    此时可以使用NotPayload或AssertFastMessage类型声明

    const emitter = new FastEvent<CustomEvents>();
    emitter.on('click', (message) => {
        // 因为上面的click事件中使用了NotPayload类型
        // typeof message === { x: number; y: number }
    })
    const emitter = new FastEvent<CustomEvents>({
        transform:(message)=>{
            if(message.type === 'click'){
                return message.payload
            }else{
                return message
            }
        }
    });
    emitter.on('click', (message) => {
        // typeof message === { x: number; y: number }
    }
 */

export type AssertFastMessage<M> = {
    type: M;
    __IS_FAST_MESSAGE__: true;
};

// type Events = {
//     a: boolean;
//     b: number;
//     c: string;
//     "div/*/click": { x: number; y: number };
//     "users/*/login": string;
//     "users/*/logout": number;
//     "users/*/*": { name: string; vip: boolean };
//     "*": { data: any };
//     "**": Record<string, any>;
// };

// type GetIncludeNoWidcardEvents<Events extends Record<string, any>, M = any> = {
//     [K in keyof Events as K extends WildcardStyle ? never : K]: {
//         type: ReplaceWildcard<K>;
//         payload: Events[K];
//         meta?: Partial<FastEventMeta> & M & Record<string, any>;
//     };
// };
// type NEvents = GetIncludeNoWidcardEvents<Events>;
// type NEvents2 = GetIncludeNoWidcardEvents<Record<"**", 1>>;
