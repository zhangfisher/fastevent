# 类型安全

FastEvent 提供全面的 TypeScript 支持，使您能够在整个应用中实现类型安全的事件处理。

## 泛型参数

FastEvent 接受两个类型参数：

```typescript
class FastEvent<
    Events extends Record<string, any> = Record<string, any>,
    Meta extends Record<string, any> = Record<string, any>
>
```

-   `Events`: 将事件路径映射到负载类型
-   `Meta`: 定义元数据的结构

## 事件类型定义

### 基本事件类型

```typescript
interface MyEvents {
    'user/login': { id: number; name: string };
    'user/logout': { id: number };
    'system/error': { code: string; message: string };
}

const events = new FastEvent<MyEvents>();

// 类型安全的事件发布
events.emit('user/login', { id: 1, name: '张三' }); // ✅ 正确
events.emit('user/login', { id: '1' }); // ❌ 类型错误
```

### 元数据类型

```typescript
interface MyMeta {
    timestamp: number;
    source?: string;
}

const events = new FastEvent<MyEvents, MyMeta>();

// 类型安全的元数据
events.emit(
    'user/login',
    { id: 1, name: '张三' },
    false,
    { timestamp: Date.now() }, // 必须符合 MyMeta
);
```

## 类型安全的事件处理器

### 基本处理器

```typescript
const events = new FastEvent<MyEvents>();

events.on('user/login', (message) => {
    const { id, name } = message.payload; // 正确的类型推断
    console.log(`用户 ${name} (${id}) 登录`);
});
```

### 带元数据

```typescript
interface MyEvents {
    'user/login': { id: number; name: string };
}

interface MyMeta {
    timestamp: number;
    source?: string;
}

const events = new FastEvent<MyEvents, MyMeta>();

events.on('user/login', (message) => {
    const { id, name } = message.payload; // 类型为登录负载
    const { timestamp, source } = message.meta; // 类型为 MyMeta
});
```

## 带类型安全的作用域

### 基本作用域类型

```typescript
interface UserEvents {
    login: { id: number; name: string };
    logout: { id: number };
}

const events = new FastEvent<{
    'user/login': UserEvents['login'];
    'user/logout': UserEvents['logout'];
}>();

const userScope = events.scope<'user', UserEvents>('user');

// 类型安全的作用域使用
userScope.emit('login', { id: 1, name: '张三' }); // ✅ 正确
userScope.emit('login', { id: '1' }); // ❌ 类型错误
```

### 嵌套作用域类型

```typescript
interface ProfileEvents {
    update: { name: string; age: number };
    delete: { id: number };
}

const profileScope = userScope.scope<'profile', ProfileEvents>('profile');

// 类型安全的嵌套作用域使用
profileScope.emit('update', { name: '张三', age: 30 }); // ✅ 正确
profileScope.emit('update', { name: '张三' }); // ❌ 类型错误
```

## 高级类型安全

### 联合类型

```typescript
interface MyEvents {
    'status/change': 'online' | 'offline' | 'away';
    'theme/change': 'light' | 'dark' | 'system';
}

const events = new FastEvent<MyEvents>();

events.emit('status/change', 'online'); // ✅ 正确
events.emit('status/change', 'invalid'); // ❌ 类型错误
```

### 泛型事件类型

```typescript
interface MyEvents {
    'data/create': { type: 'user'; data: { name: string } } | { type: 'post'; data: { title: string } };
}

const events = new FastEvent<MyEvents>();

events.on('data/create', (message) => {
    if (message.payload.type === 'user') {
        console.log(message.payload.data.name); // ✅ 正确
    } else {
        console.log(message.payload.data.title); // ✅ 正确
    }
});
```

## 最佳实践

1. **定义清晰的接口**：

```typescript
// 好的做法
interface UserEvents {
    create: { id: number; name: string };
    update: { id: number; changes: Partial<UserData> };
    delete: { id: number };
}

// 避免
type UserEvents = Record<string, any>;
```

2. **使用可辨识联合**：

```typescript
interface MyEvents {
    action: { type: 'create'; data: CreateData } | { type: 'update'; data: UpdateData } | { type: 'delete'; id: number };
}
```

3. **利用类型守卫**：

```typescript
interface MyEvents {
    'data/process': ProcessData;
}

function isValidProcessData(data: any): data is ProcessData {
    return 'id' in data && 'status' in data;
}

events.on('data/process', (message) => {
    if (isValidProcessData(message.payload)) {
        // 类型安全的处理
    }
});
```

4. **文档化类型**：

```typescript
/**
 * 用户相关事件
 */
interface UserEvents {
    /** 用户登录时触发 */
    login: {
        /** 用户唯一标识 */
        id: number;
        /** 用户显示名称 */
        name: string;
    };
}
```

5. **避免类型断言**：

```typescript
// 避免
events.emit('user/login', payload as UserLoginData);

// 推荐
if (isUserLoginData(payload)) {
    events.emit('user/login', payload);
}
```
