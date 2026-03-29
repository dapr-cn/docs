## 1. 审计契约与共享模型

- [x] 1.1 在 `repos/dapr-docs-copilot` 中抽出共享的完整性协调/审计模型，统一表达文件级状态、桶级汇总与批次级汇总
- [x] 1.2 新增链路审计入口，能够同时读取 `sync-status.json`、`source.json`、`translation-state.json` 与 `translated_content/zh_CN/**`
- [x] 1.3 为审计结果定义前端可消费的数据结构，并补充版本、路径、冲突状态等字段

## 2. 工作台闭环回写

- [x] 2.1 修改 `translation-workbench-admin`，在译文写入成功后回写 `translation-state.json` 并调用共享协调器
- [x] 2.2 让工作台在同一版本内即时更新 `sync-status.json`、`source.json` 桶统计与 `copy-log.json` 最新批次汇总
- [x] 2.3 调整任务完成语义与错误处理，确保任一衍生数据回写失败时任务项不进入 `completed`

## 3. 上游同步一致性

- [x] 3.1 修改 `scripts/zh-data/sync_source_documents.ts`，在重同步时优先依据目标文件存在性与 `sourceSha256` 命中保留 `translated` 状态
- [x] 3.2 让同步脚本复用共享协调契约，确保 `sync-status.json`、`source.json` 与 `copy-log.json` 从同一文件级真值生成
- [x] 3.3 补充对孤儿译文、缺失目标文件、汇总失真等场景的同步脚本回归测试

## 4. 历史译文修复与回填

- [x] 4.1 新增可重复执行的历史数据审计/修复入口，扫描已存在的 `translated_content/zh_CN/**` 与相关 JSON 数据
- [x] 4.2 让修复入口按权威判定规则回填 `sync-status.json`、`source.json` 与 `copy-log.json`，修正此前未被正确处理的历史译文状态
- [x] 4.3 补充历史译文已存在但数据缺失、状态回退、汇总不一致等场景的回归测试

## 5. 控制台展示与链路校验

- [x] 5.1 修改 `src/lib/zh-data.ts` 与相关组件，移除仅凭 `translation-state` 的乐观提升，改为展示权威状态与审计摘要
- [x] 5.2 在中文数据台增加完整性风险摘要与文件级差异展示
- [x] 5.3 新增端到端验证脚本，覆盖“同步 -> 翻译 -> 再同步 -> 控制台读取”主路径，以及“历史译文回填后状态恢复”路径
- [x] 5.4 运行 `zh:data:test`、工作台校验脚本与新增链路测试，确认整条链路状态一致
