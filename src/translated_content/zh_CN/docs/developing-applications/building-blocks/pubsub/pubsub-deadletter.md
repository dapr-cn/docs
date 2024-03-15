---
type: docs
title: 死信主题
linkTitle: 死信主题
weight: 4000
description: 使用订阅死信主题转发无法送达的邮件
---

## 介绍

有时候应用程序可能因为各种原因无法处理消息。 例如，可能出现临时问题，无法检索处理消息所需的数据，或者应用程序的业务逻辑失败并返回错误。  死信主题用于转发无法传递给订阅应用程序的消息。 这样可以减轻应用的压力，使其不必处理这些失败的消息，允许开发者编写从死信主题中读取的代码，要么修复消息并重新发送，要么完全放弃它。

死信主题通常与重试弹性策略和处理来自死信主题转发的消息所需逻辑的死信订阅一起使用。

当设置了死信主题时，任何未能成功传递到配置主题的应用程序的消息都会被放置在死信主题上，以便转发到处理这些消息的订阅。 这可能是同一个应用程序，也可能是完全不同的应用程序。

Dapr 使所有 pub/sub 组件都能启用死信主题，即使底层系统不原生支持此功能。 例如，[AWS SNS组件]({{< ref "setup-aws-snssqs" >}})有一个死信队列，而[RabbitMQ]({{< ref "setup-rabbitmq" >}})有死信主题。 您需要确保适当配置此类组件。

下面的图表是死信主题如何工作的一个例子。 首先，从发布者发送一条消息到一个 `orders` 主题。 Dapr代表订阅者应用程序接收消息，然而订单主题消息无法传递到应用程序的`/checkout`终结点，即使经过重试也是如此。 由于无法传递，消息将转发到`poisonMessages`主题，将其传递给`/failedMessages`端点进行处理，在本例中为同一应用程序。 `failedMessages` 的处理代码可能会丢弃消息或重新发送新消息。

<img src="/images/pubsub_deadletter.png" width=1200>

## 使用声明性订阅配置死信主题

以下YAML显示了如何配置一个订阅，其中包含一个名为`poisonMessages`的死信主题，用于消费自`orders`主题的消息。 此订阅适用于具有 `checkout` ID 的应用程序。

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

## 使用声明性订阅配置死信主题

从`/subscribe`端点返回的JSON显示了如何配置一个名为`poisonMessages`的死信主题，用于消费自`orders`主题的消息。

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

默认情况下，当设置了死信主题时，任何失败的消息都会立即发送到死信主题。  因此，在使用订阅中的死信主题时，建议始终设置重试策略。
要在将消息发送到死信主题之前启用消息重试，请应用 [重试复原策略]({{< ref "policies.md#retries" >}}) 到 Pub/sub（发布/订阅）组件。

此示例演示如何设置名为 `pubsubRetry`，每 5 秒应用 10 次最大投放尝试 pubsub（发布/订阅）组件。

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

## 配置订阅以处理死信主题

请记住现在配置一个订阅来处理死信主题。 例如，您可以创建另一个声明性订阅以在相同或不同的应用程序上接收这些内容。 下面的示例显示了checkout应用程序使用另一个订阅订阅`poisonMessages`主题，并将这些发送到`/failedmessages`端点进行处理。

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

## 例子

观看[此视频以了解死信主题的概述](https://youtu.be/wLYYOJLt_KQ?t=69):

<iframe width="360" height="315" src="https://www.youtube-nocookie.com/embed/wLYYOJLt_KQ?start=69" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 下一步

- 要获取有关弹性策略的更多信息，请阅读 [弹性概述]({{< ref resiliency-overview.md >}})。
- 有关主题订阅的更多信息，请阅读 [声明性和编程性订阅方法]({{< ref "pubsub-overview.md#message-subscription" >}})。
