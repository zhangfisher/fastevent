import { PickPayload } from "./PickPayload";

export type AtPayloads<Events extends Record<string, any>> = {
    [K in keyof Events]: PickPayload<Events[K]>;
};
