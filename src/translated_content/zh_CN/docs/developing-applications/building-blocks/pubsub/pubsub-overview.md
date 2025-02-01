---
type: docs
title: "发布-订阅模式概述"
linkTitle: "概述"
weight: 1000
description: "pubsub API 的基本构建块概述"
---

发布-订阅模式（pubsub）使微服务能够通过消息进行事件驱动的架构通信。

- 生产者或**发布者**将消息写入输入通道并发送到主题，而不关心哪个应用程序会接收它们。
- 消费者或**订阅者**订阅主题并从输出通道接收消息，而不关心哪个服务生成了这些消息。

消息代理会将每条消息从发布者的输入通道复制到所有对该消息感兴趣的订阅者的输出通道。这种模式在需要将微服务解耦时特别有用。

<img src="/images/pubsub-overview-pattern.png" width=1000 style="padding-bottom:25px;">

<br></br>

## pubsub API

在 Dapr 中，pubsub API：
- 提供一个平台无关的 API 来发送和接收消息。
- 确保消息至少被传递一次。
- 与多种消息代理和队列系统集成。

您可以在运行时配置 Dapr pubsub 组件来使用特定的消息代理，这种可插拔性使您的服务更具可移植性和灵活性。

在 Dapr 中使用 pubsub 时：

1. 您的服务通过网络调用 Dapr pubsub 构建块 API。
2. pubsub 构建块调用封装特定消息代理的 Dapr pubsub 组件。
3. 为了接收主题上的消息，Dapr 代表您的服务订阅 pubsub 组件，并在消息到达时将其传递到您的服务的端点。

[以下概述视频和演示](https://www.youtube.com/live/0y7ne6teHT4?si=FMg2Y7bRuljKism-&t=5384)展示了 Dapr pubsub 的工作原理。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/0y7ne6teHT4?si=FMg2Y7bRuljKism-&amp;start=5384" title="YouTube video player" style="padding-bottom:25px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

在下图中，“shipping”服务和“email”服务都已订阅由“cart”服务发布的主题。每个服务加载指向相同 pubsub 消息代理组件的 pubsub 组件配置文件；例如：Redis Streams、NATS Streaming、Azure Service Bus 或 GCP pubsub。

<img src="/images/pubsub-overview-components.png" width=1000 style="padding-bottom:25px;">

在下图中，Dapr API 将“cart”服务的“order”主题发布到“shipping”和“email”订阅服务的“order”端点。

<img src="/images/pubsub-overview-publish-API.png" width=1000 style="padding-bottom:25px;">

[查看 Dapr 支持的 pubsub 组件的完整列表]({{< ref supported-pubsub >}})。

## 特性

pubsub API 构建块为您的应用程序带来了多个特性。

### 使用 Cloud Events 发送消息

为了启用消息路由并为服务之间的每条消息提供额外的上下文，Dapr 使用 [CloudEvents 1.0 规范](https://github.com/cloudevents/spec/tree/v1.0) 作为其消息格式。任何应用程序通过 Dapr 发送到主题的消息都会自动包装在 Cloud Events 信封中，使用 [`Content-Type` 头值]({{< ref "pubsub-overview.md#content-types" >}}) 作为 `datacontenttype` 属性。

有关更多信息，请阅读 [使用 CloudEvents 进行消息传递]({{< ref pubsub-cloudevents.md >}})，或 [发送不带 CloudEvents 的原始消息]({{< ref pubsub-raw.md >}})。

### 与不使用 Dapr 和 CloudEvents 的应用程序通信

如果您的一个应用程序使用 Dapr 而另一个不使用，您可以为发布者或订阅者禁用 CloudEvent 包装。这允许在无法一次性采用 Dapr 的应用程序中部分采用 Dapr pubsub。

有关更多信息，请阅读 [如何在没有 CloudEvents 的情况下使用 pubsub]({{< ref pubsub-raw.md >}})。

### 设置消息内容类型

发布消息时，指定发送数据的内容类型很重要。除非指定，否则 Dapr 将假定为 `text/plain`。

- HTTP 客户端：可以在 `Content-Type` 头中设置内容类型
- gRPC 客户端和 SDK：有一个专用的内容类型参数

### 消息传递

原则上，Dapr 认为消息一旦被订阅者处理并以非错误响应进行响应，就已成功传递。为了更细粒度的控制，Dapr 的 pubsub API 还提供了明确的状态，定义在响应负载中，订阅者可以用这些状态向 Dapr 指示特定的处理指令（例如，`RETRY` 或 `DROP`）。

### 使用主题订阅接收消息

Dapr 应用程序可以通过支持相同功能的三种订阅类型订阅已发布的主题：声明式、流式和编程式。

| 订阅类型 | 描述 |
| ------------------- | ----------- |
| **声明式** | 订阅在**外部文件**中定义。声明式方法消除了代码中的 Dapr 依赖性，并允许现有应用程序订阅主题，而无需更改代码。 |
| **流式** | 订阅在**用户代码**中定义。流式订阅是动态的，意味着它们允许在运行时添加或删除订阅。它们不需要应用程序中的订阅端点（这是编程式和声明式订阅所需的），使其易于在代码中配置。流式订阅也不需要应用程序配置 sidecar 来接收消息。由于消息被发送到消息处理程序代码，因此流式订阅中没有路由或批量订阅的概念。 |
| **编程式** | 订阅在**用户代码**中定义。编程式方法实现了静态订阅，并需要在代码中有一个端点。|

有关更多信息，请阅读 [关于订阅类型的订阅]({{< ref subscription-methods.md >}})。

### 重新加载主题订阅

要重新加载以编程方式或声明式定义的主题订阅，需要重新启动 Dapr sidecar。
通过启用 [`HotReload` 功能门]({{< ref "support-preview-features.md" >}})，可以使 Dapr sidecar 动态重新加载更改的声明式主题订阅，而无需重新启动。
主题订阅的热重载目前是一个预览功能。
重新加载订阅时，正在传输的消息不受影响。

### 消息路由

Dapr 提供 [基于内容的路由](https://www.enterpriseintegrationpatterns.com/ContentBasedRouter.html) 模式。[Pubsub 路由]({{< ref howto-route-messages.md >}}) 是此模式的实现，允许开发人员使用表达式根据其内容将 [CloudEvents](https://cloudevents.io) 路由到应用程序中的不同 URI/路径和事件处理程序。如果没有路由匹配，则使用可选的默认路由。随着您的应用程序扩展以支持多个事件版本或特殊情况，这很有用。

此功能适用于声明式和编程式订阅方法。

有关消息路由的更多信息，请阅读 [Dapr pubsub API 参考]({{< ref "pubsub_api.md#provide-routes-for-dapr-to-deliver-topic-events" >}})

### 使用死信主题处理失败的消息

有时，由于各种可能的问题，例如生产者或消费者应用程序中的错误条件或导致应用程序代码出现问题的意外状态更改，消息无法被处理。Dapr 允许开发人员设置死信主题来处理无法传递到应用程序的消息。此功能适用于所有 pubsub 组件，并防止消费者应用程序无休止地重试失败的消息。有关更多信息，请阅读 [死信主题]({{< ref "pubsub-deadletter.md">}})

### 启用外发模式

Dapr 使开发人员能够使用外发模式在事务性状态存储和任何消息代理之间实现单一事务。有关更多信息，请阅读 [如何启用事务性外发消息]({{< ref howto-outbox.md >}})

### 命名空间消费者组

Dapr 通过 [命名空间消费者组]({{< ref howto-namespace >}}) 解决大规模多租户问题。只需在组件元数据中包含 `"{namespace}"` 值，即可允许具有相同 `app-id` 的多个命名空间的应用程序发布和订阅相同的消息代理。

### 至少一次保证

Dapr 保证消息传递的至少一次语义。当应用程序使用 pubsub API 向主题发布消息时，Dapr 确保消息至少一次传递给每个订阅者。

即使消息传递失败，或者您的应用程序崩溃，Dapr 也会尝试重新传递消息，直到成功传递。

所有 Dapr pubsub 组件都支持至少一次保证。

### 消费者组和竞争消费者模式

Dapr 处理消费者组和竞争消费者模式的负担。在竞争消费者模式中，使用单个消费者组的多个应用程序实例竞争消息。当副本使用相同的 `app-id` 而没有显式消费者组覆盖时，Dapr 强制执行竞争消费者模式。

当同一应用程序的多个实例（具有相同的 `app-id`）订阅一个主题时，Dapr 将每条消息仅传递给*该应用程序的一个实例*。此概念在下图中进行了说明。

<img src="/images/pubsub-overview-pattern-competing-consumers.png" width=1000>
<br></br>

同样，如果两个不同的应用程序（具有不同的 `app-id`）订阅同一主题，Dapr 将每条消息仅传递给*每个应用程序的一个实例*。

并非所有 Dapr pubsub 组件都支持竞争消费者模式。目前，以下（非详尽）pubsub 组件支持此功能：

- [Apache Kafka]({{< ref setup-apache-kafka >}})
- [Azure Service Bus Queues]({{< ref setup-azure-servicebus-queues >}})
- [RabbitMQ]({{< ref setup-rabbitmq >}})
- [Redis Streams]({{< ref setup-redis-pubsub >}})

### 为增强安全性设置主题范围

默认情况下，与 pubsub 组件实例关联的所有主题消息对配置了该组件的每个应用程序都是可用的。您可以使用 Dapr 主题范围限制哪个应用程序可以发布或订阅主题。有关更多信息，请阅读：[pubsub 主题范围]({{< ref pubsub-scopes.md >}})。

### 消息生存时间（TTL）

Dapr 可以在每条消息的基础上设置超时消息，这意味着如果消息未从 pubsub 组件中读取，则消息将被丢弃。此超时消息可防止未读消息的积累。如果消息在队列中的时间超过配置的 TTL，则标记为死信。有关更多信息，请阅读 [pubsub 消息 TTL]({{< ref pubsub-message-ttl.md >}})。

### 发布和订阅批量消息

Dapr 支持在单个请求中发送和接收多条消息。当编写需要发送或接收大量消息的应用程序时，使用批量操作可以通过减少请求总数来实现高吞吐量。有关更多信息，请阅读 [pubsub 批量消息]({{< ref pubsub-bulk.md >}})。

### 使用 StatefulSets 扩展订阅者

在 Kubernetes 上运行时，使用 StatefulSets 结合 `{podName}` 标记，订阅者可以为每个实例拥有一个粘性 `consumerID`。请参阅 [如何使用 StatefulSets 水平扩展订阅者]({{< ref "howto-subscribe-statefulset.md" >}})。

## 试用 pubsub

### 快速入门和教程

想要测试 Dapr pubsub API 吗？通过以下快速入门和教程来查看 pubsub 的实际应用：

| 快速入门/教程 | 描述 |
| ------------------- | ----------- |
| [Pubsub 快速入门]({{< ref pubsub-quickstart.md >}}) | 使用发布和订阅 API 发送和接收消息。 |
| [Pubsub 教程](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub) | 演示如何使用 Dapr 启用 pubsub 应用程序。使用 Redis 作为 pubsub 组件。|

### 直接在您的应用中开始使用 pubsub

想要跳过快速入门？没问题。您可以直接在应用程序中试用 pubsub 构建块来发布消息并订阅主题。在 [安装 Dapr]({{< ref "getting-started/_index.md" >}}) 后，您可以从 [pubsub 如何指南]({{< ref howto-publish-subscribe.md >}}) 开始使用 pubsub API。

## 下一步

- 了解 [使用 CloudEvents 进行消息传递]({{< ref pubsub-cloudevents.md >}}) 以及何时可能需要 [发送不带 CloudEvents 的消息]({{< ref pubsub-raw.md >}})。
- 遵循 [如何：配置具有多个命名空间的 pubsub 组件]({{< ref pubsub-namespaces.md >}})。
- 查看 [pubsub 组件]({{< ref setup-pubsub >}}) 列表。
- 阅读 [API 参考]({{< ref pubsub_api.md >}})。
