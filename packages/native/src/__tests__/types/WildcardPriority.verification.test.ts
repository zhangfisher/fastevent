/* eslint-disable no-unused-vars */

// Verify wildcard priority system fixes override issues

import { describe, test } from "vitest";
import type { Equal, Expect } from "@type-challenges/utils";
import { type TransformedEvents } from "../../types/transformed/TransformedEvents";

describe("WildcardPriority - Verification", () => {
    test("Specific patterns override broad patterns", () => {
        type Events = {
            "rooms/*/$join": { room: string; welcome: string; users: string[] };
            "rooms/*/$leave": string;
            "rooms/*/$error": string;
            "rooms/*/$add": string;
            "rooms/*/$remove": string;
            "rooms/*/*": number;
        };

        type Result = TransformedEvents<Events>;

        // Verify specific events are correctly inferred without intersection types
        type cases = [
            Expect<
                Equal<
                    Result["rooms/lobby/$join"],
                    {
                        type: "rooms/lobby/$join";
                        payload: { room: string; welcome: string; users: string[] };
                        __IS_FAST_MESSAGE__: true;
                    }
                >
            >,
            Expect<
                Equal<
                    Result["rooms/game/$leave"],
                    { type: "rooms/game/$leave"; payload: string; __IS_FAST_MESSAGE__: true }
                >
            >,
            Expect<
                Equal<
                    Result["rooms/chat/$error"],
                    { type: "rooms/chat/$error"; payload: string; __IS_FAST_MESSAGE__: true }
                >
            >,
            Expect<
                Equal<
                    Result["rooms/test/$add"],
                    { type: "rooms/test/$add"; payload: string; __IS_FAST_MESSAGE__: true }
                >
            >,
            Expect<
                Equal<
                    Result["rooms/lobby/$remove"],
                    { type: "rooms/lobby/$remove"; payload: string; __IS_FAST_MESSAGE__: true }
                >
            >,
            Expect<
                Equal<
                    Result["rooms/any/event"],
                    { type: "rooms/any/event"; payload: number; __IS_FAST_MESSAGE__: true }
                >
            >,
        ];
    });

    test("More fixed segments equals higher priority", () => {
        type Events = {
            "api/*/users/detail": { endpoint: string; version: number };
            "api/*/users": string[];
        };

        type Result = TransformedEvents<Events>;

        type cases = [
            Expect<
                Equal<
                    Result["api/v1/users/detail"],
                    {
                        type: "api/v1/users/detail";
                        payload: { endpoint: string; version: number };
                        __IS_FAST_MESSAGE__: true;
                    }
                >
            >,
            Expect<
                Equal<
                    Result["api/v2/users"],
                    { type: "api/v2/users"; payload: string[]; __IS_FAST_MESSAGE__: true }
                >
            >,
        ];
    });

    test("Full wildcards have lowest priority", () => {
        type Events = {
            "rooms/*/$event": { timestamp: number };
            "rooms/*": string;
        };

        type Result = TransformedEvents<Events>;

        type cases = [
            Expect<
                Equal<
                    Result["rooms/lobby/$event"],
                    {
                        type: "rooms/lobby/$event";
                        payload: { timestamp: number };
                        __IS_FAST_MESSAGE__: true;
                    }
                >
            >,
            Expect<
                Equal<
                    Result["rooms/lobby"],
                    { type: "rooms/lobby"; payload: string; __IS_FAST_MESSAGE__: true }
                >
            >,
        ];
    });

    test("Exact match has highest priority", () => {
        type Events = {
            "rooms/lobby/join": { userId: number; timestamp: number };
            "rooms/*/join": string;
        };

        type Result = TransformedEvents<Events>;

        type cases = [
            Expect<
                Equal<
                    Result["rooms/lobby/join"],
                    {
                        type: "rooms/lobby/join";
                        payload: { userId: number; timestamp: number };
                        __IS_FAST_MESSAGE__: true;
                    }
                >
            >,
            Expect<
                Equal<
                    Result["rooms/other/join"],
                    { type: "rooms/other/join"; payload: string; __IS_FAST_MESSAGE__: true }
                >
            >,
        ];
    });
});
