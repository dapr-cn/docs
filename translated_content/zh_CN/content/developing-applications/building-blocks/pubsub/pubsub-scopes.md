---
type: docs
title: "限定 Pub/Sub 主题访问权限"
linkTitle: "作用域主题访问"
weight: 5000
description: "使用范围（scopes）限制 Pub/Sub 主题到特定的应用程序"
---

## 介绍

[名称空间或组件作用域（scopes）]({{< ref component-scopes.md >}}) 可用于限制对特定应用程序的组件访问。 添加到组件的这些应用程序作用域仅限制具有特定 ID 的应用程序才能使用该组件。

除了此常规组件范围外，对于 pub/sub 组件，还可以限制以下操作：
- 哪些主题可以使用(发布或订阅)
- 哪些应用程序被允许发布到特定主题
- 哪些应用程序被允许订阅特定主题

这称为 **pub/sub 主题作用域限定**。

为每个 pub/sub 组件定义发布/订阅范围。  您可能有一个名为 `pubsub` 的 pub/sub 组件，它有一组范围设置，另一个 `pubsub2` 另有一组范围设置。

要使用这个主题范围，可以设置一个 pub/sub 组件的三个元数据属性：
- `spec.metadata.publishingScopes`
  - 分号分隔应用程序列表& 逗号分隔的主题列表允许该 app 发布信息到主题列表
  - 如果在 `publishingScopes` (缺省行为) 中未指定任何内容，那么所有应用程序可以发布到所有主题
  - 要拒绝应用程序发布信息到任何主题，请将主题列表留空 (`app1=;app2=topic2`)
  - 例如， `app1=topic1;app2=topic2,topic3;app3=` 允许 app1 发布信息至 topic1 ，app2 允许发布信息到 topic2 和 topic3 ，app3 不允许发布信息到任何主题。
- `spec.metadata.subscriptionScopes`
  - 分号分隔应用程序列表& 逗号分隔的主题列表允许该 app 订阅主题列表
  - 如果在 `subscriptionScopes` (缺省行为) 中未指定任何内容，那么所有应用程序都可以订阅所有主题
  - 例如， `app1=topic1;app2=topic2,topic3` 允许 app1 订阅 topic1 ，app2 可以订阅 topic2 和 topic3
- `spec.metadata.allowedTopics`
  - 一个逗号分隔的允许主题列表，对所有应用程序。
  - 如果未设置 `allowedTopics` (缺省行为) ，那么所有主题都有效。 `subscriptionScopes` 和 `publishingScopes` 如果存在则仍然生效。
  - `publishingScopes` 或 `subscriptionScopes` 可用于与 `allowedTopics` 的 conjuction ，以添加限制粒度

这些元数据属性可用于所有 pub/sub 组件。 以下示例使用 Redis 作为 pub/sub 组件。

## 示例 1: 限制主题访问权限

如果主题包含敏感信息，并且只允许应用程序的某个子集发布或订阅这些主题，限制哪些应用程序可以发布/订阅主题可能很有用。

它还可以用于所有主题，以始终具有应用程序使用哪些主题作为发布者/订阅者的“基本事实”。

以下是三个应用程序和三个主题的示例:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: default
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: "localhost:6379"
  - name: redisPassword
    value: ""
  - name: publishingScopes
    value: "app1=topic1;app2=topic2,topic3;app3="
  - name: subscriptionScopes
    value: "app2=;app3=topic1"
```

下表显示哪些应用程序允许在主题中发布：

|      | topic1 | topic2 | topic3 |
| ---- | ------ | ------ | ------ |
| app1 | X      |        |        |
| app2 |        | X      | X      |
| app3 |        |        |        |

下表显示哪些应用程序可以订阅主题：

|      | topic1 | topic2 | topic3 |
| ---- | ------ | ------ | ------ |
| app1 | X      | X      | X      |
| app2 |        |        |        |
| app3 | X      |        |        |

> 注意: 如果应用程序未列出 ( 例如， subscriptionScopes 中的 app1) ，那么允许订阅所有主题。 因为 `allowedTopics` 未使用，而 app1 任何订阅范围，因此它还可以使用上面未列出的其他主题。

## 示例 2: 限制允许的主题

当 Dapr 应用程序给主题发送信息时，主题将自动创建。 在某些情况下，这个主题的创建应该得到管理。 例如:
- Dapr 应用程序中有关生成主题名称的错误可能会导致创建无限数量的主题
- 简化主题名称和总数，防止主题无限增长

在这些情况下，可以使用 `allowedTopics`。

以下是三个允许的主题的示例:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: default
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: "localhost:6379"
  - name: redisPassword
    value: ""
  - name: allowedTopics
    value: "topic1,topic2,topic3"
```

所有应用程序都可以使用这些主题，但仅允许这些主题，不允许其他主题。

## 示例 3: 组合 `allowedTopics` 和范围

有时，您希望合并这两个作用域，从而仅具有固定的一组允许主题，并指定对某些应用程序的作用域限定。

以下是三个应用程序和两个主题的示例:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: default
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: "localhost:6379"
  - name: redisPassword
    value: ""
  - name: allowedTopics
    value: "A,B"
  - name: publishingScopes
    value: "app1=A"
  - name: subscriptionScopes
    value: "app1=;app2=A"
```

> 注意: 第三个应用程序未列出，因为如果在作用域内未指定应用程序，那么允许使用所有主题。

下表显示允许哪些应用程序发布到主题中:

|      | A | B | C |
| ---- | - | - | - |
| app1 | X |   |   |
| app2 | X | X |   |
| app3 | X | X |   |

下表显示哪些应用程序允许订阅主题：

|      | A | B | C |
| ---- | - | - | - |
| app1 |   |   |   |
| app2 | X |   |   |
| app3 | X | X |   |


## 例子   <iframe width="560" height="315" src="//player.bilibili.com/player.html?aid=331013260&bvid=BV1EA411W71L&cid=277947422&page=1&t=513" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen mark="crwd-mark"></iframe>

## 相关链接

- 学习 [如何配置具有多个命名空间的 Pub/Sub 组件]({{< ref pubsub-namespaces.md >}})
- 了解 [消息存活时间]({{< ref pubsub-message-ttl.md >}})
- [pub/sub组件列表]({{< ref supported-pubsub >}})
- 阅读 [API 引用]({{< ref pubsub_api.md >}})