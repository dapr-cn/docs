---
type: docs
title: "State management overview"
linkTitle: "Secrets stores overview"
weight: 100
description: "Overview of the state management building block"
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
对于原生不支持ETags的存储引擎，要求相应的Dapr状态存储实现能够模拟ETags，并在处理状态时遵循Dapr状态管理API规范。 Because Dapr state store implementations are technically clients to the underlying data store, such simulation should be straightforward using the concurrency control mechanisms provided by the store.
{{% /alert %}}

Read the [API reference]({{< ref state_api.md >}}) to learn how to set concurrency options.

### Consistency

Dapr supports both **strong consistency** and **eventual consistency**, with eventual consistency as the default behavior.

When strong consistency is used, Dapr waits for all replicas (or designated quorums) to acknowledge before it acknowledges a write request. When strong consistency is used, Dapr waits for all replicas (or designated quorums) to acknowledge before it acknowledges a write request. When eventual consistency is used, Dapr returns as soon as the write request is accepted by the underlying data store, even if this is a single replica.

Read the [API reference]({{< ref state_api.md >}}) to learn how to set consistency options.

### Bulk operations

Dapr supports two types of bulk operations - **bulk** or **multi**. You can group several requests of the same type into a bulk (or a batch). Dapr submits requests in the bulk as individual requests to the underlying data store. In other words, bulk operations are not transactional. On the other hand, you can group requests of different types into a multi-operation, which is handled as an atomic transaction. You can group several requests of the same type into a bulk (or a batch). Dapr submits requests in the bulk as individual requests to the underlying data store. In other words, bulk operations are not transactional. On the other hand, you can group requests of different types into a multi-operation, which is handled as an atomic transaction.

Read the [API reference]({{< ref state_api.md >}}) to learn how use bulk and multi options.

### Actor state
Transactional state stores can be used to store actor state. To specify which state store to be used for actors, specify value of property `actorStateStore` as `true` in the metadata section of the state store component. Actors state is stored with a specific scheme in transactional state stores, which allows for consistent querying. Read the [API reference]({{< ref state_api.md >}}) to learn more about state stores for actors and the [actors API reference]({{< ref actors_api.md >}}) To specify which state store to be used for actors, specify value of property `actorStateStore` as `true` in the metadata section of the state store component. Actors state is stored with a specific scheme in transactional state stores, which allows for consistent querying. Read the [API reference]({{< ref state_api.md >}}) to learn more about state stores for actors and the [actors API reference]({{< ref actors_api.md >}})

### Query state store directly

Dapr saves and retrieves state values without any transformation. Dapr saves and retrieves state values without any transformation. You can query and aggregate state directly from the [underlying state store]({{< ref query-state-store >}}).

For example, to get all state keys associated with an application ID "myApp" in Redis, use:

```bash
KEYS "myApp*"
```

#### Querying actor state

If the data store supports SQL queries, you can query an actor's state using SQL queries. For example use: For example use:

```sql
SELECT * FROM StateTable WHERE Id='<app-id>||<actor-type>||<actor-id>||<key>'
```

You can also perform aggregate queries across actor instances, avoiding the common turn-based concurrency limitations of actor frameworks. For example, to calculate the average temperature of all thermometer actors, use: For example, to calculate the average temperature of all thermometer actors, use:

```sql
SELECT AVG(value) FROM StateTable WHERE Id LIKE '<app-id>||<thermometer>||*||temperature'
```

{{% alert title="Note on direct queries" color="primary" %}}
Direct queries of the state store are not governed by Dapr concurrency control, since you are not calling through the Dapr runtime. What you see are snapshots of committed data which are acceptable for read-only queries across multiple actors, however writes should be done via the Dapr state management or actors APIs. What you see are snapshots of committed data which are acceptable for read-only queries across multiple actors, however writes should be done via the Dapr state management or actors APIs.
{{% /alert %}}

### State management API

The API for state management can be found in the [state management API reference]({{< ref state_api.md >}}) which describes how to retrieve, save and delete state values by providing keys.

## 下一步
* Follow these guides on:
    * [How-To: Save and get state]({{< ref howto-get-save-state.md >}})
    * [How-To: Build a stateful service]({{< ref howto-stateful-service.md >}})
    * [How-To: Share state between applications]({{< ref howto-share-state.md >}})
* Try out the [hello world quickstart](https://github.com/dapr/quickstarts/blob/master/hello-world/README.md) which shows how to use state management or try the samples in the [Dapr SDKs]({{< ref sdks >}})
* List of [state store components]({{< ref supported-state-stores.md >}})
* Read the [state management API reference]({{< ref state_api.md >}})
* Read the [actors API reference]({{< ref actors_api.md >}})
