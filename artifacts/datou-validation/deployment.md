# 双平台发布检查 — 2026-10-02

## 发布前

- 用户授权：优化后新建public仓库，push，部署GitHub Pages并通过Cloudflare CLI部署。
- GitHub身份为 Aimer779，原origin改名upstream，仅向新origin Aimer779/datou-timeline推送。
- PNG原图10,958,224字节；发布WebP共856,456字节，减少92.2%。768×768透明画布，二维无损、三维quality86；全部哈希及透明标记检查通过。
- 清单打包；首图preload；加载并发2，目标相邻帧优先；解码成功后提交Canvas。重试URL带尝试次数，避免浏览器复用同一文档中的失败图片缓存。
- 受控HTTP服务验证：暂停响应时显示加载提示；全部图片503时显示失败与重试；恢复200后点击重试恢复头像。不是随机sleep测试。
- GitHub子路径构建验证：JS、CSS、preload以及运行时图片地址均为 /datou-timeline/ 前缀。
- `pnpm validate:assets`、16项单测、TypeScript与生产构建通过。
- 发布不包含原始素材、参考截图、临时验证服务、源码或凭据；只上传dist。
- 未测Firefox/Safari、实体移动设备；未采集真实用户性能指标。图片锐度通过本地浏览器目视检查，非逐像素保真承诺。

## 平台

- 仓库：https://github.com/Aimer779/datou-timeline （已核对PUBLIC）
- GitHub Pages：https://aimer779.github.io/datou-timeline/
- Cloudflare Pages：https://datou-timeline.pages.dev/
- Cloudflare Wrangler 4.145.0 首次创建默认转交Workers失败，带 --force 显式创建Pages成功；后续 pages deploy 不需要该参数。

## 已上线

- 发布代码提交：5c5feada5796c2ad13b6728012c20c7116cdef27。
- GitHub Actions运行36987306907：build、deploy均success；公开HTTPS首页200。
- Cloudflare CLI上传13个文件并成功部署；部署快照 https://97b09c7c.datou-timeline.pages.dev ，正式域名 https://datou-timeline.pages.dev/ 首页200。
- 两站分别验证10张WebP，共20个响应全部200且Content-Type=image/webp。
- Cloudflare HTML为max-age=0重新验证；哈希图片为max-age=31536000、immutable。
- 两站浏览器均完成首帧、End成年版、彩色切换，控制台error/warn为空。
- GitHub线上390×844视口scrollWidth=innerWidth=390；截图github-live-mobile.png、cloudflare-live.png。
- 后续文档和截图提交不改变dist，本次记录提交跳过重复CI发布。
