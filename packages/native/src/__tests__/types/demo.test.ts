import { Equal } from "@type-challenges/utils";
type User = {
    "users/fisher/online": number;
} & {
    [x: `users/${string}/online`]: boolean;
};

type PickEnsure<R extends Record<string, any>, T extends string> = {
    [K in keyof R as Equal<K, T> extends true ? K : never]: R[K];
};

type Fallback<T, F> = [T] extends [never]
    ? F // 处理never情况
    : T extends undefined
      ? F // 处理undefined情况
      : T; // 否则返回原类型

type EUser = PickEnsure<User, "users/fisher/online">;
type EUser2 = PickEnsure<User, "users/fisher/eonline">;
