---
type: docs
title: "MySQL 绑定规范"
linkTitle: "MySQL"
description: "MySQL 组件绑定详细说明"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/mysql/"
---

## Component format

To setup MySQL binding create a component of type `bindings.mysql`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

MySQL 绑定在内部使用[Go-MySQL-驱动程序](https://github.com/go-sql-driver/mysql) 。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.mysql
  version: v1
  metadata:
    - name: url # Required, define DB connection in DSN format
      value: <CONNECTION_STRING>
    - name: pemPath # Optional
      value: <PEM PATH>
    - name: maxIdleConns
      value: <MAX_IDLE_CONNECTIONS>
    - name: maxOpenConns
      value: <MAX_OPEN_CONNECTIONS>
    - name: connMaxLifetime
      value: <CONNECTILN_MAX_LIFE_TIME>
    - name: connMaxIdleTime
      value: <CONNECTION_MAX_IDLE_TIME>
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。 Note that you can not use secret just for username/password. If you use secret, it has to be for the complete connection string.
{{% /alert %}}

## 元数据字段规范

| Field           | 必填 | 绑定支持   | 详情                                                                                                        | 示例                                           |
| --------------- |:--:| ------ | --------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| url             | 是  | Output | Represent DB connection in Data Source Name (DNS) format. See [here](#ssl-connection-details) SSL details | `"user:password@tcp(localhost:3306)/dbname"` |
| pemPath         | 是  | 输出     | PEM 文件的路径。 用于SSL 连接                                                                                       | `"path/to/pem/file"`                         |
| maxIdleConns    | 否  | 输出     | 最大空闲连接数。 大于 0 的整数                                                                                         | `"10"`                                       |
| maxOpenConns    | 否  | 输出     | 最大打开连接数。 大于 0 的整数                                                                                         | `"10"`                                       |
| connMaxLifetime | 否  | 输出     | 最长连接生存期。 持续时间字符串                                                                                          | `"12s"`                                      |
| connMaxIdleTime | 否  | Output | 最大连接空闲时间。 持续时间字符串                                                                                         | `"12s"`                                      |

### SSL connection

如果您的服务器需要 SSL，则连接字符串必须以 `&tls=custom` 结尾，例如：
```bash
"<user>:<password>@tcp(<server>:3306)/<database>?allowNativePasswords=true&tls=custom"
```
 您必须使用完整的PEM文件路径替换 `<PEM PATH>` 。 如果你使用 [运行在 Azure 上的 MySQL](http://bit.ly/AzureMySQLSSL) 请查阅 Azure [关于SSL数据库连接的文档](http://bit.ly/MySQLSSL)，来了解有关如何下载必要凭证的信息。 与 MySQL 的连接至少需要1.2版本及以上的 TLS。

Also note that by default [MySQL go driver](https://github.com/go-sql-driver/mysql) only supports one SQL statement per query/command. To allow multiple statements in one query you need to add `multiStatements=true` to a query string, for example:
```bash
"<user>:<password>@tcp(<server>:3306)/<database>?multiStatements=true"
```
While this allows batch queries, it also greatly increases the risk of SQL injections. Only the result of the first query is returned, all other results are silently discarded.

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `exec`
- `query`
- `close`

### 执行

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
  "data": [
    {column_name: value, column_name: value, ...},
    {column_name: value, column_name: value, ...},
    {column_name: value, column_name: value, ...},
  ]
}
```

Here column_name is the name of the column returned by query, and value is a value of this column. Note that values are returned as string or numbers (language specific data type)

### close

Finally, the `close` operation can be used to explicitly close the DB connection and return it to the pool. This operation doesn't have any response.

**Request**

```json
{
  "operation": "close"
}
```

> 请注意，MySQL绑定本身不会阻止SQL注入，就像任何数据库应用程序一样，在执行查询之前验证输入。

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
