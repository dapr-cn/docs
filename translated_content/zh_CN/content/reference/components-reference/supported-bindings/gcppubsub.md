---
type: docs
title: "GCP Pub/Sub binding spec"
linkTitle: "GCP Pub/Sub"
description: "Detailed documentation on the GCP Pub/Sub binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/gcppubsub/"
---

## 配置

要开始 Azure 发布/订阅 绑定，需要创建一个类型为 `bindings.gcp.pubsub` 的组件。 See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.gcp.pubsub
  version: v1
  metadata:
  - name: topic
    value: topic1
  - name: subscription
    value: subscription1
  - name: type
    value: service_account
  - name: project_id
    value: project_111
  - name: private_key_id
    value: *************
  - name: client_email
    value: name@domain.com
  - name: client_id
    value: '1111111111111111'
  - name: auth_uri
    value: https://accounts.google.com/o/oauth2/auth
  - name: token_uri
    value: https://oauth2.googleapis.com/token
  - name: auth_provider_x509_cert_url
    value: https://www.googleapis.com/oauth2/v1/certs
  - name: client_x509_cert_url
    value: https://www.googleapis.com/robot/v1/metadata/x509/<project-name>.iam.gserviceaccount.com
  - name: private_key
    value: PRIVATE KEY
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段                              | 必填 | 绑定支持                          | 详情                     | Example                                                                                          |
| ------------------------------- |:--:| ----------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------ |
| topic                           | Y  | 输出                            | GCP Pub/Sub topic name | `"topic1"`                                                                                       |
| subscription                    | N  | GCP Pub/Sub subscription name | `"name1"`              |                                                                                                  |
| type                            | Y  | 输出                            | GCP 凭证类型               | `service_account`                                                                                |
| project_id                      | Y  | 输出                            | GCP 项目 id              | `project_id`                                                                                     |
| private_key_id                | N  | 输出                            | GCP 私钥 id              | `"privateKeyId"`                                                                                 |
| private_key                     | Y  | 输出                            | GCP凭证私钥 替换为x509证书      | `12345-12345`                                                                                    |
| client_email                    | Y  | 输出                            | GCP 客户端邮箱地址            | `"client@email.com"`                                                                             |
| client_id                       | N  | 输出                            | GCP 客户端 id             | `0123456789-0123456789`                                                                          |
| auth_uri                        | N  | 输出                            | Google帐户 OAuth 端点      | `https://accounts.google.com/o/oauth2/auth`                                                      |
| token_uri                       | N  | 输出                            | Google帐户token地址        | `https://oauth2.googleapis.com/token`                                                            |
| auth_provider_x509_cert_url | N  | 输出                            | GCP凭证证书地址              | `https://www.googleapis.com/oauth2/v1/certs`                                                     |
| client_x509_cert_url          | N  | 输出                            | GCP凭证项目x509证书地址        | `https://www.googleapis.com/robot/v1/metadata/x509/<PROJECT_NAME>.iam.gserviceaccount.com` |

## 绑定支持

此组件支持 **输入和输出** 绑定接口。

字段名为 `ttlInSeconds`。

- `create`

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
