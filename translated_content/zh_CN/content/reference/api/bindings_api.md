---
type: docs
title: "Bindings API 引用"
linkTitle: "绑定 API"
description: "关于 Bindings API 的详细文档"
weight: 400
---

Dapr provides bi-directional binding capabilities for applications and a consistent approach to interacting with different cloud/on-premise services or systems. Developers can invoke output bindings using the Dapr API, and have the Dapr runtime trigger an application with input bindings.

绑定的示例包括 `Kafka`， `Rabbit MQ`， `Azure Event Hubs`， `AWS SQS`和 `GCP Storage`。

## Bindings 结构

Dapr 绑定 yaml 文件具有以下结构:

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

想要使用输入绑定触发应用的开发人员可以在 `POST` http 终结点上侦听以接收请求。路由名称与 `metadata.name`相同。

如果应用程序要订阅绑定，在启动 Dapr 时，将会对应用程序的所有已定义输入绑定发送 `OPTIONS` 请求，并期望 `NOT FOUND (404)` 以外的状态码。

`metadata` 部分是开放式键/值元数据对，它允许绑定定义连接属性以及组件实现独有的定制属性。

### 示例

例如，以下是 Python 应用程序如何使用 Dapr API 兼容平台从 `Kafka` 预订事件。 Note how the metadata.name value `kafkaevent` in the components matches the POST route name in the Python code.

#### Kafka Component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafkaevent
  namespace: default
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

### Binding 终结点

Dapr 将从 component Yaml 文件中发现 Bindings。 Dapr calls this endpoint on startup to ensure that app can handle this call. 如果应用程序没有该终结点，那么 Dapr 将忽略。

#### HTTP 请求

```
OPTIONS http://localhost:<appPort>/<name>
```

#### HTTP 响应码

| 代码         | 说明                  |
| ---------- | ------------------- |
| 404        | 应用程序不希望绑定到 Bindings |
| 2xx or 405 | 应用程序想要绑定到 Bindings  |

#### URL 参数

| 参数      | 说明           |
| ------- | ------------ |
| appPort | 应用程序端口       |
| name    | bindings 的名称 |

> 注意：所有的 URL 参数都是大小写敏感的。

### Binding payload

为了提供绑定的输入，将使用 POST 调用到用户代码，并将绑定的名称作为URL路径。

#### HTTP 请求

```
POST http://localhost:<appPort>/<name>
```

#### HTTP 响应码

| 代码  | 说明            |
| --- | ------------- |
| 200 | 应用程序已成功处理输入绑定 |

#### URL 参数

| 参数      | 说明           |
| ------- | ------------ |
| appPort | 应用程序端口       |
| name    | bindings 的名称 |

> 注意：所有的 URL 参数都是大小写敏感的。

#### HTTP 响应主体 (可选)

可选地，响应正文可用于直接绑定具有 state stores 或输出 Bindings 的输入绑定。

**Example:** Dapr stores `stateDataToStore` into a state store named "stateStore". Dapr 将 `jsonObject` 发送到名为 "storage" 和 " queue" 的输出绑定。 如果未设置 `concurrency` ，那么将顺序发出 ( 以下示例显示这些操作并行执行)

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

此端点允许您调用一个 Dapr 输出绑定。 Dapr bindings support various operations, such as `create`.

See the [different specs]({{< ref supported-bindings >}}) on each binding to see the list of supported operations.

### HTTP 请求

```
POST/PUT http://localhost:<daprPort>/v1.0/bindings/<name>
```

### HTTP 响应码

| 代码  | 说明                |
| --- | ----------------- |
| 200 | 请求成功              |
| 204 | Empty Response    |
| 400 | Malformed request |
| 500 | 请求失败              |

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

The `data` field takes any JSON serializable value and acts as the payload to be sent to the output binding. `metadata` 字段是键/值对的数组，允许您为每个调用设置绑定特定元数据。 `operation` 字段告诉 Dapr 绑定它应该执行的操作。

### URL 参数

| 参数       | 说明                      |
| -------- | ----------------------- |
| daprPort | dapr 端口。                |
| name     | 要调用 output binding 的名称。 |

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

There are common metadata properties which are support across multiple binding components. 具体清单如下：

| 属性           | 说明                 | 绑定定义                                                                                                         | 有效范围                                             |
| ------------ | ------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| ttlInseconds | 定义消息的生存时间 ( 以秒为单位) | If set in the binding definition will cause all messages to have a default time to live. 消息 ttl 覆盖绑定定义中的任何值。 | RabbitMQ, Azure Service Bus, Azure Storage Queue |
