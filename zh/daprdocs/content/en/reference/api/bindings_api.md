---
type: docs
title: "Bindings API 引用"
linkTitle: "Bindings API"
description: "关于 Bindings API 的详细文档"
weight: 400
---

Dapr 为应用程序提供双向绑定功能，并采用一致的方法来与不同的云/ 本地服务或系统进行交互。 开发者可以使用 Dapr API 调用输出绑定，并让 Dapr 运行时触发具有输入绑定的应用程序。

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
  metadata:
  - name: <NAME>
    value: <VALUE>
```

`metadata.name` 是绑定的名称。

如果在本地 self hosted 运行，请将此文件放在您的 state store 和消息队列 yml 配置旁边的 `components` 文件夹中。

如果在 kubernetes 上运行，那么应该将该组件应用于集群。

> **注意：** 在生产环境中，永远不会在 Dapr component 文件中放置密码或密钥。 有关使用 secret stores 和检索密钥的信息，请参阅 [设置 secret stores ]({{< ref setup-secret-store >}})

## 通过输入绑定调用服务代码

想要使用输入绑定触发应用的开发人员可以在 `POST` http 终结点上侦听以接收请求。路由名称与 `metadata.name`相同。

如果应用程序要订阅绑定，在启动 Dapr 时，将会对应用程序的所有已定义输入绑定发送 `OPTIONS` 请求，并期望 `NOT FOUND (404)` 以外的状态码。

`metadata` 部分是开放式键/值元数据对，它允许绑定定义连接属性以及组件实现独有的定制属性。

### 示例

例如，以下是 Python 应用程序如何使用 Dapr API 兼容平台从 `Kafka` 预订事件。 请注意，组件中的 metadata.name 值 `kafkaevent` 如何与 Python 代码中的 POST 路径名相匹配。

#### Kafka Component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafkaevent
  namespace: default
spec:
  type: bindings.kafka
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

Dapr 将从 component Yaml 文件中发现 Bindings。 Dapr 在启动时调用此端点，以确保应用程序可以处理此调用。 如果应用程序没有该终结点，那么 Dapr 将忽略。

#### HTTP 请求

```
OPTIONS http://localhost:<appPort>/<name>
```

#### HTTP 响应码

| 代码  | 描述                  |
| --- | ------------------- |
| 404 | 应用程序不希望绑定到 Bindings |
| 其它  | 应用程序想要绑定到 Bindings  |

#### URL 参数

| 参数      | 描述           |
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

| 代码  | 描述            |
| --- | ------------- |
| 200 | 应用程序已成功处理输入绑定 |

#### URL 参数

| 参数      | 描述           |
| ------- | ------------ |
| appPort | 应用程序端口       |
| name    | bindings 的名称 |

> 注意：所有的 URL 参数都是大小写敏感的。

#### HTTP 响应主体 (可选)

可选地，响应正文可用于直接绑定具有 state stores 或输出 Bindings 的输入绑定。

**示例:** Dapr 将 `stateDataToStore` 存储到名为 "stateStore"的状态存储中。 Dapr sends `jsonObject` to the output bindings named "storage" and "queue" in parallel. If `concurrency` is not set, it is sent out sequential (the example below shows these operations are done in parallel)

```json
{
    "storeName": "stateStore",
    "state": stateDataToStore,

    "to": ['storage', 'queue'],
    "concurrency": "parallel",
    "data": jsonObject,
}
```

## Invoking Output Bindings

This endpoint lets you invoke a Dapr output binding. Dapr bindings support various operations, such as `create`.

See the [different specs]({{< ref supported-bindings >}}) on each binding to see the list of supported operations.

### HTTP Request

```
POST/PUT http://localhost:<daprPort>/v1.0/bindings/<name>
```

### HTTP Response codes

| Code | Description        |
| ---- | ------------------ |
| 200  | Request successful |
| 500  | Request failed     |

### Payload

The bindings endpoint receives the following JSON payload:

```json
{
  "data": "",
  "metadata": {
    "": ""
  },
  "operation": ""
}
```

> Note, all URL parameters are case-sensitive.

The `data` field takes any JSON serializable value and acts as the payload to be sent to the output binding. The `metadata` field is an array of key/value pairs and allows you to set binding specific metadata for each call. The `operation` field tells the Dapr binding which operation it should perform.

### URL Parameters

| Parameter | Description                              |
| --------- | ---------------------------------------- |
| daprPort  | the Dapr port                            |
| name      | the name of the output binding to invoke |

> Note, all URL parameters are case-sensitive.

### Examples

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

### Common metadata values

There are common metadata properties which are support across multiple binding components. The list below illustrates them:

| Property     | Description                                         | Binding definition                                                                                                                                      | Available in                                     |
| ------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| ttlInSeconds | Defines the time to live in seconds for the message | If set in the binding definition will cause all messages to have a default time to live. The message ttl overrides any value in the binding definition. | RabbitMQ, Azure Service Bus, Azure Storage Queue |
