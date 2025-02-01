---
type: docs
title: "DaprClient 使用"
linkTitle: "DaprClient 使用"
weight: 100000
description: 使用 DaprClient 的基本提示和建议
---

## 生命周期管理

`DaprClient` 使用 TCP 套接字来访问网络资源，与 Dapr sidecar 进行通信。它实现了 `IDisposable` 接口，以便快速清理资源。

### 依赖注入

通过 `AddDaprClient()` 方法可以在 ASP.NET Core 中注册 Dapr 客户端。此方法接受一个可选的配置委托，用于配置 `DaprClient`，以及一个 `ServiceLifetime` 参数，允许您为注册的资源指定不同的生命周期，默认是 `Singleton`。

以下示例展示了如何使用默认值注册 `DaprClient`：

```csharp
services.AddDaprClient();
```

您可以通过配置委托在 `DaprClientBuilder` 上指定选项来配置 `DaprClient`，例如：

```csharp
services.AddDaprClient(daprBuilder => {
    daprBuilder.UseJsonSerializerOptions(new JsonSerializerOptions {
            WriteIndented = true,
            MaxDepth = 8
        });
    daprBuilder.UseTimeout(TimeSpan.FromSeconds(30));
});
```

另一个重载允许访问 `DaprClientBuilder` 和 `IServiceProvider`，以便进行更高级的配置，例如从依赖注入容器中获取服务：

```csharp
services.AddSingleton<SampleService>();
services.AddDaprClient((serviceProvider, daprBuilder) => {
    var sampleService = serviceProvider.GetRequiredService<SampleService>();
    var timeoutValue = sampleService.TimeoutOptions;
    
    daprBuilder.UseTimeout(timeoutValue);
});
```

### 手动实例化

除了依赖注入，您还可以使用静态客户端构建器手动创建 `DaprClient`。

为了优化性能，建议创建一个长生命周期的 `DaprClient` 实例，并在整个应用程序中共享。`DaprClient` 是线程安全的，适合共享使用。

避免为每个操作创建一个新的 `DaprClient` 实例并在操作完成后释放它。

## 配置 DaprClient

在调用 `.Build()` 创建客户端之前，可以通过 `DaprClientBuilder` 类上的方法来配置 `DaprClient`。每个 `DaprClient` 对象的设置是独立的，创建后无法更改。

```C#
var daprClient = new DaprClientBuilder()
    .UseJsonSerializerSettings( ... ) // 配置 JSON 序列化器
    .Build();
```

默认情况下，`DaprClientBuilder` 会按以下顺序优先获取配置值：

- 直接提供给 `DaprClientBuilder` 方法的值（例如 `UseTimeout(TimeSpan.FromSeconds(30))`）
- 从可选的 `IConfiguration` 中提取的值，与环境变量名称匹配
- 从环境变量中提取的值
- 默认值

### 在 `DaprClientBuilder` 上配置

`DaprClientBuilder` 提供以下方法来设置配置选项：

- `UseHttpEndpoint(string)`: 设置 Dapr sidecar 的 HTTP 端点
- `UseGrpcEndpoint(string)`: 设置 Dapr sidecar 的 gRPC 端点
- `UseGrpcChannelOptions(GrpcChannelOptions)`: 设置 gRPC 通道选项
- `UseHttpClientFactory(IHttpClientFactory)`: 配置 `DaprClient` 使用的 `HttpClient` 工厂
- `UseJsonSerializationOptions(JsonSerializerOptions)`: 配置 JSON 序列化
- `UseDaprApiToken(string)`: 为 Dapr sidecar 的身份验证提供令牌
- `UseTimeout(TimeSpan)`: 指定与 Dapr sidecar 通信时的超时值

### 从 `IConfiguration` 配置

除了直接从环境变量获取配置值，您还可以通过 `IConfiguration` 提供这些值。

例如，在多租户环境中，您可能需要为环境变量添加前缀。以下示例展示了如何从环境变量中获取这些值到 `IConfiguration`，并移除前缀：

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables("test_"); // 获取所有以 "test_" 开头的环境变量，并移除前缀
builder.Services.AddDaprClient();
```

### 从环境变量配置

SDK 会读取以下环境变量来配置默认值：

- `DAPR_HTTP_ENDPOINT`: Dapr sidecar 的 HTTP 端点，例如：`https://dapr-api.mycompany.com`
- `DAPR_GRPC_ENDPOINT`: Dapr sidecar 的 gRPC 端点，例如：`https://dapr-grpc-api.mycompany.com`
- `DAPR_HTTP_PORT`: 如果未设置 `DAPR_HTTP_ENDPOINT`，则用于查找本地 HTTP 端点
- `DAPR_GRPC_PORT`: 如果未设置 `DAPR_GRPC_ENDPOINT`，则用于查找本地 gRPC 端点
- `DAPR_API_TOKEN`: 设置 API 令牌

{{% alert title="注意" color="primary" %}}
如果同时指定了 `DAPR_HTTP_ENDPOINT` 和 `DAPR_HTTP_PORT`，则会忽略 `DAPR_HTTP_PORT` 的端口值，而使用 `DAPR_HTTP_ENDPOINT` 上定义的端口。`DAPR_GRPC_ENDPOINT` 和 `DAPR_GRPC_PORT` 也是如此。
{{% /alert %}}

### 配置 gRPC 通道选项

Dapr 使用 `CancellationToken` 进行取消，依赖于 gRPC 通道选项的配置，默认已启用。如果您需要自行配置这些选项，请确保启用 [ThrowOperationCanceledOnCancellation 设置](https://grpc.github.io/grpc/csharp-dotnet/api/Grpc.Net.Client.GrpcChannelOptions.html#Grpc_Net_Client_GrpcChannelOptions_ThrowOperationCanceledOnCancellation)。

```C#
var daprClient = new DaprClientBuilder()
    .UseGrpcChannelOptions(new GrpcChannelOptions { ... ThrowOperationCanceledOnCancellation = true })
    .Build();
```

## 使用 DaprClient 进行取消

在 DaprClient 上执行异步操作的 API 接受一个可选的 `CancellationToken` 参数。这遵循 .NET 的标准惯例，用于可取消的操作。请注意，当取消发生时，不能保证远程端点停止处理请求，只能保证客户端已停止等待完成。

当操作被取消时，将抛出一个 `OperationCancelledException`。

## 理解 DaprClient 的 JSON 序列化

`DaprClient` 上的许多方法使用 `System.Text.Json` 序列化器执行 JSON 序列化。接受应用程序数据类型作为参数的方法将对其进行 JSON 序列化，除非文档明确说明了其他情况。

如果您有高级需求，建议阅读 [System.Text.Json 文档](https://docs.microsoft.com/en-us/dotnet/standard/serialization/system-text-json-overview)。Dapr .NET SDK 不提供独特的序列化行为或自定义 - 它依赖于底层序列化器将数据转换为和从应用程序的 .NET 类型。

`DaprClient` 被配置为使用从 [JsonSerializerDefaults.Web](https://docs.microsoft.com/en-us/dotnet/api/system.text.json.jsonserializerdefaults?view=net-5.0) 配置的序列化器选项对象。这意味着 `DaprClient` 将使用 `camelCase` 作为属性名称，允许读取带引号的数字（`"10.99"`），并将不区分大小写地绑定属性。这些是与 ASP.NET Core 和 `System.Text.Json.Http` API 一起使用的相同设置，旨在遵循可互操作的 Web 约定。

截至 .NET 5.0，`System.Text.Json` 对所有 F# 语言特性内置支持不佳。如果您使用 F#，您可能需要使用一个添加对 F# 特性支持的转换器包，例如 [FSharp.SystemTextJson](https://github.com/Tarmil/FSharp.SystemTextJson)。

### JSON 序列化的简单指导

如果您使用的功能集映射到 JSON 的类型系统，您在使用 JSON 序列化和 `DaprClient` 时的体验将会很顺利。这些是可以简化代码的通用指南。

- 避免继承和多态
- 不要尝试序列化具有循环引用的数据
- 不要在构造函数或属性访问器中放置复杂或昂贵的逻辑
- 使用与 JSON 类型（数值类型、字符串、`DateTime`）清晰映射的 .NET 类型
- 为顶级消息、事件或状态值创建自己的类，以便将来可以添加属性
- 设计具有 `get`/`set` 属性的类型，或者使用 [支持的模式](https://docs.microsoft.com/en-us/dotnet/standard/serialization/system-text-json-immutability?pivots=dotnet-5-0) 用于 JSON 的不可变类型

### 多态性和序列化

`DaprClient` 使用的 `System.Text.Json` 序列化器在执行序列化时使用值的声明类型。

本节将使用 `DaprClient.SaveStateAsync<TValue>(...)` 作为示例，但建议适用于 SDK 暴露的任何 Dapr 构建块。

```C#
public class Widget
{
    public string Color { get; set; }
}
...

// 将 Widget 值作为 JSON 存储在状态存储中
Widget widget = new Widget() { Color = "Green", };
await client.SaveStateAsync("mystatestore", "mykey", widget);
```

在上面的示例中，类型参数 `TValue` 的类型参数是从 `widget` 变量的类型推断出来的。这很重要，因为 `System.Text.Json` 序列化器将根据值的*声明类型*执行序列化。结果是 JSON 值 `{ "color": "Green" }` 将被存储。

考虑当您尝试使用 `Widget` 的派生类型时会发生什么：

```C#
public class Widget
{
    public string Color { get; set; }
}

public class SuperWidget : Widget
{
    public bool HasSelfCleaningFeature { get; set; }
}
...

// 将 SuperWidget 值作为 JSON 存储在状态存储中
Widget widget = new SuperWidget() { Color = "Green", HasSelfCleaningFeature = true, };
await client.SaveStateAsync("mystatestore", "mykey", widget);
```

在此示例中，我们使用了一个 `SuperWidget`，但变量的声明类型是 `Widget`。由于 JSON 序列化器的行为由声明类型决定，它只看到一个简单的 `Widget`，并将保存值 `{ "color": "Green" }`，而不是 `{ "color": "Green", "hasSelfCleaningFeature": true }`。

如果您希望 `SuperWidget` 的属性被序列化，那么最好的选择是用 `object` 覆盖类型参数。这将导致序列化器包含所有数据，因为它对类型一无所知。

```C#
Widget widget = new SuperWidget() { Color = "Green", HasSelfCleaningFeature = true, };
await client.SaveStateAsync<object>("mystatestore", "mykey", widget);
```

## 错误处理

当遇到故障时，`DaprClient` 上的方法将抛出 `DaprException` 或其子类。

```C#
try
{
    var widget = new Widget() { Color = "Green", };
    await client.SaveStateAsync("mystatestore", "mykey", widget);
}
catch (DaprException ex)
{
    // 处理异常，记录日志，重试等
}
```

最常见的故障情况将与以下内容相关：

- Dapr 组件配置不正确
- 瞬时故障，例如网络问题
- 无效数据，例如 JSON 反序列化失败

在任何这些情况下，您都可以通过 `.InnerException` 属性检查更多异常详细信息。
