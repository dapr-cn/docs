---
type: docs
title: "Microsoft SQL Server & Azure SQL"
linkTitle: "Microsoft SQL Server & Azure SQL"
description: Detailed information on the Microsoft SQL Server state store component
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-sqlserver/"
---

## Component format

This state store component can be used with both [Microsoft SQL Server](https://learn.microsoft.com/sql/) and [Azure SQL](https://learn.microsoft.com/azure/azure-sql/).

To set up this state store, create a component of type `state.sqlserver`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.sqlserver
  version: v1
  metadata:
    # Authenticate using SQL Server credentials
    - name: connectionString
      value: |
        Server=myServerName\myInstanceName;Database=myDataBase;User Id=myUsername;Password=myPassword;

    # Authenticate with Microsoft Entra ID (Azure SQL only)
    # "useAzureAD" be set to "true"
    - name: useAzureAD
      value: true
    # Connection string or URL of the Azure SQL database, optionally containing the database
    - name: connectionString
      value: |
        sqlserver://myServerName.database.windows.net:1433?database=myDataBase

    # Other optional fields (listing default values)
    - name: tableName
      value: "state"
    - name: metadataTableName
      value: "dapr_metadata"
    - name: schema
      value: "dbo"
    - name: keyType
      value: "string"
    - name: keyLength
      value: "200"
    - name: indexedProperties
      value: ""
    - name: cleanupIntervalInSeconds
      value: "3600"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

If you wish to use SQL server as an [actor state store]({{< ref "state_api.md#configuring-state-store-for-actors" >}}), append the following to the metadata:

```yaml
  - name: actorStateStore
    value: "true"
```

## 元数据字段规范

### Authenticate using SQL Server credentials

The following metadata options are **required** to authenticate using SQL Server credentials. This is supported on both SQL Server and Azure SQL.

| Field              | Required | 详情                                                                                                                                                                                                        | 示例                                                                                                  |
| ------------------ |:--------:| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `connectionString` |    是     | The connection string used to connect.<br>If the connection string contains the database, it must already exist. Otherwise, if the database is omitted, a default database named "Dapr" is created. | `"Server=myServerName\myInstanceName;Database=myDataBase;User Id=myUsername;Password=myPassword;"` |

### Authenticate using Microsoft Entra ID

Authenticating with Microsoft Entra ID is supported with Azure SQL only. All authentication methods supported by Dapr can be used, including client credentials ("service principal") and Managed Identity.

| Field               | Required | 详情                                                                                                                                                                                                                                                  | 示例                                                                         |
| ------------------- |:--------:| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `useAzureAD`        |    是     | Must be set to `true` to enable the component to retrieve access tokens from Microsoft Entra ID.                                                                                                                                                    | `"true"`                                                                   |
| `connectionString`  |    是     | The connection string or URL of the Azure SQL database, **without credentials**.<br>If the connection string contains the database, it must already exist. Otherwise, if the database is omitted, a default database named "Dapr" is created. | `"sqlserver://myServerName.database.windows.net:1433?database=myDataBase"` |
| `azureTenantId`     |    否     | ID of the Microsoft Entra ID tenant                                                                                                                                                                                                                 | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"`                                   |
| `azureClientId`     |    否     | 客户端 ID（应用程序 ID）                                                                                                                                                                                                                                     | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"`                                   |
| `azureClientSecret` |    否     | 客户端 secret（应用程序密码）                                                                                                                                                                                                                                  | `"Ecy3XG7zVZK3/vl/a2NSB+a1zXLa8RnMum/IgD0E"`                               |

### Other metadata options

| Field                      | Required | 详情                                                                                                                                                     | 示例                                                                                                                                            |
| -------------------------- |:--------:| ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `tableName`                |    否     | 要使用的表名称。 带下划线的字母数字。 默认值为 `"state"`                                                                                                                     | `"table_name"`                                                                                                                                |
| `metadataTableName`        |    否     | Name of the table Dapr uses to store a few metadata properties. Defaults to `dapr_metadata`.                                                           | `"dapr_metadata"`                                                                                                                             |
| `keyType`                  |    否     | 键使用的数据类型。 Supported values: `"string"` (default), `"uuid"`, `"integer"`.                                                                               | `"string"`                                                                                                                                    |
| `keyLength`                |    否     | 键的最大长度。 Ignored if "keyType" is not `string`. Defaults to `"200"`                                                                                      | `"200"`                                                                                                                                       |
| `schema`                   |    否     | 要使用的schema名称。 默认为 `"dbo"`                                                                                                                              | `"dapr"`,`"dbo"`                                                                                                                              |
| `indexedProperties`        |    否     | List of indexed properties, as a string containing a JSON document.                                                                                    | `'[{"column": "transactionid", "property": "id", "type": "int"}, {"column": "customerid", "property": "customer", "type": "nvarchar(100)"}]'` |
| `actorStateStore`          |    否     | 指示 Dapr 是否应该将为 actor 状态存储配置该组件 ([更多信息]({{< ref "state_api.md#configuring-state-store-for-actors" >}}))。                                                | `"true"`                                                                                                                                      |
| `cleanupIntervalInSeconds` |    否     | Interval, in seconds, to clean up rows with an expired TTL. Default: `"3600"` (i.e. 1 hour). Setting this to values <=0 disables the periodic cleanup. | `"1800"`, `"-1"`                                                                                                                              |


## Create a Microsoft SQL Server/Azure SQL instance

按照 Azure 文档中有关如何创建 SQL 数据库的说明[进行操作](https://docs.microsoft.com/azure/azure-sql/database/single-database-create-quickstart?view=azuresql&tabs=azure-portal) 。 必须在 Dapr 使用数据库之前创建数据库。

为了配置 SQL Server 作为状态存储，您需要如下属性：

- **Connection String**: The SQL Server connection string. For example: server=localhost;user id=sa;password=your-password;port=1433;database=mydatabase;
- **Schema**: The database schema to use (default=dbo). Will be created if does not exist
- **Table Name**: The database table name. Will be created if does not exist
- **Indexed Properties**: Optional properties from json data which will be indexed and persisted as individual column

### 创建专用用户

当使用专用用户 (不是 `sa`) 进行连接， 用户需要这些授权 - 即使该用户是所需数据的模式的所有者：

- `CREATE TABLE`
- `CREATE TYPE`

### TTLs and cleanups

This state store supports [Time-To-Live (TTL)]({{< ref state-store-ttl.md >}}) for records stored with Dapr. When storing data using Dapr, you can set the `ttlInSeconds` metadata property to indicate after how many seconds the data should be considered "expired".

Because SQL Server doesn't have built-in support for TTLs, Dapr implements this by adding a column in the state table indicating when the data should be considered "expired". "Expired" records are not returned to the caller, even if they're still physically stored in the database. A background "garbage collector" periodically scans the state table for expired rows and deletes them.

You can set the interval for the deletion of expired records with the `cleanupIntervalInSeconds` metadata property, which defaults to 3600 seconds (that is, 1 hour).

- Longer intervals require less frequent scans for expired rows, but can require storing expired records for longer, potentially requiring more storage space. If you plan to store many records in your state table, with short TTLs, consider setting `cleanupIntervalInSeconds` to a smaller value - for example, `300` (300 seconds, or 5 minutes).
- If you do not plan to use TTLs with Dapr and the SQL Server state store, you should consider setting `cleanupIntervalInSeconds` to a value <= 0 (e.g. `0` or `-1`) to disable the periodic cleanup and reduce the load on the database.

The state store does not have an index on the `ExpireDate` column, which means that each clean up operation must perform a full table scan. If you intend to write to the table with a large number of records that use TTLs, you should consider creating an index on the `ExpireDate` column. An index makes queries faster, but uses more storage space and slightly slows down writes.

```sql
CREATE CLUSTERED INDEX expiredate_idx ON state(ExpireDate ASC)
```

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
