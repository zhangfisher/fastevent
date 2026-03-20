# FastEventListeners 组件

用于可视化和浏览 FastEvent 实例中所有已注册的监听器。

## 使用方法

### 基础用法

```html
<fastevent-listeners id="listeners"></fastevent-listeners>

<script type="module">
    import { FastEvent } from "fastevent";

    const emitter = new FastEvent();
    document.getElementById("listeners").emitter = emitter;

    emitter.on("user/login", (data) => {
        console.log("User logged in:", data);
    });
</script>
```

### 属性

- `emitter`: FastEvent 实例
- `dark`: 暗色模式（默认 false）

### 功能

- **树形浏览**: 左侧显示事件层级结构
- **监听器详情**: 右侧显示选中节点的监听器列表
- **交互操作**:
    - 点击箭头展开/折叠节点
    - 点击节点文本选中节点
    - 点击函数名在控制台输出监听器信息
    - 拖动分割线调整左右宽度
- **刷新**: 点击刷新按钮重新加载数据
