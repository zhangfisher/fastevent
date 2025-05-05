

export class FastEventError extends Error { }

export class TimeoutError extends FastEventError { }
export class AbortError extends FastEventError { }
export class QueueOverflowError extends FastEventError { }