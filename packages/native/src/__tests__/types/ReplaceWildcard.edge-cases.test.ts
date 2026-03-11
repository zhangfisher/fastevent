/* eslint-disable no-unused-vars */

import { describe, test, expect } from "vitest";
import type { Equal, Expect } from "@type-challenges/utils";
import type { ReplaceWildcard } from "../../types/wildcards/ReplaceWildcard";

describe("ReplaceWildcard - 边缘案例测试", () => {
    test("空字符串和单字符", () => {
        type Test1 = ReplaceWildcard<"">;
        type Test2 = ReplaceWildcard<"*">;
        type Test3 = ReplaceWildcard<"a">;

        type cases = [
            Expect<Equal<Test1, "">>,
            Expect<Equal<Test2, `${string}`>>,
            Expect<Equal<Test3, "a">>,
        ];
    });

    test("连续的斜杠", () => {
        type Test1 = ReplaceWildcard<"a//b">;
        type Test2 = ReplaceWildcard<"a///b">;

        type cases = [Expect<Equal<Test1, "a//b">>, Expect<Equal<Test2, "a///b">>];
    });

    test("开头和结尾的斜杠", () => {
        type Test1 = ReplaceWildcard<"/a">;
        type Test2 = ReplaceWildcard<"a/">;
        type Test3 = ReplaceWildcard<"/a/b/">;

        type cases = [
            Expect<Equal<Test1, "/a">>,
            Expect<Equal<Test2, "a/">>,
            Expect<Equal<Test3, "/a/b/">>,
        ];
    });

    test("混合多种通配符", () => {
        type Test1 = ReplaceWildcard<"a/*/b/**/c">;
        type Test2 = ReplaceWildcard<"**/a/*/b">;

        type cases = [
            Expect<Equal<Test1, `a/${string}/b/${string}/c`>>,
            Expect<Equal<Test2, `${string}/a/${string}/b`>>,
        ];
    });

    test("只有斜杠和通配符", () => {
        type Test1 = ReplaceWildcard<"/*">;
        type Test2 = ReplaceWildcard<"*/">;
        type Test3 = ReplaceWildcard<"/*/">;

        type cases = [
            Expect<Equal<Test1, `/${string}`>>,
            Expect<Equal<Test2, `${string}/`>>,
            Expect<Equal<Test3, `/${string}/`>>,
        ];
    });
});
