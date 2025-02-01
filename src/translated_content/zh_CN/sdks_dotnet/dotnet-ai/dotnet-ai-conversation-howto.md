---
type: docs
title: "如何在 .NET SDK 中创建和使用 Dapr AI 会话"
linkTitle: "如何使用 AI 会话客户端"
weight: 500100
description: 学习如何使用 .NET SDK 创建和使用 Dapr 会话 AI 客户端
---

## 前提条件
- 已安装 [.NET 6](https://dotnet.microsoft.com/download/dotnet/6.0)、[.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0) 或 [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)
- [已初始化的 Dapr 环境](https://docs.dapr.io/getting-started/install-dapr-selfhost)

{{% alert title="注意事项" color="primary" %}}

.NET 6 是此版本中 Dapr .NET SDK 包的最低支持版本。仅 .NET 8 和 .NET 9 将在 Dapr v1.16 及更高版本中得到支持。

{{% /alert %}}

## 安装

要开始使用 Dapr AI .NET SDK 客户端，请从 NuGet 安装 [Dapr.AI 包](https://www.nuget.org/packages/Dapr.AI)：
```sh
dotnet add package Dapr.AI
```

`DaprConversationClient` 通过 TCP 套接字形式维护对网络资源的访问，用于与 Dapr sidecar 通信。

### 依赖注入

`AddDaprAiConversation()` 方法将注册 Dapr 客户端到 ASP.NET Core 的依赖注入中，这是使用此包的推荐方法。此方法接受一个可选的选项委托，用于配置 `DaprConversationClient`，以及一个 `ServiceLifetime` 参数，允许您为注册的服务指定不同的生命周期，而不是默认的 `Singleton` 值。

以下示例假设所有默认值均可接受，并足以注册 `DaprConversationClient`：

```csharp
services.AddDaprAiConversation();
```

可选的配置委托用于通过在 `DaprConversationClientBuilder` 上指定选项来配置 `DaprConversationClient`，如下例所示：
```csharp
services.AddSingleton<DefaultOptionsProvider>();
services.AddDaprAiConversation((serviceProvider, clientBuilder) => {
     //注入服务以获取值
     var optionsProvider = serviceProvider.GetRequiredService<DefaultOptionsProvider>();
     var standardTimeout = optionsProvider.GetStandardTimeout();
     
     //在客户端构建器上配置值
     clientBuilder.UseTimeout(standardTimeout);
});
```

### 手动实例化
除了使用依赖注入，还可以使用静态客户端构建器构建 `DaprConversationClient`。

为了获得最佳性能，请创建一个长期使用的 `DaprConversationClient` 实例，并在整个应用程序中共享该实例。`DaprConversationClient` 实例是线程安全的，旨在共享。

避免为每个操作创建一个新的 `DaprConversationClient`。

可以通过在调用 `.Build()` 创建客户端之前调用 `DaprConversationClientBuilder` 类上的方法来配置 `DaprConversationClient`。每个 `DaprConversationClient` 的设置是独立的，调用 `.Build()` 后无法更改。

```csharp
var daprConversationClient = new DaprConversationClientBuilder()
    .UseJsonSerializerSettings( ... ) //配置 JSON 序列化器
    .Build();
```

有关通过构建器配置 Dapr 客户端时可用选项的更多信息，请参阅 .NET [文档]({{< ref dotnet-client >}})。

## 动手试试
测试 Dapr AI .NET SDK。通过示例查看 Dapr 的实际应用：

| SDK 示例 | 描述 |
| ----------- | ----------- |
| [SDK 示例](https://github.com/dapr/dotnet-sdk/tree/master/examples) | 克隆 SDK 仓库以尝试一些示例并开始使用。 |

## 基础模块

.NET SDK 的这一部分允许您与会话 API 接口，以便从大型语言模型发送和接收消息。

### 发送消息
