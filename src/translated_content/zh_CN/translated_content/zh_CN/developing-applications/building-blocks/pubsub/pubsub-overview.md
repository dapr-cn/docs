---
type: docs
title: "发布和订阅概述"
linkTitle: "概述"
weight: 1000
description: "发布/订阅 API 构建块概述"
---

发布和订阅（pub/sub）使微服务能够使用事件驱动架构的消息进行相互通信。

- 生产者或 **发布者**向输入通道写入消息并将其发送到一个主题，不知道哪个应用程序将接收它们。
- 消费者，或 **订阅者**，订阅主题并从输出通道接收消息，不知道是哪个服务产生了这些消息。

中间消息代理（intermediary message broker）负责将每条消息从发布者的输入频道复制到所有对此消息感兴趣的订阅者的输出频道。 当您需要将微服务解偶时，此模式特别有用。

<img src="/images/pubsub-overview-pattern.png" width=1000 style="padding-bottom:25px;">

<br></br>

## Pub/sub API

Dapr 中的 发布/订阅 API:
- 提供与平台无关的 API 来发送和接收消息。
- 提供至少一次的消息传递保证。
- 与各种消息代理和队列系统集成。

您的服务所使用的特定消息代理是可插入的，并被配置为运行时的 Dapr Pub/Sub 组件。 这种方法消除了您服务的依赖性，从而使您的服务可以更便携，更灵活地适应更改。

在 Dapr 中使用 发布/订阅 时：

1. 您的服务通过网络调用 Dapr 发布/订阅 构建块的 API。
1. 发布/订阅构建块调用封装了一个特定的 message broker 的 Dapr 发布/订阅组件。
1. 要接收主题上的消息，Dapr 代表您的服务使用一个主题订阅 pub/sub 组件，并在消息到达时将其发送到您的服务上的一个端点。

[以下概述视频和演示](https://www.youtube.com/live/0y7ne6teHT4?si=FMg2Y7bRuljKism-&t=5384) 演示了Dapr发布/订阅的工作原理。 

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/0y7ne6teHT4?si=FMg2Y7bRuljKism-&amp;start=5384" title="YouTube 视频播放器" style="padding-bottom:25px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

在下面的图表中，一个“货运”服务和一个“电子邮件”服务都订阅了由一个“购物车”服务发布的topic。 每个服务加载发布/订阅组件配置文件，指向相同的发布/订阅消息代理组件；例如：Redis Streams、NATS Streaming、Azure Service Bus 或 GCP 发布/订阅。

<img src="/images/pubsub-overview-components.png" width=1000 style="padding-bottom:25px;">

在下面的图表中，Dapr API从发布"cart"服务向"shipping"和"email"订阅服务的"order"端点发布"order"主题。

<img src="/images/pubsub-overview-publish-API.png" width=1000 style="padding-bottom:25px;">

[查看 Dapr 支持的完整 pub/sub 组件列表]({{< ref supported-pubsub >}})。

## 特性

Pub/Sub API 构建块为您的应用程序带来了几个功能。

### 使用 Cloud Events 发送消息

要启用消息路由并为每个服务之间的每个消息提供附加上下文，Dapr 使用 [CloudEvents 1.0 规范](https://github.com/cloudevents/spec/tree/v1.0) 作为其消息格式。 应用程序使用 Dapr 发送到主题的任何消息都会自动包装在 CloudEvents 信封中，使用 [`Content-Type` 标头值]({{< ref "pubsub-overview.md#content-types" >}}) 为 `datacontenttype` 属性。

有关更多信息，请阅读 [使用 CloudEvents 进行消息传递]({{< ref pubsub-cloudevents.md >}})或 [在没有 CloudEvents 的情况下发送原始消息]({{< ref pubsub-raw.md >}}).

### 与不使用 Dapr 和 CloudEvents 的应用程序通信

如果你的其中一个应用程序使用 Dapr，而另一个应用程序不使用，你可以为发布者或订阅者禁用 CloudEvent 包装。 这允许在无法一次性采用 Dapr 的应用程序中部分采用 Dapr pub/sub。

要了解更多信息，请阅读 [如何在不使用 CloudEvents 的情况下使用发布/订阅]({{< ref pubsub-raw.md >}})。

### 设置消息内容类型

发布消息时，指定所发送数据的内容类型非常重要。 除非指定, Dapr 将假定类型为 `text/plain`。

- 当使用 Dapr 的 HTTP API 时，内容类型可以设置在 `Content-Type` 头中。
- gRPC 客户端和 SDK：有一个专用的内容类型参数

### 消息传递

原则上，当订阅者处理消息并在处理后应答非错误响应时，Dapr 认为消息已成功发送。 为了进行更精细的控制，Dapr 的 pub/sub API 还提供了在响应有效负载中定义的显式状态，订阅者通过这些状态向 Dapr 指示特定的处理指令（例如， `重RETRY` 或 `DROP`).

### 使用主题订阅接收消息

Dapr 应用程序可以通过两种方法订阅发布的主题，这两种方法支持相同的功能：声明式和编程式。

| 订阅方法    | 说明                                                                   |
| ------- | -------------------------------------------------------------------- |
| **声明式** | 订阅定义在 **外部文件**中. 声明式方法会从您的代码中移除 Dapr 依赖，并允许现有的应用程序订阅 topics，而无需更改代码。 |
| **编程式** | 订阅定义在 **用户代码**中. 编程式方法在代码中实现订阅。                                      |

有关更多信息，请阅读 [关于订阅方法]({{< ref subscription-methods.md >}}).

### 消息路由

Dapr 提供 [基于内容的路由](https://www.enterpriseintegrationpatterns.com/ContentBasedRouter.html) 模式。 [发布/订阅路由]({{< ref howto-route-messages.md >}}) 是此模式的实现，允许开发人员使用表达式进行路由 [CloudEvent](https://cloudevents.io) 根据它们的内容到应用程序中的不同 URI/paths 和事件处理程序。 如果没有匹配的路由，那么将使用一个可选的默认路由。 当你的应用程序扩展到支持多个事件版本或特殊情况时，这就变得非常有用。

此功能适用于声明性和编程订阅方法。

有关消息路由的更多信息，请阅读 [Dapr 发布/订阅 API 参考]({{< ref "pubsub_api.md#provide-routes-for-dapr-to-deliver-topic-events" >}})

### 处理失败的消息与死信主题

有时候，由于各种可能的问题，消息无法被处理，例如生产者或消费者应用程序内的错误条件，或者导致应用程序代码出现问题的意外状态变化。 Dapr 允许开发人员设置死信主题，以处理无法传递到应用程序的消息。 此功能适用于所有发布/订阅组件，并防止消费者应用程序无休止地重试失败的消息。 更多信息，请阅读有关 [死信主题]({{< ref "pubsub-deadletter.md">}})的内容。

### 启用发件箱模式

Dapr使开发人员能够使用outbox模式，在事务性状态存储和任何消息代理之间实现单个事务。 要获取更多信息，请阅读 [如何启用事务性发件箱消息]({{< ref howto-outbox.md >}})

### 没有命名空间的消费者组

Dapr使用 [命名空间消费者组]({{< ref howto-namespace >}})来解决大规模的多租户问题。 只需将 `"{namespace}"` 值，以允许多个命名空间与相同的应用程序 `app-id` 发布和订阅同一消息代理。

### At-Least-Once 保证

Dapr 保证消息传递 at-least-once 语义。 当一个应用程序使用发布/订阅 API 将消息发布到主题时，Dapr 确保该消息至少传递给每个订阅者 *一次* 。

即使消息传递失败或应用程序崩溃，Dapr 会尝试重新传递消息，直到成功传递。

所有 Dapr 的发布/订阅组件都支持至少一次的保证。

### Consumer group 和竞争性消费者模式

Dapr 处理与消费者组和竞争消费者模式相关的内容。 在竞争消费者模式中，使用单个消费者组的多个应用程序实例竞争消息。 当副本使用相同的 `app-id` 而没有显式的消费者组覆盖时，Dapr会强制执行竞争消费者模式。

当同一个应用程序的多个实例(相同的 ID) 订阅主题时，Dapr 只将每个消息传递给该应用程序的一个实例。 此概念在下图中有所说明。

<img src="/images/pubsub-overview-pattern-competing-consumers.png" width=1000>
<br></br>

同样，如果两个不同的应用程序 (不同的 ID) 订阅同一主题，那么 Dapr 将每个消息仅传递到每个应用程序的一个实例。

并非所有的 Dapr 发布/订阅组件都支持竞争消费者模式。 目前，以下（非详尽）发布/订阅组件支持此功能：

- [Apache Kafka]({{< ref setup-apache-kafka >}})
- [Azure Service Bus Queues]({{< ref setup-azure-servicebus-queues >}})
- [RabbitMQ]({{< ref setup-rabbitmq >}})
- [Redis Streams]({{< ref setup-redis-pubsub >}})

### 限制主题作用域以增加安全性

默认情况下，与发布/订阅组件的实例关联的所有主题消息都可用于配置了该组件的每个应用程序。 您可以使用 Dapr 主题范围来限制哪个应用程序可以发布或订阅主题。 更多信息，请阅读： [pub/sub（发布/订阅）主题范围]({{< ref pubsub-scopes.md >}})。

### 消息生存时间 (TTL)

Dapr 可以在每个消息的基础上设置超时。 表示如果消息未从 Pub/Sub 组件读取，则消息将被丢弃。 设置超时时间可防止未读消息的堆积。 如果消息在队列中的时间超过配置的 TTL，则被标记为已死。 要了解更多信息，请阅读 [发布/订阅消息TTL]({{< ref pubsub-message-ttl.md >}})。

### 发布和订阅批量消息

Dapr 支持在单个请求中发送和接收多个消息。 当编写需要发送或接收大量消息的应用程序时，使用批量操作可以通过减少请求的总数来实现高吞吐量。 有关更多信息，请阅读 [发布/订阅批量消息]({{< ref pubsub-bulk.md >}})。

### 使用StatefulSets扩展订阅者

在 Kubernetes 上运行时，订阅者可以有一个粘性 `consumerID` 每个实例，当将 StatefulSets 与 `{podName}` 标记。 看 [如何使用 StatefulSets 水平扩展订阅者]({{< ref "howto-subscribe-statefulset.md" >}}).

## 试用 pub/sub

### 快速入门和教程

想测试一下 Dapr 发布/订阅 API 吗？ 通过以下快速入门和教程了解Pub/sub的实际操作：

| 快速入门/教程                                                                       | 说明                                                |
| ----------------------------------------------------------------------------- | ------------------------------------------------- |
| [Pub/Sub 快速开始]({{< ref pubsub-quickstart.md >}})                              | 使用发布和订阅 API 发送和接收消息。                              |
| [发布/订阅 教程](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub) | 演示如何使用 Dapr 来启用 pub-sub 应用程序。 使用 Redis 作为发布-订阅组件。 |

### 直接在应用中开始使用发布/订阅

想跳过快速入门？ 没问题。 您可以直接在应用程序中试用发布/订阅构建模块，发布消息并订阅一个主题。 [安装完成]({{< ref "getting-started/_index.md" >}})后，您可以从开始使用发布/订阅 API，具体操作方法请参考 [操作方法指南]({{< ref howto-publish-subscribe.md >}})。


## 下一步

- 了解 [使用 CloudEvents 进行消息传递]({{< ref pubsub-cloudevents.md >}}) 以及您可能想要 [在没有 CloudEvents 的情况下发送消息]({{< ref pubsub-raw.md >}}).
- 跟随 [操作方法：使用多个命名空间配置pub/sub组件]({{< ref pubsub-namespaces.md >}})。
- 查看列表 [发布/订阅组件]({{< ref setup-pubsub >}}).
- 阅读 [API 参考手册]({{< ref pubsub_api.md >}})。
