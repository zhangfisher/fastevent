/**
 * 兼容旧版装饰器的判断函数
 */
export function isPropertyDecorator(
    target: unknown,
    propertyKey: unknown,
    _descriptor: unknown,
): boolean {
    // 1. 检查参数数量（属性装饰器应该有两个参数）
    if (arguments.length !== 2) return false;

    // 2. 检查 target 必须是对象或构造函数
    if (typeof target !== "object" && typeof target !== "function") return false;
    if (target === null) return false;

    // 3. 检查 propertyKey 必须是字符串或 Symbol
    if (typeof propertyKey !== "string" && typeof propertyKey !== "symbol") {
        return false;
    }

    // 4. 检查 descriptor 必须为 undefined（属性装饰器没有第三个参数）
    if (_descriptor !== undefined) return false;

    return true;
}
