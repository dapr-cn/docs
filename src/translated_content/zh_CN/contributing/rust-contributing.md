---
type: docs
title: "贡献 Rust SDK"
linkTitle: "Rust SDK"
weight: 3000
description: 为 Dapr Rust SDK 贡献的指南
---

在您为 [Rust SDK](https://github.com/dapr/rust-sdk) 贡献时，请遵循以下规则和最佳实践。

## 示例

`examples` 目录包含用户可以运行的代码示例，以尝试各种 Rust SDK 包和扩展的特定功能。它还包含用于验证的组件示例。在编写或更新示例时，请注意以下几点：

- 所有示例应能在 Windows、Linux 和 MacOS 上运行。虽然 Rust 代码在不同操作系统之间基本一致，但由于少量操作系统功能限制，任何示例的前置/后置命令都应通过 [codetabs]({{< ref "contributing-docs.md#tabbed-content" >}}) 提供不同选项。
- 包含下载和安装所有必要前提条件的步骤。刚安装操作系统的人应该能够顺利开始并完成示例而不出错。可以链接到外部下载页面。
- 示例应经过验证，并包含自动化的 markdown 步骤，并添加到验证工作流 [TBA](#)。

## 文档

`daprdocs` 目录包含将被渲染到 [Dapr Docs](https://docs.dapr.io) 网站的 markdown 文件。当文档网站构建时，此仓库会被克隆并配置，以便其内容与文档内容一起渲染。在编写文档时，请注意：

   - 除了这些规则外，还应遵循 [docs guide]({{< ref contributing-docs.md >}}) 中的所有规则。
   - 所有文件和目录应以 `rust-` 为前缀，以确保在所有 Dapr 文档中文件/目录名称的全局唯一性。

## 更新 Protobufs

要从 `dapr/dapr` 仓库中提取 protobufs，您可以在仓库根目录运行以下脚本：

```bash
./update-protos.sh
```

默认情况下，脚本从 Dapr 仓库的 master 分支获取最新的 proto 更新。如果您需要选择特定的发布或版本，请使用 -v 标志：

```bash
./update-protos.sh -v v1.13.0
