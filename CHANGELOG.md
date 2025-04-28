# fastevent

## 1.1.3

### Patch Changes

-   028475b: feat: 更改使用 interface FastEventMessage 以方便扩展

## 1.1.2

### Patch Changes

-   f650dd3: feat: 增加 Context 泛型参数，用来为监听器指定 this

## 1.1.1

### Patch Changes

-   c93387f: feat: 新增加了 fastevent/devtools 功能，可以导入在`Redux Dev Tools`查看事件，用于调试。
    feat: 新增加了 debug 选项，用于调试时使用。
    feat: 增加了 onExecuteListener 选项，在每次执行监听器后执行，仅当 debug=true 时有效
    feat: 增加了 onClearListener 选项，在清空监听器时执行
    fix: 修改了类型提示错误

## 1.1.0

### Minor Changes

-   02ffb88: 修改事件监听器的接收为 FastEventMessage

## 1.0.4

### Patch Changes

-   3cf1e87: 更新 meta 泛型参数的位置

## 1.0.3

### Patch Changes

-   0c54b10: 调整 onAny 监听器的执行优先级

## 1.0.2

### Patch Changes

-   02c6d3e: fix scope.on error

## 1.0.1

### Patch Changes

-   b7d21e2: add prepend option for on
-   8807aaa: update scope on options

## 1.0.0

### Major Changes

-   b8b8c13: first release
