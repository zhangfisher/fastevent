/* eslint-disable no-unused-vars */

import { describe, test, expect } from "bun:test";
import type { Equal, Expect } from "@type-challenges/utils";
import { FastEvent } from "../../event";
import { FastEventMessage, FastEventMeta } from "../../types/FastEventMessages";
import { FastEventListener, TypedFastEventListener } from "../../types/FastEventListeners";
import { ExtendWildcardEvents } from "../../types/wildcards/ExtendWildcardEvents";

describe("types", () => {
    test("未定义事件类型时就支持任意事件", () => {
        const emitter = new FastEvent();
        emitter.on("test", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "test">>,
                Expect<Equal<typeof message.payload, any>>,
            ];
        });
    });

    test("消息类型约束", () => {
        type CustomEvents = {
            click: { x: number; y: number };
            mousemove: boolean;
            scroll: number;
            focus: string;
        };
        const emitter = new FastEvent<CustomEvents>();

        // 构建类型推断和约束的消息
        type MessageType = typeof emitter.types.message;

        const typedMessage: MessageType = {
            type: "click",
            payload: {
                x: 100,
                y: 100,
            },
        };

        emitter.emit({
            type: "click",
            payload: {
                x: 100,
                y: 100,
            },
        });

        // 构建通用的消息
        const message: MessageType = {
            type: "click",
            payload: { x: 1, y: 2 },
        };
        emitter.emit(message);

        emitter.on("click", (message) => {});
    });
    test("消息类型约束2", () => {
        const emitter = new FastEvent();

        // 构建类型推断和约束的消息
        type MessageType = typeof emitter.types.message;

        const typedMessage: MessageType = {
            type: "click",
            payload: {
                x: 100,
                y: 100,
            },
        };

        emitter.emit({
            type: "click",
            payload: {
                x: 100,
                y: 100,
            },
        });

        // 构建通用的消息
        const message: FastEventMessage<string> = {
            type: "click",
            payload: "100",
        };
        emitter.emit(message);

        emitter.on("click", (message) => {});
    });
    // test('所有监听器类型', () => {
    //     type CustomMeta = { x: number; y: number; z?: number };
    //     type CustomEvents = {
    //         click: { x: number; y: number };
    //         mousemove: boolean;
    //         scroll: number;
    //         focus: string;
    //     };
    //     type CustomContext = {
    //         name: string;
    //         age: number;
    //         address: string;
    //     };
    //     const emitter = new FastEvent<CustomEvents, CustomMeta, CustomContext>({
    //         context: {
    //             name: 'hello',
    //             age: 18,
    //             address: 'beijing',
    //         },
    //     });

    //     type ListenerTypes = typeof emitter.types.listeners;

    //     type cases = [
    //         Expect<
    //             Equal<
    //                 ListenerTypes['click'],
    //                 TypedFastEventListener<
    //                     'click',
    //                     {
    //                         x: number;
    //                         y: number;
    //                     },
    //                     {
    //                         [x: string]: any;
    //                         x: number;
    //                         y: number;
    //                         z?: number | undefined;
    //                     },
    //                     any
    //                 >
    //             >
    //         >,
    //     ];
    // });

    test("通用监听器类型传递", () => {
        const emitter = new FastEvent();
        type MyListener<
            T extends string = string,
            P = any,
            M extends Record<string, any> = Record<string, any>,
        > = FastEventListener<T, P, M>;
        const listener: MyListener = (message) => {
            console.log(message);
        };
        emitter.on("xxx", listener);
    });
    test("自定义事件类型和元数据类型", () => {
        type CustomMeta = { x: number; y: number; z?: number };
        type CustomEvents = {
            click: { x: number; y: number };
            mousemove: boolean;
            scroll: number;
            focus: string;
        };
        type CustomContext = {
            name: string;
            age: number;
            address: string;
        };
        const emitter = new FastEvent<CustomEvents, CustomMeta, CustomContext>({
            context: {
                name: "hello",
                age: 18,
                address: "beijing",
            },
        });
        type Meta = Expand<Record<string, any> & FastEventMeta & CustomMeta>;
        type fff = ExtendWildcardEvents<{
            click: {
                x: number;
                y: number;
            };
            mousemove: boolean;
            scroll: number;
            focus: string;
        }>;
        type cases = [
            Expect<Equal<typeof emitter.types.events, CustomEvents>>,
            Expect<
                Equal<
                    typeof emitter.types.meta,
                    {
                        [x: string]: any;
                        x: number;
                        y: number;
                        z?: number | undefined;
                    }
                >
            >,
            Expect<Equal<typeof emitter.types.context, CustomContext>>,
        ];
    });
});

// class A{
//     types = null as unknown as {
//         a:boolean
//     }
// }

// class AA extends A{
//      declare types: Expand<{
//         b: boolean
//     } & A['types']>
// }

// const aa= new AA()
// aa.types
