---
type: docs
title: "发布/订阅代理组件规范"
linkTitle: "发布/订阅代理"
weight: 1000
description: 支持与Dapr接口的发布/订阅代理
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/"
no_list: true
---

下表展示了Dapr发布/订阅模块支持的发布和订阅代理。[了解如何为Dapr配置不同的发布/订阅代理。]({{< ref setup-pubsub.md >}})

{{% alert title="发布/订阅组件的重试机制与入站弹性" color="warning" %}}
每个发布/订阅组件都有其自带的重试机制。在应用[Dapr弹性策略]({{< ref "policies.md" >}})之前，请确保您了解所使用的发布/订阅组件的默认重试策略。Dapr弹性策略并不是替代这些内置重试，而是对其进行补充，这可能导致消息的重复处理。
{{% /alert %}}

{{< partial "components/description.html" >}}

{{< partial "components/pubsub.html" >}}