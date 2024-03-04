---
type: docs
title: "Azure 存储队列绑定规范"
linkTitle: "Azure存储队列"
description: "Azure 存储队列绑定组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/storagequeues/"
---

## Component format

To setup Azure Storage Queues binding create a component of type `bindings.azure.storagequeues`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


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

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field               | Required | 绑定支持   | 详情                                                                                                                                                                                                                                                                                                                                        | 示例                                                                      |
| ------------------- |:--------:| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `accountName`       |    是     | 输入/输出  | The name of the Azure Storage account                                                                                                                                                                                                                                                                                                     | `"account1"`                                                            |
| `accountKey`        |    Y*    | 输入/输出  | The access key of the Azure Storage account. Only required when not using Microsoft Entra ID authentication.                                                                                                                                                                                                                              | `"access-key"`                                                          |
| `queueName`         |    是     | 输入/输出  | Azure存储队列名                                                                                                                                                                                                                                                                                                                                | `"myqueue"`                                                             |
| `pollingInterval`   |    否     | 输出     | Set the interval to poll Azure Storage Queues for new messages, as a Go duration value. Default: `"10s"`                                                                                                                                                                                                                                  | `"30s"`                                                                 |
| `ttlInSeconds`      |    否     | 输出     | 设置默认消息存活时间。 如果省略此参数，则消息将在 10 分钟后过期。 [另见](#specifying-a-ttl-per-message)                                                                                                                                                                                                                                                                   | `"60"`                                                                  |
| `decodeBase64`      |    否     | Input  | Configuration to decode base64 content received from the Storage Queue into a string. 默认值为 `false`                                                                                                                                                                                                                                        | `true`, `false`                                                         |
| `encodeBase64`      |    否     | Output | If enabled base64 encodes the data payload before uploading to Azure storage queues. Default `false`.                                                                                                                                                                                                                                     | `true`, `false`                                                         |
| `endpoint`          |    否     | 输入/输出  | Optional custom endpoint URL. This is useful when using the [Azurite emulator](https://github.com/Azure/azurite) or when using custom domains for Azure Storage (although this is not officially supported). The endpoint must be the full base URL, including the protocol (`http://` or `https://`), the IP or FQDN, and optional port. | `"http://127.0.0.1:10001"` or `"https://accountName.queue.example.com"` |
| `visibilityTimeout` |    否     | Input  | Allows setting a custom queue visibility timeout to avoid immediate retrying of recently failed messages. Defaults to 30 seconds.                                                                                                                                                                                                         | `"100s"`                                                                |
| `direction`         |    否     | 输入/输出  | Direction of the binding.                                                                                                                                                                                                                                                                                                                 | `"input"`, `"output"`, `"input, output"`                                |

### Microsoft Entra ID authentication

The Azure Storage Queue binding component supports authentication using all Microsoft Entra ID mechanisms. See the [docs for authenticating to Azure]({{< ref authenticating-azure.md >}}) to learn more about the relevant component metadata fields based on your choice of Microsoft Entra ID authentication mechanism.

## 绑定支持

This component supports both **input and output** binding interfaces.

该组件支持如下操作的 **输出绑定** ：

- `create`

## 输出绑定支持的操作

可以在队列级别 ( 如上所述) 或消息级别定义生存时间。 在消息级别定义的值会覆盖在队列级别设置的任何值。

若要设置在消息级别生存的时间，请使用 `metadata` 请求正文中的元数据部分。

字段名为 `ttlInSeconds`。

示例︰

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

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
