---
type: docs
title: "GCP Firestore (Datastore mode)"
linkTitle: "GCP Firestore"
description: GCP Firestore 状态存储的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-firestore/"
---

## Component format

要设置 GCP Firestore 状态存储，请创建一个类型为 `state.gcp.firestore` 的组件。 See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.gcp.firestore
  version: v1
  metadata:
  - name: project_id
    value: <REPLACE-WITH-PROJECT-ID> # Required.
  - name: endpoint # Optional. 
    value: "http://localhost:8432"
  - name: private_key_id
    value: <REPLACE-WITH-PRIVATE-KEY-ID> # Optional.
  - name: private_key
    value: <REPLACE-WITH-PRIVATE-KEY> # Optional, but Required if `private_key_id` is specified.
  - name: client_email
    value: <REPLACE-WITH-CLIENT-EMAIL> # Optional, but Required if `private_key_id` is specified.
  - name: client_id
    value: <REPLACE-WITH-CLIENT-ID> # Optional, but Required if `private_key_id` is specified.
  - name: auth_uri
    value: <REPLACE-WITH-AUTH-URI> # Optional.
  - name: token_uri
    value: <REPLACE-WITH-TOKEN-URI> # Optional.
  - name: auth_provider_x509_cert_url
    value: <REPLACE-WITH-AUTH-X509-CERT-URL> # Optional.
  - name: client_x509_cert_url
    value: <REPLACE-WITH-CLIENT-x509-CERT-URL> # Optional.
  - name: entity_kind
    value: <REPLACE-WITH-ENTITY-KIND> # Optional. default: "DaprState"
  - name: noindex
    value: <REPLACE-WITH-BOOLEAN> # Optional. default: "false"
  - name: type 
    value: <REPLACE-WITH-CREDENTIALS-TYPE> # Deprecated.
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field                           | Required | 详情                                                                                                                                                                                                                                                               | 示例                                                      |
| ------------------------------- |:--------:| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| project_id                      |    是     | 要使用的 GCP 项目 ID                                                                                                                                                                                                                                                   | `"project-id"`                                          |
| endpoint                        |    否     | GCP endpoint for the component to use. Only used for local development with (for example) [GCP Datastore Emulator](https://cloud.google.com/datastore/docs/tools/datastore-emulator). The `endpoint` is unnecessary when running against the GCP production API. | `"localhost:8432"`                                      |
| private_key_id                |    否     | 要使用的私钥ID                                                                                                                                                                                                                                                         | `"private-key-id"`                                      |
| privateKey                      |    否     | 如果使用显式凭据，则此字段应包含服务帐户 json 中的 `private_key` 字段                                                                                                                                                                                                                    | `-----BEGIN PRIVATE KEY-----MIIBVgIBADANBgkqhkiG9w0B`   |
| client_email                    |    否     | 客户端的电子邮件地址                                                                                                                                                                                                                                                       | `"eample@example.com"`                                  |
| client_id                       |    否     | 用于身份验证的客户端 ID 值                                                                                                                                                                                                                                                  | `"client-id"`                                           |
| auth_uri                        |    否     | 要使用的身份验证 URI                                                                                                                                                                                                                                                     | `"https://accounts.google.com/o/oauth2/auth"`           |
| token_uri                       |    否     | 用于查询身份验证令牌的令牌 URI                                                                                                                                                                                                                                                | `"https://oauth2.googleapis.com/token"`                 |
| auth_provider_x509_cert_url |    否     | 身份验证提供程序证书 URL                                                                                                                                                                                                                                                   | `"https://www.googleapis.com/oauth2/v1/certs"`          |
| client_x509_cert_url          |    否     | 客户端证书 URL                                                                                                                                                                                                                                                        | `"https://www.googleapis.com/robot/v1/metadata/x509/x"` |
| entity_kind                     |    否     | 文件存储中的实体名称。 默认为 `"DaprState"`                                                                                                                                                                                                                                    | `"DaprState"`                                           |
| noindex                         |    否     | Whether to disable indexing of state entities. Use this setting if you encounter Firestore index size limitations. 默认值为 `"false"`                                                                                                                                | `"true"`                                                |
| type                            |    否     | **DEPRECATED** The credentials type                                                                                                                                                                                                                              | `"serviceaccount"`                                      |


## GCP Credentials
Since the GCP Firestore component uses the GCP Go Client Libraries, by default it authenticates using **Application Default Credentials**. This is explained in the [Authenticate to GCP Cloud services using client libraries](https://cloud.google.com/docs/authentication/client-libraries) guide.

## 设置 GCP Firestore

{{< tabs "Self-Hosted" "Google Cloud" >}}

{{% codetab %}}
您可以参照 [此处](https://cloud.google.com/datastore/docs/tools/datastore-emulator) 的说明，在本地使用 GCP Datastore 模拟器。

You can then interact with the server using `http://localhost:8432`.
{{% /codetab %}}

{{% codetab %}}
跟随 [此处](https://cloud.google.com/datastore/docs/quickstart) 的说明，开始设置 Google Cloud 中的 Firestore。
{{% /codetab %}}

{{< /tabs >}}


## 相关链接
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
