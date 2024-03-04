---
type: docs
title: "Azure Service Bus Queues绑定规范"
linkTitle: "Azure Service Bus Queues"
description: "Azure Service Bus Queues 绑定组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/servicebusqueues/"
---

## Component format

To setup Azure Service Bus Queues binding create a component of type `bindings.azure.servicebusqueues`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

### 连接字符串认证

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.azure.servicebusqueues
  version: v1
  metadata:
  - name: connectionString # Required when not using Azure Authentication.
    value: "Endpoint=sb://{ServiceBusNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={ServiceBus}"
  - name: queueName
    value: "queue1"
  # - name: timeoutInSec # Optional
  #   value: "60"
  # - name: handlerTimeoutInSec # Optional
  #   value: "60"
  # - name: disableEntityManagement # Optional
  #   value: "false"
  # - name: maxDeliveryCount # Optional
  #   value: "3"
  # - name: lockDurationInSec # Optional
  #   value: "60"
  # - name: lockRenewalInSec # Optional
  #   value: "20"
  # - name: maxActiveMessages # Optional
  #   value: "10000"
  # - name: maxConcurrentHandlers # Optional
  #   value: "10"
  # - name: defaultMessageTimeToLiveInSec # Optional
  #   value: "10"
  # - name: autoDeleteOnIdleInSec # Optional
  #   value: "3600"
  # - name: minConnectionRecoveryInSec # Optional
  #   value: "2"
  # - name: maxConnectionRecoveryInSec # Optional
  #   value: "300"
  # - name: maxRetriableErrorsPerSec # Optional
  #   value: "10"
  # - name: publishMaxRetries # Optional
  #   value: "5"
  # - name: publishInitialRetryIntervalInMs # Optional
  #   value: "500"
  # - name: direction
  #   value: "input, output"
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field                             | Required | 绑定支持                                                                                                                                                                | 详情                                                                                                                                                                                                                                                                                      | 示例                                       |
| --------------------------------- |:--------:| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `connectionString`                |    是     | 输入/输出                                                                                                                                                               | The Service Bus connection string. Required unless using Microsoft Entra ID authentication.                                                                                                                                                                                             | `"Endpoint=sb://************"`           |
| `queueName`                       |    是     | 输入/输出                                                                                                                                                               | 服务总线队列名称。 队列名称，不区分大小写并且总是强制为小写                                                                                                                                                                                                                                                          | `"queuename"`                            |
| `timeoutInSec`                    |    否     | 输入/输出                                                                                                                                                               | Timeout for all invocations to the Azure Service Bus endpoint, in seconds. *Note that this option impacts network calls and it's unrelated to the TTL applies to messages*. Default: `"60"`                                                                                             | `"60"`                                   |
| `namespaceName`                   |    否     | 输入/输出                                                                                                                                                               | Parameter to set the address of the Service Bus namespace, as a fully-qualified domain name. Required if using Microsoft Entra ID authentication.                                                                                                                                       | `"namespace.servicebus.windows.net"`     |
| `disableEntityManagement`         |    否     | 输入/输出                                                                                                                                                               | When set to true, queues and subscriptions do not get created automatically. 默认值为 `"false"`                                                                                                                                                                                             | `"true"`, `"false"`                      |
| `lockDurationInSec`               |    否     | 输入/输出                                                                                                                                                               | Defines the length in seconds that a message will be locked for before expiring. Used during subscription creation only. Default set by server.                                                                                                                                         | `"30"`                                   |
| `autoDeleteOnIdleInSec`           |    否     | 输入/输出                                                                                                                                                               | Time in seconds to wait before auto deleting idle subscriptions. Used during subscription creation only. Default: `"0"` (disabled)                                                                                                                                                      | `"3600"`                                 |
| `defaultMessageTimeToLiveInSec`   |    否     | 输入/输出                                                                                                                                                               | Default message time to live, in seconds. Used during subscription creation only.                                                                                                                                                                                                       | `"10"`                                   |
| `maxDeliveryCount`                |    否     | 输入/输出                                                                                                                                                               | Defines the number of attempts the server will make to deliver a message. Used during subscription creation only. Default set by server.                                                                                                                                                | `"10"`                                   |
| `minConnectionRecoveryInSec`      |    否     | 输入/输出                                                                                                                                                               | Minimum interval (in seconds) to wait before attempting to reconnect to Azure Service Bus in case of a connection failure. Default: `"2"`                                                                                                                                               | `"5"`                                    |
| `maxConnectionRecoveryInSec`      |    否     | 输入/输出                                                                                                                                                               | Maximum interval (in seconds) to wait before attempting to reconnect to Azure Service Bus in case of a connection failure. After each attempt, the component waits a random number of seconds, increasing every time, between the minimum and the maximum. Default: `"300"` (5 minutes) | `"600"`                                  |
| `maxActiveMessages`               |    否     | Defines the maximum number of messages to be processing or in the buffer at once. This should be at least as big as the maximum concurrent handlers. Default: `"1"` | `"1"`                                                                                                                                                                                                                                                                                   |                                          |
| `handlerTimeoutInSec`             |    否     | Input                                                                                                                                                               | Timeout for invoking the app's handler. Default: `"0"` (no timeout)                                                                                                                                                                                                                     | `"30"`                                   |
| `minConnectionRecoveryInSec`      |    否     | Input                                                                                                                                                               | Minimum interval (in seconds) to wait before attempting to reconnect to Azure Service Bus in case of a connection failure. Default: `"2"`                                                                                                                                               | `"5"`                                    |
| `maxConnectionRecoveryInSec`      |    否     | Input                                                                                                                                                               | Maximum interval (in seconds) to wait before attempting to reconnect to Azure Service Bus in case of a connection failure. After each attempt, the binding waits a random number of seconds, increasing every time, between the minimum and the maximum. Default: `"300"` (5 minutes)   | `"600"`                                  |
| `lockRenewalInSec`                |    否     | Input                                                                                                                                                               | Defines the frequency at which buffered message locks will be renewed. Default: `"20"`.                                                                                                                                                                                                 | `"20"`                                   |
| `maxActiveMessages`               |    否     | Input                                                                                                                                                               | Defines the maximum number of messages to be processing or in the buffer at once. This should be at least as big as the maximum concurrent handlers. Default: `"1"`                                                                                                                     | `"2000"`                                 |
| `maxConcurrentHandlers`           |    否     | Input                                                                                                                                                               | Defines the maximum number of concurrent message handlers; set to `0` for unlimited. Default: `"1"`                                                                                                                                                                                     | `"10"`                                   |
| `maxRetriableErrorsPerSec`        |    否     | Input                                                                                                                                                               | Maximum number of retriable errors that are processed per second. If a message fails to be processed with a retriable error, the component adds a delay before it starts processing another message, to avoid immediately re-processing messages that have failed. Default: `"10"`      | `"10"`                                   |
| `publishMaxRetries`               |    否     | Output                                                                                                                                                              | The max number of retries for when Azure Service Bus responds with "too busy" in order to throttle messages. Defaults: `"5"`                                                                                                                                                            | `"5"`                                    |
| `publishInitialRetryIntervalInMs` |    否     | Output                                                                                                                                                              | Time in milliseconds for the initial exponential backoff when Azure Service Bus throttle messages. Defaults: `"500"`                                                                                                                                                                    | `"500"`                                  |
| `direction`                       |    否     | 输入/输出                                                                                                                                                               | The direction of the binding                                                                                                                                                                                                                                                            | `"input"`, `"output"`, `"input, output"` |

### Microsoft Entra ID authentication

The Azure Service Bus Queues binding component supports authentication using all Microsoft Entra ID mechanisms, including Managed Identities. For further information and the relevant component metadata fields to provide depending on the choice of Microsoft Entra ID authentication mechanism, see the [docs for authenticating to Azure]({{< ref authenticating-azure.md >}}).

#### 配置示例

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
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
  - name: namespaceName
    # Required when using Azure Authentication.
    # Must be a fully-qualified domain name
    value: "servicebusnamespace.servicebus.windows.net"
  - name: queueName
    value: queue1
  - name: ttlInSeconds
    value: 60
```

## 绑定支持

This component supports both **input and output** binding interfaces.

该组件支持如下操作的 **输出绑定** ：

- `create`: publishes a message to the specified queue

## 消息元数据

Azure Service Bus messages extend the Dapr message format with additional contextual metadata. Some metadata fields are set by Azure Service Bus itself (read-only) and others can be set by the client when publishing a message through `Invoke` binding call with `create` operation.

### Sending a message with metadata

To set Azure Service Bus metadata when sending a message, set the query parameters on the HTTP request or the gRPC metadata as documented [here]({{< ref "bindings_api.md" >}}).

- `metadata.MessageId`
- `metadata.CorrelationId`
- `metadata.SessionId`
- `metadata.Label`
- `metadata.ReplyTo`
- `metadata.PartitionKey`
- `metadata.To`
- `metadata.ContentType`
- `metadata.ScheduledEnqueueTimeUtc`
- `metadata.ReplyToSessionId`

{{% alert title="Note" color="primary" %}}
- The `metadata.MessageId` property does not set the `id` property of the cloud event returned by Dapr and should be treated in isolation.
- The `metadata.ScheduledEnqueueTimeUtc` property supports the [RFC1123](https://www.rfc-editor.org/rfc/rfc1123) and [RFC3339](https://www.rfc-editor.org/rfc/rfc3339) timestamp formats.
{{% /alert %}}

### Receiving a message with metadata

When Dapr calls your application, it attaches Azure Service Bus message metadata to the request using either HTTP headers or gRPC metadata. In addition to the [settable metadata listed above](#sending-a-message-with-metadata), you can also access the following read-only message metadata.

- `metadata.DeliveryCount`
- `metadata.LockedUntilUtc`
- `metadata.LockToken`
- `metadata.EnqueuedTimeUtc`
- `metadata.SequenceNumber`

To find out more details on the purpose of any of these metadata properties, please refer to [the official Azure Service Bus documentation](https://docs.microsoft.com/rest/api/servicebus/message-headers-and-properties#message-headers).

{{% alert title="Note" color="primary" %}}
All times are populated by the server and are not adjusted for clock skews.
{{% /alert %}}

## 输出绑定支持的操作

Time to live can be defined on a per-queue level (as illustrated above) or at the message level. The value defined at message level overwrites any value set at the queue level.

To set time to live at message level use the `metadata` section in the request body during the binding invocation: the field name is `ttlInSeconds`.

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

## Schedule a message

A message can be scheduled for delayed processing.

To schedule a message, use the `metadata` section in the request body during the binding invocation: the field name is `ScheduledEnqueueTimeUtc`.

The supported timestamp formats are [RFC1123](https://www.rfc-editor.org/rfc/rfc1123) and [RFC3339](https://www.rfc-editor.org/rfc/rfc3339).

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
          "ScheduledEnqueueTimeUtc": "Tue, 02 Jan 2024 15:04:05 GMT"
        },
        "operation": "create"
      }'
```

{{% /codetab %}}

{{< /tabs >}}

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
