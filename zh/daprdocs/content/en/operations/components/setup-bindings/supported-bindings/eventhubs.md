---
type: 文档
title: "Azure Event Hubs binding spec"
linkTitle: "Azure Event Hubs"
description: "Detailed documentation on the Azure Event Hubs binding component"
---

## Introduction

To setup Azure Event Hubs binding create a component of type `bindings.azure.eventhubs`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

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

also support connection pool configuration variables:
The above example uses secrets as plain strings. also support connection pool configuration variables: The above example uses secrets as plain strings. 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Input bindings

| 字段                                                                                                           | Required | Output Binding Supported Operations | Details                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Example:               |
| ------------------------------------------------------------------------------------------------------------ |:--------:| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `connectionString` is the Service Bus connection string.                                                     |    Y     | Output                              | `connectionString` is the [EventHubs connection string](https://docs.microsoft.com/en-us/azure/event-hubs/authorize-access-shared-access-signature). Note that this is the EventHub itself and not the EventHubs namespace. Make sure to use the child EventHub shared access policy connection string. Note that this is the EventHub itself and not the EventHubs namespace. Make sure to use the child EventHub shared access policy connection string | `"Endpoint=sb://****"` |
| consumerGroup                                                                                                |    Y     | Output                              | `consumerGroup` is the name of an [EventHubs Consumer Group](https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-features#consumer-groups) to listen on.                                                                                                                                                                                                                                                                                         | `"group1"`             |
| `storageAccountName` Is the name of the account of the Azure Storage account to persist checkpoints data on. |    Y     | Output                              | `storageContainerName` Is the name of the container in the Azure Storage account to persist checkpoints data on.                                                                                                                                                                                                                                                                                                                                          | `"accountName"`        |
| `storageAccountKey`  Is the account key for the Azure Storage account to persist checkpoints data on.        |    Y     | Output                              | The account key for the Azure Storage account to persist checkpoints data on                                                                                                                                                                                                                                                                                                                                                                              | `"accountKey"`         |
| storageContainerName                                                                                         |    Y     | Output                              | The name of the container in the Azure Storage account to persist checkpoints data on                                                                                                                                                                                                                                                                                                                                                                     | `"contianerName"`      |
| partitionID                                                                                                  |    N     | Output                              | `partitionID` (Optional) ID of the partition to send and receive events.                                                                                                                                                                                                                                                                                                                                                                                  | `0`                    |

## Output bindings

字段名为 `ttlInSeconds`。

- `create`

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
