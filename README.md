# 大头儿子 · 作品年份变迁

基于 [Aimer779/age-progression](https://github.com/Aimer779/age-progression) 的本地改版。保留原版 React、TypeScript、Canvas、极简布局和标尺交互，将人物年龄改为作品年份。

## 运行

```powershell
cd D:\code\frontend-test\datou-timeline
pnpm install --frozen-lockfile
pnpm dev --host 127.0.0.1 --port 5179
```

访问 http://127.0.0.1:5179/ 。生产构建：`pnpm build`。

## 内容与操作

- 9 个作品年份、10 个形象节点：1995、2013、2014、2016、2018、2021、2022、2024、2026 童年、2026 成年。
- 拖动或点击标尺切换；方向键一格、Shift 加方向键五格、Page Up / Down 十格、Home / End 到首尾。1995–2026 为逐年刻度，末尾增加同年成年形象的一格。
- 保留黑白／彩色切换，初始为 1995 黑白。
- 年份间采用相邻作品头像混合，并明确标注“过渡”。不是虚构中间年份作品。
- 2026 保留童年形象，继续向右切换到成年形象；End 直达成年版，向左一格回到童年版。两者都属于 2026，不显示为 2027 年。

## 微交互

- 拖动连续跟手，松手以 100ms 吸附到最近整格；点击以 160ms 过渡到最近整格。新操作立即打断旧动画。
- 有真实素材的刻度略深；悬停时增强可操作提示，按下时中心线轻微拉伸，松开恢复。
- 黑白／彩色使用 180ms 滑动选中底色和灰度过渡，保留按钮按压反馈。
- 键盘焦点可见；作品说明预留两行高度，避免窄屏长文案挤动标尺。
- 系统减少动态效果时取消数轴缓动、缩短 CSS 过渡；移动端保留纵向滚动与双指缩放。

设计依据、参数和本轮验证见 `artifacts/datou-validation/microinteractions.md`。视觉与手感等待用户验收。

## 素材

`references/datou-catalog/` 为用户压缩包原始材料；`public/year-frames/` 为十张统一画布、居中、透明背景的正面头像及校验清单。

头像由内置 imagegen 按参考图逐张正面化重绘，提示词及对应来源见 `references/portrait-prompts.md`。保留各时期二维／三维风格，画布为 1254×1254。侧脸、遮挡、低清细节包含推测，不是官方正面设定图。作品年份沿用用户目录，未独立考证。

## 检查

```powershell
pnpm validate:assets
pnpm typecheck
pnpm test
pnpm build
```

验证记录与截图见 `artifacts/datou-validation/`。原仓库的 `artifacts/validation/` 仅为原版历史证据，不代表本版结果。

## 来源与使用范围

源码基线：Aimer779/age-progression，提交 `cb48de4ecc145e16ae43368105ad088fcbc6e85c`。上游未提供 LICENSE；本改版仅供本地学习预览。用户素材目录注明公开海报／截图不属于可商用素材，原角色和作品权利归原权利人。本次未发布或推送。
