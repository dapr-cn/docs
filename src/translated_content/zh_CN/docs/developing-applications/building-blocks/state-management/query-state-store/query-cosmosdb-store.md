---
type: docs
title: Azure Cosmos DB
linkTitle: Azure Cosmos DB
weight: 1000
description: 使用 azure Cosmos DB 作为状态存储
---

Dapr 在保存和检索状态时不会转换状态值。 Dapr要求所有的状态存储实现都要遵守特定的密钥格式方案（请参见[状态管理规范]({{< ref state_api.md >}})）。 您可以直接与底层存储交互，以操纵状态数据，例如：

- 查询状态。
- 创建聚合视图。
- 制作备份。

{{% alert title="注意" color="primary" %}}
Azure Cosmos DB 是一个支持多种 API 的多模数据库。 默认的Dapr Cosmos DB状态存储实现使用[Azure Cosmos DB SQL API](https://docs.microsoft.com/azure/cosmos-db/sql-query-getting-started)。

{{% /alert %}}

## 连接到 Azure Cosmos DB

要连接到您的 Cosmos DB 实例，您可以选择以下任一方式：

- 在[Azure管理门户](https://portal.azure.com)上使用数据浏览器。
- 使用[various SDKs and tools](https://docs.microsoft.com/azure/cosmos-db/mongodb-introduction)。

{{% alert title="注意" color="primary" %}}
当你为 Dapr 配置 Azure Cosmos DB 时，需要指定要使用的确切数据库和集合。 下面的 Cosmos DB [SQL API](https://docs.microsoft.com/azure/cosmos-db/sql-query-getting-started) 示例假设你已经连接到了正确的数据库和一个名为 "states" 的集合。

{{% /alert %}}

## 通过 App ID 列出键

要获取与应用程序 "myapp" 关联的所有状态，请使用查询：

```sql
SELECT * FROM states WHERE CONTAINS(states.id, 'myapp||')
```

上面的查询返回所有id，也就是状态键前缀为 "myapp-" 的记录。

## 获取特定状态数据

例如，要获取应用程序 "myapp" 的键 "balance" 的状态数据，请使用以下查询:

```sql
SELECT * FROM states WHERE states.id = 'myapp||balance'
```

读取返回的文档的 **value** 字段。 要获取状态 version/ETag ，请使用以下命令:

```sql
SELECT states._etag FROM states WHERE states.id = 'myapp||balance'
```

## 读取Actor 状态

要获取应用ID为 "myets"，实例ID为 "leroy"，actor 类型为 "cat" 的相关联所有 actor 的状态键，请使用以下命令:

```sql
SELECT * FROM states WHERE CONTAINS(states.id, 'mypets||cat||leroy||')
```

要获取特定 actor 状态（如 "food"） ，请使用以下命令:

```sql
SELECT * FROM states WHERE states.id = 'mypets||cat||leroy||food'
```

{{% alert title="警告" color="warning" %}}
您不应该手动更新或删除存储中的状态。 所有的写入和删除操作都应该通过 Dapr 运行时来完成。 \*\*唯一的例外：\*\*通常需要在状态存储中删除 actor 记录，一旦您知道这些不再使用，以防止未使用的 actor 实例的累积，这些实例可能永远不会再次加载。

{{% /alert %}}
