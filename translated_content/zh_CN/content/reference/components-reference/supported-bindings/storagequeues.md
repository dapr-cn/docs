---
type: docs
title: "Azure Storage Queues binding spec"
linkTitle: "Azure Storage Queues"
description: "Detailed documentation on the Azure Storage Queues binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/storagequeues/"
---

## 配置

To setup Azure Storage Queues binding create a component of type `bindings.azure.storagequeues`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


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
  - name: decodeBase64
    value: "false"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段               | 必填 | 绑定支持         | 详情                                                                                                                                                                                   | 示例              |
| ---------------- |:--:| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| storageAccount   | Y  | Input/Output | The Azure Storage account name                                                                                                                                                       | `"account1"`    |
| storageAccessKey | Y  | Input/Output | The Azure Storage access key                                                                                                                                                         | `"accessKey"`   |
| queue            | Y  | Input/Output | The name of the Azure Storage queue                                                                                                                                                  | `"myqueue"`     |
| ttlInseconds     | 否  | 输出           | Parameter to set the default message time to live. If this parameter is omitted, messages will expire after 10 minutes. See [also](#specifying-a-ttl-per-message)                    | `"60"`          |
| decodeBase64     | N  | 输出           | 配置在保存到Blob Storage之前对base64文件内容进行解码。 (保存有二进制内容的文件时)。 `true` is the only allowed positive value. Other positive variations like `"True", "1"` are not acceptable. Defaults to `false` | `true`, `false` |

## 绑定支持

此组件支持 **输入和输出** 绑定接口。

字段名为 `ttlInSeconds`。

- `create`

## 输出绑定支持的操作

可以在队列级别 ( 如上所述) 或消息级别定义生存时间。 在消息级别定义的值会覆盖在队列级别设置的任何值。

若要设置在消息级别生存的时间，请使用 `metadata` 请求正文中的元数据部分。

字段名为 `ttlInSeconds`。

示例:

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

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
