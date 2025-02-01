---
type: docs
title: "为 Go SDK 贡献"
linkTitle: "Go SDK"
weight: 3000
description: 为 Dapr Go SDK 贡献的指南
---

在为 [Go SDK](https://github.com/dapr/go-sdk) 贡献时，贡献者应该遵循以下规则和最佳实践。

## 示例

`examples` 目录包含用户可以运行的代码示例，以尝试各种 Go SDK 包和扩展的特定功能。在编写新的和更新的示例时，请注意：

- 所有示例应能在 Windows、Linux 和 MacOS 上运行。虽然 Go 代码在不同操作系统之间是一致的，但任何示例的前置/后置命令应通过 [codetabs]({{< ref "contributing-docs.md#tabbed-content" >}}) 提供不同的选项。
- 包含下载和安装任何必要前提条件的步骤。即使是刚安装操作系统的用户，也应该能够顺利开始并完成示例而不出现错误。可以链接到外部下载页面。

## 文档

`daprdocs` 目录包含被渲染到 [Dapr Docs](https://docs.dapr.io) 网站的 markdown 文件。当文档网站构建时，此仓库会被克隆并配置，以便其内容与文档内容一起呈现。在编写文档时，请注意：

- 除了这些规则外，还应遵循 [docs guide]({{< ref contributing-docs.md >}}) 中的所有规则。
- 所有文件和目录应以 `go-` 为前缀，以确保在所有 Dapr 文档中文件和目录名称的全局唯一性。