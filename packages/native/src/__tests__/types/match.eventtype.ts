/* eslint-disable no-unused-vars */
import { describe, test, expect } from 'vitest';
import type { Equal, Expect, NotAny } from '@type-challenges/utils';
import { WildcardEvents, ScopeEvents, ClosestWildcardEvents } from '../../types';
import { FastEvent } from '../../event';

describe('事件通配符匹配', () => {
    test('精确匹配', () => {
        type Events = {
            a: string;
            'b/b1': number;
            'c/c1/c2': boolean;
        };
        type cases = [
            Expect<Equal<WildcardEvents<Events, 'a'>, { a: string }>>,
            Expect<Equal<WildcardEvents<Events, 'b/b1'>, { 'b/b1': number }>>,
            Expect<Equal<WildcardEvents<Events, 'c/c1/c2'>, { 'c/c1/c2': boolean }>>,
        ];
    });
    test('不匹配的情况', () => {
        type Events = {
            'a/*': string;
            'b/b1': number;
            'c/c1/c2': boolean;
        };

        type cases = [Expect<Equal<WildcardEvents<Events, 'a'>, { a: any }>>];
    });
    test('单层通配符匹配', () => {
        type Events = {
            'a/*': string;
            'a/*/x': string;
            'b/*': number;
            'b/*/y': number;
            'c/*': boolean;
        };
        type cases = [
            Expect<Equal<WildcardEvents<Events, 'a'>, { a: any }>>,
            Expect<Equal<WildcardEvents<Events, 'a/x'>, { 'a/*': string }>>,
            Expect<Equal<WildcardEvents<Events, 'a/y'>, { 'a/*': string }>>,
            Expect<Equal<WildcardEvents<Events, 'a/z/x'>, { 'a/*/x': string }>>,

            Expect<Equal<WildcardEvents<Events, 'b'>, { b: any }>>,
            Expect<Equal<WildcardEvents<Events, 'b/x'>, { 'b/*': number }>>,
            Expect<Equal<WildcardEvents<Events, 'b/y'>, { 'b/*': number }>>,
            Expect<Equal<WildcardEvents<Events, 'b/z/y'>, { 'b/*/y': number }>>,
        ];
    });
    test('同时多个匹配的情况', () => {
        type Events = {
            'rooms/*/join': string;
            'rooms/*/*': number;
        };
        type a = ClosestWildcardEvents<Events, 'rooms/a/join'>;
        type b = ClosestWildcardEvents<Events, 'rooms/a/xx'>;

        type cases = [
            Expect<
                Equal<
                    ClosestWildcardEvents<Events, 'rooms/a/join'>,
                    {
                        'rooms/*/join': string;
                    }
                >
            >,
            Expect<
                Equal<
                    ClosestWildcardEvents<Events, 'rooms/b/x'>,
                    {
                        'rooms/*/*': number;
                    }
                >
            >,
        ];
    });
    test('多个通配符匹配', () => {
        type Events = {
            'a/*': 1;
            'a/*/x': 2;
            'a/*/*/x': 2;
            'a/*/x/*/x': 3;
            'a/*/x/*/x/*/x': 4;
        };
        type cases = [
            Expect<Equal<WildcardEvents<Events, 'a'>, { a: any }>>,
            Expect<Equal<WildcardEvents<Events, 'a/1'>, { 'a/*': 1 }>>,
            Expect<Equal<WildcardEvents<Events, 'a/1/x'>, { 'a/*/x': 2 }>>,
            Expect<Equal<WildcardEvents<Events, 'a/1/2/x'>, { 'a/*/*/x': 2 }>>,
            Expect<Equal<WildcardEvents<Events, 'a/1/x/2/x'>, { 'a/*/x/*/x': 3 }>>,
            Expect<Equal<WildcardEvents<Events, 'a/1/x/2/x/3/x'>, { 'a/*/x/*/x/*/x': 4 }>>,
        ];
    });
    test('未尾通配符匹配', () => {
        type Events = {
            'a/*': 1;
            'a/*/*': 2;
            'a/*/*/*': 3;
            'a/*/*/*/*': 4;
            'a/*/*/*/*/*': 5;
            'a/*/*/*/*/*/*': 6;
        };
        type cases = [
            Expect<Equal<WildcardEvents<Events, 'a'>, { a: any }>>,
            Expect<Equal<WildcardEvents<Events, 'a/1'>, { 'a/*': 1 }>>,
            Expect<Equal<WildcardEvents<Events, 'a/1/2'>, { 'a/*/*': 2 }>>,
            Expect<Equal<WildcardEvents<Events, 'a/1/2/3'>, { 'a/*/*/*': 3 }>>,
            Expect<Equal<WildcardEvents<Events, 'a/1/2/3/4'>, { 'a/*/*/*/*': 4 }>>,
            Expect<Equal<WildcardEvents<Events, 'a/1/2/3/4/5'>, { 'a/*/*/*/*/*': 5 }>>,
            Expect<Equal<WildcardEvents<Events, 'a/1/2/3/4/5/6'>, { 'a/*/*/*/*/*/*': 6 }>>,
        ];
    });
    test('多级通配符匹配', () => {
        type Events = {
            'a/*': 1;
            'a/b/**': 2;
            'a/b/c1/**': 3;
            'a/b/c2/**': 3;
            'a/b/c/d/**': 4;
            'a/b/c/d/e/**': 5;
        };

        type s = WildcardEvents<Events, 'a/b/c1/x'>;

        type cases = [
            Expect<Equal<WildcardEvents<Events, 'a'>, { a: any }>>,
            Expect<Equal<WildcardEvents<Events, 'a/x'>, { 'a/*': 1 }>>,
            Expect<Equal<WildcardEvents<Events, 'a/b/x'>, { 'a/b/**': 2 }>>,
            Expect<Equal<WildcardEvents<Events, 'a/b/x/y'>, { 'a/b/**': 2 }>>,
            Expect<Equal<WildcardEvents<Events, 'a/b/x/y/z'>, { 'a/b/**': 2 }>>,
        ];
    });
    test('订阅通配符事件', () => {
        type Events = {
            'users/*/online': string;
            'users/*/offline': boolean;
            'post/*': number;
        };
        const emitter = new FastEvent<Events>();
        emitter.on('users/fisher/online', (event) => {
            type cases = [Expect<Equal<typeof event.type, 'users/*/online'>>, Expect<Equal<typeof event.payload, string>>];
        });
        emitter.on('users/fisher/offline', (event) => {
            type cases = [Expect<Equal<typeof event.type, 'users/*/offline'>>, Expect<Equal<typeof event.payload, boolean>>];
        });
        emitter.on('users/xxxxx', (event) => {
            type cases = [Expect<Equal<typeof event.type, 'users/xxxxx'>>, Expect<Equal<typeof event.payload, any>>];
        });
        emitter.once('users/fisher/online', (event) => {
            type cases = [Expect<Equal<typeof event.type, 'users/*/online'>>, Expect<Equal<typeof event.payload, string>>];
        });
        emitter.once('users/fisher/offline', (event) => {
            type cases = [Expect<Equal<typeof event.type, 'users/*/offline'>>, Expect<Equal<typeof event.payload, boolean>>];
        });
        emitter.once('users/xxxxx', (event) => {
            type cases = [Expect<Equal<typeof event.type, 'users/xxxxx'>>, Expect<Equal<typeof event.payload, any>>];
        });

        const scope = emitter.scope('users');

        scope.on('a/online', (event) => {
            type cases = [Expect<Equal<typeof event.type, '*/online'>>, Expect<Equal<typeof event.payload, string>>];
        });
    });
    test('发布通配符事件', () => {
        type Events = {
            a: number;
            'users/*/online': { name: string; status?: number };
            'users/*/offline': boolean;
            'posts/**': number;
        };
        const emitter = new FastEvent<Events>();
        emitter.emit('a', 1);
        emitter.emit('users/fisher/online', { name: 'string', status: 1 });
        emitter.emit('users/fisher/online', { name: 'string' });
        emitter.emit('users/fisher/offline', true);
        emitter.emit('posts/fisher/offline', 1);

        // emitter.emit('a', 'x');
        // emitter.emit('users/fisher/online', 'x');
        // emitter.emit('users/fisher/offline', 1);
        // emitter.emit('posts/fisher/offline', true);
    });
    test('发布通配符事件', () => {
        type Events = {
            'x/users/online': { name: string; status?: number };
            'x/users/*/online': { name: string; status?: number };
            'x/users/*/*': { name: string; status?: number };
            'x/posts/*/online': string;
            'x/posts/**': number;
            'x/devices/*/*': number;
            'x/devices/*/offline': boolean;
            'x/devices/**': boolean;
        };
        const emitter = new FastEvent<Events>();

        emitter.on('x/users/x/online', (message) => {
            type cases = [Expect<Equal<typeof message.type, 'x/users/*/online'>>, Expect<Equal<typeof message.payload, { name: string; status?: number }>>];
        });

        emitter.on('x/posts/fisher/online', (message) => {
            type cases = [Expect<Equal<typeof message.type, 'x/posts/*/online'>>, Expect<Equal<typeof message.payload, string>>];
        });
        // 当存在多个匹配事件，匹配事件时与声明顺序有关。
        // 'x/devices/x/offline'能同时与'x/devices/*/*'和'x/devices/*/offline'匹配，但是'x/devices/*/offline'的优先级更高
        // 一般情况下应该将明确语义的类型排在前面
        emitter.on('x/devices/x/offline', (message) => {
            type cases = [Expect<Equal<typeof message.type, 'x/devices/*/*'>>, Expect<Equal<typeof message.payload, number>>];
        });
        emitter.once('x/users/x/online', (message) => {
            type cases = [Expect<Equal<typeof message.type, 'x/users/*/online'>>, Expect<Equal<typeof message.payload, { name: string; status?: number }>>];
        });

        emitter.once('x/posts/fisher/online', (message) => {
            type cases = [Expect<Equal<typeof message.type, 'x/posts/*/online'>>, Expect<Equal<typeof message.payload, string>>];
        });
        // 当存在多个匹配事件，匹配事件时与声明顺序有关。
        // 'x/devices/x/offline'能同时与'x/devices/*/*'和'x/devices/*/offline'匹配，但是'x/devices/*/*'声明在前，所以优先匹配
        // 所以一般情况下应该将明确语义的类型排在前面
        emitter.once('x/devices/x/offline', (message) => {
            type cases = [Expect<Equal<typeof message.type, 'x/devices/*/*'>>, Expect<Equal<typeof message.payload, number>>];
        });
    });
});
