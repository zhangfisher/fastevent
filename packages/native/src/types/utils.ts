/**
 * 检查类型 T 是否是 any
 * @description 利用 any 在交叉类型中的特殊行为：1 & any = any
 * @example
 * type Test1 = IsAny<any>;      // true
 * type Test2 = IsAny<string>;   // false
 * type Test3 = IsAny<unknown>;  // false
 * type Test4 = IsAny<never>;    // false
 */
export type IsAny<T> = 0 extends 1 & T ? true : false;
// MergeUnion<{ a: 1 } | { b: 2 }> === { a: 1, b: 2 }
export type MergeUnion<T> = (T extends any ? (x: T) => void : never) extends (x: infer U) => void
    ? { [K in keyof U]: U[K] }
    : never;

export type RemoveEmptyObject<T extends Record<string, any>> = T extends {} & (infer O) ? O : T;

export type AssertRecord<T> = T extends Record<string, any> ? T : Record<string, any>;

export type Union<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

/**
 * 将事件映射转换为可变联合类型
 * 根据事件的键名确定 type 字段，根据事件的值确定 payload 字段
 *
 * @example
 * ```ts
 * type Events = {
 *   a: number;
 *   b: boolean;
 * };
 *
 * type Result = MutableEvents<Events>;
 * // Result = { type: "a"; payload: number } | { type: "b"; payload: boolean }
 * ```
 */

export type MutableRecord<
    Items,
    KindKey extends string = "type",
    Share = unknown,
    DefaultKind extends keyof Items = never,
> =
    | { [Kind in keyof Items]: Union<{ [type in KindKey]: Kind } & Items[Kind] & Share> }[Exclude<
          keyof Items,
          DefaultKind
      >]
    | (DefaultKind extends never
          ? never
          : Union<{ [K in KindKey]?: DefaultKind | undefined } & Items[DefaultKind] & Share>);

export type KeyOf<T extends Record<string, any>> =
    Exclude<keyof T, number | symbol> extends never ? string : Exclude<keyof T, number | symbol>;

// never
export type Fallback<T, F> = [T] extends [never]
    ? F // 处理never情况
    : T extends undefined
      ? F // 处理undefined情况
      : T; // 否则返回原类型

export type isEmpty<T extends Record<string, any>> = [keyof T] extends [never] ? true : false;

// 提取出精确等于T的记录
export type PickEqualRecord<R extends Record<string, any>, T extends string> = {
    [K in keyof R as Equal<K, T> extends true ? K : never]: R[K];
};
// 提取出精确不等于T的记录
export type PickNotEqualRecord<R extends Record<string, any>, T extends string> = {
    [K in keyof R as Equal<K, T> extends true ? never : K]: R[K];
};

// 提取出Key中包括分割符的记录
export type PickInlcudeDelimiterRecord<R extends Record<string, any>> = {
    [K in keyof R as K extends `${string}/${string}` ? K : never]: R[K];
};

export type PickNotInlcudeDelimiterRecord<R extends Record<string, any>> = {
    [K in keyof R as K extends `${string}/${string}` ? never : K]: R[K];
};

export type NotEqual<X, Y> = true extends Equal<X, Y> ? false : true;
export type Equal<X, Y> =
    (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
