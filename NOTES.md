# 改版说明

## SOURCE

- 上游：https://github.com/Aimer779/age-progression
- 基线提交：cb48de4ecc145e16ae43368105ad088fcbc6e85c
- 复杂度：L2，已有完整源码的内容替换；保留 React 19、TypeScript、Vite 与原锁文件，不增加生产依赖。
- 素材：E:/Downloads/datou-catalog.zip。解压后保留原目录与说明。
- 上游未声明代码许可证，素材未提供商用授权；仅本地预览。

## 替换地图

- `src/types.ts`：九个作品年份、十个形象节点；同年童年和成年使用不同 position，共用 year=2026。
- `src/timeline.ts`、`src/components/TimelineRuler.tsx`：沿用连续数轴、20px/格、160ms 点击缓动、键盘与 reduced-motion 策略。
- `src/works.ts`：目录中的作品名称，以及非节点年份的相邻作品过渡说明。
- `src/App.tsx`、`src/components/ModeSwitch.tsx`：中文文案，初始仍为黑白。
- `public/year-frames`：透明正面大头照；首张优先加载，后续预加载，保留失败回退。
- `src/components/FaceCanvas.tsx`：相邻帧使用加法混合，避免两张透明图片用 source-over 混合导致半透明变淡。
- `references/portrait-prompts.md`：内置 imagegen 提示词与逐图来源。

## 有意差异

原 CSS 的颜色、头像尺寸、留白、按钮与标尺样式保留。年龄读数更名为年份；下方增加低对比度作品名，容纳较长中文；页脚允许换行避免窄屏溢出。

原有 5–88 共 84 个刻度改成 1995–2026 共 32 个年份刻度，末尾再加一格同年成年形象，共 33 格。年份区间仍为等距真实年份轴，不将 18 年空档伪装成一年。中间年份是图像混合，不是新作品。

2026 保留童年并增加成年素材。成年槽内部 position=2027，实际 year=2026；读数、作品名、Canvas 标签和 slider aria-valuetext 都显示 2026 成年，混合过程中显示童年 → 成年，不虚构发行年份。缓存和插值按 position 区分两张同年头像。正面化重绘保留二维与三维差异，但局部五官和发型细节可能偏离原稿；2024 的现场投影参考尤其有限。

头像尺寸使用生成器实际输出 1254×1254，PNG RGBA，不额外缩放或去除 alpha。人物位置按同一提示词约束，未进行逐像素面部关键点配准。

## 运行

`pnpm install --frozen-lockfile`，然后 `pnpm dev --host 127.0.0.1 --port 5179`。

## 验证

见 `artifacts/datou-validation/verification.md`。原版历史截图位于 `artifacts/validation`，不与本版验收混用。
