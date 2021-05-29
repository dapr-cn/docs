---
type: docs
title: "GCP Secret Manager"
linkTitle: "GCP Secret Manager"
description: GCP Secret Manager密钥仓库组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/gcp-secret-manager/"
---

## 配置

要设置GCP Secret Manager密钥仓库，请创建一个类型为`secretstores.gcp.secretmanager`的组件。 See [this guide]({{< ref "setup-secret-store#apply-the-configuration" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: gcpsecretmanager
  namespace: default
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

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a local secret store such as [Kubernetes secret store]({{< ref kubernetes-secret-store.md >}}) or a [local file]({{< ref file-secret-store.md >}}) to bootstrap secure key storage.
{{% /alert %}}

## 元数据字段规范

| 字段                              | 必填 | 详情             | Example                                                                                            |
| ------------------------------- |:--:| -------------- | -------------------------------------------------------------------------------------------------- |
| type                            | Y  | 账户类型           | `"serviceAccount"`                                                                                 |
| project_id                      | Y  | 与此组件相关联的项目 ID。 | `"project_id"`                                                                                     |
| private_key_id                | N  | 私钥ID           | `"privatekey"`                                                                                     |
| client_email                    | Y  | 客户端电子邮件地址      | `"client@example.com"`                                                                             |
| client_id                       | N  | 客户端的 ID        | `"11111111"`                                                                                       |
| auth_uri                        | N  | 认证URI          | `"https://accounts.google.com/o/oauth2/auth"`                                                      |
| token_uri                       | N  | 认证token URI    | `"https://oauth2.googleapis.com/token"`                                                            |
| auth_provider_x509_cert_url | N  | 认证提供者的证书URL    | `"https://www.googleapis.com/oauth2/v1/certs"`                                                     |
| client_x509_cert_url          | N  | 客户端的证书 URL     | `"https://www.googleapis.com/robot/v1/metadata/x509/<project-name>.iam.gserviceaccount.com"` |
| private_key                     | Y  | 认证用的私钥         | `"privateKey"`                                                                                     |

## 设置GCP Secret Manager实例

参考GCP文档设置 GCP Secret Manager：https://cloud.google.com/secret-manager/docs/quickstart。

## 相关链接
- [密钥构建块]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [密钥 API 参考]({{< ref secrets_api.md >}})
