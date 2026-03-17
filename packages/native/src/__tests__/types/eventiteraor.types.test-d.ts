/* eslint-disable no-unused-vars */
import { describe, test, expect } from "bun:test";
import type { Equal, Expect } from "@type-challenges/utils";
import { FastEvent } from "../../event";
import { GetClosestEvents, WildcardKeys } from "../../types";
import { PickTransformedEvents } from "../../types/transformed/PickTransformedEvents";
import { PickPayload } from "../../types/transformed/PickPayload";
import { NotPayload } from "../../types/transformed/NotPayload";
import { ValueOf } from "../../types/utils/ValueOf";
import { FastEventIterator } from "../../eventIterator";

// 辅助类型：提取 FastEventIterator 的消息类型
type IteratorMessage<T> = T extends FastEventIterator<infer M> ? M : never;

describe("FastEvent 使用异步迭代器监听事件类型系统测试", () => {
    // 定义测试用的事件类型
    interface CustomEvents {
        a: boolean;
        b: number;
        c: string;
        "x/y/z/a": 1;
        "x/y/z/b": 2;
        "x/y/z/c": 3;
    }

    interface WildcardEvents {
        "users/*/online": { name: string; status?: number };
        "users/*/offline": boolean;
        "users/*/*": string;
        "posts/*/view": number;
        "posts/*/comment": string;
        "posts/**": { title: string; views: number };
        "devices/*/status": "online" | "offline";
        "devices/**": number;
        "*": string; // 全局通配符
        "**": any; // 双星通配符
    }
    interface TransformedCustomEvents {
        a: NotPayload<boolean>;
        b: NotPayload<number>;
        c: NotPayload<string>;
        "x/y/z/a": NotPayload<1>;
        "x/y/z/b": NotPayload<2>;
        "x/y/z/c": NotPayload<3>;
    }
    interface TransformedWildcardEvents {
        "users/*/online": NotPayload<{ name: string; status?: number }>;
        "users/*/offline": NotPayload<boolean>;
        "users/*/*": NotPayload<string>;
        "posts/*/view": NotPayload<number>;
        "posts/*/comment": NotPayload<string>;
        "posts/**": NotPayload<{ title: string; views: number }>;
        "devices/*/status": NotPayload<"online" | "offline">;
        "devices/**": NotPayload<number>;
        "*": NotPayload<string>; // 全局通配符
    }

    describe("FastEvent - 不含通配符事件", () => {
        test("基本事件类型的异步迭代器消息类型", () => {
            const emitter = new FastEvent<CustomEvents>({
                meta: {
                    x: 1,
                    y: true,
                },
            });

            const messages = emitter.on("a");
            type MessageType = IteratorMessage<typeof messages>;
            type cases = [
                Expect<Equal<MessageType["type"], "a">>,
                Expect<Equal<MessageType["payload"], boolean>>,
            ];
        });

        test("多层级路径事件的异步迭代器消息类型", () => {
            const emitter = new FastEvent<CustomEvents>();

            const messages = emitter.on("x/y/z/a");
            type MessageType = IteratorMessage<typeof messages>;
            type cases = [
                Expect<Equal<MessageType["type"], "x/y/z/a">>,
                Expect<Equal<MessageType["payload"], 1>>,
            ];
        });

        test("不同事件类型的异步迭代器返回不同payload类型", () => {
            const emitter = new FastEvent<CustomEvents>();

            const aMessages = emitter.on("a");
            const bMessages = emitter.on("b");
            const cMessages = emitter.on("c");

            type AMessageType = IteratorMessage<typeof aMessages>;
            type BMessageType = IteratorMessage<typeof bMessages>;
            type CMessageType = IteratorMessage<typeof cMessages>;

            type aCases = [
                Expect<Equal<AMessageType["type"], "a">>,
                Expect<Equal<AMessageType["payload"], boolean>>,
            ];

            type bCases = [
                Expect<Equal<BMessageType["type"], "b">>,
                Expect<Equal<BMessageType["payload"], number>>,
            ];

            type cCases = [
                Expect<Equal<CMessageType["type"], "c">>,
                Expect<Equal<CMessageType["payload"], string>>,
            ];
        });
    });
    describe("FastEvent - 启用事件转换", () => {
        test("基本事件类型的异步迭代器消息类型", () => {
            const emitter = new FastEvent<TransformedCustomEvents>({
                meta: {
                    x: 1,
                    y: true,
                },
            });

            const messages = emitter.on("a");
            type d = PickTransformedEvents<TransformedCustomEvents>;
            type MessageType = IteratorMessage<typeof messages>;
            type cases = [Expect<Equal<MessageType, boolean>>];
        });

        test("多层级路径事件的异步迭代器消息类型", () => {
            const emitter = new FastEvent<TransformedCustomEvents>();

            const messages = emitter.on("x/y/z/a");
            type MessageType = IteratorMessage<typeof messages>;
            type cases = [Expect<Equal<MessageType, 1>>];
        });

        test("不同事件类型的异步迭代器返回不同payload类型", () => {
            const emitter = new FastEvent<TransformedCustomEvents>();

            const aMessages = emitter.on("a");
            const bMessages = emitter.on("b");
            const cMessages = emitter.on("c");

            type AMessageType = IteratorMessage<typeof aMessages>;
            type BMessageType = IteratorMessage<typeof bMessages>;
            type CMessageType = IteratorMessage<typeof cMessages>;

            type aCases = [Expect<Equal<AMessageType, boolean>>];
            type bCases = [Expect<Equal<BMessageType, number>>];
            type cCases = [Expect<Equal<CMessageType, string>>];
        });
        test("单星通配符(*)事件的异步迭代器消息类型", () => {
            const emitter = new FastEvent<TransformedWildcardEvents>();
            emitter.on("");
            const messages = emitter.on("users/*/online");
            type MessageType = IteratorMessage<typeof messages>;
            type cases = [Expect<Equal<MessageType, { name: string; status?: number }>>];
        });

        test("双星通配符(**)事件的异步迭代器消息类型", () => {
            const emitter = new FastEvent<TransformedWildcardEvents>();
            emitter.on("");
            // "posts/**": NotPayload<{ title: string; views: number }>;
            const messages = emitter.on("posts/x/y/z");
            type MessageType = IteratorMessage<typeof messages>;
            type cases = [Expect<Equal<MessageType, { title: string; views: number }>>];
        });

        test("全局单星通配符(*)事件的异步迭代器消息类型", () => {
            const emitter = new FastEvent<TransformedWildcardEvents>();

            const messages = emitter.on("*");
            type MessageType = IteratorMessage<typeof messages>;
            type cases = [Expect<Equal<MessageType, string>>];
        });

        test("全局双星通配符(**)事件的异步迭代器消息类型", async () => {
            const emitter = new FastEvent<TransformedWildcardEvents>();

            const messages = emitter.on("**");
            type MessageType = IteratorMessage<typeof messages>;
            type cases = [
                Expect<
                    Equal<
                        MessageType,
                        | string
                        | number
                        | boolean
                        | {
                              name: string;
                              status?: number;
                          }
                        | {
                              title: string;
                              views: number;
                          }
                    >
                >,
            ];
        });
        test("全局双星通配符(**)事件的异步迭代器消息类型", async () => {
            const emitter = new FastEvent<CustomEvents>();

            const messages = emitter.on("**");
            type Message = IteratorMessage<typeof messages>;
            type MessageType = Message["type"];
            type cases = [
                Expect<Equal<MessageType, "a" | "b" | "c" | "x/y/z/a" | "x/y/z/b" | "x/y/z/c">>,
            ];
        });
        test("多层级通配符事件的异步迭代器消息类型", () => {
            const emitter = new FastEvent<TransformedWildcardEvents>();
            emitter.on("");
            const messages = emitter.on("users/a/b");
            type MessageType = IteratorMessage<typeof messages>;
            type cases = [Expect<Equal<MessageType, string>>];
        });
    });

    // describe('FastEventScope - 不含通配符事件', () => {
    //     test('Scope基本事件类型的异步迭代器消息类型', () => {
    //         const emitter = new FastEvent<CustomEvents>({
    //             meta: {
    //                 x: 1,
    //                 y: true,
    //             },
    //         });

    //         const scope = emitter.scope('x/y/z');
    //         const messages = scope.on('a');
    //         type MessageType = IteratorMessage<typeof messages>;
    //         type cases = [
    //             Expect<Equal<MessageType['type'], 'a'>>,
    //             Expect<Equal<MessageType['payload'], 1>>,
    //             Expect<Equal<MessageType['meta']['x'], number | undefined>>,
    //             Expect<Equal<MessageType['meta']['y'], boolean | undefined>>,
    //             Expect<Equal<MessageType['meta']['scope'], string>>,
    //         ];
    //     });

    //     test('Scope不同事件类型的异步迭代器返回不同payload类型', () => {
    //         const emitter = new FastEvent<CustomEvents>();
    //         const scope = emitter.scope('x/y/z');

    //         const aMessages = scope.on('a');
    //         const bMessages = scope.on('b');
    //         const cMessages = scope.on('c');

    //         type AMessageType = IteratorMessage<typeof aMessages>;
    //         type BMessageType = IteratorMessage<typeof bMessages>;
    //         type CMessageType = IteratorMessage<typeof cMessages>;

    //         type aCases = [
    //             Expect<Equal<AMessageType['type'], 'a'>>,
    //             Expect<Equal<AMessageType['payload'], 1>>,
    //         ];

    //         type bCases = [
    //             Expect<Equal<BMessageType['type'], 'b'>>,
    //             Expect<Equal<BMessageType['payload'], 2>>,
    //         ];

    //         type cCases = [
    //             Expect<Equal<CMessageType['type'], 'c'>>,
    //             Expect<Equal<CMessageType['payload'], 3>>,
    //         ];
    //     });

    //     test('Scope继承emitter的meta并添加scope meta', () => {
    //         const emitter = new FastEvent<CustomEvents>({
    //             meta: {
    //                 x: 100,
    //                 y: false,
    //             },
    //         });

    //         const scope = emitter.scope('x/y/z');
    //         const messages = scope.on('a');

    //         type MessageType = IteratorMessage<typeof messages>;
    //         // scope的meta应该包含FastEventMeta、FastEventScopeMeta以及Record<string, any>
    //         type cases = [
    //             Expect<Equal<MessageType['type'], 'a'>>,
    //             Expect<Equal<MessageType['payload'], 1>>,
    //             Expect<Equal<MessageType['meta']['x'], number | undefined>>,
    //             Expect<Equal<MessageType['meta']['y'], boolean | undefined>>,
    //             Expect<Equal<MessageType['meta']['scope'], string>>,
    //         ];
    //     });
    // });

    // describe('FastEventScope - 含通配符事件', () => {
    //     test('Scope单星通配符(*)事件的异步迭代器消息类型', () => {
    //         const emitter = new FastEvent<WildcardEvents>();
    //         const scope = emitter.scope('');

    //         const messages = scope.on('users/*/online');
    //         type MessageType = IteratorMessage<typeof messages>;
    //         type cases = [
    //             Expect<Equal<MessageType['type'], 'users/*/online'>>,
    //             Expect<Equal<MessageType['payload'], { name: string; status?: number }>>,
    //         ];
    //     });

    //     test('Scope双星通配符(**)事件的异步迭代器消息类型', () => {
    //         const emitter = new FastEvent<WildcardEvents>();
    //         const scope = emitter.scope('');

    //         const messages = scope.on('posts/**');
    //         type MessageType = IteratorMessage<typeof messages>;
    //         type cases = [
    //             Expect<Equal<MessageType['type'], 'posts/**'>>,
    //             Expect<Equal<MessageType['payload'], { title: string; views: number }>>,
    //         ];
    //     });

    //     test('Scope带前缀的单星通配符事件', () => {
    //         const emitter = new FastEvent<WildcardEvents>();
    //         const scope = emitter.scope('users');

    //         const messages = scope.on('*/online');
    //         type MessageType = IteratorMessage<typeof messages>;
    //         type cases = [
    //             Expect<Equal<MessageType['type'], '*/online'>>,
    //             Expect<Equal<MessageType['payload'], { name: string; status?: number }>>,
    //         ];
    //     });

    //     test('Scope带前缀的双星通配符事件', () => {
    //         const emitter = new FastEvent<WildcardEvents>();
    //         const scope = emitter.scope('devices');

    //         const messages = scope.on('**');
    //         type MessageType = IteratorMessage<typeof messages>;
    //         type cases = [
    //             Expect<Equal<MessageType['type'], '**'>>,
    //             Expect<Equal<MessageType['payload'], number>>,
    //         ];
    //     });

    //     test('Scope多层级通配符事件的异步迭代器消息类型', () => {
    //         const emitter = new FastEvent<WildcardEvents>();
    //         const scope = emitter.scope('');

    //         const messages = scope.on('users/*/*');
    //         type MessageType = IteratorMessage<typeof messages>;
    //         type cases = [
    //             Expect<Equal<MessageType['type'], 'users/*/*'>>,
    //             Expect<Equal<MessageType['payload'], string>>,
    //         ];
    //     });

    //     test('Scope全局单星通配符(*)事件的异步迭代器消息类型', () => {
    //         const emitter = new FastEvent<WildcardEvents>();
    //         const scope = emitter.scope('');

    //         const messages = scope.on('*');
    //         type MessageType = IteratorMessage<typeof messages>;
    //         type cases = [
    //             Expect<Equal<MessageType['type'], '*'>>,
    //             Expect<Equal<MessageType['payload'], string>>,
    //         ];
    //     });

    //     test('Scope全局双星通配符(**)事件的异步迭代器消息类型', () => {
    //         const emitter = new FastEvent<WildcardEvents>();
    //         const scope = emitter.scope('');

    //         const messages = scope.on('**');
    //         type MessageType = IteratorMessage<typeof messages>;
    //         type cases = [
    //             Expect<Equal<MessageType['type'], '**'>>,
    //             Expect<Equal<MessageType['payload'], any>>,
    //         ];
    //     });
    // });

    // describe('嵌套Scope - 异步迭代器类型测试', () => {
    //     interface NestedEvents {
    //         'app/modules/*/users/login': { username: string; timestamp: number };
    //         'app/modules/*/users/logout': { username: string };
    //         'app/modules/*/posts/**': { postId: string };
    //         'app/modules/*/settings': Record<string, any>;
    //     }

    //     test('一级Scope异步迭代器类型', () => {
    //         const emitter = new FastEvent<NestedEvents>();
    //         const moduleScope = emitter.scope('app/modules/user');

    //         const messages = moduleScope.on('users/login');
    //         type MessageType = IteratorMessage<typeof messages>;
    //         type cases = [
    //             Expect<Equal<MessageType['type'], 'users/login'>>,
    //             Expect<Equal<MessageType['payload'], { username: string; timestamp: number }>>,
    //         ];
    //     });

    //     test('二级Scope异步迭代器类型', () => {
    //         const emitter = new FastEvent<NestedEvents>();
    //         const moduleScope = emitter.scope('app/modules/user');
    //         const userScope = moduleScope.scope('users');

    //         const messages = userScope.on('login');
    //         type MessageType = IteratorMessage<typeof messages>;
    //         type cases = [
    //             Expect<Equal<MessageType['type'], 'login'>>,
    //             Expect<Equal<MessageType['payload'], { username: string; timestamp: number }>>,
    //         ];
    //     });

    //     test('二级Scope通配符事件异步迭代器类型', () => {
    //         const emitter = new FastEvent<NestedEvents>();
    //         const moduleScope = emitter.scope('app/modules/user');
    //         const postsScope = moduleScope.scope('posts');

    //         const messages = postsScope.on('**');
    //         type MessageType = IteratorMessage<typeof messages>;
    //         type cases = [
    //             Expect<Equal<MessageType['type'], '**'>>,
    //             Expect<Equal<MessageType['payload'], { postId: string }>>,
    //         ];
    //     });
    // });
});

describe("FastEventScop 使用异步迭代器监听事件类型系统测试", () => {});
