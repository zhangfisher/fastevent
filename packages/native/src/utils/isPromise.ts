/**
 * 判断一个值是否为 Promise
 *
 * 这个函数检查一个值是否具有 Promise 的核心特征：
 * 1. 不是 null 或 undefined
 * 2. 是对象或函数类型
 * 3. 具有 then 方法（且 then 是函数）
 *
 * 注意：这个函数也会返回 true 给任何 "thenable" 对象（具有 then 方法的对象），
 * 这些对象虽然不是原生的 Promise，但可以用在 Promise 链中。
 *
 * @param value - 要检查的值
 * @returns 类型谓词，表明值是否为 Promise
 *
 * @example
 * ```typescript
 * isPromise(Promise.resolve()); // true
 * isPromise(new Promise(() => {})); // true
 * isPromise({ then: () => {} }); // true (thenable)
 * isPromise({}); // false
 * isPromise(null); // false
 * isPromise(42); // false
 * ```
 */
export function isPromise<T = any>(value: unknown): value is Promise<T> {
    // 快速检查 null 和 undefined
    if (value == null) {
        return false;
    }

    // Promise 必须是对象或函数类型
    const type = typeof value;
    if (type !== "object" && type !== "function") {
        return false;
    }

    // 检查 then 方法是否存在且为函数
    // 使用类型断言绕过 TypeScript 的类型检查
    return typeof (value as Record<string, unknown>).then === "function";
}
