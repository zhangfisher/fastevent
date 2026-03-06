/* eslint-disable no-unused-vars */

import { describe, test, expect } from 'vitest';
import type { Equal, Expect } from '@type-challenges/utils';
import type { ReplaceWildcard } from '../../types/ExpandWildcard';

describe('ReplaceWildcard', () => {
    test('通配符在普通字符串中间不应该被替换', () => {
        type Test1 = ReplaceWildcard<'simple*test'>;
        type cases = [Expect<Equal<Test1, 'simple*test'>>];
    });

    test('通配符在路径段边界应该被替换', () => {
        type Test2 = ReplaceWildcard<'user/*'>;
        type Test3 = ReplaceWildcard<'*/test'>;
        type Test4 = ReplaceWildcard<'a/*/b'>;
        type Test5 = ReplaceWildcard<'*'>;

        type cases = [
            Expect<Equal<Test2, `user/${string}`>>,
            Expect<Equal<Test3, `${string}/test`>>,
            Expect<Equal<Test4, `a/${string}/b`>>,
            Expect<Equal<Test5, `${string}`>>,
        ];
    });

    test('无通配符', () => {
        type Test6 = ReplaceWildcard<'a/b/c'>;
        type cases = [Expect<Equal<Test6, 'a/b/c'>>];
    });

    test('多级通配符', () => {
        type Test7 = ReplaceWildcard<'**'>;
        type Test8 = ReplaceWildcard<'a/**/b'>;

        type cases = [
            Expect<Equal<Test7, `${string}`>>,
            Expect<Equal<Test8, `a/${string}/b`>>,
        ];
    });

    test('复杂场景', () => {
        type Test9 = ReplaceWildcard<'a/b/*'>;
        type Test10 = ReplaceWildcard<'a/b/c*'>;
        type Test11 = ReplaceWildcard<'*a/b/c'>;
        type Test12 = ReplaceWildcard<'a*b/c*d'>;

        type cases = [
            Expect<Equal<Test9, `a/b/${string}`>>,
            Expect<Equal<Test10, 'a/b/c*'>>,
            Expect<Equal<Test11, '*a/b/c'>>,
            Expect<Equal<Test12, 'a*b/c*d'>>,
        ];
    });

    test('多个通配符在路径段中', () => {
        type Test13 = ReplaceWildcard<'a/*/b/*/c'>;
        type cases = [Expect<Equal<Test13, `a/${string}/b/${string}/c`>>];
    });

    test('混合场景', () => {
        type Test14 = ReplaceWildcard<'simple*test/path'>;
        type Test15 = ReplaceWildcard<'path/simple*test'>;
        type Test16 = ReplaceWildcard<'a/*/b*test'>;

        type cases = [
            Expect<Equal<Test14, 'simple*test/path'>>,
            Expect<Equal<Test15, 'path/simple*test'>>,
            Expect<Equal<Test16, `a/${string}/b*test`>>,
        ];
    });
});
