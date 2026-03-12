// 1. 首先，将所有可能的 type 值提取为一个联合类型
type MessageType = "a" | "b" | "c" | "x/y/z/a" | "x/y/z/b" | "x/y/z/c";

// 2. 定义基础的消息结构，包含 meta 等公共属性
// 注意：这里我们利用泛型或映射类型来构建最终的联合，或者手动保持原有的联合写法但引用上面的类型
// 为了最大化兼容性和清晰度，推荐以下两种写法之一：

// 【写法 A：保持原有联合结构，但约束 type 字段】(推荐，最直观)
type Message =
    | { type: Extract<MessageType, "a">; payload: boolean; meta?: Record<string, any> }
    | { type: Extract<MessageType, "b">; payload: number; meta?: Record<string, any> }
    | { type: Extract<MessageType, "c">; payload: string; meta?: Record<string, any> }
    | { type: Extract<MessageType, "x/y/z/a">; payload: 1; meta?: Record<string, any> }
    | { type: Extract<MessageType, "x/y/z/b">; payload: 2; meta?: Record<string, any> }
    | { type: Extract<MessageType, "x/y/z/c">; payload: 3; meta?: Record<string, any> };

// 或者更简洁地直接写字符串，只要上面定义了 MessageType，
// 其实直接在对象里写字符串字面量，IDE 通常也能通过上下文感知，
// 但最稳妥让 IDE 在输入第一个字符就提示的方法是确保 type 的定义是“顶层”的约束。

// 【写法 B (进阶)：使用映射类型自动生成】(适合类型非常多时，减少重复代码)
// 定义每个 type 对应的 payload 类型映射
type PayloadMap = {
    a: boolean;
    b: number;
    c: string;
    "x/y/z/a": 1;
    "x/y/z/b": 2;
    "x/y/z/c": 3;
};

// 自动生成联合类型
type MessageAuto = {
    [K in keyof PayloadMap]: {
        type: K;
        payload: PayloadMap[K];
        meta?: Record<string, any>;
    };
}[keyof PayloadMap];

// 使用测试 (两种写法效果一样，这里用写法 A 的逻辑演示，因为更接近你原代码)
const m1: Message = {
    type: "a", // <--- 现在在这里输入时，IDE 应该会立即提示 "a", "b", "c", "x/y/z/a" 等
    payload: true,
};

const m2: Message = {
    type: "a",
};

// 错误检查依然有效
// const m3: Message = {
//   type: 'a',
//   payload: 123 // ❌ 报错：Type 'number' is not assignable to type 'boolean'
// };
