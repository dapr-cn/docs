---
type: docs
title: "MySQL 绑定规范"
linkTitle: "MySQL"
description: "MySQL 组件绑定详细说明"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/mysql/"
---

## 配置

要设置 MySQL 绑定，请创建一个类型为 `bindings.mysql`的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。

MySQL 绑定在内部使用[Go-MySQL-驱动程序](https://github.com/go-sql-driver/mysql) 。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段              | 必填 | 绑定支持 | 详情                                                                 | 示例                                           |
| --------------- |:--:| ---- | ------------------------------------------------------------------ | -------------------------------------------- |
| url             | Y  | 输出   | 以数据源名称 （DNS） 格式表示数据库连接。 请参阅 [此处](#ssl-connection-details) SSL 详细信息 | `"user:password@tcp(localhost:3306)/dbname"` |
| pemPath         | Y  | 输出   | PEM 文件的路径。 用于SSL 连接                                                | `"path/to/pem/file"`                         |
| maxIdleConns    | N  | 输出   | 最大空闲连接数。 大于 0 的整数                                                  | `"10"`                                       |
| maxOpenConns    | N  | 输出   | 最大打开连接数。 大于 0 的整数                                                  | `"10"`                                       |
| connMaxLifetime | N  | 输出   | 最长连接生存期。 持续时间字符串                                                   | `"12s"`                                      |
| connMaxIdleTime | N  | 输出   | 最大连接空闲时间。 持续时间字符串                                                  | `"12s"`                                      |

### SSL connection

如果您的服务器需要 SSL，则连接字符串必须以 `&tls=custom` 结尾，例如：
```bash
"<user>:<password>@tcp(<server>:3306)/<database>?allowNativePasswords=true&tls=custom"
```
 您必须使用完整的PEM文件路径替换 `<PEM PATH>` 。 如果你使用 [运行在 Azure 上的 MySQL](http://bit.ly/AzureMySQLSSL) 请查阅 Azure [关于SSL数据库连接的文档](http://bit.ly/MySQLSSL)，来了解有关如何下载必要凭证的信息。 与 MySQL 的连接至少需要1.2版本及以上的 TLS。

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

> 请注意，MySQL绑定本身不会阻止SQL注入，就像任何数据库应用程序一样，在执行查询之前验证输入。

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
