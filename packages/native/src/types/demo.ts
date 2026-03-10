// oxlint-disable no-unused-vars
import {
    GetClosestEvents,
    GetMatchedEvents,
    GetMatchedEventsByRate,
    GroupByMatchRate,
    GetMatchRate,
    MatchPattern,
} from "./WildcardEvents";

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

type ExtEvents = {
    a: boolean;
    b: number;
    c: string;
} & {
    [x: `div/${string}/click`]: {
        x: number;
        y: number;
    };
} & {
    [x: `users/${string}/login`]: string;
} & {
    [x: `users/${string}/logout`]: number;
} & {
    [x: `users/${string}/${string}`]: {
        name: string;
        vip: boolean;
    };
};
type ddd = {
    [x: `users/${string}/login`]: string;
} & {
    [x: `users/${string}/${string}`]: {
        name: string;
        vip: boolean;
    };
};

type Get1<T extends Record<string, any>, K extends string> =
    | {
          [X in Exclude<keyof T, number | symbol> as GetMatchRate<X, K> extends 0
              ? X
              : never]: T[K];
      }
    | {
          [X in Exclude<keyof T, number | symbol> as GetMatchRate<X, K> extends 1
              ? X
              : never]: T[GetMatchRate<X, K> extends 1 ? X : never];
      }
    | {
          [X in Exclude<keyof T, number | symbol> as GetMatchRate<X, K> extends 2
              ? X
              : never]: T[K];
      };
type xc1 = Get1<ddd, "users/x/login">;
type xc2 = Get1<ddd, "users/x/login">;

type M = GetMatchedEvents<ExtEvents, "users/x/login">;

type x0 = GroupByMatchRate<ExtEvents, "users/x/login", 0>;
type x1 = GroupByMatchRate<ExtEvents, "users/x/login", 1>;
type x2 = GroupByMatchRate<ExtEvents, "users/x/login", 2>;
type x3 = GroupByMatchRate<ExtEvents, "users/x/login", 3>;
type x4 = GetMatchedEventsByRate<ExtEvents, "users/x/login", 4>;
type x5 = GroupByMatchRate<ExtEvents, "users/x/login", 5>;
type x6 = GroupByMatchRate<ExtEvents, "users/x/login", 6>;

type R0 = GetMatchRate<"users/x/login", "users/*/login">;
type R1 = GetMatchRate<"users/x/login", "users/*/*">;
type R2 = GetMatchRate<"users/x/login", "*/*/*">;
type R3 = GetMatchRate<"users/x/login", "*/*/login">;
