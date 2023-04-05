---
type: docs
title: "RabbitMQ 绑定规范"
linkTitle: "RabbitMQ"
description: "RabbitMQ 绑定组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/rabbitmq/"
---

## 配置

要设置RabbitMQ绑定需要创建一个`bindings.rabbitmq`类型的组件： 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.rabbitmq
  version: v1
  metadata:
  - name: queueName
    value: queue1
  - name: host
    value: amqp://[username][:password]@host.domain[:port]
  - name: durable
    value: true
  - name: deleteWhenUnused
    value: false
  - name: ttlInSeconds
    value: 60
  - name: prefetchCount
    value: 0
  - name: exclusive
    value: false
  - name: maxPriority
    value: 5
  - name: contentType
    value: "text/plain"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段               | 必填 | 绑定支持         | 详情                                                                                                                                           | 示例                                                  |
| ---------------- |:--:| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| queueName        | 是  | Input/Output | RabbitMQ队列名                                                                                                                                  | `"myqueue"`                                         |
| host             | 是  | Input/Output | RabbitMQ主机地址                                                                                                                                 | `"amqp://[username][:password]@host.domain[:port]"` |
| durable          | 否  | 输出           | 告诉 RabbitMQ 将消息持久化到存储中。 默认值为 `"false"`                                                                                                       | `"true"`, `"false"`                                 |
| deleteWhenUnused | 否  | Input/Output | 启用或禁用自动删除。 默认值为 `"false"`                                                                                                                    | `"true"`, `"false"`                                 |
| ttlInseconds     | 否  | 输出           | RabbitMQ队列级别的消息存活时间。 如果此参数为空，消息将不会过期，继续在队列上存在，直到处理完毕。 [另见](#specifying-a-ttl-per-message)                                                    | `60`                                                |
| prefetchCount    | 否  | 输入           | 设置 [通道预取设置 (QoS)](https://www.rabbitmq.com/confirms.html#channel-qos-prefetch) 如果此参数为空，QOS 会设置为0为无限制。                                        | `0`                                                 |
| exclusive        | 否  | Input/Output | 确定主题是否是一个独占主题。 默认值为 `"false"`                                                                                                                | `"true"`, `"false"`                                 |
| maxPriority      | 否  | Input/Output | 用于设置 [优先级队列](https://www.rabbitmq.com/priority.html)的参数。 如果此参数为空，消息将不会过期，继续在队列上存在，直到处理完毕。 取值为1到255. [参见](#specifying-a-priority-per-message) | `"1"`, `"10"`                                       |
| contentType      | 否  | Input/Output | 消息类型 默认为"text/plain"。                                                                                                                        | `"text/plain"`, `"application/cloudevent+json"`等等   |
## 绑定支持

此组件支持 **输入和输出** 绑定接口。

字段名为 `ttlInSeconds`。

- `create`

## 输出绑定支持的操作

可以在队列级别 ( 如上所述) 或消息级别定义生存时间。 在消息级别定义的值会覆盖在队列级别设置的任何值。

若要设置在消息级别生存的时间，请使用 `metadata` 请求正文中的元数据部分。

字段名为 `ttlInSeconds`。

示例:

{{< tabs Windows Linux >}}
{{% codetab %}}
```shell
curl -X POST http://localhost:3500/v1.0/bindings/myRabbitMQ \
  -H "Content-Type: application/json" \
  -d "{
        \"data\": {
          \"message\": \"Hi\"
        },
        \"metadata\": {
          \"ttlInSeconds\": "60"
        },
        \"operation\": \"create\"
      }"
```
{{% /codetab %}}

{{% codetab %}}
```bash
curl -X POST http://localhost:3500/v1.0/bindings/myRabbitMQ \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        },
        "metadata": {
          "ttlInSeconds": "60"
        },
        "operation": "create"
      }'
```
{{% /codetab %}}
{{< /tabs >}}


## 相关链接

可以在消息级别制定优先级。 如果设置了`maxPriority` 参数，那么高优先级消息将优先于其他低优先级消息。

在绑定调用过程之，使用请求正文中的`元数据`设置消息的优先级。

字段名字是`priority`。

示例:

{{< tabs Windows Linux >}}
{{% codetab %}}
```shell
curl -X POST http://localhost:3500/v1.0/bindings/myRabbitMQ \
  -H "Content-Type: application/json" \
  -d "{
        \"data\": {
          \"message\": \"Hi\"
        },
        \"metadata\": {
          "priority": \"5\"
        },
        \"operation\": \"create\"
      }"
```
{{% /codetab %}}

{{% codetab %}}
```shell
curl -X POST http://localhost:3500/v1.0/bindings/myRabbitMQ \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        },
        "metadata": {
          "priority": "5"
        },
        "operation": "create"
      }'
```
{{% /codetab %}}
{{< /tabs >}}

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
