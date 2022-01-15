---
type: docs
title: "Apache Kafka"
linkTitle: "Apache Kafka"
description: "关于Apache Kafka pubsub组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-apache-kafka/"
---

## 配置

要设置Apache Kafka pubsub，请创建一个`pubsub.kafka`类型的组件。 请参阅[本指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}})，了解如何创建和应用 pubsub 配置。 有关使用 `secretKeyRef`的详细信息，请参阅有[关如何在组件中引用Secret指南]({{< ref component-secrets.md >}})。

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
```

## 元数据字段规范

| 字段              | 必填 | 详情                                                                                                                                         | 示例                                                         |
| --------------- |:--:| ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| brokers         | Y  | A comma-separated list of Kafka brokers.                                                                                                   | `"localhost:9092,dapr-kafka.myapp.svc.cluster.local:9093"` |
| consumerGroup   | N  | 监听 kafka 消费者组。 发布到主题的每条记录都会传递给订阅该主题的每个消费者组中的一个消费者。                                                                                         | `"group1"`                                                 |
| clientID        | N  | A user-provided string sent with every request to the Kafka brokers for logging, debugging, and auditing purposes. Defaults to `"sarama"`. | `"my-dapr-app"`                                            |
| authRequired    | Y  | 启用 [SASL](https://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer) 对 Kafka broker 的身份验证。                                    | `"true"`, `"false"`                                        |
| saslUsername    | N  | 用于身份验证的 SASL 用户名。 仅当 `authRequired` 设置为 `"true"`时才需要。                                                                                      | `"adminuser"`                                              |
| saslPassword    | N  | 用于身份验证的 SASL 密码。 可以用`secretKeyRef`来[引用 Secret]({{< ref component-secrets.md >}})。 仅当 `authRequired` 设置为 `"true"`时才需要。                      | `""`, `"KeFg23!"`                                          |
| initialOffset   | N  | 如果以前未提交任何偏移量，则要使用的初始偏移量。 应为"newest"或"oldest"。 默认为"newest"。                                                                                 | `"oldest"`                                                 |
| maxMessageBytes | N  | 单条Kafka消息允许的最大消息的字节大小。 默认值为 1024。                                                                                                          | `2048`                                                     |

## 每次调用的元数据字段

### 分区键

当调用Kafka 发布/订阅时，可以通过在请求url中使用`metadata`查询参数来提供一个可选的分区键。

参数名是`partitionKey`。

示例:

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
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md##step-1-setup-the-pubsub-component" >}})，了解配置 发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})