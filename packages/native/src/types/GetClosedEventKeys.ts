import { GetPartCount } from "./wildcards/GetPartCount";
import { GetWildcardCount } from "./wildcards/GetWildcardCount";
import { IsMultiWildcard } from "./utils";
import { IsWildcardMatched } from "./WildcardEvents";

// 获取最相近的Key

export type GetClosedEventKeys<Events extends Record<string, any>, T extends string> = {
    [Key in Exclude<keyof Events, number | symbol> as IsWildcardMatched<T, Key> extends true
        ? IsMultiWildcard<Key> extends true //  以/**结尾
            ? GetPartCount<Key> extends 9
                ? 9
                : GetPartCount<Key> extends 8
                  ? 8
                  : GetPartCount<Key> extends 7
                    ? 7
                    : GetPartCount<Key> extends 6
                      ? 6
                      : GetPartCount<Key> extends 5
                        ? 5
                        : GetPartCount<Key> extends 4
                          ? 4
                          : GetPartCount<Key> extends 3
                            ? 3
                            : GetPartCount<Key> extends 2
                              ? 2
                              : 1
            : GetPartCount<Key> extends GetPartCount<T> // 分段数一样时才比较通配符的数量,数量越小优先级越高
              ? GetWildcardCount<Key> extends 0 // 没有通配符
                  ? 0
                  : GetWildcardCount<Key> extends 1
                    ? 1
                    : GetWildcardCount<Key> extends 2
                      ? 2
                      : GetWildcardCount<Key> extends 3
                        ? 3
                        : GetWildcardCount<Key> extends 4
                          ? 4
                          : GetWildcardCount<Key> extends 5
                            ? 5
                            : GetWildcardCount<Key> extends 6
                              ? 6
                              : GetWildcardCount<Key> extends 7
                                ? 7
                                : GetWildcardCount<Key> extends 8
                                  ? 8
                                  : GetWildcardCount<Key> extends 9
                                    ? 9
                                    : never
              : never
        : T extends Key
          ? 0
          : never]: Key;
};
