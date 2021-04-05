---
type: docs
title: "Azure Event Hubs 绑定规范"
linkTitle: "Azure Event Hubs"
description: "关于 Azure Event Hubs 组件绑定的详细文档"
---

## 组件格式

To setup Azure Event Hubs binding create a component of type `bindings.azure.eventhubs`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration. To setup Redis binding create a component of type `bindings.redis`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

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
The above example uses secrets as plain strings. The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| 字段                   | Required | Binding support | Details                                                                                                                                                                                                                                                                                                                                                                                                                            | Example                |
| -------------------- |:--------:| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| connectionString     |    Y     | Output          | The [EventHubs connection string](https://docs.microsoft.com/en-us/azure/event-hubs/authorize-access-shared-access-signature). Note that this is the EventHub itself and not the EventHubs namespace. Make sure to use the child EventHub shared access policy connection string Note that this is the EventHub itself and not the EventHubs namespace. Make sure to use the child EventHub shared access policy connection string | `"Endpoint=sb://****"` |
| consumerGroup        |    Y     | Output          | The name of an [EventHubs Consumer Group](https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-features#consumer-groups) to listen on                                                                                                                                                                                                                                                                                      | `"group1"`             |
| storageAccountName   |    Y     | Output          | The name of the account of the Azure Storage account to persist checkpoints data on                                                                                                                                                                                                                                                                                                                                                | `"accountName"`        |
| storageAccountKey    |    Y     | Output          | The account key for the Azure Storage account to persist checkpoints data on                                                                                                                                                                                                                                                                                                                                                       | `"accountKey"`         |
| storageContainerName |    Y     | Output          | The name of the container in the Azure Storage account to persist checkpoints data on                                                                                                                                                                                                                                                                                                                                              | `"contianerName"`      |
| partitionID          |    N     | Output          | ID of the partition to send and receive events                                                                                                                                                                                                                                                                                                                                                                                     | `0`                    |

## 相关链接

字段名为 `ttlInSeconds`。

- `create`

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
