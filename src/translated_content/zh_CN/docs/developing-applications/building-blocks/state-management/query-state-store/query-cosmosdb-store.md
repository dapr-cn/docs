---
type: docs
title: "Azure Cosmos DB"
linkTitle: "Azure Cosmos DB"
weight: 1000
description: "使用 Azure Cosmos DB 作为状态存储"
---

Dapr 在保存和检索状态时不对状态值进行转换。Dapr 要求所有状态存储实现遵循特定的键格式规范（参见[状态管理规范]({{< ref state_api.md >}})）。您可以直接与底层存储交互以操作状态数据，例如：

- 查询状态。
- 创建聚合视图。
- 进行备份。

{{% alert title="注意" color="primary" %}}
Azure Cosmos DB 是一个支持多种 API 的多模式数据库。默认的 Dapr Cosmos DB 状态存储实现使用 [Azure Cosmos DB SQL API](https://docs.microsoft.com/azure/cosmos-db/sql-query-getting-started)。

{{% /alert %}}

## 连接到 Azure Cosmos DB

要连接到您的 Cosmos DB 实例，您可以：

- 使用 [Azure 管理门户](https://portal.azure.com)上的数据资源管理器。
- 使用[各种 SDK 和工具](https://docs.microsoft.com/azure/cosmos-db/mongodb-introduction)。

{{% alert title="注意" color="primary" %}}
当您为 Dapr 配置 Azure Cosmos DB 时，请指定要使用的具体数据库和集合。以下 Cosmos DB [SQL API](https://docs.microsoft.com/azure/cosmos-db/sql-query-getting-started) 示例假设您已连接到正确的数据库和名为 "states" 的集合。

{{% /alert %}}

## 按应用程序 ID 列出键

要获取与应用程序 "myapp" 关联的所有状态键，请使用查询：

```sql
SELECT * FROM states WHERE CONTAINS(states.id, 'myapp||')
```

上述查询返回所有 id 包含 "myapp||" 的文档，这是状态键的前缀。

## 获取特定状态数据

要通过键 "balance" 获取应用程序 "myapp" 的状态数据，请使用查询：

```sql
SELECT * FROM states WHERE states.id = 'myapp||balance'
```

读取返回文档的 **value** 字段。要获取状态版本/ETag，请使用命令：

```sql
SELECT states._etag FROM states WHERE states.id = 'myapp||balance'
```

## 读取 actor 状态

要获取与实例 ID 为 "leroy" 的 actor 类型 "cat" 关联的所有状态键，该 actor 属于 ID 为 "mypets" 的应用程序，请使用命令：

```sql
SELECT * FROM states WHERE CONTAINS(states.id, 'mypets||cat||leroy||')
```

要获取特定的 actor 状态，例如 "food"，请使用命令：

```sql
SELECT * FROM states WHERE states.id = 'mypets||cat||leroy||food'
```

{{% alert title="警告" color="warning" %}}
您不应手动更新或删除存储中的状态。所有写入和删除操作应通过 Dapr 运行时完成。**唯一的例外：** 通常需要在状态存储中删除 actor 记录，_一旦您知道这些记录不再使用_，以防止未使用的 actor 实例积累，这些实例可能永远不会再次加载。

{{% /alert %}}