---
type: docs
title: "Kafka binding spec"
linkTitle: "Kafka"
description: "Detailed documentation on the Kafka binding component"
---

## Component format

To setup Kafka binding create a component of type `bindings.kafka`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration. To setup Redis binding create a component of type `bindings.redis`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


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
    value: 1024 in use for input bindings
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
以上示例将 Secret 明文存储。 The example configuration shown above, contain a username and password as plain-text strings. 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}
## Spec metadata fields

| 字段              | Required | Binding support | Details                                                                                                                                                                       | Example                           |
| --------------- |:--------:| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| topics          |    N     | Input           | A comma separated string of topics                                                                                                                                            | `"mytopic1,topic2"`               |
| brokers         |    Y     | Input/Output    | A comma separated string of kafka brokers                                                                                                                                     | `"localhost:9092,localhost:9093"` |
| consumerGroup   |    N     | Input           | A kafka consumer group to listen on                                                                                                                                           | `"group1"`                        |
| publishTopic    |    Y     | Output          | The topic to publish to                                                                                                                                                       | `"mytopic"`                       |
| authRequired    |    Y     | Input/Output    | Determines whether to use SASL authentication or not. Defaults to `"true"` Defaults to `"true"`                                                                               | `"true"`, `"false"`               |
| saslUsername    |    N     | Input/Output    | The SASL username for authentication. Only used if `authRequired` is set to - `"true"` The SASL password for authentication. Only used if `authRequired` is set to - `"true"` | `"user"`                          |
| saslPassword    |    N     | Input/Output    | The SASL password for authentication. Only used if `authRequired` is set to - `"true"`                                                                                        | `"password"`                      |
| maxMessageBytes |    N     | Input/Output    | The maximum size allowed for a single Kafka message. Defaults to 1024 Defaults to 1024                                                                                        | `2048`                            |


## 相关链接

This component supports both **input and output** binding interfaces.

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


## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
