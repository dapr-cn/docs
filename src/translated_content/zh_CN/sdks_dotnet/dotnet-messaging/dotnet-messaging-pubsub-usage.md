---
type: docs
title: "DaprPublishSubscribeClient 使用指南"
linkTitle: "DaprPublishSubscribeClient 使用指南"
weight: 69000
description: 使用 DaprPublishSubscribeClient 的基本提示和建议
---

## 生命周期管理

`DaprPublishSubscribeClient` 是 Dapr 客户端的一个版本，专门用于与 Dapr 消息 API 交互。它可以与 `DaprClient` 和其他 Dapr 客户端一起注册而不会出现问题。

它通过 TCP 套接字与 Dapr sidecar 通信，维护对网络资源的访问，并实现了 `IAsyncDisposable` 接口以支持资源的快速清理。

为了获得最佳性能，建议创建一个长生命周期的 `DaprPublishSubscribeClient` 实例，并在整个应用程序中共享使用。`DaprPublishSubscribeClient` 实例是线程安全的，适合共享使用。

可以通过依赖注入来实现这一点。注册方法支持以单例、作用域实例或瞬态（每次注入时重新创建）的方式进行注册，但也可以通过 `IConfiguration` 或其他注入服务的值来注册，这在每个类中从头创建客户端时是不切实际的。

避免为每个操作创建一个 `DaprPublishSubscribeClient` 并在操作完成后销毁它。`DaprPublishSubscribeClient` 应仅在您不再希望接收订阅事件时才被销毁，因为销毁它将取消正在进行的新事件接收。

## 通过 DaprPublishSubscribeClientBuilder 配置 DaprPublishSubscribeClient

可以通过在 `DaprPublishSubscribeClientBuilder` 类上调用方法来配置 `DaprPublishSubscribeClient`，然后调用 `.Build()` 来创建客户端本身。每个 `DaprPublishSubscribeClient` 的设置是独立的，并且在调用 `.Build()` 之后无法更改。

```cs
var daprPubsubClient = new DaprPublishSubscribeClientBuilder()
    .UseDaprApiToken("abc123") // 指定用于认证到其他 Dapr sidecar 的 API 令牌
    .Build();
```

`DaprPublishSubscribeClientBuilder` 包含以下设置：

- Dapr sidecar 的 HTTP 端点
- Dapr sidecar 的 gRPC 端点
- 用于配置 JSON 序列化的 `JsonSerializerOptions` 对象
- 用于配置 gRPC 的 `GrpcChannelOptions` 对象
- 用于认证请求到 sidecar 的 API 令牌
- 用于创建 SDK 使用的 `HttpClient` 实例的工厂方法
- 用于在向 sidecar 发出请求时使用的 `HttpClient` 实例的超时

SDK 将读取以下环境变量来配置默认值：

- `DAPR_HTTP_ENDPOINT`：用于查找 Dapr sidecar 的 HTTP 端点，例如：`https://dapr-api.mycompany.com`
- `DAPR_GRPC_ENDPOINT`：用于查找 Dapr sidecar 的 gRPC 端点，例如：`https://dapr-grpc-api.mycompany.com`
- `DAPR_HTTP_PORT`：如果未设置 `DAPR_HTTP_ENDPOINT`，则用于查找 Dapr sidecar 的本地 HTTP 端点
- `DAPR_GRPC_PORT`：如果未设置 `DAPR_GRPC_ENDPOINT`，则用于查找 Dapr sidecar 的本地 gRPC 端点
- `DAPR_API_TOKEN`：用于设置 API 令牌

### 配置 gRPC 通道选项

Dapr 使用 `CancellationToken` 进行取消依赖于 gRPC 通道选项的配置。如果您需要自行配置这些选项，请确保启用 [ThrowOperationCanceledOnCancellation 设置](https://grpc.github.io/grpc/csharp-dotnet/api/Grpc.Net.Client.GrpcChannelOptions.html#Grpc_Net_Client_GrpcChannelOptions_ThrowOperationCanceledOnCancellation)。

```cs
var daprPubsubClient = new DaprPublishSubscribeClientBuilder()
    .UseGrpcChannelOptions(new GrpcChannelOptions { ... ThrowOperationCanceledOnCancellation = true })
    .Build();
```

## 使用 `DaprPublishSubscribeClient` 进行取消操作

`DaprPublishSubscribeClient` 上的 API 执行异步操作并接受一个可选的 `CancellationToken` 参数。这遵循 .NET 的标准做法，用于可取消的操作。请注意，当取消发生时，不能保证远程端点停止处理请求，只能保证客户端已停止等待完成。

当操作被取消时，它将抛出一个 `OperationCancelledException`。

## 通过依赖注入配置 `DaprPublishSubscribeClient`

使用内置的扩展方法在依赖注入容器中注册 `DaprPublishSubscribeClient` 可以提供注册长生命周期服务一次的好处，集中复杂的配置并通过确保在可能的情况下重新利用类似的长生命周期资源（例如 `HttpClient` 实例）来提高性能。

有三种重载可用，以便为开发人员提供最大的灵活性来配置客户端以适应他们的场景。每个重载都会代表您注册 `IHttpClientFactory`（如果尚未注册），并配置 `DaprPublishSubscribeClientBuilder` 以在创建 `HttpClient` 实例时使用它，以便尽可能多地重用相同的实例并避免套接字耗尽和其他问题。

在第一种方法中，开发人员没有进行任何配置，`DaprPublishSubscribeClient` 使用默认设置进行配置。

```cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.DaprPublishSubscribeClient(); //根据需要注册 `DaprPublishSubscribeClient` 以进行注入
var app = builder.Build();
```

有时，开发人员需要使用上述各种配置选项来配置创建的客户端。这是通过传入 `DaprJobsClientBuiler` 的重载来完成的，并公开用于配置必要选项的方法。

```cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprJobsClient((_, daprPubSubClientBuilder) => {
   //设置 API 令牌
   daprPubSubClientBuilder.UseDaprApiToken("abc123");
   //指定非标准 HTTP 端点
   daprPubSubClientBuilder.UseHttpEndpoint("http://dapr.my-company.com");
});

var app = builder.Build();
```

最后，开发人员可能需要从其他服务中检索信息以填充这些配置值。该值可以从 `DaprClient` 实例、供应商特定的 SDK 或某些本地服务中提供，但只要它也在 DI 中注册，就可以通过最后一个重载将其注入到此配置操作中：

```cs
var builder = WebApplication.CreateBuilder(args);

//注册一个虚构的服务，从某处检索秘密
builder.Services.AddSingleton<SecretService>();

builder.Services.AddDaprPublishSubscribeClient((serviceProvider, daprPubSubClientBuilder) => {
    //从服务提供者中检索 `SecretService` 的实例
    var secretService = serviceProvider.GetRequiredService<SecretService>();
    var daprApiToken = secretService.GetSecret("DaprApiToken").Value;

    //配置 `DaprPublishSubscribeClientBuilder`
    daprPubSubClientBuilder.UseDaprApiToken(daprApiToken);
});

var app = builder.Build();
```