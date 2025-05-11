import { FastListenerExecutor } from "./types"

/**
 *  
 */
export const parallel = (): FastListenerExecutor => {
    return (listeners, message, args, execute) => {
        return listeners.map(listener => execute(listener[0], message, args, true))
    }
}