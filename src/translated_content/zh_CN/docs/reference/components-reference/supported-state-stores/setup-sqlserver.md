---
type: docs
title: "Microsoft SQL Server & Azure SQL"
linkTitle: "Microsoft SQL Server & Azure SQL"
description: 详细介绍 Microsoft SQL Server 状态存储组件
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-sqlserver/"
---

## 组件格式

该状态存储组件适用于 [Microsoft SQL Server](https://learn.microsoft.com/sql/) 和 [Azure SQL](https://learn.microsoft.com/azure/azure-sql/)。

要配置此状态存储，请创建一个类型为 `state.sqlserver` 的组件。请参考[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.sqlserver
  version: v1
  metadata:
    # 使用 SQL Server 凭据进行身份验证
    - name: connectionString
      value: |
        Server=myServerName\myInstanceName;Database=myDataBase;User Id=myUsername;Password=myPassword;

    # 使用 Microsoft Entra ID 进行身份验证（仅限 Azure SQL）
    # "useAzureAD" 设置为 "true"
    - name: useAzureAD
      value: true
    # Azure SQL 数据库的连接字符串或 URL，可选包含数据库
    - name: connectionString
      value: |
        sqlserver://myServerName.database.windows.net:1433?database=myDataBase

    # 其他可选字段（列出默认值）
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
   # 如果希望使用 Microsoft SQL Server 作为 actor 的状态存储，请取消注释此行（可选）
   #- name: actorStateStore
   #  value: "true"
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为密钥。建议使用密钥存储来保护密钥，具体方法请参见[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

如果希望将 SQL Server 用作 [actor 状态存储]({{< ref "state_api.md#configuring-state-store-for-actors" >}})，请在元数据中添加以下内容：

```yaml
  - name: actorStateStore
    value: "true"
```

## 规格元数据字段

### 使用 SQL Server 凭据进行身份验证

以下元数据选项是使用 SQL Server 凭据进行身份验证所**必需**的。这在 SQL Server 和 Azure SQL 上均受支持。

| 字段  | 必需 | 详情 | 示例 |
|--------|:--------:|---------|---------|
| `connectionString` | Y | 用于连接的连接字符串。<br>如果连接字符串中包含数据库，则该数据库必须已存在。否则，如果省略数据库，则会创建一个名为 "Dapr" 的默认数据库。  | `"Server=myServerName\myInstanceName;Database=myDataBase;User Id=myUsername;Password=myPassword;"` |

### 使用 Microsoft Entra ID 进行身份验证

使用 Microsoft Entra ID 进行身份验证仅在 Azure SQL 上受支持。Dapr 支持的所有身份验证方法均可使用，包括客户端凭据（"服务主体"）和托管身份。

| 字段  | 必需 | 详情 | 示例 |
|--------|:--------:|---------|---------|
| `useAzureAD` | Y | 必须设置为 `true` 以使组件能够从 Microsoft Entra ID 检索访问令牌。 | `"true"` |
| `connectionString` | Y | Azure SQL 数据库的连接字符串或 URL，**不含凭据**。<br>如果连接字符串中包含数据库，则该数据库必须已存在。否则，如果省略数据库，则会创建一个名为 "Dapr" 的默认数据库。  | `"sqlserver://myServerName.database.windows.net:1433?database=myDataBase"` |
| `azureTenantId` | N | Microsoft Entra ID 租户的 ID | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"` |
| `azureClientId` | N | 客户端 ID（应用程序 ID） | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"` |
| `azureClientSecret` | N | 客户端密钥（应用程序密码） | `"Ecy3XG7zVZK3/vl/a2NSB+a1zXLa8RnMum/IgD0E"` |

### 其他元数据选项

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| `tableName`          | N        | 要使用的表名。字母数字加下划线。默认为 `"state"` | `"table_name"`
| `metadataTableName` | N | Dapr 用于存储一些元数据属性的表名。默认为 `dapr_metadata`。 | `"dapr_metadata"`
| `keyType`            | N        | 使用的键类型。支持的值：`"string"`（默认）、`"uuid"`、`"integer"`。| `"string"`
| `keyLength`          | N        | 键的最大长度。如果 "keyType" 不是 `string`，则忽略。默认为 `"200"` | `"200"`
| `schema`             | N        | 要使用的模式。默认为 `"dbo"` | `"dapr"`,`"dbo"`
| `indexedProperties`  | N        | 索引属性列表，作为包含 JSON 文档的字符串。 |  `'[{"column": "transactionid", "property": "id", "type": "int"}, {"column": "customerid", "property": "customer", "type": "nvarchar(100)"}]'`
| `actorStateStore` | N | 指示 Dapr 应为 actor 状态存储配置此组件（[更多信息]({{< ref "state_api.md#configuring-state-store-for-actors" >}})）。 | `"true"`
| `cleanupIntervalInSeconds` | N | 清理具有过期 TTL 的行的间隔（以秒为单位）。默认值：`"3600"`（即 1 小时）。将此值设置为 <=0 可禁用定期清理。 | `"1800"`, `"-1"`

## 创建 Microsoft SQL Server/Azure SQL 实例

[按照说明](https://docs.microsoft.com/azure/azure-sql/database/single-database-create-quickstart?view=azuresql&tabs=azure-portal)从 Azure 文档中了解如何创建 SQL 数据库。数据库必须在 Dapr 使用之前创建。

为了将 SQL Server 设置为状态存储，您需要以下属性：

- **连接字符串**：SQL Server 连接字符串。例如：server=localhost;user id=sa;password=your-password;port=1433;database=mydatabase;
- **模式**：要使用的数据库模式（默认=dbo）。如果不存在，将被创建
- **表名**：数据库表名。如果不存在，将被创建
- **索引属性**：来自 json 数据的可选属性，将被索引并作为单独的列持久化

### 创建专用用户

当使用专用用户（非 `sa`）连接时，即使用户是所需数据库模式的所有者，也需要为用户提供以下授权：

- `CREATE TABLE`
- `CREATE TYPE`

### TTL 和清理

此状态存储支持 Dapr 存储的记录的 [生存时间 (TTL)]({{< ref state-store-ttl.md >}})。使用 Dapr 存储数据时，您可以设置 `ttlInSeconds` 元数据属性，以指示数据在多少秒后应被视为“过期”。

由于 SQL Server 没有内置的 TTL 支持，Dapr 通过在状态表中添加一列来实现这一点，该列指示数据何时应被视为“过期”。即使“过期”记录仍然物理存储在数据库中，也不会返回给调用者。后台“垃圾收集器”定期扫描状态表以查找过期的行并删除它们。

您可以使用 `cleanupIntervalInSeconds` 元数据属性设置过期记录删除的间隔，默认为 3600 秒（即 1 小时）。

- 较长的间隔需要较少频繁地扫描过期行，但可能需要更长时间存储过期记录，可能需要更多的存储空间。如果您计划在状态表中存储许多记录，并且 TTL 较短，请考虑将 `cleanupIntervalInSeconds` 设置为较小的值 - 例如，`300`（300 秒，或 5 分钟）。
- 如果您不打算在 Dapr 和 SQL Server 状态存储中使用 TTL，您应该考虑将 `cleanupIntervalInSeconds` 设置为 <= 0 的值（例如 `0` 或 `-1`）以禁用定期清理并减少数据库的负载。

状态存储在 `ExpireDate` 列上没有索引，这意味着每次清理操作都必须执行全表扫描。如果您打算在表中写入大量使用 TTL 的记录，您应该考虑在 `ExpireDate` 列上创建索引。索引使查询更快，但使用更多的存储空间并略微减慢写入速度。

```sql
CREATE CLUSTERED INDEX expiredate_idx ON state(ExpireDate ASC)
```

## 相关链接

- [Dapr 组件的基本模式]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取有关配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
