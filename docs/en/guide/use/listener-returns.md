# Listener Return Value Handling

FastEvent supports collecting and processing listener return values, particularly useful in `emitAsync` scenarios.

## Basic Return Values

### Synchronous Return Values

```typescript
emitter.on('math/square', (message) => {
    return message.payload * message.payload;
});

const [result] = await emitter.emitAsync('math/square', 5);
console.log(result); // 25
```

### Asynchronous Return Values

```typescript
emitter.on('data/fetch', async (message) => {
    const data = await fetchData(message.payload);
    return data;
});

const [data] = await emitter.emitAsync('data/fetch', 'user123');
```

## Return Value Types

### Multiple Listener Returns

```typescript
emitter.on('process', () => 'result1');
emitter.on('process', () => 'result2');

const results = await emitter.emitAsync('process');
// results = ['result1', 'result2']
```

### Error Handling

```typescript
emitter.on('task', () => {
    throw new Error('Failed');
});

const [result] = await emitter.emitAsync('task');
if (result instanceof Error) {
    console.error(result.message); // "Failed"
}
```

## Advanced Usage

### Result Filtering

```typescript
const validResults = (await emitter.emitAsync('validate')).filter((result) => !(result instanceof Error));
```

### Result Aggregation

```typescript
emitter.on('stats', () => ({ count: 1 }));
emitter.on('stats', () => ({ count: 2 }));

const total = (await emitter.emitAsync('stats')).reduce((sum, r) => sum + (r.count || 0), 0);
// total = 3
```

## Type Safety

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
// sum type is number | Error

const [data] = await emitter.emitAsync('data/get', 'id');
// data type is string | Error
```