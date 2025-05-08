export const ClearRetainMessage = Symbol.for('ClearRetainMessage')

export class FastEventError extends Error { }

export class TimeoutError extends FastEventError { }
// 当Scope没有绑定到了Emitter时提示这个错误
export class UnboundError extends FastEventError { }
export class AbortError extends FastEventError { }
export class QueueOverflowError extends FastEventError { }