# 编写fastevent-viewer组件

## 技术要求

- 文件位于@packages\viewer\src\eventViewer\index.ts
- 图标使用SVG，从@packages\components\src\styles\icons.css中读取
- 使用lit库开发组件
- 样式声明在./styles.ts

## 可复用的片段

## 组件组成

根组件采用flex垂直布局，从上到下依次是

- header
  调用`renderHeader`进行渲染，flex水平居中布局，由
    - 标题: 居左文字，文件内容:"FastEvent"，flex-grow=1
    - 工具按钮：包括两个图标按钮（开始/停止，监听器）
      header整体padding:1em
- toolbar
  调用`renderHeader`进行渲染，flex水平居中布局，由
    - 事件名称过滤输入框： 圆角占位字符：事件过滤，长度约20%
    - 空白区：flex-grow=1,显示`共${this.log.length}条`
    - 工具按钮：包括一个按钮（清空）
- logs
  调用`renderLogs`进行渲染列表，flex垂直布局,渲染`this.logs`内容。
    - 渲染时，不直接遍历`this.logs`而是根据`this._logIndexs`来渲染。`this._logIndexs`记录了一个数字数组，成员指向的是`this.logs`数组的索引。
    - logs支持垂直自动滚动条，水平滚动条不显示。
    - logs列表项采用`this.renderLog`进行渲染，`renderLog`渲染内容由
        - flex水平2列布局，top对齐，第一列显示一个状态图标，状态图标名为yes，
          第2列内部为flex垂直布局，其中
            - 第一行：flex水平居中布局，内容由log.message.type（文字，flwx-grow=1）,log.triggerTime（只显示时间）,log.args.retain标签（调用renderTag渲染），
              log.args.rawEventType标签（如果有值则显示),log,args.args.flags标签（如果不为零显示）,复制图标按钮（调用renderButton,只渲染图标图标，copy）
            - 第二行： flex水平居中布局，内容log.message.payload字符串，最多显示2行，超出部分显示....,颜色灰色，并字体略小。
            - 第三行：显示log.listeners数组，如果log.listeners.length===0则不渲染，调用renderListeners渲染。采用flex水平布局，gap=4px，允许换行。
              renderListeners内部调用renderListener分别渲染log.listeners成员。
              rendernListener渲染出一个圆角按钮形状态，按钮内部采用水平居中布局，由listener.status状态图标（三种状态，分别是执行中， 成功，出错）listener.name，若干个标签（listener.tag(不为空时显示),listener.count,listener.flags(不为零时显示)）
    - log列表项之间mouseover淡色背景，

## 属性

组件支持以下属性

- emitter：绑定一个FastEvent实例，当变更新要重新初始化
- dark: 显示暗色风格
- enable: 是否接收或停止接收事件

## 方法

- clear: 清空所有事件
-

## 样式

- 样式采用清新风格,参考Antd组件库的设计风格
- 支持通过dark指定为暗色调
- renderTag支持为tag指定颜色，显示圆角
