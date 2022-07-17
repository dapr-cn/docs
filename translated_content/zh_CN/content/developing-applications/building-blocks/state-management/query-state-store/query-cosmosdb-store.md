---
type: docs
title: "Azure Cosmos DB"
linkTitle: "Azure Cosmos DB"
weight: 1000
description: "Use Azure Cosmos DB as a state store"
---

Dapr 在保存和检索状态时不会转换状态值。 Dapr requires all state store implementations to abide by a certain key format scheme (see [the state management spec]({{< ref state_api.md >}}). You can directly interact with the underlying store to manipulate the state data, such as:

- Querying states.
- Creating aggregated views.
- Making backups.

{{% alert title="Note" color="primary" %}}
Azure Cosmos DB is a multi-modal database that supports multiple APIs. 默认的Dapr Cosmos DB状态存储实现使用 [Azure Cosmos DB SQL API](https://docs.microsoft.com/azure/cosmos-db/sql-query-getting-started).

{{% /alert %}}

## 连接到 Azure Cosmos DB

To connect to your Cosmos DB instance, you can either:

- Use the Data Explorer on [Azure Management Portal](https://portal.azure.com).
- Use [various SDKs and tools](https://docs.microsoft.com/azure/cosmos-db/mongodb-introduction).

{{% alert title="Note" color="primary" %}}
When you configure an Azure Cosmos DB for Dapr, specify the exact database and collection to use. The following Cosmos DB [SQL API](https://docs.microsoft.com/azure/cosmos-db/sql-query-getting-started) samples assume you've already connected to the right database and a collection named "states".

{{% /alert %}}

## 通过 App ID 列出键

执行下面的查询，以获得与应用程序 "myapp "相关的所有状态键：

```sql
SELECT * FROM states WHERE CONTAINS(states.id, 'myapp||')
```

The above query returns all documents with an id containing "myapp-", which is the prefix of the state keys.

## 获取特定状态数据

执行下面的查询，以通过键 "balance "获取应用程序 "myapp "的状态数据:

```sql
SELECT * FROM states WHERE states.id = 'myapp||balance'
```

Read the **value** field of the returned document. 要获取状态version/ETag ，请使用以下命令:

```sql
SELECT states._etag FROM states WHERE states.id = 'myapp||balance'
```

## 获取 actor 状态

要获取应用ID为 "myets "，实例ID为"leroy"，actor类型为"cat"的相关联所有actor的状态键，请使用以下命令:

```sql
SELECT * FROM states WHERE CONTAINS(states.id, 'mypets||cat||leroy||')
```

要获取特定actor状态（如"food"） ，请使用以下命令:

```sql
SELECT * FROM states WHERE states.id = 'mypets||cat||leroy||food'
```

{{% alert title="Warning" color="warning" %}}
You should not manually update or delete states in the store. 所有的写入和删除操作都应该通过Dapr运行时来完成。 **The only exception:** it is often required to delete actor records in a state store, _once you know that these are no longer in use_, to prevent a build up of unused actor instances that may never be loaded again.

{{% /alert %}}
