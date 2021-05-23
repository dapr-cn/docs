---
type: docs
title: "本地环境变量（用于开发）"
linkTitle: "Local environment variables"
description: 详细介绍了关于本地变量密钥仓库组件的信息
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/envvar-secret-store/"
---

这个Dapr密钥仓库组件不使用身份认证，而是使用本地定义的环境变量。

{{% alert title="Warning" color="warning" %}}
这种密钥管理的方法不建议用于生产环境。
{{% /alert %}}

## 配置

要设置本地环境变量密钥存储，请创建一个类型为`secretstores.local.env`的组件。 在你的`./components`目录下创建一个包含以下内容的文件:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: envvar-secret-store
  namespace: default
spec:
  type: secretstores.local.env
  version: v1
  metadata:
```
## 相关链接
- [密钥构建块]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [密钥 API 参考]({{< ref secrets_api.md >}})