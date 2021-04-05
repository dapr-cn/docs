---
type: docs
title: "Azure Event Hubs 绑定规范"
linkTitle: "Azure Event Hubs"
description: "关于 Azure Event Hubs 组件绑定的详细文档"
---

## 配置

To setup Azure Event Hubs binding create a component of type `bindings.azure.eventhubs`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。

See [this](https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-dotnet-framework-getstarted-send) for instructions on how to set up an Event Hub.

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
以上示例将密钥明文存储。 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                   | 必填 | 绑定支持 | 详情                                                                                                                                                                                                                                                                               | 示例                     |
| -------------------- |:--:| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| connectionString     | 是  | 输出   | The [EventHubs connection string](https://docs.microsoft.com/en-us/azure/event-hubs/authorize-access-shared-access-signature). Note that this is the EventHub itself and not the EventHubs namespace. Make sure to use the child EventHub shared access policy connection string | `"Endpoint=sb://****"` |
| consumerGroup        | 是  | 输出   | The name of an [EventHubs Consumer Group](https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-features#consumer-groups) to listen on                                                                                                                                    | `"group1"`             |
| storageAccountName   | 是  | 输出   | The name of the account of the Azure Storage account to persist checkpoints data on                                                                                                                                                                                              | `"accountName"`        |
| storageAccountKey    | 是  | 输出   | The account key for the Azure Storage account to persist checkpoints data on                                                                                                                                                                                                     | `"accountKey"`         |
| storageContainerName | 是  | 输出   | The name of the container in the Azure Storage account to persist checkpoints data on                                                                                                                                                                                            | `"contianerName"`      |
| partitionID          | N  | 输出   | ID of the partition to send and receive events                                                                                                                                                                                                                                   | `0`                    |

## 绑定支持

该组件支持**输出绑定**，其操作如下:

- `create`

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
