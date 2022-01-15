---
type: docs
title: "Kafka binding spec"
linkTitle: "Kafka"
description: "Kafka 组件绑定详细说明"
---

## 配置

要设置 Kafka 绑定，请创建一个类型为 `bindings.kafka`的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}
## 元数据字段规范

| 字段              | 必填 | 绑定支持         | 详情                                                                                     | 示例                                |
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
