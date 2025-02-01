---
type: docs
title: "AWS Secrets Manager"
linkTitle: "AWS Secrets Manager"
description: 关于密钥存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/aws-secret-manager/"
---

## 组件格式

要设置 AWS Secrets Manager 的密钥存储，需创建一个类型为 `secretstores.aws.secretmanager` 的组件。请参阅[本指南]({{< ref "setup-secret-store.md#apply-the-configuration" >}})了解如何创建和应用密钥存储配置。请参阅本指南以[引用 secrets]({{< ref component-secrets.md >}})以检索和使用 Dapr 组件的密钥。

有关身份验证相关属性的信息，请参阅[身份验证到 AWS]({{< ref authenticating-aws.md >}})。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: awssecretmanager
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
{{% alert title="警告" color="warning" %}}
上述示例中使用了明文形式的字符串作为密钥。建议使用本地密钥存储，例如[Kubernetes 密钥存储]({{< ref kubernetes-secret-store.md >}})或[本地文件]({{< ref file-secret-store.md >}})来安全地存储密钥。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 详情                                                                 | 示例             |
|--------------------|:--------:|-------------------------------------------------------------------------|---------------------|
| region             | Y        | 部署 AWS Secrets Manager 实例的特定 AWS 区域 | `"us-east-1"`       |
| accessKey          | Y        | 访问此资源的 AWS 访问密钥                              | `"key"`             |
| secretKey          | Y        | 访问此资源的 AWS 秘密访问密钥                       | `"secretAccessKey"` |
| sessionToken       | N        | 要使用的 AWS 会话令牌                                            | `"sessionToken"`    |

{{% alert title="重要" color="warning" %}}
当在 EKS（AWS Kubernetes）上与应用程序一起运行 Dapr sidecar（daprd）时，如果您使用的节点或 Pod 已经附加了定义访问 AWS 资源的 IAM 策略，则**不应**在组件规格中提供 AWS 访问密钥、秘密密钥和令牌。
{{% /alert %}}

## 可选的每请求元数据属性

从此密钥存储检索密钥时，可以提供以下[可选查询参数]({{< ref "secrets_api#query-parameters" >}})：

查询参数 | 描述
--------- | -----------
`metadata.version_id` | 指定密钥的版本。
`metadata.version_stage` | 指定密钥的版本阶段。

## 创建 AWS Secrets Manager 实例

请参考 AWS 文档以设置 AWS Secrets Manager：https://docs.aws.amazon.com/secretsmanager/latest/userguide/tutorials_basic.html。

## 相关链接
- [Secrets 构建块]({{< ref secrets >}})
- [操作指南：检索密钥]({{< ref "howto-secrets.md" >}})
- [操作指南：在 Dapr 组件中引用密钥]({{< ref component-secrets.md >}})
- [Secrets API 参考]({{< ref secrets_api.md >}})
- [身份验证到 AWS]({{< ref authenticating-aws.md >}})
