---
type: 文档
title: "RabbitMQ 绑定规范"
linkTitle: "RabbitMQ"
description: "Detailed documentation on the RabbitMQ binding component"
---

## Introduction

To setup RabbitMQ binding create a component of type `bindings.rabbitmq`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


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
```

{{% alert title="Warning" color="warning" %}}
以上示例将 Secret 明文存储。 The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Input bindings

| 字段                            | Required | Output Binding Supported Operations | Details                                                                                                                                                                                                                                                                                                                                                                                                                                | Example:                                            |
| ----------------------------- |:--------:| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `queueName` 是 RabbitMQ 队列名。   |    Y     | Input/Output                        | The RabbitMQ queue name                                                                                                                                                                                                                                                                                                                                                                                                                | `"myqueue"`                                         |
| host                          |    Y     | Input/Output                        | `host` 是 RabbitMQ 主机地址。                                                                                                                                                                                                                                                                                                                                                                                                                | `"amqp://[username][:password]@host.domain[:port]"` |
| durable                       |    N     | Output                              | `durable` 告诉 RabbitMQ 将消息持久存储在存储器中。 Defaults to `"false"`                                                                                                                                                                                                                                                                                                                                                                              | `"true"`, `"false"`                                 |
| `deleteWhenUnused` 启用或禁用自动删除。 |    N     | Input/Output                        | Enables or disables auto-delete. Defaults to `"false"` Defaults to `"false"`                                                                                                                                                                                                                                                                                                                                                           | `"true"`, `"false"`                                 |
| ttlInSeconds                  |    N     | Output                              | `ttlInSeconds` 是一个可选的参数，可以将 [默认消息时间设置为在RabbitMQ 队列级别](https://www.rabbitmq.com/ttl.html) 如果此参数为空，消息将不会过期，继续在队列上存在，直到处理完毕。 如果此参数为空，消息将不会过期，继续在队列上存在，直到处理完毕。 See [also](#specifying-a-ttl-per-message)                                                                                                                                                                                                                                   | `60`                                                |
| prefetchCount                 |    N     | Input                               | `prefetchCount` 是一个可选参数，用于设置 [通道预取设置 (QoS)](https://www.rabbitmq.com/confirms.html#channel-qos-prefetch)。 如果此参数为空，QOS 会设置为0为无限制。                                                                                                                                                                                                                                                                                                       | `0`                                                 |
| exclusive                     |    N     | Input/Output                        | `exclusive` determines whether the topic will be an exclusive topic or not Defaults to `"false"` Defaults to `"false"`                                                                                                                                                                                                                                                                                                                 | `"true"`, `"false"`                                 |
| maxPriority                   |    N     | Input/Output                        | Parameter to set the [priority queue](https://www.rabbitmq.com/priority.html). If this parameter is omitted, queue will be created as a general queue instead of a priority queue. Value between 1 and 255. See [also](#specifying-a-priority-per-message) If this parameter is omitted, queue will be created as a general queue instead of a priority queue. Value between 1 and 255. See [also](#specifying-a-priority-per-message) | `"1"`, `"10"`                                       |
## Output bindings

For input bindings, where the query matching Tweets are streamed to the user service, the above component has to also include a query:

字段名为 `ttlInSeconds`。

- `create`

## 输出绑定支持的操作

可以在队列级别 ( 如上所述) 或消息级别定义生存时间。 在消息级别定义的值会覆盖在队列级别设置的任何值。

若要设置在消息级别生存的时间，请使用 `metadata` 请求正文中的元数据部分。

字段名为 `ttlInSeconds`。

{{< tabs >}}

示例:
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

Specifying a priority on message level Priority can be defined at the message level. If `maxPriority` parameter is set, high priority messages will have priority over other low priority messages.

To set priority at message level use the `metadata` section in the request body during the binding invocation.

The field name is `priority`.

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

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
