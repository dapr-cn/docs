---
type: docs
title: "MySQL & MariaDB 绑定规范"
linkTitle: "MySQL & MariaDB"
description: "关于 MySQL 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/mysql/"
---

## 组件格式

MySQL 绑定支持连接 MySQL 和 MariaDB 数据库。在本文档中，"MySQL" 用于指代这两个数据库。

要设置 MySQL 绑定，请创建一个类型为 `bindings.mysql` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

MySQL 绑定使用 [Go-MySQL-Driver](https://github.com/go-sql-driver/mysql) 作为内部驱动。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.mysql
  version: v1
  metadata:
    - name: url # 必需，定义数据库连接的 DSN 格式
      value: "<CONNECTION_STRING>"
    - name: pemPath # 可选
      value: "<PEM PATH>"
    - name: maxIdleConns
      value: "<MAX_IDLE_CONNECTIONS>"
    - name: maxOpenConns
      value: "<MAX_OPEN_CONNECTIONS>"
    - name: connMaxLifetime
      value: "<CONNECTION_MAX_LIFE_TIME>"
    - name: connMaxIdleTime
      value: "<CONNECTION_MAX_IDLE_TIME>"
```

{{% alert title="警告" color="warning" %}}
上面的示例使用明文字符串作为 secret。建议使用 secret 存储来存储 secret，如[此处]({{< ref component-secrets.md >}})所述。
请注意，您不能仅为用户名/密码使用 secret。如果使用 secret，必须用于完整的连接字符串。
{{% /alert %}}

## 规范元数据字段

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `url` | Y | 输出 | 以数据源名称 (DSN) 格式表示数据库连接。查看 [此处](#ssl-connection-details) 的 SSL 详情 | `"user:password@tcp(localhost:3306)/dbname"` |
| `pemPath` | Y | 输出 | PEM 文件的路径。用于 SSL 连接 | `"path/to/pem/file"` |
| `maxIdleConns` | N | 输出 | 最大空闲连接数。大于 0 的整数 | `"10"` |
| `maxOpenConns` | N | 输出 | 最大打开连接数。大于 0 的整数 | `"10"` |
| `connMaxLifetime` | N | 输出 | 最大连接生命周期。格式为持续时间字符串，例如 `"12s"` | `"12s"` |
| `connMaxIdleTime` | N | 输出 | 最大连接空闲时间。格式为持续时间字符串，例如 `"12s"` | `"12s"` |

### SSL 连接

如果您的服务器需要 SSL，您的连接字符串必须以 `&tls=custom` 结尾，例如：

```bash
"<user>:<password>@tcp(<server>:3306)/<database>?allowNativePasswords=true&tls=custom"
```

> 您必须将 `<PEM PATH>` 替换为 PEM 文件的完整路径。如果您使用的是 Azure Database for MySQL，请参阅 Azure [关于 SSL 数据库连接的文档](https://learn.microsoft.com/azure/mysql/single-server/how-to-configure-ssl)，了解如何下载所需的证书。连接到 MySQL 需要最低 TLS 版本为 1.2。

### 多语句

默认情况下，[MySQL Go 驱动](https://github.com/go-sql-driver/mysql) 仅支持每个查询/命令一个 SQL 语句。

要在一个查询中允许多个语句，您需要在查询字符串中添加 `multiStatements=true`，例如：

```bash
"<user>:<password>@tcp(<server>:3306)/<database>?multiStatements=true"
```

虽然这允许批量查询，但也大大增加了 SQL 注入的风险。仅返回第一个查询的结果，所有其他结果将被静默丢弃。

## 绑定支持

此组件支持具有以下操作的**输出绑定**：

- `exec`
- `query`
- `close`

### 参数化查询

此绑定支持参数化查询，允许将 SQL 查询本身与用户提供的值分开。强烈建议使用参数化查询以提高安全性，因为它们可以防止 [SQL 注入攻击](https://owasp.org/www-community/attacks/SQL_Injection)。

例如：

```sql
-- ❌ 错误！在查询中包含值，容易受到 SQL 注入攻击。
SELECT * FROM mytable WHERE user_key = 'something';

-- ✅ 好！使用参数化查询。
-- 这将使用参数 ["something"] 执行
SELECT * FROM mytable WHERE user_key = ?;
```

### exec

`exec` 操作可用于 DDL 操作（如表创建），以及返回仅元数据的 `INSERT`、`UPDATE`、`DELETE` 操作（例如受影响的行数）。

`params` 属性是一个包含 JSON 编码参数数组的字符串。

**请求**

```json
{
  "operation": "exec",
  "metadata": {
    "sql": "INSERT INTO foo (id, c1, ts) VALUES (?, ?, ?)",
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
    "sql": "INSERT INTO foo (id, c1, ts) VALUES (?, ?, ?)"
  }
}
```

### query

`query` 操作用于 `SELECT` 语句，返回元数据以及以行值数组形式的数据。

`params` 属性是一个包含 JSON 编码参数数组的字符串。

**请求**

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
    "sql": "SELECT * FROM foo WHERE id < ?"
  },
  "data": [
    {column_name: value, column_name: value, ...},
    {column_name: value, column_name: value, ...},
    {column_name: value, column_name: value, ...},
  ]
}
```

这里的 column_name 是查询返回的列名，value 是该列的值。请注意，值以字符串或数字（语言特定的数据类型）返回。

### close

`close` 操作可用于显式关闭数据库连接并将其返回到池中。此操作没有任何响应。

**请求**

```json
{
  "operation": "close"
}
```

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
