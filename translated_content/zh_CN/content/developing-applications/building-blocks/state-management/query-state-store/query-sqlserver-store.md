---
type: docs
title: "SQL server"
linkTitle: "SQL server"
weight: 3000
description: "Use SQL server as a backend state store"
---

Dapr 在保存和检索状态时不会转换状态值。 Dapr 要求所有状态存储的实现都遵守特定格式(见 [Dapr状态管理规范]({{< ref state_api.md >}}))。 您可以直接与基础存储进行交互以操作状态数据，例如查询状态、创建聚合视图和进行备份。

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

执行下面的查询，以获得与ID为 "mypets "的应用程序中ID为 "cat "的actor类型的实例ID为 "leroy "的actor相关联的所有状态键：

```sql
SELECT * FROM states WHERE [Key] LIKE 'mypets||cat||leroy||%'
```

而要获得特定的actor状态，比如 "food"，可以执行以下查询：

```sql
SELECT * FROM states WHERE [Key] = 'mypets||cat||leroy||food'
```

> **警告** 您不应手动更新或删除存储区中的状态。 所有写入和删除操作都应通过 Dapr 运行时完成。
