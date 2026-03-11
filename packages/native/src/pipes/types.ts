import type { TypedFastEventListener } from "../types/FastEventListeners";

export type FastListenerPipe = (listener: TypedFastEventListener) => TypedFastEventListener;
