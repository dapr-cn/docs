---
type: docs
title: "实现一个.NET输入/输出绑定组件"
linkTitle: "绑定"
weight: 1000
description: 如何使用 Dapr 可插拔组件 .NET SDK 创建输入/输出绑定
no_list: true
is_preview: true
---

创建一个绑定组件只需要几个基本步骤。

## 添加绑定命名空间

添加 `using` 语句来引用与绑定相关的命名空间。

```csharp
using Dapr.PluggableComponents.Components;
using Dapr.PluggableComponents.Components.Bindings;
```

## 输入绑定: 实现`IInputBinding`

创建一个实现`IInputBinding`接口的类。

```csharp
internal sealed class MyBinding : IInputBinding
{
    public Task InitAsync(MetadataRequest request, CancellationToken cancellationToken = default)
    {
        // Called to initialize the component with its configured metadata...
    }

    public async Task ReadAsync(MessageDeliveryHandler<InputBindingReadRequest, InputBindingReadResponse> deliveryHandler, CancellationToken cancellationToken = default)
    {
        // Until canceled, check the underlying store for messages and deliver them to the Dapr runtime...
    }
}
```

对 `ReadAsync()` 方法的调用是“长时间运行”的，即该方法不会在取消之前返回（例如，通过 `cancellationToken`）。 当消息从组件的底层存储中被读取时，它们通过`deliveryHandler`回调函数传递给 Dapr 运行时。 Delivery 允许组件在应用程序（由 Dapr 运行时提供服务）确认处理消息后，接收通知。

```csharp
    public async Task ReadAsync(MessageDeliveryHandler<InputBindingReadRequest, InputBindingReadResponse> deliveryHandler, CancellationToken cancellationToken = default)
    {
        TimeSpan pollInterval = // Polling interval (e.g. from initalization metadata)...

        // Poll the underlying store until canceled...
        while (!cancellationToken.IsCancellationRequested)
        {
            var messages = // Poll underlying store for messages...

            foreach (var message in messages)
            {
                // Deliver the message to the Dapr runtime...
                await deliveryHandler(
                    new InputBindingReadResponse
                    {
                        // Set the message content...
                    },
                    // Callback invoked when application acknowledges the message...
                    async request =>
                    {
                        // Process response data or error message...
                    })
            }

            // Wait for the next poll (or cancellation)...
            await Task.Delay(pollInterval, cancellationToken);
        }
    }
```

## 输出绑定: 实现`IOutputBinding`

创建一个实现`IOutputBinding`接口的类。

```csharp
internal sealed class MyBinding : IOutputBinding
{
    public Task InitAsync(MetadataRequest request, CancellationToken cancellationToken = default)
    {
        // Called to initialize the component with its configured metadata...
    }

    public Task<OutputBindingInvokeResponse> InvokeAsync(OutputBindingInvokeRequest request, CancellationToken cancellationToken = default)
    {
        // Called to invoke a specific operation...
    }

    public Task<string[]> ListOperationsAsync(CancellationToken cancellationToken = default)
    {
        // Called to list the operations that can be invoked.
    }
}
```

## 输入和输出绑定组件

一个组件可以通过实现两个接口，_同时_成为输入和输出绑定。

```csharp
internal sealed class MyBinding : IInputBinding, IOutputBinding
{
    // IInputBinding Implementation...

    // IOutputBinding Implementation...
}
```

## 注册绑定组件

在主程序文件中（例如，`Program.cs`），将绑定组件注册到应用程序服务中。

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

{{% alert title="Note" color="primary" %}}
实现`IInputBinding`和`IOutputBinding`接口的组件将同时注册为输入和输出绑定。
{{% /alert %}}
