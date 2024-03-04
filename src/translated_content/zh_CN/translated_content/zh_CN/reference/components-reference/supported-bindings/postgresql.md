---
type: docs
title: "PostgrSQL 绑定规范"
linkTitle: "PostgreSQL"
description: "PostgreSQL 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/postgresql/"
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/postgres/"
---

## Component format

To setup PostgreSQL binding create a component of type `bindings.postgresql`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.postgresql
  version: v1
  metadata:
    # Connection string
    - name: connectionString
      value: "<CONNECTION STRING>"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

### Authenticate using a connection string

The following metadata options are **required** to authenticate using a PostgreSQL connection string.

| Field              | Required | 详情                                                                                                                                                                                                                              | 示例                                                                                            |
| ------------------ |:--------:| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `connectionString` |    是     | The connection string for the PostgreSQL database. See the PostgreSQL [documentation on database connections](https://www.postgresql.org/docs/current/libpq-connect.html) for information on how to define a connection string. | `"host=localhost user=postgres password=example port=5432 connect_timeout=10 database=my_db"` |

### Authenticate using Microsoft Entra ID

Authenticating with Microsoft Entra ID is supported with Azure Database for PostgreSQL. All authentication methods supported by Dapr can be used, including client credentials ("service principal") and Managed Identity.

| Field               | Required | 详情                                                                                                                                                                                                                                                                                                                                                                             | 示例                                                                                                    |
| ------------------- |:--------:| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `useAzureAD`        |    是     | Must be set to `true` to enable the component to retrieve access tokens from Microsoft Entra ID.                                                                                                                                                                                                                                                                               | `"true"`                                                                                              |
| `connectionString`  |    是     | The connection string for the PostgreSQL database.<br>This must contain the user, which corresponds to the name of the user created inside PostgreSQL that maps to the Microsoft Entra ID identity; this is often the name of the corresponding principal (e.g. the name of the Microsoft Entra ID application). This connection string should not contain any password. | `"host=mydb.postgres.database.azure.com user=myapplication port=5432 database=my_db sslmode=require"` |
| `azureTenantId`     |    否     | ID of the Microsoft Entra ID tenant                                                                                                                                                                                                                                                                                                                                            | `"cd4b2887-304c-…"`                                                                                   |
| `azureClientId`     |    否     | 客户端 ID（应用程序 ID）                                                                                                                                                                                                                                                                                                                                                                | `"c7dd251f-811f-…"`                                                                                   |
| `azureClientSecret` |    否     | 客户端 secret（应用程序密码）                                                                                                                                                                                                                                                                                                                                                             | `"Ecy3X…"`                                                                                            |

### Other metadata options

| Field                   | Required | 绑定支持   | 详情                                                                                                                                                                                                                                                                                              | 示例                  |
| ----------------------- |:--------:| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `maxConns`              |    否     | Output | Maximum number of connections pooled by this component. Set to 0 or lower to use the default value, which is the greater of 4 or the number of CPUs.                                                                                                                                            | `"4"`               |
| `connectionMaxIdleTime` |    否     | Output | Max idle time before unused connections are automatically closed in the connection pool. By default, there's no value and this is left to the database driver to choose.                                                                                                                        | `"5m"`              |
| `queryExecMode`         |    否     | Output | Controls the default mode for executing queries. By default Dapr uses the extended protocol and automatically prepares and caches prepared statements. However, this may be incompatible with proxies such as PGBouncer. In this case it may be preferrable to use `exec` or `simple_protocol`. | `"simple_protocol"` |

### URL format

The PostgreSQL binding uses [pgx connection pool](https://github.com/jackc/pgx) internally so the `connectionString` parameter can be any valid connection string, either in a `DSN` or `URL` format:

**DSN示例**

```shell
user=dapr password=secret host=dapr.example.com port=5432 dbname=my_dapr sslmode=verify-ca
```

**URL示例**

```shell
postgres://dapr:secret@dapr.example.com:5432/my_dapr?sslmode=verify-ca
```

这两种方法还支持连接池配置变量：

- `pool_min_conns`: integer 0 or greater
- `pool_max_conns`: integer greater than 0
- `pool_max_conn_lifetime`: duration string
- `pool_max_conn_idle_time`: duration string
- `pool_health_check_period`: duration string


## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `exec`
- `query`
- `close`

### Parametrized queries

This binding supports parametrized queries, which allow separating the SQL query itself from user-supplied values. The usage of parametrized queries is **strongly recommended** for security reasons, as they prevent [SQL Injection attacks](https://owasp.org/www-community/attacks/SQL_Injection).

For example:

```sql
-- ❌ WRONG! Includes values in the query and is vulnerable to SQL Injection attacks.
SELECT * FROM mytable WHERE user_key = 'something';

-- ✅ GOOD! Uses parametrized queries.
-- This will be executed with parameters ["something"]
SELECT * FROM mytable WHERE user_key = $1;
```

### exec

The `exec` operation can be used for DDL operations (like table creation), as well as `INSERT`, `UPDATE`, `DELETE` operations which return only metadata (e.g. number of affected rows).

The `params` property is a string containing a JSON-encoded array of parameters.

**Request**

```json
{
  "operation": "exec",
  "metadata": {
    "sql": "INSERT INTO foo (id, c1, ts) VALUES ($1, $2, $3)",
    "params": "[1, \"demo\", \"2020-09-24T11:45:05Z07:00\"]"
  }
}
```

**响应**

```json
{
  "metadata": {
    "operation": "exec",
    "duration": "294µs",
    "start-time": "2020-09-24T11:13:46.405097Z",
    "end-time": "2020-09-24T11:13:46.414519Z",
    "rows-affected": "1",
    "sql": "INSERT INTO foo (id, c1, ts) VALUES ($1, $2, $3)"
  }
}
```

### query

The `query` operation is used for `SELECT` statements, which returns the metadata along with data in a form of an array of row values.

The `params` property is a string containing a JSON-encoded array of parameters.

**Request**

```json
{
  "operation": "query",
  "metadata": {
    "sql": "SELECT * FROM foo WHERE id < $1",
    "params": "[3]"
  }
}
```

**响应**

```json
{
  "metadata": {
    "operation": "query",
    "duration": "432µs",
    "start-time": "2020-09-24T11:13:46.405097Z",
    "end-time": "2020-09-24T11:13:46.420566Z",
    "sql": "SELECT * FROM foo WHERE id < $1"
  },
  "data": "[
    [0,\"test-0\",\"2020-09-24T04:13:46Z\"],
    [1,\"test-1\",\"2020-09-24T04:13:46Z\"],
    [2,\"test-2\",\"2020-09-24T04:13:46Z\"]
  ]"
}
```

### close

The `close` operation can be used to explicitly close the DB connection and return it to the pool. This operation doesn't have any response.

**Request**

```json
{
  "operation": "close"
}
```

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
