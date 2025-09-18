/* eslint-disable no-unused-vars */

import { describe, test, expect } from 'vitest';
import type { Equal, Expect, NotAny } from '@type-challenges/utils';
import { FastEvent } from '../../event';
import { FastEventScope, FastEventScopeMeta } from '../../scope';
import { ChangeFieldType, FastEventMeta, FastEvents, RequiredItems, ScopeEvents } from '../../types';

declare module '../../types' {
    interface FastEventMeta {
        x?: number;
    }
}

describe('事件作用域类型测试', () => {
    type CustomEvents = {
        a: boolean;
        b: number;
        c: string;
    };
    const emitter = new FastEvent();
    test('scope事件类型测试', () => {
        const scope = emitter.scope<{
            x: number;
            y: string;
        }>('a/b/c');

        scope.on('x', (message) => {
            message.meta;
            type cases = [
                Expect<Equal<typeof message.type, 'x'>>,
                Expect<Equal<typeof message.payload, number>>,
                Expect<Equal<typeof message.meta, FastEventMeta & FastEventScopeMeta & Record<string, any>>>,
                Expect<Equal<typeof message.meta.x, number | undefined>>,
            ];
        });
    });
    test('scope事件类型测试', () => {
        type CustomScopeEvents = {
            x: number;
            y: string;
        };
        const scope = emitter.scope<CustomScopeEvents>('a/b/c');

        scope.on('x', (message) => {
            type cases = [
                Expect<Equal<typeof message.type, 'x'>>,
                Expect<Equal<typeof message.payload, number>>,
                Expect<Equal<typeof message.meta, FastEventMeta & FastEventScopeMeta & Record<string, any>>>,
            ];
        });
    });
});

describe('作用域上下文类型系统', () => {
    test('未指定上下文时应使用默认上下文类型', () => {
        const withoutCtxEmitter = new FastEvent();
        type Ctx1 = Expect<Equal<typeof withoutCtxEmitter.options.context, never>>;

        withoutCtxEmitter.on('xxx', function (this, message) {
            type cases = [Expect<Equal<typeof this, FastEvent>>];
        });

        withoutCtxEmitter.once('xxx', function (this, message) {
            type cases = [Expect<Equal<typeof this, FastEvent>>];
        });
    });

    test('指定上下文时的类型推导', () => {
        const emitter = new FastEvent({
            context: {
                root: true,
            },
        });
        type Ctx = Expect<Equal<typeof emitter.context, { root: boolean }>>;

        emitter.on('xxx', function (this, message) {
            type cases = [Expect<Equal<typeof this, { root: boolean }>>];
        });

        emitter.once('xxx', function (this, message) {
            type cases = [Expect<Equal<typeof this, { root: boolean }>>];
        });
    });

    test('作用域继承上下文时的类型推导', () => {
        const emitter = new FastEvent({
            context: {
                root: true,
            },
        });
        const withoutCtxScope = emitter.scope('x/y/z');
        type withoutScopeCtx = Expect<Equal<typeof withoutCtxScope.options.context, { root: boolean }>>;

        withoutCtxScope.on('xxx', function (this, message) {
            type cases = [Expect<Equal<typeof this, { root: boolean }>>];
        });

        withoutCtxScope.once('xxx', function (this, message) {
            type cases = [Expect<Equal<typeof this, { root: boolean }>>];
        });
    });

    test('作用域自定义上下文时的类型推导', () => {
        const emitter = new FastEvent({
            context: {
                root: true,
            },
        });
        const scope = emitter.scope('x/y/z', {
            context: 1,
        });
        type scopeEvents = typeof scope.types.events;

        type scopeCtx = Expect<Equal<typeof scope.options.context, number>>;

        scope.on('a', function (this, message) {
            type cases = [
                Expect<Equal<typeof this, number>>,
                Expect<Equal<typeof message.type, 'a'>>,
                Expect<Equal<typeof message.payload, any>>,
                Expect<Equal<typeof message.meta, FastEventMeta & Record<string, any> & FastEventScopeMeta>>,
            ];
        });

        scope.once('a', function (this, message) {
            type cases = [
                Expect<Equal<typeof this, number>>,
                Expect<Equal<typeof message.type, 'a'>>,
                Expect<Equal<typeof message.payload, any>>,
                Expect<Equal<typeof message.meta, FastEventMeta & Record<string, any> & FastEventScopeMeta>>,
            ];
        });
    });
    test('作用域指定事件类型', () => {
        const emitter = new FastEvent();
        const scope = emitter.scope<{
            a: boolean;
            b: number;
            c: string;
        }>('x/y/z');
        type ScopeEvents = typeof scope.types.events;
        type cases = [Expect<Equal<ScopeEvents['a'], boolean>>, Expect<Equal<ScopeEvents['b'], number>>, Expect<Equal<ScopeEvents['c'], string>>];
        scope.emit('a');
        scope.emitAsync('b', 1);
    });
    test('scope发布通配符事件', () => {
        type Events = {
            'x/users/online': { name: string; status?: number };
            'x/users/*/online': { name: string; status?: number };
            'x/users/*/offline': boolean;
            'x/posts/**': number;
            'x/posts/*/online': number;
        };
        const emitter = new FastEvent<Events>();
        // 不需要显式指定类型参数，应该能自动推断
        const scope = emitter.scope('x');

        type scopEvents = typeof scope.types.events;

        type cases = [Expect<Equal<scopEvents, ScopeEvents<Events, 'x'>>>];

        scope.on('users/x/online', (message) => {
            type cases = [Expect<Equal<typeof message.type, 'users/*/online'>>, Expect<Equal<typeof message.payload, { name: string; status?: number }>>];
        });

        scope.on('posts/fisher/online', (message) => {
            type cases = [Expect<Equal<typeof message.type, 'posts/**' | 'posts/*/online'>>, Expect<Equal<typeof message.payload, number>>];
        });

        // 正确的类型检查
        scope.emit('users/fisher/online', { name: 'string', status: 1 });
        scope.emit('users/fisher/online', { name: 'string' });
        scope.emit('users/fisher/offline', true);
        scope.emit('posts/fisher/offline', 1);

        // 类型错误的调用，应该被TypeScript标记为错误
        // scope.emit('users/fisher/online', 1);
        // scope.emit('users/fisher/online', 2);
        // scope.emit('users/fisher/offline', 1);
        // scope.emit('posts/fisher/offline', '22');
    });
    test('继承scope类', () => {
        type Events = {
            'rooms/*/users/online': { name: string; status?: number };
            'rooms/*/users/*/online': { name: string; status?: number };
            'rooms/*/users/*/offline': boolean;
            'rooms/*/posts/**': number;
            'rooms/*/posts/*/online': number;
        };
        const emitter = new FastEvent<Events>();

        class CustomScope<Prefix extends string = string> extends FastEventScope<ScopeEvents<Events, Prefix>> {
            test() {}
        }
        type S = ScopeEvents<Events, 'rooms/a'>;

        function getRoomScope<Prefix extends string>(prefix: Prefix) {
            return emitter.scope(prefix, new CustomScope<`rooms/${Prefix}`>());
        }

        const scope = getRoomScope('y');

        type scopEvents = keyof typeof scope.types.events;
    });
});
