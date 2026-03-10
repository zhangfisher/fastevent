import { GetClosestEvents, GetMatchedEvents, MatchPattern } from "./WildcardEvents";

type MEvents = {
    [x: `c/${string}`]: boolean;
    [x: `rooms/${string}/add`]: 1;
    [x: `rooms/${string}/join`]: 2;
    [x: `rooms/${string}/leave`]: 3;
    [x: `rooms/${string}/${string}`]: number;
};
type MX = MatchPattern<"rooms/aa/add", `rooms/${string}/add`>;
type E1 = GetMatchedEvents<MEvents, "rooms/aa/add">;
type M1 = GetClosestEvents<MEvents, "rooms/aa/add">;
