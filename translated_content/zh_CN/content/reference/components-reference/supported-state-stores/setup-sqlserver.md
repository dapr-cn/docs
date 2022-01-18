---
type: docs
title: "SQL Server"
linkTitle: "SQL Server"
description: Detailed information on the SQL Server state store component
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-sqlserver/"
---

## 配置

To setup SQL Server state store create a component of type `state.sqlserver`. 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.sqlserver
  version: v1
  metadata:
  - name: connectionString
    value: <REPLACE-WITH-CONNECTION-STRING> # Required.
  - name: tableName
    value: <REPLACE-WITH-TABLE-NAME>  # Required.
  - name: keyType
    value: <REPLACE-WITH-KEY-TYPE>  # Optional. defaults to "string"
  - name: keyLength
    value: <KEY-LENGTH> # Optional. 默认值为 200。 Yo be used with "string" keyType
  - name: schema
    value: <SCHEMA> # Optional. defaults to "dbo"
  - name: indexedProperties
    value: <INDEXED-PROPERTIES> # Optional. List of IndexedProperties.

```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

If you wish to use Redis as an [actor state store]({{< ref "state_api.md#configuring-state-store-for-actors" >}}), append the following to the yaml.

```yaml
  - name: actorStateStore
    value: "true"
```

## 元数据字段规范

| 字段                | 必填 | 详情                                                                                                                                                                 | 示例                                                                                                  |
| ----------------- |:--:| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| connectionString  | Y  | The connection string used to connect                                                                                                                              | `"Server=myServerName\myInstanceName;Database=myDataBase;User Id=myUsername;Password=myPassword;"` |
| tableName         | Y  | The name of the table to use. Alpha-numeric with underscores                                                                                                       | `"table_name"`                                                                                      |
| keyType           | N  | The type of key used. Defaults to `"string"`                                                                                                                       | `"string"`                                                                                          |
| keyLength         | N  | The max length of key. Used along with `"string"` keytype. 默认值为 `"200"`                                                                                            | `"200"`                                                                                             |
| schema            | N  | The schema to use. Defaults to `"dbo"`                                                                                                                             | `"dapr"`,`"dbo"`                                                                                    |
| indexedProperties | N  | List of IndexedProperties.                                                                                                                                         | `"[{"ColumnName": "column", "Property": "property", "Type": "type"}]"`                              |
| actorStateStore   | N  | Indicates that Dapr should configure this component for the actor state store ([more information]({{< ref "state_api.md#configuring-state-store-for-actors" >}})). | `"true"`                                                                                            |


## Create Azure SQL instance

[Follow the instructions](https://docs.microsoft.com/azure/sql-database/sql-database-single-database-get-started?tabs=azure-portal) from the Azure documentation on how to create a SQL database.  The database must be created before Dapr consumes it.  The database must be created before Dapr consumes it.  The database must be created before Dapr consumes it.

**Note: SQL Server state store also supports SQL Server running on VMs.**

In order to setup SQL Server as a state store, you need the following properties:

- **Connection String**: the SQL Server connection string. For example: server=localhost;user id=sa;password=your-password;port=1433;database=mydatabase;
- **Schema**: The database schema to use (default=dbo). Will be created if does not exist
- **Table Name**: The database table name. Will be created if does not exist
- **Indexed Properties**: Optional properties from json data which will be indexed and persisted as individual column

### Create a dedicated user

When connecting with a dedicated user (not `sa`), these authorizations are required for the user - even when the user is owner of the desired database schema:

- `CREATE TABLE`
- `CREATE TYPE`

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
