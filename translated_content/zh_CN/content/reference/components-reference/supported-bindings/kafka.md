---
type: docs
title: "Kafka binding spec"
linkTitle: "Kafka"
description: "Detailed documentation on the Kafka binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/kafka/"
---

## 配置

To setup Kafka binding create a component of type `bindings.kafka`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration. For details on using `secretKeyRef`, see the guide on [how to reference secrets in components]({{< ref component-secrets.md >}}).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-binding
  namespace: default
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
      key: saslPasswordSecret
  - name: maxMessageBytes # Optional.
    value: 1024
```

## 元数据字段规范

| 字段              | 必填 | 绑定支持                                                                                                                   | 详情                                                                                                                                                                                  | Example                                                    |
| --------------- |:--:| ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| topics          | N  | 输入                                                                                                                     | A comma-separated string of topics.                                                                                                                                                 | `"mytopic1,topic2"`                                        |
| brokers         | Y  | Input/Output                                                                                                           | A comma-separated string of Kafka brokers.                                                                                                                                          | `"localhost:9092,dapr-kafka.myapp.svc.cluster.local:9093"` |
| consumerGroup   | N  | 输入                                                                                                                     | A kafka consumer group to listen on. Each record published to a topic is delivered to one consumer within each consumer group subscribed to the topic.                              | `"group1"`                                                 |
| publishTopic    | Y  | 输出                                                                                                                     | The topic to publish to.                                                                                                                                                            | `"mytopic"`                                                |
| authRequired    | Y  | Input/Output                                                                                                           | Enable [SASL](https://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer) authentication with the Kafka brokers.                                                        | `"true"`, `"false"`                                        |
| saslUsername    | N  | Input/Output                                                                                                           | The SASL username used for authentication. Only required if `authRequired` is set to `"true"`.                                                                                      | `"adminuser"`                                              |
| saslPassword    | N  | Input/Output                                                                                                           | The SASL password used for authentication. Can be `secretKeyRef` to use a [secret reference]({{< ref component-secrets.md >}}). Only required if `authRequired` is set to `"true"`. | `""`, `"KeFg23!"`                                          |
| initialOffset   | N  | The initial offset to use if no offset was previously committed. Should be "newest" or "oldest". Defaults to "newest". | `"oldest"`                                                                                                                                                                          |                                                            |
| maxMessageBytes | N  | Input/Output                                                                                                           | The maximum size in bytes allowed for a single Kafka message. Defaults to 1024.                                                                                                     | `2048`                                                     |

## 绑定支持

此组件支持 **输入和输出** 绑定接口。

字段名为 `ttlInSeconds`。

- `create`

## Specifying a partition key

When invoking the Kafka binding, its possible to provide an optional partition key by using the `metadata` section in the request body.

The field name is `partitionKey`.

Example:

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

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
