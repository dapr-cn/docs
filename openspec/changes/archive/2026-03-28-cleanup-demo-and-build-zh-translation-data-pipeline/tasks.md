## 1. 中文仓数据基础

- [x] 1.1 在 `repos/v1.17_zh` 创建 `data/` 与 `data/source/` 目录，并补充 `README.md` 中的数据目录说明
- [x] 1.2 初始化 `sync-status.json`、`glossary.json`、`source.json`、`source-manifest.json`、`copy-log.json` 的首版 JSON 模板
- [x] 1.3 约定 `version`、`bucket`、`relativePath`、`status` 等核心字段，并在模板中保持一致命名

## 2. 源文复制与追踪流程

- [x] 2.1 在 `scripts/zh-data/sync_source_documents.ts` 中实现基于 `repos/v1.17/hugo.yaml` 与已删除旧脚本 `src/scripts/tasks.py` 的内容桶解析逻辑
- [x] 2.2 实现按内容桶复制源文至 `data/source/**`，并将文件级 metadata 写入 `data/source.json`
- [x] 2.3 实现 `source.json`、`source-manifest.json` 与 `copy-log.json` 的批次级记录，写入来源仓、来源分支、复制时间、文档计数与失败信息
- [x] 2.4 基于 `data/source/**` 的文件存在性与 sha256 全量校验生成 `sync-status.json`，标记 `synced`、`drift`、`missingSource` 等状态
- [x] 2.5 在 `sync-status.json` 中追加 `syncedAt`、`translationUpdatedAt`、`translationStatus`，并标记 `translated`、`staleTranslation`、`missingTranslation`、`orphanTranslation`

## 3. 管理台去 demo 化与中文数据入口

- [x] 3.1 调整 `repos/dapr-docs-copilot/src/components/app-shell.tsx` 与 `repos/dapr-docs-copilot/src/router.tsx`，移除 demo 主入口并将 `中文数据` 设为首个一级菜单
- [x] 3.2 改造 `repos/dapr-docs-copilot/src/pages/dashboard-page.tsx`，将首页内容替换为中文数据摘要、最近复制活动与 drift 焦点信息
- [x] 3.3 新建 `repos/dapr-docs-copilot/src/pages/zh-data-page.tsx` 与相关组件，提供 `同步状态`、`术语表`、`源文清单`、`复制日志` 四类数据视图
- [x] 3.4 在 `repos/dapr-docs-copilot/src/lib/` 中实现 zh 数据装载与视图模型规范化，并补齐空态、缺失文件与错误态展示
- [x] 3.5 调整首页与 `同步状态` 视图，展示原文同步与译文状态的双重判断结果

## 4. 校验与文档

- [x] 4.1 为复制脚本补充可验证的测试或校验脚本，覆盖内容桶映射、`relativePath` 稳定性与 JSON 输出合法性
- [x] 4.2 为前端页面补充最小化渲染校验，确认导航顺序、标签页切换、空态与错误态符合规格
- [x] 4.3 更新实现说明文档，记录如何生成 zh 数据、如何查看数据页面，以及 JSON 文件各字段含义
- [x] 4.4 补充译文时间判定、孤儿译文识别与批次摘要字段的测试和文档说明
