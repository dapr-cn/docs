---
type: docs
title: "死信主题"
linkTitle: "死信主题"
weight: 4000
description: "通过订阅死信主题来处理无法投递的消息"
---

## 介绍

在某些情况下，应用程序可能由于各种原因无法处理消息。例如，可能会出现获取处理消息所需数据的临时问题，或者应用程序的业务逻辑失败并返回错误。死信主题用于处理这些无法投递的消息，并将其转发到订阅应用程序。这可以减轻应用程序处理失败消息的负担，使开发人员可以编写代码从死信主题中读取消息，修复后重新发送，或者选择放弃这些消息。

死信主题通常与重试策略和处理死信主题消息的订阅一起使用。

当配置了死信主题时，任何无法投递到应用程序的消息都会被放置在死信主题中，以便转发到处理这些消息的订阅。这可以是同一个应用程序或完全不同的应用程序。

即使底层系统不支持，Dapr 也为其所有的 pubsub 组件启用了死信主题。例如，[AWS SNS 组件]({{< ref "setup-aws-snssqs" >}})有一个死信队列，[RabbitMQ]({{< ref "setup-rabbitmq" >}})有死信主题。您需要确保正确配置这些组件。

下图展示了死信主题的工作原理。首先，消息从 `orders` 主题的发布者发送。Dapr 代表订阅者应用程序接收消息，但 `orders` 主题的消息未能投递到应用程序的 `/checkout` 端点，即使经过重试也是如此。由于投递失败，消息被转发到 `poisonMessages` 主题，该主题将其投递到 `/failedMessages` 端点进行处理，在这种情况下是在同一个应用程序上。`failedMessages` 处理代码可以选择丢弃消息或重新发送新消息。

<img src="/images/pubsub_deadletter.png" width=1200>

## 使用声明式订阅配置死信主题

以下 YAML 显示了如何为从 `orders` 主题消费的消息配置名为 `poisonMessages` 的死信主题。此订阅的范围限定为具有 `checkout` ID 的应用程序。

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: order
spec:
  topic: orders
  routes: 
    default: /checkout
  pubsubname: pubsub
  deadLetterTopic: poisonMessages
scopes:
- checkout
```

## 使用流式订阅配置死信主题

```go
	var deadLetterTopic = "poisonMessages"
	sub, err := cl.Subscribe(context.Background(), client.SubscriptionOptions{
		PubsubName:      "pubsub",
		Topic:           "orders",
		DeadLetterTopic: &deadLetterTopic,
	})
```

## 使用编程订阅配置死信主题

从 `/subscribe` 端点返回的 JSON 显示了如何为从 `orders` 主题消费的消息配置名为 `poisonMessages` 的死信主题。

```javascript
app.get('/dapr/subscribe', (_req, res) => {
    res.json([
        {
            pubsubname: "pubsub",
            topic: "orders",
            route: "/checkout",
            deadLetterTopic: "poisonMessages"
        }
    ]);
});
```

## 重试和死信主题

默认情况下，当设置了死信主题时，任何失败的消息会立即进入死信主题。因此，建议在订阅中使用死信主题时始终设置重试策略。
要在将消息发送到死信主题之前启用消息重试，请对 pubsub 组件应用 [重试策略]({{< ref "policies.md#retries" >}})。

此示例显示了如何为 `pubsub` pubsub 组件设置名为 `pubsubRetry` 的常量重试策略，每 5 秒应用一次，最多尝试投递 10 次。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: myresiliency
spec:
  policies:
    retries:
      pubsubRetry:
        policy: constant
        duration: 5s
        maxRetries: 10
  targets:
    components:
      pubsub:
        inbound:
          retry: pubsubRetry
```

## 配置处理死信主题的订阅

请记得配置一个订阅来处理死信主题。例如，您可以创建另一个声明式订阅，在同一个或不同的应用程序上接收这些消息。下面的示例显示了 checkout 应用程序通过另一个订阅订阅 `poisonMessages` 主题，并将这些消息发送到 `/failedmessages` 端点进行处理。

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: deadlettertopics
spec:
  topic: poisonMessages
  routes:
    rules:
      - match:
        path: /failedMessages
  pubsubname: pubsub
scopes:
- checkout
```

## 演示

观看[此视频以了解死信主题的概述](https://youtu.be/wLYYOJLt_KQ?t=69):

<iframe width="360" height="315" src="https://www.youtube-nocookie.com/embed/wLYYOJLt_KQ?start=69" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 下一步

- 有关弹性策略的更多信息，请阅读[弹性概述]({{< ref resiliency-overview.md >}})。
- 有关主题订阅的更多信息，请阅读[声明式、流式和编程订阅方法]({{< ref "pubsub-overview.md#message-subscription" >}})。
