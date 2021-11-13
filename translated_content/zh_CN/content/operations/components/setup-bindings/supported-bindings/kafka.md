---
type: docs
title: "Kafka binding spec"
linkTitle: "Kafka"
description: "Detailed documentation on the Kafka binding component"
---

## 配置

To setup Kafka binding create a component of type `bindings.kafka`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.kafka
  version: v1
  metadata:
  - name: topics # Optional. in use for input bindings
    value: topic1,topic2
  - name: brokers
    value: localhost:9092,localhost:9093
  - name: consumerGroup
    value: group1
  - name: publishTopic # Optional. in use for output bindings
    value: topic3
  - name: authRequired # Required. default: "true"
    value: "false"
  - name: saslUsername # Optional.
    value: "user"
  - name: saslPassword # Optional.
    value: "password"
  - name: maxMessageBytes # Optional.
    value: 1024
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}
## 元数据字段规范

| 字段              | 必填 | 绑定支持         | 详情                                                                                     | Example                           |
| --------------- |:--:| ------------ | -------------------------------------------------------------------------------------- | --------------------------------- |
| topics          | N  | 输入           | A comma separated string of topics                                                     | `"mytopic1,topic2"`               |
| brokers         | Y  | Input/Output | A comma separated string of kafka brokers                                              | `"localhost:9092,localhost:9093"` |
| consumerGroup   | N  | 输入           | A kafka consumer group to listen on                                                    | `"group1"`                        |
| publishTopic    | Y  | 输出           | The topic to publish to                                                                | `"mytopic"`                       |
| authRequired    | Y  | Input/Output | Determines whether to use SASL authentication or not. Defaults to `"true"`             | `"true"`, `"false"`               |
| saslUsername    | N  | Input/Output | The SASL username for authentication. Only used if `authRequired` is set to - `"true"` | `"user"`                          |
| saslPassword    | N  | Input/Output | The SASL password for authentication. Only used if `authRequired` is set to - `"true"` | `"password"`                      |
| maxMessageBytes | N  | Input/Output | The maximum size allowed for a single Kafka message. Defaults to 1024                  | `2048`                            |


## 绑定支持

此组件支持 **输入和输出** 绑定接口。

字段名为 `ttlInSeconds`。

- `create`

## Specifying a partition key

When invoking the Kafka binding, its possible to provide an optional partition key by using the `metadata` section in the request body.

The field name is `partitionKey`.

You can run Kafka locally using [this](https://github.com/wurstmeister/kafka-docker) Docker image. To run without Docker, see the getting started guide [here](https://kafka.apache.org/quickstart).

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
