---
type: docs
title: "发布和订阅概述"
linkTitle: "Overview"
weight: 1000
description: "Dapr Pub/Sub 构建块概述"
---

## 简介

[发布 / 订阅模式](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) 允许微服务使用消息相互通信。 **生产者** 将消息发送至 **主题** ，并且不知道接收消息的应用程序。 同样，一个 **消费者** 将订阅该主题并收到它的消息，并且不知道什么应用程序生产了这些消息。 当您需要将微服务解偶时，此模式特别有用。

Dapr 中的发布/订阅 API 提供至少一次（at-least-once）的保证，并与各种消息代理和队列系统集成。 应用程序的特定实现是可插入的，并在运行时在外部进行配置。 此方法可从应用程序中删除依赖项，因此使应用程序更具可移植性。 可用发布/订阅实现的完整列表 [在这]({{< ref supported-pubsub >}})。

## 功能

### 发布/订阅 API

发布 / 订阅 API 位于 [API 引用]({{< ref pubsub_api.md >}})。

### 消息格式

要启用消息路由并为每个消息提供附加上下文，Dapr 使用 [ CloudEvents 1.0 规范](https://github.com/cloudevents/spec/tree/v1.0) 作为其消息格式。 使用 Dapr 应用程序发送的任何信息都将自动包入 Cloud Events 信封中，`datacontenttype` 属性使用 `Content-Type` 头部值。

Dapr 实现以下 Cloud Events 字段:

* `id`
* `source`
* `specversion`
* `type`
* `datacontenttype` (Optional)

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

> 从 v0.9 版本开始，如果已发布的有效负载已采用 CloudEvent 格式，则 Dapr 不再将已发布的内容包装到 CloudEvent 中。

### 订阅消息

Dapr 允许两种方法订阅主题: **声明式**，在外部文件中定义订阅，以及 **编程方式**，订阅在用户代码中定义。 要了解更多信息，请参阅 Dapr [订阅主题](https://docs.dapr.io/developing-applications/building-blocks/pubsub/howto-publish-subscribe/#step-2-subscribe-to-topics)文档。

### 消息传递

原则上，当订阅者在处理消息后应答非错误响应时，Dapr 认为成功发送了的消息。 为了进行更精细的控制，Dapr 的发布/订阅 API 还提供显式状态（在响应负载中定义），订阅者可以使用这些状态向 Dapr 指示特定的处理指令（例如， `重试` 或 `删除`）。 For more information message routing see [Dapr publish/subscribe API documentation]({{< ref "pubsub_api.md#provide-routes-for-dapr-to-deliver-topic-events" >}})

### At-Least-Once 保证

Dapr 保证消息传递 at-least-once 语义。 这意味着，当应用程序使用发布/订阅 API 将消息发布到主题时，Dapr 可确保此消息至少传递给每个订阅者一次。

### 多个消费组和多实例

多个消费组、多个应用程序实例使用一个消费组，这些都将由 Dapr 自动处理。 当同一个应用程序的多个实例(相同的 ID) 订阅主题时，Dapr 只将每个消息传递给该应用程序的一个实例。 同样，如果两个不同的应用程序 (不同的 ID) 订阅同一主题，那么 Dapr 将每个消息仅传递到每个应用程序的一个实例。

### 主题范围

默认情况下，支持Dapr发布/订阅组件的所有主题 (例如，Kafka、Redis、RabbitMQ) 都可用于配置该组件的每个应用程序。 为了限制哪个应用程序可以发布或订阅主题，Dapr 提供了主题范围。 查看 [发布/订阅主题范围]({{< ref pubsub-scopes.md >}}) 了解更多信息。

## 下一步

- 阅读 [发布和订阅]({{< ref howto-publish-subscribe.md >}})指南
- 了解 [发布/订阅范围]({{< ref pubsub-scopes.md >}})
- 阅读 [API 引用]({{< ref pubsub_api.md >}})
