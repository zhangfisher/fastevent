import { FastMessagePayload } from "../FastEventMessages";

export type OmitTransformedEvents<T extends Record<string, any>> = {
    [key in keyof T as T[key] extends FastMessagePayload ? never : key]: T[key];
};
