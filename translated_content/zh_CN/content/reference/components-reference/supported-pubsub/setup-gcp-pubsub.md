---
type: docs
title: "GCP Pub/Sub"
linkTitle: "GCP Pub/Sub"
description: "GCP Pub/Sub组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-gcp/"
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-gcp-pubsub/"
---

## 创建 Dapr 组件

要安装GCP pubsub，请创建一个类型为`pubsub.gcp.pubsub`的组件。 See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: gcp-pubsub
  namespace: default
spec:
  type: pubsub.gcp.pubsub
  version: v1
  metadata:
  - name: type
    value: service_account
  - name: projectId
    value: <PROJECT_ID> # replace
  - name: identityProjectId
    value: <IDENTITY_PROJECT_ID> # replace
  - name: privateKeyId
    value: <PRIVATE_KEY_ID> #replace
  - name: clientEmail
    value: <CLIENT_EMAIL> #replace
  - name: clientId
    value: <CLIENT_ID> # replace
  - name: authUri
    value: https://accounts.google.com/o/oauth2/auth
  - name: tokenUri
    value: https://oauth2.googleapis.com/token
  - name: authProviderX509CertUrl
    value: https://www.googleapis.com/oauth2/v1/certs
  - name: clientX509CertUrl
    value: https://www.googleapis.com/robot/v1/metadata/x509/<PROJECT_NAME>.iam.gserviceaccount.com #replace PROJECT_NAME
  - name: privateKey
    value: <PRIVATE_KEY> # replace x509 cert
  - name: disableEntityManagement
    value: "false"
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                      | 必填 | 详情                                                                                                                             | 示例                                                                                                       |
| ----------------------- |:--:| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| type                    | N  | GCP 凭证类型. Only `service_account` is supported. Defaults to `service_account`                                                   | `service_account`                                                                                        |
| project_id              | Y  | GCP 项目 id                                                                                                                      | `myproject-123`                                                                                          |
| identityProjectId       | N  | If the GCP pubsub project is different from the identity project, specify the identity project using this attribute            | `"myproject-123"`                                                                                        |
| privateKeyId            | N  | If using explicit credentials, this field should contain the `private_key_id` field from the service account json document     | `"my-private-key"`                                                                                       |
| privateKey              | N  | If using explicit credentials, this field should contain the `private_key` field from the service account json                 | `-----BEGIN PRIVATE KEY-----MIIBVgIBADANBgkqhkiG9w0B`                                                    |
| clientEmail             | N  | If using explicit credentials, this field should contain the `client_email` field from the service account json                | `"myservice@myproject-123.iam.gserviceaccount.com"`                                                      |
| clientId                | N  | If using explicit credentials, this field should contain the `client_id` field from the service account json                   | `106234234234`                                                                                           |
| authUri                 | N  | If using explicit credentials, this field should contain the `auth_uri` field from the service account json                    | `https://accounts.google.com/o/oauth2/auth`                                                              |
| tokenUri                | N  | If using explicit credentials, this field should contain the `token_uri` field from the service account json                   | `https://oauth2.googleapis.com/token`                                                                    |
| authProviderX509CertUrl | N  | If using explicit credentials, this field should contain the `auth_provider_x509_cert_url` field from the service account json | `https://www.googleapis.com/oauth2/v1/certs`                                                             |
| clientX509CertUrl       | N  | If using explicit credentials, this field should contain the `client_x509_cert_url` field from the service account json        | `https://www.googleapis.com/robot/v1/metadata/x509/myserviceaccount%40myproject.iam.gserviceaccount.com` |
| disableEntityManagement | N  | 当设置为`"true"`时，主题和订阅不会自动创建。 默认值为 `"false"`                                                                                      | `"true"`, `"false"`                                                                                      |

## 创建 GCP Pub/Sub
You can use either "explicit" or "implicit" credentials to configure access to your GCP pubsub instance. If using explicit, most fields are required. Implicit relies on dapr running under a Kubernetes service account (KSA) mapped to a Google service account (GSA) which has the necessary permissions to access pubsub. In implicit mode, only the `projectId` attribute is needed, all other are optional.

按照[这里](https://cloud.google.com/pubsub/docs/quickstart-console)的说明设置Google Cloud Pub/Sub系统。

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})
