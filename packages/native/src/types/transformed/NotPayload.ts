import { FastMessagePayload } from "../FastEventMessages";
import { IsAny } from "../utils";

export type NotPayload<M> =
    IsAny<M> extends true
        ? FastMessagePayload<any>
        : [M] extends [FastMessagePayload]
          ? M
          : FastMessagePayload<M>;
