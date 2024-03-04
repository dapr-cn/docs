---
type: docs
title: "GCP"
linkTitle: "GCP"
description: "GCP Pub/Sub组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-gcp/"
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-gcp-pubsub/"
---

## Create a Dapr component

To set up GCP pub/sub, create a component of type `pubsub.gcp.pubsub`. See the [pub/sub broker component file]({{< ref setup-pubsub.md >}}) to learn how ConsumerID is automatically generated. Read the [How-to: Publish and Subscribe guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pub/sub configuration.

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
    value: <PROJECT_ID> # replace
  - name: endpoint # Optional. 
    value: "http://localhost:8085"
  - name: consumerID # Optional - defaults to the app's own ID
    value: <CONSUMER_ID> 
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
  - name: orderingKey # Optional
    value: <ORDERING_KEY>
  - name: maxReconnectionAttempts # Optional
    value: 30
  - name: connectionRecoveryInSec # Optional
    value: 2
  - name: deadLetterTopic # Optional
    value: <EXISTING_PUBSUB_TOPIC>
  - name: maxDeliveryAttempts # Optional
    value: 5
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field                   | Required | 详情                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 示例                                                                                                       |
| ----------------------- |:--------:| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| projectId               |    是     | GCP 项目 id                                                                                                                                                                                                                                                                                                                                                                                                                                            | `myproject-123`                                                                                          |
| endpoint                |    否     | GCP endpoint for the component to use. Only used for local development (for example) with [GCP Pub/Sub Emulator](https://cloud.google.com/pubsub/docs/emulator). The `endpoint` is unnecessary when running against the GCP production API.                                                                                                                                                                                                          | `"http://localhost:8085"`                                                                                |
| `consumerID`            |    否     | The Consumer ID organizes one or more consumers into a group. Consumers with the same consumer ID work as one virtual consumer; for example, a message is processed only once by one of the consumers in the group. If the `consumerID` is not provided, the Dapr runtime set it to the Dapr application ID (`appID`) value. The `consumerID`, along with the `topic` provided as part of the request, are used to build the Pub/Sub subscription ID |                                                                                                          |
| identityProjectId       |    否     | 如果 GCP pubsub 项目与标识项目不同，请使用此属性指定标识项目                                                                                                                                                                                                                                                                                                                                                                                                                 | `"myproject-123"`                                                                                        |
| privateKeyId            |    否     | 如果使用显式凭据，则此字段应包含服务帐户 json 文档中的 `private_key_id` 字段                                                                                                                                                                                                                                                                                                                                                                                                   | `"my-private-key"`                                                                                       |
| privateKey              |    否     | 如果使用显式凭据，则此字段应包含服务帐户 json 中的 `private_key` 字段                                                                                                                                                                                                                                                                                                                                                                                                        | `-----BEGIN PRIVATE KEY-----MIIBVgIBADANBgkqhkiG9w0B`                                                    |
| clientEmail             |    否     | 如果使用显式凭据，则此字段应包含服务帐户 json 中的 `client_email` 字段                                                                                                                                                                                                                                                                                                                                                                                                       | `"myservice@myproject-123.iam.gserviceaccount.com"`                                                      |
| clientId                |    否     | 如果使用显式凭据，则此字段应包含服务帐户 json 中的 `client_id` 字段                                                                                                                                                                                                                                                                                                                                                                                                          | `106234234234`                                                                                           |
| authUri                 |    否     | 如果使用显式凭据，则此字段应包含服务帐户 json 中的 `auth_uri` 字段                                                                                                                                                                                                                                                                                                                                                                                                           | `https://accounts.google.com/o/oauth2/auth`                                                              |
| tokenUri                |    否     | 如果使用显式凭据，则此字段应包含服务帐户 json 中的 `token_uri` 字段                                                                                                                                                                                                                                                                                                                                                                                                          | `https://oauth2.googleapis.com/token`                                                                    |
| authProviderX509CertUrl |    否     | 如果使用显式凭据，则此字段应包含服务帐户 json 中的 `auth_provider_x509_cert_url` 字段                                                                                                                                                                                                                                                                                                                                                                                        | `https://www.googleapis.com/oauth2/v1/certs`                                                             |
| clientX509CertUrl       |    否     | 如果使用显式凭据，则此字段应包含服务帐户 json 中的 `client_x509_cert_url` 字段                                                                                                                                                                                                                                                                                                                                                                                               | `https://www.googleapis.com/robot/v1/metadata/x509/myserviceaccount%40myproject.iam.gserviceaccount.com` |
| disableEntityManagement |    否     | When set to `"true"`, topics and subscriptions do not get created automatically. 默认值为 `"false"`                                                                                                                                                                                                                                                                                                                                                      | `"true"`, `"false"`                                                                                      |
| enableMessageOrdering   |    否     | 当设置为 `"true"`时，将按顺序接收订阅的消息，具体取决于发布和权限配置。                                                                                                                                                                                                                                                                                                                                                                                                             | `"true"`, `"false"`                                                                                      |
| orderingKey             |    否     | The key provided in the request. It's used when `enableMessageOrdering` is set to `true` to order messages based on such key.                                                                                                                                                                                                                                                                                                                        | "my-orderingkey"                                                                                         |
| maxReconnectionAttempts |    否     | 定义重新连接尝试的最大次数。 默认值：`30`                                                                                                                                                                                                                                                                                                                                                                                                                              | `30`                                                                                                     |
| connectionRecoveryInSec |    否     | 连接恢复尝试之间的等待时间（以秒为单位）。 Default: `2`                                                                                                                                                                                                                                                                                                                                                                                                                   | `2`                                                                                                      |
| deadLetterTopic         |    否     | Name of the GCP Pub/Sub Topic. This topic **must** exist before using this component.                                                                                                                                                                                                                                                                                                                                                                | `"myapp-dlq"`                                                                                            |
| maxDeliveryAttempts     |    否     | Maximum number of attempts to deliver the message. If `deadLetterTopic` is specified, `maxDeliveryAttempts` is the maximum number of attempts for failed processing of messages. Once that number is reached, the message will be moved to the dead-letter topic. 默认值：`5`                                                                                                                                                                            | `5`                                                                                                      |
| type                    |    否     | **DEPRECATED** GCP credentials type. Only `service_account` is supported. Defaults to `service_account`                                                                                                                                                                                                                                                                                                                                              | `service_account`                                                                                        |



{{% alert title="Warning" color="warning" %}}
如果 `enableMessageOrdering` 设置为"true"，则服务帐户上将需要角色/查看者或角色/pubsub.viewer 角色，以便在消息中未嵌入订单令牌的情况下保证排序。 如果未指定此角色，或者由于任何其他原因导致对 Subscription.Config（） 的调用失败，则按嵌入式订单令牌排序仍将正常运行。
{{% /alert %}}

## GCP Credentials

Since the GCP Pub/Sub component uses the GCP Go Client Libraries, by default it authenticates using **Application Default Credentials**. This is explained further in the [Authenticate to GCP Cloud services using client libraries](https://cloud.google.com/docs/authentication/client-libraries) guide.

## 创建 GCP Pub/Sub

{{< tabs "Self-Hosted" "GCP" >}}

{{% codetab %}}
For local development, the [GCP Pub/Sub Emulator](https://cloud.google.com/pubsub/docs/emulator) is used to test the GCP Pub/Sub Component. Follow [these instructions](https://cloud.google.com/pubsub/docs/emulator#start) to run the GCP Pub/Sub Emulator.

To run the GCP Pub/Sub Emulator locally using Docker, use the following `docker-compose.yaml`:

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

In order to use the GCP Pub/Sub Emulator with your pub/sub binding, you need to provide the `endpoint` configuration in the component metadata. The `endpoint` is unnecessary when running against the GCP Production API.

The **projectId** attribute must match the `--project` used in either the `docker-compose.yaml` or Docker command.

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

您可以使用"显式"或"隐式"凭证来配置对 GCP pubsub 实例的访问权限。 如果使用显式，则大多数字段都是必填字段。 Implicit 依赖于在映射到 Google 服务帐户 （GSA） 的 Kubernetes 服务帐户 （KSA） 下运行 dapr，该帐户具有访问 pubsub 的必要权限。 在隐式模式下，只需要 `projectId` 属性，所有其他属性都是可选的。

Follow the instructions [here](https://cloud.google.com/pubsub/docs/quickstart-console) on setting up Google Cloud Pub/Sub system.

{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})
