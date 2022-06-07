---
type: docs
title: "Azure SignalR binding spec"
linkTitle: "Azure SignalR"
description: "有关 Azure SignalR 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/signalr/"
---

## 配置

若要设置 Azure SignalR 绑定，请创建一个类型为 `bindings.azure.signalr`的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段               | 必填 | 绑定支持 | 详情                                                  | 示例                                                                                                                 |
| ---------------- |:--:| ---- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| connectionString | Y  | 输出   | Azure SignalR 连接字符串                                 | `"Endpoint=https://<your-azure-signalr>.service.signalr.net;AccessKey=<your-access-key>;Version=1.0;"` |
| hub              | 否  | 输出   | 定义消息将被发送到的 Hub。 发布到输出绑定时，可以将 Hub 动态定义为元数据值（键为"Hub"） | `"myhub"`                                                                                                          |


## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create`

## 补充资料

默认情况下，Azure SignalR 输出绑定将向所有连接的用户广播消息。 为了缩小受众范围，有两个选项，这两个选项都可以在消息的"元数据"属性中进行配置：

- 组：将消息发送到特定的 Azure SignalR 组
- 用户：将消息发送给特定的 Azure SignalR 用户

发布到 Azure SignalR 输出绑定的应用程序应发送具有以下协定的消息：

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

有关将 Azure SignalR 集成到解决方案中的详细信息，请查看 [文档](https://docs.microsoft.com/azure/azure-signalr/)

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
