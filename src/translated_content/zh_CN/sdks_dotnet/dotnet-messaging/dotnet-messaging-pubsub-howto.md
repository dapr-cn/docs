---
type: docs
title: "如何：在 .NET SDK 中编写和管理 Dapr 流式订阅"
linkTitle: "如何：编写和管理流式订阅"
weight: 61000
description: 学习如何使用 .NET SDK 编写和管理 Dapr 流式订阅
---

我们来创建一个使用流式功能的发布/订阅主题或队列的订阅。我们将使用[此处提供的简单示例](https://github.com/dapr/dotnet-sdk/tree/master/examples/Client/PublishSubscribe/StreamingSubscriptionExample)，进行演示，并逐步讲解如何在运行时配置消息处理程序，而无需预先配置端点。在本指南中，您将会学习如何：

- 部署一个 .NET Web API 应用程序 ([StreamingSubscriptionExample](https://github.com/dapr/dotnet-sdk/tree/master/examples/Client/PublishSubscribe/StreamingSubscriptionExample))
- 使用 Dapr .NET Messaging SDK 动态订阅发布/订阅主题。

## 前提条件
- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)
- [已初始化的 Dapr 环境](https://docs.dapr.io/getting-started/install-dapr-selfhost)
- 安装 [.NET 6](https://dotnet.microsoft.com/download/dotnet/6.0)、[.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0) 或 [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0)
- 项目中安装 [Dapr.Messaging](https://www.nuget.org/packages/Dapr.Messaging) NuGet 包

{{% alert title="注意" color="primary" %}}

请注意，虽然 .NET 6 是 Dapr v1.15 中支持的最低版本，但只有 .NET 8 和 .NET 9 将在 v1.16 及更高版本中继续受到支持。

{{% /alert %}}

## 设置环境
克隆 [.NET SDK 仓库](https://github.com/dapr/dotnet-sdk)。

```sh
git clone https://github.com/dapr/dotnet-sdk.git
```

从 .NET SDK 根目录，导航到 Dapr 流式发布/订阅示例。

```sh
cd examples/Client/PublishSubscribe
```

## 本地运行应用程序

要运行 Dapr 应用程序，您需要启动 .NET 程序和一个 Dapr sidecar。导航到 `StreamingSubscriptionExample` 目录。

```sh
cd StreamingSubscriptionExample
```

我们将运行一个命令，同时启动 Dapr sidecar 和 .NET 程序。

```sh
dapr run --app-id pubsubapp --dapr-grpc-port 4001 --dapr-http-port 3500 -- dotnet run
```
> Dapr 监听 HTTP 请求在 `http://localhost:3500`，而 gRPC 请求在 `http://localhost:4001`。

## 使用依赖注入注册 Dapr PubSub 客户端
Dapr Messaging SDK 提供了一个扩展方法来简化 Dapr PubSub 客户端的注册。在 `Program.cs` 中完成依赖注入注册之前，添加以下行：

```csharp
var builder = WebApplication.CreateBuilder(args);

//可以在这两行之间的任何位置添加
builder.Services.AddDaprPubSubClient(); //就是这样

var app = builder.Build();
```

您可能希望为 Dapr PubSub 客户端提供一些配置选项，这些选项应在每次调用 sidecar 时存在，例如 Dapr API 令牌，或者您希望使用非标准的 HTTP 或 gRPC 端点。这可以通过使用允许配置 `DaprPublishSubscribeClientBuilder` 实例的注册方法重载来实现：

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprPubSubClient((_, daprPubSubClientBuilder) => {
    daprPubSubClientBuilder.UseDaprApiToken("abc123");
    daprPubSubClientBuilder.UseHttpEndpoint("http://localhost:8512"); //非标准 sidecar HTTP 端点
});

var app = builder.Build();
```

尽管如此，您可能希望注入的任何值需要从其他来源检索，该来源本身注册为依赖项。您可以使用另一个重载将 `IServiceProvider` 注入到配置操作方法中。在以下示例中，我们注册了一个虚构的单例，可以从某处检索 secret 并将其传递到 `AddDaprJobClient` 的配置方法中，以便我们可以从其他地方检索我们的 Dapr API 令牌以在此处注册：

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<SecretRetriever>();
builder.Services.AddDaprPubSubClient((serviceProvider, daprPubSubClientBuilder) => {
    var secretRetriever = serviceProvider.GetRequiredService<SecretRetriever>();
    var daprApiToken = secretRetriever.GetSecret("DaprApiToken").Value;
    daprPubSubClientBuilder.UseDaprApiToken(daprApiToken);
    
    daprPubSubClientBuilder.UseHttpEndpoint("http://localhost:8512");
});

var app = builder.Build();
```

## 使用 IConfiguration 使用 Dapr PubSub 客户端
可以使用注册的 `IConfiguration` 中的值配置 Dapr PubSub 客户端，而无需显式指定每个值覆盖，如前一节中使用 `DaprPublishSubscribeClientBuilder` 所示。相反，通过填充通过依赖注入提供的 `IConfiguration`，`AddDaprPubSubClient()` 注册将自动使用这些值覆盖其各自的默认值。

首先在您的配置中填充值。这可以通过多种不同的方式完成，如下所示。

### 通过 `ConfigurationBuilder` 配置
应用程序设置可以在不使用配置源的情况下配置，而是通过使用 `ConfigurationBuilder` 实例在内存中填充值：

```csharp
var builder = WebApplication.CreateBuilder();

//创建配置
var configuration = new ConfigurationBuilder()
    .AddInMemoryCollection(new Dictionary<string, string> {
            { "DAPR_HTTP_ENDPOINT", "http://localhost:54321" },
            { "DAPR_API_TOKEN", "abc123" }
        })
    .Build();

builder.Configuration.AddConfiguration(configuration);
builder.Services.AddDaprPubSubClient(); //这将自动从 IConfiguration 填充 HTTP 端点和 API 令牌值
```

### 通过环境变量配置
应用程序设置可以从可用于您的应用程序的环境变量中访问。

以下环境变量将用于填充用于注册 Dapr PubSub 客户端的 HTTP 端点和 API 令牌。

| 键                  | 值                    |
|--------------------|------------------------|
| DAPR_HTTP_ENDPOINT | http://localhost:54321 |
| DAPR_API_TOKEN     | abc123                 |

```csharp
var builder = WebApplication.CreateBuilder();

builder.Configuration.AddEnvironmentVariables();
builder.Services.AddDaprPubSubClient();
```

Dapr PubSub 客户端将被配置为使用 HTTP 端点 `http://localhost:54321` 并用 API 令牌头 `abc123` 填充所有出站请求。

### 通过前缀环境变量配置
然而，在共享主机场景中，多个应用程序都在同一台机器上运行而不使用容器或在开发环境中，前缀环境变量并不罕见。以下示例假设 HTTP 端点和 API 令牌都将从前缀为 "myapp_" 的环境变量中提取。在此场景中使用的两个环境变量如下：

| 键                        | 值                    |
|--------------------------|------------------------|
| myapp_DAPR_HTTP_ENDPOINT | http://localhost:54321 |
| myapp_DAPR_API_TOKEN     | abc123                 |

这些环境变量将在以下示例中加载到注册的配置中，并在没有附加前缀的情况下提供。

```csharp
var builder = WebApplication.CreateBuilder();

builder.Configuration.AddEnvironmentVariables(prefix: "myapp_");
builder.Services.AddDaprPubSubClient();
```

Dapr PubSub 客户端将被配置为使用 HTTP 端点 `http://localhost:54321` 并用 API 令牌头 `abc123` 填充所有出站请求。

## 不依赖于依赖注入使用 Dapr PubSub 客户端
虽然使用依赖注入简化了 .NET 中复杂类型的使用，并使处理复杂配置变得更容易，但您不需要以这种方式注册 `DaprPublishSubscribeClient`。相反，您还可以选择从 `DaprPublishSubscribeClientBuilder` 实例创建它的实例，如下所示：

```cs

public class MySampleClass
{
    public void DoSomething()
    {
        var daprPubSubClientBuilder = new DaprPublishSubscribeClientBuilder();
        var daprPubSubClient = daprPubSubClientBuilder.Build();

        //使用 `daprPubSubClient` 做一些事情
    }
}
```

## 设置消息处理程序
Dapr 中的流式订阅实现使您可以更好地控制事件的背压处理，通过在您的应用程序准备好接受它们之前将消息保留在 Dapr 运行时中。 .NET SDK 支持一个高性能队列，用于在处理挂起时在您的应用程序中维护这些消息的本地缓存。这些消息将保留在队列中，直到每个消息的处理超时或采取响应操作（通常在处理成功或失败后）。在 Dapr 运行时收到此响应操作之前，消息将由 Dapr 保留，并在服务故障时可用。

可用的各种响应操作如下：
| 响应操作 | 描述 |
| --- | --- |
| 重试 | 事件应在将来再次传递。 |
| 丢弃 | 事件应被删除（或转发到死信队列，如果已配置）并且不再尝试。 |
| 成功 | 事件应被删除，因为它已成功处理。 |

处理程序将一次只接收一条消息，如果为订阅提供了取消令牌，则将在处理程序调用期间提供此令牌。

处理程序必须配置为返回一个 `Task<TopicResponseAction>`，指示这些操作之一，即使是从 try/catch 块中返回。如果您的处理程序未捕获异常，订阅将在订阅注册期间配置的选项中使用响应操作。

以下演示了示例中提供的示例消息处理程序：

```csharp
Task<TopicResponseAction> HandleMessageAsync(TopicMessage message, CancellationToken cancellationToken = default)
{
    try
    {
        //对消息做一些事情
        Console.WriteLine(Encoding.UTF8.GetString(message.Data.Span));
        return Task.FromResult(TopicResponseAction.Success);
    }
    catch
    {
        return Task.FromResult(TopicResponseAction.Retry);
    }
}
```

## 配置并订阅 PubSub 主题
流式订阅的配置需要在 Dapr 中注册的 PubSub 组件的名称、要订阅的主题或队列的名称、提供订阅配置的 `DaprSubscriptionOptions`、消息处理程序和可选的取消令牌。 `DaprSubscriptionOptions` 的唯一必需参数是默认的 `MessageHandlingPolicy`，它由每个事件的超时和超时时要采取的 `TopicResponseAction` 组成。

其他选项如下：

| 属性名称                                                                                     | 描述                                                                                          |
|--------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| Metadata                                                                                    | 额外的订阅元数据                                                                             |
| DeadLetterTopic                                                                             | 发送丢弃消息的死信主题的可选名称。                                                            |
| MaximumQueuedMessages                                                                       | 默认情况下，内部队列没有强制的最大边界，但设置此属性将施加上限。                             |
| MaximumCleanupTimeout                                                                       | 当订阅被处理或令牌标记取消请求时，这指定了处理内部队列中剩余消息的最大时间。                 |

然后按以下示例配置订阅：
```csharp
var messagingClient = app.Services.GetRequiredService<DaprPublishSubscribeClient>();

var cancellationTokenSource = new CancellationTokenSource(TimeSpan.FromSeconds(60)); //覆盖默认的30秒
var options = new DaprSubscriptionOptions(new MessageHandlingPolicy(TimeSpan.FromSeconds(10), TopicResponseAction.Retry));
var subscription = await messagingClient.SubscribeAsync("pubsub", "mytopic", options, HandleMessageAsync, cancellationTokenSource.Token);
```

## 终止并清理订阅
当您完成订阅并希望停止接收新事件时，只需等待对订阅实例的 `DisposeAsync()` 调用。这将导致客户端取消注册其他事件，并在处理所有仍在背压队列中的事件（如果有）后，处理任何内部资源。此清理将限于在注册订阅时提供的 `DaprSubscriptionOptions` 中的超时间隔，默认情况下设置为 30 秒。
