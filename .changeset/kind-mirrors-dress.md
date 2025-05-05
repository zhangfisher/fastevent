---
'fastevent': patch
---

-   [🚀feat] 监听器`Queue`新增加`lifetime`选项，用来为进入队列的消息指定一个最大的生存期，以毫秒为单位。
    当消息在队列中的等待时间超过`lifetime`时消息将被丢弃。
-   [🚀feat] 监听器`Queue`新增加`onDrop`选项，当消息被丢弃时将回调此消息。
