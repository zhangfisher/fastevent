// 数字减1
export type Decrement<N extends number> = N extends 0
    ? 0
    : N extends 1
      ? 0
      : N extends 2
        ? 1
        : N extends 3
          ? 2
          : N extends 4
            ? 3
            : N extends 5
              ? 4
              : N extends 6
                ? 5
                : N extends 7
                  ? 6
                  : N extends 8
                    ? 7
                    : N extends 9
                      ? 8
                      : number;
