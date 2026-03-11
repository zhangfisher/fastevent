import { AssertString } from "../utils";
import { GetClosestEventName } from "./GetClosestEventName";

/**
 
 type Events = {
        "users/* /login": { userId: number };
        "* /* /login": { userId: number };
        "users/* /profile": { username: string };
    };

type Result1 = GetClosestEvents<Events, "users/123/login">;

 {
    "users/* /login": {
        userId: number;
    };
}
 */
export type GetClosestEvents<
    Events extends Record<string, any>,
    T extends string,
    D = Record<string, any>,
> =
    GetClosestEventName<Events, T> extends never
        ? D
        : Record<
              AssertString<GetClosestEventName<Events, T>>,
              Events[AssertString<GetClosestEventName<Events, T>>]
          >;
