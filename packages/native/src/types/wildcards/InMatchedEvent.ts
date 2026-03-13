import { KeyOf } from "../utils";
import { ReplaceWildcard } from "./ReplaceWildcard";

export type InMatchedEvent<Events extends Record<string, any>, T> = T extends
    | KeyOf<Events>
    | ReplaceWildcard<KeyOf<Events>>
    ? true
    : false;

// interface Events {
//     a: boolean;
//     b: number;
//     c: string;
//     x: "x1" | "x2" | "x3";
//     "div/*/click": { x: number; y: number };
//     "users/*/login": "x" | "y" | "z";
//     "users/*/logout": number;
//     "users/*/*": { name: string; vip: boolean };
// }
// type x1 = InMatchedEvent<Events, "users/assss/login">;
// type x2 = InMatchedEvent<Events, "as">;

// type K = KeyOf<Events> | ReplaceWildcard<KeyOf<Events>>;
