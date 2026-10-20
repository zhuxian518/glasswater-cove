# 构建、验证与发布

## 两种交付

普通浏览器包支持浏览器下载和JSON文件备份；小红书包编译裁掉受限能力，改用官方SDK及文本备份。两者都从同一源码生成，不互相覆盖。版本记录放在 `package.json`、锁文件、打包脚本和更新日志中，发布前保持一致。

## 验证步骤

```sh
npm ci
npm test
npm run package
npm run package:minitool
```

浏览器打包包含静态离线检查；容器打包包含唯一根入口、允许类型、资源引用、禁用API、经典脚本解析、包体和ZIP回读。报告生成到 `docs/release/minitool-v0.4.1-audit.json`；该脚本当前绑定v0.4.1，升版时同步修改名称与文档，不能只改npm版本。

小红书上线前按[官方在线文档](https://miniapp-sandbox.xiaohongshu.com/minitool/doc)，从上传页复制**当时完整改写口令**，按其下载对应Skill并执行；不能把本仓库历史1.7.0记录当作未来最新版本。本机 `.codex/` 被忽略，克隆后需另行获取工具，不公开重新分发第三方工具包。

在已安装匹配工具的环境中，官方审计示例：

```sh
node .codex/skills/minitool-zip-builder/scripts/audit_artifact.mjs dist-minitool
python .codex/skills/minitool-zip-builder/scripts/audit_artifact.py 琉璃海湾-v0.4.1-小红书上传包.zip
```

记录工具版本、来源、日期、错误/警告和哈希；修复检查发现的问题，再在创服平台模拟器、Android及iOS真机扫码验证**同一ZIP**，覆盖抛网、暂停/中断、图鉴/徽章、存档恢复、备份、音频、相册和分享。不得用浏览器或模拟SDK通过替代真实客户端结果。

## GitHub归档

源码提交不包含 `dist*/`、依赖、本机工具、ZIP和临时截图。保留产品/开发/研究/素材文档、必要原稿、实际界面预览和锁文件。检查公开内容无凭据、个人备份、聊天标识或本机绝对路径。

准备以下Release附件：

- 浏览器试玩ZIP。
- 小红书专用ZIP，未完成平台验收时明确标记。
- 文档ZIP：README、PRD/TDD、当前规格、架构、开发/发布/安全/素材说明和设计资料；不是游戏执行包。
- `SHA256SUMS.txt`：上述附件的SHA-256、精确文件名。

GitHub会清理非ASCII附件名，Release统一使用 `glasswater-cove-v版本-browser.zip`、`-minitool.zip`、`-documents.zip`；本地中文构建名仅是别名，校验文件必须使用实际下载名。

用当前稳定提交创建不可移动的版本标签。当前v0.4.1作为预发布保存；Release正文说明范围、验证来源、待测环境和两种ZIP用途。附件上传后核对平台记录的文件名、大小及digest；需要时重新下载到临时目录计算哈希并比对，再清理临时文件。不要用新的内容悄悄覆盖已发布版本。

## 后续升级与回退

改动先落到功能分支，按范围验证和更新记录；新修复使用新补丁版本。不要重算历史分数，不把新版本号当存档schema。回退使用已冻结的旧源码与附件，先备份玩家数据，旧代码可能不理解新存档结构。不能通过删除存档掩盖兼容问题。

仓库未启用Actions；[工作流示例](validate-workflow.example.yml)供将来维护者审阅启用，不表示远端CI已执行。
