import { FastEventSubscriber } from "../types";
import type { TypedFastEventListener } from "../types/FastEventListeners";
import { RetryListenerPipeOptions } from "./retry";

export type FastListenerPipe = (listener: TypedFastEventListener) => TypedFastEventListener;

export interface IPipeOperates {
    retry: (options?: RetryListenerPipeOptions) => FastEventSubscriber;
}
