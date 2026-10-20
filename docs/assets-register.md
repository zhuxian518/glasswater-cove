# 素材来源登记

本表记录仓库内素材的实际生产方式，不把AI生成美术标为纯手绘，也不把参考产品图片当成本项目素材。项目整体授权见 [LICENSE](../LICENSE)。

| 素材 | 来源与用途 | 记录 |
| --- | --- | --- |
| `public/assets/cove-background-v2.png` / `.jpg` | 项目期间AI生成海湾背景，JPG为正式运行压缩版 | [v2提示词](design/海湾场景生成提示词-v2.txt)；当前构建使用v2 JPG |
| `public/assets/cove-background-v1.png` / `.jpg` | 较早AI生成背景试稿，保留参考 | [v1提示词](design/海湾场景生成提示词-v1.txt)，不进入当前包 |
| `public/assets/badges-ab-v3.webp` / `badges-cd-v3.webp` | AI生成并整理的首批32枚徽章运行图集 | [提示词](design/徽章精修生成提示词-v0.3.1.txt)、[AB原稿](design/徽章精修-AB-v0.3.1.png)、[CD原稿](design/徽章精修-CD-v0.3.1.png) |
| `docs/design/琉璃海湾-美术概念-v0.2.png` | 项目AI概念参考，不是实际游戏截图 | 美术/结构方向参考，不进入运行包 |
| 生物、船、渔民、网、水纹、额外20枚徽章 | `src/render`的程序绘制和动画 | 与AI图集结合；新增徽章不是新生成的写实浮雕图集 |
| `public/assets/favicon.svg` | 项目SVG图标 | 不宣称是平台已审核的独立品牌图标 |
| 音乐、音效、环境声 | `src/audio/AudioMixer.js`用WebAudio合成 | 原创程序编排，没有引用商业录音；不称为实录乐器 |
| `docs/previews/*.png` | 项目浏览器界面截图 | v0.4图鉴及鳐鱼徽章，2026-10-12采集；非真机验收证据 |
| `docs/design/界面与动作示意.svg` | 项目设计示意 | 早期结构图，输入规则以当前规格为准 |

研究中的产品商店、FAO、技术文档为参考链接，不将竞品美术/音乐/代码收入运行包。`docs/research/evidence/`内官方文档采集副本只用于规范来源核对，属于原权利人，非项目原创。

生成提示词与结果可追溯，但生成内容的权利范围仍受适用法律与生成服务条款约束，不作独占性保证。新增/替换素材时同步此表、运行构建清单和相应发布记录。
