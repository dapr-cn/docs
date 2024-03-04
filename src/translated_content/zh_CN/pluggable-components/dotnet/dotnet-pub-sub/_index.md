---
type: docs
title: "实现一个.NET pub/sub（发布/订阅）组件"
linkTitle: "Pub/sub"
weight: 1000
description: 如何使用 Dapr 可插拔组件 .NET SDK 创建一个发布/订阅
no_list: true
is_preview: true
---

创建一个Pub/sub组件只需要几个基本步骤。

## 添加 pub/sub 命名空间

添加 `using` 语句来引用与Pub/sub（发布/订阅）相关的命名空间。

```csharp
using Dapr.PluggableComponents.Components;
using Dapr.PluggableComponents.Components.PubSub;
```

## 实现 `IPubSub的`

创建一个类，实现 `IPubSub的` 接口。

```csharp
internal sealed class MyPubSub : IPubSub
{
    public Task InitAsync(MetadataRequest request, CancellationToken cancellationToken = default)
    {
        // Called to initialize the component with its configured metadata...
    }

    public Task PublishAsync(PubSubPublishRequest request, CancellationToken cancellationToken = default)
    {
        // Send the message to the "topic"...
    }

    public Task PullMessagesAsync(PubSubPullMessagesTopic topic, MessageDeliveryHandler<string?, PubSubPullMessagesResponse> deliveryHandler, CancellationToken cancellationToken = default)
    {
        // Until canceled, check the topic for messages and deliver them to the Dapr runtime...
    }
}
```

对 `PullMessagesAsync()` 方法的调用是“长时间运行”的，即该方法不会在取消之前返回（例如，通过 `cancellationToken`）。 "topic"从中拉取消息的方式是通过`topic`参数传递，而将消息传递给Dapr运行时是通过`deliveryHandler`回调函数执行的。 Delivery 允许组件在应用程序（由 Dapr 运行时提供服务）确认处理消息后，接收通知。

```csharp
    public async Task PullMessagesAsync(PubSubPullMessagesTopic topic, MessageDeliveryHandler<string?, PubSubPullMessagesResponse> deliveryHandler, CancellationToken cancellationToken = default)
    {
        TimeSpan pollInterval = // Polling interval (e.g. from initalization metadata)...

        // Poll the topic until canceled...
        while (!cancellationToken.IsCancellationRequested)
        {
            var messages = // Poll topic for messages...

            foreach (var message in messages)
            {
                // Deliver the message to the Dapr runtime...
                await deliveryHandler(
                    new PubSubPullMessagesResponse(topicName)
                    {
                        // Set the message content...
                    },
                    // Callback invoked when application acknowledges the message...
                    async errorMessage =>
                    {
                        // An empty message indicates the application successfully processed the message...
                        if (String.IsNullOrEmpty(errorMessage))
                        {
                            // Delete the message from the topic...
                        }
                    })
            }

            // Wait for the next poll (or cancellation)...
            await Task.Delay(pollInterval, cancellationToken);
        }
    }
```

## 注册pub/sub组件

在主程序文件中（例如，`Program.cs`），将pub/sub组件注册到应用程序服务中。

```csharp
using Dapr.PluggableComponents;

var app = DaprPluggableComponentsApplication.Create();

app.RegisterService(
    "<socket name>",
    serviceBuilder =>
    {
        serviceBuilder.RegisterPubSub<MyPubSub>();
    });

app.Run();
```
