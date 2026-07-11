---
"fastevent": patch
---

修复 once（及带 count 限制的）监听器相关的缺陷：

1. 跨多节点匹配场景（如 onAny(**) 与 once(type) 共存、on(*) 与 once(type) 共存时触发 emit）：`_decListenerExecCount` 中 splice 误用了外层收集列表的下标，改为监听器在所属节点 `__listeners` 中的本地下标（`listeners[i][1]`），避免越界漏删或误删相邻监听器。
2. retain 保留事件回放场景：修正 `_executeListeners` 中 localIdx 在 filter 跳过时未递增的问题，使新订阅的 once 监听器在 retain 回放时不再误删同节点下的其他监听器。
3. once/count 监听器执行达标被自动删除时，`listenerCount` 未同步递减，导致公开计数字段偏大。已在 `_decListenerExecCount` 的 splice 后补 `listenerCount--`，与 `off`/`offAll` 路径保持一致。

本次同时纠正了 `liteEvent.ts` 与 `event.ts` 中两处相同缺陷的代码副本。
