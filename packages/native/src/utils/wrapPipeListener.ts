import { FastListenerPipe } from "../pipes/types";
import { TypedFastEventListener } from "../types/FastEventListeners";
import { renameFn } from "./renameFn";

export function wrapPipeListener(
    listener: TypedFastEventListener<any, any, any, any>,
    pipes: FastListenerPipe[],
): TypedFastEventListener<any, any, any, any> {
    if (Array.isArray(pipes)) {
        pipes.forEach((decorator) => {
            listener = renameFn(decorator(listener), listener.name);
        });
        return listener;
    }
    return listener;
}
