---
type: docs
title: "为 Java SDK 做贡献"
linkTitle: "Java SDK"
weight: 3000
description: 为 Dapr Java SDK 做贡献的指南
---

When contributing to the [Java SDK](https://github.com/dapr/java-sdk) the following rules and best-practices should be followed.

## Examples

`examples` 目录中包含了一些代码示例，供用户运行，以尝试各种 Java SDK 包和扩展的特定功能。 在写新的和更新的示例时，请牢记。

- All examples should be runnable on Windows, Linux, and MacOS. While Java code is consistent among operating systems, any pre/post example commands should provide options through [codetabs]({{< ref "contributing-docs.md#tabbed-content" >}})
- Contain steps to download/install any required pre-requisites. Someone coming in with a fresh OS install should be able to start on the example and complete it without an error. Links to external download pages are fine.

## 文档

`daprdocs` 目录包含渲染到 [Dapr 文档](https://docs.dapr.io) 网站的 markdown 文件 当文档网站建立后，该仓库会被克隆和配置，使其内容与文档内容一起呈现。 编写文档时牢记：

   - All rules in the [docs guide]({{< ref contributing-docs.md >}}) should be followed in addition to these.
   - 所有文件和目录都应该以 `java-` 为前缀，以确保所有文件/目录名称在所有 Dapr 文档中是全局唯一的。
