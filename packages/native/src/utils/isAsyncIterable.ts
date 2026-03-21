/**
 * 判断是否为可异步迭代对象（AsyncIterable）
 * 即具有 Symbol.asyncIterator 方法的对象
 *
 * @param value - 要检查的值
 * @returns 如果是可异步迭代对象返回 true
 */
export function isAsyncIterable<T = any>(value: unknown): value is AsyncIterable<T> {
    if (value === null || typeof value !== "object") {
        return false;
    }

    const maybeIterable = value as Partial<AsyncIterable<T>>;
    const asyncIteratorSymbol = Symbol.asyncIterator;

    return (
        typeof (maybeIterable as any)[asyncIteratorSymbol] === "function" ||
        typeof (maybeIterable as any)["@@asyncIterator"] === "function"
    );
}
