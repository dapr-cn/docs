---
type: docs
title: "RabbitMQ 绑定规范"
linkTitle: "RabbitMQ"
description: "RabbitMQ 绑定组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/rabbitmq/"
---

## Component format

To setup RabbitMQ binding create a component of type `bindings.rabbitmq`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
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
  - name: reconnectWaitInSeconds
    value: 5
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field                  | 必填 | 绑定支持  | 详情                                                                                                                                                                                                              | 示例                                                  |
| ---------------------- |:--:| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| queueName              | 是  | 输入/输出 | The RabbitMQ queue name                                                                                                                                                                                         | `"myqueue"`                                         |
| host                   | 是  | 输入/输出 | RabbitMQ主机地址                                                                                                                                                                                                    | `"amqp://[username][:password]@host.domain[:port]"` |
| durable                | 否  | 输出    | 告诉 RabbitMQ 将消息持久化到存储中。 默认值为 `"false"`                                                                                                                                                                          | `"true"`, `"false"`                                 |
| deleteWhenUnused       | 否  | 输入/输出 | 启用或禁用自动删除。 默认值为 `"false"`                                                                                                                                                                                       | `"true"`, `"false"`                                 |
| ttlInSeconds           | 否  | 输出    | RabbitMQ队列级别的消息存活时间。 如果此参数为空，消息将不会过期，继续在队列上存在，直到处理完毕。 [另见](#specifying-a-ttl-per-message)                                                                                                                       | `60`                                                |
| prefetchCount          | 否  | Input | 设置 [通道预取设置 (QoS)](https://www.rabbitmq.com/confirms.html#channel-qos-prefetch) 如果此参数为空，QOS 会设置为0为无限制。                                                                                                           | `0`                                                 |
| exclusive              | 否  | 输入/输出 | 确定主题是否是一个独占主题。 默认值为 `"false"`                                                                                                                                                                                   | `"true"`, `"false"`                                 |
| maxPriority            | 否  | 输入/输出 | 用于设置 [优先级队列](https://www.rabbitmq.com/priority.html)的参数。 If this parameter is omitted, queue will be created as a general queue instead of a priority queue. 取值为1到255. [参见](#specifying-a-priority-per-message) | `"1"`, `"10"`                                       |
| contentType            | 否  | 输入/输出 | 消息类型 默认为"text/plain"。                                                                                                                                                                                           | `"text/plain"`, `"application/cloudevent+json"`等等   |
| reconnectWaitInSeconds | 否  | 输入/输出 | Represents the duration in seconds that the client should wait before attempting to reconnect to the server after a disconnection occurs. Defaults to `"5"`.                                                    | `"5"`, `"10"`                                       |
## 绑定支持

此组件支持 **输入和输出** 绑定接口。

该组件支持如下操作的 **输出绑定** ：

- `create`

## 输出绑定支持的操作

可以在队列级别 ( 如上所述) 或消息级别定义生存时间。 在消息级别定义的值会覆盖在队列级别设置的任何值。

若要设置在消息级别生存的时间，请使用 `metadata` 请求正文中的元数据部分。

字段名为 `ttlInSeconds`。

示例︰

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


## 指定每条消息的优先级

可以在消息级别制定优先级。 如果设置了`maxPriority` 参数，那么高优先级消息将优先于其他低优先级消息。

在绑定调用过程之，使用请求正文中的`元数据`设置消息的优先级。

字段名字是`priority`。

示例︰

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

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
