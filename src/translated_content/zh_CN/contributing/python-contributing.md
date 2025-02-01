---
type: docs
title: "为 Python SDK 贡献"
linkTitle: "Python SDK"
weight: 3000
description: 为 Dapr Python SDK 贡献的指南
---

在贡献 [Python SDK](https://github.com/dapr/python-sdk) 时，应该遵循以下规则和最佳实践。

## 示例

`examples` 目录包含用户可以运行的代码示例，以体验各种 Python SDK 包和扩展的特定功能。在编写或更新示例时，请注意：

- 所有示例应在 Windows、Linux 和 MacOS 上均可运行。虽然 Python 代码在不同操作系统之间是一致的，但任何示例的前置或后续命令应通过 [codetabs]({{< ref "contributing-docs.md#tabbed-content" >}}) 提供不同操作系统的选项。
- 包含下载和安装所有必要前提条件的步骤。即使是刚安装操作系统的人也应该能够顺利开始并完成示例，而不会遇到错误。可以链接到外部下载页面。

## 文档

`daprdocs` 目录包含会被渲染到 [Dapr Docs](https://docs.dapr.io) 网站的 markdown 文件。当文档网站构建时，此仓库会被克隆并配置，以便其内容与文档内容一起呈现。在编写文档时，请注意：

- 除了这些规则外，还应遵循 [docs guide]({{< ref contributing-docs.md >}}) 中的所有规则。
- 所有文件和目录名称应以 `python-` 为前缀，以确保在所有 Dapr 文档中具有唯一性。

## Github Dapr Bot 命令

请查看 [daprbot 文档](https://docs.dapr.io/contributing/daprbot/) 以了解您可以在此仓库中使用的 Github 命令来完成常见任务。例如，您可以在问题的评论中运行 `/assign` 来将问题分配给某个用户或用户组。