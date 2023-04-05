---
type: docs
title: "Dapr .NET SDK"
linkTitle: ".NET"
weight: 1000
description: .NET SDK packages for developing Dapr applications
no_list: true
---

Dapr offers a variety of packages to help with the development of .NET applications. Using them you can create .NET clients, servers, and virtual actors with Dapr.

## Prerequisites

- 安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- 安装有 [.NET Core 3.1 或 .NET 5+](https://dotnet.microsoft.com/download)

## Installation

To get started with the Client .NET SDK, install the Dapr .NET SDK package:

```sh
dotnet add package Dapr.Client
```

## 试试吧

Put the Dapr .NET SDK to the test. Walk through the .NET quickstarts and tutorials to see Dapr in action:

| SDK samples                                                                           | 说明                                                                                    |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [Quickstarts]({{< ref quickstarts >}})                                                | Experience Dapr's API building blocks in just a few minutes using the .NET SDK.       |
| [SDK samples](https://github.com/dapr/dotnet-sdk/tree/master/examples)                | Clone the SDK repo to try out some examples and get started.                          |
| [Pub/sub tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub) | See how Dapr .NET SDK works alongside other Dapr SDKs to enable pub/sub applications. |

## Available packages

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Client</b></h5>
      <p class="card-text">Create .NET clients that interact with a Dapr sidecar and other Dapr applications.</p>
      <a href="{{< ref dotnet-client >}}" class="stretched-link"></a>
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
      <a href="{{< ref dotnet-actors >}}" class="stretched-link"></a>
    </div>
  </div>
</div>

## More information

Learn more about local development options, or browse NuGet packages to add to your existing .NET applications.

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Development</b></h5>
      <p class="card-text">Learn about local development options for .NET Dapr applications</p>
      <a href="{{< ref dotnet-development >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>NuGet packages</b></h5>
      <p class="card-text">Dapr packages for adding the .NET SDKs to your .NET applications.</p>
      <a href="https://www.nuget.org/profiles/dapr.io" class="stretched-link"></a>
    </div>
  </div>
</div>
<br />