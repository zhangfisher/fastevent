/* eslint-disable no-unused-vars */
import { describe, test, expect } from 'vitest';
import type { Equal, Expect, NotAny } from '@type-challenges/utils';
import { MatchEventType, ScopeEvents } from '../../types';
import { FastEvent } from '../../event';

describe('事件通配符匹配', () => {
    test('精确匹配', () => {
        type Events = {
            a: string;
            'b/b1': number;
            'c/c1/c2': boolean;
        };
        type cases = [
            Expect<Equal<MatchEventType<'a', Events>, { a: string }>>,
            Expect<Equal<MatchEventType<'b/b1', Events>, { 'b/b1': number }>>,
            Expect<Equal<MatchEventType<'c/c1/c2', Events>, { 'c/c1/c2': boolean }>>,
        ];
    });
    test('不匹配的情况', () => {
        type Events = {
            'a/*': string;
            'b/b1': number;
            'c/c1/c2': boolean;
        };

        type cases = [Expect<Equal<MatchEventType<'a', Events>, { a: any }>>];
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
            Expect<Equal<MatchEventType<'a', Events>, { a: any }>>,
            Expect<Equal<MatchEventType<'a/x', Events>, { 'a/*': string }>>,
            Expect<Equal<MatchEventType<'a/y', Events>, { 'a/*': string }>>,
            Expect<Equal<MatchEventType<'a/z/x', Events>, { 'a/*/x': string }>>,

            Expect<Equal<MatchEventType<'b', Events>, { b: any }>>,
            Expect<Equal<MatchEventType<'b/x', Events>, { 'b/*': number }>>,
            Expect<Equal<MatchEventType<'b/y', Events>, { 'b/*': number }>>,
            Expect<Equal<MatchEventType<'b/z/y', Events>, { 'b/*/y': number }>>,
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
            Expect<Equal<MatchEventType<'a', Events>, { a: any }>>,
            Expect<Equal<MatchEventType<'a/1', Events>, { 'a/*': 1 }>>,
            Expect<Equal<MatchEventType<'a/1/x', Events>, { 'a/*/x': 2 }>>,
            Expect<Equal<MatchEventType<'a/1/2/x', Events>, { 'a/*/*/x': 2 }>>,
            Expect<Equal<MatchEventType<'a/1/x/2/x', Events>, { 'a/*/x/*/x': 3 }>>,
            Expect<Equal<MatchEventType<'a/1/x/2/x/3/x', Events>, { 'a/*/x/*/x/*/x': 4 }>>,
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
            Expect<Equal<MatchEventType<'a', Events>, { a: any }>>,
            Expect<Equal<MatchEventType<'a/1', Events>, { 'a/*': 1 }>>,
            Expect<Equal<MatchEventType<'a/1/2', Events>, { 'a/*/*': 2 }>>,
            Expect<Equal<MatchEventType<'a/1/2/3', Events>, { 'a/*/*/*': 3 }>>,
            Expect<Equal<MatchEventType<'a/1/2/3/4', Events>, { 'a/*/*/*/*': 4 }>>,
            Expect<Equal<MatchEventType<'a/1/2/3/4/5', Events>, { 'a/*/*/*/*/*': 5 }>>,
            Expect<Equal<MatchEventType<'a/1/2/3/4/5/6', Events>, { 'a/*/*/*/*/*/*': 6 }>>,
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

        type s = MatchEventType<'a/b/c1/x', Events>;

        type cases = [
            Expect<Equal<MatchEventType<'a', Events>, { a: any }>>,
            Expect<Equal<MatchEventType<'a/x', Events>, { 'a/*': 1 }>>,
            Expect<Equal<MatchEventType<'a/b/x', Events>, { 'a/b/**': 2 }>>,
            Expect<Equal<MatchEventType<'a/b/x/y', Events>, { 'a/b/**': 2 }>>,
            Expect<Equal<MatchEventType<'a/b/x/y/z', Events>, { 'a/b/**': 2 }>>,
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
});
