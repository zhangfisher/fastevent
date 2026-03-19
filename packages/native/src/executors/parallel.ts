import { FastListenerExecutor } from "./types";

/**
 *
 */
export const parallel = (): FastListenerExecutor => {
    return (listeners, message, args, execute) => {
        return listeners.map((listener, i) =>
            execute.call(listeners[i], listener, message, args, true),
        );
    };
};
