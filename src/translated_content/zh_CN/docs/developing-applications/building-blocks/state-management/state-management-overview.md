---
type: docs
title: "状态管理概述"
linkTitle: "概述"
weight: 100
description: "状态管理API模块概述"
---

您的应用程序可以利用Dapr的状态管理API在[支持的状态存储]({{< ref supported-state-stores.md >}})中保存、读取和查询键/值对。通过状态存储组件，您可以构建有状态且长时间运行的应用程序，例如购物车或游戏的会话状态。如下图所示：

- 使用**HTTP POST**来保存或查询键/值对。
- 使用**HTTP GET**来读取特定键并返回其值。

<img src="/images/state-management-overview.png" width=1000 style="padding-bottom:25px;">

[以下视频和演示](https://www.youtube.com/live/0y7ne6teHT4?si=2_xX6mkU3UCy2Plr&t=6607)概述了Dapr状态管理的工作原理。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/0y7ne6teHT4?si=2_xX6mkU3UCy2Plr&amp;start=6607" title="YouTube video player" style="padding-bottom:25px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 功能

通过状态管理API模块，您的应用程序可以利用一些通常复杂且容易出错的功能，包括：

- 设置并发控制和数据一致性的选项。
- 执行批量更新操作[CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete)，包括多个事务操作。
- 查询和过滤键/值数据。

以下是状态管理API的一些功能：

### 可插拔的状态存储

Dapr的数据存储被设计为组件，可以在不更改服务代码的情况下进行替换。查看[支持的状态存储]({{< ref supported-state-stores >}})以获取更多信息。

### 可配置的状态存储行为

使用Dapr，您可以在状态操作请求中附加元数据，描述您期望请求如何被处理。您可以附加：

- 并发性要求
- 一致性要求

默认情况下，您的应用程序应假设数据存储是**最终一致的**，并使用**最后写入胜出并发模式**。

[并非所有存储都是平等的]({{< ref supported-state-stores.md >}})。为了确保您的应用程序的可移植性，您可以查询存储的元数据能力，并使您的代码适应不同的存储能力。

#### 并发

Dapr支持使用ETags的乐观并发控制（OCC）。当请求状态值时，Dapr总是将ETag属性附加到返回的状态中。当用户代码：

- **更新状态**时，期望通过请求体附加ETag。
- **删除状态**时，期望通过`If-Match`头附加ETag。

当提供的ETag与状态存储中的ETag匹配时，`写入`操作成功。

##### 为什么Dapr选择乐观并发控制（OCC）

在许多应用程序中，数据更新冲突很少见，因为客户端通常根据业务上下文分区以操作不同的数据。然而，如果您的应用程序选择使用ETags，不匹配的ETags可能导致请求被拒绝。建议您在代码中使用重试策略，以在使用ETags时补偿冲突。

如果您的应用程序在写入请求中省略ETags，Dapr在处理请求时会跳过ETag检查。这使得**最后写入胜出**模式成为可能，与使用ETags的**首次写入胜出**模式相比。

{{% alert title="关于ETags的注意事项" color="primary" %}}
对于不原生支持ETags的存储，相应的Dapr状态存储实现应模拟ETags，并在处理状态时遵循Dapr状态管理API规范。由于Dapr状态存储实现技术上是底层数据存储的客户端，模拟应该是直接的，使用存储提供的并发控制机制。
{{% /alert %}}

阅读[API参考]({{< ref state_api.md >}})以了解如何设置并发选项。

#### 一致性

Dapr支持**强一致性**和**最终一致性**，最终一致性是默认行为。

- **强一致性**：Dapr在确认写入请求之前等待所有副本（或指定的法定人数）确认。
- **最终一致性**：Dapr在底层数据存储接受写入请求后立即返回，即使这只是一个副本。

阅读[API参考]({{< ref state_api.md >}})以了解如何设置一致性选项。

### 设置内容类型

状态存储组件可能会根据内容类型不同地维护和操作数据。Dapr支持在[状态管理API](#state-management-api)中作为请求元数据的一部分传递内容类型。

设置内容类型是_可选的_，组件决定是否使用它。Dapr仅提供将此信息传递给组件的手段。

- **使用HTTP API**：通过URL查询参数`metadata.contentType`设置内容类型。例如，`http://localhost:3500/v1.0/state/store?metadata.contentType=application/json`。
- **使用gRPC API**：通过在请求元数据中添加键/值对`"contentType" : <content type>`来设置内容类型。

### 多重操作

Dapr支持两种类型的多读或多写操作：**批量**或**事务性**。阅读[API参考]({{< ref state_api.md >}})以了解如何使用批量和多选项。

#### 批量读取操作

您可以将多个读取请求分组为批量（或批次）操作。在批量操作中，Dapr将读取请求作为单独的请求提交到底层数据存储，并将它们作为单个结果返回。

#### 事务性操作

您可以将写入、更新和删除操作分组为一个请求，然后作为一个原子事务处理。请求将作为一组事务性操作成功或失败。

### actor状态

事务性状态存储可用于存储actor状态。要指定用于actor的状态存储，请在状态存储组件的元数据部分中将属性`actorStateStore`的值指定为`true`。actor状态以特定方案存储在事务性状态存储中，允许进行一致的查询。所有actor只能使用一个状态存储组件作为状态存储。阅读[state API参考]({{< ref state_api.md >}})和[actors API参考]({{< ref actors_api.md >}})以了解有关actor状态存储的更多信息。

#### actor状态的生存时间（TTL）

在保存actor状态时，您应始终设置TTL元数据字段（`ttlInSeconds`）或在您选择的SDK中使用等效的API调用，以确保状态最终被移除。阅读[actors概述]({{< ref actors-overview.md >}})以获取更多信息。

### 状态加密

Dapr支持应用程序状态的自动客户端加密，并支持密钥轮换。这在所有Dapr状态存储上都支持。有关更多信息，请阅读[如何：加密应用程序状态]({{< ref howto-encrypt-state.md >}})主题。

### 应用程序之间的共享状态

不同应用程序在共享状态时的需求各不相同。在一种情况下，您可能希望将所有状态封装在给定应用程序中，并让Dapr为您管理访问。在另一种情况下，您可能希望两个应用程序在同一状态上工作，以获取和保存相同的键。

Dapr使状态能够：

- 隔离到一个应用程序。
- 在应用程序之间的状态存储中共享。
- 在不同状态存储之间的多个应用程序之间共享。

有关更多详细信息，请阅读[如何：在应用程序之间共享状态]({{< ref howto-share-state.md >}})。

### 启用外发模式

Dapr使开发人员能够使用外发模式在事务性状态存储和任何消息代理之间实现单一事务。有关更多信息，请阅读[如何启用事务性外发消息]({{< ref howto-outbox.md >}})。

### 查询状态

有两种方法可以查询状态：

- 使用Dapr运行时提供的状态管理查询API。
- 使用存储的原生SDK直接查询状态存储。

#### 查询API

使用_可选的_状态管理[查询API]({{< ref "reference/api/state_api.md#query-state" >}})，您可以查询状态存储中保存的键/值数据，无论底层数据库或存储技术如何。使用状态管理查询API，您可以过滤、排序和分页键/值数据。有关更多详细信息，请阅读[如何：查询状态]({{< ref howto-state-query-api.md >}})。

#### 直接查询状态存储

Dapr在不进行任何转换的情况下保存和检索状态值。您可以直接从[底层状态存储]({{< ref query-state-store >}})查询和聚合状态。例如，要获取与应用程序ID "myApp" 相关的所有状态键，请在Redis中使用：

```bash
KEYS "myApp*"
```

{{% alert title="关于直接查询的注意事项" color="primary" %}}
由于您不是通过Dapr运行时调用，直接查询状态存储不受Dapr并发控制的约束。您看到的是可接受的已提交数据的快照，用于跨多个actor的只读查询。写入应通过Dapr状态管理或actors API进行。
{{% /alert %}}

##### 查询actor状态

如果数据存储支持SQL查询，您可以使用SQL查询actor的状态。例如：

```sql
SELECT * FROM StateTable WHERE Id='<app-id>||<actor-type>||<actor-id>||<key>'
```

您还可以通过对actor实例执行聚合查询来避免actor框架的常见轮次并发限制。例如，要计算所有温度计actor的平均温度，请使用：

```sql
SELECT AVG(value) FROM StateTable WHERE Id LIKE '<app-id>||<thermometer>||*||temperature'
```

### 状态生存时间（TTL）

Dapr支持[每个状态设置请求的生存时间（TTL）]({{< ref state-store-ttl.md >}})。这意味着应用程序可以为每个存储的状态设置生存时间，这些状态在过期后无法检索。

### 状态管理API

状态管理API可以在[状态管理API参考]({{< ref state_api.md >}})中找到，该参考描述了如何通过提供键来检索、保存、删除和查询状态值。

## 试用状态管理

### 快速入门和教程

想要测试Dapr状态管理API吗？通过以下快速入门和教程，看看状态管理的实际应用：

| 快速入门/教程 | 描述 |
| ------------------- | ----------- |
| [状态管理快速入门]({{< ref statemanagement-quickstart.md >}}) | 使用状态管理API创建有状态的应用程序。 |
| [Hello World](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world)            | _推荐_ <br> 演示如何在本地运行Dapr。突出显示服务调用和状态管理。  |
| [Hello World Kubernetes](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)       | _推荐_ <br> 演示如何在Kubernetes中运行Dapr。突出显示服务调用和_状态管理_。  |

### 直接在您的应用中开始使用状态管理

想要跳过快速入门？没问题。您可以直接在您的应用程序中试用状态管理模块。在[Dapr安装]({{< ref "getting-started/_index.md" >}})后，您可以从[状态管理如何指南]({{< ref howto-get-save-state.md >}})开始使用状态管理API。

## 下一步

- 开始通过状态管理如何指南进行工作，从以下开始：
  - [如何：保存和获取状态]({{< ref howto-get-save-state.md >}})
  - [如何：构建有状态服务]({{< ref howto-stateful-service.md >}})
- 查看[状态存储组件]({{< ref supported-state-stores.md >}})列表
- 阅读[状态管理API参考]({{< ref state_api.md >}})
- 阅读[actors API参考]({{< ref actors_api.md >}})
