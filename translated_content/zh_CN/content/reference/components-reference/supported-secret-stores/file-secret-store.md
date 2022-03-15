---
type: docs
title: "本地文件 (用于开发)"
linkTitle: "Local file"
description: 详细介绍了关于本地文件密钥仓库组件的信息
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/file-secret-store/"
---

这个Dapr密钥仓库组件不使用身份认证，而是读取JSON文本。

{{% alert title="Warning" color="warning" %}}
这种密钥管理的方法不建议用于生产环境。
{{% /alert %}}

## 配置

要设置基于本地文件密钥仓库，请创建一个类型为`secretstores.local.file`的组件。 在你的`./components`目录下创建一个包含以下内容的文件:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: local-secret-store
  namespace: default
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

## 元数据字段规范

| 字段              | 必填 | 详情                                             | 示例                    |
| --------------- |:--:| ---------------------------------------------- | --------------------- |
| secretsFile     | Y  | 存储密钥的文件路径                                      | `"path/to/file.json"` |
| nestedSeparator | N  | 在将JSON层次结构扁平化为map时，被仓库使用 默认值为 `":"` 默认值为 `":"` | `":"`                 |
| multiValued     | N  | 允许在平展 JSON 层次结构之前使用一个级别的多值键/值对。 默认值为 `"false"` | `"true"`              |

## 设置 JSON 文件来保存密钥

给定从 `secretsFile` 加载的以下 JSON：

```json
{
    "redisPassword": "your redis password",
    "connectionStrings": {
        "sql": "your sql connection string",
        "mysql": "your mysql connection string"
    }
}
```

如果 `multiValued` 为 `"false"`，存储将为加载该文件，并创建一个如下键值对的map：

| 扁平键                       | 值                              |
| ------------------------- | ------------------------------ |
| "redis"                   | "your redis password"          |
| "connectionStrings:sql"   | "your sql connection string"   |
| "connectionStrings:mysql" | "your mysql connection string" |

使用扁平键 (`connectionStrings:sql`)来访问密钥。 返回如下的 JSON map：

```json
{
  "connectionStrings:sql": "your sql connection string"
}
```

如果 `multiValued` 为 `"true"`，这应该改用顶级键。 在此示例中，`connectionString` 将会返回如下map：

```json
{
  "sql": "your sql connection string",
  "mysql": "your mysql connection string"
}
```

顶层之后的嵌套结构将被平展。 在此示例中， `connectionString` 将返回以下map：

JSON from `secretsFile`:

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

响应:

```json
{
  "mysql:username": "your mysql username",
  "mysql:password": "your mysql password"
}
```

这对于模仿 Vault 或 Kubernetes 等为每个密钥返回多个键/值对的密钥存储非常有用。

## 相关链接
- [密钥构建块]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [密钥 API 参考]({{< ref secrets_api.md >}})
