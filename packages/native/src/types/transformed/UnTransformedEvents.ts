import { FastMessagePayload } from "../FastEventMessages";

/**
 * 将对象中值是FastMessagePayload的类型提取出来
 */
export type UnTransformedEvents<Events extends Record<string, any>> = {
    [K in keyof Events]: Events[K] extends FastMessagePayload<infer P> ? P : Events[K];
};

// import { NotPayload } from "./NotPayload";
// import { TransformedEvents } from "./TransformedEvents";

// interface Events {
//     a: boolean;
//     b: NotPayload<number>;
//     c: NotPayload<{ x: number; y: number }>; // 允许重复使用NotPayload
// }

// type E1 = UnTransformedEvents<TransformedEvents<Events>>
