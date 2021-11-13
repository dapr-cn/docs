---
type: docs
title: "Azure Service Bus"
linkTitle: "Azure Service Bus"
description: "关于 Azure Service Bus pubsub 组件的详细文档"
---

## 配置
要安装 Azure Event Hubs pubsub ，请创建一个类型为 `pubsub.azure.servicebus` 的组件。 See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.

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
```

> __注意：__上述设置在使用该组件的所有主题中是通用的。

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段                             | 必填 | 详情                                       | Example                                                                                                                                        |
| ------------------------------ |:--:| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| connectionString               | Y  | Event Hubs的连接地址                          | "`Endpoint=sb://{ServiceBusNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={ServiceBus}`" |
| timeoutInSec                   | N  | 发送消息和其他管理操作的超时时间。 默认值：`60`               | `30`                                                                                                                                           |
| handlerTimeoutInSec            | N  | 调用应用handler的超时。 # 可选的。 默认值：`60`          | `30`                                                                                                                                           |
| disableEntityManagement        | N  | 设置为 "true "时，主题和订阅不会自动创建。 默认值为 `"false"` | `"true"`, `"false"`                                                                                                                            |
| maxDeliveryCount               | N  | 定义服务器发送消息的尝试次数。 由服务端默认设置                 | `10`                                                                                                                                           |
| lockDurationInSec              | N  | 定义消息过期前被锁定的时长，以秒为单位。 由服务端默认设置            | `30`                                                                                                                                           |
| lockRenewalInSec               | N  | 定义缓冲消息锁的更新频率。 默认值：`20`.                  | `20`                                                                                                                                           |
| maxActiveMessages              | N  | 定义一次要缓冲或处理的消息的最大数量。 默认值：`10000`          | `2000`                                                                                                                                         |
| maxActiveMessagesRecoveryInSec | N  | 定义达到最大活跃消息限制后等待的时长(秒) 默认值：`2` 默认值：`2`    | `10`                                                                                                                                           |
| maxConcurrentHandlers          | N  | 定义并发消息处理器的最大数量                           | `10`                                                                                                                                           |
| prefetchCount                  | N  | 定义预取消息的数量(用于高吞吐量/低延迟场景)                  | `5`                                                                                                                                            |
| defaultMessageTimeToLiveInSec  | N  | 默认消息存活时间                                 | `10`                                                                                                                                           |
| autoDeleteOnIdleInSec          | N  | 自动删除消息前等待的时间(秒)                          | `10`                                                                                                                                           |

## 创建Azure Service Bus

请按照[此处](https://docs.microsoft.com/en-us/azure/service-bus-messaging/service-bus-quickstart-topics-subscriptions-portal)的说明设置Azure Service Bus Topics。

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- [发布/订阅构建块]({{< ref pubsub >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
