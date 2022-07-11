---
type: docs
title: "Kafka 绑定规范"
linkTitle: "Kafka"
description: "Kafka 组件绑定详细说明"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/kafka/"
---

## 配置

要设置 Kafka 绑定，请创建一个类型为 `bindings.kafka`的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。 有关使用 `secretKeyRef`的详细信息，请参阅有[关如何在组件中引用Secret指南]({{< ref component-secrets.md >}})。

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

| 字段              | 必填 | 绑定支持                                                       | 详情                                                                                                                    | 示例                                                         |
| --------------- |:--:| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| topics          | 否  | 输入                                                         | 以逗号分隔的主题字符串。                                                                                                          | `"mytopic1,topic2"`                                        |
| brokers         | 是  | 输入/输出                                                      | 以逗号分隔的 Kafka broker。                                                                                                  | `"localhost:9092,dapr-kafka.myapp.svc.cluster.local:9093"` |
| consumerGroup   | 否  | 输入                                                         | 监听 kafka 消费者组。 发布到主题的每条记录都会传递给订阅该主题的每个消费者组中的一个消费者。                                                                    | `"group1"`                                                 |
| publishTopic    | 是  | 输出                                                         | 要发布的主题。                                                                                                               | `"mytopic"`                                                |
| authRequired    | 是  | 输入/输出                                                      | 启用 [SASL](https://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer) 对 Kafka broker 的身份验证。               | `"true"`, `"false"`                                        |
| saslUsername    | 否  | 输入/输出                                                      | 用于身份验证的 SASL 用户名。 仅当 `authRequired` 设置为 `"true"`时才需要。                                                                 | `"adminuser"`                                              |
| saslPassword    | 否  | 输入/输出                                                      | 用于身份验证的 SASL 密码。 可以用`secretKeyRef`来[引用 Secret]({{< ref component-secrets.md >}})。 仅当 `authRequired` 设置为 `"true"`时才需要。 | `""`, `"KeFg23!"`                                          |
| initialOffset   | 否  | 如果以前未提交任何偏移量，则要使用的初始偏移量。 应为"newest"或"oldest"。 默认为"newest"。 | `"oldest"`                                                                                                            |                                                            |
| maxMessageBytes | 否  | 输入/输出                                                      | 单条Kafka消息允许的最大消息的字节大小。 默认值为 1024。                                                                                     | `2048`                                                     |

## 绑定支持

此组件支持 **输入和输出** 绑定接口。

该组件支持如下操作的 **输出绑定** ：

- `create`

## 指定分区键

调用 Kafka 绑定时，可以使用请求正文中的 `metadata` 部分提供可选的分区键。

字段名称为 `partitionKey`。

示例:

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
