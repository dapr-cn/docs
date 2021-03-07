---
type: docs
title: "Azure SignalR binding spec"
linkTitle: "Azure SignalR"
description: "Detailed documentation on the Azure SignalR binding component"
---

## Component format

To setup Azure SignalR binding create a component of type `bindings.azure.signalr`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration. To setup Redis binding create a component of type `bindings.redis`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.signalr
  version: v1
  metadata:
  - name: connectionString
    value: Endpoint=https://<your-azure-signalr>.service.signalr.net;AccessKey=<your-access-key>;Version=1.0;
  - name: hub  # Optional
    value: <hub name>
```

{{% alert title="Warning" color="warning" %}}
以上示例将 Secret 明文存储。 The example configuration shown above, contain a username and password as plain-text strings. 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Spec metadata fields

| 字段               | Required | Binding support | Details                                                                                                                                                                                                          | Example                                                                                                            |
| ---------------- |:--------:| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| connectionString |    Y     | Output          | The Azure SignalR connection string                                                                                                                                                                              | `"Endpoint=https://<your-azure-signalr>.service.signalr.net;AccessKey=<your-access-key>;Version=1.0;"` |
| hub              |    N     | Output          | Defines the hub in which the message will be send. Defines the hub in which the message will be send. The hub can be dynamically defined as a metadata value when publishing to an output binding (key is "hub") | `"myhub"`                                                                                                          |


## 相关链接

This component supports **output binding** with the following operations:

- `create`

## Additional information

By default the Azure SignalR output binding will broadcast messages to all connected users. To narrow the audience there are two options, both configurable in the Metadata property of the message: To narrow the audience there are two options, both configurable in the Metadata property of the message:

- group: Sends the message to a specific Azure SignalR group
- user: Sends the message to a specific Azure SignalR user

Applications publishing to an Azure SignalR output binding should send a message with the following contract:

```json
{
    "data": {
        "Target": "<enter message name>",
        "Arguments": [
            {
                "sender": "dapr",
                "text": "Message from dapr output binding"
            }
        ]
    },
    "metadata": {
        "group": "chat123"
    },
    "operation": "create"
}
```

For more information on integration Azure SignalR into a solution check the [documentation](https://docs.microsoft.com/en-us/azure/azure-signalr/)

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
