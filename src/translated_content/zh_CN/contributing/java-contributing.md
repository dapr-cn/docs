---
type: docs
title: "为 Java SDK 贡献"
linkTitle: "Java SDK"
weight: 3000
description: 为 Dapr Java SDK 贡献的指南
---

贡献 [Java SDK](https://github.com/dapr/java-sdk) 时，应该遵循以下规则和最佳实践。

## 示例

`examples` 目录中包含用户可以运行的代码示例，用于尝试各种 Java SDK 包和扩展的特定功能。在编写或更新示例时，请注意：

- 所有示例应能在 Windows、Linux 和 MacOS 上运行。虽然 Java 代码在不同操作系统上是一致的，但任何示例的前置或后续命令应通过 [codetabs]({{< ref "contributing-docs.md#tabbed-content" >}}) 提供不同的选项。
- 包含下载和安装所有必要前提条件的步骤。即使是全新安装操作系统的用户，也应该能够顺利开始并完成示例。可以链接到外部下载页面。

## 文档

`daprdocs` 目录中包含的 markdown 文件会被渲染到 [Dapr Docs](https://docs.dapr.io) 网站上。当文档网站构建时，此仓库会被克隆并配置，以便其内容与文档内容一起渲染。在编写文档时，请注意：

- 除了这些规则外，还应遵循 [docs guide]({{< ref contributing-docs.md >}}) 中的所有规则。
- 所有文件和目录名称应以 `java-` 为前缀，以确保在所有 Dapr 文档中具有全局唯一性。