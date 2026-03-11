// 判断是否包含通配符

export type ContainsWildcard<T extends string> = T extends `${string}/*/${string}`
    ? true
    : T extends `${string}/*`
      ? true
      : T extends `*/${string}`
        ? true
        : T extends `*` | `**`
          ? true
          : T extends `${string}/**`
            ? true
            : false;
