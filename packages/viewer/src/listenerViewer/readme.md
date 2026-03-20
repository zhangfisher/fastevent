# 编写fastevent-listeners组件

## 技术要求

- 文件位于@packages\viewer\src\listenerViewer\index.ts
- 图标使用SVG，从@packages\components\src\styles\icons.css中读取
- 使用lit库开发组件
- 样式声明在./styles.ts

## 组件结构

整体采用flex垂直布局

- 第一行显示renderToolbar渲染一个工具条，左侧是标题"已注册监听器",右则显示一个刷新按钮refresh，点击衙重新加载数据和重新渲染
- 第二行显示
    - 左侧显示一棵树，读取遍历emitter.listeners对象树，不渲染忽略里面的**listeners,树支持展开和折叠动画，点击节点时在右则显示该节点对应的**listeners。当树超过容器时支持重载滚动条。滚动条仅在mouse进去时显示，并且滚动条要宽度仅2px
      树节点前显示listeners图标，节点文本为对象key
    - 右侧显示\_listeners列表，使用renderListeners渲染，每个列表项对应renderListener渲染
      renderListener采用表格渲染，表格共两列，表格内容对listener中的每一行分别显示函数名称，已执行次数，执行次数，标签 ，标识值。
      最后一行合并，点击后在控制台显示函数内容.函数名称前显示listeners图标。
      表格整体采用卡片样式
    - 默认左右两栏比例为1:2,支持通过mouse调节左右宽度

## 组件属性

组件支持以下属性

- emitter：绑定一个FastEvent实例，当变更新要重新初始化
- dark: 显示暗色风格

## 其他

组件样式风格参考@packages\viewer\src\eventViewer中的fastevent-viewer组件
在@packages\viewer\src\eventViewer\index.ts组件中，点击header的"查看所有注册的监听器"按钮时，
隐藏组件的header下所有内容，显示fastevent-listeners组件，再次点击时恢复
