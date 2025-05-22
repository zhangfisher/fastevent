---
'fastevent': patch
---

[特性] - 🚀 `FastEvent`和`FastEventScope`新增加一个`_initOptions`方法供继承时重载进行初始化配置。
[修复] - 🐛 修复`Context`泛型参数为`never`，改进重载`options`时的类型不兼容问题，不再需要`OverrideOptions`类型
[测试] - ✅ 增加了一个类型测试用例
