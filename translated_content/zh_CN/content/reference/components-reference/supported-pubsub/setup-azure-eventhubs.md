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

Follow the instructions [here](https://docs.microsoft.com/azure/event-hubs/event-hubs-create) on setting up Azure Event Hubs. Since this implementation uses the Event Processor Host, you will also need an [Azure Storage Account](https://docs.microsoft.com/azure/storage/common/storage-account-create?tabs=azure-portal). Follow the instructions [here](https://docs.microsoft.com/azure/storage/common/storage-account-keys-manage) to manage the storage account access keys.

See [here](https://docs.microsoft.com/azure/event-hubs/authorize-access-shared-access-signature) on how to get the Event Hubs connection string. 注意这不是Event Hubs命名空间。

### 为每个订阅者创建消费组

对于每个要订阅事件的Dapr应用，创建一个名称为`dapr id`的Event Hubs消费组。 例如，在 Kubernetes 上运行的 Dapr 应用程序的 `dapr.io/app-id: "myapp"`将需要一个名为`myapp`的Event Hubs消费组。

注意：Dapr将消费组的名称传递给EventHub，因此没有在元数据中提供。

## Subscribing to Azure IoT Hub Events

Azure IoT Hub provides an [endpoint that is compatible with Event Hubs](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-messages-read-builtin#read-from-the-built-in-endpoint), so the Azure Event Hubs pubsub component can also be used to subscribe to Azure IoT Hub events.

The device-to-cloud events created by Azure IoT Hub devices will contain additional [IoT Hub System Properties](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-messages-construct#system-properties-of-d2c-iot-hub-messages), and the Azure Event Hubs pubsub component for Dapr will return the following as part of the response metadata:

| System Property Name                   | Description & Routing Query Keyword                                                                                                                                     |
| -------------------------------------- |:----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `iothub-connection-auth-generation-id` | 发送消息的设备的 **connectionDeviceGenerationId** 请参阅 [IoT Hub 设备标识属性](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties)。 |
| `iothub-connection-auth-method`        | **connectionAuthMethod** 用于验证发送消息的设备。                                                                                                                                   |
| `iothub-connection-device-id`          | 发送消息的设备的 **deviceId**。 请参阅 [IoT Hub 设备标识属性](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties)。                    |
| `iothub-connection-module-id`          | 发送消息的设备的 **moduleId**。 请参阅 [IoT Hub 设备标识属性](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties)。                    |
| `iothub-enqueuedtime`                  | RFC3339 格式的 **enqueuedTime** 表示 IoT Hub 已收到设备到云的消息。                                                                                                                     |
| `message-id`                           | 用户可设置的 AMQP **messageId**。                                                                                                                                              |

For example, the headers of a delivered HTTP subscription message would contain:

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
