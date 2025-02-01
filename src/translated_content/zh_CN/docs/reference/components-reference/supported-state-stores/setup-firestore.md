<Meaning-Based Translation>
---
type: docs
title: "GCP Firestore（Datastore 模式）"
linkTitle: "GCP Firestore"
description: 详细介绍 GCP Firestore 状态存储组件
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-firestore/"
---

## 组件格式

要设置 GCP Firestore 状态存储组件，请创建一个类型为 `state.gcp.firestore` 的组件。请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})了解如何创建和应用状态存储配置。

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
    value: <REPLACE-WITH-PROJECT-ID> # 必填。
  - name: endpoint # 可选。
    value: "http://localhost:8432"
  - name: private_key_id
    value: <REPLACE-WITH-PRIVATE-KEY-ID> # 可选。
  - name: private_key
    value: <REPLACE-WITH-PRIVATE-KEY> # 可选，但如果指定了 `private_key_id` 则必填。
  - name: client_email
    value: <REPLACE-WITH-CLIENT-EMAIL> # 可选，但如果指定了 `private_key_id` 则必填。
  - name: client_id
    value: <REPLACE-WITH-CLIENT-ID> # 可选，但如果指定了 `private_key_id` 则必填。
  - name: auth_uri
    value: <REPLACE-WITH-AUTH-URI> # 可选。
  - name: token_uri
    value: <REPLACE-WITH-TOKEN-URI> # 可选。
  - name: auth_provider_x509_cert_url
    value: <REPLACE-WITH-AUTH-X509-CERT-URL> # 可选。
  - name: client_x509_cert_url
    value: <REPLACE-WITH-CLIENT-x509-CERT-URL> # 可选。
  - name: entity_kind
    value: <REPLACE-WITH-ENTITY-KIND> # 可选。默认值："DaprState"
  - name: noindex
    value: <REPLACE-WITH-BOOLEAN> # 可选。默认值："false"
  - name: type 
    value: <REPLACE-WITH-CREDENTIALS-TYPE> # 已弃用。
```

{{% alert title="警告" color="warning" %}}
上述示例中，secret 以明文字符串形式使用。建议使用 secret 存储来保护这些信息，具体方法请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据字段

| 字段                | 必填 | 说明 | 示例 |
|--------------------|:----:|------|------|
| project_id         | Y    | 使用的 GCP 项目的 ID | `"project-id"`
| endpoint           | N    | 组件使用的 GCP 端点，仅用于本地开发（例如使用 [GCP Datastore Emulator](https://cloud.google.com/datastore/docs/tools/datastore-emulator)）。在生产环境中不需要设置 `endpoint`。 | `"localhost:8432"`
| private_key_id     | N    | 使用的私钥 ID | `"private-key-id"`
| private_key        | N    | 如果使用显式凭据，此字段应包含服务账户 JSON 中的 `private_key` 字段 | `-----BEGIN PRIVATE KEY-----MIIBVgIBADANBgkqhkiG9w0B`
| client_email       | N    | 客户端的电子邮件地址 | `"example@example.com"`
| client_id          | N    | 用于身份验证的客户端 ID | `"client-id"`
| auth_uri           | N    | 使用的身份验证 URI | `"https://accounts.google.com/o/oauth2/auth"`
| token_uri          | N    | 用于获取 Auth 令牌的 URI | `"https://oauth2.googleapis.com/token"`
| auth_provider_x509_cert_url | N | 身份验证提供者的证书 URL | `"https://www.googleapis.com/oauth2/v1/certs"`
| client_x509_cert_url | N  | 客户端证书 URL | `"https://www.googleapis.com/robot/v1/metadata/x509/x"`
| entity_kind        | N    | Filestore 中的实体名称，默认为 `"DaprState"` | `"DaprState"`
| noindex            | N    | 是否禁用状态实体的索引。如果遇到 Firestore 索引大小限制，可以启用此设置。默认为 `"false"` | `"true"`
| type               | N    | **已弃用** 凭据类型 | `"serviceaccount"`

## GCP 凭据
由于 GCP Firestore 组件使用 GCP Go 客户端库，默认情况下会使用 **应用程序默认凭据** 进行身份验证。详细信息请参阅[使用客户端库对 GCP 云服务进行身份验证](https://cloud.google.com/docs/authentication/client-libraries)指南。

## 设置 GCP Firestore

{{< tabs "Self-Hosted" "Google Cloud" >}}

{{% codetab %}}
您可以使用 GCP Datastore 模拟器在本地运行，具体步骤请参阅[此处](https://cloud.google.com/datastore/docs/tools/datastore-emulator)。

然后，您可以通过 `http://localhost:8432` 与服务器交互。
{{% /codetab %}}

{{% codetab %}}
按照[此处](https://cloud.google.com/datastore/docs/quickstart)的说明在 Google Cloud 上设置 Firestore。
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取有关配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})