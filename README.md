# Age Progression

这是一个独立的 Vite + React + TypeScript 交互原型。它把同一位虚构人物的 9 个年龄节点放在 Canvas 上，并仅混合相邻节点来模拟 Age 5–88 的连续变化。结果是艺术化的视觉模拟，不是人脸识别或真实年龄预测。

## 开发

```powershell
pnpm install
pnpm dev
```

常用检查：

```powershell
pnpm validate:assets
pnpm typecheck
pnpm test
pnpm build
```

## 素材契约

正式素材位于 `public/age-frames`。该目录包含 `manifest.json` 和 9 张 768×768 WebP 图片，年龄固定为 `5, 12, 20, 30, 40, 50, 62, 75, 88`。Manifest 结构如下：

```json
{
  "version": 1,
  "width": 768,
  "height": 768,
  "frames": [
    { "age": 5, "file": "age-05.webp", "width": 768, "height": 768, "sha256": "..." }
  ]
}
```

`pnpm validate:assets` 会检查节点完整性、相对路径、WebP 文件头、实际尺寸和 SHA-256。首帧优先加载，其余帧后台预加载；单帧加载失败时，Canvas 回退到距离当前年龄最近的可用节点。

## 交互与边界

- 拖动、点击、触摸和语义 Slider 键盘操作均支持；左右键每次移动一年，Shift 加方向键移动五年，PageUp/PageDown 移动十年，Home/End 跳到边界。
- 点击使用约 160ms 短缓动，拖动严格跟手且不会越界；`prefers-reduced-motion` 会关闭缓动。
- 初始状态为 Age 5 + Mono。首次操作提示只把“已看过”写入本地存储。
- 页面静音，不支持上传照片、多人身份、后端或在线年龄预测。

## 已验证范围

- `pnpm validate:assets`、`pnpm typecheck`、`pnpm test` 和 `pnpm build` 已在正式九节点素材集成后通过。
- Chromium 以 1200×1189 桌面视口检查了 Age 5 Mono、Age 24 Color、Age 65 Color 和 Age 88 Mono。
- Chromium 以 390×844 移动视口检查了响应式布局、无横向溢出和主要控件可见性。
- 键盘边界、PageUp/PageDown、模式切换、指针点击定位和指针拖动已实际操作验证。
- 验收截图位于 `artifacts/validation`。

没有进行 Safari、Firefox 或实体触屏设备验证，也没有采集帧率、输入延迟或其他性能指标。这些范围不得表述为已经通过。
