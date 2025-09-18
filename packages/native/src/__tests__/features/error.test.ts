import { describe, it, expect, vi } from 'vitest';
import { FastEvent } from '../../event';

describe('监听器函数出错时的处理', () => {
    it('单个监听器出错且ignoreErrors=true时，应捕获错误并返回错误对象', () => {
        const emitter = new FastEvent({ ignoreErrors: true });
        const error = new Error('测试错误');

        emitter.on('test', () => {
            throw error;
        });

        const results = emitter.emit('test', 1);
        expect(results).toHaveLength(1);
        expect(results[0]).toBe(error);
    });

    it('单个监听器出错且ignoreErrors=false时，应抛出错误', () => {
        const emitter = new FastEvent({ ignoreErrors: false });

        emitter.on('test', () => {
            throw new Error('测试错误');
        });

        expect(() => emitter.emit('test')).toThrow('测试错误');
    });

    it('多个监听器中有部分出错且ignoreErrors=true时，应返回正确结果和错误对象', () => {
        const emitter = new FastEvent({ ignoreErrors: true });
        const error = new Error('测试错误');
        const successResult = '成功结果';

        emitter.on('test', () => successResult);
        emitter.on('test', () => {
            throw error;
        });

        const results = emitter.emit('test');
        expect(results).toHaveLength(2);
        expect(results).toContain(successResult);
        expect(results).toContain(error);
    });

    it('多个监听器中有部分出错且ignoreErrors=false时，应在第一个错误处抛出', () => {
        const emitter = new FastEvent({ ignoreErrors: false });
        const error = new Error('测试错误');

        const mockListener1 = vi.fn(() => {
            throw error;
        });
        const mockListener2 = vi.fn(() => '不应执行到这里');

        emitter.on('test', mockListener1);
        emitter.on('test', mockListener2);

        expect(() => emitter.emit('test')).toThrow(error);
        expect(mockListener1).toHaveBeenCalled();
        expect(mockListener2).not.toHaveBeenCalled();
    });

    it('emitAsync时单个监听器出错且ignoreErrors=true，应返回包含错误的Promise', async () => {
        const emitter = new FastEvent({ ignoreErrors: true });
        const error = new Error('测试错误');

        emitter.on('test', () => {
            throw error;
        });

        const results = await emitter.emitAsync('test');
        expect(results).toHaveLength(1);
        expect(results[0]).toBe(error);
    });

    it('emitAsync时单个监听器出错且ignoreErrors=false，应返回拒绝的Promise', async () => {
        const emitter = new FastEvent({ ignoreErrors: false });
        const error = new Error('测试错误');

        emitter.on('test', () => {
            throw error;
        });

        await expect(emitter.emitAsync('test')).rejects.toThrow(error);
    });

    it('emitAsync时多个监听器有部分出错且ignoreErrors=true，应返回所有结果', async () => {
        const emitter = new FastEvent({ ignoreErrors: true });
        const error = new Error('测试错误');
        const successResult = '成功结果';

        emitter.on('test', () => successResult);
        emitter.on('test', () => {
            throw error;
        });

        const results = await emitter.emitAsync('test');
        expect(results).toHaveLength(2);
        expect(results).toContain(successResult);
        expect(results).toContain(error);
    });

    it('emitAsync时多个监听器有部分出错且ignoreErrors=false，应返回拒绝的Promise', async () => {
        const emitter = new FastEvent({ ignoreErrors: false });
        const error = new Error('测试错误');
        const successResult = '成功结果';

        emitter.on('test', () => successResult);
        emitter.on('test', () => {
            throw error;
        });

        await expect(emitter.emitAsync('test')).rejects.toThrow(error);
    });
});
