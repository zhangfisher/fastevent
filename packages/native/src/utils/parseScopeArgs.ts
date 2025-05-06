import { isFastEventScope } from "./isFastEventScope"

export function parseScopeArgs(args: IArguments, scopeMeta?: any, scopeContext?: any) {
    const prefix = args[0]
    const scopeObj = isFastEventScope(args[1]) ? args[1] : undefined
    const options = (scopeObj ? args[2] : args[1]) || {}
    options.meta = Object.assign({}, scopeMeta, options?.meta)
    options.context = options.context !== undefined ? options.context : scopeContext
    return [prefix, scopeObj, options]
}