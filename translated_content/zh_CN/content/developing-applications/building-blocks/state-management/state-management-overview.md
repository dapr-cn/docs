---
type: docs
title: "状态管理概览"
linkTitle: "概述"
weight: 100
description: "状态管理 API 构建块概述"
---

## 介绍

使用状态管理，应用程序可以在[支持的状态存储]({{< ref supported-state-stores.md >}})中以键/值的形式存储和查询数据。 这使您能够建立有状态的、长期运行的应用程序，可以保存和检索其状态，例如购物车或游戏的会话状态。

当使用状态管理时，你的应用程序可以利用一些功能，否则自己构建这些功能会很复杂且容易出错，例如：

- 设置并发控制和数据一致性选项。
- 执行批量更新操作 [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) 包括多个事务性操作。
- 查询和过滤键/值数据。

你的应用程序可以使用 Dapr 的状态管理 API，通过状态存储组件保存、读取和查询键/值对，如下图所示。 例如，通过使用 HTTP POST，你可以保存或查询键/值对，而通过使用 HTTP GET，你可以读取特定的键并返回其值。

<img src="/images/state-management-overview.png" width=1000>

## 特性
以下是作为状态管理 API 的一部分提供的功能：

### 可插拔状态存储
Dapr数据存储被建模为组件，可以在不修改你的服务代码的情况下进行替换。 请访问 [支持的状态存储引擎]({{< ref supported-state-stores >}})页面查看完整列表。

### 可配置的状态存储行为
Dapr 允许在对于状态的操作请求中附加额外的元数据，这些元数据用以描述应如何处理该请求。 你可以附加以下：
- 并发要求
- 一致性要求

默认情况下，您的应用程序应该假设数据存储是**最终一致**的，并使用**last-write-wins**并发模式。

[并非所有的存储引擎都一样]({{< ref supported-state-stores.md >}})。 为了保证应用程序的可移植性，可以了解存储引擎的元数据能力，使代码适应不同的存储能力。

### 并发（Concurrency）
Dapr 支持使用 ETags 的乐观并发控制（Optimistic Concurrency Control/OCC）。 当请求状态值时，Dapr 总是给返回的状态附加一个 ETag 属性。 当用户代码试图更新或删除一个状态时，它应该通过更新的请求体或删除的`If-Match`头附加ETag。 只有当提供的ETag与状态存储中的ETag匹配时，写操作才能成功。

Dapr之所以选择OCC，是因为在不少应用中，数据更新冲突都是很少的，因为客户端是按业务上下文自然分割的，可以对不同的数据进行操作。 然而，如果你的应用选择使用ETags，请求可能会因为不匹配的ETags而被拒绝。 建议你在代码中使用重试策略来弥补使用 ETag 时的这种冲突。

如果您的应用程序在书面请求中省略了ETags，Dapr会在处理请求时跳过ETags校验。 这与ETags的**last-write-wins**模式相比，基本上可以实现**first-write-wins**模式。

{{% alert title="ETag 注意事项" color="primary" %}}
对于原生不支持ETags的存储引擎，要求相应的Dapr状态存储实现能够模拟ETags，并在处理状态时遵循Dapr状态管理API规范。 由于Dapr状态存储实现在技术上是底层数据存储引擎的客户端，所以这种模拟应该直接使用存储引擎提供的并发控制机制。
{{% /alert %}}

阅读[API参考]({{< ref state_api.md >}})，了解如何设置并发选项。

### 一致性
Dapr supports both **strong consistency** and **eventual consistency**, with eventual consistency as the default behavior.

When strong consistency is used, Dapr waits for all replicas (or designated quorums) to acknowledge before it acknowledges a write request. When eventual consistency is used, Dapr returns as soon as the write request is accepted by the underlying data store, even if this is a single replica.

Read the [API reference]({{< ref state_api.md >}}) to learn how to set consistency options.

### 批量操作

Dapr 支持两种类型的批量操作 - **bulk** 或 **multi**。 You can group several requests of the same type into a bulk (or a batch). Dapr将批量操作的请求作为单个请求提交给底层数据存储。 In other words, bulk operations are not transactional. 另一方面，您可以将不同类型的请求分组为多操作，作为原子事务处理。

Read the [API reference]({{< ref state_api.md >}}) to learn how use bulk and multi options.

### 状态加密
Dapr支持客户端对应用程序状态的自动加密，并支持密钥轮换。 这在所有 Dapr 状态存储上都受支持。 有关详细信息，请阅读 [操作方法：加密应用程序状态]({{< ref howto-encrypt-state.md >}}) 主题。

### 应用程序之间的共享状态
在共享状态方面，不同的应用程序可能有不同的需求。 例如，在一个场景中，您可能想要封装某个应用程序中的所有状态，并让 Dapr 管理您的访问权限。 在不同的场景中，您可能需要两个在相同状态下工作的应用程序能够获得和保存相同的键值(keys)。 Dapr使状态能够被隔离到一个应用程序，在应用程序之间的状态存储中共享，或者让多个应用程序在不同的状态存储中共享状态。 有关更多详细信息，请阅读 [操作方法：在应用程序之间共享状态]({{< ref howto-share-state.md >}})

### Actor state
Transactional state stores can be used to store actor state. To specify which state store to be used for actors, specify value of property `actorStateStore` as `true` in the metadata section of the state store component. Actors state is stored with a specific scheme in transactional state stores, which allows for consistent querying. 只有一个单一的状态存储组件可以被用作所有角色的状态存储。 Read the [API reference]({{< ref state_api.md >}}) to learn more about state stores for actors and the [actors API reference]({{< ref actors_api.md >}})

### 查询状态
有两种方法来查询状态。
 * 使用Dapr运行时提供的 [状态管理查询API]({{< ref "#state-query-api" >}}) 。
 * 直接查询状态存储 []({{< ref "#query-state-store-directly" >}}) 用存储的原生SDK查询。

#### 查询API
查询API提供了一种查询在状态存储中使用状态管理保存的键/值数据的方法，而不考虑底层数据库或存储技术。 它是一个可选的状态管理API。 使用状态管理查询API，你可以对键/值数据进行过滤、排序和分页。 有关更多详细信息，请阅读 [操作方法：查询状态]({{< ref howto-state-query-api.md >}})。

#### 直接查询状态存储
Dapr saves and retrieves state values without any transformation. You can query and aggregate state directly from the [underlying state store]({{< ref query-state-store >}}). For example, to get all state keys associated with an application ID "myApp" in Redis, use:

```bash
KEYS "myApp*"
```

{{% alert title="Note on direct queries" color="primary" %}}
Direct queries of the state store are not governed by Dapr concurrency control, since you are not calling through the Dapr runtime. What you see are snapshots of committed data which are acceptable for read-only queries across multiple actors, however writes should be done via the Dapr state management or actors APIs.
{{% /alert %}}

##### 查询 Actor 状态
If the data store supports SQL queries, you can query an actor's state using SQL queries. For example use:

```sql
SELECT * FROM StateTable WHERE Id='<app-id>||<actor-type>||<actor-id>||<key>'
```

You can also perform aggregate queries across actor instances, avoiding the common turn-based concurrency limitations of actor frameworks. For example, to calculate the average temperature of all thermometer actors, use:

```sql
SELECT AVG(value) FROM StateTable WHERE Id LIKE '<app-id>||<thermometer>||*||temperature'
```

### 状态生存时间（TTL）。
Dapr 允许对每个消息设置生存时间(TTL)。 这意味着应用程序可以为每个存储的状态设置生存时间，并且在过期后无法检索这些状态。

### 状态管理 API
状态管理API可以在 [状态管理API参考]({{< ref state_api.md >}}) 中找到，它描述了如何通过提供键来检索、保存、删除和查询状态值。

## 下一步
* 遵循这些指南：
    * [指南：保存和获取状态]({{< ref howto-get-save-state.md >}})
    * [指南：创建一个有状态的服务]({{< ref howto-stateful-service.md >}})
    * [指南：如何在应用程序之间共享状态]({{< ref howto-share-state.md >}})
    * [指南：查询状态]({{< ref howto-state-query-api.md >}})
    * [指南：加密应用程序状态]({{< ref howto-encrypt-state.md >}})
    * [状态生存时间]({{< ref state-store-ttl.md >}})
* Try out the [hello world quickstart](https://github.com/dapr/quickstarts/blob/master/tutorials/hello-world/README.md) which shows how to use state management or try the samples in the [Dapr SDKs]({{< ref sdks >}})
* [状态存储组件]({{< ref supported-state-stores.md >}}) 列表
* 阅读 [状态管理 API 引用]({{< ref state_api.md >}})
* 阅读 [Actor API 引用]({{< ref actors_api.md >}})
