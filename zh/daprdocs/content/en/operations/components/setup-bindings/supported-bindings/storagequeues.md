---
type: 文档
title: "Azure Storage Queues binding spec"
linkTitle: "Azure Storage Queues"
description: "Detailed documentation on the Azure Storage Queues binding component"
---

## Introduction

To setup Azure Storage Queues binding create a component of type `bindings.azure.storagequeues`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.storagequeues
  version: v1
  metadata:
  - name: storageAccount
    value: "account1"
  - name: storageAccessKey
    value: "***********"
  - name: queue
    value: "myqueue"
  - name: ttlInSeconds
    value: "60"
```

{{% alert title="Warning" color="warning" %}}
以上示例将 Secret 明文存储。 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Input bindings

| 字段                                                  | Required | Output Binding Supported Operations | Details                                                                                                                                                           | Example:      |
| --------------------------------------------------- |:--------:| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| storageAccount                                      |    Y     | Input/Output                        | `storageAccount` is the Azure Storage account name.                                                                                                               | `"account1"`  |
| `storageAccessKey` is the Azure Storage access key. |    Y     | Input/Output                        | The Azure Storage access key                                                                                                                                      | `"accessKey"` |
| queue                                               |    Y     | Input/Output                        | `queue` is the name of the Azure Storage queue.                                                                                                                   | `"myqueue"`   |
| ttlInSeconds                                        |    N     | Output                              | Parameter to set the default message time to live. If this parameter is omitted, messages will expire after 10 minutes. See [also](#specifying-a-ttl-per-message) | `"60"`        |

## Output bindings

For input bindings, where the query matching Tweets are streamed to the user service, the above component has to also include a query:

字段名为 `ttlInSeconds`。

- `create`

## 输出绑定支持的操作

可以在队列级别 ( 如上所述) 或消息级别定义生存时间。 在消息级别定义的值会覆盖在队列级别设置的任何值。

若要设置在消息级别生存的时间，请使用 `metadata` 请求正文中的元数据部分。

字段名为 `ttlInSeconds`。

{{< tabs >}}

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
## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
