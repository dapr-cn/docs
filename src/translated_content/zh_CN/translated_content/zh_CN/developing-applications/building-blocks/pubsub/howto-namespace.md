---
type: docs
title: "如何设置发布/订阅命名空间的消费者组"
linkTitle: "How to: Namespace consumer groups"
weight: 5000
description: "学习如何在您的组件中使用基于元数据的命名空间消费者组"
---

您已经设置了 [个Dapr的Pub/Sub API构建块]({{< ref pubsub-overview >}})，您的应用程序正在使用集中式消息代理发布和订阅主题，实现顺畅的发布和订阅。 如果您想对应用程序进行简单的A/B测试、蓝绿部署，甚至金丝雀部署，该怎么办呢？ 即使使用 Dapr，这也可能很困难。

Dapr使用其发布/订阅命名空间消费者组构建解决了大规模的多租户问题。

## 没有命名空间的消费者组

假设您有一个Kubernetes集群，其中部署了两个应用程序（App1和App2），它们都部署在同一个命名空间（namespace-a）中。 App2发布到一个名为 `order`的主题，而App1订阅了一个名为 `order`的主题。 这将创建两个消费者组，以您的应用程序命名（App1和App2）。

<img src="/images/howto-namespace/basic-pubsub.png" width=1000 alt="显示基本发布订阅过程的图表。">

为了在使用集中式消息代理时进行简单的测试和部署，您需要创建另一个命名空间，其中包含两个相同的应用程序 `app-id`，App1 和 App2。

Dapr 使用各个应用程序的 `app-id` 创建消费者组，因此消费者组名称将保持为 App1 和 App2。

<img src="/images/howto-namespace/without-namespace.png" width=1000 alt="显示没有 Dapr 命名空间消费者组的多租户复杂性的图表。">

为了避免这种情况，你需要在代码中加入一些“特技”的东西来改变 `app-id`，具体取决于运行的命名空间。 这种解决方法很繁琐且非常痛苦。

## 具有命名空间的消费者组

Dapr 不仅可以让您通过使用 UUID 和 pod 名称为消费者组的 consumerID 更改其行为，还提供了一个位于发布/订阅组件元数据中的 **namespace construct** 。 例如，使用 Redis 作为消息代理：

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

通过配置 `consumerID` 用 `{namespace}` 值，您将能够使用相同的 `app-id` 具有来自不同命名空间的相同主题。

<img src="/images/howto-namespace/with-namespace.png" width=1000 alt="显示命名空间消费者组如何帮助多租户。">

在上面的图表中，您有两个命名空间，每个命名空间都有相同的应用程序 `app-id`，发布和订阅相同的集中式消息代理 `orders`。 然而，这次 Dapr 已经创建了以其所运行的命名空间为前缀的消费者组名称。

无需更改您的代码/`pp-id`，命名空间消费者组允许您：
- 添加更多命名空间
- 保持相同的主题
- 在各个命名空间中保持相同的 `app-id`
- 保持您的整个部署流程完整

只需在组件元数据中包含 `"{namespace}"` 消费者组构造。 您不需要在元数据中编码命名空间。 Dapr 理解它所运行的命名空间，并为您完成命名空间值，就像运行时注入的动态元数据值一样。

{{% alert title="Note" color="primary" %}}
如果您在之后将命名空间的消费者组添加到您的元数据中，Dapr会为您更新所有内容。 这意味着您可以将命名空间元数据值添加到现有的发布/订阅部署中。
{{% /alert %}}

## 例子

观看 [这个视频，了解 pub/sub 多租户](https://youtu.be/eK463jugo0c?t=1188)的概述：

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/eK463jugo0c?start=1188" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 下一步

- 了解如何使用多个命名空间配置Pub/Sub组件 [发布/订阅命名空间]({{< ref pubsub-namespaces >}})。