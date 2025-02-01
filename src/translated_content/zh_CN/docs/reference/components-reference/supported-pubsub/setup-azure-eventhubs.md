---
type: docs
title: "Azure Event Hubs"
linkTitle: "Azure Event Hubs"
description: "Azure Event Hubs pubsub 组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-azure-eventhubs/"
---

## 组件格式

要配置 Azure Event Hubs 的发布/订阅功能，请创建一个类型为 `pubsub.azure.eventhubs` 的组件。有关 ConsumerID 自动生成的详细信息，请参阅 [pub/sub broker 组件文件]({{< ref setup-pubsub.md >}})。要了解如何创建和应用 pub/sub 配置，请阅读 [发布和订阅指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}})。

除了下文列出的配置元数据字段，Azure Event Hubs 还支持 [Azure 身份验证]({{< ref "authenticating-azure.md" >}}) 机制。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: eventhubs-pubsub
spec:
  type: pubsub.azure.eventhubs
  version: v1
  metadata:
    # connectionString 和 eventHubNamespace 必须二选一
    # 不使用 Microsoft Entra ID 时使用 connectionString
    - name: connectionString
      value: "Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={EventHub}"
    # 使用 Microsoft Entra ID 时使用 eventHubNamespace
    - name: eventHubNamespace
      value: "namespace"
    - name: consumerID # 可选。如果未提供，运行时将使用 Dapr 应用程序 ID (`appID`)。
      value: "channel1"
    - name: enableEntityManagement
      value: "false"
    - name: enableInOrderMessageDelivery
      value: "false"
    # 仅当 enableEntityManagement 设置为 true 时才需要以下四个属性
    - name: resourceGroupName
      value: "test-rg"
    - name: subscriptionID
      value: "Azure 订阅 ID 的值"
    - name: partitionCount
      value: "1"
    - name: messageRetentionInDays
      value: "3"
    # 检查点存储属性
    - name: storageAccountName
      value: "myeventhubstorage"
    - name: storageAccountKey
      value: "112233445566778899"
    - name: storageContainerName
      value: "myeventhubstoragecontainer"
    # 传递 storageAccountKey 的替代方法
    - name: storageConnectionString
      value: "DefaultEndpointsProtocol=https;AccountName=<account>;AccountKey=<account-key>"
```

{{% alert title="注意" color="warning" %}}
上面的示例使用明文字符串作为密钥。建议使用密钥存储来保护密钥，具体方法请参阅[这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| `connectionString`    | 是*  | Event Hub 或 Event Hub 命名空间的连接字符串。<br>* 与 `eventHubNamespace` 字段互斥。<br>* 不使用 [Microsoft Entra ID 身份验证]({{< ref "authenticating-azure.md" >}}) 时必需 | `"Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={EventHub}"` 或 `"Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key}"`
| `eventHubNamespace` | 是* | Event Hub 命名空间名称。<br>* 与 `connectionString` 字段互斥。<br>* 使用 [Microsoft Entra ID 身份验证]({{< ref "authenticating-azure.md" >}}) 时必需 | `"namespace"` 
| `consumerID`       | 否 | 消费者 ID（消费者标签）将一个或多个消费者组织成一个组。具有相同消费者 ID 的消费者作为一个虚拟消费者工作；例如，消息仅由组中的一个消费者处理一次。如果未提供 `consumerID`，Dapr 运行时将其设置为 Dapr 应用程序 ID (`appID`) 值。 | 可以设置为字符串值（如上例中的 `"channel1"`）或字符串格式值（如 `"{podName}"` 等）。[查看可以在组件元数据中使用的所有模板标签。]({{< ref "component-schema.md#templated-metadata-values" >}})
| `enableEntityManagement` | 否 | 布尔值，允许管理 EventHub 命名空间和存储帐户。默认值：`false` | `"true", "false"`
| `enableInOrderMessageDelivery` | 否 | 布尔值，允许消息按发布顺序传递。这假设在发布或发布时设置了 `partitionKey` 以确保跨分区的顺序。默认值：`false` | `"true"`, `"false"`
| `storageAccountName`  | 是  | 用于检查点存储的存储帐户名称。 |`"myeventhubstorage"`
| `storageAccountKey`   | 是*  | 检查点存储帐户的存储帐户密钥。<br>* 使用 Microsoft Entra ID 时，如果服务主体也有权访问存储帐户，则可以省略此项。 | `"112233445566778899"`
| `storageConnectionString`   | 是*  | 检查点存储的连接字符串，指定 `storageAccountKey` 的替代方法 | `"DefaultEndpointsProtocol=https;AccountName=myeventhubstorage;AccountKey=<account-key>"`
| `storageContainerName` | 是 | 存储帐户名称的存储容器名称。  | `"myeventhubstoragecontainer"`
| `resourceGroupName` | 否 | Event Hub 命名空间所属的资源组名称。启用实体管理时必需 | `"test-rg"`
| `subscriptionID` | 否 | Azure 订阅 ID 值。启用实体管理时必需 | `"azure subscription id"`
| `partitionCount` | 否 | 新 Event Hub 命名空间的分区数。仅在启用实体管理时使用。默认值：`"1"` | `"2"`
| `messageRetentionInDays` | 否 | 在新创建的 Event Hub 命名空间中保留消息的天数。仅在启用实体管理时使用。默认值：`"1"` | `"90"`

### Microsoft Entra ID 身份验证

Azure Event Hubs pub/sub 组件支持使用所有 Microsoft Entra ID 机制进行身份验证。有关更多信息以及根据选择的 Microsoft Entra ID 身份验证机制提供的相关组件元数据字段，请参阅 [Azure 身份验证文档]({{< ref authenticating-azure.md >}})。

#### 示例配置

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: eventhubs-pubsub
spec:
  type: pubsub.azure.eventhubs
  version: v1
  metadata:
    # 使用 Azure 身份验证
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
    # 仅当 enableEntityManagement 设置为 true 时才需要以下四个属性
    - name: resourceGroupName
      value: "test-rg"
    - name: subscriptionID
      value: "Azure 订阅 ID 的值"
    - name: partitionCount
      value: "1"
    - name: messageRetentionInDays
    # 检查点存储属性
    # 在这种情况下，我们也使用 Microsoft Entra ID 访问存储帐户
    - name: storageAccountName
      value: "myeventhubstorage"
    - name: storageContainerName
      value: "myeventhubstoragecontainer"
```

## 发送和接收多条消息

Azure Eventhubs 支持使用批量 pub/sub API 在单个操作中发送和接收多条消息。

### 配置批量发布

要设置批量发布操作的元数据，请在 HTTP 请求或 gRPC 元数据上设置查询参数，[如 API 参考中所述]({{< ref pubsub_api >}})。

| 元数据 | 默认值 |
|----------|---------|
| `metadata.maxBulkPubBytes` | `1000000` |

### 配置批量订阅

订阅主题时，可以配置 `bulkSubscribe` 选项。请参阅 [批量订阅消息]({{< ref "pubsub-bulk#subscribing-messages-in-bulk" >}}) 了解更多详细信息，并了解 [批量订阅 API]({{< ref pubsub-bulk.md >}})。

| 配置 | 默认值 |
|---------------|---------|
| `maxMessagesCount` | `100` |
| `maxAwaitDurationMs` | `10000` |

## 配置检查点频率

订阅主题时，可以通过 [在 HTTP 或 gRPC 订阅请求中设置元数据]({{< ref "pubsub_api.md#http-request-2" >}}) 来配置分区中的检查点频率。此元数据允许在分区事件序列中配置的事件数量后进行检查点。通过将频率设置为 `0` 来禁用检查点。

[了解更多关于检查点的信息](https://learn.microsoft.com/azure/event-hubs/event-hubs-features#checkpointing)。

| 元数据 | 默认值 |
| -------- | ------- |
| `metadata.checkPointFrequencyPerPartition` | `1` |

以下示例显示了一个使用 `checkPointFrequencyPerPartition` 元数据的 [声明性订阅]({{< ref "subscription-methods.md#declarative-subscriptions" >}}) 示例订阅文件。同样，您也可以在 [编程订阅]({{< ref "subscription-methods.md#programmatic-subscriptions" >}}) 中传递元数据。

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: order-pub-sub
spec:
  topic: orders
  routes: 
    default: /checkout
  pubsubname: order-pub-sub
  metadata:
    checkPointFrequencyPerPartition: 1
scopes:
- orderprocessing
- checkout
```

{{% alert title="注意" color="primary" %}}
使用 `BulkSubscribe` 订阅主题时，您可以配置检查点在指定的 _批次_ 数量后进行，而不是事件，其中 _批次_ 是指在单个请求中接收到的事件集合。
{{% /alert %}}

## 创建 Azure Event Hub

按照 [文档](https://docs.microsoft.com/azure/event-hubs/event-hubs-create) 中的说明设置 Azure Event Hubs。

由于此组件使用 Azure 存储作为检查点存储，您还需要一个 [Azure 存储帐户](https://docs.microsoft.com/azure/storage/common/storage-account-create?tabs=azure-portal)。按照 [文档](https://docs.microsoft.com/azure/storage/common/storage-account-keys-manage) 中的说明管理存储帐户访问密钥。

请参阅 [文档](https://docs.microsoft.com/azure/event-hubs/authorize-access-shared-access-signature) 了解如何获取 Event Hubs 连接字符串（注意这不是 Event Hubs 命名空间的连接字符串）。

### 为每个订阅者创建消费者组

对于每个想要订阅事件的 Dapr 应用程序，创建一个以 Dapr 应用程序 ID 命名的 Event Hubs 消费者组。例如，在 Kubernetes 上运行的 Dapr 应用程序，其 `dapr.io/app-id: "myapp"` 将需要一个名为 `myapp` 的 Event Hubs 消费者组。

注意：Dapr 将消费者组的名称传递给 Event Hub，因此这不在元数据中提供。

## 实体管理

当在元数据中启用实体管理时，只要应用程序具有操作 Event Hub 命名空间的正确角色和权限，Dapr 就可以自动为您创建 Event Hub 和消费者组。

Event Hub 名称是发布或订阅请求中的 `topic` 字段，而消费者组名称是订阅给定 Event Hub 的 Dapr 应用程序的名称。例如，在 Kubernetes 上运行的 Dapr 应用程序，其名称为 `dapr.io/app-id: "myapp"` 需要一个名为 `myapp` 的 Event Hubs 消费者组。

实体管理仅在使用 [Microsoft Entra ID 身份验证]({{< ref "authenticating-azure.md" >}}) 且不使用连接字符串时才可能。

> Dapr 将消费者组的名称传递给 Event Hub，因此这不在元数据中提供。

## 订阅 Azure IoT Hub 事件

Azure IoT Hub 提供了一个 [与 Event Hubs 兼容的端点](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-messages-read-builtin#read-from-the-built-in-endpoint)，因此 Azure Event Hubs pubsub 组件也可以用于订阅 Azure IoT Hub 事件。

由 Azure IoT Hub 设备创建的设备到云事件将包含额外的 [IoT Hub 系统属性](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-messages-construct#system-properties-of-d2c-iot-hub-messages)，Dapr 的 Azure Event Hubs pubsub 组件将在响应元数据中返回以下内容：

| 系统属性名称 | 描述和路由查询关键字 |
|----------------------|:------------------------------------|
| `iothub-connection-auth-generation-id` | 发送消息的设备的 **connectionDeviceGenerationId**。请参阅 [IoT Hub 设备身份属性](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties)。 |
| `iothub-connection-auth-method` | 发送消息的设备使用的 **connectionAuthMethod**。 |
| `iothub-connection-device-id` | 发送消息的设备的 **deviceId**。请参阅 [IoT Hub 设备身份属性](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties)。 |
| `iothub-connection-module-id` | 发送消息的设备的 **moduleId**。请参阅 [IoT Hub 设备身份属性](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties)。 |
| `iothub-enqueuedtime` | 设备到云消息被 IoT Hub 接收的 **enqueuedTime**，格式为 RFC3339。 |
| `message-id` | 用户可设置的 AMQP **messageId**。 |

例如，传递的 HTTP 订阅消息的头将包含：

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

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) 了解配置 pub/sub 组件的说明
- [Pub/Sub 构建块]({{< ref pubsub >}})
- [Azure 身份验证]({{< ref "authenticating-azure.md" >}})