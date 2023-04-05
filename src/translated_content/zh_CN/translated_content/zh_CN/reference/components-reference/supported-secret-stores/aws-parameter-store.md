---
type: docs
title: "AWS SSM 参数存储"
linkTitle: "AWS SSM 参数存储"
description: 详细介绍了关于 AWS SSM Parameter Store 密钥存储组件的信息
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/aws-parameter-store/"
---

## Component format

To setup AWS SSM Parameter Store secret store create a component of type `secretstores.aws.parameterstore`. See [this guide]({{< ref "setup-secret-store.md#apply-the-configuration" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

有关身份验证相关属性的信息，请参阅 [向 AWS 进行身份验证]({{< ref authenticating-aws.md >}})。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: awsparameterstore
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
以上示例将密钥明文存储， 建议将密钥存储在本地，如[Kubernetes密钥存储]({{< ref kubernetes-secret-store.md >}})或 [本地文件]({{< ref file-secret-store.md >}})来安全地存储密钥。
{{% /alert %}}

## 元数据字段规范

| Field        | 必填 | 详情                                                                          | 示例                  |
| ------------ |:--:| --------------------------------------------------------------------------- | ------------------- |
| region       | 是  | The specific AWS region the AWS SSM Parameter Store instance is deployed in | `"us-east-1"`       |
| accessKey    | 是  | 要访问此资源的 AWS 访问密钥                                                            | `"key"`             |
| secretKey    | 是  | 要访问此资源的 AWS 密钥访问 Key                                                        | `"secretAccessKey"` |
| sessionToken | 否  | 要使用的 AWS 会话令牌                                                               | `"sessionToken"`    |

{{% alert title="Important" color="warning" %}}
当在 EKS (AWS Kubernetes) 上与您的应用程序一起运行 Dapr sidecar (daprd) 时，如果您使用的node/pod 已附加到定义 AWS 资源访问权限的 IAM 策略，那么您 **不能**在正在使用的组件规范的定义中提供 AWS access-key、secret-key 和token。
{{% /alert %}}

## 创建 AWS SSM Parameter Store 实例

Setup AWS SSM Parameter Store using the AWS documentation: https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html.

## 相关链接
- [Secrets building block]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [Secret API 参考]({{< ref secrets_api.md >}})
- [AWS认证]({{< ref authenticating-aws.md >}})
