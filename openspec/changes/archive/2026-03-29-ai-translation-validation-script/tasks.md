## 1. 共享校验器

- [x] 1.1 在 `repos/dapr-docs-copilot/src/server/translation-output-validation.ts` 实现 frontmatter key 提取、标题提取、层级比对与结构化结果模型
- [x] 1.2 为共享校验器补充 frontmatter 缺失、额外 key、标题结构失配、无 frontmatter 文档等合同测试
- [x] 1.3 固化失败诊断格式，确保包含文件标识、规则命中、标题结构指标与完整候选译文内容

## 2. 工作台自动校验接入

- [x] 2.1 修改 `repos/dapr-docs-copilot/src/server/translation-workbench-admin.ts`，把 Markdown 成功路径改为“归一化 -> 校验 -> 写入”
- [x] 2.2 让校验失败的任务项进入 `failed`，并阻断 `translation-state.json`、`sync-status.json`、`source.json`、`copy-log.json` 的回写
- [x] 2.3 在失败路径中加入目标文件 best-effort 删除与详细日志输出，保证无不合格译文残留

## 3. 独立 CLI 校验脚本

- [x] 3.1 新增 `repos/dapr-docs-copilot/scripts/validate-translation-output.ts`，支持 `--source/--target` 显式模式
- [x] 3.2 为脚本补充 `--version` 批量模式与可选过滤参数，并输出聚合摘要与确定性退出码
- [x] 3.3 在 `repos/dapr-docs-copilot/package.json` 暴露独立执行命令，供本地与 CI 复用

## 4. 回归验证与说明

- [x] 4.1 扩展 `repos/dapr-docs-copilot/scripts/validate-translation-workbench-admin.ts`，覆盖校验失败不落盘、不回写状态、删除目标文件等场景
- [x] 4.2 为独立 CLI 增加单文件与批量模式回归脚本，覆盖失败日志与非零退出码
- [x] 4.3 更新 `repos/dapr-docs-copilot/README.md`，说明独立校验命令、失败处理机制与日志行为
