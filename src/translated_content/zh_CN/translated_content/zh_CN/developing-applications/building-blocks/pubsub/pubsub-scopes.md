---
type: docs
title: "Scope Pub/sub topic access"
linkTitle: "Scope topic access"
weight: 6000
description: "Use scopes to limit pub/sub topics to specific applications"
---

## Introduction

[Namespaces or component scopes]({{< ref component-scopes.md >}}) can be used to limit component access to particular applications. These application scopes added to a component limit only the applications with specific IDs to be able to use the component.

除了此常规组件范围外，对于 pub/sub 组件，还可以限制以下操作：
- Which topics which can be used (published or subscribed)
- Which applications are allowed to publish to specific topics
- Which applications are allowed to subscribe to specific topics

这称为 **pub/sub 主题作用域限定**。

为每个 pub/sub 组件定义发布/订阅范围。  您可能有一个名为 `pubsub` 的 pub/sub 组件，它有一组范围设置，另一个 `pubsub2` 另有一组范围设置。

要使用这个主题范围，可以设置一个 pub/sub 组件的三个元数据属性：
- `spec.metadata.publishingScopes`
  - A semicolon-separated list of applications & comma-separated topic lists, allowing that app to publish to that list of topics
  - If nothing is specified in `publishingScopes` (default behavior), all apps can publish to all topics
  - To deny an app the ability to publish to any topic, leave the topics list blank (`app1=;app2=topic2`)
  - For example, `app1=topic1;app2=topic2,topic3;app3=` will allow app1 to publish to topic1 and nothing else, app2 to publish to topic2 and topic3 only, and app3 to publish to nothing.
- `spec.metadata.subscriptionScopes`
  - A semicolon-separated list of applications & comma-separated topic lists, allowing that app to subscribe to that list of topics
  - 如果在 `subscriptionScopes` (缺省行为) 中未指定任何内容，那么所有应用程序都可以订阅所有主题
  - 例如， `app1=topic1;app2=topic2,topic3` 允许 app1 订阅 topic1 ，app2 可以订阅 topic2 和 topic3
- `spec.metadata.allowedTopics`
  - A comma-separated list of allowed topics for all applications.
  - 如果未设置 `allowedTopics` (缺省行为) ，那么所有主题都有效。 `subscriptionScopes` 和 `publishingScopes` 如果存在则仍然生效。
  - `publishingScopes`或`subscriptionScopes`可以与`allowedTopics`一起使用，以添加粒度限制

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

> Note: If an application is not listed (e.g. app1 in subscriptionScopes) it is allowed to subscribe to all topics. Because `allowedTopics` is not used and app1 does not have any subscription scopes, it can also use additional topics not listed above.

## 示例 2: 限制允许的主题

当 Dapr 应用程序给主题发送信息时，主题将自动创建。 在某些情况下，这个主题的创建应该得到管理。 例如:
- A bug in a Dapr application on generating the topic name can lead to an unlimited amount of topics created
- 简化主题名称和总数，防止主题无限增长

在这些情况下，可以使用 `allowedTopics`。

以下是三个允许的主题的示例:
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


## 例子

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/7VdWBBGcbHQ?start=513" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 下一步

- Learn [how to configure pub/sub components with multiple namespaces]({{< ref pubsub-namespaces.md >}})
- 了解 [消息存活时间]({{< ref pubsub-message-ttl.md >}})
- [发布/订阅组件列表]({{< ref supported-pubsub >}})
- 阅读 [API 参考文档]({{< ref pubsub_api.md >}})