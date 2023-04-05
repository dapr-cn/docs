---
type: docs
title: "GCP 发布/订阅绑定规范"
linkTitle: "GCP 发布/订阅"
description: "有关 GCP 发布/订阅绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/gcppubsub/"
---

## Component format

To setup Azure Pub/Sub binding create a component of type `bindings.gcp.pubsub`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field                           | 必填 | 绑定支持          | 详情                                                  | 示例                                                                                               |
| ------------------------------- |:--:| ------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| topic                           | 是  | Output        | GCP Pub/Sub topic name                              | `"topic1"`                                                                                       |
| subscription                    | 否  | GCP 发布/订阅订阅名称 | `"name1"`                                           |                                                                                                  |
| type                            | 是  | 输出            | GCP credentials type                                | `service_account`                                                                                |
| project_id                      | 是  | 输出            | GCP project id                                      | `projectId`                                                                                      |
| private_key_id                | 否  | 输出            | GCP private key id                                  | `"privateKeyId"`                                                                                 |
| private_key                     | 是  | Output        | GCP credentials private key. Replace with x509 cert | `12345-12345`                                                                                    |
| client_email                    | 是  | Output        | GCP client email                                    | `"client@email.com"`                                                                             |
| client_id                       | 否  | Output        | GCP client id                                       | `0123456789-0123456789`                                                                          |
| auth_uri                        | 否  | Output        | Google account OAuth endpoint                       | `https://accounts.google.com/o/oauth2/auth`                                                      |
| token_uri                       | 否  | Output        | Google account token uri                            | `https://oauth2.googleapis.com/token`                                                            |
| auth_provider_x509_cert_url | 否  | Output        | GCP credentials cert url                            | `https://www.googleapis.com/oauth2/v1/certs`                                                     |
| client_x509_cert_url          | 否  | Output        | GCP credentials project x509 cert url               | `https://www.googleapis.com/robot/v1/metadata/x509/<PROJECT_NAME>.iam.gserviceaccount.com` |

## 绑定支持

此组件支持 **输入和输出** 绑定接口。

该组件支持如下操作的 **输出绑定** ：

- `create`

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
