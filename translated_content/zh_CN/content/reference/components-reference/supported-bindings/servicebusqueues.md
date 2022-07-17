---
type: docs
title: "Azure Service Bus Queues binding spec"
linkTitle: "Azure Service Bus Queues"
description: "Detailed documentation on the Azure Service Bus Queues binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/servicebusqueues/"
---

## 配置

To setup Azure Service Bus Queues binding create a component of type `bindings.azure.servicebusqueues`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。

### Connection String Authentication

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
  - name: connectionString # Required when not using Azure Authentication.
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

| 字段               | 必填 | 绑定支持         | 详情                                                                                                                                                                                                                                          | 示例                             |
| ---------------- |:--:| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| connectionString | Y  | Input/Output | The Service Bus connection string                                                                                                                                                                                                           | `"Endpoint=sb://************"` |
| queueName        | Y  | Input/Output | The Service Bus queue name. Queue names are case-insensitive and will always be forced to lowercase.                                                                                                                                        | `"queuename"`                  |
| ttlInseconds     | N  | 输出           | Parameter to set the default message [time to live](https://docs.microsoft.com/azure/service-bus-messaging/message-expiration). If this parameter is omitted, messages will expire after 14 days. See [also](#specifying-a-ttl-per-message) | `"60"`                         |
| namespaceName    | N  | Input/Output | Parameter to set the name of the Service Bus namespace. Required if using AAD authentication.                                                                                                                                               | `"namespace"`                  |

### Azure Active Directory (AAD) 认证
Azure 服务总线队列绑定组件支持使用所有 Azure Active Directory 机制进行身份验证。 更多信息和相关组件的元数据字段根据选择的AAD认证机制，参考[Azure认证文档]({{< ref authenticating-azure.md >}})。

#### Example Configuration
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
  - name: azureTenantId
    value: "***"
  - name: azureClientId
    value: "***"
  - name: azureClientSecret
    value: "***"
  - name: namespaceName # Required when using Azure Authentication.
    value: "<SERVICEBUS_NAMESPACE>"
  - name: queueName
    value: queue1
  - name: ttlInSeconds
    value: 60
```

## 绑定支持

此组件支持 **输入和输出** 绑定接口。

字段名为 `ttlInSeconds`。

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
