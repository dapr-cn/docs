---
type: docs
title: "发布和订阅概述"
linkTitle: "概述"
weight: 1000
description: "Overview of the pub/sub API building block"
---

## Publish and subscribe pattern

The publish and subscribe pattern (pub/sub) enables microservices to communicate with each other using messages for event-driven architectures.

- The producer, or **publisher**, writes messages to an input channel and sends them to a topic, unaware which application will receive them.
- The consumer, or **subscriber**, subscribes to the topic and receives messages from an output channel, unaware which service produced these messages.

An intermediary message broker copies each message from a publisher's input channel to an output channel for all subscribers interested in that message. 当您需要将微服务解偶时，此模式特别有用。

<img src="/images/pubsub-overview-pattern.png" width=1000>

<br></br>

## Pub/sub API in Dapr

The pub/sub API in Dapr:
- Provides a platform-agnostic API to send and receive messages.
- Offers at-least-once message delivery guarantee.
- Integrates with various message brokers and queuing systems.

The specific message broker used by your service is pluggable and configured as a Dapr pub/sub component at runtime. This removes the dependency from your service and makes your service more portable and flexible to changes.

When using pub/sub in Dapr:

1. Your service makes a network call to a Dapr pub/sub building block API.
1. The pub/sub building block makes calls into a Dapr pub/sub component that encapsulates a specific message broker.
1. To receive messages on a topic, Dapr subscribes to the pub/sub component on behalf of your service with a topic and delivers the messages to an endpoint on your service when they arrive.

In the diagram below, a "shipping" service and an "email" service have both subscribed to topics published by a "cart" service. Each service loads pub/sub component configuration files that point to the same pub/sub message bus component; for example: Redis Streams, NATS Streaming, Azure Service Bus, or GCP pub/sub.

<img src="/images/pubsub-overview-components.png" width=1000>
<br></br>

In the diagram below, the Dapr API posts an "order" topic from the publishing "cart" service to "order" endpoints on the "shipping" and "email" subscribing services.

<img src="/images/pubsub-overview-publish-API.png" width=1000>
<br></br>

[View the complete list of pub/sub components that Dapr supports]({{< ref supported-pubsub >}}).

## Dapr pub/sub API features

The pub/sub building block brings several features to your application.

### Sending messages using Cloud Events

To enable message routing and provide additional context with each message between services, Dapr uses the [CloudEvents 1.0 specification](https://github.com/cloudevents/spec/tree/v1.0) as its message format. Any message sent by an application to a topic using Dapr is automatically wrapped in a Cloud Events envelope, using [`Content-Type` header value]({{< ref "pubsub-overview.md#content-types" >}}) for `datacontenttype` attribute.

For more information, read about [messaging with CloudEvents]({{< ref pubsub-cloudevents.md >}}), or [sending raw messages without CloudEvents]({{< ref pubsub-raw.md >}}).

### 与不使用 Dapr 和 CloudEvents 的应用程序通信

If one of your applications uses Dapr while another doesn't, you can disable the CloudEvent wrapping for a publisher or subscriber. This allows partial adoption of Dapr pub/sub in applications that cannot adopt Dapr all at once.

For more information, read [how to use pub/sub without CloudEvents]({{< ref pubsub-raw.md >}}).

### Setting message content types

当发布消息时，必须指定所发送数据的内容类型。 除非指定, Dapr 将假定类型为 `text/plain`。

- HTTP client: the content type can be set in a `Content-Type` header
- gRPC client and SDK: have a dedicated content type parameter

### 订阅消息

In principle, Dapr considers a message successfully delivered once the subscriber processes the message and responds with a non-error response. For more granular control, Dapr's pub/sub API also provides explicit statuses, defined in the response payload, with which the subscriber indicates specific handling instructions to Dapr (for example, `RETRY` or `DROP`).

### Receiving messages with topic subscriptions

Dapr applications can subscribe to published topics via two methods that support the same features: declarative and programmatic.

| Subscription method | 说明                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| **Declarative**     | Subscription is defined in an **external file**. 声明式方法会从您的代码中移除 Dapr 依赖，并允许现有的应用程序订阅 topics，而无需更改代码。 |
| **Programmatic**    | Subscription is defined in the **user code**. 编程方法在用户代码中实现订阅。                                        |

For more information, read [about the subscriptions in Subscription Methods]({{< ref subscription-methods.md >}}).

### Message routing

Dapr provides [content-based routing](https://www.enterpriseintegrationpatterns.com/ContentBasedRouter.html) pattern. [Pub/sub routing]({{< ref howto-route-messages.md >}}) is an implementation of this pattern that allows developers to use expressions to route [CloudEvents](https://cloudevents.io) based on their contents to different URIs/paths and event handlers in your application. If no route matches, an optional default route is used. This is useful as your applications expands to support multiple event versions or special cases.

This feature is available to both the declarative and programmatic subscription approaches.

For more information on message routing, read [Dapr pub/sub API reference]({{< ref "pubsub_api.md#provide-routes-for-dapr-to-deliver-topic-events" >}})

### 消息传递

Dapr guarantees at-least-once semantics for message delivery. When an application publishes a message to a topic using the pub/sub API, Dapr ensures the message is delivered *at least once* to every subscriber.

### 消费者群体和竞争性消费者模式

Dapr automatically handles the burden of dealing with concepts like consumer groups and competing consumers pattern. The competing consumers pattern refers to multiple application instances using a single consumer group. When multiple instances of the same application (running same Dapr app ID) subscribe to a topic, Dapr delivers each message to *only one instance of **that** application*. This concept is illustrated in the diagram below.

<img src="/images/pubsub-overview-pattern-competing-consumers.png" width=1000>
<br></br>

Similarly, if two different applications (with different app-IDs) subscribe to the same topic, Dapr delivers each message to *only one instance of **each** application*.

### Scoping topics for added security

By default, all topic messages associated with an instance of a pub/sub component are available to every application configured with that component. You can limit which application can publish or subscribe to topics with Dapr topic scoping. For more information, read: [pub/sub topic scoping]({{< ref pubsub-scopes.md >}}).

### 消息生存时间

Dapr can set a timeout message on a per-message basis, meaning that if the message is not read from the pub/sub component, then the message is discarded. This timeout message prevents a build up of unread messages. If a message has been in the queue longer than the configured TTL, it is marked as dead. For more information, read [pub/sub message TTL]({{< ref pubsub-message-ttl.md >}}).

## Try out pub/sub

### Quickstarts and tutorials

Want to put the Dapr pub/sub API to the test? Walk through the following quickstart and tutorials to see pub/sub in action:

| Quickstart/tutorial                                                                   | 说明                                           |
| ------------------------------------------------------------------------------------- | -------------------------------------------- |
| [Pub/sub quickstart]({{< ref pubsub-quickstart.md >}})                                | 使用发布和订阅 API 发送和接收消息。                         |
| [Pub/sub tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub) | 演示如何使用Dapr启用 发布-订阅 应用程序。 使用Redis作为 发布-订阅 组件。 |

### Start using pub/sub directly in your app

Want to skip the quickstarts? Not a problem. You can try out the pub/sub building block directly in your application to publish messages and subscribe to a topic. After [Dapr is installed]({{< ref "getting-started/_index.md" >}}), you can begin using the pub/sub API starting with [the pub/sub how-to guide]({{< ref howto-publish-subscribe.md >}}).

## 下一步

- Learn about [messaging with CloudEvents]({{< ref pubsub-cloudevents.md >}}) and when you might want to [send messages without CloudEvents]({{< ref pubsub-raw.md >}}).
- Follow [How-To: Configure pub/sub components with multiple namespaces]({{< ref pubsub-namespaces.md >}}).
- Review the list of [pub/sub components]({{< ref setup-pubsub >}}).
- Read the [API reference]({{< ref pubsub_api.md >}}).
