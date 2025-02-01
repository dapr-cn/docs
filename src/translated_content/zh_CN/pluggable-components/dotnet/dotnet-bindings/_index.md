---
type: docs
title: "实现 .NET 输入/输出绑定组件"
linkTitle: "绑定"
weight: 1000
description: 如何使用 Dapr 可插拔组件 .NET SDK 创建输入/输出绑定
no_list: true
is_preview: true
---

创建绑定组件只需几个基本步骤。

## 添加绑定相关的命名空间

为绑定相关的命名空间添加 `using` 语句。

```csharp
using Dapr.PluggableComponents.Components;
using Dapr.PluggableComponents.Components.Bindings;
```

## 输入绑定：实现 `IInputBinding`

创建一个实现 `IInputBinding` 接口的类。

```csharp
internal sealed class MyBinding : IInputBinding
{
    public Task InitAsync(MetadataRequest request, CancellationToken cancellationToken = default)
    {
        // 使用配置的元数据初始化组件...
    }

    public async Task ReadAsync(MessageDeliveryHandler<InputBindingReadRequest, InputBindingReadResponse> deliveryHandler, CancellationToken cancellationToken = default)
    {
        // 在取消之前，检查底层存储中的消息并将其传递给 Dapr 运行时...
    }
}
```

`ReadAsync()` 方法的调用是“长时间运行”的，因为在取消之前不期望返回（例如，通过 `cancellationToken`）。当从组件的底层存储中读取消息时，它们通过 `deliveryHandler` 回调传递给 Dapr 运行时。这样，组件可以在应用程序（由 Dapr 运行时服务）确认消息处理时接收通知。

```csharp
    public async Task ReadAsync(MessageDeliveryHandler<InputBindingReadRequest, InputBindingReadResponse> deliveryHandler, CancellationToken cancellationToken = default)
    {
        TimeSpan pollInterval = // 轮询间隔（例如，从初始化元数据中获取）...

        // 在取消之前轮询底层存储...
        while (!cancellationToken.IsCancellationRequested)
        {
            var messages = // 从底层存储中轮询消息...

            foreach (var message in messages)
            {
                // 将消息传递给 Dapr 运行时...
                await deliveryHandler(
                    new InputBindingReadResponse
                    {
                        // 设置消息内容...
                    },
                    // 当应用程序确认消息时调用的回调...
                    async request =>
                    {
                        // 处理响应数据或错误消息...
                    });
            }

            // 等待下次轮询（或取消）...
            await Task.Delay(pollInterval, cancellationToken);
        }
    }
```

## 输出绑定：实现 `IOutputBinding`

创建一个实现 `IOutputBinding` 接口的类。

```csharp
internal sealed class MyBinding : IOutputBinding
{
    public Task InitAsync(MetadataRequest request, CancellationToken cancellationToken = default)
    {
        // 使用配置的元数据初始化组件...
    }

    public Task<OutputBindingInvokeResponse> InvokeAsync(OutputBindingInvokeRequest request, CancellationToken cancellationToken = default)
    {
        // 执行特定操作...
    }

    public Task<string[]> ListOperationsAsync(CancellationToken cancellationToken = default)
    {
        // 列出可以调用的操作。
    }
}
```

## 输入和输出绑定组件

一个组件可以同时是输入和输出绑定，只需实现这两个接口即可。

```csharp
internal sealed class MyBinding : IInputBinding, IOutputBinding
{
    // IInputBinding 实现...

    // IOutputBinding 实现...
}
```

## 注册绑定组件

在主程序文件中（例如，`Program.cs`），在应用程序服务中注册绑定组件。

```csharp
using Dapr.PluggableComponents;

var app = DaprPluggableComponentsApplication.Create();

app.RegisterService(
    "<socket name>",
    serviceBuilder =>
    {
        serviceBuilder.RegisterBinding<MyBinding>();
    });

app.Run();
```

{{% alert title="注意" color="primary" %}}
一个实现了 `IInputBinding` 和 `IOutputBinding` 的组件将被注册为输入和输出绑定。
{{% /alert %}}