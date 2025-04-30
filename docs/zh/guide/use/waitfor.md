# 等待事件触发

FastEvent 提供了 `waitFor` 方法，允许你以 Promise 的方式等待特定事件的触发。这种方式特别适合需要等待异步事件完成的场景。

## 基本用法

### 语法

```typescript
waitFor<T>(type: string, timeout?: number): Promise<FastEventMessage>
```

### 参数

-   `type`: 要等待的事件类型。支持以下格式：

    -   精确匹配：`user/login`
    -   单层通配符：`user/\*`（匹配 user 下的任意单个层级）
    -   多层通配符：`user/\*\*`（匹配 user 下的所有层级）

    **重要限制**：通配符（\* 和 \*\*）只能用在事件类型的最后面，例如：

    -   ✅ 正确：`user/\*`、`user/profile/\*\*`
    -   ❌ 错误：`user/\*\*/update`

-   `timeout`: （可选）超时时间（毫秒），默认为 0 表示永不超时

### 返回值

返回一个 Promise，解析为事件消息对象，包含：

-   `type`: 事件类型
-   `payload`: 事件数据
-   `meta`: 事件元数据

## 指南

### 基本等待

```typescript
const emitter = new FastEvent();

// 等待登录事件
async function waitForLogin() {
    try {
        const event = await emitter.waitFor('user/login');
        console.log('用户登录成功:', event.payload);
    } catch (error) {
        console.error('等待登录失败:', error);
    }
}

// 在其他地方触发登录事件
emitter.emit('user/login', { userId: 123 });
```

### 使用通配符

```typescript
const emitter = new FastEvent();

// 等待任意用户事件
async function waitForUserEvents() {
    // 等待 user 下的任意单层事件
    const singleLevel = await emitter.waitFor('user/*');
    console.log('收到用户事件:', singleLevel.type); // 如: user/login, user/logout

    // 等待 user/profile 下的任意多层事件
    const multiLevel = await emitter.waitFor('user/profile/**');
    console.log('收到用户配置事件:', multiLevel.type); // 如: user/profile/update, user/profile/settings/change
}

// 触发事件
emitter.emit('user/login', { userId: 123 });
emitter.emit('user/profile/settings/theme', { theme: 'dark' });
```

### 设置超时

```typescript
const emitter = new FastEvent();

async function waitForServerResponse() {
    try {
        // 最多等待5秒
        const event = await emitter.waitFor('server/response', 5000);
        console.log('收到服务器响应:', event.payload);
    } catch (error) {
        console.error('等待超时');
    }
}
```

### 类型安全的等待

```typescript
interface MyEvents {
    'user/login': { userId: string; timestamp: number };
    'user/logout': { userId: string };
}

const emitter = new FastEvent<MyEvents>();

async function handleUserLogin() {
    const event = await emitter.waitFor('user/login');
    // TypeScript 会正确推断 payload 的类型
    console.log(event.payload.userId, event.payload.timestamp);
}
```

### 在作用域中使用

当在作用域中使用 `waitFor` 时，事件类型会自动添加作用域前缀，但在接收事件时会自动移除前缀。

```typescript
const emitter = new FastEvent();
const userScope = emitter.scope('user');

async function handleProfileUpdate() {
    // 等待 'user/profile/update' 事件
    const event = await userScope.waitFor('profile/update');
    // event.type 将是 'profile/update'，自动移除了 'user/' 前缀
    console.log('配置更新:', event.payload);
}

// 可以通过作用域或主发射器触发事件
userScope.emit('profile/update', { name: 'John' });
// 或
emitter.emit('user/profile/update', { name: 'John' });
```

## 实际应用场景

### 等待初始化完成

```typescript
const emitter = new FastEvent();

async function initializeApp() {
    // 并行等待多个初始化事件
    await Promise.all([emitter.waitFor('database/ready'), emitter.waitFor('cache/ready'), emitter.waitFor('config/loaded')]);

    console.log('应用程序初始化完成');
}
```

### 异步操作流程控制

```typescript
const emitter = new FastEvent();

async function processUserData(userId: string) {
    // 触发数据处理事件
    emitter.emit('data/process/start', { userId });

    try {
        // 等待处理完成
        const result = await emitter.waitFor('data/process/complete', 10000);
        return result.payload;
    } catch (error) {
        // 处理超时或错误
        emitter.emit('data/process/error', { userId, error });
        throw error;
    }
}
```

### 状态同步

```typescript
const emitter = new FastEvent();

async function waitForStateSync() {
    let retries = 3;

    while (retries > 0) {
        try {
            // 发送同步请求
            emitter.emit('state/sync/request');
            // 等待同步完成
            const event = await emitter.waitFor('state/sync/complete', 2000);
            return event.payload;
        } catch (error) {
            retries--;
            if (retries === 0) throw new Error('状态同步失败');
        }
    }
}
```

## 注意事项

1. 通配符使用

    - 通配符（\* 和 \*\*）只能用在事件类型的最后面
    - 单层通配符（\*）只匹配一个层级
    - 多层通配符（\*\*）匹配任意多个层级
    - 不支持在事件类型中间使用通配符

2. 超时处理

    - 设置合理的超时时间避免无限等待
    - 超时后会自动清理事件监听器
    - 超时会抛出错误，确保做好错误处理

3. 内存管理

    - waitFor 会在事件触发或超时后自动清理监听器
    - 不需要手动调用 off() 方法

4. 作用域使用
    - 在作用域中使用时注意事件名称的自动前缀处理
    - 可以通过作用域或主发射器触发事件
    - 事件消息中的类型会自动处理前缀
