---
'fastevent': patch
---

feat: 新增加了 fastevent/devtools 功能，可以导入在`Redux Dev Tools`查看事件，用于调试。
feat: 新增加了 debug 选项，用于调试时使用。
feat: 增加了 onExecuteListener 选项，在每次执行侦听器后执行，仅当 debug=true 时有效
feat: 增加了 onClearListener 选项，在清空侦听器时执行
fix: 修改了类型提示错误
