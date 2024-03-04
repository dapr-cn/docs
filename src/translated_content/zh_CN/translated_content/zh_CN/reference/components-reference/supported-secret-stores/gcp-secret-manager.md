---
type: docs
title: "GCP Secret Manager"
linkTitle: "GCP Secret Manager"
description: GCP Secret Manager密钥仓库组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/gcp-secret-manager/"
---

## Component format

To setup GCP Secret Manager secret store create a component of type `secretstores.gcp.secretmanager`. See [this guide]({{< ref "setup-secret-store#apply-the-configuration" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

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

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 建议将密钥存储在本地，如[Kubernetes密钥存储]({{< ref kubernetes-secret-store.md >}})或 [本地文件]({{< ref file-secret-store.md >}})来安全地存储密钥。
{{% /alert %}}

## 元数据字段规范

| Field                           | Required | 详情                                             | 示例                                                                                                 |
| ------------------------------- |:--------:| ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| type                            |    是     | The type of the account.                       | `"service_account"`                                                                                |
| project_id                      |    是     | The project ID associated with this component. | `"project_id"`                                                                                     |
| private_key_id                |    否     | The private key ID                             | `"privatekey"`                                                                                     |
| client_email                    |    是     | The client email address                       | `"client@example.com"`                                                                             |
| client_id                       |    否     | The ID of the client                           | `"11111111"`                                                                                       |
| auth_uri                        |    否     | The authentication URI                         | `"https://accounts.google.com/o/oauth2/auth"`                                                      |
| token_uri                       |    否     | The authentication token URI                   | `"https://oauth2.googleapis.com/token"`                                                            |
| auth_provider_x509_cert_url |    否     | The certificate URL for the auth provider      | `"https://www.googleapis.com/oauth2/v1/certs"`                                                     |
| client_x509_cert_url          |    否     | The certificate URL for the client             | `"https://www.googleapis.com/robot/v1/metadata/x509/<project-name>.iam.gserviceaccount.com"` |
| private_key                     |    是     | The private key for authentication             | `"privateKey"`                                                                                     |

## Optional per-request metadata properties

The following [optional query parameters]({{< ref "secrets_api#query-parameters" >}}) can be provided to the GCP Secret Manager component:

| Query Parameter       | 说明                                |
| --------------------- | --------------------------------- |
| `metadata.version_id` | Version for the given secret key. |

## 设置GCP Secret Manager实例

参考GCP文档设置 GCP Secret Manager：https://cloud.google.com/secret-manager/docs/quickstart。

## 相关链接
- [Secrets building block]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [Secret API 参考]({{< ref secrets_api.md >}})
