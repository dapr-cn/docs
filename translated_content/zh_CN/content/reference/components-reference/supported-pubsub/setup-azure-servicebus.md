---
type: docs
title: "Azure Service Bus"
linkTitle: "Azure Service Bus"
description: "关于 Azure Service Bus pubsub 组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-azure-servicebus/"
---

## 配置
若要安装 Azure Service Bus pubsub，请创建一个类型为 `pubsub.azure.servicebus`的组件。 请参阅[本指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}})，了解如何创建和应用 pubsub 配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: servicebus-pubsub
  namespace: default
spec:
  type: pubsub.azure.servicebus
  version: v1
  metadata:
  - name: connectionString # Required
    value: "Endpoint=sb://{ServiceBusNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={ServiceBus}"
  # - name: timeoutInSec # Optional
  #   value: 60
  # - name: handlerTimeoutInSec # Optional
  #   value: 60
  # - name: disableEntityManagement # Optional
  #   value: "false"
  # - name: maxDeliveryCount # Optional
  #   value: 3
  # - name: lockDurationInSec # Optional
  #   value: 60
  # - name: lockRenewalInSec # Optional
  #   value: 20
  # - name: maxActiveMessages # Optional
  #   value: 2000
  # - name: maxActiveMessagesRecoveryInSec # Optional
  #   value: 2
  # - name: maxConcurrentHandlers # Optional
  #   value: 10
  # - name: prefetchCount # Optional
  #   value: 5
  # - name: defaultMessageTimeToLiveInSec # Optional
  #   value: 10
  # - name: autoDeleteOnIdleInSec # Optional
  #   value: 3600
  # - name: maxReconnectionAttempts # Optional
  #   value: 30
  # - name: connectionRecoveryInSec # Optional
  #   value: 2
  # - name: publishMaxRetries # Optional
  #   value: 5
  # - name: publishInitialRetryInternalInMs # Optional
  #   value: 500
```

> __注意：__上述设置在使用该组件的所有主题中是通用的。

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                              | 必填 | 详情                                                               | 示例                                                                                                                                             |
| ------------------------------- |:--:| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| connectionString                | Y  | 服务总线共享访问策略连接字符串                                                  | "`Endpoint=sb://{ServiceBusNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={ServiceBus}`" |
| timeoutInSec                    | 否  | 发送消息和其他管理操作的超时时间。 默认值：`60`                                       | `30`                                                                                                                                           |
| handlerTimeoutInSec             | 否  | 调用应用handler的超时。 # 可选的。 默认值：`60`                                  | `30`                                                                                                                                           |
| disableEntityManagement         | 否  | 设置为 "true "时，主题和订阅不会自动创建。 默认值为 `"false"`                         | `"true"`, `"false"`                                                                                                                            |
| maxDeliveryCount                | N  | 定义服务器发送消息的尝试次数。 由服务端默认设置                                         | `10`                                                                                                                                           |
| lockDurationInSec               | N  | 定义消息过期前被锁定的时长，以秒为单位。 由服务端默认设置                                    | `30`                                                                                                                                           |
| lockRenewalInSec                | N  | 定义缓冲消息锁的更新频率。 默认值：`20`.                                          | `20`                                                                                                                                           |
| maxActiveMessages               | N  | 定义一次要缓冲或处理的消息的最大数量。 默认值：`10000`                                  | `2000`                                                                                                                                         |
| maxActiveMessagesRecoveryInSec  | N  | 定义达到最大活跃消息限制后等待的时长(秒) 默认值：`2` 默认值：`2`                            | `10`                                                                                                                                           |
| maxConcurrentHandlers           | N  | 定义并发消息处理器的最大数量                                                   | `10`                                                                                                                                           |
| prefetchCount                   | N  | 定义预取消息的数量(用于高吞吐量/低延迟场景)                                          | `5`                                                                                                                                            |
| defaultMessageTimeToLiveInSec   | N  | 默认消息存活时间                                                         | `10`                                                                                                                                           |
| autoDeleteOnIdleInSec           | N  | Time in seconds to wait before auto deleting idle subscriptions. | `3600`                                                                                                                                         |
| maxReconnectionAttempts         | 否  | 定义重新连接尝试的最大次数。 默认值：`30`                                          | `30`                                                                                                                                           |
| connectionRecoveryInSec         | 否  | 连接恢复尝试之间的等待时间（以秒为单位）。 默认值：`2`                                    | `2`                                                                                                                                            |
| publishMaxRetries               | 否  | Azure Service Bus 以"过于忙碌"为响应以限制消息时的最大重试次数。 默认值：`5`               | `5`                                                                                                                                            |
| publishInitialRetryInternalInMs | 否  | Azure Service Bus 限制消息时初始指数退避的时间（以毫秒为单位）。 默认值：`500`              | `500`                                                                                                                                          |

### Azure Active Directory (AAD) 认证
The Azure Service Bus pubsub component supports authentication using all Azure Active Directory mechanisms. 更多信息和相关组件的元数据字段根据选择的AAD认证机制，参考[Azure认证文档]({{< ref authenticating-azure.md >}})。

## 消息元数据

Azure Service Bus 消息使用其他上下文元数据扩展 Dapr 消息格式。 某些元数据字段由Azure Service Bus 本身设置（只读），其他元数据字段可由客户端在发布消息时设置。

### 发送带元数据的消息

若要在发送消息时设置 Azure Service Bus 元数据，请在 HTTP 请求或 gRPC 元数据上设置查询参数，如[此处](https://docs.dapr.io/reference/api/pubsub_api/#metadata)所述。

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

> **注意：** `metadata.MessageId` 属性没有设置云端事件的 `id` 属性，应该单独处理。

### 接收带元数据的消息

当 Dapr 调用应用程序时，它将使用 HTTP 标头或 gRPC 元数据将 Azure Service Bus 消息元数据附加到请求。 除了上面列出的 [可设置元数据](#sending-a-message-with-metadata)之外，您还可以访问以下只读消息元数据。

- `metadata.DeliveryCount`
- `metadata.LockedUntilUtc`
- `metadata.LockToken`
- `metadata.EnqueuedTimeUtc`
- `metadata.SequenceNumber`

若要了解有关任何这些元数据属性的用途的更多详细信息，请参阅 [官方 Azure Service Bus 文档](https://docs.microsoft.com/rest/api/servicebus/message-headers-and-properties#message-headers)。

## 创建Azure Service Bus

请按照[此处](https://docs.microsoft.com/azure/service-bus-messaging/service-bus-quickstart-topics-subscriptions-portal)的说明设置Azure Service Bus Topics。

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- [发布/订阅构建块]({{< ref pubsub >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
