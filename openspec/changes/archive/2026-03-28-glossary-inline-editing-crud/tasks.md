## 1. 术语数据模型与管理端点

- [x] 1.1 在 `repos/dapr-docs-copilot/src/lib/zh-data-models.ts` 中补充 glossary term、编辑态、只读降级态与 mutation 结果类型，并移除术语 `status`、`category` 字段定义
- [x] 1.2 新建 `repos/dapr-docs-copilot/src/lib/zh-glossary.ts`，实现 glossary 数据读取、创建、更新、删除请求与前端校验工具
- [x] 1.3 扩展 `repos/dapr-docs-copilot/vite.config.ts`，提供 `GET/POST/PATCH/DELETE /__admin/zh-data/glossary` 端点，并在写回时为旧数据补齐稳定 `id`
- [x] 1.4 在 glossary 写回链路中维护 `generatedAt` 与可选 `updatedAt` 字段，保证输出仍为合法 JSON，并在持久化时清理历史 `status`、`category` 字段

## 2. 术语表行内 CRUD 交互

- [x] 2.1 改造 `repos/dapr-docs-copilot/src/components/zh-data/dataset-panel.tsx`，为 `glossary` 数据集切换到专用编辑组件
- [x] 2.2 新建 `repos/dapr-docs-copilot/src/components/zh-data/glossary-table.tsx`，实现搜索、行内新增、行内编辑、保存、取消与删除操作，并移除术语状态列与分类列
- [x] 2.3 为术语表补充必填校验、重复 `source` 校验、保存中禁用态与错误提示，确保失败仅影响当前行，且不再管理术语状态与分类
- [x] 2.4 在写入端点不可用时渲染只读降级提示，并禁用新增、编辑、删除入口

## 3. 控制台查询刷新与摘要同步

- [x] 3.1 更新 `repos/dapr-docs-copilot/src/lib/zh-data.ts`，让术语数据支持运行时刷新，并将 glossary 统计同步回 console payload
- [x] 3.2 改造 `repos/dapr-docs-copilot/src/pages/zh-data-page.tsx`，接入 glossary query/mutation 与成功后的 query invalidation
- [x] 3.3 确认术语 CRUD 成功后，`术语规则` 摘要卡、术语表记录数与当前标签内容同步更新

## 4. 校验与文档

- [x] 4.1 更新 `repos/dapr-docs-copilot/scripts/validate-zh-data-ui.tsx`，覆盖术语表默认态、编辑态、新增态、错误态与只读降级态
- [x] 4.2 补充对 glossary 管理端点的最小化校验，覆盖创建、更新、删除、旧数据补 `id` 以及移除旧 `status`、`category` 字段场景
- [x] 4.3 更新 `repos/dapr-docs-copilot/README.md` 或相关实现说明，记录术语表 CRUD 的使用方式、运行前提与 `glossary.json` 去除 `status`、`category` 后的字段演进
