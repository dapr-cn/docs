---
type: docs
title: Dapr .NET SDK
linkTitle: .NET
weight: 1000
description: 开发 Dapr 应用程序的 .NET SDK 包
no_list: true
cascade:
  github_repo: https://github.com/dapr/dotnet-sdk
  github_subdir: daprdocs/content/en/dotnet-sdk-docs
  path_base_for_github_subdir: content/en/developing-applications/sdks/dotnet/
  github_branch: master
---

Dapr 提供了各种包来帮助开发 .NET 应用程序。 你可以使用他们来创建 .NET 客户端、服务器和 virtual actors。

## 前期准备

- 已安装[Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- 已安装 [.NET Core 3.1 或 .NET 5+](https://dotnet.microsoft.com/download)

## 安装

若要开始使用客户端 .NET SDK，请安装 Dapr .NET SDK 包：

```sh
dotnet add package Dapr.Client
```

## 试试吧

对 Dapr .NET SDK 进行测试。 演练 .NET 快速入门和教程，了解 Dapr 的实际应用：

| SDK 示例                                                                                                 | 说明                                                                 |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| [快速入门]({{< ref quickstarts >}}) | 使用 .NET SDK 在短短几分钟内体验 Dapr 的 API 构建块。              |
| [SDK示例](https://github.com/dapr/dotnet-sdk/tree/master/examples)                                       | 克隆 SDK 存储库以尝试一些示例并开始使用。                                            |
| [发布/订阅教程](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub)                           | 了解 Dapr .NET SDK 如何与其他 Dapr SDK 协同工作，以启用发布/订阅应用程序。 |

## 可用软件包

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>客户端</b></h5>
      <p class="card-text">创建与 Dapr sidecar 和其他 Dapr 应用程序交互的 .NET 客户端。</p>
      
      
      <a href="{{< ref dotnet-client ></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>服务器</b></h5>
      <p class="card-text">使用 Dapr SDK 在 .NET 中编写服务器和服务。 包括对 ASP.NET 的支持。</p>
      
      
      <a href="https://github.com/dapr/dotnet-sdk/tree/master/examples/AspNetCore" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Actors</b></h5>
      <p class="card-text">在 .NET 中创建具有状态、提醒/计时器和方法的 virtual actor。</p>
      
      
      <a href="{{< ref dotnet-actors ></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>工作流程</b></h5>
      <p class="card-text">创建和管理与 .NET 中的其他 Dapr API 配合使用的工作流。</p>
      
      
      <a href="{{< ref dotnet-workflow ></a>
    </div>
  </div>
</div>

## 更多的信息

了解更多关于本地开发选项，或浏览 NuGet 包以添加到您现有的 .NET 应用程序中。

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>开发</b></h5>
      <p class="card-text">了解 .NET Dapr 应用程序的本地开发选项</p>
      
      
      <a href="{{< ref dotnet-development ></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>NuGet 包</b></h5>
      <p class="card-text">为您的 .NET应用程序 添加 .NET SDK 的 Dapr 包。</p>
      
      
      <a href="https://www.nuget.org/profiles/dapr.io" class="stretched-link"></a>
    </div>
  </div>
</div>
<br />
