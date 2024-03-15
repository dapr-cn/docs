---
type: docs
title: 状态管理概览
linkTitle: 概述
weight: 100
description: 状态管理 API 构建块概述
---

你的应用程序可以使用Dapr的状态管理API，在[supported state stores]({{< ref supported-state-stores.md >}})中保存、读取和查询键/值对。 使用状态存储组件，您可以构建有状态的、长期运行的应用程序，保存和检索它们的状态（如购物车或游戏的会话状态）。 例如，在下图中：

- 使用**HTTP POST**来保存或查询键/值对。
- 使用**HTTP GET**来读取特定的键并返回其值。

<img src="/images/state-management-overview.png" width=1000 style="padding-bottom:25px;">

[以下概述视频和演示](https://www.youtube.com/live/0y7ne6teHT4?si=2_xX6mkU3UCy2Plr\&t=6607)演示了Dapr状态管理是如何工作的。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/0y7ne6teHT4?si=2_xX6mkU3UCy2Plr&amp;start=6607" title="YouTube video player" style="padding-bottom:25px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 特性

使用状态管理 API 构建块，您的应用程序可以利用一些通常很复杂且容易出错的功能，包括:

- 设置并发控制和数据一致性选项。
- 执行批量更新操作 [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete)，包括多个事务操作。
- 查询和过滤键/值数据。

以下是作为状态管理 API 的一部分提供的功能：

### 可插拔状态存储

Dapr数据存储被建模为组件，可以在不修改你的服务代码的情况下进行替换。 查看[支持的状态存储]({{< ref supported-state-stores >}})以查看列表。

### 可配置的状态存储行为

使用Dapr，您可以在状态操作请求中包含附加的元数据，用以描述您期望如何处理该请求。 你可以附加以下：

- 并发要求
- 一致性要求

默认情况下，您的应用程序应该假设数据存储是**最终一致的**，并使用**last-write-wins并发模式**。

[并非所有的存储都是相等的]({{< ref supported-state-stores.md >}}). 为了保证应用程序的可移植性，你可以了解下存储引擎的功能，使你的代码适应不同的存储引擎。

#### 并发

Dapr支持使用ETags的乐观并发控制（OCC）。 当请求状态值时，Dapr始终会将一个ETag属性附加到返回的状态中。 当用户代码:

- **更新状态**，预计通过请求体附加ETag。
- **删除状态**，预计通过`If-Match`头部附加ETag。

当提供的ETag与状态存储中的ETag匹配时，`write`操作成功。

##### 为什么Dapr选择乐观并发控制（OCC）

在许多应用中，数据更新冲突很少发生，因为客户端是按业务上下文自然分割的，可以对不同的数据进行操作。 然而，如果您的应用程序选择使用ETags，不匹配的ETags可能会导致请求被拒绝。 建议你在代码中使用重试策略来补偿在使用ETags时发生的冲突。

如果您的应用程序在书面请求中省略了ETags，Dapr会在处理请求时跳过ETags校验。 这可以实现**last-write-wins**模式，与ETags的**first-write-wins**模式相比。

{{% alert title="关于ETags的说明" color="primary" %}}
对于原生不支持ETags的存储引擎，要求相应的Dapr状态存储实现能够模拟ETags，并在处理状态时遵循Dapr状态管理API规范。 由于Dapr状态存储实现在技术上是底层数据存储引擎的客户端，因此这种模拟应该直接使用存储引擎提供的并发控制机制。
{{% /alert %}}

阅读[API参考]({{< ref state_api.md >}})，了解如何设置并发选项。

#### 一致性

Dapr同时支持**强一致性**和**最终一致性**，其中最终一致性为默认行为。

- **强一致性**：Dapr 在确认写入请求之前，会等待所有副本（或指定的quorums）进行确认。
- **最终一致性**：当最终一致性被使用时，Dapr会在基本数据存储接受写入请求后立即返回，即使这是单个副本。

阅读[API参考]({{< ref state_api.md >}})，了解如何设置一致性选项。

### 设置 content type

状态存储组件可能根据内容类型以不同方式维护和操作数据。 Dapr支持将内容类型作为请求元数据的一部分传递给[state management API](#state-management-api)。

设置内容类型是_可选的_，组件决定是否使用它。 Dapr 只提供将此信息传递给组件的手段。

- **通过HTTP API**：通过URL查询参数`metadata.contentType`设置内容类型。 例如，`http://localhost:3500/v1.0/state/store?metadata.contentType=application/json`。
- **使用 gRPC API**：通过向请求元数据中添加键/值对 `"contentType" : <content type>` 来设置内容类型。

### 多个操作

Dapr支持两种类型的多读或多写操作：**bulk**或**transactional**。 阅读[API参考]({{< ref state_api.md >}})以了解如何使用批量和多选项。

#### 批量读取操作

您可以将多个读请求分组成一个批量操作。 在批量操作中，Dapr 将读取请求作为单独的请求提交给底层数据存储，并将它们作为单个结果返回。

#### 事务性操作

您可以将写入、更新和删除操作分组到一个请求中，然后作为一个原子事务处理。 请求将作为一组事务操作成功或失败。

### Actor 状态

事务性状态存储可用于存储 Actor 状态。 要指定用于actors的状态存储，请在状态存储组件的元数据部分中将属性`actorStateStore`的值指定为`true`。 Actors 的状态以特定的方案存储在事务性状态存储区中，以便进行一致的查询。 只有一个单一的状态存储组件可以被用作所有角色的状态存储。 阅读[state API 参考]({{< ref state_api.md >}})和[actors API 参考]({{< ref actors_api.md >}})以了解有关 Actors 状态存储的更多信息。

#### Actor状态的生存时间（TTL）

您应始终设置 TTL 元数据字段（`ttlInSeconds`），或在保存 actor 状态时使用您选择的 SDK 中的等效 API 调用，以确保状态最终被移除。 阅读[Actors概述]({{< ref actors-overview\.md >}})以获取更多信息。

### 状态加密

Dapr 支持客户端对应用程序状态的自动加密，并支持密钥轮换。 这在所有 Dapr 状态存储上都受支持。 有关详细信息，请阅读 [操作方法：加密应用程序状态]({{< ref howto-encrypt-state.md >}}) 主题。

### 应用程序之间的共享状态

在共享状态时，不同的应用程序的需求各不相同。 在一个场景中，您可能想要封装某个应用程序中的所有状态，并让 Dapr 管理您的访问权限。 在另一种情况下，您可能希望两个在相同状态下工作的应用程序能够获得和保存相同的键值。

Dapr 可以使状态成为:

- 隔离到一个应用程序。
- 在应用程序之间的状态存储中共享。
- 在不同状态存储之间共享，供多个应用程序使用。

有关更多详细信息，请阅读[操作方法：在应用程序之间共享状态]({{< ref howto-share-state.md >}})，

### 启用发件箱模式

Dapr使开发人员能够使用outbox模式，在事务性状态存储和任何消息代理之间实现单个事务。 要获取更多信息，请阅读 [如何启用事务性发件箱消息]({{< ref howto-outbox.md >}})

### 查询状态

有两种方法来查询状态。

- 使用 Dapr 运行时提供的 状态管理查询API 。
- 直接使用存储的本机 SDK 查询状态存储。

#### 查询API

使用 _可选的_ 状态管理[查询API]({{< ref "reference/api/state_api.md#query-state" >}})，您可以查询保存在状态存储中的键/值数据，而不考虑基础数据库或存储技术。 使用状态管理查询API，你可以对键/值数据进行过滤、排序和分页。 有关更多详细信息，请阅读[操作方法：查询状态]({{< ref howto-state-query-api.md >}})。

#### 直接查询状态存储

Dapr保存和检索状态值，而不进行任何转换。 您可以直接从[基础状态存储]({{< ref query-state-store >}})}中查询并聚合状态。
例如，要在 Redis 中获取与 app ID“myApp”相关的所有状态 key，可以使用:

```bash
KEYS "myApp*"
```

{{% alert title="关于直接查询的注意事项" color="primary" %}}
由于您没有通过 Dapr 运行时调用，因此对状态存储的直接查询不受 Dapr 并发控制的约束。 您看到的是跨多个 actor 的只读查询中可接受的已提交数据的快照。 写入应通过 Dapr 状态管理或 actors API 完成。
{{% /alert %}}

##### 查询 Actor 状态

如果数据存储支持 SQL 查询，您可以使用 SQL 查询 Actor 的状态。 例如：

```sql
SELECT * FROM StateTable WHERE Id='<app-id>||<actor-type>||<actor-id>||<key>'
```

您还可以通过执行跨 actor 实例的聚合查询来避免 actor 框架的常见的基于轮询的并发限制。 例如，要计算所有温度计Actor的平均温度，使用:

```sql
SELECT AVG(value) FROM StateTable WHERE Id LIKE '<app-id>||<thermometer>||*||temperature'
```

### 状态生存时间（TTL）

Dapr 允许[对每个状态设置请求的生存时间(TTL)]({{< ref state-store-ttl.md >}})。 这意味着应用程序可以为每个存储的状态设置生存时间，并且在过期后无法检索这些状态。

### 状态管理 API

状态管理API可以在[state management API reference]({{< ref state_api.md >}})中找到，它描述了如何通过提供键来检索、保存、删除和查询状态值。

## 试用状态管理

### 快速启动和教程

想测试一下 Dapr 状态管理 API 吗？ 浏览以下快速入门和教程以查看状态管理的实际应用：

| 快速入门/教程                                                                                                                      | 说明                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [状态管理快速入门]({{< ref statemanagement-quickstart.md >}}) | 使用状态管理 API 创建有状态应用程序。                                                                           |
| [Hello world 教程](https://github.com/dapr/quickstarts/blob/master/tutorials/hello-world/README.md)                            | _推荐_ <br> 演示如何在本地运行 Dapr。 重点介绍服务调用和状态管理。                                                        |
| [你好，世界 Kubernetes](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)                               | _推荐_ <br> 演示如何在 Kubernetes 中运行 Dapr。 重点介绍服务调用和_状态管理_。 |

### 直接在应用中开始使用状态管理

想跳过快速入门？ Not a problem. 您可以直接在应用程序中尝试状态管理构建块。 安装[Dapr]({{< ref "getting-started/_index.md" >}})之后，您可以开始使用状态管理 API，从[状态管理操作方法指南]({{< ref howto-get-save-state.md >}})开始。

## 下一步

- 开始阅读状态管理操作方法指南，从以下开始:
  - [操作方法：保存和获取状态]({{< ref howto-get-save-state.md >}})
  - [操作方法：构建一个有状态的服务]({{< ref howto-stateful-service.md >}})
- 查看[状态存储组件]({{< ref supported-state-stores.md >}})的列表
- 阅读[state management API参考文档]({{< ref state_api.md >}})
- 阅读[演员 API 参考]({{< ref actors_api.md >}})
