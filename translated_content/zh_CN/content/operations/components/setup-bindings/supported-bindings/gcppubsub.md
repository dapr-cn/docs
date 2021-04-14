---
type: docs
title: "GCP Pub/Sub binding spec"
linkTitle: "GCP Pub/Sub"
description: "Detailed documentation on the GCP Pub/Sub binding component"
---

## 配置

要开始 Azure 发布/订阅 绑定，需要创建一个类型为 `bindings.gcp.pubsub` 的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


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
以上示例将密钥明文存储。 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                              | 必填 | 绑定支持                          | 详情                                                  | 示例                                                                                               |
| ------------------------------- |:--:| ----------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| topic                           | 是  | 输出                            | GCP Pub/Sub topic name                              | `"topic1"`                                                                                       |
| subscription                    | 是  | GCP Pub/Sub subscription name | `"name1"`                                           |                                                                                                  |
| type                            | 是  | 输出                            | GCP credentials type                                | `service_account`                                                                                |
| project_id                      | 是  | 输出                            | GCP project id                                      | `projectId`                                                                                      |
| private_key_id                | 是  | 输出                            | GCP private key id                                  | `"privateKeyId"`                                                                                 |
| private_key                     | 是  | 输出                            | GCP credentials private key. Replace with x509 cert | `12345-12345`                                                                                    |
| client_email                    | 是  | 输出                            | GCP client email                                    | `"client@email.com"`                                                                             |
| client_id                       | 是  | 输出                            | GCP client id                                       | `0123456789-0123456789`                                                                          |
| auth_uri                        | 是  | 输出                            | Google account OAuth endpoint                       | `https://accounts.google.com/o/oauth2/auth`                                                      |
| token_uri                       | 是  | 输出                            | Google account token uri                            | `https://oauth2.googleapis.com/token`                                                            |
| auth_provider_x509_cert_url | 是  | 输出                            | GCP credentials cert url                            | `https://www.googleapis.com/oauth2/v1/certs`                                                     |
| client_x509_cert_url          | 是  | 输出                            | GCP credentials project x509 cert url               | `https://www.googleapis.com/robot/v1/metadata/x509/<PROJECT_NAME>.iam.gserviceaccount.com` |

## 绑定支持

该组件支持**输出绑定**，其操作如下:

- `create`

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
