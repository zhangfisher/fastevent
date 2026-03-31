/**
 * 兼容旧版装饰器的判断函数
 */
export function isMethodDecorator(
    target: unknown,
    propertyKey: unknown,
    descriptor: unknown,
): boolean {
    // 1. 检查参数数量（装饰器应该有三个参数）
    if (arguments.length !== 3) return false;

    // 2. 检查 target 必须是对象或构造函数
    if (typeof target !== "object" && typeof target !== "function") return false;
    if (target === null) return false;

    // 3. 检查 propertyKey 必须是字符串或 Symbol
    if (typeof propertyKey !== "string" && typeof propertyKey !== "symbol") {
        return false;
    }

    // 4. 检查 descriptor 必须是属性描述符对象
    if (descriptor === null || typeof descriptor !== "object") return false;

    // 5. 检查 descriptor 是否包含必要的方法属性
    if (!("value" in descriptor) && !("get" in descriptor) && !("set" in descriptor)) {
        return false;
    }

    // 6. 检查 value 必须是函数（如果是方法装饰器）
    if ("value" in descriptor && typeof descriptor.value !== "function") {
        return false;
    }

    return true;
}
