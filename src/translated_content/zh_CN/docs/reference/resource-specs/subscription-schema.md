---
type: docs
title: "订阅规范"
linkTitle: "订阅"
weight: 2000
description: "Dapr 订阅的基本规范"
---

`Subscription` Dapr 资源允许您使用外部组件的 YAML 文件以声明方式订阅主题。

{{% alert title="注意" color="primary" %}}
任何订阅都可以限制在特定的[命名空间]({{< ref isolation-concept.md >}})内，并通过作用域限制访问特定的应用程序。
{{% /alert %}}

本指南介绍了两种订阅 API 版本：

- `v2alpha`（默认规范）
- `v1alpha1`（已弃用）

## `v2alpha1` 格式

以下是 `Subscription` 资源的基本 `v2alpha1` 规范。`v2alpha1` 是订阅 API 的默认规范。

```yml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: <REPLACE-WITH-NAME>
spec:
  topic: <REPLACE-WITH-TOPIC-NAME> # 必需
  routes: # 必需
    rules:
      - match: <REPLACE-WITH-CEL-FILTER>
        path: <REPLACE-WITH-PATH>
  pubsubname: <REPLACE-WITH-PUBSUB-NAME> # 必需
  deadLetterTopic: <REPLACE-WITH-DEADLETTERTOPIC-NAME> # 可选
  bulkSubscribe: # 可选
    enabled: <REPLACE-WITH-BOOLEAN-VALUE>
    maxMessagesCount: <REPLACE-WITH-VALUE>
    maxAwaitDurationMs: <REPLACE-WITH-VALUE>
scopes:
- <REPLACE-WITH-SCOPED-APPIDS>
```

### 规范字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| topic | Y | 您的组件订阅的主题名称。 | `orders` |
| routes | Y | 此主题的路由配置，包括指定将消息发送到特定路径的条件。包括以下字段： <br><ul><li>match: 用于匹配事件的 CEL 表达式。如果未指定，则该路由被视为默认路由。 </li><li>path: 匹配此规则的事件的路径。 </li></ul>所有主题消息发送到的端点。 | `match: event.type == "widget"` <br>`path: /widgets` |
| pubsubname | N | 您的 pub/sub 组件的名称。 | `pubsub` |
| deadLetterTopic | N | 转发无法投递消息的死信主题的名称。 | `poisonMessages` |
| bulkSubscribe | N | 启用批量订阅功能。 | `true`, `false` |

## `v1alpha1` 格式

以下是 `Subscription` 资源的基本 `v1alpha1` 规范。`v1alpha1` 现已弃用。

```yml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: <REPLACE-WITH-RESOURCE-NAME>
spec:
  topic: <REPLACE-WITH-TOPIC-NAME> # 必需
  route: <REPLACE-WITH-ROUTE-NAME> # 必需
  pubsubname: <REPLACE-WITH-PUBSUB-NAME> # 必需
  deadLetterTopic: <REPLACE-WITH-DEAD-LETTER-TOPIC-NAME> # 可选
  bulkSubscribe: # 可选
  - enabled: <REPLACE-WITH-BOOLEAN-VALUE>
  - maxMessagesCount: <REPLACE-WITH-VALUE>
  - maxAwaitDurationMs: <REPLACE-WITH-VALUE>
scopes:
- <REPLACE-WITH-SCOPED-APPIDS>
```

### 规范字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| topic | Y | 您的组件订阅的主题名称。 | `orders` |
| route | Y | 所有主题消息发送到的端点。 | `/checkout` |
| pubsubname | N | 您的 pub/sub 组件的名称。 | `pubsub` |
| deadlettertopic | N | 转发无法投递消息的死信主题的名称。 | `poisonMessages` |
| bulksubscribe | N | 启用批量订阅功能。 | `true`, `false` |

## 相关链接
- [了解更多关于声明性订阅方法的信息]({{< ref "subscription-methods.md#declarative-subscriptions" >}})
- [了解更多关于死信主题的信息]({{< ref pubsub-deadletter.md >}})
- [了解更多关于路由消息的信息]({{< ref "howto-route-messages.md#declarative-subscription" >}})
- [了解更多关于批量订阅的信息]({{< ref pubsub-bulk.md >}})
