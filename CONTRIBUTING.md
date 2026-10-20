# 开发与维护指南

先阅读 [README](README.md)、[维护规则](AGENTS.md)、[当前规格](docs/CURRENT_PRODUCT.md) 和 [架构](ARCHITECTURE.md)。代码与素材暂未授予开源许可；计划复用或提交较大改动前，请先通过Issue与维护者沟通。

## 本地运行

Node.js 22+、npm、Git，执行 `npm ci`、`npm run build`、`npm run dev`。默认地址 `http://127.0.0.1:4188/`。服务只读取 `dist/`，改源码后重新构建；没有自动热更新。手机预览见 README 的同Wi-Fi步骤。

## 修改入口

| 范围 | 入口 | 关键约束 |
| --- | --- | --- |
| 生物与遭遇 | `src/config/creatures.js`、`src/core/FishingSimulation.js` | 水层、容量、分值、出场节奏共同影响手感 |
| 撒网与捕获 | `src/core/FishingSimulation.js`、`src/config/net-motion.js`、`src/systems/collision.js` | 单网、输入所有权、连续碰撞、回船结算 |
| 积分与收藏 | `src/systems/scoring.js`、`Progress.js`、`src/config/badges.js` | 不重复结算、不改历史成绩、旧图鉴回填 |
| 绘制与美术 | `src/render/`、`public/assets/` | 表现不影响模拟；新素材登记来源 |
| 操作与页面 | `src/input/`、`src/main.js`、`src/ui/Harbor.js`、`src/css/main.css` | 多指、长按、弹窗、安全区、海域无遮挡 |
| 存档 | `src/platform/StorageAdapter.js`、`MiniToolStorage.js` | 原生读失败禁覆盖，写失败可重试，保留旧数据 |
| 声音 | `src/audio/AudioMixer.js` | 手势解锁、设置独立、切后台暂停 |
| 构建与交付 | `scripts/` | 浏览器/容器分开，容器裁掉受限浏览器API |

## 验证

```sh
npm test
npm run package
npm run package:minitool
```

使用Node内置测试运行器。按改动选有意义的检查，纯文档不用反复跑游戏。玩法、存档、输入或构建变更运行上述完整检查，并补充对应界面/设备验证。`scripts/diagnose.mjs`是策略模拟探针，不能当真人体验或留存数据。

官方审计工具获取见[发布流程](docs/release/RELEASING.md)。本地 `.codex/` 不入库；项目打包检查不依赖它，官方审计另行安装执行。目前没有自动化真机测试，未启用Actions工作流。

## 提交与协作

从 `main` 新建 `codex/简短功能名` 分支。提交用 `feat:`、`fix:`、`docs:`、`chore:` 等说明结果。PR说明问题、改动、验证及存档影响。普通Bug和建议使用仓库模板；安全问题见 [SECURITY](SECURITY.md)。

不要提交依赖、构建、ZIP、浏览器会话、备份、凭据或工具状态。实际范围变化同步规格和更新日志；发布按 [RELEASING](docs/release/RELEASING.md)。
