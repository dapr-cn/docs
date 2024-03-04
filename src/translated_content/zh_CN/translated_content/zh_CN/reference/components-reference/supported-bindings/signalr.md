---
type: docs
title: "Azure SignalR绑定规范"
linkTitle: "Azure SignalR"
description: "有关 Azure SignalR 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/signalr/"
---

## Component format

To setup Azure SignalR binding create a component of type `bindings.azure.signalr`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.azure.signalr
  version: v1
  metadata:
  - name: connectionString
    value: "Endpoint=https://<your-azure-signalr>.service.signalr.net;AccessKey=<your-access-key>;Version=1.0;"
  - name: hub  # Optional
    value: "<hub name>"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field              | Required | 绑定支持   | 详情                                                                                                           | 示例                                                                                                                 |
| ------------------ |:--------:| ------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `connectionString` |    是     | Output | The Azure SignalR connection string                                                                          | `"Endpoint=https://<your-azure-signalr>.service.signalr.net;AccessKey=<your-access-key>;Version=1.0;"` |
| `hub`              |    否     | 输出     | 定义消息将被发送到的 Hub。 发布到输出绑定时，可以将 Hub 动态定义为元数据值（键为"Hub"）                                                          | `"myhub"`                                                                                                          |
| `endpoint`         |    否     | 输出     | Endpoint of Azure SignalR; required if not included in the `connectionString` or if using Microsoft Entra ID | `"https://<your-azure-signalr>.service.signalr.net"`                                                         |
| `accessKey`        |    否     | 输出     | Access key                                                                                                   | `"your-access-key"`                                                                                                |

### Microsoft Entra ID authentication

The Azure SignalR binding component supports authentication using all Microsoft Entra ID mechanisms. See the [docs for authenticating to Azure]({{< ref authenticating-azure.md >}}) to learn more about the relevant component metadata fields based on your choice of Microsoft Entra ID authentication mechanism.

You have two options to authenticate this component with Microsoft Entra ID:

- Pass individual metadata keys:
  - `endpoint` for the endpoint
  - If needed: `azureClientId`, `azureTenantId` and `azureClientSecret`
- Pass a connection string with `AuthType=aad` specified:
  - System-assigned managed identity: `Endpoint=https://<servicename>.service.signalr.net;AuthType=aad;Version=1.0;`
  - User-assigned managed identity: `Endpoint=https://<servicename>.service.signalr.net;AuthType=aad;ClientId=<clientid>;Version=1.0;`
  - Microsoft Entra ID application: `Endpoint=https://<servicename>.service.signalr.net;AuthType=aad;ClientId=<clientid>;ClientSecret=<clientsecret>;TenantId=<tenantid>;Version=1.0;`  
    Note that you cannot use a connection string if your application's ClientSecret contains a `;` character.

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create`

## 补充资料

By default the Azure SignalR output binding will broadcast messages to all connected users. To narrow the audience there are two options, both configurable in the Metadata property of the message:

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

For more information on integration Azure SignalR into a solution check the [documentation](https://docs.microsoft.com/azure/azure-signalr/)

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
