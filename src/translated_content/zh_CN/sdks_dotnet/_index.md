---
type: docs
title: "Dapr .NET SDK"
linkTitle: ".NET"
weight: 1000
description: 用于开发 Dapr 应用程序的 .NET SDK 包
no_list: true
cascade:
  github_repo: https://github.com/dapr/dotnet-sdk
  github_subdir: daprdocs/content/en/dotnet-sdk-docs
  path_base_for_github_subdir: content/en/developing-applications/sdks/dotnet/
  github_branch: master
---

Dapr 提供多种包以协助 .NET 应用程序的开发。通过这些包，您可以使用 Dapr 创建 .NET 客户端、服务器和虚拟 actor。

## 先决条件

- 已安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 已初始化 [Dapr 环境]({{< ref install-dapr-selfhost.md >}})
- 已安装 [.NET 6](https://dotnet.microsoft.com/download)、[.NET 8](https://dotnet.microsoft.com/download) 或 [.NET 9](https://dotnet.microsoft.com/download)

{{% alert title="注意" color="primary" %}}

请注意，虽然 .NET 6 通常是 Dapr .NET SDK 包的最低 .NET 要求，并且 .NET 7 是 Dapr v1.15 中 Dapr.Workflows 的最低支持版本，但从 v1.16 开始，Dapr 仅支持 .NET 8 和 .NET 9。

{{% /alert %}}

## 安装

要开始使用 Client .NET SDK，请安装 Dapr .NET SDK 包：

```sh
dotnet add package Dapr.Client
```

## 体验

尝试 Dapr .NET SDK。通过 .NET 快速入门和教程来探索 Dapr 的实际应用：

| SDK 示例 | 描述 |
| ----------- | ----------- |
| [快速入门]({{< ref quickstarts >}}) | 使用 .NET SDK 在几分钟内体验 Dapr 的 API 构建块。 |
| [SDK 示例](https://github.com/dapr/dotnet-sdk/tree/master/examples) | 克隆 SDK 仓库以尝试一些示例并开始使用。 |
| [发布/订阅教程](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub) | 查看 Dapr .NET SDK 如何与其他 Dapr SDK 一起工作以启用发布/订阅应用程序。 |

## 可用包

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>客户端</b></h5>
      <p class="card-text">创建与 Dapr sidecar 和其他 Dapr 应用程序交互的 .NET 客户端。</p>
      <a href="{{< ref dotnet-client >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>服务器</b></h5>
      <p class="card-text">使用 Dapr SDK 编写 .NET 服务器和服务。包括对 ASP.NET 的支持。</p>
      <a href="https://github.com/dapr/dotnet-sdk/tree/master/examples/AspNetCore" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Actors</b></h5>
      <p class="card-text">在 .NET 中创建具有状态、提醒/计时器和方法的虚拟 actor。</p>
      <a href="{{< ref dotnet-actors >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>工作流</b></h5>
      <p class="card-text">创建和管理与其他 Dapr API 一起工作的工作流。</p>
      <a href="{{< ref dotnet-workflow >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>作业</b></h5>
      <p class="card-text">创建和管理 .NET 中作业的调度和编排。</p>
      <a href="{{< ref dotnet-jobs >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>AI</b></h5>
      <p class="card-text">在 .NET 中创建和管理 AI 操作</p>
      <a href="{{< ref dotnet-ai >}}" class="stretched-link"></a>
    </div>
  </div>
</div>

## 更多信息

了解更多关于本地开发选项的信息，或浏览 NuGet 包以添加到您现有的 .NET 应用程序中。

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>开发</b></h5>
      <p class="card-text">了解 .NET Dapr 应用程序的本地开发选项</p>
      <a href="{{< ref dotnet-development >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>NuGet 包</b></h5>
      <p class="card-text">用于将 .NET SDK 添加到您的 .NET 应用程序的 Dapr 包。</p>
      <a href="https://www.nuget.org/profiles/dapr.io" class="stretched-link"></a>
    </div>
  </div>
</div>
<br />