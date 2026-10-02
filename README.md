# 大头儿子 · 作品年份变迁

一个用时间标尺探索大头儿子历年造型的交互实验。基于 [Aimer779/age-progression](https://github.com/Aimer779/age-progression)，保留极简布局、Canvas 混合与黑白／彩色切换，把“人物年龄”改为“作品年份”。

- GitHub Pages：https://aimer779.github.io/datou-timeline/
- Cloudflare Pages：https://datou-timeline.pages.dev/
- 源码：https://github.com/Aimer779/datou-timeline

![页面预览](artifacts/datou-validation/cloudflare-live.png)

## 体验

- 1995–2026 共9个作品年份、10个形象节点；2026 同时保留童年和成年版。
- 左右拖动连续变化，松手吸附到最近整格；点击标尺也可定位。
- 方向键一格，Shift + 方向键五格，Page Up / Down 十格，Home / End 跳到首尾。
- 年份之间的图像是艺术化混合，不代表新增作品。末尾成年版仍属于2026年。
- 头像按参考素材统一为正面、透明背景；保留早期二维和后期三维差异。
- 支持系统减少动态效果偏好，加载中和请求失败时有提示与重试入口。

## 本地开发

使用 Node **24.20.0**、pnpm **11.14.0**。

```sh
pnpm install --frozen-lockfile
pnpm dev --host 127.0.0.1 --port 5179
```

访问 http://127.0.0.1:5179/ 。

```sh
pnpm validate:assets
pnpm test
pnpm build
pnpm preview
```

生产文件输出到 `dist/`。预览命令仅用于本地检查。

## 图片与加载优化

| 指标 | 原版素材 | 发布素材 |
| --- | --- | --- |
| 格式 | 透明 PNG | 透明 WebP |
| 画布 | 1254×1254 | 768×768 |
| 十张合计 | 10,958,224 bytes | 856,456 bytes |
| 体积变化 | — | 减少92.2% |

1995与2013采用无损WebP保留二维线条，三维版本使用quality 86。缩放保持整张画布及透明边距，避免裁切造成切换跳位。

- 清单直接编入应用，消除额外清单请求；HTML预加载首张头像。
- 后台最多两张并发，优先加载当前选择的相邻帧；图片解码后才进入Canvas。
- 哈希文件名用于缓存失效；Cloudflare对图片和构建资源设置一年不可变缓存，HTML重新验证。
- 图像、代码均从部署站点自身加载，无第三方图片API、字体CDN、登录或后端依赖。

`references/portraits-original/` 保留生成的PNG原图和原始清单；`references/datou-catalog/` 保留提供的参考材料；它们不会进入 `dist/`。

重新导出图片（仅开发时需要uv/Python）：

```sh
uv run --with pillow==12.3.0 python scripts/optimize-images.py
pnpm validate:assets
```

输出为 `public/year-frames/` 内带内容哈希的WebP和 `src/data/frames.json`。重新生成后如产生旧哈希文件，素材校验会提示未引用文件，应核对后移除。

## GitHub Pages

`.github/workflows/pages.yml` 在推送main时检查、构建并发布。仓库 Settings → Pages 的部署来源为 GitHub Actions。

工作流设置 `DEPLOY_BASE=/datou-timeline/`；运行时图像地址与HTML预加载使用相同base。更改仓库名或使用自定义域名时，同步修改工作流base。

## Cloudflare Pages（CLI发布）

此项目采用Wrangler Direct Upload。首次需登录并创建项目，后续仅构建和部署：

```sh
pnpm dlx wrangler@4.145.0 login
pnpm dlx wrangler@4.145.0 pages project create datou-timeline --production-branch main --force
pnpm build
pnpm dlx wrangler@4.145.0 pages deploy dist --project-name datou-timeline --branch main
```

`--force` 仅用于本次Wrangler版本的首次项目创建，显式使用Pages而非转交Workers；已有项目不再执行创建命令。Cloudflare构建时不要设置GitHub仓库的 `DEPLOY_BASE`，根路径默认为 `/`。GitHub推送自动更新GitHub Pages；Cloudflare需另行执行上述CLI部署命令。仓库不保存访问令牌。

## 来源与边界

源码基线：[Aimer779/age-progression](https://github.com/Aimer779/age-progression)，提交 `cb48de4ecc145e16ae43368105ad088fcbc6e85c`。上游未附LICENSE，本仓库不据此宣称拥有其全部版权或授予宽泛许可。

大头儿子及相关作品、公开海报与截图的权利归原权利人。本项目为非官方学习与交互展示，不代表官方产品或商业使用授权。头像由内置imagegen正面化重绘，部分遮挡细节包含推测；作品年份按提供的素材目录整理，未独立考证。提示词与来源见 [处理记录](references/portrait-prompts.md)。

部署后检查记录见 `artifacts/datou-validation/`；早期记录中的素材尺寸、数量和运行方式属于当时版本，当前以此README与代码为准。
