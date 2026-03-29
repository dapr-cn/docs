## 1. 共享模型与任务契约

- [x] 1.1 修改 `repos/dapr-docs-copilot/src/lib/translation-workbench-models.ts`，新增并发边界常量，以及 `CreateTranslationJobRequest`、`TranslationWorkbenchJob` 的 `concurrency` 字段
- [x] 1.2 修改 `repos/dapr-docs-copilot/src/lib/translation-workbench.ts`，在建任务请求中透传并发值，并补充 `invalid_concurrency` 错误映射
- [x] 1.3 确保任务查询返回的 job 数据包含并发配置，供前端在轮询与刷新后恢复展示

## 2. 工作台前端交互

- [x] 2.1 修改 `repos/dapr-docs-copilot/src/pages/translation-workbench-page.tsx`，加入默认值为 `3` 的并发 state、输入合法性校验与提交参数透传
- [x] 2.2 修改 `repos/dapr-docs-copilot/src/components/translation-workbench/workbench-view.tsx`，新增 `并发数量` 数值输入控件、范围提示与越界错误提示
- [x] 2.3 在工作台 UI 中实现运行中禁用规则，确保活动任务期间版本切换、重复提交与并发编辑被正确锁定
- [x] 2.4 更新摘要与状态展示文案，使页面可表达多个 `translating` 项同时存在的运行态

## 3. 后端有界并发调度

- [x] 3.1 修改 `repos/dapr-docs-copilot/src/server/translation-workbench-admin.ts`，为建任务逻辑增加 `concurrency` 默认回退与 `1-10` 边界校验
- [x] 3.2 将单一 `activeItemRef` 串行调度重构为 worker-pool，保证单任务活动项不超过 `job.concurrency`，且进程总活动项不超过 `10`
- [x] 3.3 保持文件锁、失败重试、状态聚合与目标文件写入逻辑在并发模式下仍然正确工作
- [x] 3.4 更新任务状态快照生成逻辑，确保轮询结果能准确返回多个 `translating` 项与聚合计数

## 4. 回归验证与文档

- [x] 4.1 修改 `repos/dapr-docs-copilot/scripts/validate-translation-workbench-admin.ts`，覆盖默认并发、越界拒绝、最多启动 N 个执行项与重试重新入队场景
- [x] 4.2 修改 `repos/dapr-docs-copilot/scripts/validate-zh-data-ui.tsx`，覆盖并发输入控件、多项同时翻译态与运行时禁用展示
- [x] 4.3 更新 `repos/dapr-docs-copilot/README.md`，记录并发默认值、最小值、最大值与高并发风险提示
