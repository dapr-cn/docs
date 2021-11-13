---
type: docs
title: "Apache Kafka"
linkTitle: "Apache Kafka"
description: "关于Apache Kafka pubsub组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-apache-kafka/"
---

## 配置

要设置Apache Kafka pubsub，请创建一个`pubsub.kafka`类型的组件。 See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration. For details on using `secretKeyRef`, see the guide on [how to reference secrets in components]({{< ref component-secrets.md >}}).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
  namespace: default
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers # Required. Kafka broker connection setting
    value: "dapr-kafka.myapp.svc.cluster.local:9092"
  - name: consumerGroup # Optional. Used for input bindings.
    value: "group1"
  - name: clientID # Optional. Used as client tracing ID by Kafka brokers.
    value: "my-dapr-app-id"
  - name: authRequired # Required.
    value: "true"
  - name: saslUsername # Required if authRequired is `true`.
    value: "adminuser"
  - name: saslPassword # Required if authRequired is `true`.
    secretKeyRef:
      name: kafka-secrets
      key: saslPasswordSecret
  - name: maxMessageBytes # Optional.
    value: 1024
  - name: consumeRetryInterval # Optional.
    value: 200ms
  - name: version # Optional.
    value: 0.10.2.0
```

## 元数据字段规范

| 字段                   | 必填 | 详情                                                                                                                                                                                  | Example                                                                                            |
| -------------------- |:--:| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| brokers              | Y  | A comma-separated list of Kafka brokers.                                                                                                                                            | `"localhost:9092,dapr-kafka.myapp.svc.cluster.local:9093"`                                         |
| consumerGroup        | N  | A kafka consumer group to listen on. Each record published to a topic is delivered to one consumer within each consumer group subscribed to the topic.                              | `"group1"`                                                                                         |
| clientID             | N  | A user-provided string sent with every request to the Kafka brokers for logging, debugging, and auditing purposes. Defaults to `"sarama"`.                                          | `"my-dapr-app"`                                                                                    |
| authRequired         | Y  | Enable [SASL](https://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer) authentication with the Kafka brokers.                                                        | `"true"`, `"false"`                                                                                |
| saslUsername         | N  | The SASL username used for authentication. Only required if `authRequired` is set to `"true"`.                                                                                      | `"adminuser"`                                                                                      |
| saslPassword         | N  | The SASL password used for authentication. Can be `secretKeyRef` to use a [secret reference]({{< ref component-secrets.md >}}). Only required if `authRequired` is set to `"true"`. | `""`, `"KeFg23!"`                                                                                  |
| initialOffset        | N  | The initial offset to use if no offset was previously committed. Should be "newest" or "oldest". Defaults to "newest".                                                              | `"oldest"`                                                                                         |
| maxMessageBytes      | N  | The maximum size in bytes allowed for a single Kafka message. Defaults to 1024.                                                                                                     | `2048`                                                                                             |
| consumeRetryInterval | N  | The interval between retries when attempting to consume topics. Treats numbers without suffix as milliseconds. Defaults to 100ms.                                                   | `200ms`                                                                                            |
| version              | N  | Kafka cluster version. Defaults to 2.0.0.0                                                                                                                                          | `0.10.2.0`                                                                                         |
| caCert               | N  | Certificate authority certificate, required for using TLS. 可以用`secretKeyRef`来引用密钥。                                                                                                  | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`           |
| clientCert           | N  | Client certificate, required for using TLS. 可以用`secretKeyRef`来引用密钥。                                                                                                                 | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`           |
| clientKey            | N  | Client key, required for using TLS. 可以用`secretKeyRef`来引用密钥。                                                                                                                         | `"-----BEGIN RSA PRIVATE KEY-----\n<base64-encoded PKCS8>\n-----END RSA PRIVATE KEY-----"` |
| skipVerify           | N  | Skip TLS verification, this is not recommended for use in production. 默认值为 `"false"`                                                                                                | `"true"`, `"false"`                                                                                |

### 使用 TLS 通信
To configure communication using TLS, ensure the Kafka broker is configured to support certificates. 前提条件包括`certficate authority certificate`、`ca issued client certificate`、`client private key`。 Below is an example of a Kafka pubsub component configured to use TLS:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
  namespace: default
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers # Required. Kafka broker connection setting
    value: "dapr-kafka.myapp.svc.cluster.local:9092"
  - name: consumerGroup # Optional. Used for input bindings.
    value: "group1"
  - name: clientID # Optional. Used as client tracing ID by Kafka brokers.
    value: "my-dapr-app-id"
  - name: authRequired # Required.
    value: "true"
  - name: saslUsername # Required if authRequired is `true`.
    value: "adminuser"
  - name: consumeRetryInterval # Optional.
    value: 200ms
  - name: version # Optional.
    value: 0.10.2.0
  - name: saslPassword # Required if authRequired is `true`.
    secretKeyRef:
      name: kafka-secrets
      key: saslPasswordSecret
  - name: maxMessageBytes # Optional.
    value: 1024
  - name: caCert # Certificate authority certificate.
    secretKeyRef:
      name: kafka-tls
      key: caCert
  - name: clientCert # Client certificate.
    secretKeyRef:
      name: kafka-tls
      key: clientCert
  - name: clientKey # Client key.
    secretKeyRef:
      name: kafka-tls
      key: clientKey
auth:
  secretStore: <SECRET_STORE_NAME>
```

The `secretKeyRef` above is referencing  a [kubernetes secrets store]({{< ref kubernetes-secret-store.md >}}) to access the tls information. Visit [here]({{< ref setup-secret-store.md >}}) to learn more about how to configure a secret store component.


## 每次调用的元数据字段

### 分区键

当调用Kafka 发布/订阅时，可以通过在请求url中使用`metadata`查询参数来提供一个可选的分区键。

参数名是`partitionKey`。

You can run Kafka locally using [this](https://github.com/wurstmeister/kafka-docker) Docker image. To run without Docker, see the getting started guide [here](https://kafka.apache.org/quickstart).

```shell
curl -X POST http://localhost:3500/v1.0/publish/myKafka/myTopic?metadata.partitionKey=key1 \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        }
      }'
```

## 创建 Kafka 实例

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
你可以使用[这个](https://github.com/wurstmeister/kafka-docker)Docker镜像在本地运行Kafka。 要在没有Docker的情况下运行，请参阅[入门指南](https://kafka.apache.org/quickstart)。
{{% /codetab %}}

{{% codetab %}}
To run Kafka on Kubernetes, you can use any Kafka operator, such as [Strimzi](https://strimzi.io/docs/operators/latest/quickstart.html#ref-install-prerequisites-str).
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md##step-1-setup-the-pubsub-component" >}}) for instructions on configuring pub/sub components
- [发布/订阅构建块]({{< ref pubsub >}})