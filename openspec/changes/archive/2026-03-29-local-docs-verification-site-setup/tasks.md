## 1. zh 仓本地验证配置生成

- [x] 1.1 在 `repos/v1.17_zh` 下创建本地验证站点所需目录约定（含运行产物忽略规则），用于承载 `.generated`、`.cache`、`logs` 等文件
- [x] 1.2 新增 `repos/v1.17_zh/scripts/render-local-docs-verification-config.mjs`，读取 `repos/v1.17/hugo.yaml` 并重写所有 `translations/docs-zh/translated_content/zh_CN/**` 挂载源到当前 zh 仓路径
- [x] 1.3 在配置生成逻辑中保留原站的英文 mount、语言配置、Docsy 模块导入与目标 mount 路径，避免硬编码桶列表
- [x] 1.4 为生成配置补充可验证输出，确保配置文件写入 `repos/v1.17_zh/site/.generated/` 且仅引用 zh 仓作为可写目录

## 2. zh 仓本地 host 启动链路

- [x] 2.1 新增 `repos/v1.17_zh/scripts/run-local-docs-verification-site.mjs`，实现 `sourceRepo`、`zhRepo`、`host`、`port` 等参数解析
- [x] 2.2 在 runner 中加入启动前预检：校验 `sourceRepo/hugo.yaml`、`zhRepo/translated_content/zh_CN`、`hugo` 可执行文件与目标目录可写性
- [x] 2.3 以 `repos/v1.17` 作为 cwd 启动 `hugo server`，并将 generated config、cache、log、临时输出目录重定向到 `repos/v1.17_zh/site/**`
- [x] 2.4 稳定输出 sourceRepo、zhRepo、generated config、cache 路径与最终预览 URL，并在失败时返回可操作错误

## 3. copilot 命令集成

- [x] 3.1 在 `repos/dapr-docs-copilot/scripts/` 新增 bridge 脚本，负责解析 CLI 参数并调用 zh 仓 runner
- [x] 3.2 修改 `repos/dapr-docs-copilot/package.json`，增加一键启动本地验证站点的 npm 命令
- [x] 3.3 让 bridge 支持透传 `version`、`sourceRepo`、`zhRepo`、`host`、`port` 参数，并为未显式提供的值设置合理默认值（默认覆盖 `v1.17`）
- [x] 3.4 确保 bridge 透传子进程 stdout/stderr，使开发者可直接看到 Hugo 启动日志与 ready URL

## 4. 回归验证与文档

- [x] 4.1 新增 `repos/dapr-docs-copilot/scripts/validate-local-docs-verification.ts`，覆盖 mount 重写、路径解析、稳定输出与依赖缺失报错契约
- [x] 4.2 为 runner 或验证脚本补充最小启动烟测，确认保存 `repos/v1.17_zh/translated_content/zh_CN/**` 文件后本地预览链路仍指向 sourceRepo 结构
- [x] 4.3 更新 `repos/v1.17_zh/README.md`，记录本地验证站点的前置条件、启动命令、目录约定与常见故障排查
- [x] 4.4 更新 `repos/dapr-docs-copilot/README.md`，记录 npm 启动命令、参数示例与输出说明
