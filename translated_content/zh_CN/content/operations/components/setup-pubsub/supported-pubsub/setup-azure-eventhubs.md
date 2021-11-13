---
type: docs
title: "Azure Events Hub"
linkTitle: "Azure Events Hub"
description: "关于 Azure Event Hubs pubsub 组件的详细文档"
---

## 配置
要安装 Azure Event Hubs pubsub，请创建一个类型为 `pubsub.azure.eventhubs` 的组件。 See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: eventhubs-pubsub
  namespace: default
spec:
  type: pubsub.azure.eventhubs
  version: v1
  metadata:
  - name: connectionString
    value: "Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={EventHub}"
  - name: storageAccountName
    value: "myeventhubstorage"
  - name: storageAccountKey
    value: "112233445566778899"
  - name: storageContainerName
    value: "myeventhubstoragecontainer"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段                   | 必填 | 详情                                                   | Example                                                                                                                                    |
| -------------------- |:--:| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| connectionString     | Y  | Event Hubs的连接地址                                      | `"Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={EventHub}"` |
| storageAccountName   | Y  | 用于EventProcessorHost的存储账户名称                          | `"myeventhubstorage"`                                                                                                                      |
| storageAccountKey    | Y  | 用于EventProcessorHost的存储账户密钥。 可以用`secretKeyRef`来引用密钥。 | `"112233445566778899"`                                                                                                                     |
| storageContainerName | Y  | 存储账户名称的存储容器名称。                                       | `"myeventhubstoragecontainer"`                                                                                                             |


## 创建Azure Event Hub

请按照[此处](https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-create)的说明设置 Azure Event Hubs。 由于本实施例使用Event Processor Host，你还需要一个[Azure Storage Account](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-create?tabs=azure-portal)。 请遵循[此处](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage)的说明来管理存储帐户访问密钥。

请参阅[这里](https://docs.microsoft.com/en-us/azure/event-hubs/authorize-access-shared-access-signature)，了解如何获取 Event Hubs 连接地址。 注意这不是Event Hubs命名空间。

### 为每个订阅者创建消费组

对于每个要订阅事件的Dapr应用，创建一个名称为`dapr id`的Event Hubs消费组。 例如，在 Kubernetes 上运行的 Dapr 应用程序的 `dapr.io/app-id: "myapp"`将需要一个名为`myapp`的Event Hubs消费组。

注意：Dapr将消费组的名称传递给EventHub，因此没有在元数据中提供。

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [发布/订阅构建块]({{< ref pubsub >}})
