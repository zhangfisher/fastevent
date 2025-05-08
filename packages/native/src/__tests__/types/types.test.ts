/* eslint-disable no-unused-vars */

import { describe, test, expect } from "vitest"
import type { Equal, Expect } from '@type-challenges/utils'
import { FastEvent } from "../../event"
import { FastEvents } from "../../types"


describe("types", () => {
    type CustomMeta = { x: number; y: number; z?: number };
    type CustomEvents = {
        click: { x: number; y: number };
        mousemove: boolean;
        scroll: number;
        focus: string;
    };
    type CustomContext = {
        name: string,
        age: number
        address: string
    };
    const emitter = new FastEvent<CustomEvents, CustomMeta, CustomContext>({
        context: {
            name: "hello",
            age: 18,
            address: "beijing"
        }
    });

    type cases = [
        Expect<Equal<typeof emitter.types.events, CustomEvents & FastEvents>>,
        Expect<Equal<typeof emitter.types.meta, {
            [x: string]: any;
            x: number;
            y: number;
            z?: number | undefined;
        }>>,
        Expect<Equal<typeof emitter.types.context, CustomContext>>,
    ]

})



