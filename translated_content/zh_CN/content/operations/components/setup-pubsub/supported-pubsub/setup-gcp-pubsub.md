---
type: docs
title: "GCP Pub/Sub"
linkTitle: "GCP Pub/Sub"
description: "GCP Pub/Sub组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-gcp/"
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
  - name: project_id
    value: <PROJECT_ID> # replace
  - name: private_key_id
    value: <PRIVATE_KEY_ID> #replace
  - name: client_email
    value: <CLIENT_EMAIL> #replace
  - name: client_id
    value: <CLIENT_ID> # replace
  - name: auth_uri
    value: https://accounts.google.com/o/oauth2/auth
  - name: token_uri
    value: https://oauth2.googleapis.com/token
  - name: auth_provider_x509_cert_url
    value: https://www.googleapis.com/oauth2/v1/certs
  - name: client_x509_cert_url
    value: https://www.googleapis.com/robot/v1/metadata/x509/<PROJECT_NAME>.iam.gserviceaccount.com #replace PROJECT_NAME
  - name: private_key
    value: <PRIVATE_KEY> # replace x509 cert  
  - name: disableEntityManagement
    value: "false"
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                              | 必填 | 详情                                        | 示例                                                                                               |
| ------------------------------- |:--:| ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| type                            | Y  | GCP 凭证类型                                  | `service_account`                                                                                |
| project_id                      | Y  | GCP 项目 id                                 | `project_id`                                                                                     |
| private_key_id                | Y  | GCP 私钥 id                                 | `"privateKeyId"`                                                                                 |
| private_key                     | Y  | GCP凭证私钥 替换为x509证书                         | `12345-12345`                                                                                    |
| client_email                    | Y  | GCP 客户端邮箱地址                               | `"client@email.com"`                                                                             |
| client_id                       | Y  | GCP 客户端 id                                | `0123456789-0123456789`                                                                          |
| auth_uri                        | Y  | Google帐户 OAuth 端点                         | `https://accounts.google.com/o/oauth2/auth`                                                      |
| token_uri                       | Y  | Google帐户token地址                           | `https://oauth2.googleapis.com/token`                                                            |
| auth_provider_x509_cert_url | Y  | GCP凭证证书地址                                 | `https://www.googleapis.com/oauth2/v1/certs`                                                     |
| client_x509_cert_url          | Y  | GCP凭证项目x509证书地址                           | `https://www.googleapis.com/robot/v1/metadata/x509/<PROJECT_NAME>.iam.gserviceaccount.com` |
| disableEntityManagement         | N  | 当设置为`"true"`时，主题和订阅不会自动创建。 默认值为 `"false"` | `"true"`, `"false"`                                                                              |

## 创建 GCP Pub/Sub

按照[这里](https://cloud.google.com/pubsub/docs/quickstart-console)的说明设置Google Cloud Pub/Sub系统。

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})