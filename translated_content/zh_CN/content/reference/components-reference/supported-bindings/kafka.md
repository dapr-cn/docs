---
type: docs
title: "Kafka binding spec"
linkTitle: "Kafka"
description: "Detailed documentation on the Kafka binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/kafka/"
---

## 配置

To setup Kafka binding create a component of type `bindings.kafka`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


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
以上示例将 Secret 明文存储。 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}
## 元数据字段规范

| 字段              | 必填 | 绑定支持         | 详情                                                                                     | 示例                                |
| --------------- |:--:| ------------ | -------------------------------------------------------------------------------------- | --------------------------------- |
| topics          | N  | 输入           | A comma separated string of topics                                                     | `"mytopic1,topic2"`               |
| brokers         | Y  | Input/Output | A comma separated string of kafka brokers                                              | `"localhost:9092,localhost:9093"` |
| consumerGroup   | N  | 输入           | A kafka consumer group to listen on                                                    | `"group1"`                        |
| publishTopic    | Y  | Output       | The topic to publish to                                                                | `"mytopic"`                       |
| authRequired    | Y  | Input/Output | Determines whether to use SASL authentication or not. Defaults to `"true"`             | `"true"`, `"false"`               |
| saslUsername    | N  | Input/Output | The SASL username for authentication. Only used if `authRequired` is set to - `"true"` | `"user"`                          |
| saslPassword    | N  | Input/Output | The SASL password for authentication. Only used if `authRequired` is set to - `"true"` | `"password"`                      |
| maxMessageBytes | N  | Input/Output | The maximum size allowed for a single Kafka message. Defaults to 1024                  | `2048`                            |


## 绑定支持

此组件支持 **输入和输出** 绑定接口。

该组件支持**输出绑定**，其操作如下:

- `create`

## Specifying a partition key

When invoking the Kafka binding, its possible to provide an optional partition key by using the `metadata` section in the request body.

The field name is `partitionKey`.

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
