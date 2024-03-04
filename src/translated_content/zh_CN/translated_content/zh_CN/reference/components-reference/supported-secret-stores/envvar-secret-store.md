---
type: docs
title: "本地环境变量（用于开发）"
linkTitle: "本地环境变量"
description: 详细介绍了关于本地变量密钥仓库组件的信息
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/envvar-secret-store/"
---

This Dapr secret store component uses locally defined environment variable and does not use authentication.

{{% alert title="Warning" color="warning" %}}
这种密钥管理的方法不建议用于生产环境。
{{% /alert %}}

## Component format

要设置本地环境变量密钥存储，请创建一个类型为`secretstores.local.env`的组件。 在你的`./components`目录下创建一个包含以下内容的文件:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: envvar-secret-store
spec:
  type: secretstores.local.env
  version: v1
  metadata:
    # - name: prefix
    #   value: "MYAPP_"
```

## 元数据字段规范

| Field    | Required | 详情                                                                                                                                                                                                                                        | 示例         |
| -------- |:--------:| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `prefix` |    否     | If set, limits operations to environment variables with the given prefix. The prefix is removed from the returned secrets' names.<br>The matching is case-insensitive on Windows and case-sensitive on all other operating systems. | `"MYAPP_"` |

## Notes

For security reasons, this component cannot be used to access these environment variables:

- `APP_API_TOKEN`
- Any variable whose name begins with the `DAPR_` prefix

## 相关链接
- [Secrets building block]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [Secret API 参考]({{< ref secrets_api.md >}})