---
type: docs
title: "概述"
linkTitle: "概述"
description: "Dapr pub/sub 组件设置概述"
weight: 10000
---

Dapr集成了pub/sub消息总线，为应用程序提供了创建事件驱动、松散耦合架构的能力，在这种架构下，生产者通过主题向消费者发送事件。

Dapr支持为*每个应用*配置多个命名的pub/sub组件。 每个pub/sub组件都有一个名称，这个名称在发布消息主题时使用。 阅读 [API 参考]({{< ref pubsub_api.md >}})，了解如何发布和订阅主题的详细信息。

Pub/sub组件是可扩展的， [这里]({{< ref supported-pubsub >}})有支持的pub/sub组件列表，实现可以在[components-contrib repo](https://github.com/dapr/components-contrib)中找到。

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

Pub/sub的类型由`type`字段决定，连接地址和其他元数据等属性放在`.metadata`部分。 尽管元数据值可以包含纯文本的密钥，但建议你使用[密钥仓库]({{< ref component-secrets.md >}})来存储并用`secretKeyRef`引用。

{{% alert title="Topic creation" color="primary" %}}
根据你使用的 pub/sub 消息总线及其配置方式，主题可能会被自动创建。 即使消息总线支持自动创建主题，在生产环境中把它禁用也是一种常见的做法。 你可能会需要使用 CLI、管理控制台或请求表单来手动创建应用所需的主题。
{{% /alert %}}

请访问 [本指南]({{< ref "howto-publish-subscribe.md#step-3-publish-a-topic" >}})，了解有关配置和使用 pub/sub 组件的说明。

## 相关链接

- Dapr概述 [Pub/Sub构件块]({{< ref pubsub-overview.md >}})
- 试试 [Pub/Sub 快速启动示例](https://github.com/dapr/quickstarts/tree/master/pub-sub)
- 阅读[发布和订阅指南]({{< ref howto-publish-subscribe.md >}})
- 了解 [Topic 作用域]({{< ref pubsub-scopes.md >}})
- 了解 [消息存活时间]({{< ref pubsub-message-ttl.md >}})
- 您可以重写这个文件以使用另一个 Redis 实例或者另一个 [pubsub component]({{< ref setup-pubsub >}}) ，通过创建 `components` 文件夹（文件夹中包含重写的文件）并在 `dapr run` 命令行界面使用 `--components-path` 标志。
- {{< ref supported-pubsub >}}
- 阅读 [API 引用]({{< ref pubsub_api.md >}})
