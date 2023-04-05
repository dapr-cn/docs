---
type: docs
title: "Bindings API 引用"
linkTitle: "绑定 API"
description: "关于 Bindings API 的详细文档"
weight: 400
---

Dapr provides bi-directional binding capabilities for applications and a consistent approach to interacting with different cloud/on-premise services or systems. Developers can invoke output bindings using the Dapr API, and have the Dapr runtime trigger an application with input bindings.

绑定的示例包括 `Kafka`， `Rabbit MQ`， `Azure Event Hubs`， `AWS SQS`和 `GCP Storage`。

## Bindings Structure

Dapr Bingding yaml 文件具有以下结构:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.<TYPE>
  version: v1
  metadata:
  - name: <NAME>
    value: <VALUE>
```

`metadata.name` 是绑定的名称。

如果在本地 self hosted 运行，请将此文件放在您的 state store 和消息队列 yml 配置旁边的 `components` 文件夹中。

如果在 kubernetes 上运行，那么应该将该组件应用于集群。

> **Note:** In production never place passwords or secrets within Dapr component files. For information on securely storing and retrieving secrets using secret stores refer to [Setup Secret Store]({{< ref setup-secret-store >}})

## 通过输入绑定调用服务代码

想要使用输入绑定触发应用的开发人员可以在 `POST` http 端点上监听以接收请求。路由名称与 `metadata.name`相同。

如果应用程序要订阅绑定，在启动 Dapr 时，将会对应用程序的所有已定义输入绑定发送 `OPTIONS` 请求，并期望 `NOT FOUND (404)` 以外的状态码。

`metadata` 部分是开放式键/值元数据对，它允许绑定定义连接属性以及组件实现独有的定制属性。

### Examples

例如，以下是 Python 应用程序如何使用 Dapr API 兼容平台从 `Kafka` 订阅事件。 请注意组件中的 metadata.name 值 `kafkaevent` 如何与 Python 代码中的 POST 路由名称匹配。

#### Kafka Component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafkaevent
spec:
  type: bindings.kafka
  version: v1
  metadata:
  - name: brokers
    value: "http://localhost:5050"
  - name: topics
    value: "someTopic"
  - name: publishTopic
    value: "someTopic2"
  - name: consumerGroup
    value: "group1"
```

#### Python 代码

```python
from flask import Flask
app = Flask(__name__)

@app.route("/kafkaevent", methods=['POST'])
def incoming():
    print("Hello from Kafka!", flush=True)

    return "Kafka Event Processed!"
```

### Binding 端点

Dapr 将从 component yaml 文件中发现 Bindings。 Dapr 在启动时调用此端点，以确保应用可以处理此调用。 如果应用程序没有该终结点，那么 Dapr 将忽略。

#### HTTP 请求

```
OPTIONS http://localhost:<appPort>/<name>
```

#### HTTP 响应码

| Code       | 说明                                               |
| ---------- | ------------------------------------------------ |
| 404        | Application does not want to bind to the binding |
| 2xx or 405 | Application wants to bind to the binding         |

#### URL 参数

| Parameter | 说明                   |
| --------- | -------------------- |
| appPort   | the application port |
| name      | bindings 的名称         |

> 注意：所有的 URL 参数都是大小写敏感的。

### Binding 有效负载

为了提供绑定的输入，将使用 POST 调用到用户代码，并将绑定的名称作为 URL 路径。

#### HTTP 请求

```
POST http://localhost:<appPort>/<name>
```

#### HTTP 响应码

| Code | 说明            |
| ---- | ------------- |
| 200  | 应用程序已成功处理输入绑定 |

#### URL 参数

| Parameter | 说明                   |
| --------- | -------------------- |
| appPort   | the application port |
| name      | bindings 的名称         |

> 注意：所有的 URL 参数都是大小写敏感的。

#### HTTP 响应主体 (可选)

可选地，响应正文可用于直接绑定具有 state stores 或输出 Bindings 的输入绑定。

**示例：** Dapr 将 `stateDataToStore` 存储到名为"stateStore"的状态存储中。 Dapr 并行地将 `jsonObject` 发送到名为 "storage" 和 " queue" 的输出绑定。 如果未设置 `concurrency` ，那么将顺序发出 ( 以下示例显示这些操作并行执行)

```json
{
    "storeName": "stateStore",
    "state": stateDataToStore,

    "to": ['storage', 'queue'],
    "concurrency": "parallel",
    "data": jsonObject,
}
```

## 调用输出绑定

此端点允许您调用 Dapr 输出绑定。 Dapr 绑定支持各种操作，例如 `create`。

请参阅每个绑定 [不同的规范]({{< ref supported-bindings >}}) ，以查看支持的操作列表。

### HTTP 请求

```
POST/PUT http://localhost:<daprPort>/v1.0/bindings/<name>
```

### HTTP 响应码

| Code | 说明                 |
| ---- | ------------------ |
| 200  | Request successful |
| 204  | 空响应                |
| 400  | 格式不正确的请求           |
| 500  | 请求失败               |

### Payload

绑定端点接收以下JSON payload ：

```json
{
  "data": "",
  "metadata": {
    "": ""
  },
  "operation": ""
}
```

> 注意：所有的 URL 参数都是大小写敏感的。

`data` 字段采用任何 JSON 可序列化值，并充当要发送到输出绑定的有效负载。 `metadata` 字段是键/值对的数组，允许您为每个调用设置绑定特定元数据。 `operation` 字段告诉 Dapr 绑定它应该执行的操作。

### URL 参数

| Parameter | 说明                      |
| --------- | ----------------------- |
| daprPort  | the Dapr port           |
| name      | 要调用 output binding 的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

### 示例

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myKafka \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        },
        "metadata": {
          "key": "redis-key-1"
        },
        "operation": "create"
      }'
```

### 通用元数据值

一些常见的元数据属性支持跨多个绑定组件。 具体清单如下：

| Property     | 说明                 | 绑定定义                                             | 有效范围                                             |
| ------------ | ------------------ | ------------------------------------------------ | ------------------------------------------------ |
| ttlInSeconds | 定义消息的生存时间 ( 以秒为单位) | 如果在绑定定义中设置，将导致所有消息都有默认的生存时间。 消息 ttl 覆盖绑定定义中的任何值。 | RabbitMQ, Azure Service Bus, Azure Storage Queue |
