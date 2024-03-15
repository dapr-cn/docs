---
type: docs
title: Dapr 机器人参考
linkTitle: Dapr机器人
weight: 15
description: Dapr 机器人功能列表。
---

Dapr 机器人由一系列命令触发，帮助 Dapr 组织完成常见任务。 它针对每个存储库单独设置（[示例](https://github.com/dapr/dapr/blob/master/.github/workflows/dapr-bot.yml)），并可以配置为在特定事件上运行。 以下是命令列表和它们所实现的存储库列表。

## 命令参考

| 命令               | Target                | 说明                                                     | 谁可以使用                                                                             | 仓库                                                                                                            |
| ---------------- | --------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `/assign`        | Issue                 | 将问题分配给一个用户或一组用户                                        | 任何人                                                                               | `dapr`，`docs`，`quickstarts`，`cli`，`components-contrib`，`go-sdk`，`js-sdk`，`java-sdk`，`python-sdk`，`dotnet-sdk` |
| `/ok-to-test`    | Pull requests         | `dapr`: 触发端到端测试 <br/> `components-contrib`: 触发一致性和认证测试 | 列在[bot](https://github.com/dapr/dapr/blob/master/.github/scripts/dapr_bot.js)中的用户 | `dapr`，`components-contrib`                                                                                   |
| `/ok-to-perf`    | Pull requests         | 触发性能测试。                                                | 列在[bot](https://github.com/dapr/dapr/blob/master/.github/scripts/dapr_bot.js)中的用户 | `dapr`                                                                                                        |
| `/make-me-laugh` | Issue 或者 pull request | 发布一个随机笑话                                               | 列在[bot](https://github.com/dapr/dapr/blob/master/.github/scripts/dapr_bot.js)中的用户 | `dapr`，`components-contrib`                                                                                   |

## 标签参考

您可以使用`created-by/dapr-bot`标签（[查询](https://github.com/search?q=org%3Adapr%20is%3Aissue%20label%3Acreated-by%2Fdapr-bot%20\&type=issues)）来查询由Dapr机器人创建的问题。

| 标签                       | Target                | 它是做什么的?                       | 仓库                   |
| ------------------------ | --------------------- | ----------------------------- | -------------------- |
| `docs-needed`            | Issue                 | 在`dapr/docs`中创建一个新问题以跟踪文档工作   | `dapr`               |
| `sdk-needed`             | Issue                 | 在SDK存储库中创建新问题以跟踪SDK工作         | `dapr`               |
| `documentation required` | Issue 或者 pull request | 在`dapr/docs`中创建一个新问题以跟踪文档工作   | `components-contrib` |
| `new component`          | Issue 或者 pull request | 在`dapr/dapr`中创建一个新issue来注册新组件 | `components-contrib` |
