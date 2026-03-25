# FastEvent 测试指南

## 单元测试

使用 Vitest 进行测试：

```typescript
import { describe, it, expect } from 'vitest';
import { FastEvent } from 'fastevent';

describe('FastEvent', () => {
    it('应该正确发布和订阅事件', () => {
        const events = new FastEvent();
        let received = false;

        events.on('test', (message) => {
            received = true;
            expect(message.payload).toBe('data');
        });

        events.emit('test', 'data');
        expect(received).toBe(true);
    });
});
```

## 测试异步事件

```typescript
it('应该正确处理异步事件', async () => {
    const events = new FastEvent();
    const results: number[] = [];

    events.on('async', async (message) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        results.push(message.payload);
    });

    await events.emitAsync('async', 1);
    expect(results).toEqual([1]);
});
```

## 测试通配符

```typescript
it('应该匹配通配符事件', () => {
    const events = new FastEvent();
    const results: string[] = [];

    events.on('user/*', (message) => {
        results.push(message.type);
    });

    events.emit('user/login', {});
    events.emit('user/logout', {});
    events.emit('admin/login', {});

    expect(results).toEqual(['user/login', 'user/logout']);
});
```

## 测试执行器

```typescript
it('应该使用串行执行器', async () => {
    const events = new FastEvent({ executor: series() });
    const order: number[] = [];

    events.on('test', async () => {
        order.push(1);
        await new Promise(resolve => setTimeout(resolve, 50));
    });

    events.on('test', async () => {
        order.push(2);
    });

    await events.emitAsync('test', {});
    expect(order).toEqual([1, 2]);
});
```

## 测试管道

```typescript
it('应该应用节流管道', async () => {
    const events = new FastEvent();
    let count = 0;

    events.on('test', () => {
        count++;
    }, { pipes: [throttle(100)] });

    events.emit('test', {});
    events.emit('test', {});

    await new Promise(resolve => setTimeout(resolve, 150));
    expect(count).toBe(1);
});
```

## 测试保留事件

```typescript
it('应该立即接收保留事件', () => {
    const events = new FastEvent();

    events.emit('config', { value: 1 }, { retain: true });

    let received: any;
    events.on('config', (message) => {
        received = message.payload;
    });

    expect(received).toEqual({ value: 1 });
});
```

## 测试作用域

```typescript
it('作用域应该正确添加前缀', () => {
    const events = new FastEvent();
    const scope = events.scope('user');

    let receivedType: string;
    scope.on('login', (message) => {
        receivedType = message.type;
    });

    scope.emit('login', {});
    expect(receivedType).toBe('user/login');
});
```

## 测试事件等待

```typescript
it('应该正确等待事件', async () => {
    const events = new FastEvent();

    setTimeout(() => {
        events.emit('test', { value: 42 });
    }, 100);

    const result = await events.waitFor('test', 1000);
    expect(result).toEqual({ value: 42 });
});
```

## 测试错误处理

```typescript
it('应该捕获监听器错误', async () => {
    const events = new FastEvent({
        onListenerError: (error, listener, message) => {
            expect(error).toBeInstanceOf(Error);
        }
    });

    events.on('test', () => {
        throw new Error('Test error');
    });

    const results = await events.emitAsync('test', {});
    expect(results[0].status).toBe('rejected');
});
```

## 类型测试

```typescript
import type { Expect } from '@type-challenges/utils';

type Test = FastEvent<{
    'user/login': { id: number };
    'data/update': { value: string };
}>;

// 测试事件类型推导
type Test1 = Expect<Equal<
    Parameters<Test['on']>[0],
    'user/login' | 'data/update' | 'user/**' | 'data/**'
>>;
```

## 运行测试

```bash
# 运行所有测试
bun run test

# 运行特定文件
npx vitest run <test-file>

# 监听模式
npx vitest

# 覆盖率
bun run test:coverage
```

## 测试最佳实践

1. **隔离性**: 每个测试创建新的 FastEvent 实例
2. **清理**: 使用 `offAll()` 清理监听器
3. **异步**: 使用 `emitAsync` 和 `await` 确保异步完成
4. **超时**: 为 `waitFor` 设置合理超时
5. **覆盖率**: 目标 99%+ 覆盖率
