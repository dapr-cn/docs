---
type: docs
title: SQL server
linkTitle: SQL server
weight: 3000
description: 使用 SQL Server 作为后端状态存储
---

Dapr 在保存和检索状态时不会转换状态值。 Dapr要求所有的状态存储实现都要遵守特定的密钥格式方案（请参见[状态管理规范]({{< ref state_api.md >}})）。 您可以直接与底层存储交互，以操纵状态数据，例如：

- 查询状态。
- 创建聚合视图。
- 制作备份。

## 连接到 SQL Server

连接到 SQL Server 实例的最简单方法是使用以下方法：

- [Azure Data Studio](https://docs.microsoft.com/sql/azure-data-studio/download-azure-data-studio) (Windows, macOS, Linux)
- [SQL Server Management Studio](https://docs.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms) (Windows)

{{% alert title="注意" color="primary" %}}
当您为 Dapr 配置 Azure SQL 数据库时，需要明确指定要使用的表名。 下面的 Azure SQL 示例假设您已经连接到了一个名为 "states" 的正确数据库。

{{% /alert %}}

## 通过 App ID 列出键

要获取与应用程序 "myapp" 关联的所有状态，请使用查询：

```sql
SELECT * FROM states WHERE [Key] LIKE 'myapp||%'
```

上面的查询返回所有id，也就是状态键前缀为 "myapp||" 的记录。

## 获取特定状态数据

例如，要获取应用程序 "myapp" 的键 "balance" 的状态数据，请使用以下查询:

```sql
SELECT * FROM states WHERE [Key] = 'myapp||balance'
```

读取返回的行的 **Data** 字段。 要获取状态 version/ETag ，请使用以下命令:

```sql
SELECT [RowVersion] FROM states WHERE [Key] = 'myapp||balance'
```

## 获取过滤后的状态数据

执行下面的查询，以获取 json 数据中 "color" 值等于 "blue" 的所有状态数据：

```sql
SELECT * FROM states WHERE JSON_VALUE([Data], '$.color') = 'blue'
```

## 读取Actor 状态

要获取应用ID为 "myets"，实例ID为 "leroy"，actor 类型为 "cat" 的相关联所有 actor 的状态键，请使用以下命令:

```sql
SELECT * FROM states WHERE [Key] LIKE 'mypets||cat||leroy||%'
```

要获取特定 actor 状态（如 "food"） ，请使用以下命令:

```sql
SELECT * FROM states WHERE [Key] = 'mypets||cat||leroy||food'
```

{{% alert title="警告" color="warning" %}}
您不应该手动更新或删除存储中的状态。 所有的写入和删除操作都应该通过 Dapr 运行时来完成。 \*\*唯一的例外：\*\*通常需要在状态存储中删除 actor 记录，一旦您知道这些不再使用，以防止未使用的 actor 实例的累积，这些实例可能永远不会再次加载。

{{% /alert %}}
