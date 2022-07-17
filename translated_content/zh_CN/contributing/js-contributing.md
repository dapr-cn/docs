---
type: docs
title: "Contributing to the JavaScript SDK"
linkTitle: "JavaScript SDK"
weight: 3000
description: Guidelines for contributing to the Dapr JavaScript SDK
---

When contributing to the [JavaScript SDK](https://github.com/dapr/js-sdk) the following rules and best-practices should be followed.

## 示例

The `examples` directory contains code samples for users to run to try out specific functionality of the various JavaScript SDK packages and extensions. 在写新的和更新的示例时，请牢记。

- 所有的例子都应该可以在Windows、Linux和MacOS上运行。 While JavaScript code is consistent among operating systems, any pre/post example commands should provide options through [codetabs]({{< ref "contributing-docs.md#tabbed-content" >}})
- 包含下载/安装任何所需先决条件的步骤。 使用全新安装的操作系统的人，应该能够在没有错误的情况下启动这个例子并完成它。 指向外部下载页面的链接是正常的。

## Docs

`daprdocs` 目录包含渲染到 [Dapr 文档](https://docs.dapr.io) 网站的 markdown 文件。 When the documentation website is built, this repo is cloned and configured so that its contents are rendered with the docs content. When writing docs, keep in mind:

   - 除了这些规则外，还应遵循 [文档指南]({{< ref contributing-docs.md >}})。
   - All files and directories should be prefixed with `js-` to ensure all file/directory names are globally unique across all Dapr documentation.
