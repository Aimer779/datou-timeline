# 正面头像处理记录

使用内置 imagegen 编辑，每个年份独立调用一次。保留生成器原始透明 PNG，未使用 CLI 或外部图像 API。

## 共用提示词

Use case: identity-preserve. Edit target: attached reference. Create one standardized front-facing head-only portrait of 大头儿子, the big-headed young boy (not any adult or other character). Preserve this exact version's distinctive face, eyes, haircut and original rendering style. Change pose to straight-on, eye-level, no tilt; gentle closed-mouth smile, eyes open. Remove body, neck, clothes, props, helmet, all background and all text. Square composition, entire head including ears and hair visible, centered at x50% y50%, head bounding box roughly x15%-85%, y12%-88%, eye line at y55%. Real transparent background; no shadow outside head; no text. Do not homogenize 2D into 3D. 

## 每年输入与附加要求

- 1995: `datou-catalog/1995_原版第一部/sofa.webp`。Version 1995. Preserve flat hand-drawn cel animation, thin ink outlines, original small asymmetric hair notch.
- 2013: `datou-catalog/2013_新版第一季/face-icon.png`。Version 2013. Preserve flat digital 2D animation style.
- 2014: `datou-catalog/2014_秘密计划/poster.jpg`。Version 2014. Preserve this reference's 3D animation design.
- 2016: `datou-catalog/2016_一日成才/poster.jpg`。Version 2016. Preserve this reference's 3D animation design.
- 2018: `datou-catalog/2018_俄罗斯奇遇记/poster-face.webp`。Version 2018. Preserve this reference's 3D animation design.
- 2021: `datou-catalog/2021_完美爸爸/still.jpg`。Version 2021. Preserve this reference's 3D animation design.
- 2022: `datou-catalog/2022_我的外星朋友/poster-helmet.jpg`。Version 2022. Preserve this reference's 3D animation design.
- 2024: `datou-catalog/2024_迷你大冒险/premiere.jpg`。Version 2024. Reconstruct the boy from the projected cartoon poster, ignoring the real people and screen lighting.
- 2026: `datou-catalog/2026_失控的第七天/poster-child-tianyan.jpg`。Version 2026. Preserve this reference's 3D animation design.

## 输出

`public/year-frames/year-YYYY.png`，九张 1254×1254 RGBA 正面头像。年份与作品按用户提供的目录记录，未独立考证发行信息。正面化重绘会推测被遮挡的五官，并非官方正面设定图；2024 原素材为首映现场投影，细节可信度相对较低。2026 此版选童年形象，成年素材保留在来源目录。
