---
type: docs
title: "SQL server"
linkTitle: "SQL server"
weight: 3000
description: "使用 SQL Server 作为后端状态存储"
---

Dapr 在保存和检索状态时不会转换状态值。 Dapr requires all state store implementations to abide by a certain key format scheme (see [the state management spec]({{< ref state_api.md >}}). You can directly interact with the underlying store to manipulate the state data, such as:

- Querying states.
- Creating aggregated views.
- Making backups.

## 连接到 SQL Server

The easiest way to connect to your SQL Server instance is to use the:

- [Azure Data Studio](https://docs.microsoft.com/sql/azure-data-studio/download-azure-data-studio) (Windows, macOS, Linux)
- [SQL Server Management Studio](https://docs.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms) (Windows)

{{% alert title="Note" color="primary" %}}
为Dapr配置Azure SQL数据库时，需要明确指定要使用的表名。 The following Azure SQL samples assume you've already connected to the right database with a table named "states".

{{% /alert %}}

## 通过 App ID 列出键

执行下面的查询，以获得与应用程序 "myapp "相关的所有状态键：

```sql
SELECT * FROM states WHERE [Key] LIKE 'myapp||%'
```

上面的查询返回所有id，也就是状态键前缀为 "myapp||"的记录。

## 获取特定状态数据

执行下面的查询，以通过键 "balance "获取应用程序 "myapp "的状态数据:

```sql
SELECT * FROM states WHERE [Key] = 'myapp||balance'
```

Read the **Data** field of the returned row. 要获取状态version/ETag ，请使用以下命令:

```sql
SELECT [RowVersion] FROM states WHERE [Key] = 'myapp||balance'
```

## 获取过滤后的状态数据

执行下面的查询，以获取json数据中 "color "值等于 "blue "的所有状态数据：

```sql
SELECT * FROM states WHERE JSON_VALUE([Data], '$.color') = 'blue'
```

## 获取 actor 状态

要获取应用ID为 "myets "，实例ID为"leroy"，actor类型为"cat"的相关联所有actor的状态键，请使用以下命令:

```sql
SELECT * FROM states WHERE [Key] LIKE 'mypets||cat||leroy||%'
```

To get a specific actor state such as "food", use the command:

```sql
SELECT * FROM states WHERE [Key] = 'mypets||cat||leroy||food'
```

{{% alert title="Warning" color="warning" %}}
You should not manually update or delete states in the store. 所有的写入和删除操作都应该通过Dapr运行时来完成。 **The only exception:** it is often required to delete actor records in a state store, _once you know that these are no longer in use_, to prevent a build up of unused actor instances that may never be loaded again.

{{% /alert %}}