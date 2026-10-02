# 微交互验收版

基线提交：b4a9324。基线开始前工作区干净，未创建重复空提交。

## 从任务出发

用户的任务是移动时间位置、辨认作品差异。反馈需要回答：哪里能操作、输入是否被收到、停下后在哪一格。保持原有构图；动效限于被操作的标尺与色彩切换，不让人物额外漂浮或弹跳。

1. 直接操作阶段不加插值延迟，头像与标尺连续跟手。
2. 松手后以 100ms ease-out 回到最近整数格，消除读数与实际混合比例不一致的悬停状态。点击同样选整数格，以 160ms 保留方向感。
3. 新输入先取消旧动画。右键、非主指针不接管拖动；pointercancel / 丢失捕获会复位，不能卡在抓取状态。
4. 黑白／彩色共用滑动底色，头像 CSS 灰度在 180ms 内变化；不会为模式变化重新绘制或加载图像。
5. 作品名预留两行，数字使用等宽数字，避免阅读与操作目标随文字变化。
6. 读屏通过 slider 的 aria-valuetext 获取年份与作品；移除两个同步更新的 live region，避免重复播报。焦点样式只在键盘操作时出现。

## 一手参考

- [W3C APG Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)：方向键、Home/End、PageUp/PageDown、aria-valuetext；保留标准键盘模型。触屏读屏仍需要真机验收。
- [web.dev prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion)：尊重减少动态效果，CSS 和 JavaScript 同时处理；运行中偏好改变时完成当前目标并停止缓动。
- [MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action)：水平自定义拖动保留 pan-y 和 pinch-zoom，浏览器接管手势时处理 pointercancel。

100/160/180ms、中心线 1.08 倍拉伸是本项目的设计选择，不是规范规定。待用户验收后再调整手感。

## 已完成检查

- `pnpm test`：13 项通过，包括可控时钟验证缓动精确落点、不越界、取消后旧目标不再发布、零时长不调度帧。没有用 sleep 测并发。
- `pnpm build`：TypeScript 检查与 Vite 构建通过。
- `git diff --check`：通过。图像和清单未修改，本轮未重复素材校验。
- 浏览器硬刷新正常，控制台 error/warn 为空。
- 桌面鼠标从 1995 左拖 73px，松手到 1999，data-dragging 恢复 false。
- End + ArrowRight 保持成年末端，aria-valuetext 包含“2026 · 成年”和作品名；键盘 focus-visible 是 2px 可见描边。
- 彩色终态：Canvas filter=grayscale(0)，选中底色 transform 平移 60px。
- 390×844：短文案与最长过渡文案的标尺 top 均为 616.927px，scrollWidth=innerWidth=390。
- 窄屏从 2025 左拖 27px，松手回到 2026 童年节点；同年成年仍可通过 End 到达。
- 截图：microinteraction-desktop.png、microinteraction-mobile.png。截图仅记录静态终态，动效手感请在预览中体验。

## 未完成的人工验收

用户尚未验收。未测试 Safari/Firefox、实体多指触屏、触屏读屏和系统偏好动态切换；减少动态效果的零时长逻辑已有单测，但不等同于系统级实测。未采集性能指标。
