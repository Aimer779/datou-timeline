# 切换按钮材质

参考：[Laper](https://laper.ai/) 右上角 Login 控件；2026-10-02 实测。

## SOURCE

对应用户提供的 Canvas 节点，显示 58×28，buffer 29×14，分辨率比例 0.5，mix-blend-mode: normal。父层 blur(6px)，按钮为 border-box、24px 圆角、corner-shape: superellipse(2)、overflow:hidden。

部署源码 `assets/index-DLokLNxL.js` 中 vk / PrismaticEffect：渐变底层 + PrismaticBurst + 顶部强调层 + hover 光晕。配置 intensity=15、speed=0.4、distort=30、rayCount=18、performanceMode=high。

`assets/index-BSxtlY-y.js` 中 PrismaticBurst / fragmentShaderHigh 使用 6 步光线累积。顶端高光 rgba(255,255,255,0.34)，叠加 0.18 → 0 的白色渐变。

运行时 hover：scale(1.02)，绿色 0 4px 16px 外发光。rest/hover 完整 DOM 和计算样式保存于 laper-button-source.json。JS 资源均匿名 GET 返回 200 application/javascript，检查用下载文件已删除；未引入部署 bundle、素材、追踪代码或依赖。

## 当前项目的有意差异

这轮借鉴材质分层，不是原 WebGL 动效的逐像素复刻。使用自写 CSS 表达石墨色底层、6px 模糊柔光与细内高光；未复制原站 shader。保留本项目的胶囊形状、58×44 点击区与180ms滑动。

原站的绿色、持续光线动画、外发光及放大没有沿用。背景采用 #f0f0ef，选中块采用 #373737 → #202020 → #131313；hover 柔光横移 9px，按下阴影收紧。所有装饰层 pointer-events:none，文本在上层。减少动态效果沿用现有 CSS 策略。

## 验证

- 构建与 TypeScript 检查通过；git diff --check 通过。
- 点击彩色和键盘 Enter 切回黑白均可用，aria-pressed 正确。
- 彩色终态选中块平移 60px，头像 filter=grayscale(0)；原有容器尺寸 123.33×49.33 CSS px 未改变（当前浏览器缩放环境）。
- 390px 窄屏 scrollWidth=innerWidth，按钮未溢出。
- 本次未改业务逻辑，不新增或重复运行单元测试；未测其他浏览器和实体触屏。
- 最终视觉和手感待用户验收。截图 switch-material-desktop.png。
