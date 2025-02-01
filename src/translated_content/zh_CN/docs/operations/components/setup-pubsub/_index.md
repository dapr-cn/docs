---
type: docs
title: "发布/订阅代理"
linkTitle: "发布/订阅代理"
description: "关于为 Dapr 发布/订阅设置不同消息代理的指导"
weight: 700
aliases:
  - "/zh-hans/operations/components/setup-pubsub/setup-pubsub-overview/"
---

Dapr 支持与发布/订阅消息总线的集成，为应用程序提供创建事件驱动、松耦合架构的能力，生产者通过主题向消费者发送事件。

Dapr 允许为*每个应用程序*配置多个具名的发布/订阅组件。每个组件都有一个名称，用于在发布消息主题时识别。阅读 [API 参考]({{< ref pubsub_api.md >}}) 了解如何发布和订阅主题的详细信息。

发布/订阅组件是可扩展的。支持的组件列表在[这里]({{< ref supported-pubsub >}})，实现可以在 [components-contrib 仓库](https://github.com/dapr/components-contrib)中找到。

## 组件文件

发布/订阅通过 `Component` 文件描述：

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

发布/订阅的类型由 `type` 字段指定，连接字符串和其他元数据等属性放在 `.metadata` 部分。尽管元数据值可以包含明文的 secret，建议您通过 `secretKeyRef` 使用 [secret 存储]({{< ref component-secrets.md >}}) 来管理这些 secret。

{{% alert title="主题创建" color="primary" %}}
根据您使用的发布/订阅消息总线及其配置，主题可能会自动创建。即使消息总线支持自动主题创建，在生产环境中禁用它是一种常见的治理实践。您可能仍需要使用 CLI、管理控制台或请求表单手动创建应用程序所需的主题。
{{% /alert %}}

虽然所有发布/订阅组件都支持 `consumerID` 元数据，但如果您未提供，运行时会自动生成一个消费者 ID。所有组件元数据字段值可以使用 [模板化元数据值]({{< ref "component-schema.md#templated-metadata-values" >}})，这些值在 Dapr sidecar 启动时解析。例如，您可以选择使用 `{namespace}` 作为 `consumerGroup`，以便在不同命名空间中使用相同的 `appId` 使用相同的主题，如[本文]({{< ref "howto-namespace.md#with-namespace-consumer-groups">}})所述。

访问[本指南]({{< ref "howto-publish-subscribe.md#step-3-publish-a-topic" >}})获取配置和使用发布/订阅组件的说明。

## 相关链接

- Dapr [发布/订阅构建块]({{< ref pubsub-overview.md >}})概述
- 尝试 [发布/订阅快速入门示例](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub)
- 阅读[发布和订阅指南]({{< ref howto-publish-subscribe.md >}})
- 了解[主题范围]({{< ref pubsub-scopes.md >}})
- 了解[消息生存时间]({{< ref pubsub-message-ttl.md >}})
- 学习[如何配置具有多个命名空间的发布/订阅组件]({{< ref pubsub-namespaces.md >}})
- [发布/订阅组件]({{< ref supported-pubsub >}})列表
- 阅读 [API 参考]({{< ref pubsub_api.md >}})
