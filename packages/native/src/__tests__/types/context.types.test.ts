/* eslint-disable no-unused-vars */
import { describe, test, expect } from 'vitest';
import type { Equal, Expect, NotAny } from '@type-challenges/utils';
import { FastEvent } from '../../event';
import { FastEventScope, FastEventScopeMeta } from '../../scope';
import { FastEventMeta } from '../../types';

describe('类型系统测试', () => {
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
        type Ctx = [Expect<Equal<typeof emitter.options.context, { root: boolean }>>, Expect<Equal<typeof emitter.context, { root: boolean }>>];

        emitter.on('xxx', function (this, message) {
            type cases = [Expect<Equal<typeof this, { root: boolean }>>];
        });

        emitter.once('xxx', function (this, message) {
            type cases = [Expect<Equal<typeof this, { root: boolean }>>];
        });
    });
    // test("作用域继承未指定上下文时的类型推导", () => {
    //     const emitter = new FastEvent()
    //     const withoutCtxScope = emitter.scope("x/y/z")
    //     type withoutScopeCtx = Expect<Equal<typeof withoutCtxScope.options.context, never>>

    //     withoutCtxScope.on("xxx", function (this, message) {
    //         type cases = [
    //             Expect<Equal<typeof this, FastEventScope>>
    //         ]
    //     })

    //     withoutCtxScope.once("xxx", function (this, message) {
    //         type cases = [
    //             Expect<Equal<typeof this, FastEventScope>>
    //         ]
    //     })
    // })
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
});

// interface MyEvents {
//     'user/login': { id: number; name: string };
//     'user/logout': { id: number };
//     'system/error': { code: string; message: string };
// }

// const events = new FastEvent<MyEvents>();

// // ✅ 正确：数据类型匹配
// events.emit('user/login', { id: 1, name: 'Alice' });
// // ✅ 正确：消息对象
// events.emit({
//     type: 'user/login',
//     payload: { id: 1, name: 'Alice' }
// });
// // ✅ 正确：支持触发未定义的事件类型
// events.emit({
//     type: 'xxxxx',
//     payload: { id: 1, name: 'Alice' }
// });
// // ✅ 正确：支持触发 未定义的事件类型
// events.emit('xxxx', 1);

// // ❌ 错误：已声明事件类型payload不匹配
// events.emit('user/login', { id: "1", name: 'Alice' }); // TypeScript 错误
// // ❌ 错误：id类型不匹配
// events.emit({
//     type: 'user/login',
//     payload: { id: "1", name: 'Alice' }
// });

// const scope = events.scope('user')

// // ✅ 正确：数据类型匹配
// scope.emit('user/login', { id: 1, name: 'Alice' });
// // ✅ 正确：支持触发 未定义的事件类型
// scope.emit('xxxx', 1);
// // ✅ 正确：消息对象
// scope.emit({
//     type: 'login',
//     payload: { id: 1, name: 'Alice' }
// });
// // ✅ 正确：支持触发未定义的事件类型
// scope.emit({
//     type: 'xxxxx',
//     payload: { id: 1, name: 'Alice' }
// });

// // ❌ 错误：已声明事件类型payload不匹配
// scope.emit('login', { id: "1", name: 'Alice' }); // TypeScript 错误
// // ❌ 错误：id类型不匹配
// scope.emit({
//     type: 'login',
//     payload: { id: "1", name: 'Alice' }
// });
