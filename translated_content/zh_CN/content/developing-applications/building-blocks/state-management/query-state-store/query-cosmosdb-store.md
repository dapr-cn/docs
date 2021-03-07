---
type: docs
title: "Azure Cosmos DB"
linkTitle: "Azure Cosmos DB"
weight: 1000
description: "使用 azure Cosmos DB 作为后端状态存储"
---

Dapr 在保存和检索状态时不会转换状态值。 Dapr requires all state store implementations to abide by a certain key format scheme (see [Dapr state management spec]({{< ref state_api.md >}}). You can directly interact with the underlying store to manipulate the state data, such querying states, creating aggregated views and making backups. You can directly interact with the underlying store to manipulate the state data, such querying states, creating aggregated views and making backups.

> **NOTE:** Azure Cosmos DB is a multi-modal database that supports multiple APIs. The default Dapr Cosmos DB state store implementation uses the [Azure Cosmos DB SQL API](https://docs.microsoft.com/en-us/azure/cosmos-db/sql-query-getting-started). The default Dapr Cosmos DB state store implementation uses the [Azure Cosmos DB SQL API](https://docs.microsoft.com/en-us/azure/cosmos-db/sql-query-getting-started).

## 1. 1. Connect to Azure Cosmos DB

The easiest way to connect to your Cosmos DB instance is to use the Data Explorer on [Azure Management Portal](https://portal.azure.com). Alternatively, you can use [various SDKs and tools](https://docs.microsoft.com/en-us/azure/cosmos-db/mongodb-introduction). Alternatively, you can use [various SDKs and tools](https://docs.microsoft.com/en-us/azure/cosmos-db/mongodb-introduction).

> **NOTE:** The following samples use Cosmos DB [SQL API](https://docs.microsoft.com/en-us/azure/cosmos-db/sql-query-getting-started). When you configure an Azure Cosmos DB for Dapr, you need to specify the exact database and collection to use. The follow samples assume you've already connected to the right database and a collection named "states". When you configure an Azure Cosmos DB for Dapr, you need to specify the exact database and collection to use. The follow samples assume you've already connected to the right database and a collection named "states".

## 2. 2. 通过 App ID 列出键

To get all state keys associated with application "myapp", use the query:

```sql
SELECT * FROM states WHERE CONTAINS(states.id, 'myapp||')
```

The above query returns all documents with id containing "myapp-", which is the prefix of the state keys.

## 3. 3. 获取特定状态数据

To get the state data by a key "balance" for the application "myapp", use the query:

```sql
SELECT * FROM states WHERE states.id = 'myapp||balance'
```

Then, read the **value** field of the returned document.

要获取状态version/ETag ，请使用以下命令:

```sql
SELECT states._etag FROM states WHERE states.id = 'myapp||balance'
```

## 4. 4. 获取 actor 状态

要获取应用ID为 "myets "，实例ID为"leroy"，actor类型为"cat"的相关联所有actor的状态键，请使用以下命令:

```sql
SELECT * FROM states WHERE CONTAINS(states.id, 'mypets||cat||leroy||')
```

要获取特定actor状态（如"food"） ，请使用以下命令:

```sql
SELECT * FROM states WHERE states.id = 'mypets||cat||leroy||food'
```

> **WARNING:** You should not manually update or delete states in the store. All writes and delete operations should be done via the Dapr runtime. All writes and delete operations should be done via the Dapr runtime.
