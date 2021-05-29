---
type: docs
title: "Pub/Sub 代理"
linkTitle: "Pub/Sub 代理"
description: "关于为Dapr Pub/Sub设置不同的消息代理的指南"
weight: 2000
aliases:
  - "/zh-hans/operations/components/setup-pubsub/setup-pubsub-overview/"
---

Dapr集成了pub/sub消息总线，为应用程序提供了创建事件驱动、松散耦合架构的能力，在这种架构下，生产者通过主题向消费者发送事件。

Dapr支持为*每个应用*配置多个命名的pub/sub组件。 每个pub/sub组件都有一个名称，这个名称在发布消息主题时使用。 Read the [API reference]({{< ref pubsub_api.md >}}) for details on how to publish and subscribe to topics.

Pub/sub组件是可扩展的， A list of support pub/sub components is [here]({{< ref supported-pubsub >}}) and the implementations can be found in the [components-contrib repo](https://github.com/dapr/components-contrib).

## 组件文件

Pub/sub使用`Component`文件来描述：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: default
spec:
  type: pubsub.<NAME>
  version: v1
  metadata:
  - name: <KEY>
    value: <VALUE>
  - name: <KEY>
    value: <VALUE>
...
```

Pub/sub的类型由`type`字段决定，连接地址和其他元数据等属性放在`.metadata`部分。 Even though metadata values can contain secrets in plain text, it is recommended you use a [secret store]({{< ref component-secrets.md >}}) using a `secretKeyRef`.

{{% alert title="Topic creation" color="primary" %}}
根据你使用的 pub/sub 消息总线及其配置方式，主题可能会被自动创建。 即使消息总线支持自动创建主题，在生产环境中把它禁用也是一种常见的做法。 你可能会需要使用 CLI、管理控制台或请求表单来手动创建应用所需的主题。
{{% /alert %}}

Visit [this guide]({{< ref "howto-publish-subscribe.md#step-3-publish-a-topic" >}}) for instructions on configuring and using pub/sub components.

## 相关链接

- Overview of the Dapr [Pub/Sub building block]({{< ref pubsub-overview.md >}})
- 试试 [Pub/Sub 快速启动示例](https://github.com/dapr/quickstarts/tree/master/pub-sub)
- Read the [guide on publishing and subscribing]({{< ref howto-publish-subscribe.md >}})
- Learn about [topic scoping]({{< ref pubsub-scopes.md >}})
- Learn about [message time-to-live]({{< ref pubsub-message-ttl.md >}})
- Learn [how to configure Pub/Sub components with multiple namespaces]({{< ref pubsub-namespaces.md >}})
- List of [pub/sub components]({{< ref supported-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})
