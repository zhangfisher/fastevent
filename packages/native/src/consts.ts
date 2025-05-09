export const __FastEvent__ = Symbol.for('__FastEvent__')
export const __FastEventScope__ = Symbol.for('__FastEventScope__')
export class FastEventError extends Error {
    constructor(message?: string) {
        super(message)
    }
}

export class TimeoutError extends FastEventError { }
// 当Scope没有绑定到了Emitter时提示这个错误
export class UnboundError extends FastEventError { }
export class AbortError extends FastEventError {

}
export class QueueOverflowError extends FastEventError { }


export const FastEventDirectives = {
    clearRetain: Symbol.for('ClearRetain')
}