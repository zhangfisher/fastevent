import { TypedFastEventMessage } from "../types/FastEventMessages";
import { FastEventListenerArgs } from "../types/FastEvents";

export function parseEmitArgs<
    Events extends Record<string, any> = Record<string, any>,
    Meta = unknown,
>(
    args: IArguments,
    emitterMeta: any,
    scopeMeta?: any,
    scopeExecutor?: any,
): [TypedFastEventMessage<Events, Meta>, FastEventListenerArgs<Meta>] {
    let message: TypedFastEventMessage<Events, Meta>;
    let emitArgs: FastEventListenerArgs<Meta>;
    let directMeta: any;
    // 最常见路径优先：emit(type, payload[, retain|options])
    if (typeof args[0] === "string") {
        message = { type: args[0] as any, payload: args[1] } as TypedFastEventMessage<Events, Meta>;
        const opt = args[2];
        emitArgs = (opt === undefined
            ? {}
            : typeof opt === "boolean"
              ? { retain: opt }
              : opt) as FastEventListenerArgs<Meta>;
        directMeta = undefined;
    } else {
        // 对象形式：emit(message[, retain|options])
        message = Object.assign({} as TypedFastEventMessage<Events, Meta>, args[0]);
        const opt = args[1];
        emitArgs = (opt === undefined
            ? {}
            : typeof opt === "boolean"
              ? { retain: opt }
              : opt) as FastEventListenerArgs<Meta>;
        directMeta = args[0].meta;
    }
    // meta 合并优先级：emitterMeta < scopeMeta < emitArgs.meta < 直接 meta
    const meta = Object.assign({}, emitterMeta, scopeMeta, emitArgs.meta, directMeta);

    if (Object.keys(meta).length === 0) {
        delete message.meta;
    } else {
        message.meta = meta;
    }

    if (emitArgs.executor === undefined) {
        emitArgs.executor = scopeExecutor;
    }

    return [message, emitArgs];
}
