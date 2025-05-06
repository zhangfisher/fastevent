

export function isClass(target: unknown): target is new (...args: any[]) => any {
    return typeof target === 'function' &&
        (target.toString().startsWith('class ') ||
            target.prototype?.constructor === target);
}