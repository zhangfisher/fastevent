# FastEvent

类型安全的层级事件发射器库(`FastEvent` 主类与 `FastLiteEvent` 精简派生)。事件以分隔路径(如 `user/login`)组织,存于监听器树。本文件记录设计讨论中需统一的核心领域语言,仅记术语,不记实现。

## Language

**通配符订阅 / Wildcard Subscription**:
订阅端以 `*`(单层)或 `**`(多层)声明"接收一簇事件"的订阅;订阅者只持有一份监听器,且不区分具体命中的后代路径。
_Avoid_: 模糊订阅、通配监听、catch-all

**前缀广播 / Prefix Broadcast**:
发布端的一次 `emit` 行为——除命中自身路径外,同时唤醒所有按后代路径(含通配符订阅)已订阅的现存监听器,使每个后代监听器收到改写为自身订阅路径的事件消息。方向仅向下(后代子树),由 `broadcast` 选项开启。注:`emit` 路径终点节点本身不参与前缀广播(属正常匹配)。
_Avoid_: 冒泡(bubble)、级联(cascade)、向下传播

**broadcast**:
`emit` 的参数,开启前缀广播。取 `true` 走默认改写;取函数时由调用者逐个后代改写事件消息与参数,返回 `null` 跳过该后代。
_Avoid_: deep、递归触发、深触发、深拷贝触发

**正常匹配 / Direct Match**:
`emit` 路径直接命中的订阅,不经 `broadcast` 改写,保持原事件消息。
_Avoid_: 精确匹配、直接订阅

**后代覆盖 / Descendant Override**:
由 `broadcast` 收集的、位于 `emit` 终点节点子树(不含终点自身)中的订阅,含通配符订阅;经 `broadcast` 处理后,收到改写为自身订阅路径的事件消息。
_Avoid_: 子节点广播、深匹配

**默认改写 / Default Rewrite**:
`broadcast: true` 的内置行为——把后代覆盖监听器收到的事件类型替换为该后代完整路径,其余字段原样透传。
_Avoid_: 自动转换、路径重写
