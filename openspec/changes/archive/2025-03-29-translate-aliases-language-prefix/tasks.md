## 1. Alias 归一化实现

- [x] 1.1 在 `repos/dapr-docs-copilot/src/server/translation-workbench-admin.ts` 中实现 Markdown front matter `aliases` 语言前缀归一化 helper，并集中封装 `zh_CN -> /zh-hans/` 映射
- [x] 1.2 将 alias 归一化接入现有 Markdown 译文落盘链路，仅处理站内路径字符串并保持已带前缀值幂等

## 2. 回归验证与文档

- [x] 2.1 在 `repos/dapr-docs-copilot/scripts/validate-translation-workbench-admin.ts` 中补充 aliases 缺前缀、已带前缀、无 aliases 三类验证场景
- [x] 2.2 更新 `repos/dapr-docs-copilot/README.md`，说明简体中文译文会自动本地化 front matter aliases 且不重复拼接前缀
