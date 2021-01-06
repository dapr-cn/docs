---
type: docs
title: "限定 Pub/Sub 主题访问权限"
linkTitle: "Scope topic access"
weight: 5000
description: "使用范围（scopes）限制 Pub/Sub 主题到特定的应用程序"
---

## 简介

[名称空间或组件 scopes]({{< ref component-scopes.md >}}) 可用于限制对特定应用程序的组件访问。 添加到组件的这些应用程序作用域仅限制具有特定 ID 的应用程序才能使用该组件。

除了此常规组件范围外，对于 pub/sub 组件，还可以限制以下操作：
- 哪些主题可以使用(发布或订阅)
- 哪些应用程序被允许发布到特定主题
- 哪些应用程序被允许订阅特定主题

这称为 **pub/sub 主题作用域限定**。

为每个 pub/sub 组件定义发布/订阅范围。  您可能有一个名为 `pubsub` 的 pub/sub 组件，它有一组范围设置，另一个 `pubsub2` 另有一组范围设置。

要使用这个主题范围，可以设置一个 pub/sub 组件的三个元数据属性：
- `spec.metadata.publishingScopes`
  - 分号分隔应用程序列表& 逗号分隔的主题列表表示允许该 app 发布信息到主题列表
  - 如果在 `publishingScopes` (缺省行为) 中未指定任何内容，那么所有应用程序可以发布到所有主题
  - 要拒绝应用程序发布信息到任何主题，请将主题列表留空 (`app1=;app2=topic2`)
  - For example, `app1=topic1;app2=topic2,topic3;app3=` will allow app1 to publish to topic1 and nothing else, app2 to publish to topic2 and topic3 only, and app3 to publish to nothing.
- `spec.metadata.subscriptionScopes`
  - A semicolon-separated list of applications & comma-separated topic lists, allowing that app to subscribe to that list of topics
  - If nothing is specified in `subscriptionScopes` (default behavior), all apps can subscribe to all topics
  - For example, `app1=topic1;app2=topic2,topic3` will allow app1 to subscribe to topic1 only and app2 to subscribe to topic2 and topic3
- `spec.metadata.allowedTopics`
  - A comma-separated list of allowed topics for all applications.
  - If `allowedTopics` is not set (default behavior), all topics are valid. `subscriptionScopes` and `publishingScopes` still take place if present.
  - `publishingScopes` or `subscriptionScopes` can be used in conjuction with `allowedTopics` to add granular limitations

These metadata properties can be used for all pub/sub components. The following examples use Redis as pub/sub component.

## Example 1: Scope topic access

Limiting which applications can publish/subscribe to topics can be useful if you have topics which contain sensitive information and only a subset of your applications are allowed to publish or subscribe to these.

It can also be used for all topics to have always a "ground truth" for which applications are using which topics as publishers/subscribers.

Here is an example of three applications and three topics:
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

The table below shows which applications are allowed to publish into the topics:

|      | topic1 | topic2 | topic3 |
| ---- | ------ | ------ | ------ |
| app1 | X      |        |        |
| app2 |        | X      | X      |
| app3 |        |        |        |

The table below shows which applications are allowed to subscribe to the topics:

|      | topic1 | topic2 | topic3 |
| ---- | ------ | ------ | ------ |
| app1 | X      | X      | X      |
| app2 |        |        |        |
| app3 | X      |        |        |

> Note: If an application is not listed (e.g. app1 in subscriptionScopes) it is allowed to subscribe to all topics. Because `allowedTopics` is not used and app1 does not have any subscription scopes, it can also use additional topics not listed above.

## Example 2: Limit allowed topics

A topic is created if a Dapr application sends a message to it. In some scenarios this topic creation should be governed. For example:
- A bug in a Dapr application on generating the topic name can lead to an unlimited amount of topics created
- Streamline the topics names and total count and prevent an unlimited growth of topics

In these situations `allowedTopics` can be used.

Here is an example of three allowed topics:
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

All applications can use these topics, but only those topics, no others are allowed.

## Example 3: Combine `allowedTopics` and scopes

Sometimes you want to combine both scopes, thus only having a fixed set of allowed topics and specify scoping to certain applications.

Here is an example of three applications and two topics:
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

> Note: The third application is not listed, because if an app is not specified inside the scopes, it is allowed to use all topics.

The table below shows which application is allowed to publish into the topics:

|      | A | B | C |
| ---- | - | - | - |
| app1 | X |   |   |
| app2 | X | X |   |
| app3 | X | X |   |

The table below shows which application is allowed to subscribe to the topics:

|      | A | B | C |
| ---- | - | - | - |
| app1 |   |   |   |
| app2 | X |   |   |
| app3 | X | X |   |


## Demo <iframe width="560" height="315" src="https://www.youtube.com/embed/7VdWBBGcbHQ?start=513" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen mark="crwd-mark"></iframe>