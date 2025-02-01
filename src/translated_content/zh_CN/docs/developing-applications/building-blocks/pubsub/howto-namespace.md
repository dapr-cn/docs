---
type: docs
title: "如何：设置 pub/sub 命名空间消费者组"
linkTitle: "如何：命名空间消费者组"
weight: 5000
description: "了解如何在组件中使用基于元数据的命名空间消费者组"
---

您已经配置了 [Dapr 的 pub/sub API 构建块]({{< ref pubsub-overview >}})，并且您的应用程序正在使用集中式消息代理顺利地发布和订阅主题。如果您想为应用程序执行简单的 A/B 测试、蓝/绿部署，甚至金丝雀部署，该怎么办？即使使用 Dapr，这也可能很困难。

Dapr 通过其 pub/sub 命名空间消费者组机制解决了大规模的多租户问题。

## 没有命名空间消费者组

假设您有一个 Kubernetes 集群，其中两个应用程序（App1 和 App2）部署在同一个命名空间（namespace-a）中。App2 发布到一个名为 `order` 的主题，而 App1 订阅名为 `order` 的主题。这将创建两个以您的应用程序命名的消费者组（App1 和 App2）。

<img src="/images/howto-namespace/basic-pubsub.png" width=1000 alt="显示基本 pubsub 过程的图示。">

为了在使用集中式消息代理时进行简单的测试和部署，您创建了另一个命名空间，其中包含两个具有相同 `app-id` 的应用程序，App1 和 App2。

Dapr 使用单个应用程序的 `app-id` 创建消费者组，因此消费者组名称将保持为 App1 和 App2。

<img src="/images/howto-namespace/without-namespace.png" width=1000 alt="显示没有 Dapr 命名空间消费者组的多租户复杂性的图示。">

为了避免这种情况，您需要在代码中“潜入”一些东西来更改 `app-id`，具体取决于您运行的命名空间。这种方法既麻烦又容易出错。

## 使用命名空间消费者组

Dapr 不仅允许您使用 UUID 和 pod 名称的 consumerID 更改消费者组的行为，还提供了一个存在于 pub/sub 组件元数据中的 **命名空间机制**。例如，使用 Redis 作为您的消息代理：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
  - name: consumerID
    value: "{namespace}"
```

通过将 `consumerID` 配置为 `{namespace}` 值，您可以在不同的命名空间中使用相同的 `app-id` 和相同的主题。

<img src="/images/howto-namespace/with-namespace.png" width=1000 alt="显示命名空间消费者组如何帮助多租户的图示。">

在上图中，您有两个命名空间，每个命名空间都有相同 `app-id` 的应用程序，发布和订阅相同的集中式消息代理 `orders`。然而这次，Dapr 创建了以它们运行的命名空间为前缀的消费者组名称。

无需更改您的代码或 `app-id`，命名空间消费者组允许您：
- 添加更多命名空间
- 保持相同的主题
- 在命名空间之间保持相同的 `app-id`
- 保持整个部署管道完整

只需在您的组件元数据中包含 `"{namespace}"` 消费者组机制。您无需在元数据中手动编码命名空间。Dapr 会自动识别其运行的命名空间并为您填充命名空间值，就像由运行时注入的动态元数据值一样。

{{% alert title="注意" color="primary" %}}
如果您之后将命名空间消费者组添加到元数据中，Dapr 会为您更新所有内容。这意味着您可以将命名空间元数据值添加到现有的 pub/sub 部署中。
{{% /alert %}}

## 演示

观看 [此视频以了解 pub/sub 多租户的概述](https://youtu.be/eK463jugo0c?t=1188)：

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/eK463jugo0c?start=1188" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 下一步

- 了解更多关于使用多个命名空间配置 Pub/Sub 组件的信息 [pub/sub 命名空间]({{< ref pubsub-namespaces >}})。