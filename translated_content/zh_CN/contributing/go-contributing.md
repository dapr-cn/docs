---
type: docs
title: "Contributing to the Go SDK"
linkTitle: "Go SDK"
weight: 3000
description: Guidelines for contributing to the Dapr Go SDK
---

When contributing to the [Go SDK](https://github.com/dapr/go-sdk) the following rules and best-practices should be followed.

## 示例

The `examples` directory contains code samples for users to run to try out specific functionality of the various Go SDK packages and extensions. 在写新的和更新的示例时，请牢记。

- 所有的例子都应该可以在Windows、Linux和MacOS上运行。 While Go code is consistent among operating systems, any pre/post example commands should provide options through [codetabs]({{< ref "contributing-docs.md#tabbed-content" >}})
- 包含下载/安装任何所需先决条件的步骤。 使用全新安装的操作系统的人，应该能够在没有错误的情况下启动这个例子并完成它。 指向外部下载页面的链接是正常的。

## Docs

`daprdocs` 目录包含渲染到 [Dapr 文档](https://docs.dapr.io) 网站的 markdown 文件。 当文档网站建立后，该仓库会被克隆和配置，使其内容与文档内容一起呈现。 编写文档时牢记：

   - 除了这些规则外，还应遵循 [文档指南]({{< ref contributing-docs.md >}})。
   - All files and directories should be prefixed with `go-` to ensure all file/directory names are globally unique across all Dapr documentation.