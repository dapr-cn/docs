---
type: docs
title: "Azure SignalR 绑定规范"
linkTitle: "Azure SignalR"
description: "关于 Azure SignalR 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/signalr/"
---

## 组件格式

要配置 Azure SignalR 绑定，请创建一个类型为 `bindings.azure.signalr` 的组件。请参考[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

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
  - name: hub  # 可选
    value: "<hub name>"
```

{{% alert title="警告" color="warning" %}}
上述示例使用了明文字符串作为 secret。建议使用 secret 存储来存储 secret，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 规范元数据字段

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `connectionString` | Y | 输出 | Azure SignalR 连接字符串 | `"Endpoint=https://<your-azure-signalr>.service.signalr.net;AccessKey=<your-access-key>;Version=1.0;"` |
| `hub` | N | 输出 | 定义消息将发送到的 hub。hub 可以在发布到输出绑定时动态定义为元数据值（键为 "hub"） | `"myhub"` |
| `endpoint` | N | 输出 | Azure SignalR 的端点；如果未包含在 `connectionString` 中或使用 Microsoft Entra ID，则必需 | `"https://<your-azure-signalr>.service.signalr.net"`
| `accessKey` | N | 输出 | 访问密钥 | `"your-access-key"`

### Microsoft Entra ID 认证

Azure SignalR 绑定组件支持所有 Microsoft Entra ID 认证机制。请参考[认证到 Azure 的文档]({{< ref authenticating-azure.md >}})以了解更多关于根据您选择的 Microsoft Entra ID 认证机制的相关组件元数据字段。

您可以通过以下两种方式使用 Microsoft Entra ID 认证此组件：

- 提供单独的元数据键：
  - `endpoint` 用于端点
  - 如有需要：`azureClientId`、`azureTenantId` 和 `azureClientSecret`
- 提供带有 `AuthType=aad` 指定的连接字符串：
  - 系统分配的托管身份：`Endpoint=https://<servicename>.service.signalr.net;AuthType=aad;Version=1.0;`
  - 用户分配的托管身份：`Endpoint=https://<servicename>.service.signalr.net;AuthType=aad;ClientId=<clientid>;Version=1.0;`
  - Microsoft Entra ID 应用程序：`Endpoint=https://<servicename>.service.signalr.net;AuthType=aad;ClientId=<clientid>;ClientSecret=<clientsecret>;TenantId=<tenantid>;Version=1.0;`  
  请注意，如果您的应用程序的 ClientSecret 包含 `;` 字符，则无法使用连接字符串。

## 绑定支持

此组件支持具有以下操作的**输出绑定**：

- `create`

## 附加信息

默认情况下，Azure SignalR 输出绑定会向所有连接的用户广播消息。要缩小消息的接收范围，可以在消息的 Metadata 属性中配置以下选项：

- group：将消息发送到特定的 Azure SignalR 组
- user：将消息发送到特定的 Azure SignalR 用户

发布到 Azure SignalR 输出绑定的应用程序应发送具有以下格式的消息：

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

有关将 Azure SignalR 集成到解决方案中的更多信息，请查看[文档](https://docs.microsoft.com/azure/azure-signalr/)

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [Bindings 构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [Bindings API 参考]({{< ref bindings_api.md >}})
