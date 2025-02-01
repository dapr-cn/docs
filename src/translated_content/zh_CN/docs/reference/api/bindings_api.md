---
type: docs
title: "Bindings API 参考"
linkTitle: "Bindings API"
description: "关于 bindings API 的详细文档"
weight: 500
---

Dapr 为应用程序提供了双向绑定的功能，提供了一种与不同云服务或本地系统交互的统一方法。开发人员可以通过 Dapr API 调用输出绑定，并让 Dapr 运行时通过输入绑定来触发应用程序。

bindings 的示例包括 `Kafka`、`Rabbit MQ`、`Azure Event Hubs`、`AWS SQS`、`GCP Storage` 等。

## Bindings 结构

一个 Dapr Binding 的 yaml 文件结构如下：

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

如果在本地自托管运行，请将此文件放在 `components` 文件夹中，与状态存储和消息队列 yml 配置相邻。

如果在 Kubernetes 上运行，请将组件应用到您的集群中。

> **注意：** 在生产环境中，切勿在 Dapr 组件文件中放置密码或秘密。有关使用 secret 存储安全存储和检索秘密的信息，请参阅 [设置 Secret Store]({{< ref setup-secret-store >}})

### 绑定方向（可选）

在某些情况下，向 Dapr 提供额外的信息以指示绑定组件支持的方向是有帮助的。

指定绑定的 `direction` 可以帮助 Dapr sidecar 避免进入“等待应用程序准备就绪”的状态，这种状态下它会无限期地等待应用程序可用。这解耦了 Dapr sidecar 和应用程序之间的生命周期依赖。

您可以在组件元数据中指定 `direction` 字段。此字段的有效值为：
- `"input"`
- `"output"`
- `"input, output"`

{{% alert title="注意" color="primary" %}}
强烈建议所有绑定都应包含 `direction` 属性。
{{% /alert %}}

以下是一些 `direction` 元数据字段可能有帮助的场景：

- 当一个应用程序（与 sidecar 分离）作为无服务器工作负载运行并缩放到零时，Dapr sidecar 执行的“等待应用程序准备就绪”检查变得毫无意义。

- 如果分离的 Dapr sidecar 缩放到零，并且应用程序在启动 HTTP 服务器之前到达 sidecar，“等待应用程序准备就绪”会导致应用程序和 sidecar 互相等待而陷入死锁。

### 示例

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
  - name: "direction"
    value: "input, output"
```

## 通过输入绑定调用服务代码

希望通过输入绑定来触发应用程序的开发人员可以在 `POST` http 端点上监听，路由名称与 `metadata.name` 相同。

启动时，Dapr 向 `metadata.name` 端点发送 `OPTIONS` 请求，并期望不同的状态码为 `NOT FOUND (404)`，如果此应用程序希望订阅绑定。

`metadata` 部分是一个开放的键/值元数据对，允许绑定定义连接属性，以及组件实现特有的自定义属性。

### 示例

例如，以下是一个 Python 应用程序如何使用符合 Dapr API 的平台订阅来自 `Kafka` 的事件。注意组件中的 metadata.name 值 `kafkaevent` 与 Python 代码中的 POST 路由名称匹配。

#### Kafka 组件

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

### 绑定端点

bindings 是从组件 yaml 文件中发现的。Dapr 在启动时调用此端点以确保应用程序可以处理此调用。如果应用程序没有该端点，Dapr 会忽略它。

#### HTTP 请求

```
OPTIONS http://localhost:<appPort>/<name>
```

#### HTTP 响应代码

代码 | 描述
---- | -----------
404  | 应用程序不想绑定到该绑定
2xx 或 405  | 应用程序想要绑定到该绑定

#### URL 参数

参数 | 描述
--------- | -----------
appPort | 应用程序端口
name | 绑定的名称

> 注意，所有 URL 参数区分大小写。

### 绑定负载

为了传递绑定输入，会向用户代码发出一个以绑定名称为 URL 路径的 POST 调用。

#### HTTP 请求

```
POST http://localhost:<appPort>/<name>
```

#### HTTP 响应代码

代码 | 描述
---- | -----------
200  | 应用程序成功处理了输入绑定

#### URL 参数

参数 | 描述
--------- | -----------
appPort | 应用程序端口
name | 绑定的名称

> 注意，所有 URL 参数区分大小写。

#### HTTP 响应体（可选）

可选地，可以使用响应体直接将输入绑定与状态存储或输出绑定绑定。

**示例：**
Dapr 将 `stateDataToStore` 存储到名为 "stateStore" 的状态存储中。
Dapr 将 `jsonObject` 并行发送到名为 "storage" 和 "queue" 的输出绑定。
如果未设置 `concurrency`，则按顺序发送（下面的示例显示这些操作是并行完成的）

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

此端点允许您调用 Dapr 输出绑定。Dapr bindings 支持各种操作，例如 `create`。

请参阅每个绑定的[不同规范]({{< ref supported-bindings >}})以查看支持的操作列表。

### HTTP 请求

```
POST/PUT http://localhost:<daprPort>/v1.0/bindings/<name>
```

### HTTP 响应代码

代码 | 描述
---- | -----------
200  | 请求成功
204  | 空响应
400  | 请求格式错误
500  | 请求失败

### 负载

bindings 端点接收以下 JSON 负载：

```json
{
  "data": "",
  "metadata": {
    "": ""
  },
  "operation": ""
}
```

> 注意，所有 URL 参数区分大小写。

`data` 字段接受任何 JSON 可序列化的值，并作为要发送到输出绑定的负载。`metadata` 字段是一个键/值对数组，允许您为每次调用设置绑定特定的元数据。`operation` 字段告诉 Dapr 绑定它应该执行哪个操作。

### URL 参数

参数 | 描述
--------- | -----------
daprPort | Dapr 端口
name | 要调用的输出绑定的名称

> 注意，所有 URL 参数区分大小写。

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

### 常见元数据值

有一些常见的元数据属性在多个绑定组件中支持。以下列表展示了它们：

|属性|描述|绑定定义|可用于
|-|-|-|-|
|ttlInSeconds|定义消息的生存时间（以秒为单位）|如果在绑定定义中设置，将导致所有消息具有默认的生存时间。消息 ttl 覆盖绑定定义中的任何值。|RabbitMQ, Azure Service Bus, Azure Storage Queue|
