---
type: docs
title: "Azure Service Bus 队列"
linkTitle: "Azure Service Bus 队列"
description: "关于 Azure Service Bus 队列发布/订阅组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-azure-servicebus-queues/"
---

## 组件格式

要配置 Azure Service Bus 队列的发布/订阅功能，创建一个类型为 `pubsub.azure.servicebus.queues` 的组件。请参考 [发布/订阅代理组件文件]({{< ref setup-pubsub.md >}}) 了解 ConsumerID 是如何自动生成的。请阅读 [发布和订阅指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) 了解如何创建和应用发布/订阅配置。

> 该组件在 Azure Service Bus 上使用队列；请查看官方文档了解 [主题和队列](https://learn.microsoft.com/azure/service-bus-messaging/service-bus-queues-topics-subscriptions) 之间的区别。
> 若要使用主题，请参阅 [Azure Service Bus 主题发布/订阅组件]({{< ref "setup-azure-servicebus-topics" >}})。

### 连接字符串认证

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: servicebus-pubsub
spec:
  type: pubsub.azure.servicebus.queues
  version: v1
  metadata:
  # 不使用 Microsoft Entra ID 认证时必需
  - name: connectionString
    value: "Endpoint=sb://{ServiceBusNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={ServiceBus}"
  # - name: consumerID # 可选
  #   value: channel1
  # - name: timeoutInSec # 可选
  #   value: 60
  # - name: handlerTimeoutInSec # 可选
  #   value: 60
  # - name: disableEntityManagement # 可选
  #   value: "false"
  # - name: maxDeliveryCount # 可选
  #   value: 3
  # - name: lockDurationInSec # 可选
  #   value: 60
  # - name: lockRenewalInSec # 可选
  #   value: 20
  # - name: maxActiveMessages # 可选
  #   value: 10000
  # - name: maxConcurrentHandlers # 可选
  #   value: 10
  # - name: defaultMessageTimeToLiveInSec # 可选
  #   value: 10
  # - name: autoDeleteOnIdleInSec # 可选
  #   value: 3600
  # - name: minConnectionRecoveryInSec # 可选
  #   value: 2
  # - name: maxConnectionRecoveryInSec # 可选
  #   value: 300
  # - name: maxRetriableErrorsPerSec # 可选
  #   value: 10
  # - name: publishMaxRetries # 可选
  #   value: 5
  # - name: publishInitialRetryIntervalInMs # 可选
  #   value: 500
```

{{% alert title="警告" color="warning" %}}
上述示例使用明文字符串作为密钥。建议使用密钥存储来存储密钥，如 [此处]({{< ref component-secrets.md >}}) 所述。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| `connectionString`   | Y  | Service Bus 的共享访问策略连接字符串。除非使用 Microsoft Entra ID 认证，否则必需。 | 见上例
| `consumerID`       | N | 消费者 ID（消费者标签）将一个或多个消费者组织成一个组。具有相同消费者 ID 的消费者作为一个虚拟消费者工作；例如，消息仅由组中的一个消费者处理一次。如果未提供 `consumerID`，Dapr 运行时将其设置为 Dapr 应用程序 ID (`appID`) 值。 | 可以设置为字符串值（如上例中的 `"channel1"`）或字符串格式值（如 `"{podName}"` 等）。[查看您可以在组件元数据中使用的所有模板标签。]({{< ref "component-schema.md#templated-metadata-values" >}})
| `namespaceName`| N | 设置 Service Bus 命名空间地址的参数，作为完全限定的域名。使用 Microsoft Entra ID 认证时必需。 | `"namespace.servicebus.windows.net"` |
| `timeoutInSec`       | N  | 发送消息和管理操作的超时时间。默认：`60` |`30`
| `handlerTimeoutInSec`| N  | 调用应用程序处理程序的超时时间。默认：`60` | `30`
| `lockRenewalInSec`      | N  | 定义缓冲消息锁将被续订的频率。默认：`20`。 | `20`
| `maxActiveMessages`     | N  | 定义一次处理或缓冲的最大消息数。此值应至少与最大并发处理程序一样大。默认：`1000` | `2000`
| `maxConcurrentHandlers` | N  | 定义最大并发消息处理程序数。默认：`0`（无限制） | `10`
| `disableEntityManagement` | N  | 设置为 true 时，队列和订阅不会自动创建。默认：`"false"` | `"true"`，`"false"`
| `defaultMessageTimeToLiveInSec` | N  | 默认消息生存时间，以秒为单位。仅在订阅创建期间使用。 | `10`
| `autoDeleteOnIdleInSec` | N  | 在自动删除空闲订阅之前等待的时间，以秒为单位。仅在订阅创建期间使用。必须为 300 秒或更长。默认：`0`（禁用） | `3600`
| `maxDeliveryCount`      | N  | 定义服务器尝试传递消息的次数。仅在订阅创建期间使用。服务器默认设置。 | `10`
| `lockDurationInSec`     | N  | 定义消息在过期前被锁定的时间长度，以秒为单位。仅在订阅创建期间使用。服务器默认设置。 | `30`
| `minConnectionRecoveryInSec` | N | 在连接失败的情况下，尝试重新连接到 Azure Service Bus 之前等待的最小间隔（以秒为单位）。默认：`2` | `5`
| `maxConnectionRecoveryInSec` | N | 在连接失败的情况下，尝试重新连接到 Azure Service Bus 之前等待的最大间隔（以秒为单位）。每次尝试后，组件在最小和最大之间等待一个随机秒数，每次增加。默认：`300`（5 分钟） | `600`
| `maxRetriableErrorsPerSec` | N | 每秒处理的最大可重试错误数。如果消息处理失败并出现可重试错误，组件会在开始处理另一条消息之前添加延迟，以避免立即重新处理失败的消息。默认：`10` | `10`
| `publishMaxRetries` | N  | 当 Azure Service Bus 响应“过于繁忙”以限制消息时的最大重试次数。默认：`5` | `5`
| `publishInitialRetryIntervalInMs` | N  | 当 Azure Service Bus 限制消息时，初始指数回退的时间（以毫秒为单位）。默认：`500` | `500`

### Microsoft Entra ID 认证

Azure Service Bus 队列发布/订阅组件支持使用所有 Microsoft Entra ID 机制进行认证，包括托管身份。有关更多信息以及根据选择的 Microsoft Entra ID 认证机制提供的相关组件元数据字段，请参阅 [Azure 认证文档]({{< ref authenticating-azure.md >}})。

#### 示例配置

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: servicebus-pubsub
spec:
  type: pubsub.azure.servicebus.queues
  version: v1
  metadata:
  - name: namespaceName
    # 使用 Azure 认证时必需。
    # 必须是完全限定的域名
    value: "servicebusnamespace.servicebus.windows.net"
  - name: azureTenantId
    value: "***"
  - name: azureClientId
    value: "***"
  - name: azureClientSecret
    value: "***"
```

## 消息元数据

Azure Service Bus 消息在 Dapr 消息格式的基础上增加了上下文元数据。一些元数据字段由 Azure Service Bus 本身设置（只读），其他字段可以在发布消息时由客户端设置。

### 发送带有元数据的消息

要在发送消息时设置 Azure Service Bus 元数据，请在 HTTP 请求或 gRPC 元数据上设置查询参数，如 [此处]({{< ref "pubsub_api.md#metadata" >}}) 所述。

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
除了 [上述可设置的元数据](#sending-a-message-with-metadata) 外，您还可以访问以下只读消息元数据。

- `metadata.DeliveryCount`
- `metadata.LockedUntilUtc`
- `metadata.LockToken`
- `metadata.EnqueuedTimeUtc`
- `metadata.SequenceNumber`

要了解这些元数据属性的用途的更多详细信息，请参阅 [官方 Azure Service Bus 文档](https://docs.microsoft.com/rest/api/servicebus/message-headers-and-properties#message-headers)。

此外，原始 Azure Service Bus 消息的所有 `ApplicationProperties` 条目都作为 `metadata.<application property's name>` 附加。

{{% alert title="注意" color="primary" %}}
所有时间均由服务器填充，并未调整时钟偏差。
{{% /alert %}}

## 发送和接收多条消息

Azure Service Bus 支持使用批量发布/订阅 API 在单个操作中发送和接收多条消息。

### 配置批量发布

要为批量发布操作设置元数据，请在 HTTP 请求或 gRPC 元数据上设置查询参数，如 [此处]({{< ref pubsub_api >}}) 所述。

| 元数据 | 默认值 |
|----------|---------|
| `metadata.maxBulkPubBytes` | `131072` (128 KiB) |

### 配置批量订阅

订阅主题时，您可以配置 `bulkSubscribe` 选项。有关更多详细信息，请参阅 [批量订阅消息]({{< ref "pubsub-bulk#subscribing-messages-in-bulk" >}})。了解更多关于 [批量订阅 API]({{< ref pubsub-bulk.md >}}) 的信息。

| 配置 | 默认值 |
|---------------|---------|
| `maxMessagesCount` | `100` |

## 创建 Azure Service Bus 队列代理

按照 [此处](https://learn.microsoft.com/azure/service-bus-messaging/service-bus-quickstart-portal) 的说明设置 Azure Service Bus 队列。

{{% alert title="注意" color="primary" %}}
您的队列名称必须与您使用 Dapr 发布的主题名称相同。例如，如果您在发布/订阅 `"myPubsub"` 上发布到主题 `"orders"`，则您的队列必须命名为 `"orders"`。
如果您使用共享访问策略连接到队列，则该策略必须能够“管理”队列。要使用死信队列，该策略必须位于包含主队列和死信队列的 Service Bus 命名空间中。
{{% /alert %}}

### 重试策略和死信队列

默认情况下，Azure Service Bus 队列有一个死信队列。消息会根据 `maxDeliveryCount` 的值进行重试。默认的 `maxDeliveryCount` 值为 10，但可以设置为最多 2000。这些重试发生得非常迅速，如果没有成功返回，消息将被放入死信队列。

Dapr 发布/订阅提供了自己的死信队列概念，允许您控制重试策略并通过 Dapr 订阅死信队列。
1. 在 Azure Service Bus 命名空间中设置一个单独的队列作为死信队列，并定义一个弹性策略来定义如何重试。
1. 订阅主题以获取失败的消息并处理它们。

例如，在订阅中设置一个死信队列 `orders-dlq` 和一个弹性策略，允许您订阅主题 `orders-dlq` 以处理失败的消息。

有关设置死信队列的更多详细信息，请参阅 [死信文章]({{< ref pubsub-deadletter >}})。

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [发布/订阅构建块]({{< ref pubsub >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) 以获取配置发布/订阅组件的说明
