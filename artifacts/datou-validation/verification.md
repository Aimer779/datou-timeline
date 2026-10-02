# 本版验证 — 2026-10-02

## 自动检查

- `pnpm validate:assets`：9 张 PNG，1254×1254，RGBA、文件路径、年份集合与 SHA-256 全部通过。
- `pnpm typecheck`：通过；后续 `pnpm build` 再次执行 TypeScript 检查。
- `pnpm test`：3 个文件、9 个测试通过，覆盖年份映射、相邻帧、加载失败、作品过渡文案与清单边界。
- `pnpm build`：通过。
- `git diff --check`：通过。

## 浏览器实测

在内置 Chromium 浏览器运行 http://127.0.0.1:5179/：

- 硬刷新后页面正常挂载，未出现 ReferenceError；新验证标签页控制台无 error / warn。重命名时旧标签页曾记录 Vite 热更新错误，硬刷新后的独立验证页没有该错误。
- Home / ArrowLeft 保持 1995，End / ArrowRight 保持 2026。
- 1995 + PageUp = 2005；PageDown 回到 1995；Shift + ArrowRight = 2000。
- 实际鼠标左拖 160px：1995 → 2003，与 20px/年一致；过渡说明包含 1995 与 2013 两个来源。
- 390px 页面中从 2026 点击标尺左侧 40px，得到 2024《迷你大冒险》。
- 点击彩色按钮后 pressed 状态与画面颜色切换正常；初始黑白正常。
- 1200×900、876px 桌面实际宽度与 390×844 窄屏：scrollWidth 等于 innerWidth；窄屏控件、作品名和页脚可见。
- 比较原版与改版的头像容器、Canvas、年份读数、标尺和模式按钮：box-sizing、背景色、border、appearance、border-radius、corner-shape、overflow、filter、transform、opacity、z-index、fill 同值。

## 证据

- `desktop-2018.png`：2018《俄罗斯奇遇记》，彩色桌面。
- `mobile-2026.png`：2026 童年形象，彩色窄屏。
- `source-computed.json`：修改前原版计算样式基准。

## 未验证及局限

未测试 Safari、Firefox、实体触屏和性能指标。reduced-motion 沿用原版代码，本轮未切换系统偏好实测。不是逐像素原站对照；作品说明带来的纵向布局变化是有意差异。

生成头像的姿态与画布统一，但未做面部关键点逐像素配准，过渡仍可能出现轻微五官重影。人物细节是基于素材的正面化重绘，不是官方设定。年份信息沿用用户目录，未独立核验。
