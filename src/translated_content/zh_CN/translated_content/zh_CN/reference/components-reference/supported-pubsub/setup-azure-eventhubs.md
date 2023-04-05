---
type: docs
title: "Azure Event Hubs"
linkTitle: "Azure Event Hubs"
description: "关于 Azure Event Hubs pubsub 组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-azure-eventhubs/"
---

## Component format

To setup an Azure Event Hubs pub/sub, create a component of type `pubsub.azure.eventhubs`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pub/sub configuration. Apart from the configuration metadata fields shown below, Azure Event Hubs also supports [Azure Authentication]({{< ref "authenticating-azure.md" >}}) mechanisms.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: eventhubs-pubsub
spec:
  type: pubsub.azure.eventhubs
  version: v1
  metadata:
    # Either connectionString or eventHubNamespace is required
    # Use connectionString when *not* using Azure AD
    - name: connectionString
      value: "Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={EventHub}"
    # Use eventHubNamespace when using Azure AD
    - name: eventHubNamespace
      value: "namespace"
    - name: enableEntityManagement
      value: "false"
    # The following four properties are needed only if enableEntityManagement is set to true
    - name: resourceGroupName
      value: "test-rg"
    - name: subscriptionID
      value: "value of Azure subscription ID"
    - name: partitionCount
      value: "1"
    - name: messageRetentionInDays
      value: "3"
    # Checkpoint store attributes
    - name: storageAccountName
      value: "myeventhubstorage"
    - name: storageAccountKey
      value: "112233445566778899"
    - name: storageContainerName
      value: "myeventhubstoragecontainer"
    # Alternative to passing storageAccountKey
    - name: storageConnectionString
      value: "DefaultEndpointsProtocol=https;AccountName=<account>;AccountKey=<account-key>"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field                     | 必填 | 详情                                                                                                                                                                                                                               | 示例                                                                                                                                                                                                                                                                 |
| ------------------------- |:--:| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `connectionString`        | Y* | Connection string for the Event Hub or the Event Hub namespace.<br>* Mutally exclusive with `eventHubNamespace` field.<br>* Required when not using [Azure AD Authentication]({{< ref "authenticating-azure.md" >}}) | `"Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={EventHub}"` or `"Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key}"` |
| `eventHubNamespace`       | Y* | The Event Hub Namespace name.<br>* Mutally exclusive with `connectionString` field.<br>* Required when using [Azure AD Authentication]({{< ref "authenticating-azure.md" >}})                                        | `"namespace"`                                                                                                                                                                                                                                                      |
| `storageAccountName`      | 是  | Storage account name to use for the checkpoint store.                                                                                                                                                                            | `"myeventhubstorage"`                                                                                                                                                                                                                                              |
| `storageAccountKey`       | 是* | Storage account key for the checkpoint store account.<br>* When using Azure AD, it's possible to omit this if the service principal has access to the storage account too.                                                 | `"112233445566778899"`                                                                                                                                                                                                                                             |
| `storageConnectionString` | Y* | Connection string for the checkpoint store, alternative to specifying `storageAccountKey`                                                                                                                                        | `"DefaultEndpointsProtocol=https;AccountName=myeventhubstorage;AccountKey=<account-key>"`                                                                                                                                                                    |
| `storageContainerName`    | 是  | Storage container name for the storage account name.                                                                                                                                                                             | `"myeventhubstoragecontainer"`                                                                                                                                                                                                                                     |
| `enableEntityManagement`  | 否  | Boolean value to allow management of the EventHub namespace and storage account. Default: `false`                                                                                                                                | `"true", "false"`                                                                                                                                                                                                                                                  |
| `resourceGroupName`       | 否  | Name of the resource group the Event Hub namespace is part of. Required when entity management is enabled                                                                                                                        | `"test-rg"`                                                                                                                                                                                                                                                        |
| `subscriptionID`          | 否  | Azure subscription ID value. Required when entity management is enabled                                                                                                                                                          | `"azure subscription id"`                                                                                                                                                                                                                                          |
| `partitionCount`          | 否  | Number of partitions for the new Event Hub namespace. Used only when entity management is enabled. Default: `"1"`                                                                                                                | `"2"`                                                                                                                                                                                                                                                              |
| `messageRetentionInDays`  | 否  | Number of days to retain messages for in the newly created Event Hub namespace. Used only when entity management is enabled. Default: `"1"`                                                                                      | `"90"`                                                                                                                                                                                                                                                             |

### Azure Active Directory (AAD) 认证

The Azure Event Hubs pub/sub component supports authentication using all Azure Active Directory mechanisms. 关于更多信息和相关组件的元数据字段请根据选择的AAD认证机制，参考[Azure认证文档]({{< ref authenticating-azure.md >}})。

#### 配置示例

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: eventhubs-pubsub
spec:
  type: pubsub.azure.eventhubs
  version: v1
  metadata:
    # Azure Authentication Used
    - name: azureTenantId
      value: "***"
    - name: azureClientId
      value: "***"
    - name: azureClientSecret
      value: "***"
    - name: eventHubNamespace 
      value: "namespace"
    - name: enableEntityManagement
      value: "false"
    # The following four properties are needed only if enableEntityManagement is set to true
    - name: resourceGroupName
      value: "test-rg"
    - name: subscriptionID
      value: "value of Azure subscription ID"
    - name: partitionCount
      value: "1"
    - name: messageRetentionInDays
    # Checkpoint store attributes
    # In this case, we're using Azure AD to access the storage account too
    - name: storageAccountName
      value: "myeventhubstorage"
    - name: storageContainerName
      value: "myeventhubstoragecontainer"
```

## Sending multiple messages

Azure Event Hubs supports sending multiple messages in a single operation. To set the metadata for bulk operations, set the query parameters on the HTTP request or the gRPC metadata as documented [here]({{< ref pubsub_api >}})

| Metadata                   | Default   |
| -------------------------- | --------- |
| `metadata.maxBulkPubBytes` | `1000000` |

## Create an Azure Event Hub

Follow the instructions on the [documentation](https://docs.microsoft.com/azure/event-hubs/event-hubs-create) to set up Azure Event Hubs.

Because this component uses Azure Storage as checkpoint store, you will also need an [Azure Storage Account](https://docs.microsoft.com/azure/storage/common/storage-account-create?tabs=azure-portal). Follow the instructions on the [documentation](https://docs.microsoft.com/azure/storage/common/storage-account-keys-manage) to manage the storage account access keys.

See the [documentation](https://docs.microsoft.com/azure/event-hubs/authorize-access-shared-access-signature) on how to get the Event Hubs connection string (note this is not for the Event Hubs namespace).

### Create consumer groups for each subscriber

For every Dapr app that wants to subscribe to events, create an Event Hubs consumer group with the name of the Dapr app ID. For example, a Dapr app running on Kubernetes with `dapr.io/app-id: "myapp"` will need an Event Hubs consumer group named `myapp`.

Note: Dapr passes the name of the consumer group to the Event Hub, so this is not supplied in the metadata.

## Entity Management

When entity management is enabled in the metadata, as long as the application has the right role and permissions to manipulate the Event Hub namespace, Dapr can automatically create the Event Hub and consumer group for you.

The Evet Hub name is the `topic` field in the incoming request to publish or subscribe to, while the consumer group name is the name of the Dapr app which subscribes to a given Event Hub. For example, a Dapr app running on Kubernetes with name `dapr.io/app-id: "myapp"` requires an Event Hubs consumer group named `myapp`.

Entity management is only possible when using [Azure AD Authentication]({{< ref "authenticating-azure.md" >}}) and not using a connection string.

> Dapr passes the name of the consumer group to the Event Hub, so this is not supplied in the metadata.

## Subscribing to Azure IoT Hub Events

Azure IoT Hub provides an [endpoint that is compatible with Event Hubs](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-messages-read-builtin#read-from-the-built-in-endpoint), so the Azure Event Hubs pubsub component can also be used to subscribe to Azure IoT Hub events.

The device-to-cloud events created by Azure IoT Hub devices will contain additional [IoT Hub System Properties](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-messages-construct#system-properties-of-d2c-iot-hub-messages), and the Azure Event Hubs pubsub component for Dapr will return the following as part of the response metadata:

| System Property Name                   | 路由查询关键字 & 说明                                                                                                                                                                                                                |
| -------------------------------------- |:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `iothub-connection-auth-generation-id` | The **connectionDeviceGenerationId** of the device that sent the message. See [IoT Hub device identity properties](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties). |
| `iothub-connection-auth-method`        | **connectionAuthMethod** 用于验证发送消息的设备。                                                                                                                                                                                       |
| `iothub-connection-device-id`          | 发送消息的设备的 **deviceId**。 See [IoT Hub device identity properties](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties).                                                    |
| `iothub-connection-module-id`          | 发送消息的设备的 **moduleId**。 See [IoT Hub device identity properties](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties).                                                    |
| `iothub-enqueuedtime`                  | RFC3339 格式的 **enqueuedTime** 表示 IoT Hub 已收到设备到云的消息。                                                                                                                                                                         |
| `message-id`                           | 用户可设置的 AMQP **messageId**。                                                                                                                                                                                                  |

For example, the headers of a delivered HTTP subscription message would contain:

```js
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

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})
- [Authentication to Azure]({{< ref "authenticating-azure.md" >}})
