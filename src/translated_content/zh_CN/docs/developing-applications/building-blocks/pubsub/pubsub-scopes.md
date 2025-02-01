---
type: docs
title: "限制 Pub/sub 主题访问"
linkTitle: "限制主题访问"
weight: 6000
description: "通过范围控制将 pub/sub 主题限制为特定应用程序"
---

## 介绍

[命名空间或组件范围]({{< ref component-scopes.md >}})可以用来限制组件的访问权限，使其仅对特定应用程序可用。这些应用程序范围的设置确保只有具有特定 ID 的应用程序才能使用该组件。

除了这种通用的组件范围外，还可以对 pub/sub 组件进行以下限制：
- 哪些主题可以被使用（发布或订阅）
- 哪些应用程序被允许发布到特定主题
- 哪些应用程序被允许订阅特定主题

这被称为 **pub/sub 主题范围控制**。

为每个 pub/sub 组件定义 pub/sub 范围。您可能有一个名为 `pubsub` 的 pub/sub 组件，它有一组范围，另一个 `pubsub2` 则有不同的范围。

要使用此主题范围，可以为 pub/sub 组件设置三个元数据属性：
- `spec.metadata.publishingScopes`
  - 一个以分号分隔的应用程序列表和以逗号分隔的主题列表，允许该应用程序发布到该主题列表
  - 如果在 `publishingScopes` 中未指定任何内容（默认行为），则所有应用程序都可以发布到所有主题
  - 要拒绝应用程序发布到任何主题的能力，请将主题列表留空（`app1=;app2=topic2`）
  - 例如，`app1=topic1;app2=topic2,topic3;app3=` 将允许 app1 仅发布到 topic1，app2 仅发布到 topic2 和 topic3，app3 则不能发布到任何主题。
- `spec.metadata.subscriptionScopes`
  - 一个以分号分隔的应用程序列表和以逗号分隔的主题列表，允许该应用程序订阅该主题列表
  - 如果在 `subscriptionScopes` 中未指定任何内容（默认行为），则所有应用程序都可以订阅所有主题
  - 例如，`app1=topic1;app2=topic2,topic3` 将允许 app1 仅订阅 topic1，app2 仅订阅 topic2 和 topic3
- `spec.metadata.allowedTopics`
  - 一个为所有应用程序允许的主题的逗号分隔列表。
  - 如果未设置 `allowedTopics`（默认行为），则所有主题都是有效的。如果存在，`subscriptionScopes` 和 `publishingScopes` 仍然生效。
  - `publishingScopes` 或 `subscriptionScopes` 可以与 `allowedTopics` 结合使用以添加细粒度限制
- `spec.metadata.protectedTopics`
  - 一个为所有应用程序保护的主题的逗号分隔列表。
  - 如果一个主题被标记为保护，则必须通过 `publishingScopes` 或 `subscriptionScopes` 明确授予应用程序发布或订阅权限才能发布/订阅该主题。

这些元数据属性可用于所有 pub/sub 组件。以下示例使用 Redis 作为 pub/sub 组件。

## 示例 1：限制主题访问

在某些情况下，限制哪些应用程序可以发布/订阅主题是有用的，例如当您有包含敏感信息的主题时，只有一部分应用程序被允许发布或订阅这些主题。

它也可以用于所有主题，以始终拥有一个“真实来源”，以了解哪些应用程序作为发布者/订阅者使用哪些主题。

以下是三个应用程序和三个主题的示例：
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

下表显示了哪些应用程序被允许发布到主题：

|      | topic1 | topic2 | topic3 |
|------|--------|--------|--------|
| app1 | ✅     |        |        |
| app2 |        | ✅     | ✅     |
| app3 |        |        |        |

下表显示了哪些应用程序被允许订阅主题：

|      | topic1 | topic2 | topic3 |
|------|--------|--------|--------|
| app1 | ✅     | ✅     | ✅     |
| app2 |        |        |        |
| app3 | ✅     |        |        |

> 注意：如果应用程序未列出（例如 subscriptionScopes 中的 app1），则允许其订阅所有主题。因为未使用 `allowedTopics`，且 app1 没有任何订阅范围，它也可以使用上面未列出的其他主题。

## 示例 2：限制允许的主题

如果 Dapr 应用程序向其发送消息，则会创建一个主题。在某些情况下，这种主题创建应该受到管理。例如：
- Dapr 应用程序在生成主题名称时的错误可能导致创建无限数量的主题
- 精简主题名称和总数，防止主题无限增长

在这些情况下可以使用 `allowedTopics`。

以下是三个允许的主题的示例：
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

所有应用程序都可以使用这些主题，但仅限于这些主题，不允许其他主题。

## 示例 3：结合 `allowedTopics` 和范围

有时您希望结合两者范围，从而仅拥有一组固定的允许主题，并指定对某些应用程序的范围。

以下是三个应用程序和两个主题的示例：
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

> 注意：第三个应用程序未列出，因为如果应用程序未在范围内指定，则允许其使用所有主题。

下表显示了哪个应用程序被允许发布到主题：

|      | A | B | C |
|------|---|---|---|
| app1 | ✅ |   |   |
| app2 | ✅ | ✅ |   |
| app3 | ✅ | ✅ |   |

下表显示了哪个应用程序被允许订阅主题：

|      | A | B | C |
|------|---|---|---|
| app1 |   |   |   |
| app2 | ✅ |   |   |
| app3 | ✅ | ✅ |   |

## 示例 4：将主题标记为保护

如果您的主题涉及敏感数据，则每个新应用程序必须在 `publishingScopes` 和 `subscriptionScopes` 中明确列出，以确保其无法读取或写入该主题。或者，您可以将主题指定为“保护”（使用 `protectedTopics`），并仅授予真正需要的特定应用程序访问权限。

以下是三个应用程序和三个主题的示例，其中两个主题是保护的：
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
  - name: protectedTopics
    value: "A,B"
  - name: publishingScopes
    value: "app1=A,B;app2=B"
  - name: subscriptionScopes
    value: "app1=A,B;app2=B"
```

在上面的示例中，主题 A 和 B 被标记为保护。因此，即使 `app3` 未列在 `publishingScopes` 或 `subscriptionScopes` 中，它也无法与这些主题交互。

下表显示了哪个应用程序被允许发布到主题：

|      | A | B | C |
|------|---|---|---|
| app1 | ✅ | ✅ |   |
| app2 |   | ✅ |   |
| app3 |   |   | ✅ |

下表显示了哪个应用程序被允许订阅主题：

|      | A | B | C |
|------|---|---|---|
| app1 | ✅ | ✅ |   |
| app2 |   | ✅ |   |
| app3 |   |   | ✅ |


## 演示

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/7VdWBBGcbHQ?start=513" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 下一步

- 学习[如何配置具有多个命名空间的 pub/sub 组件]({{< ref pubsub-namespaces.md >}})
- 了解[消息生存时间]({{< ref pubsub-message-ttl.md >}})
- [pub/sub 组件列表]({{< ref supported-pubsub >}})
- 阅读 [API 参考]({{< ref pubsub_api.md >}})