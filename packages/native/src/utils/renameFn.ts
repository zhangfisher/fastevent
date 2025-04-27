



/**
 * 重命名函数，修改函数的 name 属性
 * @param fn 需要重命名的函数
 * @param name 新的函数名
 * @returns 返回重命名后的函数
 */
export function renameFn<F>(fn: F, name: string): F {
    Object.defineProperty(fn, 'name', {
        value: name || 'anonymous',
        configurable: true
    });
    return fn;
}
