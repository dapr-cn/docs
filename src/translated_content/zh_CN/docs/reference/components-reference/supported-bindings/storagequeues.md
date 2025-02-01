---
type: docs
title: "Azure Storage Queues 绑定规范"
linkTitle: "Azure Storage Queues"
description: "关于 Azure Storage Queues 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/storagequeues/"
---

## 组件格式

要配置 Azure Storage Queues 绑定，需创建一个类型为 `bindings.azure.storagequeues` 的组件。请参考[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.azure.storagequeues
  version: v1
  metadata:
  - name: accountName
    value: "account1"
  - name: accountKey
    value: "***********"
  - name: queueName
    value: "myqueue"
# - name: pollingInterval
#   value: "30s"
# - name: ttlInSeconds
#   value: "60"
# - name: decodeBase64
#   value: "false"
# - name: encodeBase64
#   value: "false"
# - name: endpoint
#   value: "http://127.0.0.1:10001"
# - name: visibilityTimeout
#   value: "30s"
# - name: direction 
#   value: "input, output"
```

{{% alert title="警告" color="warning" %}}
上述示例中，secret 使用了明文字符串。建议使用 secret 存储，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 元数据字段说明

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `accountName` | Y | 输入/输出 | Azure Storage 帐户的名称 | `"account1"` |
| `accountKey` | Y* | 输入/输出 | Azure Storage 帐户的访问密钥。仅在不使用 Microsoft Entra ID 身份验证时需要。 | `"access-key"` |
| `queueName` | Y | 输入/输出 | Azure Storage 队列的名称 | `"myqueue"` |
| `pollingInterval` | N | 输出 | 设置轮询 Azure Storage Queues 以获取新消息的间隔，作为 Go 持续时间值。默认值：`"10s"` | `"30s"` |
| `ttlInSeconds` | N | 输出 | 设置默认消息生存时间的参数。如果省略此参数，消息将在 10 分钟后过期。参见[此处](#specifying-a-ttl-per-message) | `"60"` |
| `decodeBase64` | N | 输入 | 配置将从 Storage Queue 接收到的 base64 内容解码为字符串。默认为 `false` | `true`, `false` |
| `encodeBase64` | N | 输出 | 如果启用，则在上传到 Azure storage queues 之前对数据负载进行 base64 编码。默认 `false`。 | `true`, `false` |
| `endpoint` | N | 输入/输出 | 可选的自定义端点 URL。这在使用 [Azurite 模拟器](https://github.com/Azure/azurite)或使用 Azure Storage 的自定义域时很有用（尽管这不是官方支持的）。端点必须是完整的基本 URL，包括协议（`http://` 或 `https://`）、IP 或 FQDN，以及可选端口。 | `"http://127.0.0.1:10001"` 或 `"https://accountName.queue.example.com"` |
| `visibilityTimeout` | N | 输入 | 允许设置自定义队列可见性超时，以避免最近失败消息的立即重试。默认为 30 秒。 | `"100s"` |
| `direction` | N | 输入/输出 | 绑定的方向。 | `"input"`, `"output"`, `"input, output"` |

### Microsoft Entra ID 身份验证

Azure Storage Queue 绑定组件支持使用所有 Microsoft Entra ID 机制进行身份验证。请参阅[Azure 身份验证文档]({{< ref authenticating-azure.md >}})以了解有关根据您选择的 Microsoft Entra ID 身份验证机制的相关组件元数据字段的更多信息。

## 绑定支持

此组件支持 **输入和输出** 绑定接口。

此组件支持具有以下操作的 **输出绑定**：

- `create`

## 为每条消息指定 TTL

生存时间可以在队列级别（如上所示）或消息级别定义。在消息级别定义的值将覆盖在队列级别设置的任何值。

要在消息级别设置生存时间，请在绑定调用期间使用请求体中的 `metadata` 部分。

字段名称为 `ttlInSeconds`。

示例：

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myStorageQueue \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        },
        "metadata": {
          "ttlInSeconds": "60"
        },
        "operation": "create"
      }'
```

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [bindings 构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用 bindings 与外部资源接口]({{< ref howto-bindings.md >}})
- [bindings API 参考]({{< ref bindings_api.md >}})
