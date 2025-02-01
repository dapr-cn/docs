---
type: docs
title: "Dapr 机器人参考"
linkTitle: "Dapr 机器人"
weight: 70
description: "Dapr 机器人的功能列表。"
---

Dapr 机器人通过一系列命令来帮助处理 Dapr 组织中的常见任务。它可以为每个代码库单独配置（[示例](https://github.com/dapr/dapr/blob/master/.github/workflows/dapr-bot.yml)），并能够在特定事件发生时运行。以下是命令列表及其在各个代码库中的实现。

## 命令参考

| 命令              | 目标                  | 描述                                                                                                  | 谁可以使用                                                                                     | 代码库                                   |
| ----------------- | --------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `/assign`         | Issue                 | 将一个 issue 分配给一个或多个用户                                                                     | 任何人                                                                                         | `dapr`, `docs`, `quickstarts`, `cli`, `components-contrib`, `go-sdk`, `js-sdk`, `java-sdk`, `python-sdk`, `dotnet-sdk`, `rust-sdk` |
| `/ok-to-test`     | Pull request          | `dapr`: 触发端到端测试 <br/> `components-contrib`: 触发一致性和认证测试                               | 在 [bot](https://github.com/dapr/dapr/blob/master/.github/scripts/dapr_bot.js) 中授权的用户   | `dapr`, `components-contrib`             |
| `/ok-to-perf`     | Pull request          | 触发性能测试。                                                                                         | 在 [bot](https://github.com/dapr/dapr/blob/master/.github/scripts/dapr_bot.js) 中授权的用户   | `dapr`                                   |
| `/make-me-laugh`  | Issue 或 pull request | 发布一个随机笑话，增添趣味                                                                            | 在 [bot](https://github.com/dapr/dapr/blob/master/.github/scripts/dapr_bot.js) 中授权的用户   | `dapr`, `components-contrib`             |

## 标签参考

您可以通过使用 `created-by/dapr-bot` 标签查询由 Dapr 机器人创建的 issue（[查询](https://github.com/search?q=org%3Adapr%20is%3Aissue%20label%3Acreated-by%2Fdapr-bot%20&type=issues)）。

| 标签                      | 目标                  | 作用说明                                                         | 代码库               |
| ------------------------- | --------------------- | ---------------------------------------------------------------- | -------------------- |
| `docs-needed`             | Issue                 | 在 `dapr/docs` 中创建一个新的 issue 以跟踪文档工作               | `dapr`               |
| `sdk-needed`              | Issue                 | 在 SDK 仓库中创建新的 issue 以跟踪 SDK 工作                      | `dapr`               |
| `documentation required`  | Issue 或 pull request | 在 `dapr/docs` 中创建一个新的 issue 以跟踪文档工作               | `components-contrib` |
| `new component`           | Issue 或 pull request | 在 `dapr/dapr` 中创建一个新的 issue 以注册新组件                 | `components-contrib` |
`