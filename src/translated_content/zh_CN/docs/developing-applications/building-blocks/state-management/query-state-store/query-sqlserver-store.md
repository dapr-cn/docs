---
type: docs
title: "SQL server"
linkTitle: "SQL server"
weight: 3000
description: "使用 SQL server 作为后端状态存储"
---

Dapr 在保存和检索状态时不对状态值进行转换。Dapr 要求所有状态存储实现遵循特定的键格式（参见[状态管理规范]({{< ref state_api.md >}})）。您可以直接与底层存储交互来操作状态数据，例如：

- 查询状态。
- 创建聚合视图。
- 进行备份。

## 连接到 SQL Server

连接到 SQL Server 实例的最简单方法是使用：

- [Azure Data Studio](https://docs.microsoft.com/sql/azure-data-studio/download-azure-data-studio)（Windows、macOS、Linux）
- [SQL Server Management Studio](https://docs.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms)（Windows）

{{% alert title="注意" color="primary" %}}
当您为 Dapr 配置 Azure SQL 数据库时，您需要指定具体的表名。以下 Azure SQL 示例假设您已经连接到具有名为 "states" 的表的正确数据库。

{{% /alert %}}

## 按应用程序 ID 列出键

要获取与应用程序 "myapp" 关联的所有状态键，请使用以下查询：

```sql
SELECT * FROM states WHERE [Key] LIKE 'myapp||%'
```

上述查询返回所有 ID 包含 "myapp||" 的行，这是状态键的前缀。

## 获取特定状态数据

要通过键 "balance" 获取应用程序 "myapp" 的状态数据，请使用以下查询：

```sql
SELECT * FROM states WHERE [Key] = 'myapp||balance'
```

读取返回行的 **Data** 字段。要获取状态版本/ETag，请使用以下命令：

```sql
SELECT [RowVersion] FROM states WHERE [Key] = 'myapp||balance'
```

## 获取过滤的状态数据

要获取 JSON 数据中值 "color" 等于 "blue" 的所有状态数据，请使用以下查询：

```sql
SELECT * FROM states WHERE JSON_VALUE([Data], '$.color') = 'blue'
```

## 读取 actor 状态

要获取与 actor 类型 "cat" 的实例 ID "leroy" 关联的所有状态键，该 actor 属于 ID 为 "mypets" 的应用程序，请使用以下命令：

```sql
SELECT * FROM states WHERE [Key] LIKE 'mypets||cat||leroy||%'
```

要获取特定的 actor 状态，例如 "food"，请使用以下命令：

```sql
SELECT * FROM states WHERE [Key] = 'mypets||cat||leroy||food'
```

{{% alert title="警告" color="warning" %}}
您不应手动更新或删除存储中的状态。所有写入和删除操作应通过 Dapr 运行时完成。**唯一的例外：** 当您确定这些 actor 记录不再使用时，通常需要在状态存储中删除它们，以防止未使用的 actor 实例积累，这些实例可能永远不会再次加载。

{{% /alert %}}