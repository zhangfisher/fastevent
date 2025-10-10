/* eslint-disable no-unused-vars */

import { describe, test, expect } from 'vitest';
import type { Equal, Expect, NotAny } from '@type-challenges/utils';
import { FastEvent } from '../../event';
import { FastEventScope, FastEventScopeExtend, FastEventScopeMeta } from '../../scope';
import { ChangeFieldType, FastEventMeta, FastEvents, RequiredItems, ScopeEvents, TypedFastEventListener } from '../../types';

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
            'x/users/*/*': 1;
            'x/users/*/offline': boolean;
            'x/posts/*/online': string;
            'x/posts/**': number;
        };
        const emitter = new FastEvent<Events>();
        emitter.on('x/posts/fisher/online', (message) => {
            type cases = [
                Expect<Equal<typeof message.type, 'x/posts/*/online'>>, 
                Expect<Equal<typeof message.payload, string>>
            ];
        });
        
        
        // 不需要显式指定类型参数，应该能自动推断
        const scope = emitter.scope('x');

        type scopEvents = typeof scope.types.events;

        type cases = [Expect<Equal<scopEvents, ScopeEvents<Events, 'x'>>>];

        scope.on('users/x/online', (message) => {
            type cases = [Expect<Equal<typeof message.type, 'users/*/online'>>, Expect<Equal<typeof message.payload, { name: string; status?: number }>>];
        });
        scope.on('users/x/y', (message) => {
            type cases = [Expect<Equal<typeof message.type, 'users/*/*'>>, Expect<Equal<typeof message.payload, 1>>];
        });

        scope.on('posts/fisher/online', (message) => {
            type cases = [
                Expect<Equal<typeof message.type, 'posts/*/online'>>, 
                Expect<Equal<typeof message.payload, string>>
            ];
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

        class CustomScope extends FastEventScope {
            test() {}
        }
        type S = ScopeEvents<Events, 'rooms/a'>;

        function getRoomScope<Prefix extends string>(prefix: Prefix) {
            return emitter.scope(`rooms/${prefix}`, new CustomScope());
        }

        const scope = getRoomScope('y');
        scope.test;
        scope.on('users/online', (message) => {
            type cases = [Expect<Equal<typeof message.type, 'users/online'>>, Expect<Equal<typeof message.payload, { name: string; status?: number }>>];
        });

        type scopEvents = keyof typeof scope.types.events;
    });
    test('继承scope类2', () => {
        interface VoerkaModuleEvents {
            initial: string;
            create: string;
            ready: string;
            start: string;
            stop: string;
            reset: string;
            observabled: string;
            stateUpdated: string;
            settingUpdated: string;
        }

        type dd = VoerkaModuleEvents & Record<string, any>;

        class ModuleBase<Events extends Record<string, any> = {}> extends FastEventScope<VoerkaModuleEvents & Events> {
            test(this: FastEventScope<VoerkaModuleEvents>) {
                type events = typeof this.types.events;
                this.on('initial', (message) => {
                    message.type;
                    message.payload;
                    type cases = [Expect<Equal<typeof message.type, 'initial'>>, Expect<Equal<typeof message.payload, string>>];
                });
            }
        }

        class BModule extends ModuleBase<{ name: string }> {
            test2() {
                this.on('name', (message) => {
                    message.type;
                    message.payload;
                });
            }
        }

        const module = new ModuleBase();
        type d = typeof module.types.events;

        // module.on('create', (msg) => {
        //     msg.type;
        //     msg.payload;
        // });

        const b1 = new BModule();
        type bevents = keyof typeof b1.types.events;

        b1.test;
        b1.test2;
    });
    test('继承scope类32', () => {
        type Events = {
            'rooms/*/users/online': { name: string; status?: number };
            'rooms/*/users/*/online': { name: string; status?: number };
            'rooms/*/users/*/offline': boolean;
            'rooms/*/posts/**': number;
            'rooms/*/posts/*/online': number;
        };
        const emitter = new FastEvent<Events>();

        class CustomScope extends FastEventScope {
            join(name: string) {}
            leave() {}
        }
        type S = ScopeEvents<Events, 'rooms/y'>;

        function getRoom<Prefix extends string>(prefix: Prefix) {
            return emitter.scope(`rooms/${prefix}`, new CustomScope()); // as FastEventScopeExtend<Events, `rooms/${Prefix}`, CustomScope>;
        }

        const room = getRoom('y');
        type RoomEvents = typeof room.types.events;
        room.join('fisher');
        room.leave();
        room.on('posts/a', (message) => {
            message.type;
            message.payload;
        });
        room.on('users/online', (message) => {
            type cases = [Expect<Equal<typeof message.type, 'users/online'>>, Expect<Equal<typeof message.payload, { name: string; status?: number }>>];
        });
    });

    test('继承scope类4', () => {
        type Events = {
            'rooms/*/users/online': { name: string; status?: number };
            'rooms/*/users/*/online': { name: string; status?: number };
            'rooms/*/users/*/offline': boolean;
            'rooms/*/posts/**': number;
            'rooms/*/posts/*/online': number;
        };
        const emitter = new FastEvent<Events>();

        class User extends FastEventScope {
            login(name: string) {}
            logout() {}
        }

        const useScope = emitter.scope(`rooms/x`);
        const jack = useScope.scope('users/jack', new User());

        jack.login('');
        jack.logout();

        jack.on('online', (message) => {
            type cases = [Expect<Equal<typeof message.type, 'online'>>, Expect<Equal<typeof message.payload, { name: string; status?: number }>>];
        });
        jack.on('offline', (message) => {
            type cases = [Expect<Equal<typeof message.type, 'offline'>>, Expect<Equal<typeof message.payload, boolean>>];
        });
    });
    test('scope监听器类型', () => {
        type Events = {
            'rooms/*/users/online': { name: string; status?: number };
            'rooms/*/users/*/online': { name: string; status?: number };
            'rooms/*/users/*/offline': boolean;
            'rooms/*/posts/**': number;
            'rooms/*/posts/*/online': number;
        };
        const emitter = new FastEvent<Events>();
        const useScope = emitter.scope(`rooms/x`);

        type ScopeListeners = typeof useScope.types.listeners;

        // 'users/online': TypedFastEventListener<"users/online", {
        //         name: string;
        //         status?: number;
        //     }, FastEventMeta & FastEventScopeMeta & Record<string, any>, any>;
        //     'users/*/online': TypedFastEventListener<...>;
        //     'users/*/offline': TypedFastEventListener<...>;
        //     'posts/**': TypedFastEventListener<...>;
        //     'posts/*/online': TypedFastEventListener<...>;
        type ListenerKeys = keyof ScopeListeners;
        type cases = [
            Expect<Equal<ScopeListeners['users/online'], 
            TypedFastEventListener<"users/online", {name: string;status?: number}, FastEventMeta & FastEventScopeMeta & Record<string, any>, any
            >>>,
            Expect<Equal<ListenerKeys, 'users/online' | 'users/*/online' | 'users/*/offline' | 'posts/**' | 'posts/*/online'>>
        ];
        

    });
});
