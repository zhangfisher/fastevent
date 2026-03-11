import { FastMessagePayload } from "../FastEventMessages";

export type PayloadValues<R extends Record<string, any>> =
    R[keyof R] extends FastMessagePayload<infer P> ? P : R[keyof R];
