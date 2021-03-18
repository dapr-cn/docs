---
type: docs
title: "为 .NET SDK 贡献"
linkTitle: ".NET SDK"
weight: 3000
description: Dapr .NET SDK贡献准则
---

当为 [.NET SDK](https://github.com/dapr/dotnet-sdk) 贡献时，应该遵循以下规则和最佳做法。

## 示例

The `examples` directory contains code samples for users to run to try out specific functionality of the various .NET SDK packages and extensions. When writing new and updated samples keep in mind:

- All examples should be runnable on Windows, Linux, and MacOS. While .NET Core code is consistent among operating systems, any pre/post example commands should provide options through [codetabs]({{< ref "contributing-docs.md#tabbed-content" >}})
- Contain steps to download/install any required pre-requisites. Someone coming in with a fresh OS install should be able to start on the example and complete it without an error. Links to external download pages are fine.

## Docs

The `daprdocs` directory contains the markdown files that are rendered into the [Dapr Docs](https://docs.dapr.io) website. When the documentation website is built this repo is cloned and configured so that its contents are rendered with the docs content. When writing docs keep in mind:

   - All rules in the [docs guide]({{< ref contributing-docs.md >}}) should be followed in addition to these.
   - All files and directories should be prefixed with `dotnet-` to ensure all file/directory names are globally unique across all Dapr documentation.
