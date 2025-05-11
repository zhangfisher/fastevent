

/**
 * 包装 Promise，将 catch 的错误转换为正常返回值
 * @param fn 需要包装的 Promise
 * @returns 包装后的 Promise，如果发生错误则返回错误对象
 */
export function tryReturnError(fn: Promise<any>, callback?: (e: any) => any): Promise<any> {
    return fn.catch((e) => {
        if (callback) callback(e)
        return Promise.resolve(e)
    })
}
