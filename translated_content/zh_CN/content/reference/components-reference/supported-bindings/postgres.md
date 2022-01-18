---
type: docs
title: "PostgrSQL binding spec"
linkTitle: "PostgreSQL"
description: "Detailed documentation on the PostgreSQL binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/postgres/"
---

## 配置

要设置与 PostgreSQL相关的 绑定,需要创建类型 `bindings.postgres` 的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.postgres
  version: v1
  metadata:
  - name: url # Required
    value: <CONNECTION_STRING>
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段  | 必填 | 绑定支持 | 详情                                     | 示例                                                                                          |
| --- |:--:| ---- | -------------------------------------- | ------------------------------------------------------------------------------------------- |
| url | Y  | 输出   | Postgres连接字符串的写法，请参阅此处 [](#url-format) | `"user=dapr password=secret host=dapr.example.com port=5432 dbname=dapr sslmode=verify-ca"` |

### URL格式

The PostgreSQL binding uses [pgx connection pool](https://github.com/jackc/pgx) internally so the `url` parameter can be any valid connection string, either in a `DSN` or `URL` format:

**Example DSN**

```shell
user=dapr password=secret host=dapr.example.com port=5432 dbname=dapr sslmode=verify-ca
```

**Example URL**

```shell
postgres://dapr:secret@dapr.example.com:5432/dapr?sslmode=verify-ca
```

Both methods also support connection pool configuration variables:

- `pool_min_conns`: integer 0 or greater
- `pool_max_conns`: integer greater than 0
- `pool_max_conn_lifetime`: duration string
- `pool_max_conn_idle_time`: duration string
- `pool_health_check_period`: duration string


## 绑定支持

字段名为 `ttlInSeconds`。

- `exec`
- `query`
- `close`

### exec

`exec` 操作可用于 DDL 操作（如表创建），以及 `INSERT`、 `UPDATE`、 `DELETE` 仅返回元数据的操作（例如受影响的行数）。

**请求**

```json
{
  "operation": "exec",
  "metadata": {
    "sql": "INSERT INTO foo (id, c1, ts) VALUES (1, 'demo', '2020-09-24T11:45:05Z07:00')"
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
    "sql": "INSERT INTO foo (id, c1, ts) VALUES (1, 'demo', '2020-09-24T11:45:05Z07:00')"
  }
}
```

### query

`query` 操作用于 `SELECT` 语句，该语句以行值数组的形式返回元数据和数据。

**请求**

```json
{
  "operation": "query",
  "metadata": {
    "sql": "SELECT * FROM foo WHERE id < 3"
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
    "sql": "SELECT * FROM foo WHERE id < 3"
  },
  "data": "[
    [0,\"test-0\",\"2020-09-24T04:13:46Z\"],
    [1,\"test-1\",\"2020-09-24T04:13:46Z\"],
    [2,\"test-2\",\"2020-09-24T04:13:46Z\"]
  ]"
}
```

### close

最后， `close` 操作可用于显式关闭数据库连接并将其返回到池中。 此操作没有任何响应。

**请求**

```json
{
  "operation": "close"
}
```


> Note, the PostgreSql binding itself doesn't prevent SQL injection, like with any database application, validate the input before executing query.

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
