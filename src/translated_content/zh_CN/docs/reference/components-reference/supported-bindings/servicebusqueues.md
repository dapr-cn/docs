---
type: docs
title: "Azure Service Bus Queues 绑定规范"
linkTitle: "Azure Service Bus Queues"
description: "关于 Azure Service Bus Queues 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/servicebusqueues/"
---

## 组件格式

要设置 Azure Service Bus Queues 绑定，请创建一个类型为 `bindings.azure.servicebusqueues` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

### 连接字符串认证

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.azure.servicebusqueues
  version: v1
  metadata:
  - name: connectionString # 不使用 Azure 认证时必需。
    value: "Endpoint=sb://{ServiceBusNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={ServiceBus}"
  - name: queueName
    value: "queue1"
  # - name: timeoutInSec # 可选
  #   value: "60"
  # - name: handlerTimeoutInSec # 可选
  #   value: "60"
  # - name: disableEntityManagement # 可选
  #   value: "false"
  # - name: maxDeliveryCount # 可选
  #   value: "3"
  # - name: lockDurationInSec # 可选
  #   value: "60"
  # - name: lockRenewalInSec # 可选
  #   value: "20"
  # - name: maxActiveMessages # 可选
  #   value: "10000"
  # - name: maxConcurrentHandlers # 可选
  #   value: "10"
  # - name: defaultMessageTimeToLiveInSec # 可选
  #   value: "10"
  # - name: autoDeleteOnIdleInSec # 可选
  #   value: "3600"
  # - name: minConnectionRecoveryInSec # 可选
  #   value: "2"
  # - name: maxConnectionRecoveryInSec # 可选
  #   value: "300"
  # - name: maxRetriableErrorsPerSec # 可选
  #   value: "10"
  # - name: publishMaxRetries # 可选
  #   value: "5"
  # - name: publishInitialRetryIntervalInMs # 可选
  #   value: "500"
  # - name: direction
  #   value: "input, output"
```
{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为密钥。建议使用密钥存储来存储这些敏感信息，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 规范元数据字段

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|-----------------|----------|---------|
| `connectionString` | Y | 输入/输出 | Service Bus 的连接字符串。除非使用 Microsoft Entra ID 认证，否则必需。 | `"Endpoint=sb://************"` |
| `queueName` | Y | 输入/输出 | Service Bus 的队列名称。队列名称不区分大小写，并将始终强制为小写。 | `"queuename"` |
| `timeoutInSec` | N | 输入/输出 | 对 Azure Service Bus 端点的所有调用的超时时间，以秒为单位。*注意，此选项影响网络调用，与应用于消息的 TTL 无关*。默认值为 `"60"` | `"60"` |
| `namespaceName`| N | 输入/输出 | 设置 Service Bus 命名空间地址的参数，作为完全限定的域名。使用 Microsoft Entra ID 认证时必需。 | `"namespace.servicebus.windows.net"` |
| `disableEntityManagement` | N | 输入/输出 | 当设置为 true 时，队列和订阅不会自动创建。默认值为 `"false"` | `"true"`, `"false"`
| `lockDurationInSec`     | N | 输入/输出 | 定义消息在过期前被锁定的时间长度，以秒为单位。仅在订阅创建期间使用。由服务器设置默认值。 | `"30"`
| `autoDeleteOnIdleInSec` | N  | 输入/输出 | 在自动删除空闲订阅之前等待的时间，以秒为单位。仅在订阅创建期间使用。必须为 300 秒或更长。默认值为 `"0"` (禁用) | `"3600"`
| `defaultMessageTimeToLiveInSec` | N | 输入/输出 | 默认消息生存时间，以秒为单位。仅在订阅创建期间使用。 | `"10"`
| `maxDeliveryCount`      | N | 输入/输出 | 定义服务器尝试传递消息的次数。仅在订阅创建期间使用。由服务器设置默认值。 | `"10"`
| `minConnectionRecoveryInSec` | N | 输入/输出 | 在连接失败的情况下，尝试重新连接到 Azure Service Bus 之前等待的最小间隔（以秒为单位）。默认值为 `"2"` | `"5"`
| `maxConnectionRecoveryInSec` | N | 输入/输出 | 在连接失败的情况下，尝试重新连接到 Azure Service Bus 之前等待的最大间隔（以秒为单位）。每次尝试后，组件在最小和最大之间等待一个随机秒数，每次增加。默认值为 `"300"` (5 分钟) | `"600"`
| `maxActiveMessages`     | N  | 定义一次处理或在缓冲区中的最大消息数。此值应至少与最大并发处理程序一样大。默认值为 `"1"` | `"1"`
| `handlerTimeoutInSec`| N | 输入 | 调用应用程序处理程序的超时时间。默认值为 `"0"` (无超时) | `"30"`
| `minConnectionRecoveryInSec` | N | 输入 | 在连接失败的情况下，尝试重新连接到 Azure Service Bus 之前等待的最小间隔（以秒为单位）。默认值为 `"2"` | `"5"` |
| `maxConnectionRecoveryInSec` | N | 输入 | 在连接失败的情况下，尝试重新连接到 Azure Service Bus 之前等待的最大间隔（以秒为单位）。每次尝试后，绑定在最小和最大之间等待一个随机秒数，每次增加。默认值为 `"300"` (5 分钟) | `"600"` |
| `lockRenewalInSec`      | N | 输入 | 定义缓冲消息锁将被续订的频率。默认值为 `"20"`。 | `"20"`
| `maxActiveMessages`     | N | 输入 | 定义一次处理或在缓冲区中的最大消息数。此值应至少与最大并发处理程序一样大。默认值为 `"1"` | `"2000"`
| `maxConcurrentHandlers` | N | 输入 | 定义最大并发消息处理程序数；设置为 `0` 表示无限制。默认值为 `"1"` | `"10"`
| `maxRetriableErrorsPerSec` | N | 输入 | 每秒处理的最大可重试错误数。如果消息因可重试错误而无法处理，组件会在开始处理另一条消息之前添加延迟，以避免立即重新处理失败的消息。默认值为 `"10"` | `"10"`
| `publishMaxRetries` | N  | 输出 | 当 Azure Service Bus 响应“过于繁忙”以限制消息时的最大重试次数。默认值为 `"5"` | `"5"`
| `publishInitialRetryIntervalInMs` | N  | 输出 | 当 Azure Service Bus 限制消息时，初始指数退避的时间（以毫秒为单位）。默认值为 `"500"` | `"500"`
| `direction` | N  | 输入/输出 | 绑定的方向 | `"input"`, `"output"`, `"input, output"`

### Microsoft Entra ID 认证

Azure Service Bus Queues 绑定组件支持使用所有 Microsoft Entra ID 机制进行认证，包括托管身份。有关更多信息以及根据选择的 Microsoft Entra ID 认证机制提供的相关组件元数据字段，请参阅[认证到 Azure 的文档]({{< ref authenticating-azure.md >}})。

#### 示例配置

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.azure.servicebusqueues
  version: v1
  metadata:
  - name: azureTenantId
    value: "***"
  - name: azureClientId
    value: "***"
  - name: azureClientSecret
    value: "***"
  - name: namespaceName
    # 使用 Azure 认证时必需。
    # 必须是完全限定的域名
    value: "servicebusnamespace.servicebus.windows.net"
  - name: queueName
    value: queue1
  - name: ttlInSeconds
    value: 60
```

## 绑定支持

此组件支持 **输入和输出** 绑定功能。

此组件支持具有以下操作的 **输出绑定**：

- `create`: 将消息发布到指定队列

## 消息元数据

Azure Service Bus 消息通过附加上下文元数据扩展了 Dapr 消息格式。一些元数据字段由 Azure Service Bus 本身设置（只读），其他字段可以在通过 `Invoke` 绑定调用使用 `create` 操作发布消息时由客户端设置。

### 发送带有元数据的消息

要在发送消息时设置 Azure Service Bus 元数据，请在 HTTP 请求或 gRPC 元数据上设置查询参数，如[此处]({{< ref "bindings_api.md" >}})所述。

- `metadata.MessageId`
- `metadata.CorrelationId`
- `metadata.SessionId`
- `metadata.Label`
- `metadata.ReplyTo`
- `metadata.PartitionKey`
- `metadata.To`
- `metadata.ContentType`
- `metadata.ScheduledEnqueueTimeUtc`
- `metadata.ReplyToSessionId`

{{% alert title="注意" color="primary" %}}
- `metadata.MessageId` 属性不会设置 Dapr 返回的云事件的 `id` 属性，应单独处理。
- `metadata.ScheduledEnqueueTimeUtc` 属性支持 [RFC1123](https://www.rfc-editor.org/rfc/rfc1123) 和 [RFC3339](https://www.rfc-editor.org/rfc/rfc3339) 时间戳格式。
{{% /alert %}}

### 接收带有元数据的消息

当 Dapr 调用您的应用程序时，它使用 HTTP 头或 gRPC 元数据将 Azure Service Bus 消息元数据附加到请求中。
除了[上述可设置的元数据](#sending-a-message-with-metadata)外，您还可以访问以下只读消息元数据。

- `metadata.DeliveryCount`
- `metadata.LockedUntilUtc`
- `metadata.LockToken`
- `metadata.EnqueuedTimeUtc`
- `metadata.SequenceNumber`

要了解这些元数据属性的目的的更多详细信息，请参阅[官方 Azure Service Bus 文档](https://docs.microsoft.com/rest/api/servicebus/message-headers-and-properties#message-headers)。

此外，原始 Azure Service Bus 消息的所有 `ApplicationProperties` 条目都作为 `metadata.<application property's name>` 附加。

{{% alert title="注意" color="primary" %}}
所有时间均由服务器设置，并未调整时钟偏差。
{{% /alert %}}

## 为每条消息指定 TTL

生存时间可以在队列级别（如上所示）或消息级别进行定义。在消息级别定义的值将覆盖在队列级别设置的任何值。

要在消息级别设置生存时间，请在绑定调用期间使用请求体中的 `metadata` 部分：字段名称为 `ttlInSeconds`。

{{< tabs "Linux">}}

{{% codetab %}}

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myServiceBusQueue \
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

## 调度消息

可以调度消息以进行延迟处理。

要调度消息，请在绑定调用期间使用请求体中的 `metadata` 部分：字段名称为 `ScheduledEnqueueTimeUtc`。

支持的时间戳格式为 [RFC1123](https://www.rfc-editor.org/rfc/rfc1123) 和 [RFC3339](https://www.rfc-editor.org/rfc/rfc3339)。

{{< tabs "Linux">}}

{{% codetab %}}

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myServiceBusQueue \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        },
        "metadata": {
          "ScheduledEnqueueTimeUtc": "Tue, 02 Jan 2024 15:04:05 GMT"
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
