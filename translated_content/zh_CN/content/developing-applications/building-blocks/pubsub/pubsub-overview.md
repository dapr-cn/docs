---
type: docs
title: "发布和订阅概述"
linkTitle: "pub sub overview"
weight: 1000
description: "Pub/Sub 构建块概述"
---

## 介绍

[发布 / 订阅模式](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) 允许微服务使用消息相互通信。 **生产者或发布者** 将消息发送至 **主题（Topic）** ，并且不知道接收消息的应用程序。 这涉及将它们写入一个输入频道。 同样，一个 **消费者** 将订阅该主题并收到它的消息，并且不知道什么应用程序生产了这些消息。 这涉及从输出频道接收消息。 This involves receiving messages from an output channel. An intermediary message broker is responsible for copying each message from an input channel to an output channels for all subscribers interested in that message. 当您需要将微服务解偶时，此模式特别有用。 当您需要将微服务解偶时，此模式特别有用。

Dapr 中的发布/订阅 API 提供至少一次（at-least-once）的保证，并与各种消息代理和队列系统集成。 The specific implementation used by your service is pluggable and configured as a Dapr pub/sub component at runtime. This approach removes the dependency from your service and, as a result, makes your service more portable and flexible to changes. This approach removes the dependency from your service and, as a result, makes your service more portable and flexible to changes.

发布 / 订阅 API 位于 [API 引用]({{< ref pubsub_api.md >}})。

<img src="/images/pubsub-overview-pattern.png" width=1000>

<br></br>

The Dapr pub/sub building block provides a platform-agnostic API to send and receive messages. Your services publish messages to a named topic and also subscribe to a topic to consume the messages. Your services publish messages to a named topic and also subscribe to a topic to consume the messages.

The service makes a network call to a Dapr pub/sub building block, exposed as a sidecar. This building block then makes calls into a Dapr pub/sub component that encapsulates a specific message broker product. To receive topics, Dapr subscribes to the Dapr pub/sub component on behalf of your service and delivers the messages to an endpoint when they arrive. This building block then makes calls into a Dapr pub/sub component that encapsulates a specific message broker product. To receive topics, Dapr subscribes to the Dapr pub/sub component on behalf of your service and delivers the messages to an endpoint when they arrive.

The diagram below shows an example of a "shipping" service and an "email" service that have both subscribed to topics that are published by the "cart" service. Each service loads pub/sub component configuration files that point to the same pub/sub message bus component, for example Redis Streams, NATS Streaming, Azure Service Bus, or GCP Pub/Sub. Each service loads pub/sub component configuration files that point to the same pub/sub message bus component, for example Redis Streams, NATS Streaming, Azure Service Bus, or GCP Pub/Sub.

<img src="/images/pubsub-overview-components.png" width=1000>
<br></br>

The diagram below has the same services, however this time showing the Dapr publish API that sends an "order" topic and order endpoints on the subscribing services that these topic messages are delivered posted to by Dapr.

<img src="/images/pubsub-overview-publish-API.png" width=1000>
<br></br>

## 特性
The pub/sub building block provides several features to your application.

### 发布/订阅 API

要启用消息路由并为每个消息提供附加上下文，Dapr 使用 [ CloudEvents 1.0 规范](https://github.com/cloudevents/spec/tree/v1.0) 作为其消息格式。 使用 Dapr 应用程序发送的任何信息都将自动包入 Cloud Events 信封中，`datacontenttype` 属性使用 `Content-Type` 头部值。

Dapr implements the following Cloud Events fields:

* `id`
* `source`
* `specversion`
* `type`
* `datacontenttype` (Optional)

The following example shows an XML content in CloudEvent v1.0 serialized as JSON:

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

Dapr applications can subscribe to published topics. Dapr applications can subscribe to published topics. Dapr allows two methods by which your applications can subscribe to topics:

 - 阅读 [发布和订阅]({{< ref howto-publish-subscribe.md >}})指南
 - **Programmatic**, where a subscription is defined in the user code.

 Both declarative and programmatic approaches support the same features. Both declarative and programmatic approaches support the same features. The declarative approach removes the Dapr dependency from your code and allows for existing applications to subscribe to topics, without having to change code. The programmatic approach implements the subscription in your code. The programmatic approach implements the subscription in your code.

  For more information read [How-To: Publish a message and subscribe to a topic]({{< ref howto-publish-subscribe >}}).


### 订阅消息

In principle, Dapr considers message successfully delivered when the subscriber responds with a non-error response after processing the message. For more granular control, Dapr's publish/subscribe API also provides explicit statuses, defined in the response payload, which the subscriber can use to indicate the specific handling instructions to Dapr (e.g. `RETRY` or `DROP`). In principle, Dapr considers message successfully delivered when the subscriber responds with a non-error response after processing the message. For more granular control, Dapr's publish/subscribe API also provides explicit statuses, defined in the response payload, which the subscriber can use to indicate the specific handling instructions to Dapr (e.g. `RETRY` or `DROP`). For more information on message routing read [Dapr publish/subscribe API documentation]({{< ref "pubsub_api.md#provide-routes-for-dapr-to-deliver-topic-events" >}})

### 消息传递

Dapr 保证消息传递 at-least-once 语义。 That means that when an application publishes a message to a topic using the publish/subscribe API, Dapr ensures that this message will be delivered at least once to every subscriber.

### Consumer groups and competing consumers pattern

The burden of dealing with concepts like consumer groups and multiple application instances using a single consumer group is all handled automatically by Dapr. 当同一个应用程序的多个实例(相同的 ID) 订阅主题时，Dapr 只将每个消息传递给该应用程序的一个实例。 当同一个应用程序的多个实例(相同的 ID) 订阅主题时，Dapr 只将每个消息传递给该应用程序的一个实例。 This is commonly known as the competing consumers pattern and is illustrated in the diagram below.

<img src="/images/pubsub-overview-pattern-competing-consumers.png" width=1000>
<br></br>

同样，如果两个不同的应用程序 (不同的 ID) 订阅同一主题，那么 Dapr 将每个消息仅传递到每个应用程序的一个实例。

### Topic scoping

默认情况下，支持Dapr发布/订阅组件的所有主题 (例如，Kafka、Redis、RabbitMQ) 都可用于配置该组件的每个应用程序。 To limit which application can publish or subscribe to topics, Dapr provides topic scoping. This enables to you say which topics an application is allowed to published and which topics an application is allowed to subscribed to. 查看 [发布/订阅主题范围]({{< ref pubsub-scopes.md >}}) 了解更多信息。 This enables to you say which topics an application is allowed to published and which topics an application is allowed to subscribed to. 查看 [发布/订阅主题范围]({{< ref pubsub-scopes.md >}}) 了解更多信息。

### Message Time-to-Live (TTL)
Dapr can set a timeout message on a per message basis, meaning that if the message is not read from the pub/sub component, then the message is discarded. This is to prevent the build up of messages that are not read. A message that has been in the queue for longer than the configured TTL is said to be dead.  For more information read [publish/subscribe message time-to-live]({{< ref pubsub-message-ttl.md >}}). This is to prevent the build up of messages that are not read. A message that has been in the queue for longer than the configured TTL is said to be dead.  For more information read [publish/subscribe message time-to-live]({{< ref pubsub-message-ttl.md >}}).

- Note: Message TTL can also be set for a given queue at the time of component creation. Look at the specific characteristic of the component that you are using. Look at the specific characteristic of the component that you are using.

### Publish/Subscribe API

The publish/subscribe API is located in the [API reference]({{< ref pubsub_api.md >}}).

## 下一步

* Follow these guides on:
    * [How-To: Publish a message and subscribe to a topic]({{< ref howto-publish-subscribe.md >}})
    * [How-To: Configure Pub/Sub components with multiple namespaces]({{< ref pubsub-namespaces.md >}})
* Try out the [Pub/Sub quickstart sample](https://github.com/dapr/quickstarts/tree/master/pub-sub)
* 阅读 [API 引用]({{< ref pubsub_api.md >}})
* Learn about [message time-to-live (TTL)]({{< ref pubsub-message-ttl.md >}})
* 可用发布/订阅实现的完整列表 [在这]({{< ref supported-pubsub >}})。
* Read the [pub/sub API reference]({{< ref pubsub_api.md >}})