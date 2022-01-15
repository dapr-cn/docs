---
type: docs
title: "AWS Secrets Manager"
linkTitle: "AWS Secrets Manager"
description: 详细介绍了关于密钥仓库组件的信息
---

## 配置

要设置AWS Secrets Manager密钥仓库，请创建一个类型为`secretstores.aws.secretmanager`的组件。 See [this guide]({{< ref "secret-stores-overview.md#apply-the-configuration" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

See [Authenticating to AWS]({{< ref authenticating-aws.md >}}) for information about authentication-related attributes.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: awssecretmanager
  namespace: default
spec:
  type: secretstores.aws.secretmanager
  version: v1
  metadata:
  - name: region
    value: "[aws_region]"
  - name: accessKey
    value: "[aws_access_key]"
  - name: secretKey
    value: "[aws_secret_key]"
  - name: sessionToken
    value: "[aws_session_token]"
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a local secret store such as [Kubernetes secret store]({{< ref kubernetes-secret-store.md >}}) or a [local file]({{< ref file-secret-store.md >}}) to bootstrap secure key storage.
{{% /alert %}}

## 元数据字段规范

| 字段           | 必填 | 详情                                 | 示例                  |
| ------------ |:--:| ---------------------------------- | ------------------- |
| region       | Y  | AWS Secrets Manager 实例所部署的特定AWS 区域 | `"us-east-1"`       |
| accessKey    | Y  | 要访问此资源的 AWS 访问密钥                   | `"key"`             |
| secretKey    | Y  | 要访问此资源的 AWS 密钥访问 Key               | `"secretAccessKey"` |
| sessionToken | 否  | 要使用的 AWS 会话令牌                      | `"sessionToken"`    |
## 创建一个AWS Secrets Manager实例

参考AWS文档设置AWS Secrets Manager：https://docs.aws.amazon.com/secretsmanager/latest/userguide/tutorials_basic.html。

## 相关链接
- [密钥构建块]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [密钥 API 参考]({{< ref secrets_api.md >}})
- [AWS认证]({{< ref authenticating-aws.md >}})
