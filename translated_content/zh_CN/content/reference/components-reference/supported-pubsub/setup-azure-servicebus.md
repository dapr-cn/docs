---
type: docs
title: "Azure Service Bus"
linkTitle: "Azure Service Bus"
description: "关于 Azure Service Bus pubsub 组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-azure-servicebus/"
---

## 配置
To setup Azure Service Bus pubsub create a component of type `pubsub.azure.servicebus`. 请参阅[本指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}})，了解如何创建和应用 pubsub 配置。

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
  - name: timeoutInSec # Optional
    value: 60
  - name: handlerTimeoutInSec # Optional
    value: 60
  - name: disableEntityManagement # Optional
    value: "false"
  - name: maxDeliveryCount # Optional
    value: 3
  - name: lockDurationInSec # Optional
    value: 60
  - name: lockRenewalInSec # Optional
    value: 20
  - name: maxActiveMessages # Optional
    value: 2000
  - name: maxActiveMessagesRecoveryInSec # Optional
    value: 2
  - name: maxConcurrentHandlers # Optional
    value: 10
  - name: prefetchCount # Optional
    value: 5
  - name: defaultMessageTimeToLiveInSec # Optional
    value: 10
  - name: autoDeleteOnIdleInSec # Optional
    value: 10
  - name: maxReconnectionAttempts # Optional
    value: 30
  - name: connectionRecoveryInSec # Optional
    value: 2
  - name: publishMaxRetries # Optional
    value: 5
  - name: publishInitialRetryInternalInMs # Optional
    value: 500
```

> __注意：__上述设置在使用该组件的所有主题中是通用的。

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                              | 必填 | 详情                                                                                                                         | 示例                                                                                                                                             |
| ------------------------------- |:--:| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| connectionString                | Y  | Service Bus 的连接地址                                                                                                          | "`Endpoint=sb://{ServiceBusNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={ServiceBus}`" |
| timeoutInSec                    | N  | 发送消息和其他管理操作的超时时间。 默认值：`60`                                                                                                 | `30`                                                                                                                                           |
| handlerTimeoutInSec             | N  | 调用应用handler的超时。 # 可选的。 默认值：`60`                                                                                            | `30`                                                                                                                                           |
| disableEntityManagement         | N  | 设置为 "true "时，主题和订阅不会自动创建。 默认值为 `"false"`                                                                                   | `"true"`, `"false"`                                                                                                                            |
| maxDeliveryCount                | N  | 定义服务器发送消息的尝试次数。 由服务端默认设置                                                                                                   | `10`                                                                                                                                           |
| lockDurationInSec               | N  | 定义消息过期前被锁定的时长，以秒为单位。 由服务端默认设置                                                                                              | `30`                                                                                                                                           |
| lockRenewalInSec                | N  | 定义缓冲消息锁的更新频率。 默认值：`20`.                                                                                                    | `20`                                                                                                                                           |
| maxActiveMessages               | N  | 定义一次要缓冲或处理的消息的最大数量。 默认值：`10000`                                                                                            | `2000`                                                                                                                                         |
| maxActiveMessagesRecoveryInSec  | N  | 定义达到最大活跃消息限制后等待的时长(秒) 默认值：`2` 默认值：`2`                                                                                      | `10`                                                                                                                                           |
| maxConcurrentHandlers           | N  | 定义并发消息处理器的最大数量                                                                                                             | `10`                                                                                                                                           |
| prefetchCount                   | N  | 定义预取消息的数量(用于高吞吐量/低延迟场景)                                                                                                    | `5`                                                                                                                                            |
| defaultMessageTimeToLiveInSec   | N  | 默认消息存活时间                                                                                                                   | `10`                                                                                                                                           |
| autoDeleteOnIdleInSec           | N  | 自动删除消息前等待的时间(秒)                                                                                                            | `10`                                                                                                                                           |
| maxReconnectionAttempts         | N  | Defines the maximum number of reconnect attempts. 默认值：`30`                                                                 | `30`                                                                                                                                           |
| connectionRecoveryInSec         | N  | Time in seconds to wait between connection recovery attempts. Defaults: `2`                                                | `2`                                                                                                                                            |
| publishMaxRetries               | N  | The max number of retries for when Azure Service Bus responds with "too busy" in order to throttle messages. Defaults: `5` | `5`                                                                                                                                            |
| publishInitialRetryInternalInMs | N  | Time in milliseconds for the initial exponential backoff when Azure Service Bus throttle messages. Defaults: `500`         | `500`                                                                                                                                          |

## 创建Azure Service Bus

请按照[此处](https://docs.microsoft.com/en-us/azure/service-bus-messaging/service-bus-quickstart-topics-subscriptions-portal)的说明设置Azure Service Bus Topics。

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- [发布/订阅构建块]({{< ref pubsub >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
