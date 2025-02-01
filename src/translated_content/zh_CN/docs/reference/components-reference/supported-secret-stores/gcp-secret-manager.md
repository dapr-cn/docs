---
type: docs
title: "GCP Secret Manager"
linkTitle: "GCP Secret Manager"
description: 详细介绍 GCP Secret Manager 的机密存储组件
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/gcp-secret-manager/"
---

## 组件格式

要设置 GCP Secret Manager 的机密存储，创建一个类型为 `secretstores.gcp.secretmanager` 的组件。请参阅[本指南]({{< ref "setup-secret-store#apply-the-configuration" >}})了解如何创建和应用机密存储配置。请参阅本指南了解如何[引用机密]({{< ref component-secrets.md >}})以使用 Dapr 组件检索和使用机密。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: gcpsecretmanager
spec:
  type: secretstores.gcp.secretmanager
  version: v1
  metadata:
  - name: type
    value: <replace-with-account-type>
  - name: project_id
    value: <replace-with-project-id>
  - name: private_key_id
    value: <replace-with-private-key-id>
  - name: client_email
    value: <replace-with-email>
  - name: client_id
    value: <replace-with-client-id>
  - name: auth_uri
    value: <replace-with-auth-uri>
  - name: token_uri
    value: <replace-with-token-uri>
  - name: auth_provider_x509_cert_url
    value: <replace-with-auth-provider-cert-url>
  - name: client_x509_cert_url
    value: <replace-with-client-cert-url>
  - name: private_key
    value: <replace-with-private-key>
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串来存储机密。建议使用本地机密存储，例如 [Kubernetes 机密存储]({{< ref kubernetes-secret-store.md >}})或[本地文件]({{< ref file-secret-store.md >}})来安全地管理密钥。
{{% /alert %}}

## 规格元数据字段

| 字段                | 必需 | 详细信息                        | 示例                 |
|--------------------|:----:|--------------------------------|---------------------|
| type               | Y    | 账户类型。                     | `"service_account"` |
| project_id         | Y    | 与此组件关联的项目 ID。        | `"project_id"`      |
| private_key_id     | N    | 私钥 ID                        | `"privatekey"`      |
| client_email       | Y    | 客户端电子邮件地址             | `"client@example.com"` |
| client_id          | N    | 客户端 ID                      | `"11111111"`        |
| auth_uri           | N    | 认证 URI                       | `"https://accounts.google.com/o/oauth2/auth"` |
| token_uri          | N    | 认证令牌 URI                   | `"https://oauth2.googleapis.com/token"` |
| auth_provider_x509_cert_url | N | 认证提供者的证书 URL       | `"https://www.googleapis.com/oauth2/v1/certs"` |
| client_x509_cert_url | N | 客户端的证书 URL               | `"https://www.googleapis.com/robot/v1/metadata/x509/<project-name>.iam.gserviceaccount.com"`|
| private_key | Y | 用于认证的私钥                      | `"privateKey"`      |

## 可选的每请求元数据属性

GCP Secret Manager 组件支持以下[可选查询参数]({{< ref "secrets_api#query-parameters" >}})：

查询参数 | 描述
--------- | -----------
`metadata.version_id` | 指定机密键的版本。

## 设置 GCP Secret Manager 实例

请参考 GCP 文档以设置 GCP Secret Manager：https://cloud.google.com/secret-manager/docs/quickstart。

## 相关链接
- [机密构建块]({{< ref secrets >}})
- [操作指南：检索机密]({{< ref "howto-secrets.md" >}})
- [操作指南：在 Dapr 组件中引用机密]({{< ref component-secrets.md >}})
- [机密 API 参考]({{< ref secrets_api.md >}})
