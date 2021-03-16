---
type: docs
title: "支持的 发布/订阅 消息代理"
linkTitle: "Supported pub/sub brokers"
weight: 50000
description: Dapr支持的发布/订阅消息代理
no_list: true
---

表格标题：

> `Status`: [组件认证]({{X31X}}) 状态
  - [Alpha]({{X20X}})
  - [Beta]({{X22X}})
  - [GA]({{X24X}}) > `自从`: 定义了当前组件从哪个Dapr Runtime版本开始支持

> `Component version`: defines the version of the component
### Generic

| 名称                                                    | 状态 （State） | Component version | Since |
| ----------------------------------------------------- | ---------- | ----------------- | ----- |
| [Apache Kafka]({{< ref setup-apache-kafka.md >}})     | Beta       | v1                | 1.0   |
| [Hazelcast]({{< ref setup-hazelcast.md >}})           | Alpha      | v1                | 1.0   |
| [MQTT]({{< ref setup-mqtt.md >}})                     | Alpha      | v1                | 1.0   |
| [NATS Streaming]({{< ref setup-nats-streaming.md >}}) | Beta       | v1                | 1.0   |
| [Pulsar]({{< ref setup-pulsar.md >}})                 | Alpha      | v1                | 1.0   |
| [RabbitMQ]({{< ref setup-rabbitmq.md >}})             | Alpha      | v1                | 1.0   |
| [Redis Streams]({{< ref setup-redis-pubsub.md >}})    | GA         | v1                | 1.0   |

### Amazon Web Services (AWS)

| Name                                           | Status | Component version | Since |
| ---------------------------------------------- | ------ | ----------------- | ----- |
| [AWS SNS/SQS]({{< ref setup-aws-snssqs.md >}}) | Alpha  | v1                | 1.0   |

### Google Cloud Platform (GCP)

| Name                                           | Status | Component version | Since |
| ---------------------------------------------- | ------ | ----------------- | ----- |
| [GCP Pub/Sub]({{< ref setup-gcp-pubsub.md >}}) | Alpha  | v1                | 1.0   |

### Microsoft Azure

| Name                                                       | Status | Component version | Since |
| ---------------------------------------------------------- | ------ | ----------------- | ----- |
| [Azure Events Hub]({{< ref setup-azure-eventhubs.md >}})   | Alpha  | v1                | 1.0   |
| [Azure Service Bus]({{< ref setup-azure-servicebus.md >}}) | GA     | v1                | 1.0   |
