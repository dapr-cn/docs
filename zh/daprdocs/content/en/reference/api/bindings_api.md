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

On startup Dapr sends a `OPTIONS` request to the `metadata.name` endpoint and expects a different status code as `NOT FOUND (404)` if this application wants to subscribe to the binding.

The `metadata` section is an open key/value metadata pair that allows a binding to define connection properties, as well as custom properties unique to the component implementation.

### Examples

For example, here's how a Python application subscribes for events from `Kafka` using a Dapr API compliant platform. Note how the metadata.name value `kafkaevent` in the components matches the POST route name in the Python code.

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

#### Python Code

```python
from flask import Flask
app = Flask(__name__)

@app.route("/kafkaevent", methods=['POST'])
def incoming():
    print("Hello from Kafka!", flush=True)

    return "Kafka Event Processed!"
```

### Binding endpoints

Bindings are discovered from component yaml files. Dapr calls this endpoint on startup to ensure that app can handle this call. If the app doesn't have the endpoint, Dapr ignores it.

#### HTTP Request

```
OPTIONS http://localhost:<appPort>/<name>
```

#### HTTP Response codes

| Code       | Description                                      |
| ---------- | ------------------------------------------------ |
| 404        | Application does not want to bind to the binding |
| all others | Application wants to bind to the binding         |

#### URL Parameters

| Parameter | Description             |
| --------- | ----------------------- |
| appPort   | the application port    |
| name      | the name of the binding |

> Note, all URL parameters are case-sensitive.

### Binding payload

In order to deliver binding inputs, a POST call is made to user code with the name of the binding as the URL path.

#### HTTP Request

```
POST http://localhost:<appPort>/<name>
```

#### HTTP Response codes

| Code | Description                                          |
| ---- | ---------------------------------------------------- |
| 200  | Application processed the input binding successfully |

#### URL Parameters

| Parameter | Description             |
| --------- | ----------------------- |
| appPort   | the application port    |
| name      | the name of the binding |

> Note, all URL parameters are case-sensitive.

#### HTTP Response body (optional)

Optionally, a response body can be used to directly bind input bindings with state stores or output bindings.

**Example:** Dapr stores `stateDataToStore` into a state store named "stateStore". Dapr sends `jsonObject` to the output bindings named "storage" and "queue" in parallel. If `concurrency` is not set, it is sent out sequential (the example below shows these operations are done in parallel)

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
