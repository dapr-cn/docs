---
type: docs
title: "发布和订阅概述"
linkTitle: "概述"
weight: 1000
description: "Overview of the Pub/Sub API building block"
---

## 介绍

[发布 / 订阅模式](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) 允许微服务使用消息相互通信。 **生产者或发布者** 将消息发送至 **主题（Topic）** ，并且不知道接收消息的应用程序。 这涉及将它们写入一个输入频道。 同样，一个 **消费者** 将订阅该主题并收到它的消息，并且不知道什么应用程序生产了这些消息。 这涉及从输出频道接收消息。 中间消息代理（intermediary message broker）负责将每条消息从输入频道复制到所有对此消息感兴趣的订阅者的输出频道。 当您需要将微服务解偶时，此模式特别有用。

Dapr 中的发布/订阅 API 提供至少一次（at-least-once）的保证，并与各种消息代理和队列系统集成。 您的服务所使用的特定实现是可插入的，并被配置为运行时的 Dapr Pub/Sub 组件。 这种方法消除了您服务的依赖性，从而使您的服务可以更便携，更灵活地适应更改。

Dapr 发布/订阅组件的完整列表 [点击这里]({{< ref supported-pubsub >}})。

<img src="/images/pubsub-overview-pattern.png" width=1000>

<br></br>

Dapr Pub/Sub 构建块提供一个平台不可知（platform-agnositc）的 API 来发送和接收消息。 您的服务发布消息到一个命名主题（named topic），并且也订阅一个 topic 来消费消息。

服务让网络调用 Dapr 的 Pub/Sub 构建块，暴露为一个 sidecar。 然后，这个构建块调用封装了一个特定的 message broker 产品的 Dapr Pub/Sub 组件。 要接收 Topics，Dapr 代表您的服务订阅 Dapr Pub/Sub 组件，并在消息到达时将其发送到端点。

下面的图表显示了一个“货运”服务的示例和一个“电子邮件”服务，这两个服务都订阅了由“购物车”服务发布的 topic。 每个服务加载 Pub/Sub 组件配置文件指向相同的 Pub/Sub 消息总线组件。 例如 Redis Streams, NATS Streaming, Azure Service Bus, 或 GCP Pub/Sub。

<img src="/images/pubsub-overview-components.png" width=1000>
<br></br>

下面的图表有相同的服务。 然而，这次展示的 Dapr 的发布API 发送“订单” topic 和订阅服务的订单端点。这些 topic messages 是由 Dapr 发布的。

<img src="/images/pubsub-overview-publish-API.png" width=1000>
<br></br>

## 特性
Pub/Sub 建筑块为您的应用程序提供了下面几个功能。

### 发布/订阅 API

要启用消息路由并为每个消息提供附加上下文，Dapr 使用 [ CloudEvents 1.0 规范](https://github.com/cloudevents/spec/tree/v1.0) 作为其消息格式。 使用 Dapr 应用程序发送的任何信息都将自动包入 Cloud Events 信封中，`datacontenttype` 属性使用 `Content-Type` 头部值。

Dapr 实现以下 Cloud Events 字段:

* `id`
* `source`
* `specversion`
* `type`
* `datacontenttype` (可选)

下面的示例显示了 CloudEvent v1.0 中序列化为 JSON 的 XML 内容：

```json
{
    "specversion" : "1.0",
    "type" : "xml.message",
    "source" : "https://example.com/message",
    "subject" : "Test XML Message",
    "id" : "id-1234-5678-9101",
    "time" : "2020-09-23T06:23:21Z",
    "datacontenttype" : "text/xml",
    "data" : "<note><to>User1</to><from>user2</from><message>hi</message></note>"
}
```

### 消息格式

Dapr 应用程序可以订阅已发布的 topics。 Dapr 允许您的应用程序有两种方法来订阅 topics：

 - 阅读 [发布和订阅]({{< ref howto-publish-subscribe.md >}})指南
 - **编程**，其中订阅在用户代码中定义。

 声明和编程方式都支持相同的功能。 声明式方法会从您的代码中移除 Dapr 依赖，并允许现有的应用程序订阅 topics，而无需更改代码。 编程方法在用户代码中实现订阅。

  更多信息查看 [如何发布消息并订阅主题]({{< ref howto-publish-subscribe >}})。


### 订阅消息

原则上，当订阅者在处理消息后应答非错误响应时，Dapr 认为成功发送了的消息。 为了进行更精细的控制，Dapr 的发布/订阅 API 还提供显式状态（在响应负载中定义），订阅者可以使用这些状态向 Dapr 指示特定的处理指令（例如： `RETRY` 或 `DROP`）。 更多消息路由的信息查看 [Dapr 发布/订阅 API 文档]({{< ref "pubsub_api.md#provide-routes-for-dapr-to-deliver-topic-events" >}})

### 消息传递

Dapr 保证消息传递 at-least-once 语义。 这意味着，当应用程序使用发布/订阅 API 将消息发布到主题时，Dapr 可确保此消息至少传递给每个订阅者一次（at least once）。

### 消费者群体和竞争性消费者模式

多个消费组、多个应用程序实例使用一个消费组，这些都将由 Dapr 自动处理。 当同一个应用程序的多个实例(相同的 ID) 订阅主题时，Dapr 只将每个消息传递给该应用程序的一个实例。 这通常称为相互竞争的消费者模式，详见下表。

<img src="/images/pubsub-overview-pattern-competing-consumers.png" width=1000>
<br></br>

同样，如果两个不同的应用程序 (不同的 ID) 订阅同一主题，那么 Dapr 将每个消息仅传递到每个应用程序的一个实例。

### Topic 作用域（Topic scoping）

默认情况下，支持Dapr发布/订阅组件的所有主题 (例如，Kafka、Redis、RabbitMQ) 都可用于配置该组件的每个应用程序。 为了限制哪个应用程序可以发布或订阅 topic，Dapr 提供了 topic 作用域限定。 This enables to you say which topics an application is allowed to publish and which topics an application is allowed to subscribe to. 查看 [发布/订阅主题范围]({{< ref pubsub-scopes.md >}}) 了解更多信息。

### 消息生存时间
Dapr 可以在每个消息的基础上设置超时。 表示如果消息未从 Pub/Sub 组件读取，则消息将被丢弃。 这是为了防止未读消息的积累。 在队列中超过配置的 TTL 的消息就可以说它挂了。  查看 [发布/订阅 topic 限界]({{< ref pubsub-message-ttl.md >}}) 了解更多信息。

- 注意：在组件创建时，消息 TTL 也可以设置为给定的队列。 根据你正在使用的组件的具体特性。

### 与不使用 Dapr 和 CloudEvents 的应用程序通信
对于一个应用程序使用 Dapr 但另一个应用程序不使用的情况，可以为发布者或订阅者禁用 CloudEvent 包装。 这允许在无法同时采用 Dapr 的应用程序中部分采用 Dapr pubsub 。 将更多信息可以参阅 [如何使用 pubsub 而不使用 CloudEvent]({{< ref pubsub-raw.md >}})。

### 发布/订阅 API

发布 / 订阅 API 位于 [API 引用]({{< ref pubsub_api.md >}})。

## 下一步

* 遵循这些指南：
    * [指南：发布消息并订阅主题]({{< ref howto-publish-subscribe.md >}})
    * [操作：配置具有多个命名空间的 Pub/Sub 组件]({{< ref pubsub-namespaces.md >}})
* 试试 [Pub/Sub 快速启动示例](https://github.com/dapr/quickstarts/tree/master/pub-sub)
* 了解 [Topic 作用域]({{< ref pubsub-scopes.md >}})
* 了解 [消息存活时间（TTL）]({{< ref pubsub-message-ttl.md >}})
* 学习 [不通过CloudEvent 进行 pubsub]({{< ref pubsub-raw.md >}})
* [pub/sub组件列表]({{< ref supported-pubsub.md >}})
* 阅读 [API 引用]({{< ref pubsub_api.md >}})
