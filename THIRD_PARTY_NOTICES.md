# 第三方与来源声明

本项目保留权利的说明不覆盖第三方组件。依赖实际版本、完整性和来源见 `package-lock.json`。

| 组件 | 版本 | 许可 | 用途与来源 |
| --- | --- | --- | --- |
| esbuild | 0.28.2 | MIT | 开发时打包和语法/CSS转换；[上游](https://github.com/evanw/esbuild)，安装包metadata的license为MIT |
| fflate | 0.8.3 | MIT | 开发时ZIP压缩和回读；[上游](https://github.com/101arrowz/fflate)，完整许可见安装后的`node_modules/fflate/LICENSE` |

两者均为开发依赖，不以运行时脚本分发。运行包不携带这些依赖的代码；如果未来分发依赖副本，应附其完整许可和版权声明。

小红书 `minitool-zip-builder` 是外部官方检查工具，当前本机使用用户指定下载包1.7.0（内部metadata1.6.0），不是本项目作品。其工具目录与下载归档不提交公开仓库，获取与审计步骤见[发布流程](docs/release/RELEASING.md)。官方文档快照保留来源链接和采集时点，不授予其再许可。

AI素材、程序绘制、音乐及截图见[素材登记](docs/assets-register.md)。外部竞品与技术参考列于[研究附录](docs/research/game-references.md)，仅用于方案研究，不表示背书或授权关联。
