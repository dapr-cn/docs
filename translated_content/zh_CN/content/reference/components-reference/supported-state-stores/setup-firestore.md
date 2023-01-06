---
type: docs
title: "GCP Firestore (Datastore mode)"
linkTitle: "GCP Firestore"
description: GCP Firestore 状态存储的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-firestore/"
---

## 配置

要设置 GCP Firestore 状态存储，请创建一个类型为 `state.gcp.firestore` 的组件。 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.gcp.firestore
  version: v1
  metadata:
  - name: type
    value: <REPLACE-WITH-CREDENTIALS-TYPE> # Required. Example: "serviceaccount"
  - name: project_id
    value: <REPLACE-WITH-PROJECT-ID> # Required.
  - name: private_key_id
    value: <REPLACE-WITH-PRIVATE-KEY-ID> # Required.
  - name: private_key
    value: <REPLACE-WITH-PRIVATE-KEY> # Required.
  - name: client_email
    value: <REPLACE-WITH-CLIENT-EMAIL> # Required.
  - name: client_id
    value: <REPLACE-WITH-CLIENT-ID> # Required.
  - name: auth_uri
    value: <REPLACE-WITH-AUTH-URI> # Required.
  - name: token_uri
    value: <REPLACE-WITH-TOKEN-URI> # Required.
  - name: auth_provider_x509_cert_url
    value: <REPLACE-WITH-AUTH-X509-CERT-URL> # Required.
  - name: client_x509_cert_url
    value: <REPLACE-WITH-CLIENT-x509-CERT-URL> # Required.
  - name: entity_kind
    value: <REPLACE-WITH-ENTITY-KIND> # Optional. default: "DaprState"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                              | 必填 | 详情                            | 示例                                                      |
| ------------------------------- |:--:| ----------------------------- | ------------------------------------------------------- |
| type                            | 是  | 凭据类型                          | `"serviceaccount"`                                      |
| project_id                      | 是  | 要使用的 GCP 项目 ID                | `"project-id"`                                          |
| private_key_id                | 是  | 要使用的私钥ID                      | `"private-key-id"`                                      |
| client_email                    | 是  | 客户端的电子邮件地址                    | `"eample@example.com"`                                  |
| client_id                       | 是  | 用于身份验证的客户端 ID 值               | `"client-id"`                                           |
| auth_uri                        | 是  | 要使用的身份验证 URI                  | `"https://accounts.google.com/o/oauth2/auth"`           |
| token_uri                       | 是  | 用于查询身份验证令牌的令牌 URI             | `"https://oauth2.googleapis.com/token"`                 |
| auth_provider_x509_cert_url | 是  | 身份验证提供程序证书 URL                | `"https://www.googleapis.com/oauth2/v1/certs"`          |
| client_x509_cert_url          | 是  | 客户端证书 URL                     | `"https://www.googleapis.com/robot/v1/metadata/x509/x"` |
| entity_kind                     | 否  | 文件存储中的实体名称。 默认为 `"DaprState"` | `"DaprState"`                                           |

## 设置 GCP Firestore

{{< tabs "Self-Hosted" "Google Cloud" >}}

{{% codetab %}}
您可以参照 [此处](https://cloud.google.com/datastore/docs/tools/datastore-emulator) 的说明，在本地使用 GCP Datastore 模拟器。

然后您可以使用 `localhost:8081` 与服务器交互。
{{% /codetab %}}

{{% codetab %}}
跟随 [此处](https://cloud.google.com/datastore/docs/quickstart) 的说明，开始设置 Google Cloud 中的 Firestore。
{{% /codetab %}}

{{< /tabs >}}


## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
