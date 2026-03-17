import type { TypedFastEventListener } from "../types/FastEventListeners";

export type FastListenerPipe = (listener: TypedFastEventListener) => TypedFastEventListener;

// import { DebounceOptions } from "./debounce";
// import { QueueListenerPipeOptions } from "./queue";
// import { RetryListenerPipeOptions } from "./retry";
// import { ThrottleOptions } from "./throttle";
// import { FastEventSubscriber } from "../types";
// export interface IPipeOperates {
//     retry: (options?: RetryListenerPipeOptions) => FastEventSubscriber;
//     queue: (options?: QueueListenerPipeOptions) => FastEventSubscriber;
//     memorize: () => FastEventSubscriber;
//     timeout: <T = any>(ms: number, defaultValue?: T) => FastEventSubscriber;
//     debounce: (ms: number, options?: DebounceOptions) => FastEventSubscriber;
//     throttle: (interval: number, options?: ThrottleOptions) => FastEventSubscriber;
// }
// /**
//  * const emitter.on("test")
//  *  .retry(5)
//  *  .queue()
//  *  .timeout(10)
//  *  .take(110)
//  *  .filter(()=>{})
//  *  .window(100)
//  *  .to(listener)
//  *
//  */
