---
type: docs
title: "Azure Event Hubs"
linkTitle: "Azure Event Hubs"
description: "关于 Azure Event Hubs pubsub 组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-azure-eventhubs/"
---

## 配置
要安装 Azure Event Hubs pubsub，请创建一个类型为 `pubsub.azure.eventhubs` 的组件。 请参阅[本指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}})，了解如何创建和应用 pubsub 配置。

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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                   | 必填 | 详情                                                   | 示例                                                                                                                                         |
| -------------------- |:--:| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| connectionString     | Y  | Event Hubs的连接地址                                      | `"Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={EventHub}"` |
| storageAccountName   | Y  | 用于EventProcessorHost的存储账户名称                          | `"myeventhubstorage"`                                                                                                                      |
| storageAccountKey    | Y  | 用于EventProcessorHost的存储账户密钥。 可以用`secretKeyRef`来引用密钥。 | `"112233445566778899"`                                                                                                                     |
| storageContainerName | Y  | 存储账户名称的存储容器名称。                                       | `"myeventhubstoragecontainer"`                                                                                                             |


## 创建Azure Event Hub

请按照[此处](https://docs.microsoft.com/azure/event-hubs/event-hubs-create)的说明设置 Azure Event Hubs。 由于本实施例使用Event Processor Host，你还需要一个[Azure Storage Account](https://docs.microsoft.com/azure/storage/common/storage-account-create?tabs=azure-portal)。 请遵循[此处](https://docs.microsoft.com/azure/storage/common/storage-account-keys-manage)的说明来管理存储帐户访问密钥。

请参阅[这里](https://docs.microsoft.com/azure/event-hubs/authorize-access-shared-access-signature)，了解如何获取 Event Hubs 连接地址。 注意这不是Event Hubs命名空间。

### 为每个订阅者创建消费组

对于每个要订阅事件的Dapr应用，创建一个名称为`dapr id`的Event Hubs消费组。 例如，在 Kubernetes 上运行的 Dapr 应用程序的 `dapr.io/app-id: "myapp"`将需要一个名为`myapp`的Event Hubs消费组。

注意：Dapr将消费组的名称传递给EventHub，因此没有在元数据中提供。

## 订阅 Azure IoT Hub Events

Azure IoT Hub 提供了一个与 [Event Hubs兼容的终结点](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-messages-read-builtin#read-from-the-built-in-endpoint)，因此 Azure Event Hubs pubsub 组件也可用于订阅 Azure IoT Hub 的事件。

由 Azure IoT Hub 设备创建的设备到云事件将包含其他 [IoT Hub System Properties](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-messages-construct#system-properties-of-d2c-iot-hub-messages)，并且 Dapr 的 Azure Event Hubs pubsub 组件将返回以下内容作为响应元数据的一部分：

| 系统属性名称                                 | 路由查询关键字 & 说明                                                                                                                                                            |
| -------------------------------------- |:----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `iothub-connection-auth-generation-id` | 发送消息的设备的 **connectionDeviceGenerationId** 请参阅 [IoT Hub 设备标识属性](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties)。 |
| `iothub-connection-auth-method`        | **connectionAuthMethod** 用于验证发送消息的设备。                                                                                                                                   |
| `iothub-connection-device-id`          | 发送消息的设备的 **deviceId**。 请参阅 [IoT Hub 设备标识属性](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties)。                    |
| `iothub-connection-module-id`          | 发送消息的设备的 **moduleId**。 请参阅 [IoT Hub 设备标识属性](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties)。                    |
| `iothub-enqueuedtime`                  | RFC3339 格式的 **enqueuedTime** 表示 IoT Hub 已收到设备到云的消息。                                                                                                                     |
| `message-id`                           | 用户可设置的 AMQP **messageId**。                                                                                                                                              |

例如，已发送HTTP订阅消息的头部将包含：

```nodejs
{
  'user-agent': 'fasthttp',
  'host': '127.0.0.1:3000',
  'content-type': 'application/json',
  'content-length': '120',
  'iothub-connection-device-id': 'my-test-device',
  'iothub-connection-auth-generation-id': '637618061680407492',
  'iothub-connection-auth-method': '{"scope":"module","type":"sas","issuer":"iothub","acceptingIpFilterRule":null}',
  'iothub-connection-module-id': 'my-test-module-a',
  'iothub-enqueuedtime': '2021-07-13T22:08:09Z',
  'message-id': 'my-custom-message-id',
  'x-opt-sequence-number': '35',
  'x-opt-enqueued-time': '2021-07-13T22:08:09Z',
  'x-opt-offset': '21560',
  'traceparent': '00-4655608164bc48b985b42d39865f3834-ed6cf3697c86e7bd-01'
}
```

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})
