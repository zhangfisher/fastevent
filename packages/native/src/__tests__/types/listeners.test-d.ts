// oxlint-disable no-unused-expressions
/* eslint-disable no-unused-vars */
import { describe, expect, test } from "bun:test";
import type { Equal, Expect } from "@type-challenges/utils";
import { FastEvent } from "../../event";
import { FastEventEmitMessage } from "../../types/FastEventMessages";
import { TransformedEvents } from "../../types/transformed/TransformedEvents";
import { NotPayload } from "../../types/transformed/NotPayload";
import {
    MutableMessage,
    GetPayload,
    Overloads,
    FastEventMessage,
    FastEventListener,
    TypedFastEventListener,
} from "../../types";
import { FastEventMeta } from "../../types/FastEventMessages";
import { ExtendWildcardEvents } from "../../types/wildcards/ExtendWildcardEvents";
import { FastEventIterator } from "../../eventIterator";
import { AllowCall, GetMatchingOverload } from "../../types/utils/AllowCall";

type IteratorMessage<T> = T extends FastEventIterator<infer M> ? M : never;

describe("监听器类型系统测试", () => {
    test("无类型触发事件", () => {
        type Events = {
            click: { x: number; y: number };
            mousemove: boolean;
            scroll: number;
            focus: string;
        };
        const emitter = new FastEvent<Events>();
        type Listeners = typeof emitter.types.listeners;
        type ClickListener = Listeners["click"];
        const listener: ClickListener = (message) => {
            message.type;
            message.payload;
            type cases = [
                Expect<Equal<typeof message.type, "click">>,
                Expect<
                    Equal<
                        typeof message.payload,
                        {
                            x: number;
                            y: number;
                        }
                    >
                >,
            ];
        };
    });
});
