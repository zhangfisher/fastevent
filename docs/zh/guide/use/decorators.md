# 监听器装饰器

监听器装饰器用于对监听器函数进行包装，修改监听器的行为，实现更高级的功能，如排队、节流、防抖等等。

比如我们可以让监听器函数对接收到的事件消息进行排队处理。

## 基本使用

```ts
const emitter = new FastEvent({
    decorators: {
        // 注册装饰器
        queue: {
            // 启用装饰器
            enabled: true,
            // 自定义装饰器
            decorator: (listener) => {},
        },
    },
});

emitter.on('click', (message) => {});
```

## 指南

### 注册装饰器

### 启用装饰器

### 自定义装饰器

### 队列
