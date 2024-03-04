---
type: docs
title: "为 Java SDK 做贡献"
linkTitle: "Java SDK"
weight: 3000
description: 为 Dapr Java SDK 做贡献的指南
---

当对 [Java SDK](https://github.com/dapr/java-sdk) 做出贡献时，应该遵循以下规则和最佳实践。

## 示例

`examples` 目录中包含了一些代码示例，供用户运行，以尝试各种 Java SDK 包和扩展的特定功能。 在写新的和更新的示例时，请牢记。

- 所有的例子都应该可以在 Windows、Linux 和 MacOS 上运行。 虽然 Java 代码在操作系统中是一致的，但任何前/后示例命令都应该通过 [codetabs]({{< ref "contributing-docs.md#tabbed-content" >}}) 提供选项。
- 包含下载/安装任何所需先决条件的步骤。 使用全新安装的操作系统的人，应该能够在没有错误的情况下启动这个例子并完成它。 指向外部下载页面的链接是正常的。

## 文档

`daprdocs` 目录包含渲染到 [Dapr 文档](https://docs.dapr.io) 网站的 markdown 文件 当文档网站建立后，该仓库会被克隆和配置，使其内容与文档内容一起呈现。 编写文档时牢记：

   - 除了这些规则外，还应遵循[文档指南]({{< ref contributing-docs.md >}})。
   - 所有文件和目录都应该以 `java-` 为前缀，以确保所有文件/目录名称在所有 Dapr 文档中是全局唯一的。
