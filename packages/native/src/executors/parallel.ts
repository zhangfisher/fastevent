import { IFastListenerExecutor } from "./types"

export const parallel = (): IFastListenerExecutor => {
    return (listeners, message, args, execute) => {
        return Promise.allSettled(listeners.map(listener => execute(listener[0], message, args)))
    }
}