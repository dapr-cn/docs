---
type: docs
title: "本地文件（用于开发）"
linkTitle: "本地文件"
description: 详细介绍本地文件 secret 存储组件
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/file-secret-store/"
---

此 Dapr secret 存储组件从指定文件读取纯文本 JSON，并且不使用身份验证。

{{% alert title="警告" color="warning" %}}
不建议在生产环境中使用这种 secret 管理方法。
{{% /alert %}}

## 组件格式

要设置基于本地文件的 secret 存储，请创建一个类型为 `secretstores.local.file` 的组件。在 `./components` 目录中创建一个包含以下内容的文件：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: local-secret-store
spec:
  type: secretstores.local.file
  version: v1
  metadata:
  - name: secretsFile
    value: [path to the JSON file]
  - name: nestedSeparator
    value: ":"
  - name: multiValued
    value: "false"
```

## 规格元数据字段

| 字段               | 必需 | 详细信息                                                                 | 示例                  |
|--------------------|:----:|-------------------------------------------------------------------------|-----------------------|
| secretsFile        | Y    | 存储 secret 的文件路径   | `"path/to/file.json"` |
| nestedSeparator    | N    | 用于展平 JSON 层次结构时的分隔符，默认为 `":"` | `":"` 
| multiValued        | N    | `"true"` 启用 `multipleKeyValuesPerSecret` 行为，允许在展平 JSON 层次结构前有一级多值键/值对。默认为 `"false"` | `"true"` |

## 设置 JSON 文件以保存 secret

假设从 `secretsFile` 加载的 JSON 如下：

```json
{
    "redisPassword": "your redis password",
    "connectionStrings": {
        "sql": "your sql connection string",
        "mysql": "your mysql connection string"
    }
}
```

`multiValued` 标志决定 secret 存储是采用 [名称/值行为还是每个 secret 的多个键值行为]({{< ref "secrets_api.md#response-body" >}})。

### 名称/值语义

如果 `multiValued` 为 `false`，存储将加载 [JSON 文件]({{< ref "#setup-json-file-to-hold-the-secrets" >}}) 并创建一个包含以下键值对的映射：

| 展平的键               | 值                             |
| ---                   | ---                             |
|"redisPassword"        | `"your redis password"`           |
|"connectionStrings:sql"| `"your sql connection string"`    |
|"connectionStrings:mysql"| `"your mysql connection string"`  |

如果 `multiValued` 设置为 true，尝试获取 `connectionStrings` 键将导致 500 HTTP 错误响应。例如：

```shell
$ curl http://localhost:3501/v1.0/secrets/local-secret-store/connectionStrings
```
```json
{
  "errorCode": "ERR_SECRET_GET",
  "message": "failed getting secret with key connectionStrings from secret store local-secret-store: secret connectionStrings not found"
}
```

这是预期的，因为 `connectionStrings` 键在展平后不存在。

然而，请求展平的键 `connectionStrings:sql` 将成功返回，如下所示：

```shell
$ curl http://localhost:3501/v1.0/secrets/local-secret-store/connectionStrings:sql
```
```json
{
  "connectionStrings:sql": "your sql connection string"
}
```

### 多键值行为

如果 `multiValued` 为 `true`，secret 存储将启用每个 secret 的多个键值行为：
- 顶层之后的嵌套结构将被展平。
- 它将 [相同的 JSON 文件]({{< ref "#setup-json-file-to-hold-the-secrets" >}}) 解析为此表：

| 键                  | 值                             |
| ---                 | ---                             |
|"redisPassword"      | `"your redis password"`           |
|"connectionStrings"  | `{"mysql":"your mysql connection string","sql":"your sql connection string"}`    |

注意在上表中：
- `connectionStrings` 现在是一个 JSON 对象，具有两个键：`mysql` 和 `sql`。
- [名称/值语义映射的表]({{< ref "#namevalue-semantics" >}}) 中的 `connectionStrings:sql` 和 `connectionStrings:mysql` 展平的键丢失。

现在在键 `connectionStrings` 上调用 `GET` 请求会成功返回，类似于以下内容：

```shell
$ curl http://localhost:3501/v1.0/secrets/local-secret-store/connectionStrings
```
```json
{
  "sql": "your sql connection string",
  "mysql": "your mysql connection string"
}
```

同时，请求展平的键 `connectionStrings:sql` 现在将返回 500 HTTP 错误响应，如下所示：

```json
{
  "errorCode": "ERR_SECRET_GET",
  "message": "failed getting secret with key connectionStrings:sql from secret store local-secret-store: secret connectionStrings:sql not found"
}
```

#### 处理更深的嵌套级别

注意，如 [规格元数据字段表](#spec-metadata-fields) 中所述，`multiValued` 仅处理单个嵌套级别。

假设您有一个启用了 `multiValued` 的本地文件 secret 存储，指向一个 `secretsFile`，其中包含以下 JSON 内容：

```json
{
    "redisPassword": "your redis password",
    "connectionStrings": {
        "mysql": {
          "username": "your mysql username",
          "password": "your mysql password"
        }
    }
}
```
`connectionStrings` 下的键 `mysql` 的内容具有大于 1 的嵌套级别，并将被展平。

以下是它在内存中的样子：

| 键                  | 值                             |
| ---                 | ---                             |
|"redisPassword"      | `"your redis password"`           |
|"connectionStrings"  | `{ "mysql:username": "your mysql username", "mysql:password": "your mysql password" }`    |

再次请求键 `connectionStrings` 会导致成功的 HTTP 响应，但其内容，如上表所示，将被展平：

```shell
$ curl http://localhost:3501/v1.0/secrets/local-secret-store/connectionStrings
```
```json
{
  "mysql:username": "your mysql username",
  "mysql:password": "your mysql password"
}
```

这对于模拟像 Vault 或 Kubernetes 这样的 secret 存储非常有用，它们每个 secret 键返回多个键/值对。

## 相关链接
- [Secrets 构建块]({{< ref secrets >}})
- [操作指南：检索 secret]({{< ref "howto-secrets.md" >}})
- [操作指南：在 Dapr 组件中引用 secret]({{< ref component-secrets.md >}})
- [Secrets API 参考]({{< ref secrets_api.md >}})
