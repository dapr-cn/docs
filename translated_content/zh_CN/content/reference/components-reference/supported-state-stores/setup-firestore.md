---
type: docs
title: "GCP Firestore (Datastore mode)"
linkTitle: "GCP Firestore"
description: Detailed information on the GCP Firestore state store component
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-firestore/"
---

## 配置

To setup GCP Firestore state store create a component of type `state.gcp.firestore`. 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。


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

| 字段                              | 必填 | 详情                                                      | 示例                                                      |
| ------------------------------- |:--:| ------------------------------------------------------- | ------------------------------------------------------- |
| type                            | Y  | The credentials type                                    | `"serviceaccount"`                                      |
| project_id                      | Y  | The ID of the GCP project to use                        | `"project-id"`                                          |
| private_key_id                | Y  | The ID of the prvate key to use                         | `"private-key-id"`                                      |
| client_email                    | Y  | The email address for the client                        | `"eample@example.com"`                                  |
| client_id                       | Y  | The client id value to use for authentication           | `"client-id"`                                           |
| auth_uri                        | Y  | The authentication URI to use                           | `"https://accounts.google.com/o/oauth2/auth"`           |
| token_uri                       | Y  | The token URI to query for Auth token                   | `"https://oauth2.googleapis.com/token"`                 |
| auth_provider_x509_cert_url | Y  | The auth provider certificate URL                       | `"https://www.googleapis.com/oauth2/v1/certs"`          |
| client_x509_cert_url          | Y  | The client certificate URL                              | `"https://www.googleapis.com/robot/v1/metadata/x509/x"` |
| entity_kind                     | N  | The entity name in Filestore. Defaults to `"DaprState"` | `"DaprState"`                                           |

## Setup GCP Firestone

{{< tabs "Self-Hosted" "Google Cloud" >}}

{{% codetab %}}
You can use the GCP Datastore emulator to run locally using the instructions [here](https://cloud.google.com/datastore/docs/tools/datastore-emulator).

然后您可以使用 `localhost:8081` 与服务器交互。
{{% /codetab %}}

{{% codetab %}}
Follow the instructions [here](https://cloud.google.com/datastore/docs/quickstart) to get started with setting up Firestore in Google Cloud.
{{% /codetab %}}

{{< /tabs >}}


## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
