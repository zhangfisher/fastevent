# 监听器返回值处理

FastEvent 支持监听器返回值收集和处理，特别适用于 `emitAsync` 场景。

## 基本返回值

### 同步返回值

```typescript
emitter.on('math/square', (message) => {
    return message.payload * message.payload;
});

const [result] = await emitter.emitAsync('math/square', 5);
console.log(result); // 25
```

### 异步返回值

```typescript
emitter.on('data/fetch', async (message) => {
    const data = await fetchData(message.payload);
    return data;
});

const [data] = await emitter.emitAsync('data/fetch', 'user123');
```

## 返回值类型

### 多监听器返回值

```typescript
emitter.on('process', () => 'result1');
emitter.on('process', () => 'result2');

const results = await emitter.emitAsync('process');
// results = ['result1', 'result2']
```

### 错误处理

```typescript
emitter.on('task', () => {
    throw new Error('失败');
});

const [result] = await emitter.emitAsync('task');
if (result instanceof Error) {
    console.error(result.message); // "失败"
}
```

## 高级用法

### 结果过滤

```typescript
const validResults = (await emitter.emitAsync('validate')).filter((result) => !(result instanceof Error));
```

### 结果聚合

```typescript
emitter.on('stats', () => ({ count: 1 }));
emitter.on('stats', () => ({ count: 2 }));

const total = (await emitter.emitAsync('stats')).reduce((sum, r) => sum + (r.count || 0), 0);
// total = 3
```

## 类型安全

```typescript
interface AppEvents {
    'math/add': number;
    'data/get': Promise<string>;
}

const emitter = new FastEvent<AppEvents>();

emitter.on('math/add', (msg) => msg.payload + 1);
emitter.on('data/get', async (msg) => {
    return await fetchData(msg.payload);
});

const [sum] = await emitter.emitAsync('math/add', 5);
// sum 类型为 number | Error

const [data] = await emitter.emitAsync('data/get', 'id');
// data 类型为 string | Error
```
