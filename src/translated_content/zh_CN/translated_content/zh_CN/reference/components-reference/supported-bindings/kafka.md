---
type: docs
title: "Kafka 绑定规范"
linkTitle: "Kafka"
description: "Kafka 组件绑定详细说明"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/kafka/"
---

## Component format

To setup Kafka binding create a component of type `bindings.kafka`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration. For details on using `secretKeyRef`, see the guide on [how to reference secrets in components]({{< ref component-secrets.md >}}).

All component metadata field values can carry [templated metadata values]({{< ref "component-schema.md#templated-metadata-values" >}}), which are resolved on Dapr sidecar startup. For example, you can choose to use `{namespace}` as the `consumerGroup`, to enable using the same `appId` in different namespaces using the same topics as described in [this article]({{< ref "howto-namespace.md#with-namespace-consumer-groups">}}).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-binding
spec:
  type: bindings.kafka
  version: v1
  metadata:
  - name: topics # Optional. Used for input bindings.
    value: "topic1,topic2"
  - name: brokers # Required.
    value: "localhost:9092,localhost:9093"
  - name: consumerGroup # Optional. Used for input bindings.
    value: "group1"
  - name: publishTopic # Optional. Used for output bindings.
    value: "topic3"
  - name: authRequired # Required.
    value: "true"
  - name: saslUsername # Required if authRequired is `true`.
    value: "user"
  - name: saslPassword # Required if authRequired is `true`.
    secretKeyRef:
      name: kafka-secrets
      key: "saslPasswordSecret"
  - name: saslMechanism
    value: "SHA-512"
  - name: initialOffset # Optional. Used for input bindings.
    value: "newest"
  - name: maxMessageBytes # Optional.
    value: "1024"
  - name: version # Optional.
    value: "2.0.0"
  - name: direction
    value: "input, output"
```

## 元数据字段规范

| Field                 | Required | 绑定支持   | 详情                                                                                                                                                                                                                                     | 示例                                                         |
| --------------------- |:--------:| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `topics`              |    否     | Input  | A comma-separated string of topics.                                                                                                                                                                                                    | `"mytopic1,topic2"`                                        |
| `brokers`             |    是     | 输入/输出  | 以逗号分隔的 Kafka broker。                                                                                                                                                                                                                   | `"localhost:9092,dapr-kafka.myapp.svc.cluster.local:9093"` |
| `clientID`            |    否     | 输入/输出  | A user-provided string sent with every request to the Kafka brokers for logging, debugging, and auditing purposes.                                                                                                                     | `"my-dapr-app"`                                            |
| `consumerGroup`       |    否     | Input  | A kafka consumer group to listen on. Each record published to a topic is delivered to one consumer within each consumer group subscribed to the topic.                                                                                 | `"group1"`                                                 |
| `consumeRetryEnabled` |    否     | 输入/输出  | 通过设置为 `"true"`启用消费重试。 在 Kafka 绑定组件中默认为 `false`。                                                                                                                                                                                        | `"true"`, `"false"`                                        |
| `publishTopic`        |    是     | Output | The topic to publish to.                                                                                                                                                                                                               | `"mytopic"`                                                |
| `authRequired`        |    否     | *已废弃*  | Enable [SASL](https://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer) authentication with the Kafka brokers.                                                                                                           | `"true"`, `"false"`                                        |
| `authType`            |    是     | 输入/输出  | Configure or disable authentication. Supported values: `none`, `password`, `mtls`, or `oidc`                                                                                                                                           | `"password"`, `"none"`                                     |
| `saslUsername`        |    否     | 输入/输出  | The SASL username used for authentication. Only required if `authRequired` is set to `"true"`.                                                                                                                                         | `"adminuser"`                                              |
| `saslPassword`        |    否     | 输入/输出  | The SASL password used for authentication. Can be `secretKeyRef` to use a [secret reference]({{< ref component-secrets.md >}}). Only required if `authRequired` is set to `"true"`.                                                    | `""`, `"KeFg23!"`                                          |
| `saslMechanism`       |    否     | 输入/输出  | The SASL authentication mechanism you'd like to use. Only required if `authtype` is set to `"password"`. If not provided, defaults to `PLAINTEXT`, which could cause a break for some services, like Amazon Managed Service for Kafka. | `"SHA-512", "SHA-256", "PLAINTEXT"`                        |
| `initialOffset`       |    否     | Input  | The initial offset to use if no offset was previously committed. Should be "newest" or "oldest". Defaults to "newest".                                                                                                                 | `"oldest"`                                                 |
| `maxMessageBytes`     |    否     | 输入/输出  | The maximum size in bytes allowed for a single Kafka message. Defaults to 1024.                                                                                                                                                        | `"2048"`                                                   |
| `oidcTokenEndpoint`   |    否     | 输入/输出  | Full URL to an OAuth2 identity provider access token endpoint. Required when `authType` is set to `oidc`                                                                                                                               | "https://identity.example.com/v1/token"                    |
| `oidcClientID`        |    否     | 输入/输出  | The OAuth2 client ID that has been provisioned in the identity provider. Required when `authType` is set to `oidc`                                                                                                                     | `"dapr-kafka"`                                             |
| `oidcClientSecret`    |    否     | 输入/输出  | The OAuth2 client secret that has been provisioned in the identity provider: Required when `authType` is set to `oidc`                                                                                                                 | `"KeFg23!"`                                                |
| `oidcScopes`          |    否     | 输入/输出  | Comma-delimited list of OAuth2/OIDC scopes to request with the access token. Recommended when `authType` is set to `oidc`. Defaults to `"openid"`                                                                                      | `"openid,kafka-prod"`                                      |
| `version`             |    否     | 输入/输出  | Kafka cluster version. Defaults to 2.0.0. Please note that this needs to be mandatorily set to `1.0.0` for EventHubs with Kafka.                                                                                                       | `"1.0.0"`                                                  |
| `direction`           |    否     | 输入/输出  | The direction of the binding.                                                                                                                                                                                                          | `"input"`, `"output"`, `"input, output"`                   |
| `oidcExtensions`      |    否     | 输入/输出  | String containing a JSON-encoded dictionary of OAuth2/OIDC extensions to request with the access token                                                                                                                                 | `{"cluster":"kafka","poolid":"kafkapool"}`                 |

#### Note
The metadata `version` must be set to `1.0.0` when using Azure EventHubs with Kafka.

## 绑定支持

This component supports both **input and output** binding interfaces.

该组件支持如下操作的 **输出绑定** ：

- `create`

## 鉴权

Kafka supports a variety of authentication schemes and Dapr supports several: SASL password, mTLS, OIDC/OAuth2. [Learn more about Kafka's authentication method for both the Kafka binding and Kafka pub/sub components]({{< ref "setup-apache-kafka.md#authentication" >}}).

## 指定分区键

When invoking the Kafka binding, its possible to provide an optional partition key by using the `metadata` section in the request body.

The field name is `partitionKey`.

示例︰

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myKafka \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        },
        "metadata": {
          "partitionKey": "key1"
        },
        "operation": "create"
      }'
```

### 响应

An HTTP 204 (No Content) and empty body will be returned if successful.

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
