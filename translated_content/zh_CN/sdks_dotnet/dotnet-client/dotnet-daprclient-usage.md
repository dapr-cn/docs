---
type: docs
title: "DaprClient 使用"
linkTitle: "DaprClient 使用"
weight: 100000
description: 使用 DaprClient 的基本提示和建议
---

## 生命周期管理

`DaprClient` 能够以TCP 套接口的形式访问网络资源，与 Dapr sidecar 通信。 `DaprClient` 实现 `IDisposable` 以支持主动的资源清理。

为了获得最佳性能，请创建一个`DaprClient`的单一长期实例，并在整个应用程序中提供对该共享实例的访问权限。 `DaprClient` 实例是线程安全的并且允许共享的。

避免每个操作创建一个 `DaprClient` 并在操作完成后释放它。

## 配置 DaprClient

在调用`.Build()`创建客户端之前，可以通过调用`DaprClientBuilder`类的方法来配置`DaprClient`。 每个`DaprClient`对象的设置都是独立的，并且在调用`.Build()`后无法更改。

```C#
var daprClient = new DaprClientBuilder()
    .UseJsonSerializerSettings( ... ) // Configure JSON serializer
    .Build();
```

`DaprClientBuilder`包含以下设置：

- Dapr sidecar 的 HTTP 终结点。
- Dapr sidecar 的 gRPC 终结点。
- 用于配置 JSON 序列化的 `JsonSerializerOptions` 对象
- 用于配置 gRPC 的 `GrpcChannelOptions` 对象
- 用于验证请求到 sidecar 的 API 令牌

SDK 将读取以下环境变量来配置默认值：

- `DAPR_HTTP_PORT`: 用于查找 Dapr sidecar 的 HTTP 终结点
- `DAPR_GRPC_PORT`: 用于查找 Dapr sidecar 的 gRPC 终结点
- `DAPR_API_TOKEN`: 用于设置 API 令牌

### 配置 gRPC 通道选项

Dapr 使用`CancellationToken`来取消，依赖于 gRPC 通道选项的配置。 如果您需要自己配置这些选项，请确保启用[ ThrowOperationCanceledOnCancellation 设置](https://grpc.github.io/grpc/csharp-dotnet/api/Grpc.Net.Client.GrpcChannelOptions.html#Grpc_Net_Client_GrpcChannelOptions_ThrowOperationCanceledOnCancellation)。

```C#
var daprClient = new DaprClientBuilder()
    .UseGrpcChannelOptions(new GrpcChannelOptions { ... ThrowOperationCanceledOnCancellation = true })
    .Build();  
```

## 使用 DaprClient 取消

DaprClient 上执行异步操作的API接受一个可选的`CancellationToken`参数。 这遵循了可取消操作的标准.NET习惯用法。 请注意，当取消发生时，并不能保证远程端点停止处理请求，只能保证客户端已经停止等待完成。

当一个操作被取消时，它将抛出一个`OperationCancelledException`。

## 了解 DaprClient JSON 序列化

`DaprClient`上的许多方法使用`System.Text.Json`序列化器执行JSON序列化。 接受应用程序数据类型作为参数的方法将对其进行JSON序列化，除非文档另有明确说明。

如果你有高级需求，值得阅读[ System.Text.Json 文档](https://docs.microsoft.com/en-us/dotnet/standard/serialization/system-text-json-overview)。 Dapr .NET SDK 没有提供独特的序列化行为或自定义 - 它依赖于底层的序列化器将数据转换为应用程序的 .NET 类型。

`DaprClient` is configured to use a serializer options object configured from [JsonSerializerDefaults.Web](https://docs.microsoft.com/en-us/dotnet/api/system.text.json.jsonserializerdefaults?view=net-5.0). This means that `DaprClient` will use `camelCase` for property names, allow reading quoted numbers (`"10.99"`), and will bind properties case-insensitively. These are the same settings used with ASP.NET Core and the `System.Text.Json.Http` APIs, and are designed to follow interoperable web conventions.

`System.Text.Json` as of .NET 5.0 does not have good support for all of F# language features built-in. If you are using F# you may want to use one of the converter packages that add support for F#'s features such as [FSharp.SystemTextJson](https://github.com/Tarmil/FSharp.SystemTextJson).

### Simple guidance for JSON serialization

Your experience using JSON serialization and `DaprClient` will be smooth if you use a feature set that maps to JSON's type system. These are general guidelines that will simplify your code where they can be applied.

- Avoid inheritance and polymorphism
- Do not attempt to serialize data with cyclic references
- Do not put complex or expensive logic in constructors or property accessors
- Use .NET types that map cleanly to JSON types (numeric types, strings, `DateTime`)
- Create your own classes for top-level messages, events, or state values so you can add properties in the future
- Design types with `get`/`set` properties OR use the [supported pattern](https://docs.microsoft.com/en-us/dotnet/standard/serialization/system-text-json-immutability?pivots=dotnet-5-0) for immutable types with JSON

### Polymorphism and serialization

The `System.Text.Json` serializer used by `DaprClient` uses the declared type of values when performing serialization.

This section will use `DaprClient.SaveStateAsync<TValue>(...)` in examples, but the advice is applicable to any Dapr building block exposed by the SDK.

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

In the example above, the type parameter `TValue` has its type argument inferred from the type of the `widget` variable. This is important because the `System.Text.Json` serializer will perform serialization based on the *declared type* of the value. The result is that the JSON value `{ "color": "Green" }` will be stored.

Consider what happens when you try to use derived type of `Widget`:

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

In this example we're using a `SuperWidget` but the variable's declared type is `Widget`. Since the JSON serializer's behavior is determined by the declared type, it only sees a simple `Widget` and will save the value `{ "color": "Green" }` instead of `{ "color": "Green", "hasSelfCleaningFeature": true }`.

If you want the properties of `SuperWidget` to be serialized, then the best option is to override the type argument with `object`. This will cause the serializer to include all data as it knows nothing about the type.

```C#
Widget widget = new SuperWidget() { Color = "Green", HasSelfCleaningFeature = true, };
await client.SaveStateAsync<object>("mystatestore", "mykey", widget);
```

## Error handling

Methods on `DaprClient` will throw `DaprException` or a subclass when a failure is encountered.

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

The most common cases of failure will be related to:

- Incorrect configuration of Dapr component
- Transient failures such as a networking problem
- Invalid data, such as a failure to deserialize JSON

In any of these cases you can examine more exception details through the `.InnerException` property.
