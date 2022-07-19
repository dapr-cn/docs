---
type: docs
title: "Pub/Sub 代理"
linkTitle: "Pub/Sub 代理"
description: "关于为 Dapr Pub/Sub 设置不同的消息代理的指南"
weight: 2000
aliases:
  - "/zh-hans/operations/components/setup-pubsub/setup-pubsub-overview/"
---

Dapr集成了pub/sub 消息总线，为应用程序提供了创建事件驱动、松散耦合架构的能力，在这种架构下，生产者通过主题向消费者发送事件。

Dapr支持为*每个应用*配置多个命名的 pub/sub 组件。 每个 pub/sub 组件都有一个名称，这个名称在发布消息主题时使用。 有关如何发布和订阅主题的详细信息，请阅读 [API 参考文档]({{< ref pubsub_api.md >}}) 。

Pub/sub 组件是可扩展的， [这里]({{< ref supported-pubsub >}})有一个支持发布/订阅组件的列表，实现可以在 [components-contrib 仓库](https://github.com/dapr/components-contrib)里找到。

## 组件文件

Pub/sub使用 `Component` 文件来描述：

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

Pub/sub 的类型由 `type` 字段决定，连接地址和其他元数据等属性放在 `.metadata` 部分。 即使元数据值可以包含纯文本的秘密，但建议您使用[秘密存储]({{< ref component-secrets.md >}})并使用 `secretKeyRef`。

{{% alert title="Topic creation" color="primary" %}}
根据你使用的 pub/sub 消息总线及其配置方式，主题可能会被自动创建。 即使消息总线支持自动创建主题，在生产环境中把它禁用也是一种常见的做法。 你可能会需要使用 CLI、管理控制台或请求表单来手动创建应用所需的主题。
{{% /alert %}}

请访问[本指南]({{< ref " howto-publish-subscribe. md#step-3-publish-a-topic" >}}) ，了解配置和使用发布/订阅组件的说明。

## 相关链接

- Dapr [发布/订阅构建块概述]({{< ref pubsub-overview.md >}})
- 试试 [Pub/Sub 快速启动示例](https://github.com/dapr/quickstarts/tree/master/pub_sub)
- 阅读 [关于发布和订阅的指南]({{< ref howto-publish-subscribe.md >}})
- 了解 [Topic 作用域]({{< ref pubsub-scopes.md >}})
- 了解 [消息存活时间]({{< ref pubsub-message-ttl.md >}})
- 学习 [如何配置具有多个命名空间的 Pub/Sub 组件]({{< ref pubsub-namespaces.md >}})
- [pub/sub组件列表]({{< ref supported-pubsub >}})
- 阅读 [API 引用]({{< ref pubsub_api.md >}})
