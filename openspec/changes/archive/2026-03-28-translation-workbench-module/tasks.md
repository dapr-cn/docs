## 1. 工作台基础模型与依赖

- [x] 1.1 更新 `repos/dapr-docs-copilot/package.json`，加入 Claude SDK 与 Handlebars 依赖，并为工作台预留所需环境变量读取约定
- [x] 1.2 新建 `repos/dapr-docs-copilot/src/lib/translation-workbench-models.ts`，定义版本、文件、任务、队列状态与错误 DTO
- [x] 1.3 新建 `repos/dapr-docs-copilot/prompts/translation/claude-default.hbs` 与对应模板加载工具，固定 `sourceContent`、`glossary`、`targetPath` 等变量入口

## 2. 本地管理端点与串行翻译队列

- [x] 2.1 新建 `repos/dapr-docs-copilot/src/server/translation-workbench-admin.ts`，实现版本扫描与未翻译文件列表装载逻辑
- [x] 2.2 在 `repos/dapr-docs-copilot/src/server/translation-workbench-admin.ts` 中实现串行 job store、`waiting/translating/completed/failed` 状态流转与同文件运行中锁
- [x] 2.3 在 `repos/dapr-docs-copilot/src/server/translation-workbench-admin.ts` 中接入 Claude 调用、源文读取、glossary 注入、译文写入与失败错误归一化
- [x] 2.4 扩展 `repos/dapr-docs-copilot/vite.config.ts`，提供版本列表、文件列表、建队列、查状态与失败重试端点

## 3. 工作台前端页面与导航

- [x] 3.1 修改 `repos/dapr-docs-copilot/src/lib/primary-navigation.ts` 与 `repos/dapr-docs-copilot/src/router.tsx`，新增 `翻译工作台` 一级菜单与路由入口
- [x] 3.2 新建 `repos/dapr-docs-copilot/src/pages/translation-workbench-page.tsx`，接入版本查询、文件查询、任务创建与状态轮询
- [x] 3.3 新建 `repos/dapr-docs-copilot/src/components/translation-workbench/workbench-view.tsx`，实现版本选择器、模板标识、统计条与批量操作区
- [x] 3.4 新建 `repos/dapr-docs-copilot/src/components/translation-workbench/file-queue-table.tsx` 与相关子组件，支持多选、全选、状态 badge、空态、错误态与失败重试入口

## 4. 状态反馈与交互约束

- [x] 4.1 在 `repos/dapr-docs-copilot/src/lib/translation-workbench.ts` 中封装工作台 API 请求、轮询停止条件与错误映射
- [x] 4.2 在工作台页面中实现队列运行时的禁用规则，确保版本切换、重复提交与非失败态重试被正确拦截
- [x] 4.3 在工作台 UI 中补齐 `等待中`、`翻译中`、`翻译完成`、`翻译失败` 四态文案与聚合计数，并在成功写入后刷新当前版本文件视图

## 5. 校验与文档

- [x] 5.1 更新 `repos/dapr-docs-copilot/scripts/validate-zh-data-ui.tsx` 或新增相邻校验脚本，覆盖工作台默认态、队列运行态、失败态与空态
- [x] 5.2 为本地管理端点补充最小化验证，覆盖模板缺失、空选择、单文件重试与串行状态流转场景
- [x] 5.3 更新 `repos/dapr-docs-copilot/README.md`，记录工作台使用方式、开发态限制、模板目录与 `ANTHROPIC_API_KEY` 前提
