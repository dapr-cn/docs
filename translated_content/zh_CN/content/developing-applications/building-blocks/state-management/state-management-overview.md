---
type: docs
title: "状态管理概览"
linkTitle: "概述"
weight: 100
description: "状态管理构建块概览"
---

## 介绍

Using state management, your application can store and query data as key/value pairs in the [supported state stores]({{< ref supported-state-stores.md >}}). This enables you to build stateful, long running applications that can save and retrieve their state, for example a shopping cart or a game's session state.

When using state management, your application can leverage features that would otherwise be complicated and error-prone to build yourself such as:

- Setting the choices on concurrency control and data consistency.
- Performing bulk update operations [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) including multiple transactional operations.
- Querying and filtering the key/value data.

Your application can use Dapr's state management API to save, read and query key/value pairs using a state store component, as shown in the diagram below. For example, by using HTTP POST you can save or query key/value pairs and by using HTTP GET you can read a specific key and have its value returned.

<img src="/images/state-management-overview.png" width=900>

## 特性
These are the features available as part of the state management API:

### 可插拔状态存储
Dapr数据存储被建模为组件，可以在不修改你的服务代码的情况下进行替换。 请访问 [支持的状态存储引擎]({{< ref supported-state-stores >}})页面查看完整列表。

### Configurable state store behaviors
Dapr allows you to include additional metadata in a state operation request that describes how the request is expected to be handled. 你可以附加以下：
- 并发要求
- 一致性要求

默认情况下，您的应用程序应该假设数据存储是**最终一致**的，并使用**last-write-wins**并发模式。

[并非所有的存储引擎都一样]({{< ref supported-state-stores.md >}})。 To ensure portability of your application you can query the metadata capabilities of the store and make your code adaptive to different store capabilities.

### 并发（Concurrency）
Dapr supports Optimistic Concurrency Control (OCC) using ETags. When a state value is requested, Dapr always attaches an ETag property to the returned state. 当用户代码试图更新或删除一个状态时，它应该通过更新的请求体或删除的`If-Match`头附加ETag。 只有当提供的ETag与状态存储中的ETag匹配时，写操作才能成功。

Dapr之所以选择OCC，是因为在不少应用中，数据更新冲突都是很少的，因为客户端是按业务上下文自然分割的，可以对不同的数据进行操作。 然而，如果你的应用选择使用ETags，请求可能会因为不匹配的ETags而被拒绝。 It's recommended that you use a retry policy in your code to compensate for such conflicts when using ETags.

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

Dapr supports two types of bulk operations: **bulk** or **multi**. 您可以将几个相同类型的请求分组成批量(或批次)。 Dapr submits requests in bulk operations as individual requests to the underlying data store. 换句话说，批量（bulk）操作不是事务性的。 On the other hand, you can group requests of different types into a multi-operation, which is then handled as an atomic transaction.

阅读 [API 参考]({{< ref state_api.md >}}) 以了解如何使用批量（bulk）选项和批次（multi）选项。

### State encryption
Dapr supports automatic client encryption of application state with support for key rotations. This is supported on all Dapr state stores. For more info, read the [How-To: Encrypt application state]({{< ref howto-encrypt-state.md >}}) topic.

### Shared state between applications
Different applications might have different needs when it comes to sharing state. 例如，在一个场景中，您可能想要封装某个应用程序中的所有状态，并让 Dapr 管理您的访问权限。 在不同的场景中，您可能需要两个在相同状态下工作的应用程序能够获得和保存相同的键值(keys)。 Dapr enable states to be isolated to an application, shared in a state store between applications or have multiple applications share state across different state stores. For more details read [How-To: Share state between applications]({{< ref howto-share-state.md >}}),

### Actor 状态
事务性状态存储可用于存储 Actor 状态。 指定 Actor 要使用哪个状态存储， 在状态存储组件的元数据部分中指定属性 `actorStateStore` as `true` Actor 状态与事务状态库中的具体计划一起储存，这样可以进行一致的查询。 Actor 状态与事务状态库中的具体计划一起储存，这样可以进行一致的查询。 Only a single state store component can be used as the state store for all actors. 阅读 [API 参考]({{< ref state_api.md >}}) 以了解更多关于 Actor 中的状态存储 和 [Actor API 参考]({{< ref actors_api.md >}})

### Querying state
There are two ways to query the state:
 * Using the [state management query API]({{< ref "#state-query-api" >}}) provided in Dapr runtime.
 * Querying state store [directly]({{< ref "#query-state-store-directly" >}}) with the store's native SDK.

#### Query API
The query API provides a way of querying the key/value data saved using state management in state stores regardless of underlying database or storage technology. It is an optional state management API. Using the state management query API you can filter, sort and paginate the key/value data. For more details read [How-To: Query state]({{< ref howto-state-query-api.md >}}).

#### Querying state store directly
Dapr保存和检索状态值，而不进行任何转换。 您可以直接从 [基础状态存储]({{< ref query-state-store >}}) 中查询并聚合状态。 例如，要在 Redis 中获取与 app ID“myApp”相关的所有状态 key，可以使用:

```bash
KEYS "myApp*"
```

{{% alert title="Note on direct queries" color="primary" %}}
对状态存储的直接查询不受 Dapr 并发控制，毕竟您没有通过 Dapr 运行时调用。 您看到的是提交数据的快照，对于跨多个 Actor 的只读查询是可以接受的，当然写操作应该通过 Dapr 状态管理或 Actor api 来执行。
{{% /alert %}}

##### 查询 Actor 状态
如果数据存储支持 SQL 查询，您可以使用 SQL 查询 Actor 的状态。 例如使用：

```sql
SELECT * FROM StateTable WHERE Id='<app-id>||<actor-type>||<actor-id>||<key>'
```

您还可以跨 Actor 实例执行聚合查询，避免 Actor 框架常见的基于回合的并发性限制。 例如，要计算所有温度计Actor的平均温度，使用:

```sql
SELECT AVG(value) FROM StateTable WHERE Id LIKE '<app-id>||<thermometer>||*||temperature'
```

### State Time-to-Live (TTL)
Dapr enables per state set request time-to-live (TTL). This means that applications can set time-to-live per state stored, and these states cannot be retrieved after expiration.

### 状态管理 API
The state management API can be found in the [state management API reference]({{< ref state_api.md >}}) which describes how to retrieve, save, delete and query state values by providing keys.

## 下一步
* 遵循这些指南：
    * [指南：保存和获取状态]({{< ref howto-get-save-state.md >}})
    * [指南：创建一个有状态的服务]({{< ref howto-stateful-service.md >}})
    * [指南：如何在应用程序之间共享状态]({{< ref howto-share-state.md >}})
    * [How-To: Query state]({{< ref howto-state-query-api.md >}})
    * [How-To: Encrypt application state]({{< ref howto-encrypt-state.md >}})
    * [State Time-to-Live]({{< ref state-store-ttl.md >}})
* 试试 [hello world 快速入门](https://github.com/dapr/quickstarts/blob/master/hello-world/README.md) ，它会显示如何使用状态管理或试试 [Dapr SDK]({{< ref sdks >}}) 中的 Sample。
* [状态存储组件]({{< ref supported-state-stores.md >}}) 列表
* 阅读 [状态管理 API 引用]({{< ref state_api.md >}})
* 阅读 [Actor API 引用]({{< ref actors_api.md >}})
