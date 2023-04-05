---
type: docs
title: "发布/订阅代理"
linkTitle: "发布/订阅代理"
description: "关于为 Dapr Pub/Sub 设置不同的消息代理的指南"
weight: 100
aliases:
  - "/zh-hans/operations/components/setup-pubsub/setup-pubsub-overview/"
---

Dapr integrates with pub/sub message buses to provide applications with the ability to create event-driven, loosely coupled architectures where producers send events to consumers via topics.

Dapr支持为*每个应用*配置多个命名的 pub/sub 组件。 每个 pub/sub 组件都有一个名称，这个名称在发布消息主题时使用。 有关如何发布和订阅主题的详细信息，请阅读 [API 参考文档]({{< ref pubsub_api.md >}}) 。

Pub/sub 组件是可扩展的， [这里]({{< ref supported-pubsub >}})有一个支持发布/订阅组件的列表，实现可以在 [components-contrib 仓库](https://github.com/dapr/components-contrib)里找到。

## Component files

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
根据你使用的发布/订阅消息总线及其配置方式，主题可能会被自动创建。 即使消息总线支持自动创建主题，在生产环境中禁用它也是一种常见的治理做法。 你可能会需要使用 CLI、管理控制台或请求表单来手动创建应用所需的主题。
{{% /alert %}}

请访问[本指南]({{< ref " howto-publish-subscribe. md#step-3-publish-a-topic" >}}) ，了解配置和使用发布/订阅组件的说明。

## 相关链接

- Overview of the Dapr [Pub/Sub building block]({{< ref pubsub-overview.md >}})
- Try the [Pub/Sub quickstart sample](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub)
- 阅读 [关于发布和订阅的指南]({{< ref howto-publish-subscribe.md >}})
- 了解 [主题作用域]({{< ref pubsub-scopes.md >}})
- 了解 [消息存活时间]({{< ref pubsub-message-ttl.md >}})
- 学习 [如何配置具有多个命名空间的 Pub/Sub 组件]({{< ref pubsub-namespaces.md >}})
- [发布/订阅组件列表]({{< ref supported-pubsub >}})
- 阅读 [API 参考文档]({{< ref pubsub_api.md >}})
