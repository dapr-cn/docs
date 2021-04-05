---
type: docs
title: "Supported pub/sub brokers"
linkTitle: "Supported pub/sub brokers"
weight: 50000
description: Dapr支持的发布/订阅消息代理
no_list: true
---

表格标题：

> `Status`: [Component certification]({{X31X}}) status
  - [Alpha]({{X20X}})
  - [Beta]({{X22X}})
  - [GA]({{X24X}}) > `Since`: defines from which Dapr Runtime version, the component is in the current status

> `组件版本`：代表组件的版本
### 通用

| 名称                                                    | 状态    | 组件版本 | 自从  |
| ----------------------------------------------------- | ----- | ---- | --- |
| [Apache Kafka]({{< ref setup-apache-kafka.md >}})     | Beta  | v1   | 1.0 |
| [Hazelcast]({{< ref setup-hazelcast.md >}})           | Alpha | v1   | 1.0 |
| [MQTT]({{< ref setup-mqtt.md >}})                     | Alpha | v1   | 1.0 |
| [NATS Streaming]({{< ref setup-nats-streaming.md >}}) | Beta  | v1   | 1.0 |
| [Pulsar]({{< ref setup-pulsar.md >}})                 | Alpha | v1   | 1.0 |
| [RabbitMQ]({{< ref setup-rabbitmq.md >}})             | Alpha | v1   | 1.0 |
| [Redis Streams]({{< ref setup-redis-pubsub.md >}})    | GA    | v1   | 1.0 |

### Amazon Web Services (AWS)

| 名称                                             | 状态    | 组件版本 | 自从  |
| ---------------------------------------------- | ----- | ---- | --- |
| [AWS SNS/SQS]({{< ref setup-aws-snssqs.md >}}) | Alpha | v1   | 1.0 |

### Google Cloud Platform (GCP)

| 名称                                             | 状态    | 组件版本 | 自从  |
| ---------------------------------------------- | ----- | ---- | --- |
| [GCP Pub/Sub]({{< ref setup-gcp-pubsub.md >}}) | Alpha | v1   | 1.0 |

### Microsoft Azure

| 名称                                                         | 状态    | 组件版本 | 自从  |
| ---------------------------------------------------------- | ----- | ---- | --- |
| [Azure Events Hub]({{< ref setup-azure-eventhubs.md >}})   | Alpha | v1   | 1.0 |
| [Azure Service Bus]({{< ref setup-azure-servicebus.md >}}) | GA    | v1   | 1.0 |
