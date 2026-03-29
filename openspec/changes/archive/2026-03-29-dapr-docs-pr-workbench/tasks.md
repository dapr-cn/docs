## 1. 数据模型与端点骨架

- [x] 1.1 新增 `pr-workbench` 共享类型模型，定义版本映射、步骤状态、步骤结果、Ready 摘要与日志结构
- [x] 1.2 新增前端 `src/lib/pr-workbench.ts` 请求封装与错误归一化，覆盖版本列表、session 查询、zh 检查、fork 更新、构建验证接口
- [x] 1.3 在 `vite.config.ts` 挂载 `__admin/pr-workbench/*` 端点，并接入统一的 JSON 成功/失败响应格式

## 2. 后端编排与门禁逻辑

- [x] 2.1 实现版本工作空间解析，按 `repos/<version>_zh` 与 `repos/fork-<version>` 发现可用版本并锁定仓库元数据
- [x] 2.2 实现 zh 仓同步检查，返回 dirty 文件、upstream 缺失、ahead/behind 计数与已校验 zh HEAD SHA
- [x] 2.3 实现 fork 更新逻辑，校验 fork 工作区状态并以 fast-forward-only 同步 upstream 分支
- [x] 2.4 实现 docs-zh submodule 初始化与 SHA 切换逻辑，确保 submodule 指向已校验的 zh HEAD 提交
- [x] 2.5 实现按版本的内存 session 与 stale 失效规则，保证步骤顺序、状态继承与 Ready 摘要可信
- [x] 2.6 实现 fork 构建验证执行器，采集 exit code、stdout/stderr 与构建成功时的 SHA 快照

## 3. 前端 PR 工作台界面

- [x] 3.1 新增 `pr-workbench` 页面路由与一级导航入口，并在页面加载时自动读取可用版本与当前 session
- [x] 3.2 实现版本锁定摘要、步骤卡片与按钮禁用规则，确保未通过前置步骤时后续操作不可执行
- [x] 3.3 实现步骤结果展示，覆盖 dirty 文件、ahead/behind、fork/submodule SHA、构建状态与 Ready-for-PR 摘要
- [x] 3.4 实现日志面板与错误提示，支持查看最近构建日志和关键 Git 执行摘要

## 4. 验证与文档

- [x] 4.1 新增 `scripts/validate-pr-workbench-admin.ts`，用临时 Git 仓覆盖 zh 检查、fork fast-forward、submodule 切换与构建失败/成功场景
- [x] 4.2 为前端页面补充基础渲染与步骤门禁测试，验证版本切换、按钮禁用与 Ready 状态展示
- [x] 4.3 更新 `repos/dapr-docs-copilot/README.md`，记录 PR 工作台前提、remote 约定、默认构建入口与常见阻断原因
