---
type: docs
title: "SQL Server"
linkTitle: "SQL Server"
description: SQL Server 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-sqlserver/"
---

## 配置

要设置 SQL Server 状态存储，请创建个类型为 `state.sqlserver` 的组件。 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。


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
    value: <REPLACE-WITH-TABLE-NAME>  # Optional. defaults to "state"
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

如果您想要使用 SQL Server 作为 [actor 状态存储]({{< ref "state_api.md#configuring-state-store-for-actors" >}}) ，请在 yaml 上附上以下内容。

```yaml
  - name: actorStateStore
    value: "true"
```

## 元数据字段规范

| 字段                | 必填 | 详情                                                                                                      | 示例                                                                                                                                            |
| ----------------- |:--:| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| connectionString  | Y  | 用于连接的连接字符串。 如果连接字符串包含数据库，则该数据库必须已存在。 如果数据库被省略，将会创建一个名为 `"Dapr"` 的默认数据库。                                 | `"Server=myServerName\myInstanceName;Database=myDataBase;User Id=myUsername;Password=myPassword;"`                                           |
| tableName         | N  | 要使用的表名称。 带下划线的字母数字。 默认值为 `"state"`                                                                      | `"table_name"`                                                                                                                                |
| keyType           | N  | 键使用的数据类型。 默认为 `"string"`                                                                                | `"string"`                                                                                                                                    |
| keyLength         | N  | 键的最大长度。 与 `"string"` keyType 一起使用。 默认值为 `"200"`                                                         | `"200"`                                                                                                                                       |
| schema            | N  | 要使用的schema名称。 默认为 `"dbo"`                                                                               | `"dapr"`,`"dbo"`                                                                                                                              |
| indexedProperties | N  | 索引属性列表。                                                                                                 | `'[{"column": "transactionid", "property": "id", "type": "int"}, {"column": "customerid", "property": "customer", "type": "nvarchar(100)"}]'` |
| actorStateStore   | N  | 指示 Dapr 是否应该将为 actor 状态存储配置该组件 ([更多信息]({{< ref "state_api.md#configuring-state-store-for-actors" >}}))。 | `"true"`                                                                                                                                      |


## 创建 Azure SQL 实例

按照 Azure 文档中有关如何创建 SQL 数据库的说明[进行操作](https://docs.microsoft.com/azure/sql-database/sql-database-single-database-get-started?tabs=azure-portal) 。  必须在 Dapr 使用数据库之前创建数据库。

**注意：SQL Server 状态存储还支持在 VM 和 Docker 中运行 SQL Server。**

为了配置 SQL Server 作为状态存储，您需要如下属性：

- **Connection String**: SQL Server 连接字符串。 例如： server=localhost;user id=sa;password=your-password;port=1433;database=mydatabase;
- **Schema**: 要使用的数据库模式 (default=dbo). 如果不存在将会被创建
- **Table Name**: 数据库表名称。 如果不存在将会被创建
- **Indexed Properties**: json 数据的可选属性，这些属性将会作为独立的列进行索引的保存

### 创建专用用户

当使用专用用户 (不是 `sa`) 进行连接， 用户需要这些授权 - 即使该用户是所需数据的模式的所有者：

- `CREATE TABLE`
- `CREATE TYPE`

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
