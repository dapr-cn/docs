---
type: docs
title: "Azure Event Hubs 绑定规范"
linkTitle: "Azure Event Hubs"
description: "关于 Azure Event Hubs 组件绑定的详细文档"
---

## 配置

要开始 Azure 事件中心绑定，需要创建一个类型为 `bindings.azure.eventhubs` 的组件。 See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

参考此[实例](https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-dotnet-framework-getstarted-send)来创建一个事件中心。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.eventhubs
  version: v1
  metadata:
  - name: connectionString      # Azure EventHubs connection string
    value: "Endpoint=sb://****"
  - name: consumerGroup         # EventHubs consumer group
    value: "group1"
  - name: storageAccountName    # Azure Storage Account Name
    value: "accountName"   
  - name: storageAccountKey     # Azure Storage Account Key
    value: "accountKey"                
  - name: storageContainerName  # Azure Storage Container Name
    value: "containerName"    
  - name: partitionID           # (Optional) PartitionID to send and receive events
    value: 0
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段                   | 必填 | 绑定支持 | 详情                                                                                                                                                                                | Example                |
| -------------------- |:--:| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| connectionString     | Y  | 输出   | [EventHubs 连接字符串](https://docs.microsoft.com/en-us/azure/event-hubs/authorize-access-shared-access-signature)。 请注意，这是 EventHubs 本身，而不是 EventHubs 名称空间。 确保使用子 EventHub 共享访问策略连接字符串 | `"Endpoint=sb://****"` |
| consumerGroup        | Y  | 输出   | The name of an [EventHubs Consumer Group](https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-features#consumer-groups) to listen on                                     | `"group1"`             |
| storageAccountName   | Y  | 输出   | The name of the account of the Azure Storage account to persist checkpoints data on                                                                                               | `"accountName"`        |
| storageAccountKey    | Y  | 输出   | The account key for the Azure Storage account to persist checkpoints data on                                                                                                      | `"accountKey"`         |
| storageContainerName | Y  | 输出   | The name of the container in the Azure Storage account to persist checkpoints data on                                                                                             | `"contianerName"`      |
| partitionID          | N  | 输出   | ID of the partition to send and receive events                                                                                                                                    | `0`                    |

## 绑定支持

字段名为 `ttlInSeconds`。

- `create`

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
