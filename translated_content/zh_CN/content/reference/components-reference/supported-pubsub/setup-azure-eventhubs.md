---
type: docs
title: "Azure Event Hubs"
linkTitle: "Azure Event Hubs"
description: "关于 Azure Event Hubs pubsub 组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-azure-eventhubs/"
---

## 配置
要安装 Azure Event Hubs pubsub，请创建一个类型为 `pubsub.azure.eventhubs` 的组件。 请参阅[本指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}})，了解如何创建和应用 pubsub 配置。 除了下面显示的配置元数据字段外，Azure 事件中心还支持 [Azure 身份验证]({{< ref "authenticating-azure.md" >}}) 机制。

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
  - name: connectionString    # Either connectionString or eventHubNamespace. Should not be used when 
  # Azure Authentication mechanism is used.
    value: "Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={EventHub}"
  - name: eventHubNamespace   # Either connectionString or eventHubNamespace. Should be used when 
  # Azure Authentication mechanism is used.
    value: "namespace"
  - name: enableEntityManagement
    value: "false"
    ## The following four properties are needed only if enableEntityManagement is set to true
  - name: resourceGroupName
    value: "test-rg"
  - name: subscriptionID
    value: "value of Azure subscription ID"
  - name: partitionCount
    value: "1"
  - name: messageRetentionInDays
  ## Subscriber attributes
  - name: storageAccountName
    value: "myeventhubstorage"
  - name: storageAccountKey
    value: "112233445566778899"
  - name: storageContainerName
    value: "myeventhubstoragecontainer"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                     | 必填 | 详情                                                                                                                     | 示例                                                                                                                                                                                                                                                                 |
| ---------------------- |:--:| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| connectionString       | 是  | 事件中心或事件中心命名空间的连接字符串。 与 `eventHubNamespace` 字段互斥。 使用 [Azure Authentication]({{< ref "authenticating-azure.md" >}}) 时不使用 | `"Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={EventHub}"` or `"Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key}"` |
| eventHubNamespace      | 是  | 事件中心命名空间名称。 与 ` connectionString ` 字段互斥。 使用 [Azure Authentication]({{< ref "authenticating-azure.md" >}}) 时使用          | `"namespace"`                                                                                                                                                                                                                                                      |
| storageAccountName     | 是  | 用于EventProcessorHost的存储账户名称                                                                                            | `"myeventhubstorage"`                                                                                                                                                                                                                                              |
| storageAccountKey      | 是  | 用于EventProcessorHost的存储账户密钥。 可以用`secretKeyRef`来引用密钥。                                                                   | `"112233445566778899"`                                                                                                                                                                                                                                             |
| storageContainerName   | 是  | 存储账户名称的存储容器名称。                                                                                                         | `"myeventhubstoragecontainer"`                                                                                                                                                                                                                                     |
| enableEntityManagement | 否  | 允许管理 EventHub 命名空间的布尔值。 默认值：`false`                                                                                    | `"true", "false"`                                                                                                                                                                                                                                                  |
| resourceGroupName      | 否  | 事件中心命名空间所属的资源组的名称。 启用实体管理时需要                                                                                           | `"test-rg"`                                                                                                                                                                                                                                                        |
| subscriptionID         | 否  | Azure 订阅 ID 值。 启用实体管理时需要                                                                                               | `"azure subscription id"`                                                                                                                                                                                                                                          |
| partitionCount         | 否  | 新事件中心的分区数。 仅在启用实体管理时使用。 默认值：`"1"`                                                                                      | `"2"`                                                                                                                                                                                                                                                              |
| messageRetentionInDays | 否  | 在新创建的事件中心中保留消息的天数。 仅在启用实体管理时使用。 默认值：`"1"`                                                                              | `"90"`                                                                                                                                                                                                                                                             |

### Azure Active Directory (AAD) 认证
Azure 事件中心 pubsub 组件支持使用所有 Azure Active Directory 机制进行身份验证。 更多信息和相关组件的元数据字段根据选择的AAD认证机制，参考[Azure认证文档]({{< ref authenticating-azure.md >}})。

## 创建Azure Event Hub

请按照[此处](https://docs.microsoft.com/azure/event-hubs/event-hubs-create)的说明设置 Azure Event Hubs。 由于本实施例使用Event Processor Host，你还需要一个[Azure Storage Account](https://docs.microsoft.com/azure/storage/common/storage-account-create?tabs=azure-portal)。 请遵循[此处](https://docs.microsoft.com/azure/storage/common/storage-account-keys-manage)的说明来管理存储帐户访问密钥。

请参阅[这里](https://docs.microsoft.com/azure/event-hubs/authorize-access-shared-access-signature)，了解如何获取 Event Hubs 连接地址。 注意这不是Event Hubs命名空间。

### 为每个订阅者创建消费组

对于每个要订阅事件的Dapr应用，创建一个名称为`dapr id`的Event Hubs消费组。 例如，在 Kubernetes 上运行的 Dapr 应用程序的 `dapr.io/app-id: "myapp"`将需要一个名为`myapp`的Event Hubs消费组。

注意：Dapr将消费组的名称传递给EventHub，因此没有在元数据中提供。

## 实体管理

在配置中启用实体管理后，只要应用程序具有操作事件中心命名空间的正确角色和权限，就可以即时创建事件中心和消费者组。

Evet Hub 名称是发布或订阅的传入请求中的 `topic` 字段，而消费者组名称是订阅给定 Event Hub 的 `dapr 应用程序` 的名称。 例如，在 Kubernetes 上运行的命名为 `dapr.io/app-id: "myapp"`的 Dapr 应用程序需要一个名为`myapp`的Event Hubs消费组。

只有在使用 [Azure 身份验证]({{< ref "authenticating-azure.md" >}}) 机制时才可以使用实体管理，而不是通过 ` connectionString `。

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
- [Authentication to Azure]({{< ref "authenticating-azure.md" >}})
