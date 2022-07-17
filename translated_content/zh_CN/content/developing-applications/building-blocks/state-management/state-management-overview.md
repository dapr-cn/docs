---
type: docs
title: "状态管理概览"
linkTitle: "概述"
weight: 100
description: "状态管理 API 构建块概述"
---

Your application can use Dapr's state management API to save, read, and query key/value pairs in the [supported state stores]({{< ref supported-state-stores.md >}}). Using a state store component, you can build stateful, long running applications that save and retrieve their state (like a shopping cart or a game's session state). For example, in the diagram below:

- Use **HTTP POST** to save or query key/value pairs.
- Use **HTTP GET** to read a specific key and have its value returned.

<img src="/images/state-management-overview.png" width=1000>

## 特性

With state management, your application can leverage features that are typically complicated and error-prone to build, including:

- 设置并发控制和数据一致性选项。
- 执行批量更新操作 [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) 包括多个事务性操作。
- 查询和过滤键/值数据。

以下是作为状态管理 API 的一部分提供的功能：

### 可插拔状态存储

Dapr数据存储被建模为组件，可以在不修改你的服务代码的情况下进行替换。 请访问 [支持的状态存储引擎]({{< ref supported-state-stores >}})页面查看完整列表。

### 可配置的状态存储行为

With Dapr, you can include additional metadata in a state operation request that describes how you expect the request to be handled. 你可以附加以下：

- 并发要求
- 一致性要求

By default, your application should assume a data store is **eventually consistent** and uses a **last-write-wins concurrency pattern**.

[并非所有的存储引擎都一样]({{< ref supported-state-stores.md >}})。 To ensure your application's portability, you can query the metadata capabilities of the store and make your code adaptive to different store capabilities.

#### 并发（Concurrency）

Dapr 支持使用 ETags 的乐观并发控制（Optimistic Concurrency Control/OCC）。 当请求状态值时，Dapr 总是给返回的状态附加一个 ETag 属性。 When the user code:

- **Updates a state**, it's expected to attach the ETag through the request body.
- **Deletes a state**, it’s expected to attach the ETag through the `If-Match` header.

The `write` operation succeeds when the provided ETag matches the ETag in the state store.

##### Why Dapr chooses optimistic concurrency control (OCC)

Data update conflicts are rare in many applications, since clients are naturally partitioned by business contexts to operate on different data. However, if your application chooses to use ETags, mismatched ETags may cause a request rejection. It's recommended you use a retry policy in your code to compensate for conflicts when using ETags.

如果您的应用程序在书面请求中省略了ETags，Dapr会在处理请求时跳过ETags校验。 This enables the **last-write-wins** pattern, compared to the **first-write-wins** pattern with ETags.

{{% alert title="Note on ETags" color="primary" %}}
For stores that don't natively support ETags, the corresponding Dapr state store implementation is expected to simulate ETags and follow the Dapr state management API specification when handling states. Since Dapr state store implementations are technically clients to the underlying data store, simulation should be straightforward, using the concurrency control mechanisms provided by the store.
{{% /alert %}}

阅读[API参考]({{< ref state_api.md >}})，了解如何设置并发选项。

#### Consistency

Dapr supports both **strong consistency** and **eventual consistency**, with eventual consistency as the default behavior.

- **Strong consistency**: Dapr waits for all replicas (or designated quorums) to acknowledge before it acknowledges a write request.
- **Eventual consistency**: Dapr returns as soon as the write request is accepted by the underlying data store, even if this is a single replica.

Read the [API reference]({{< ref state_api.md >}}) to learn how to set consistency options.

### Setting content type

State store components may maintain and manipulate data differently, depending on the content type. Dapr supports passing content type in [state management API](#state-management-api) as part of request metadata.

Setting the content type is _optional_, and the component decides whether to make use of it. Dapr only provides the means of passing this information to the component.

- **With the HTTP API**: Set content type via URL query parameter `metadata.contentType`. For example, `http://localhost:3500/v1.0/state/store?metadata.contentType=application/json`.
- **With the gRPC API**: Set content type by adding key/value pair `"contentType" : <content type>` to the request metadata.

### Multiple operations

Dapr supports two types of multi-read or multi-write operations: **bulk** or **transactional**. Read the [API reference]({{< ref state_api.md >}}) to learn how use bulk and multi options.

#### Bulk read operations

You can group multiple read requests into a bulk (or batch) operation. In the bulk operation, Dapr submits the read requests as individual requests to the underlying data store, and returns them as a single result.

#### Transactional operations

You can group write, update, and delete operations into a request, which are then handled as an atomic transaction. The request will succeed or fail as a transactional set of operations.

### Actor state

Transactional state stores can be used to store actor state. To specify which state store to use for actors, specify value of property `actorStateStore` as `true` in the state store component's metadata section. Actors state is stored with a specific scheme in transactional state stores, allowing for consistent querying. 只有一个单一的状态存储组件可以被用作所有角色的状态存储。 Read the [state API reference]({{< ref state_api.md >}}) and the [actors API reference]({{< ref actors_api.md >}}) to learn more about state stores for actors.

### 状态加密

Dapr supports automatic client encryption of application state with support for key rotations. 这在所有 Dapr 状态存储上都受支持。 有关详细信息，请阅读 [操作方法：加密应用程序状态]({{< ref howto-encrypt-state.md >}}) 主题。

### 应用程序之间的共享状态

Different applications' needs vary when it comes to sharing state. In one scenario, you may want to encapsulate all state within a given application and have Dapr manage the access for you. In another scenario, you may want two applications working on the same state to get and save the same keys.

Dapr enables states to be:

- Isolated to an application.
- Shared in a state store between applications.
- Shared between multiple applications across different state stores.

有关更多详细信息，请阅读 [操作方法：在应用程序之间共享状态]({{< ref howto-share-state.md >}})

### 查询状态

有两种方法来查询状态。

- Using the state management query API provided in Dapr runtime.
- Querying state store directly with the store's native SDK.

#### 查询API

Using the _optional_ state management [query API]({{< ref "reference/api/state_api.md#query-state" >}}), you can query the key/value data saved in state stores, regardless of underlying database or storage technology. With the state management query API, you can filter, sort, and paginate the key/value data. 有关更多详细信息，请阅读 [操作方法：查询状态]({{< ref howto-state-query-api.md >}})。

#### 直接查询状态存储

Dapr saves and retrieves state values without any transformation. You can query and aggregate state directly from the [underlying state store]({{< ref query-state-store >}}). For example, to get all state keys associated with an application ID "myApp" in Redis, use:

```bash
KEYS "myApp*"
```

{{% alert title="Note on direct queries" color="primary" %}}
Since you aren't calling through the Dapr runtime, direct queries of the state store are not governed by Dapr concurrency control. What you see are snapshots of committed data acceptable for read-only queries across multiple actors. Writes should be done via the Dapr state management or actors APIs.
{{% /alert %}}

##### 查询 Actor 状态

If the data store supports SQL queries, you can query an actor's state using SQL queries. 例如:

```sql
SELECT * FROM StateTable WHERE Id='<app-id>||<actor-type>||<actor-id>||<key>'
```

You can also avoid the common turn-based concurrency limitations of actor frameworks by performing aggregate queries across actor instances. For example, to calculate the average temperature of all thermometer actors, use:

```sql
SELECT AVG(value) FROM StateTable WHERE Id LIKE '<app-id>||<thermometer>||*||temperature'
```

### State Time-to-Live (TTL)

Dapr enables [per state set request time-to-live (TTL)]({{< ref state-store-ttl.md >}}). This means that applications can set time-to-live per state stored, and these states cannot be retrieved after expiration.

### 状态管理 API

The state management API can be found in the [state management API reference]({{< ref state_api.md >}}), which describes how to retrieve, save, delete, and query state values by providing keys.

## Try out state management

### Quickstarts and tutorials

Want to put the Dapr state management API to the test? Walk through the following quickstart and tutorials to see state management in action:

| Quickstart/tutorial                                                                            | 说明                                                                                                                         |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [State management quickstart]({{< ref statemanagement-quickstart.md >}})                       | 使用状态管理 API 创建有状态应用程序。                                                                                                      |
| [Hello World](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world)           | _Recommended_ <br> Demonstrates how to run Dapr locally. 重点介绍服务调用和状态管理。                                              |
| [Hello Kubernetes](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes) | _Recommended_ <br> Demonstrates how to run Dapr in Kubernetes. Highlights service invocation and _state management_. |

### Start using state management directly in your app

Want to skip the quickstarts? Not a problem. You can try out the state management building block directly in your application. After [Dapr is installed]({{< ref "getting-started/_index.md" >}}), you can begin using the state management API starting with [the state management how-to guide]({{< ref howto-get-save-state.md >}}).

## 下一步

- Start working through the state management how-to guides, starting with:
  - [指南：保存和获取状态]({{< ref howto-get-save-state.md >}})
  - [指南：创建一个有状态的服务]({{< ref howto-stateful-service.md >}})
- Review the list of [state store components]({{< ref supported-state-stores.md >}})
- 阅读 [状态管理 API 引用]({{< ref state_api.md >}})
- 阅读 [Actor API 引用]({{< ref actors_api.md >}})