// @ts-nocheck
import { describe, test, expect } from 'vitest';
import { FastEvent } from '../../event';

describe('上下文测试', () => {
    test('FastEvent不设置上下文时的行为', () => {
        const emitter = new FastEvent();
        let actualThis: any;

        emitter.on('test', function (this: any) {
            actualThis = this;
        });

        emitter.emit('test');
        // 当未指定context时，this应该指向emitter实例
        expect(actualThis).toBe(emitter);
    });

    test('FastEvent设置上下文时的行为', () => {
        const context = { value: 42 };
        const emitter = new FastEvent({ context });
        let actualThis: any;

        emitter.on('test', function (this: any) {
            actualThis = this;
        });

        emitter.emit('test');
        expect(actualThis).toBe(context);
        expect(actualThis.value).toBe(42);
    });

    test('FastEvent的once方法中的上下文行为', () => {
        const context = { value: 42 };
        const emitter = new FastEvent({ context });
        let actualThis: any;

        emitter.once('test', function (this: any) {
            actualThis = this;
        });

        emitter.emit('test');
        expect(actualThis).toBe(context);
        expect(actualThis.value).toBe(42);
    });

    test('FastEvent的onAny方法中的上下文行为', () => {
        const context = { value: 42 };
        const emitter = new FastEvent({ context });
        let actualThis: any;

        emitter.onAny(function (this: any) {
            actualThis = this;
        });

        emitter.emit('test');
        expect(actualThis).toBe(context);
        expect(actualThis.value).toBe(42);
    });

    test('FastEventScope从发射器继承上下文', () => {
        const context = { value: 42 };
        const emitter = new FastEvent({ context });
        const scope = emitter.scope('test');
        let actualThis: any;

        scope.on('event', function (this: any) {
            actualThis = this;
        });

        scope.emit('event');
        expect(actualThis).toBe(context);
        expect(actualThis.value).toBe(42);
    });

    test('FastEventScope使用自定义上下文', () => {
        const emitterContext = { value: 42 };
        const scopeContext = { value: 100 };
        const emitter = new FastEvent({ context: emitterContext });
        const scope = emitter.scope('test', { context: scopeContext });
        let actualThis: any;

        scope.on('event', function (this: any) {
            actualThis = this;
        });

        scope.emit('event');
        expect(actualThis).toBe(scopeContext);
        expect(actualThis.value).toBe(100);
    });

    test('嵌套的FastEventScope上下文继承', () => {
        const emitterContext = { value: 42 };
        const scope1Context = { value: 100 };
        const scope2Context = { value: 200 };

        const emitter = new FastEvent({ context: emitterContext });
        const scope1 = emitter.scope('scope1', { context: scope1Context });
        const scope2 = scope1.scope('scope2', { context: scope2Context });

        let actualThis1: any;
        let actualThis2: any;

        scope1.on('event', function (this: any) {
            actualThis1 = this;
        });

        scope2.on('event', function (this: any) {
            actualThis2 = this;
        });

        scope1.emit('event');
        expect(actualThis1).toBe(scope1Context);
        expect(actualThis1.value).toBe(100);

        scope2.emit('event');
        expect(actualThis2).toBe(scope2Context);
        expect(actualThis2.value).toBe(200);
    });

    test('多层嵌套作用域不覆盖上下文时的继承', () => {
        const rootContext = { value: 'root' };
        const emitter = new FastEvent({ context: rootContext });

        const scope1 = emitter.scope('scope1');
        const scope2 = scope1.scope('scope2');
        const scope3 = scope2.scope('scope3');

        let actualThis1: any;
        let actualThis2: any;
        let actualThis3: any;

        scope1.on('event', function (this: any) {
            actualThis1 = this;
        });

        scope2.on('event', function (this: any) {
            actualThis2 = this;
        });

        scope3.on('event', function (this: any) {
            actualThis3 = this;
        });

        scope1.emit('event');
        scope2.emit('event');
        scope3.emit('event');

        // 所有scope都应该继承root context
        expect(actualThis1).toBe(rootContext);
        expect(actualThis2).toBe(rootContext);
        expect(actualThis3).toBe(rootContext);
    });

    test('混合上下文继承的嵌套作用域', () => {
        const rootContext = { value: 'root' };
        const scope2Context = { value: 'scope2' };

        const emitter = new FastEvent({ context: rootContext });
        const scope1 = emitter.scope('scope1'); // 继承root context
        const scope2 = scope1.scope('scope2', { context: scope2Context }); // 自定义context
        const scope3 = scope2.scope('scope3'); // 继承scope2 context

        let actualThis1: any;
        let actualThis2: any;
        let actualThis3: any;

        scope1.on('event', function (this: any) {
            actualThis1 = this;
        });

        scope2.on('event', function (this: any) {
            actualThis2 = this;
        });

        scope3.on('event', function (this: any) {
            actualThis3 = this;
        });

        scope1.emit('event');
        scope2.emit('event');
        scope3.emit('event');

        expect(actualThis1).toBe(rootContext);
        expect(actualThis1.value).toBe('root');

        expect(actualThis2).toBe(scope2Context);
        expect(actualThis2.value).toBe('scope2');

        expect(actualThis3).toBe(scope2Context);
        expect(actualThis3.value).toBe('scope2');
    });

    test('不同事件类型中的上下文行为', () => {
        const context = { value: 42 };
        const emitter = new FastEvent({ context });
        let actualThis1: any;
        let actualThis2: any;
        let actualThis3: any;

        // 普通事件
        emitter.on('test', function (this: any) {
            actualThis1 = this;
        });

        // 带通配符的事件
        emitter.on('test/*', function (this: any) {
            actualThis2 = this;
        });

        // 全局监听
        emitter.on('**', function (this: any) {
            actualThis3 = this;
        });

        emitter.emit('test');
        emitter.emit('test/abc');

        expect(actualThis1).toBe(context);
        expect(actualThis2).toBe(context);
        expect(actualThis3).toBe(context);
    });
});
