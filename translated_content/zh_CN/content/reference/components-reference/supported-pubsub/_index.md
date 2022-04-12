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

> `状态`： [组件认证]({{<ref "certification-lifecycle.md">}}) 状态
  - [Alpha]({{<ref "certification-lifecycle.md#alpha">}})
  - [Beta]({{<ref "certification-lifecycle.md#beta">}})
  - [Stable]({{<ref "certification-lifecycle.md#stable">}}) > `Since`: 定义自哪个 Dapr 运行时版本开始，组件处于当前的状态。

> `组件版本`：代表组件的版本
### 通用

| Name                                                  | 状态     | 组件版本 | 自从  |
| ----------------------------------------------------- | ------ | ---- | --- |
| [Apache Kafka]({{< ref setup-apache-kafka.md >}})     | Stable | v1   | 1.5 |
| [Hazelcast]({{< ref setup-hazelcast.md >}})           | Alpha  | v1   | 1.0 |
| [MQTT]({{< ref setup-mqtt.md >}})                     | Beta   | v1   | 1.6 |
| [NATS Streaming]({{< ref setup-nats-streaming.md >}}) | Beta   | v1   | 1.0 |
| [In Memory]({{< ref setup-inmemory.md >}})            | Alpha  | v1   | 1.4 |
| [JetStream]({{< ref setup-jetstream.md >}})           | Alpha  | v1   | 1.4 |
| [Pulsar]({{< ref setup-pulsar.md >}})                 | Alpha  | v1   | 1.0 |
| [RabbitMQ]({{< ref setup-rabbitmq.md >}})             | Beta   | v1   | 1.6 |
| [Redis Streams]({{< ref setup-redis-pubsub.md >}})    | Stable | v1   | 1.0 |

### Amazon Web Services (AWS)

| Name                                           | 状态   | 组件版本 | 自从  |
| ---------------------------------------------- | ---- | ---- | --- |
| [AWS SNS/SQS]({{< ref setup-aws-snssqs.md >}}) | Beta | v1   | 1.6 |

### Google Cloud Platform (GCP)

| Name                                           | 状态    | 组件版本 | 自从  |
| ---------------------------------------------- | ----- | ---- | --- |
| [GCP Pub/Sub]({{< ref setup-gcp-pubsub.md >}}) | Alpha | v1   | 1.0 |

### Microsoft Azure

| Name                                                       | 状态     | 组件版本 | 自从  |
| ---------------------------------------------------------- | ------ | ---- | --- |
| [Azure Event Hubs]({{< ref setup-azure-eventhubs.md >}})   | Beta   | v1   | 1.6 |
| [Azure Service Bus]({{< ref setup-azure-servicebus.md >}}) | Stable | v1   | 1.0 |
