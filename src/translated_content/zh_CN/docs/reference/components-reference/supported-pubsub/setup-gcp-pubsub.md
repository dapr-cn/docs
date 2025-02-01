---
type: docs
title: "GCP"
linkTitle: "GCP"
description: "关于 GCP Pub/Sub 组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-gcp/"
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-gcp-pubsub/"
---

## 创建 Dapr 组件

要配置 GCP pub/sub，需创建一个类型为 `pubsub.gcp.pubsub` 的组件。参考 [pub/sub broker 组件文件]({{< ref setup-pubsub.md >}}) 了解 ConsumerID 的自动生成方式。查看 [发布和订阅指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) 了解如何创建和应用 pub/sub 配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: gcp-pubsub
spec:
  type: pubsub.gcp.pubsub
  version: v1
  metadata:
  - name: type
    value: service_account
  - name: projectId
    value: <PROJECT_ID> # 替换
  - name: endpoint # 可选
    value: "http://localhost:8085"
  - name: consumerID # 可选 - 默认为应用程序自身的 ID
    value: <CONSUMER_ID>
  - name: identityProjectId
    value: <IDENTITY_PROJECT_ID> # 替换
  - name: privateKeyId
    value: <PRIVATE_KEY_ID> # 替换
  - name: clientEmail
    value: <CLIENT_EMAIL> # 替换
  - name: clientId
    value: <CLIENT_ID> # 替换
  - name: authUri
    value: https://accounts.google.com/o/oauth2/auth
  - name: tokenUri
    value: https://oauth2.googleapis.com/token
  - name: authProviderX509CertUrl
    value: https://www.googleapis.com/oauth2/v1/certs
  - name: clientX509CertUrl
    value: https://www.googleapis.com/robot/v1/metadata/x509/<PROJECT_NAME>.iam.gserviceaccount.com # 替换 PROJECT_NAME
  - name: privateKey
    value: <PRIVATE_KEY> # 替换 x509 证书
  - name: disableEntityManagement
    value: "false"
  - name: enableMessageOrdering
    value: "false"
  - name: orderingKey # 可选
    value: <ORDERING_KEY>
  - name: maxReconnectionAttempts # 可选
    value: 30
  - name: connectionRecoveryInSec # 可选
    value: 2
  - name: deadLetterTopic # 可选
    value: <EXISTING_PUBSUB_TOPIC>
  - name: maxDeliveryAttempts # 可选
    value: 5
  - name: maxOutstandingMessages # 可选
    value: 1000
  - name: maxOutstandingBytes # 可选
    value: 1000000000
  - name: maxConcurrentConnections # 可选
    value: 10
```
{{% alert title="警告" color="warning" %}}
上述示例中，secret 以明文字符串形式使用。建议使用 secret 存储来存储 secret，具体方法请参考[这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| projectId     | Y | GCP 项目 ID | `myproject-123`
| endpoint       | N  | 组件使用的 GCP 端点。仅用于本地开发（例如）与 [GCP Pub/Sub Emulator](https://cloud.google.com/pubsub/docs/emulator) 一起使用。运行 GCP 生产 API 时不需要 `endpoint`。 | `"http://localhost:8085"`
| `consumerID`         | N        | Consumer ID 将一个或多个消费者组织成一个组。具有相同 consumer ID 的消费者作为一个虚拟消费者工作；例如，消息仅由组中的一个消费者处理一次。如果未提供 `consumerID`，Dapr 运行时将其设置为 Dapr 应用程序 ID (`appID`) 值。`consumerID` 与请求中提供的 `topic` 一起用于构建 Pub/Sub 订阅 ID | 可以设置为字符串值（例如 `"channel1"`）或字符串格式值（例如 `"{podName}"` 等）。[查看可以在组件元数据中使用的所有模板标签。]({{< ref "component-schema.md#templated-metadata-values" >}})
| identityProjectId | N | 如果 GCP pubsub 项目与身份项目不同，使用此属性指定身份项目 | `"myproject-123"`
| privateKeyId | N | 如果使用显式凭据，此字段应包含服务账户 JSON 文档中的 `private_key_id` 字段 | `"my-private-key"`
| privateKey    | N | 如果使用显式凭据，此字段应包含服务账户 JSON 中的 `private_key` 字段 | `-----BEGIN PRIVATE KEY-----MIIBVgIBADANBgkqhkiG9w0B`
| clientEmail   | N | 如果使用显式凭据，此字段应包含服务账户 JSON 中的 `client_email` 字段 | `"myservice@myproject-123.iam.gserviceaccount.com"`
| clientId      | N | 如果使用显式凭据，此字段应包含服务账户 JSON 中的 `client_id` 字段 | `106234234234`
| authUri       | N | 如果使用显式凭据，此字段应包含服务账户 JSON 中的 `auth_uri` 字段 | `https://accounts.google.com/o/oauth2/auth`
| tokenUri      | N | 如果使用显式凭据，此字段应包含服务账户 JSON 中的 `token_uri` 字段 | `https://oauth2.googleapis.com/token`
| authProviderX509CertUrl | N | 如果使用显式凭据，此字段应包含服务账户 JSON 中的 `auth_provider_x509_cert_url` 字段 | `https://www.googleapis.com/oauth2/v1/certs`
| clientX509CertUrl | N | 如果使用显式凭据，此字段应包含服务账户 JSON 中的 `client_x509_cert_url` 字段 | `https://www.googleapis.com/robot/v1/metadata/x509/myserviceaccount%40myproject.iam.gserviceaccount.com`
| disableEntityManagement | N | 设置为 `"true"` 时，主题和订阅不会自动创建。默认值：`"false"` | `"true"`，`"false"`
| enableMessageOrdering | N | 设置为 `"true"` 时，订阅的消息将按顺序接收，具体取决于发布和权限配置。 | `"true"`，`"false"`
| orderingKey |N | 请求中提供的键。当 `enableMessageOrdering` 设置为 `true` 时，用于根据该键对消息进行排序。 | "my-orderingkey"
| maxReconnectionAttempts | N  |定义最大重连尝试次数。默认值：`30` | `30`
| connectionRecoveryInSec | N  |连接恢复尝试之间的等待时间（以秒为单位）。默认值：`2` | `2`
| deadLetterTopic | N  | GCP Pub/Sub 主题的名称。此主题在使用此组件之前**必须**存在。 | `"myapp-dlq"`
| maxDeliveryAttempts | N  | 消息传递的最大尝试次数。如果指定了 `deadLetterTopic`，`maxDeliveryAttempts` 是消息处理失败的最大尝试次数。一旦达到该次数，消息将被移至死信主题。默认值：`5` | `5`
| type           | N | **已弃用** GCP 凭据类型。仅支持 `service_account`。默认为 `service_account` | `service_account`
| maxOutstandingMessages | N | 给定 [streaming-pull](https://cloud.google.com/pubsub/docs/pull#streamingpull_api) 连接可以拥有的最大未完成消息数。默认值：`1000` | `50`
| maxOutstandingBytes | N | 给定 [streaming-pull](https://cloud.google.com/pubsub/docs/pull#streamingpull_api) 连接可以拥有的最大未完成字节数。默认值：`1000000000` | `1000000000`
| maxConcurrentConnections | N | 要维护的最大并发 [streaming-pull](https://cloud.google.com/pubsub/docs/pull#streamingpull_api) 连接数。默认值：`10` | `2`
| ackDeadline | N | 消息确认持续时间截止时间。默认值：`20s` | `1m`

{{% alert title="警告" color="warning" %}}
如果 `enableMessageOrdering` 设置为 "true"，则需要在服务账户上授予 roles/viewer 或 roles/pubsub.viewer 角色，以确保在消息中未嵌入顺序令牌的情况下保证顺序。如果未授予此角色，或调用 Subscription.Config() 失败的任何其他原因，嵌入顺序令牌的排序仍将正常工作。
{{% /alert %}}

## GCP 凭据

由于 GCP Pub/Sub 组件使用 GCP Go 客户端库，默认情况下它使用 **应用程序默认凭据** 进行身份验证。这在 [使用客户端库对 GCP 云服务进行身份验证](https://cloud.google.com/docs/authentication/client-libraries) 指南中有进一步解释。

## 创建 GCP Pub/Sub

{{< tabs "Self-Hosted" "GCP" >}}

{{% codetab %}}
对于本地开发，使用 [GCP Pub/Sub Emulator](https://cloud.google.com/pubsub/docs/emulator) 来测试 GCP Pub/Sub 组件。按照 [这些说明](https://cloud.google.com/pubsub/docs/emulator#start) 运行 GCP Pub/Sub Emulator。

要在本地使用 Docker 运行 GCP Pub/Sub Emulator，请使用以下 `docker-compose.yaml`：

```yaml
version: '3'
services:
  pubsub:
    image: gcr.io/google.com/cloudsdktool/cloud-sdk:422.0.0-emulators
    ports:
      - "8085:8085"
    container_name: gcp-pubsub
    entrypoint: gcloud beta emulators pubsub start --project local-test-prj --host-port 0.0.0.0:8085

```

为了使用 GCP Pub/Sub Emulator 与您的 pub/sub 绑定，您需要在组件元数据中提供 `endpoint` 配置。运行 GCP 生产 API 时不需要 `endpoint`。

**projectId** 属性必须与 `docker-compose.yaml` 或 Docker 命令中使用的 `--project` 匹配。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: gcp-pubsub
spec:
  type: pubsub.gcp.pubsub
  version: v1
  metadata:
  - name: projectId
    value: "local-test-prj"
  - name: consumerID
    value: "testConsumer"
  - name: endpoint
    value: "localhost:8085"
```

{{% /codetab %}}

{{% codetab %}}

您可以使用“显式”或“隐式”凭据来配置对 GCP pubsub 实例的访问。如果使用显式，大多数字段是必需的。隐式依赖于 dapr 在映射到具有访问 pubsub 所需权限的 Google 服务账户 (GSA) 的 Kubernetes 服务账户 (KSA) 下运行。在隐式模式下，只需要 `projectId` 属性，其他所有都是可选的。

按照 [此处](https://cloud.google.com/pubsub/docs/quickstart-console) 的说明设置 Google Cloud Pub/Sub 系统。

{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) 了解配置 pub/sub 组件的说明
- [Pub/Sub 构建块]({{< ref pubsub >}})
