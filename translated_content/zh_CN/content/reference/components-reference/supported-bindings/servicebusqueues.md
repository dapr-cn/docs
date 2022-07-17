---
type: docs
title: "Azure Service Bus Queues绑定规范"
linkTitle: "Azure Service Bus Queues"
description: "Azure Service Bus Queues 绑定组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/servicebusqueues/"
---

## 配置

要设置Azure服务总线队列绑定需要创建一个`bindings.azure.servicebusqueues`类型的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.servicebusqueues
  version: v1
  metadata:
  - name: connectionString
    value: "Endpoint=sb://************"
  - name: queueName
    value: queue1
  - name: ttlInSeconds
    value: 60
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段               | 必填 | 绑定支持  | 详情                                                                                                                                                 | 示例                             |
| ---------------- |:--:| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| connectionString | 是  | 输入/输出 | 服务总线连接字符串                                                                                                                                          | `"Endpoint=sb://************"` |
| queueName        | 是  | 输入/输出 | 服务总线队列名称。 队列名称，不区分大小写并且总是强制为小写                                                                                                                     | `"queuename"`                  |
| ttlInseconds     | 否  | 输出    | 默认消息 [存活时间](https://docs.microsoft.com/azure/service-bus-messaging/message-expiration)。 如果省略此参数，则消息将在 14 天后过期。 [另见](#specifying-a-ttl-per-message) | `"60"`                         |

### Azure Active Directory (AAD) 认证
Azure 服务总线队列绑定组件支持使用所有 Azure Active Directory 机制进行身份验证。 更多信息和相关组件的元数据字段根据选择的AAD认证机制，参考[Azure认证文档]({{< ref authenticating-azure.md >}})。

## 绑定支持

此组件支持 **输入和输出** 绑定接口。

该组件支持如下操作的 **输出绑定** ：

- `create`

## 输出绑定支持的操作

可以在队列级别 ( 如上所述) 或消息级别定义生存时间。 在消息级别定义的值会覆盖在队列级别设置的任何值。

若要设置在消息级别生存的时间，请使用 `metadata` 请求正文中的元数据部分。

字段名为 `ttlInSeconds`。

{{< tabs "Linux">}}

{{% codetab %}}

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myServiceBusQueue \
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
{{% /codetab %}}

{{< /tabs >}}

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
