import { FastMessagePayload } from "../FastEventMessages";

export type PickPayload<M> = [M] extends [FastMessagePayload] ? M["type"] : M;
