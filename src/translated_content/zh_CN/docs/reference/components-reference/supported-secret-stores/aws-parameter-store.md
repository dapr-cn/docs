---
type: docs
title: "AWS SSM 参数存储"
linkTitle: "AWS SSM 参数存储"
description: 有关 AWS SSM 参数存储 - 机密存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/aws-parameter-store/"
---

## 组件格式

要设置 AWS SSM 参数存储的机密存储，需创建一个 `secretstores.aws.parameterstore` 类型的组件。请参阅[本指南]({{< ref "setup-secret-store.md#apply-the-configuration" >}})了解如何创建和应用机密存储配置。请参阅本指南，了解如何[引用机密]({{< ref component-secrets.md >}})以检索和使用 Dapr 组件的机密。

有关身份验证相关属性的信息，请参阅[身份验证到 AWS]({{< ref authenticating-aws.md >}})。

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
  - name: prefix
    value: "[secret_name]"
```
{{% alert title="警告" color="warning" %}}
上述示例使用了明文字符串作为机密。建议使用本地机密存储，例如 [Kubernetes 机密存储]({{< ref kubernetes-secret-store.md >}})或[本地文件]({{< ref file-secret-store.md >}})来安全地存储密钥。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 详细信息                                                                 | 示例             |
|--------------------|:----:|-------------------------------------------------------------------------|-----------------|
| region             | Y    | 部署 AWS SSM 参数存储实例的特定 AWS 区域                                | `"us-east-1"`   |
| accessKey          | Y    | 访问此资源的 AWS 访问密钥                                               | `"key"`         |
| secretKey          | Y    | 访问此资源的 AWS 秘密访问密钥                                           | `"secretAccessKey"` |
| sessionToken       | N    | 要使用的 AWS 会话令牌                                                   | `"sessionToken"`|
| prefix             | N    | 用于指定多个 SSM 参数存储机密存储组件的前缀。                           | `"prefix"`      |

{{% alert title="重要" color="warning" %}}
在 EKS（AWS Kubernetes）上运行 Dapr sidecar（daprd）时，如果节点/Pod 已附加了访问 AWS 资源的 IAM 策略，则**不应**在组件规格中提供 AWS 访问密钥、秘密密钥和令牌。
{{% /alert %}}

## 创建 AWS SSM 参数存储实例

请参考 AWS 文档以设置 AWS SSM 参数存储：https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html。

## 相关链接
- [Secrets 构建块]({{< ref secrets >}})
- [操作指南：检索机密]({{< ref "howto-secrets.md" >}})
- [操作指南：在 Dapr 组件中引用机密]({{< ref component-secrets.md >}})
- [Secrets API 参考]({{< ref secrets_api.md >}})
- [身份验证到 AWS]({{< ref authenticating-aws.md >}})
