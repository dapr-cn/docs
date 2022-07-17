---
type: docs
title: "DaprClient 使用"
linkTitle: "DaprClient 使用"
weight: 100000
description: 使用 DaprClient 的基本提示和建议
---

## 生命周期管理

`DaprClient` 能够以 TCP 套接口的形式访问网络资源，与 Dapr sidecar 通信。 `DaprClient` 实现了 `IDisposable` ，以支持对资源的迫切清理。

为了获得最佳性能，请创建 `DaprClient` 的单一长期实例，并在整个应用程序中提供对该共享实例的访问。 `DaprClient` 实例是线程安全的，旨在共享。

避免为每个操作创建 `DaprClient` 并在操作完成后释放它。

## 配置 DaprClient

在调用 `.Build()` 创建客户端之前，可以通过调用 `DaprClientBuilder` 类的方法来配置 `DaprClient`。 每个 `DaprClient` 对象的设置都是独立的，并且在调用 `.Build()` 后无法更改。

```C#
var daprClient = new DaprClientBuilder()
    .UseJsonSerializerSettings( ... ) // Configure JSON serializer
    .Build();
```

`DaprClientBuilder` 包含以下各项的设置：

- Dapr sidecar 的 HTTP 端点
- Dapr sidecar 的 gRPC 端点
- 用于配置 JSON 序列化的 `JsonSerializerOptions` 对象
- 用于配置 gRPC 的 `GrpcChannelOptions` 对象
- 用于验证请求到 sidecar 的 API 令牌

SDK 将读取以下环境变量来配置默认值：

- `DAPR_HTTP_PORT`: 用于查找 Dapr sidecar 的 HTTP 端点
- `DAPR_GRPC_PORT`: 用于查找 Dapr sidecar 的 gRPC 端点
- `DAPR_API_TOKEN`: 用于设置 API 令牌

### 配置 gRPC 通道选项

Dapr使用 `CancellationToken` 进行取消，这依赖于 gRPC 通道选项的配置。 如果您需要自己配置这些选项，请确保启用 [ThrowOperationCanceledOnCancellation 设置](https://grpc.github.io/grpc/csharp-dotnet/api/Grpc.Net.Client.GrpcChannelOptions.html#Grpc_Net_Client_GrpcChannelOptions_ThrowOperationCanceledOnCancellation)。

```C#
var daprClient = new DaprClientBuilder()
    .UseGrpcChannelOptions(new GrpcChannelOptions { ... ThrowOperationCanceledOnCancellation = true })
    .Build();
```

## 使用 DaprClient 取消

DaprClient 上执行异步操作的 API 接受一个可选的 `CancellationToken` 参数。 这遵循了可取消操作的标准 .NET 习惯用法。 请注意，当取消发生时，并不能保证远程端点停止处理请求，只能保证客户端已经停止等待完成。

当操作被取消时，它将抛出一个 `OperationCancelledException`。

## 了解 DaprClient JSON 序列化

`DaprClient` 上的许多方法使用 `System.Text.Json` 序列化器执行 JSON 序列化。 接受应用程序数据类型作为参数的方法将对其进行 JSON 序列化，除非文档另有明确说明。

如果你有高级要求，[System.Text.Json文档](https://docs.microsoft.com/en-us/dotnet/standard/serialization/system-text-json-overview) 值得阅读。 Dapr .NET SDK 没有提供独特的序列化行为或自定义 - 它依赖于底层的序列化器将数据转换为应用程序的 .NET 类型。

`DaprClient` 被配置为使用来自 [JsonSerializerDefaults.Web](https://docs.microsoft.com/en-us/dotnet/api/system.text.json.jsonserializerdefaults?view=net-5.0) 配置的序列化器配置对象。 这意味着 `DaprClient` 将使用 `camelCase` 来命名属性，允许读取引号 (`"10.99"`)，并将不区分大小写地绑定属性。 这些设置与 ASP.NET Core 和 `System.Text.Json.Http` API 所使用的设置相同，并被设计为遵循可互操作的 Web 惯例。

`System.Text.Json` 截至.NET 5.0，并没有很好地支持所有内置的 F# 语言功能。 如果你使用的是 F#，你可能会想要使用一个添加了 F# 功能支持的转换器包，如 [FSharp.SystemTextJson](https://github.com/Tarmil/FSharp.SystemTextJson) 。

### JSON 序列化的简单指南

如果您使用映射到 JSON 类型系统的特性集，您使用 JSON 序列化和 `DaprClient` 的体验将会很顺利。 这些都是一般准则，在可以应用的地方会简化你的代码。

- 避免继承和多态性
- 不要试图用循环引用来序列化数据。
- 不要将复杂或昂贵的逻辑放在构造函数或属性访问器中
- 使用 .NET 类型，干净利落地映射到 JSON 类型（数字类型，字符串，`DateTime`）
- 为顶层消息、事件或状态值创建自己的类，以便您可以在未来添加属性
- 使用 `get`/`set` 属性设计类型，或者使用 JSON [支持的模式](https://docs.microsoft.com/en-us/dotnet/standard/serialization/system-text-json-immutability?pivots=dotnet-5-0)来设计不可变类型。

### 多态性和序列化

`DaprClient` 使用的 `System.Text.Json` 序列化器在执行序列化时使用声明的值类型。

本节将在示例中使用 `DaprClient.SaveStateAsync<TValue>(...)` ，但该建议适用于 SDK 暴露的任何 Dapr 构建块。

```C#
public class Widget
{
    public string Color { get; set; }
}
...

// Storing a Widget value as JSON in the state store
widget widget = new Widget() { Color = "Green", };
await client.SaveStateAsync("mystatestore", "mykey", widget);
```

在上面的例子中，类型参数 `TValue` 的类型参数是从 `widget` 变量的类型推断出来的。 这一点很重要，因为 `System.Text.Json` 序列化器将根据 *declared type* 的值来执行序列化。 结果是，JSON值 `{ "color":"Green" }` 将被存储。

考虑一下当你试图使用 `Widget` 的派生类型时会发生什么：

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

// Storing a SuperWidget value as JSON in the state store
Widget widget = new SuperWidget() { Color = "Green", HasSelfCleaningFeature = true, };
await client.SaveStateAsync("mystatestore", "mykey", widget);
```

在这个例子中，我们使用的是 `SuperWidget` ，但变量的声明类型是 `Widget`。 由于 JSON 序列化器的行为是由声明的类型决定的，所以它只看到一个简单的 `Widget`，并将保存 `{ "color": "Green" }`，而不是 `{ "color": "Green", "hasSelfCleaningFeature": true }`。

如果你想让 `SuperWidget` 的属性被序列化，那么最好的选择是用 `object` 覆盖类型参数。 这将导致序列器包含所有数据，因为它对类型一无所知。

```C#
Widget widget = new SuperWidget() { Color = "Green", HasSelfCleaningFeature = true, };
await client.SaveStateAsync<object>("mystatestore", "mykey", widget);
```

## 错误处理

`DaprClient` 上的方法会在遇到失败时抛出 `DaprException` 或子类。

```C#
try
{
    var widget = new Widget() { Color = "Green", };
    await client.SaveStateAsync("mystatestore", "mykey", widget);
}
catch (DaprException ex)
{
    // handle the exception, log, retry, etc.
}
```

最常见的故障案例将与以下情况有关：

- Dapr 组件配置不正确
- 暂时性故障，如网络问题
- 无效数据，如未能反序列化 JSON

在上述任何一种情况下，你都可以通过 `.InnerException` 属性检查更多的异常细节。
