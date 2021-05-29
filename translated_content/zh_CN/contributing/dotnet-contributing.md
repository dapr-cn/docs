---
type: docs
title: "为 .NET SDK 贡献"
linkTitle: ".NET SDK"
weight: 3000
description: Dapr .NET SDK贡献准则
---

当为 [.NET SDK](https://github.com/dapr/dotnet-sdk) 贡献时，应该遵循以下规则和最佳做法。

## 示例

`examples`目录中包含了一些代码示例，供用户运行，以尝试各种.NET SDK包和扩展的特定功能。 在写新的和更新的示例时，请牢记。

- 所有的例子都应该可以在Windows、Linux和MacOS上运行。 While .NET Core code is consistent among operating systems, any pre/post example commands should provide options through [codetabs]({{< ref "contributing-docs.md#tabbed-content" >}})
- 包含下载/安装任何所需先决条件的步骤。 使用全新安装的操作系统的人，应该能够在没有错误的情况下启动这个例子并完成它。 指向外部下载页面的链接是正常的。

## Docs

`daprdocs` 目录包含渲染到 [Dapr 文档](https://docs.dapr.io) 网站的 markdown 文件。 当文档网站建立后，该仓库会被克隆和配置，使其内容与文档内容一起呈现。 编写文档时牢记：

   - All rules in the [docs guide]({{< ref contributing-docs.md >}}) should be followed in addition to these.
   - 所有文件和目录都应该以 `dotnet-` 为前缀，以确保所有文件/目录名称在所有Dapr 文档中是全局唯一的。
