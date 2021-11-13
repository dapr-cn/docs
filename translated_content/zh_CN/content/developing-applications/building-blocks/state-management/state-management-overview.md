---
type: docs
title: "状态管理概览"
linkTitle: "概述"
weight: 100
description: "状态管理构建块概览"
---

## 介绍

通过状态管理构件，你的应用程序可以将数据存储为 [支持的状态存储引擎]({{< ref supported-state-stores.md >}})中的键/值对。

当使用状态管理时，你的应用程序可以利用一些自己构建会很复杂，容易出错的功能，比如:

- 分布式并发和数据一致性
- 批量[CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) 操作

你的应用程序可以使用Dapr的状态管理API，使用状态存储组件保存和读取键/值对，如下图所示。 例如，通过使用HTTP POST可以保存键/值对，通过使用HTTP GET可以读取一个键并返回它的值。

<img src="/images/state-management-overview.png" width=900>


## 特性

### 可插拔状态存储

Dapr数据存储被建模为组件，可以在不修改你的服务代码的情况下进行替换。 请访问 [支持的状态存储引擎]({{< ref supported-state-stores >}})页面查看完整列表。

### 可配置的状态存储行为

Dapr允许开发人员在对于状态的操作请求中附加额外的元数据，这些元数据用以描述期望如何处理该请求。 你可以附加以下：
- 并发要求
- 一致性要求

默认情况下，您的应用程序应该假设数据存储是**最终一致**的，并使用**last-write-wins**并发模式。

[并非所有的存储引擎都一样]({{< ref supported-state-stores.md >}})。 为了保证应用程序的可移植性，你可以了解下存储引擎的功能，使你的代码适应不同的存储引擎。

### 并发（Concurrency）

Dapr支持使用ETags的乐观并发控制（OCC）。 当一个发送请求操作状态时，Dapr会给返回的状态附加一个ETag属性。 当用户代码试图更新或删除一个状态时，它应该通过更新的请求体或删除的`If-Match`头附加ETag。 只有当提供的ETag与状态存储中的ETag匹配时，写操作才能成功。

Dapr之所以选择OCC，是因为在不少应用中，数据更新冲突都是很少的，因为客户端是按业务上下文自然分割的，可以对不同的数据进行操作。 然而，如果你的应用选择使用ETags，请求可能会因为不匹配的ETags而被拒绝。 建议你在使用ETags时，使用重试策略来补偿这种冲突。

如果您的应用程序在书面请求中省略了ETags，Dapr会在处理请求时跳过ETags校验。 这与ETags的**last-write-wins**模式相比，基本上可以实现**first-write-wins**模式。

{{% alert title="Note on ETags" color="primary" %}}
对于原生不支持ETags的存储引擎，要求相应的Dapr状态存储实现能够模拟ETags，并在处理状态时遵循Dapr状态管理API规范。 由于Dapr状态存储实现在技术上是底层数据存储引擎的客户端，所以这种模拟应该直接使用存储引擎提供的并发控制机制。
{{% /alert %}}

阅读[API参考]({{< ref state_api.md >}})，了解如何设置并发选项。

### 一致性

Dapr同时支持**强一致性**和**最终一致性**，其中最终一致性为默认行为。

当使用强一致性时，Dapr会等待所有副本（或指定的quorums）确认后才会确认写入请求。 当最终使用一致性时，Dapr 将在基本数据存储接受写入请求后立即返回，即使这是单个副本。

阅读[API参考]({{< ref state_api.md >}})，了解如何设置一致性选项。

### 批量操作

Dapr 支持两种类型的批量操作 - **bulk** 或 **multi**。 您可以将几个相同类型的请求分组成批量(或批次)。 Dapr将请求作为单个请求批量提交给基础数据存储。 换句话说，批量（bulk）操作不是事务性的。 另一方面，您可以将不同类型的请求分组为多操作，作为原子事务处理。

阅读 [API 参考]({{< ref state_api.md >}}) 以了解如何使用批量（bulk）选项和批次（multi）选项。

### Actor 状态
事务性状态存储可用于存储 Actor 状态。 指定 Actor 要使用哪个状态存储， 在状态存储组件的元数据部分中指定属性 `actorStateStore` as `true` Actor 状态与事务状态库中的具体计划一起储存，这样可以进行一致的查询。 Actor 状态与事务状态库中的具体计划一起储存，这样可以进行一致的查询。 阅读 [API 参考]({{< ref state_api.md >}}) 以了解更多关于 Actor 中的状态存储 和 [Actor API 参考]({{< ref actors_api.md >}})

### 直接查询状态存储

Dapr保存和检索状态值，而不进行任何转换。 您可以直接从 [基础状态存储]({{< ref query-state-store >}}) 中查询并聚合状态。

例如，要在 Redis 中获取与 app ID“myApp”相关的所有状态 key，可以使用:

```bash
KEYS "myApp*"
```

#### 查询 Actor 状态

如果数据存储支持 SQL 查询，您可以使用 SQL 查询 Actor 的状态。 例如使用：

```sql
SELECT * FROM StateTable WHERE Id='<app-id>||<actor-type>||<actor-id>||<key>'
```

您还可以跨 Actor 实例执行聚合查询，避免 Actor 框架常见的基于回合的并发性限制。 例如，要计算所有温度计Actor的平均温度，使用:

```sql
SELECT AVG(value) FROM StateTable WHERE Id LIKE '<app-id>||<thermometer>||*||temperature'
```

{{% alert title="Note on direct queries" color="primary" %}}
对状态存储的直接查询不受 Dapr 并发控制，毕竟您没有通过 Dapr 运行时调用。 您看到的是提交数据的快照，对于跨多个 Actor 的只读查询是可以接受的，当然写操作应该通过 Dapr 状态管理或 Actor api 来执行。
{{% /alert %}}

### 状态管理 API

状态管理API可以在 [状态管理 API 参考]({{< ref state_api.md >}}) 中找到。它描述了如何根据 key 来查询、保存和删除状态。

## 下一步
* 遵循这些指南：
    * [指南：保存和获取状态]({{< ref howto-get-save-state.md >}})
    * [指南：创建一个有状态的服务]({{< ref howto-stateful-service.md >}})
    * [指南：如何在应用程序之间共享状态]({{< ref howto-share-state.md >}})
* 试试 [hello world 快速入门](https://github.com/dapr/quickstarts/blob/master/hello-world/README.md) ，它会显示如何使用状态管理或试试 [Dapr SDK]({{< ref sdks >}}) 中的 Sample。
* [状态存储组件]({{< ref supported-state-stores.md >}}) 列表
* 阅读 [状态管理 API 引用]({{< ref state_api.md >}})
* 阅读 [Actor API 引用]({{< ref actors_api.md >}})
