---
type: docs
title: "DaprJobsClient 使用指南"
linkTitle: "DaprJobsClient 使用指南"
weight: 59000
description: 使用 DaprJobsClient 的基本技巧和建议
---

## 生命周期管理

`DaprJobsClient` 是专门用于与 Dapr Jobs API 交互的 Dapr 客户端。它可以与 `DaprClient` 和其他 Dapr 客户端一起注册而不会出现问题。

它通过 TCP 套接字与 Dapr sidecar 通信，并实现了 `IDisposable` 接口以便快速清理资源。

为了获得最佳性能，建议创建一个长生命周期的 `DaprJobsClient` 实例，并在整个应用程序中共享使用。`DaprJobsClient` 实例是线程安全的，适合在多个线程中共享。

可以通过依赖注入来实现这一点。注册方法支持以单例、作用域实例或瞬态方式注册，但也可以利用 `IConfiguration` 或其他注入服务中的值进行注册，这样就不需要在每个类中重新创建客户端。

避免为每个操作创建一个新的 `DaprJobsClient` 并在操作完成后销毁它。

## 通过 DaprJobsClientBuilder 配置 DaprJobsClient

可以通过 `DaprJobsClientBuilder` 类上的方法来配置 `DaprJobsClient`，然后调用 `.Build()` 来创建客户端。每个 `DaprJobsClient` 的设置是独立的，调用 `.Build()` 后无法更改。

```cs
var daprJobsClient = new DaprJobsClientBuilder()
    .UseDaprApiToken("abc123") // 指定用于验证到其他 Dapr sidecar 的 API 令牌
    .Build();
```

`DaprJobsClientBuilder` 包含以下设置：

- Dapr sidecar 的 HTTP 端点
- Dapr sidecar 的 gRPC 端点
- 用于配置 JSON 序列化的 `JsonSerializerOptions` 对象
- 用于配置 gRPC 的 `GrpcChannelOptions` 对象
- 用于验证请求到 sidecar 的 API 令牌
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
var daprJobsClient = new DaprJobsClientBuilder()
    .UseGrpcChannelOptions(new GrpcChannelOptions { ... ThrowOperationCanceledOnCancellation = true })
    .Build();
```

## 使用 `DaprJobsClient` 进行取消操作

`DaprJobsClient` 上的 API 执行异步操作并接受一个可选的 `CancellationToken` 参数。这遵循 .NET 的标准做法，用于可取消的操作。请注意，当取消发生时，不能保证远程端点停止处理请求，只能保证客户端已停止等待完成。

当操作被取消时，将抛出 `OperationCancelledException`。

## 通过依赖注入配置 `DaprJobsClient`

使用内置的扩展方法在依赖注入容器中注册 `DaprJobsClient` 可以提供一次性注册长生命周期服务的好处，集中复杂配置并通过确保在可能的情况下重新利用类似的长生命周期资源（例如 `HttpClient` 实例）来提高性能。

有三种重载可用，以便开发人员在为其场景配置客户端时具有最大的灵活性。每个重载都会代表您注册 `IHttpClientFactory`（如果尚未注册），并在创建 `HttpClient` 实例时配置 `DaprJobsClientBuilder` 以尽可能多地重用相同的实例，避免套接字耗尽和其他问题。

在第一种方法中，开发人员没有进行任何配置，`DaprJobsClient` 使用默认设置进行配置。

```cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprJobsClient(); //根据需要注册 `DaprJobsClient` 以进行注入
var app = builder.Build();
```

有时，开发人员需要使用上面详细介绍的各种配置选项来配置创建的客户端。这是通过传入 `DaprJobsClientBuiler` 并公开用于配置必要选项的方法的重载来完成的。

```cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprJobsClient((_, daprJobsClientBuilder) => {
   //设置 API 令牌
   daprJobsClientBuilder.UseDaprApiToken("abc123");
   //指定非标准 HTTP 端点
   daprJobsClientBuilder.UseHttpEndpoint("http://dapr.my-company.com");
});

var app = builder.Build();
```

最后，开发人员可能需要从其他服务中检索信息以填充这些配置值。该值可以从 `DaprClient` 实例、供应商特定的 SDK 或某些本地服务中提供，但只要它也在 DI 中注册，就可以通过最后一个重载将其注入到此配置操作中：

```cs
var builder = WebApplication.CreateBuilder(args);

//注册一个虚构的服务，从某处检索 secret
builder.Services.AddSingleton<SecretService>();

builder.Services.AddDaprJobsClient((serviceProvider, daprJobsClientBuilder) => {
    //从服务提供者中检索 `SecretService` 的实例
    var secretService = serviceProvider.GetRequiredService<SecretService>();
    var daprApiToken = secretService.GetSecret("DaprApiToken").Value;

    //配置 `DaprJobsClientBuilder`
    daprJobsClientBuilder.UseDaprApiToken(daprApiToken);
});

var app = builder.Build();
```

## 理解 DaprJobsClient 上的负载序列化

虽然 `DaprClient` 上有许多方法可以使用 `System.Text.Json` 序列化器自动序列化和反序列化数据，但此 SDK 采用不同的理念。相反，相关方法接受一个可选的 `ReadOnlyMemory<byte>` 负载，这意味着序列化是留给开发人员的练习，通常不由 SDK 处理。

话虽如此，每种调度方法都有一些可用的辅助扩展方法。如果您知道要使用 JSON 可序列化的类型，可以使用每种调度类型的 `Schedule*WithPayloadAsync` 方法，该方法接受一个 `object` 作为负载和一个可选的 `JsonSerializerOptions` 用于序列化值。这将为您将值转换为 UTF-8 编码的字节，作为一种便利。以下是调度 Cron 表达式时可能的示例：

```cs
public sealed record Doodad (string Name, int Value);

//...
var doodad = new Doodad("Thing", 100);
await daprJobsClient.ScheduleCronJobWithPayloadAsync("myJob", "5 * * * *", doodad);
```

同样，如果您有一个普通的字符串值，可以使用相同方法的重载来序列化字符串类型的负载，JSON 序列化步骤将被跳过，只会被编码为 UTF-8 编码字节的数组。以下是调度一次性 job 时可能的示例：

```cs
var now = DateTime.UtcNow;
var oneWeekFromNow = now.AddDays(7);
await daprJobsClient.ScheduleOneTimeJobWithPayloadAsync("myOtherJob", oneWeekFromNow, "This is a test!");
```

`JobDetails` 类型将数据返回为 `ReadOnlyMemory<byte>?`，因此开发人员可以根据需要进行反序列化，但同样有两个包含的辅助扩展，可以将其反序列化为 JSON 兼容类型或字符串。这两种方法都假设开发人员对最初调度的 job 进行了编码（可能使用辅助序列化方法），因为这些方法不会强制字节表示它们不是的东西。

要将字节反序列化为字符串，可以使用以下辅助方法：
```cs
if (jobDetails.Payload is not null)
{
    string payloadAsString = jobDetails.Payload.DeserializeToString(); //如果成功，返回一个具有值的字符串
}
```

要将 JSON 编码的 UTF-8 字节反序列化为相应的类型，可以使用以下辅助方法。提供了一个重载参数，允许开发人员传入自己的 `JsonSerializerOptions` 以在反序列化期间应用。

```cs
public sealed record Doodad (string Name, int Value);

//...
if (jobDetails.Payload is not null)
{
    var deserializedDoodad = jobDetails.Payload.DeserializeFromJsonBytes<Doodad>();
}
```

## 错误处理

`DaprJobsClient` 上的方法如果在 SDK 和运行在 Dapr sidecar 上的 Jobs API 服务之间遇到问题，将抛出 `DaprJobsServiceException`。如果由于通过此 SDK 向 Jobs API 服务发出的请求格式不正确而遇到失败，将抛出 `DaprMalformedJobException`。在非法参数值的情况下，将抛出适当的标准异常（例如 `ArgumentOutOfRangeException` 或 `ArgumentNullException`），并附上有问题的参数名称。对于其他任何情况，将抛出 `DaprException`。

最常见的失败情况将与以下内容相关：

- 在与 Jobs API 交互时参数格式不正确
- 瞬态故障，例如网络问题
- 无效数据，例如无法将值反序列化为其最初未从中序列化的类型

在任何这些情况下，您都可以通过 `.InnerException` 属性检查更多异常详细信息。