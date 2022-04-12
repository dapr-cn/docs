---
type: docs
title: "RabbitMQ 绑定规范"
linkTitle: "RabbitMQ"
description: "Detailed documentation on the RabbitMQ binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/rabbitmq/"
---

## 配置

To setup RabbitMQ binding create a component of type `bindings.rabbitmq`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


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

| 字段               | 必填 | 绑定支持         | 详情                                                                                                                                                                                      | 示例                                                        |
| ---------------- |:--:| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| queueName        | Y  | Input/Output | The RabbitMQ queue name                                                                                                                                                                 | `"myqueue"`                                               |
| host             | Y  | Input/Output | The RabbitMQ host address                                                                                                                                                               | `"amqp://[username][:password]@host.domain[:port]"`       |
| durable          | 否  | 输出           | Tells RabbitMQ to persist message in storage. 默认值为 `"false"`                                                                                                                            | `"true"`, `"false"`                                       |
| deleteWhenUnused | 否  | Input/Output | Enables or disables auto-delete. 默认值为 `"false"`                                                                                                                                         | `"true"`, `"false"`                                       |
| ttlInseconds     | N  | 输出           | Set the [default message time to live at RabbitMQ queue level](https://www.rabbitmq.com/ttl.html). 如果此参数为空，消息将不会过期，继续在队列上存在，直到处理完毕。 See [also](#specifying-a-ttl-per-message)           | `60`                                                      |
| prefetchCount    | N  | 输入           | Set the [Channel Prefetch Setting (QoS)](https://www.rabbitmq.com/confirms.html#channel-qos-prefetch). 如果此参数为空，QOS 会设置为0为无限制。                                                           | `0`                                                       |
| exclusive        | N  | Input/Output | Determines whether the topic will be an exclusive topic or not. 默认值为 `"false"`                                                                                                          | `"true"`, `"false"`                                       |
| maxPriority      | N  | Input/Output | Parameter to set the [priority queue](https://www.rabbitmq.com/priority.html). 如果此参数为空，消息将不会过期，继续在队列上存在，直到处理完毕。 Value between 1 and 255. See [also](#specifying-a-priority-per-message) | `"1"`, `"10"`                                             |
| contentType      | N  | Input/Output | The content type of the message. Defaults to "text/plain".                                                                                                                              | `"text/plain"`, `"application/cloudevent+json"` and so on |
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

Priority can be defined at the message level. If `maxPriority` parameter is set, high priority messages will have priority over other low priority messages.

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

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
