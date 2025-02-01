---
type: docs
title: "RabbitMQ 绑定规范"
linkTitle: "RabbitMQ"
description: "RabbitMQ 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/rabbitmq/"
---

## 组件格式

要设置 RabbitMQ 绑定，需创建一个类型为 `bindings.rabbitmq` 的组件。请参考[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

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
    value: "queue1"
  - name: host
    value: "amqp://[username][:password]@host.domain[:port]"
  - name: durable
    value: "true"
  - name: deleteWhenUnused
    value: "false"
  - name: ttlInSeconds
    value: "60"
  - name: prefetchCount
    value: "0"
  - name: exclusive
    value: "false"
  - name: maxPriority
    value: "5"
  - name: contentType
    value: "text/plain"
  - name: reconnectWaitInSeconds
    value: "5"
  - name: externalSasl
    value: "false"
  - name: caCert
    value: "null"
  - name: clientCert
    value: "null"
  - name: clientKey
    value: "null"
  - name: direction 
    value: "input, output"
```

{{% alert title="警告" color="warning" %}}
上述示例中，secret 使用了明文字符串。建议使用 secret 存储，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 规范元数据字段

> 发布新的 RabbitMQ 消息时，所有关联元数据的值都会添加到消息的头部。

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `queueName` | Y | 输入/输出 |  RabbitMQ 队列名称 | `"myqueue"` |
| `host` | Y | 输入/输出 | RabbitMQ 主机地址 | `"amqp://[username][:password]@host.domain[:port]"` 或使用 TLS: `"amqps://[username][:password]@host.domain[:port]"` |
| `durable` | N | 输出 | 指定 RabbitMQ 是否持久化存储消息。默认为 `"false"` | `"true"`, `"false"` |
| `deleteWhenUnused` | N | 输入/输出 | 启用或禁用自动删除。默认为 `"false"` | `"true"`, `"false"` |
| `ttlInSeconds` | N | 输出 | 设置 [RabbitMQ 队列级别的默认消息生存时间](https://www.rabbitmq.com/ttl.html)。如果省略此参数，消息将不会过期，继续存在于队列中直到被处理。另见 [此处](#specifying-a-ttl-per-message)  | `60` |
| `prefetchCount` | N | 输入 | 设置 [通道预取设置 (QoS)](https://www.rabbitmq.com/confirms.html#channel-qos-prefetch)。如果省略此参数，QoS 将设置为 0 表示无限制 | `0` |
| `exclusive` | N | 输入/输出 | 确定主题是否为独占主题。默认为 `"false"` | `"true"`, `"false"` |
| `maxPriority`| N | 输入/输出 | 设置 [优先级队列](https://www.rabbitmq.com/priority.html) 的参数。如果省略此参数，队列将被创建为普通队列而不是优先级队列。值在 1 到 255 之间。另见 [此处](#specifying-a-priority-per-message) | `"1"`, `"10"` |
| `contentType` | N | 输入/输出 | 消息的内容类型。默认为 "text/plain"。 | `"text/plain"`, `"application/cloudevent+json"` 等 |
| `reconnectWaitInSeconds` | N | 输入/输出 | 表示客户端在断开连接后尝试重新连接到服务器之前应等待的秒数。默认为 `"5"`。 | `"5"`, `"10"` |
| `externalSasl` | N | 输入/输出 | 使用 TLS 时，用户名是否应从附加字段（例如 CN）中获取。参见 [RabbitMQ 认证机制](https://www.rabbitmq.com/access-control.html#mechanisms)。默认为 `"false"`。 | `"true"`, `"false"` |
| `caCert` | N | 输入/输出 | 用于 TLS 连接的 CA 证书。默认为 `null`。 | `"-----BEGIN CERTIFICATE-----\nMI..."` |
| `clientCert` | N | 输入/输出 | 用于 TLS 连接的客户端证书。默认为 `null`。 | `"-----BEGIN CERTIFICATE-----\nMI..."` |
| `clientKey` | N | 输入/输出 | 用于 TLS 连接的客户端密钥。默认为 `null`。 | `"-----BEGIN PRIVATE KEY-----\nMI..."` |
| `direction` | N | 输入/输出 | 绑定的方向。 | `"input"`, `"output"`, `"input, output"` |

## 绑定支持

此组件支持 **输入和输出** 绑定接口。

此组件支持以下操作的 **输出绑定**：

- `create`

## 设置每条消息的 TTL

生存时间可以在队列级别（如上所示）或消息级别定义。在消息级别定义的值将覆盖在队列级别设置的任何值。

要在消息级别设置生存时间，请在绑定调用期间使用请求体中的 `metadata` 部分。

字段名称为 `ttlInSeconds`。

示例：

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

## 设置每条消息的优先级

优先级可以在消息级别定义。如果设置了 `maxPriority` 参数，高优先级消息将优先于其他低优先级消息。

要在消息级别设置优先级，请在绑定调用期间使用请求体中的 `metadata` 部分。

字段名称为 `priority`。

示例：

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

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
