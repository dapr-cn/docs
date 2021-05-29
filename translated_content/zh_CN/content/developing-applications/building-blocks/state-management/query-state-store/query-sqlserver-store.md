---
type: docs
title: "SQL server"
linkTitle: "SQL server"
weight: 3000
description: "使用 SQL Server 作为后端状态存储"
---

Dapr 在保存和检索状态时不会转换状态值。 Dapr requires all state store implementations to abide by a certain key format scheme (see [Dapr state management spec]({{< ref state_api.md >}}). 您可以直接与基础存储进行交互以操作状态数据，例如查询状态、创建聚合视图和进行备份。

## 1. 连接到 SQL Server

连接到 SQL Server 实例的最简单方法是使用[Azure Data Studio](https://docs.microsoft.com/sql/azure-data-studio/download-azure-data-studio)（Windows、macOS、Linux）或[SQL Server Management Studio](https://docs.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms)（Windows）。

> **注意：**以下示例使用 Azure SQL。 为Dapr配置Azure SQL数据库时，需要明确指定要使用的表名。 下面的示例假设你已经连接到了正确的数据库，并有一个名为 "states"的表：

## 2. 通过 App ID 列出键

执行下面的查询，以获得与应用程序 "myapp "相关的所有状态键：

```sql
SELECT * FROM states WHERE [Key] LIKE 'myapp||%'
```

上面的查询返回所有id，也就是状态键前缀为 "myapp||"的记录。

## 3. 获取特定状态数据

执行下面的查询，以通过键 "balance "获取应用程序 "myapp "的状态数据:

```sql
SELECT * FROM states WHERE [Key] = 'myapp||balance'
```

然后，读取返回行的**Data**字段。

要获取状态version/ETag ，请使用以下命令:

```sql
SELECT [RowVersion] FROM states WHERE [Key] = 'myapp||balance'
```

## 4. 获取过滤后的状态数据

执行下面的查询，以获取json数据中 "color "值等于 "blue "的所有状态数据：

```sql
SELECT * FROM states WHERE JSON_VALUE([Data], '$.color') = 'blue'
```

## 5. 获取 actor 状态

要获取应用ID为 "myets "，实例ID为"leroy"，actor类型为"cat"的相关联所有actor的状态键，请使用以下命令:

```sql
SELECT * FROM states WHERE [Key] LIKE 'mypets||cat||leroy||%'
```

要获取特定actor状态（如"food"） ，请使用以下命令:

```sql
SELECT * FROM states WHERE [Key] = 'mypets||cat||leroy||food'
```

> **警告:** 您不应该手动更新或删除存储引擎中的状态， 所有的写入和删除操作都应该通过Dapr运行时来完成。 所有的写入和删除操作都应该通过Dapr运行时来完成。
