---
type: docs
title: "Azure Service Bus Topics"
linkTitle: "Azure Service Bus Topics"
description: "Azure Service Bus Topics pubsub 组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-azure-servicebus-topics/"
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-azure-servicebus/"
---

## 组件格式

要配置 Azure Service Bus Topics pub/sub，需创建一个类型为 `pubsub.azure.servicebus.topics` 的组件。请参考 [pub/sub broker 组件文件]({{< ref setup-pubsub.md >}}) 了解 ConsumerID 的自动生成方式。阅读 [发布和订阅指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) 以获取创建和应用 pub/sub 配置的步骤。

> 此组件使用 Azure Service Bus 的主题功能；请查看官方文档了解 [主题和队列](https://learn.microsoft.com/azure/service-bus-messaging/service-bus-queues-topics-subscriptions) 的区别。  
> 如需使用队列，请参阅 [Azure Service Bus Queues pubsub 组件]({{< ref "setup-azure-servicebus-queues" >}})。

### 连接字符串认证

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: servicebus-pubsub
spec:
  type: pubsub.azure.servicebus.topics
  version: v1
  metadata:
  # 不使用 Microsoft Entra ID 认证时必需
  - name: connectionString
    value: "Endpoint=sb://{ServiceBusNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={ServiceBus}"
  # - name: consumerID # 可选：默认为应用程序自身的 ID
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

> __注意：__ 上述设置适用于使用此组件的所有主题。

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为 secret。建议使用 secret 存储来保护 secret，具体方法请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| `connectionString`   | 是  | Service Bus 的共享访问策略连接字符串。除非使用 Microsoft Entra ID 认证，否则必需。 | 见上例
| `namespaceName`| 否 | 设置 Service Bus 命名空间地址的参数，作为完全限定的域名。使用 Microsoft Entra ID 认证时必需。 | `"namespace.servicebus.windows.net"` |
| `consumerID`         | 否        | 消费者 ID 用于将一个或多个消费者组织成一个组。具有相同消费者 ID 的消费者作为一个虚拟消费者工作；例如，消息仅由组中的一个消费者处理一次。如果未提供 `consumerID`，Dapr 运行时将其设置为 Dapr 应用程序 ID (`appID`) 值。 | 可以设置为字符串值（如上例中的 `"channel1"`）或字符串格式值（如 `"{podName}"` 等）。[查看您可以在组件元数据中使用的所有模板标签。]({{< ref "component-schema.md#templated-metadata-values" >}})
| `timeoutInSec`       | 否  | 发送消息和管理操作的超时时间。默认：`60` |`30`
| `handlerTimeoutInSec`| 否  | 调用应用程序处理程序的超时时间。默认：`60` | `30`
| `lockRenewalInSec`      | 否  | 定义缓冲消息锁将被续订的频率。默认：`20`。 | `20`
| `maxActiveMessages`     | 否  | 定义一次处理或缓冲的最大消息数。此值应至少与最大并发处理程序一样大。默认：`1000` | `2000`
| `maxConcurrentHandlers` | 否  | 定义最大并发消息处理程序数。默认：`0`（无限制） | `10`
| `disableEntityManagement` | 否  | 设置为 true 时，队列和订阅不会自动创建。默认：`"false"` | `"true"`，`"false"`
| `defaultMessageTimeToLiveInSec` | 否  | 默认消息生存时间，以秒为单位。仅在订阅创建期间使用。 | `10`
| `autoDeleteOnIdleInSec` | 否  | 在自动删除空闲订阅之前等待的时间，以秒为单位。仅在订阅创建期间使用。必须为 300 秒或更长。默认：`0`（禁用） | `3600`
| `maxDeliveryCount`      | 否  | 定义服务器尝试传递消息的次数。仅在订阅创建期间使用。由服务器设置默认值。 | `10`
| `lockDurationInSec`     | 否  | 定义消息在过期前被锁定的时间长度，以秒为单位。仅在订阅创建期间使用。由服务器设置默认值。 | `30`
| `minConnectionRecoveryInSec` | 否 | 在连接失败的情况下，尝试重新连接到 Azure Service Bus 之前等待的最小间隔（以秒为单位）。默认：`2` | `5`
| `maxConnectionRecoveryInSec` | 否 | 在连接失败的情况下，尝试重新连接到 Azure Service Bus 之前等待的最大间隔（以秒为单位）。每次尝试后，组件在最小和最大之间等待一个随机秒数，每次增加。默认：`300`（5 分钟） | `600`
| `maxRetriableErrorsPerSec` | 否 | 每秒处理的最大可重试错误数。如果消息因可重试错误而无法处理，组件会在开始处理另一条消息之前添加延迟，以避免立即重新处理失败的消息。默认：`10` | `10`
| `publishMaxRetries` | 否  | 当 Azure Service Bus 响应“过于繁忙”以限制消息时的最大重试次数。默认：`5` | `5`
| `publishInitialRetryIntervalInMs` | 否  | 当 Azure Service Bus 限制消息时，初始指数退避的时间（以毫秒为单位）。默认：`500` | `500`

### Microsoft Entra ID 认证

Azure Service Bus Topics pubsub 组件支持使用所有 Microsoft Entra ID 机制进行认证，包括托管身份。有关更多信息以及根据选择的 Microsoft Entra ID 认证机制提供的相关组件元数据字段，请参阅 [Azure 认证文档]({{< ref authenticating-azure.md >}})。

#### 示例配置

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: servicebus-pubsub
spec:
  type: pubsub.azure.servicebus.topics
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

Azure Service Bus 消息通过附加上下文元数据扩展了 Dapr 消息格式。一些元数据字段由 Azure Service Bus 自行设置（只读），其他字段可以在发布消息时由客户端设置。

### 发送带有元数据的消息

要在发送消息时设置 Azure Service Bus 元数据，请在 HTTP 请求上设置查询参数或 gRPC 元数据，如[此处](https://docs.dapr.io/reference/api/pubsub_api/#metadata)所述。

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

> **注意：** `metadata.MessageId` 属性不会设置 Dapr 返回的云事件的 `id` 属性，应单独处理。

> **注意：** 如果未设置 `metadata.SessionId` 属性，但主题需要会话，则将使用空会话 ID。

> **注意：** `metadata.ScheduledEnqueueTimeUtc` 属性支持 [RFC1123](https://www.rfc-editor.org/rfc/rfc1123) 和 [RFC3339](https://www.rfc-editor.org/rfc/rfc3339) 时间戳格式。

### 接收带有元数据的消息

当 Dapr 调用您的应用程序时，它将使用 HTTP 头或 gRPC 元数据将 Azure Service Bus 消息元数据附加到请求中。
除了[上述可设置的元数据](#sending-a-message-with-metadata)外，您还可以访问以下只读消息元数据。

- `metadata.DeliveryCount`
- `metadata.LockedUntilUtc`
- `metadata.LockToken`
- `metadata.EnqueuedTimeUtc`
- `metadata.SequenceNumber`

要了解这些元数据属性的详细用途，请参阅[官方 Azure Service Bus 文档](https://docs.microsoft.com/rest/api/servicebus/message-headers-and-properties#message-headers)。

此外，原始 Azure Service Bus 消息的所有 `ApplicationProperties` 条目都作为 `metadata.<application property's name>` 附加。

> 注意：所有时间均由服务器填充，并未调整时钟偏差。

## 订阅启用会话的主题

要订阅[启用会话](https://learn.microsoft.com/azure/service-bus-messaging/message-sessions)的主题，您可以在订阅元数据中提供以下属性。

- `requireSessions (默认: false)`
- `sessionIdleTimeoutInSec (默认: 60)`
- `maxConcurrentSessions (默认: 8)`

## 为主题创建 Azure Service Bus broker

请按照[此处](https://docs.microsoft.com/azure/service-bus-messaging/service-bus-quickstart-topics-subscriptions-portal)的说明设置 Azure Service Bus Topics。

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [Pub/Sub 构建块]({{< ref pubsub >}})
- 阅读[本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})以获取配置 pub/sub 组件的说明