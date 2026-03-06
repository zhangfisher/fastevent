import { ExtendWildcardEvents, NotPayload, TypedFastEventMessage } from ".";

interface TransformedWildcardEvents {
    a: boolean;
    b: number;
    c: string;
    "x/y/z/a": 1;
    "x/y/z/b": 2;
    "x/y/z/c": 3;
    "users/*/online": NotPayload<{ name: string; status?: number }>;
    "users/*/offline": NotPayload<boolean>;
    "users/*/*": NotPayload<string>;
    // "users/a/b": string;
    "posts/*/view": NotPayload<number>;
    "posts/*/comment": NotPayload<string>;
    "posts/**": NotPayload<{ title: string; views: number }>;
    "devices/*/status": NotPayload<"online" | "offline">;
    "devices/**": NotPayload<number>;
    "*": NotPayload<string>; // 全局通配符
    "**": NotPayload<any>; // 双星通配符
}

type ExtendEvents = ExtendWildcardEvents<TransformedWildcardEvents>;

type t1 = TypedFastEventMessage<Record<"users/a/a", ExtendEvents["users/a/a"]>>;
// type t2 = FastEventCommonMessage<TransformedWildcardEvents>;
// type t3 = FastEventWildcardMessage<TransformedWildcardEvents, "users/*/*">;
// // 调试类型：验证 WildcardEvents 的行为
// type d = WildcardEvents<TransformedWildcardEvents, "users/a/b">;
// type dKeys = keyof d; // 应该包含 "users/*/*" 和其他匹配的模式
// type dKeysExcluded = Exclude<dKeys, "*" | "**">; // 排除全局通配符
//  * @example
//  * type Events = {
//  *     "users/*/*": { name: string; status?: number };
//  *     "users/*/*/offline": boolean;
//  *     "posts/*/view": number;
//  *     "posts/**": string;
//  *     "data/**": any;
//  * };
//  *
//  * // 使用时指定具体的 type，TypeScript 会自动推导 payload 类型
//  * type Msg1 = FastEventWildcardMessage<Events, "users/123/online">;
//  * // { type: "users/123/online"; payload: { name: string; status?: number } }
//  *
//  * type Msg2 = FastEventWildcardMessage<Events, "posts/1/view">;
//  * // { type: "posts/1/view"; payload: number }
//  *
//  * type Msg3 = FastEventWildcardMessage<Events, "data/a/b/c">;
//  * // { type: "data/a/b/c"; payload: any } (匹配 "data/**")
//  */
// // 测试 IsTransformedKey
// type IsTransformedKeyTest1 = IsTransformedKey<TransformedWildcardEvents, "users/a/b">; // 应该是 "users/a/b"
// type IsTransformedKeyTest2 = IsTransformedKey<TransformedWildcardEvents, "xa/b">; // 应该是 never（只匹配 "*"）
// type IsTransformedKeyTest3 = IsTransformedKey<TransformedWildcardEvents, "users/123/online">; // 应该是 "users/123/online"
// type IsTransformedKeyTest4 = IsTransformedKey<TransformedWildcardEvents, "posts/1/view">; // 应该是 "posts/1/view"
// type IsTransformedKeyTest5 = IsTransformedKey<TransformedWildcardEvents, "posts/1/view">; // 应该是 "posts/1/view"
// type IsTransformedKeyTest6 = IsTransformedKey<TransformedWildcardEvents, "**">; // 应该是  **
// type IsTransformedKeyTest7 = IsTransformedKey<TransformedWildcardEvents, "*">; // 应该是  *
// type IsTransformedKeyTest8 = IsTransformedKey<TransformedWildcardEvents, "a">; // 应该是  never

// export type GetTransformedKey<Events extends Record<string, any>, T extends string> =
//     T extends IsTransformedKey<Events, T> ? ClosestWildcardEvents<Events, T> : never;

// function test<T extends string = keyof TransformedWildcardEvents>(
//     type: T,
// ): T extends IsTransformedKey<TransformedWildcardEvents, T>
//     ? RecordValues<ClosestWildcardEvents<TransformedWildcardEvents, T>>
//     : 2 {
//     return 1 as any;
// }
// type userV = RecordValues<ClosestWildcardEvents<TransformedWildcardEvents, "users/a/b">>;
// type userEvent = PickPayload<
//     RecordValues<ClosestWildcardEvents<TransformedWildcardEvents, "users/a/b">>
// >;
// // 测试用例
// type f = IsTransformedKey<TransformedWildcardEvents, "posts/x/y/z">;
// const a = test("users/a/b"); // 预期类型: 1 (匹配 "users/*/*")
// const d = test("a"); // 预期类型: 1 (匹配 "users/*/*")
// type dd = keyof typeof d;
// const b = test("xa/b"); // 预期类型: 2 (只匹配 "*"，被排除)
// const c = test("users/123/online"); // 预期类型: 1 (匹配 "users/*/online")
// const d_test = test("posts/x/y/z"); // 预期类型: 1 (匹配 "posts/*/view")

// 验证类型：
// typeof a 应该是 1
// typeof b 应该是 2
// typeof c 应该是 1
// typeof d_test 应该是 1

// FastEventCommonMessage 类型测试示例
// type TestEvents = {
//     click: { x: number; y: number };
//     keydown: string;
//     message: { text: string; timestamp: number };
// };
//
// type TestMessage = FastEventCommonMessage<TestEvents>;
//
// // TestMessage 等价于:
// // type TestMessage = {
// //     type: 'click';
// //     payload: { x: number; y: number };
// // } | {
// //     type: 'keydown';
// //     payload: string;
// // } | {
// //     type: 'message';
// //     payload: { text: string; timestamp: number };
// // }
/**
 * FastEventWildcardMessage 类型测试
 *
 * 测试通配符消息类型的自动推导功能
 */

// import type { FastEventWildcardMessage, PickPayload, RecordValues } from "./index";
// import type { WildcardEvents } from "./WildcardEvents";

// // 测试事件类型定义
// type TestEvents = {
//     "users/*/online": { name: string; status?: number };
//     "users/*/offline": boolean;
//     "users/*/*": string; // 匹配 users/a/b
//     "posts/*/view": number;
//     "posts/*/comment": string;
//     "posts/**": { title: string; views: number }; // 匹配 posts/x/y/z 等多层路径
//     "devices/*/status": "online" | "offline";
//     "devices/**": number;
//     "*": string; // 全局单级通配符
//     "**": any; // 全局多级通配符
// };

// // 测试1: 匹配 "users/*/online"
// type Test1 = FastEventWildcardMessage<TestEvents, "users/123/online">;
// // 期望: { type: "users/123/online"; payload: { name: string; status?: number } }
// const test1: Test1 = {
//     type: "users/123/online",
//     payload: { name: "test", status: 1 },
// };

// // 测试2: 匹配 "users/*/offline"
// type Test2 = FastEventWildcardMessage<TestEvents, "users/456/offline">;
// // 期望: { type: "users/456/offline"; payload: boolean }
// const test2: Test2 = {
//     type: "users/456/offline",
//     payload: true,
// };

// // 测试3: 匹配 "users/*/*"
// type Test3 = FastEventWildcardMessage<TestEvents, "users/a/b">;
// // 期望: { type: "users/a/b"; payload: string }
// const test3: Test3 = {
//     type: "users/a/b",
//     payload: "test",
// };

// // 测试4: 匹配 "posts/*/view"
// type Test4 = FastEventWildcardMessage<TestEvents, "posts/1/view">;
// // 期望: { type: "posts/1/view"; payload: number }
// const test4: Test4 = {
//     type: "posts/1/view",
//     payload: 100,
// };

// // 测试5: 匹配 "posts/**" (多层路径)
// type Test5 = FastEventWildcardMessage<TestEvents, "posts/1/2/3">;
// // 期望: { type: "posts/1/2/3"; payload: { title: string; views: number } }
// const test5: Test5 = {
//     type: "posts/1/2/3",
//     payload: { title: "test", views: 100 },
// };

// // 测试6: 匹配 "devices/*/status"
// type Test6 = FastEventWildcardMessage<TestEvents, "devices/device1/status">;
// // 期望: { type: "devices/device1/status"; payload: "online" | "offline" }
// const test6: Test6 = {
//     type: "devices/device1/status",
//     payload: "online",
// };

// // 测试7: 匹配 "devices/**"
// type Test7 = FastEventWildcardMessage<TestEvents, "devices/a/b/c">;
// // 期望: { type: "devices/a/b/c"; payload: number }
// const test7: Test7 = {
//     type: "devices/a/b/c",
//     payload: 123,
// };

// // 测试8: 匹配全局 "*"
// type Test8 = FastEventWildcardMessage<TestEvents, "anything">;
// // 期望: { type: "anything"; payload: string }
// const test8: Test8 = {
//     type: "anything",
//     payload: "test",
// };

// // 测试9: 匹配全局 "**"
// type Test9 = FastEventWildcardMessage<TestEvents, "any/thing/here">;
// // 期望: { type: "any/thing/here"; payload: any }
// const test9: Test9 = {
//     type: "any/thing/here",
//     payload: {},
// };

// // 输出测试结果
// console.log("所有类型测试通过！");
// console.log("test1:", test1);
// console.log("test2:", test2);
// console.log("test3:", test3);
// console.log("test4:", test4);
// console.log("test5:", test5);
// console.log("test6:", test6);
// console.log("test7:", test7);
// console.log("test8:", test8);
// console.log("test9:", test9);

// // 类型检查测试
// function handleMessage<T extends string>(
//     type: T,
//     message: FastEventWildcardMessage<TestEvents, T>,
// ) {
//     console.log(`处理事件: ${message.type}`);
//     console.log(`Payload:`, message.payload);

//     // TypeScript 会根据 type 自动推导 message.payload 的类型
//     switch (type) {
//         case "users/123/online":
//             // message.payload 的类型是 { name: string; status?: number }
//             console.log(`用户名称: ${message.payload.name}`);
//             if (message.payload.status !== undefined) {
//                 console.log(`用户状态: ${message.payload.status}`);
//             }
//             break;
//         case "users/456/offline":
//             // message.payload 的类型是 boolean
//             console.log(`离线状态: ${message.payload}`);
//             break;
//         case "posts/1/view":
//             // message.payload 的类型是 number
//             console.log(`浏览次数: ${message.payload}`);
//             break;
//     }
// }

// // 测试类型推导
// handleMessage("users/123/online", test1);
// handleMessage("users/456/offline", test2);
// handleMessage("posts/1/view", test4);
