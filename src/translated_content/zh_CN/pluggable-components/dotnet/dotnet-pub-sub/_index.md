---
type: docs
title: "实现 .NET 发布/订阅组件"
linkTitle: "发布/订阅"
weight: 1000
description: 如何使用 Dapr 可插拔组件 .NET SDK 创建发布/订阅
no_list: true
is_preview: true
---

创建发布/订阅组件只需几个基本步骤。

## 添加发布/订阅命名空间

添加与发布/订阅相关的命名空间的 `using` 语句。

```csharp
using Dapr.PluggableComponents.Components;
using Dapr.PluggableComponents.Components.PubSub;
```

## 实现 `IPubSub`

创建一个实现 `IPubSub` 接口的类。

```csharp
internal sealed class MyPubSub : IPubSub
{
    public Task InitAsync(MetadataRequest request, CancellationToken cancellationToken = default)
    {
        // 使用配置的元数据初始化组件...
    }

    public Task PublishAsync(PubSubPublishRequest request, CancellationToken cancellationToken = default)
    {
        // 将消息发送到指定的“主题”...
    }

    public Task PullMessagesAsync(PubSubPullMessagesTopic topic, MessageDeliveryHandler<string?, PubSubPullMessagesResponse> deliveryHandler, CancellationToken cancellationToken = default)
    {
        // 持续检查主题中的消息并将其传递给 Dapr 运行时，直到取消为止...
    }
}
```

`PullMessagesAsync()` 方法是一个“长时间运行”的调用，因为在取消之前不期望返回（例如，通过 `cancellationToken`）。需要从中提取消息的“主题”通过 `topic` 参数传递，而传递到 Dapr 运行时是通过 `deliveryHandler` 回调执行的。传递机制允许组件在应用程序（由 Dapr 运行时服务）确认消息处理时接收通知。

```csharp
    public async Task PullMessagesAsync(PubSubPullMessagesTopic topic, MessageDeliveryHandler<string?, PubSubPullMessagesResponse> deliveryHandler, CancellationToken cancellationToken = default)
    {
        TimeSpan pollInterval = // 轮询间隔（可以从初始化元数据中获取）...

        // 持续轮询主题直到取消...
        while (!cancellationToken.IsCancellationRequested)
        {
            var messages = // 从主题中轮询获取消息...

            foreach (var message in messages)
            {
                // 将消息传递给 Dapr 运行时...
                await deliveryHandler(
                    new PubSubPullMessagesResponse(topicName)
                    {
                        // 设置消息内容...
                    },
                    // 当应用程序确认消息时调用的回调...
                    async errorMessage =>
                    {
                        // 空消息表示应用程序成功处理了消息...
                        if (String.IsNullOrEmpty(errorMessage))
                        {
                            // 从主题中删除消息...
                        }
                    });
            }

            // 等待下一个轮询（或取消）...
            await Task.Delay(pollInterval, cancellationToken);
        }
    }
```

## 注册发布/订阅组件

在主程序文件中（例如，`Program.cs`），使用应用程序服务注册发布/订阅组件。

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
