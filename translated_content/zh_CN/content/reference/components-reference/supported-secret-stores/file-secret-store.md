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
```

## 元数据字段规范

| 字段              | 必填 | 详情                                             | Example               |
| --------------- |:--:| ---------------------------------------------- | --------------------- |
| secretsFile     | Y  | 存储密钥的文件路径                                      | `"path/to/file.json"` |
| nestedSeparator | N  | 在将JSON层次结构扁平化为map时，被仓库使用 默认值为 `":"` 默认值为 `":"` | `":"`                 |

## 设置 JSON 文件来保存密钥

提供以下json：

```json
{
    "redisPassword": "your redis password",
    "connectionStrings": {
        "sql": "your sql connection string",
        "mysql": "your mysql connection string"
    }
}
```

仓库将加载文件并创建一个具有以下键值对的map:

| 扁平键                       | value                          |
| ------------------------- | ------------------------------ |
| "redis"                   | "your redis password"          |
| "connectionStrings:sql"   | "your sql connection string"   |
| "connectionStrings:mysql" | "your mysql connection string" |

使用扁平键 (`connectionStrings:sql`)来访问密钥。

## 相关链接
- [密钥构建块]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [密钥 API 参考]({{< ref secrets_api.md >}})
