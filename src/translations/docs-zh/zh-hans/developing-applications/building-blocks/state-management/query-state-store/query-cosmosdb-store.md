---
type: docs
title: "Azure Cosmos DB"
linkTitle: "Azure Cosmos DB"
weight: 1000
description: "使用 azure Cosmos DB 作为后端状态存储"
---

Dapr 在保存和检索状态时不会转换状态值。 Dapr requires all state store implementations to abide by a certain key format scheme (see [Dapr state management spec]({{< ref state_api.md >}}). 您可以直接与基础存储进行交互以操作状态数据，例如查询状态、创建聚合视图和进行备份。

> **注意:** Azure Cosmos DB是一个支持多种API的多模数据库。 默认的Dapr Cosmos DB状态存储实现使用 [Azure Cosmos DB SQL API](https://docs.microsoft.com/en-us/azure/cosmos-db/sql-query-getting-started).

## 1. 连接到 Azure Cosmos DB

连接到您的 Cosmos DB 实例的最简单方法是使用 [Azure Management Portal](https://portal.azure.com)上的数据资源管理器。 或者，你也可以使用[多种SDK和工具](https://docs.microsoft.com/en-us/azure/cosmos-db/mongodb-introduction)。

> **注意:** 下面的示例使用 Cosmos DB [SQL API](https://docs.microsoft.com/en-us/azure/cosmos-db/sql-query-getting-started). 当你为 Dapr 配置 Azure Cosmos DB 时，你需要明确指定要使用的数据库和集合。 当你为 Dapr 配置 Azure Cosmos DB 时，你需要明确指定要使用的数据库和集合。 下面的示例假设你已经连接到了正确的数据库和一个名为 "states"的集合。

## 2. 通过 App ID 列出键

执行下面的查询，以获得与应用程序 "myapp "相关的所有状态键：

```sql
SELECT * FROM states WHERE CONTAINS(states.id, 'myapp||')
```

上面的查询会返回所有id包含 "myapp-"的文档，也就是状态键的前缀。

## 3. 获取特定状态数据

执行下面的查询，以通过键 "balance "获取应用程序 "myapp "的状态数据:

```sql
SELECT * FROM states WHERE states.id = 'myapp||balance'
```

然后，读取返回的文档的**value**字段。

要获取状态version/ETag ，请使用以下命令:

```sql
SELECT states._etag FROM states WHERE states.id = 'myapp||balance'
```

## 4. 获取 actor 状态

要获取应用ID为 "myets "，实例ID为"leroy"，actor类型为"cat"的相关联所有actor的状态键，请使用以下命令:

```sql
SELECT * FROM states WHERE CONTAINS(states.id, 'mypets||cat||leroy||')
```

要获取特定actor状态（如"food"） ，请使用以下命令:

```sql
SELECT * FROM states WHERE states.id = 'mypets||cat||leroy||food'
```

> **警告:** 您不应该手动更新或删除存储引擎中的状态， 所有的写入和删除操作都应该通过Dapr运行时来完成。 所有的写入和删除操作都应该通过Dapr运行时来完成。
