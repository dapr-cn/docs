---
type: docs
title: "GCP Pub/Sub 绑定规范"
linkTitle: "GCP Pub/Sub"
description: "关于 GCP Pub/Sub 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/gcppubsub/"
---

## 组件格式

要设置 GCP Pub/Sub 绑定，您需要创建一个类型为 `bindings.gcp.pubsub` 的组件。有关如何创建和应用绑定配置的信息，请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})。

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
    value: "topic1"
  - name: subscription
    value: "subscription1"
  - name: type
    value: "service_account"
  - name: project_id
    value: "project_111"
  - name: private_key_id
    value: "*************"
  - name: client_email
    value: "name@domain.com"
  - name: client_id
    value: "1111111111111111"
  - name: auth_uri
    value: "https://accounts.google.com/o/oauth2/auth"
  - name: token_uri
    value: "https://oauth2.googleapis.com/token"
  - name: auth_provider_x509_cert_url
    value: "https://www.googleapis.com/oauth2/v1/certs"
  - name: client_x509_cert_url
    value: "https://www.googleapis.com/robot/v1/metadata/x509/<project-name>.iam.gserviceaccount.com"
  - name: private_key
    value: "PRIVATE KEY"
  - name: direction
    value: "input, output"
```
{{% alert title="警告" color="warning" %}}
上述示例使用了明文字符串作为密钥。建议使用密钥存储来保护这些信息，详情请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段说明

| 字段              | 必需  | 绑定支持 | 详情 | 示例 |
|--------------------|:--------:|-----------| -----|---------|
| `topic` | Y | 输出 | GCP Pub/Sub 主题名称 | `"topic1"` |
| `subscription` | N | GCP Pub/Sub 订阅名称 | `"name1"` |
| `type`           | Y | 输出 | GCP 凭证类型  | `service_account`
| `project_id`     | Y | 输出 | GCP 项目 ID| `projectId`
| `private_key_id` | N | 输出 | GCP 私钥 ID | `"privateKeyId"`
| `private_key`    | Y | 输出 | GCP 凭证私钥。可以替换为 x509 证书 | `12345-12345`
| `client_email`   | Y | 输出 | GCP 客户端邮箱  | `"client@email.com"`
| `client_id`      | N | 输出 | GCP 客户端 ID | `0123456789-0123456789`
| `auth_uri`       | N | 输出 | Google 账户 OAuth 端点 | `https://accounts.google.com/o/oauth2/auth`
| `token_uri`      | N | 输出 | Google 账户令牌 URI | `https://oauth2.googleapis.com/token`
| `auth_provider_x509_cert_url` | N | 输出 |GCP 凭证证书 URL | `https://www.googleapis.com/oauth2/v1/certs`
| `client_x509_cert_url` | N | 输出 | GCP 凭证项目 x509 证书 URL | `https://www.googleapis.com/robot/v1/metadata/x509/<PROJECT_NAME>.iam.gserviceaccount.com`
| `direction` | N |输入/输出 | 绑定的方向。 | `"input"`, `"output"`, `"input, output"`

## 绑定支持

此组件支持 **输入和输出** 绑定接口。

此组件支持以下操作的 **输出绑定**：

- `create`

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
