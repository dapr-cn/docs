---
type: docs
title: "AWS SSM Parameter Store"
linkTitle: "AWS SSM Parameter Store"
description: Detailed information on the AWS SSM Parameter Store - secret store component
---

## 配置

To setup AWS SSM Parameter Store secret store create a component of type `secretstores.aws.parameterstore`. 请参阅 [本指南]({{< ref "secret-stores-overview.md#apply-the-configuration" >}})，了解如何创建和应用 secretstore 配置。 请参阅本指南 [引用密钥]({{< ref component-secrets.md >}}) 来检索和使用Dapr组件的密钥。

请参阅 [AWS认证]({{< ref authenticating-aws.md >}})，了解有关身份验证相关属性的信息。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: awsparameterstore
  namespace: default
spec:
  type: secretstores.aws.parameterstore
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
以上示例将密钥明文存储。 建议将密钥存储在本地，如 [Kubernetes密钥仓库]({{< ref kubernetes-secret-store.md >}})或 [本地文件]({{< ref file-secret-store.md >}})来安全地存储密钥。
{{% /alert %}}

## 元数据字段规范

| 字段           | 必填 | 详情                                                                          | 示例                  |
| ------------ |:--:| --------------------------------------------------------------------------- | ------------------- |
| region       | 是  | The specific AWS region the AWS SSM Parameter Store instance is deployed in | `"us-east-1"`       |
| accessKey    | 是  | 要访问此资源的 AWS 访问密钥                                                            | `"key"`             |
| secretKey    | 是  | 要访问此资源的 AWS 密钥访问 Key                                                        | `"secretAccessKey"` |
| sessionToken | N  | 要使用的 AWS 会话令牌                                                               | `"sessionToken"`    |
## Create an AWS SSM Parameter Store instance

Setup AWS SSM Parameter Store using the AWS documentation: https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html.

## 相关链接
- [密钥构建块]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [密钥 API 参考]({{< ref secrets_api.md >}})
- [AWS认证]({{< ref authenticating-aws.md >}})
