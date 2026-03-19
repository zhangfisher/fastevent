export function getWeakRef(value: any) {
    // WeakRef 只能接收对象，不能接收原始值
    if (value !== null && (typeof value === "object" || typeof value === "function")) {
        return new WeakRef(value);
    }
    return value;
}
