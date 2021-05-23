---
type: docs
title: "Pub/sub brokers component specs"
linkTitle: "Pub/Sub 代理"
weight: 2000
description: Dapr支持的发布/订阅消息代理
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/"
no_list: true
---

表格标题：

> `状态`: [组件认证]({{X31X}}) 状态
  - [Alpha]({{X20X}})
  - [Beta]({{X22X}})
  - [GA]({{X24X}}) > `自从`: 定义了当前组件从哪个Dapr Runtime版本开始支持

> `组件版本`：代表组件的版本
### 通用

| Name                                                  | 状态 （Status） | 组件版本(Component version) | 自从(Since) |
| ----------------------------------------------------- | ----------- | ----------------------- | --------- |
| [Apache Kafka]({{< ref setup-apache-kafka.md >}})     | Beta        | v1                      | 1.0       |
| [Hazelcast]({{< ref setup-hazelcast.md >}})           | Alpha       | v1                      | 1.0       |
| [MQTT]({{< ref setup-mqtt.md >}})                     | Alpha       | v1                      | 1.0       |
| [NATS Streaming]({{< ref setup-nats-streaming.md >}}) | Beta        | v1                      | 1.0       |
| [Pulsar]({{< ref setup-pulsar.md >}})                 | Alpha       | v1                      | 1.0       |
| [RabbitMQ]({{< ref setup-rabbitmq.md >}})             | Alpha       | v1                      | 1.0       |
| [Redis Streams]({{< ref setup-redis-pubsub.md >}})    | GA          | v1                      | 1.0       |

### Amazon Web Services (AWS)

| Name                                           | 状态 （Status） | 组件版本(Component version) | 自从(Since) |
| ---------------------------------------------- | ----------- | ----------------------- | --------- |
| [AWS SNS/SQS]({{< ref setup-aws-snssqs.md >}}) | Alpha       | v1                      | 1.0       |

### Google Cloud Platform (GCP)

| Name                                           | 状态 （Status） | 组件版本(Component version) | 自从(Since) |
| ---------------------------------------------- | ----------- | ----------------------- | --------- |
| [GCP Pub/Sub]({{< ref setup-gcp-pubsub.md >}}) | Alpha       | v1                      | 1.0       |

### Microsoft Azure

| Name                                                       | 状态 （Status） | 组件版本(Component version) | 自从(Since) |
| ---------------------------------------------------------- | ----------- | ----------------------- | --------- |
| [Azure Events Hub]({{< ref setup-azure-eventhubs.md >}})   | Alpha       | v1                      | 1.0       |
| [Azure Service Bus]({{< ref setup-azure-servicebus.md >}}) | GA          | v1                      | 1.0       |
