type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

export async function resolveValue<T>(input: T): Promise<UnwrapPromise<T> | Error> {
    try {
        // 检查输入是否是Promise
        if (input instanceof Promise) {
            const result = await input;
            return result as UnwrapPromise<T>;
        }
        // 非Promise值直接返回
        return input as UnwrapPromise<T>;
    } catch (error) {
        // 如果Promise执行出错，返回Error对象
        if (error instanceof Error) {
            return error;
        }
        // 如果抛出的不是Error对象，转换为Error
        return new Error(String(error));
    }
}
