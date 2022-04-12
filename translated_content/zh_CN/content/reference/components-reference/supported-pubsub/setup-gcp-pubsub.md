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

要安装GCP pubsub，请创建一个类型为`pubsub.gcp.pubsub`的组件。 请参阅[本指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}})，了解如何创建和应用 pubsub 配置。

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
  - name: enableMessageOrdering
    value: "false"
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                      | 必填 | 详情                                                            | 示例                                                                                                       |
| ----------------------- |:--:| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| type                    | N  | GCP 凭证类型. 仅支持 `service_account` 。 默认值为 `service_account`。     | `service_account`                                                                                        |
| project_id              | Y  | GCP 项目 id                                                     | `myproject-123`                                                                                          |
| identityProjectId       | 否  | 如果 GCP pubsub 项目与标识项目不同，请使用此属性指定标识项目                          | `"myproject-123"`                                                                                        |
| privateKeyId            | 否  | 如果使用显式凭据，则此字段应包含服务帐户 json 文档中的 `private_key_id` 字段            | `"my-private-key"`                                                                                       |
| privateKey              | N  | 如果使用显式凭据，则此字段应包含服务帐户 json 中的 `private_key` 字段                 | `-----BEGIN PRIVATE KEY-----MIIBVgIBADANBgkqhkiG9w0B`                                                    |
| clientEmail             | N  | 如果使用显式凭据，则此字段应包含服务帐户 json 中的 `client_email` 字段                | `"myservice@myproject-123.iam.gserviceaccount.com"`                                                      |
| clientId                | N  | 如果使用显式凭据，则此字段应包含服务帐户 json 中的 `client_id` 字段                   | `106234234234`                                                                                           |
| authUri                 | N  | 如果使用显式凭据，则此字段应包含服务帐户 json 中的 `auth_uri` 字段                    | `https://accounts.google.com/o/oauth2/auth`                                                              |
| tokenUri                | N  | 如果使用显式凭据，则此字段应包含服务帐户 json 中的 `token_uri` 字段                   | `https://oauth2.googleapis.com/token`                                                                    |
| authProviderX509CertUrl | N  | 如果使用显式凭据，则此字段应包含服务帐户 json 中的 `auth_provider_x509_cert_url` 字段 | `https://www.googleapis.com/oauth2/v1/certs`                                                             |
| clientX509CertUrl       | N  | 如果使用显式凭据，则此字段应包含服务帐户 json 中的 `client_x509_cert_url` 字段        | `https://www.googleapis.com/robot/v1/metadata/x509/myserviceaccount%40myproject.iam.gserviceaccount.com` |
| disableEntityManagement | N  | 当设置为`"true"`时，主题和订阅不会自动创建。 默认值为 `"false"`                     | `"true"`, `"false"`                                                                                      |
| enableMessageOrdering   | N  | 当设置为 `"true"`时，将按顺序接收订阅的消息，具体取决于发布和权限配置。                      | `"true"`, `"false"`                                                                                      |

{{% alert title="Warning" color="warning" %}}
如果 `enableMessageOrdering` 设置为"true"，则服务帐户上将需要角色/查看者或角色/pubsub.viewer 角色，以便在消息中未嵌入订单令牌的情况下保证排序。 如果未指定此角色，或者由于任何其他原因导致对 Subscription.Config（） 的调用失败，则按嵌入式订单令牌排序仍将正常运行。
{{% /alert %}}

## 创建 GCP Pub/Sub
您可以使用"显式"或"隐式"凭证来配置对 GCP pubsub 实例的访问权限。 如果使用显式，则大多数字段都是必填字段。 Implicit 依赖于在映射到 Google 服务帐户 （GSA） 的 Kubernetes 服务帐户 （KSA） 下运行 dapr，该帐户具有访问 pubsub 的必要权限。 在隐式模式下，只需要 `projectId` 属性，所有其他属性都是可选的。

按照[这里](https://cloud.google.com/pubsub/docs/quickstart-console)的说明设置Google Cloud Pub/Sub系统。

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})
