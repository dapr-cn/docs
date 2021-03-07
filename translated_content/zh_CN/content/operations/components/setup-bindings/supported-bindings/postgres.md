---
type: docs
title: "PostgrSQL binding spec"
linkTitle: "PostgrSQL"
description: "Detailed documentation on the PostgreSQL binding component"
---

## Component format

To setup PostgreSQL binding create a component of type `bindings.postgres`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration. To setup Redis binding create a component of type `bindings.redis`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


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
以上示例将 Secret 明文存储。 The example configuration shown above, contain a username and password as plain-text strings. 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Spec metadata fields

| 字段  | Required | Binding support | Details                                                             | Example                                                                                     |
| --- |:--------:| --------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| url |    Y     | Output          | Postgres connection string See [here](#url-format) for more details | `"user=dapr password=secret host=dapr.example.com port=5432 dbname=dapr sslmode=verify-ca"` |

### URL format

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


## 相关链接

This component supports **output binding** with the following operations:

- `exec`
- `query`
- `close`

### exec

The `exec` operation can be used for DDL operations (like table creation), as well as `INSERT`, `UPDATE`, `DELETE` operations which return only metadata (e.g. number of affected rows).

**Request**

```json
{
  "operation": "exec",
  "metadata": {
    "sql": "INSERT INTO foo (id, c1, ts) VALUES (1, 'demo', '2020-09-24T11:45:05Z07:00')"
  }
}
```

**Response**

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

The `query` operation is used for `SELECT` statements, which returns the metadata along with data in a form of an array of row values.

**Request**

```json
{
  "operation": "query",
  "metadata": {
    "sql": "SELECT * FROM foo WHERE id < 3"
  }
}
```

**Response**

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

Finally, the `close` operation can be used to explicitly close the DB connection and return it to the pool. This operation doesn't have any response. This operation doesn't have any response.

**Request**

```json
{
  "operation": "close"
}
```


> Note, the PostgreSql binding itself doesn't prevent SQL injection, like with any database application, validate the input before executing query.

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
