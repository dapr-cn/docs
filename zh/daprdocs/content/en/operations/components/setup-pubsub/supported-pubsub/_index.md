---
type: docs
title: "Supported pub/sub components"
linkTitle: "Supported pub/sub"
weight: 30000
description: List of all the supported external pubsub brokers that can interface with Dapr
no_list: true
---

Table captions:

> `Status`: [Component certification]({{X31X}}) status
  - [Alpha]({{X20X}})
  - [Beta]({{X22X}})
  - [GA]({{X24X}}) > `Since`: defines from which Dapr Runtime version, the component is in the current status

> `Component version`: defines the version of the component
### Generic

| Name                                                  | Status | Component version | Since |
| ----------------------------------------------------- | ------ | ----------------- | ----- |
| [Apache Kafka]({{< ref setup-apache-kafka.md >}})     | Beta   | v1                | 1.0   |
| [Hazelcast]({{< ref setup-hazelcast.md >}})           | Alpha  | v1                | 1.0   |
| [MQTT]({{< ref setup-mqtt.md >}})                     | Alpha  | v1                | 1.0   |
| [NATS Streaming]({{< ref setup-nats-streaming.md >}}) | Beta   | v1                | 1.0   |
| [Pulsar]({{< ref setup-pulsar.md >}})                 | Alpha  | v1                | 1.0   |
| [RabbitMQ]({{< ref setup-rabbitmq.md >}})             | Alpha  | v1                | 1.0   |
| [Redis Streams]({{< ref setup-redis-pubsub.md >}})    | GA     | v1                | 1.0   |

### Amazon Web Services (AWS)

| 名称                                             | Status | Component version | Since |
| ---------------------------------------------- | ------ | ----------------- | ----- |
| [AWS SNS/SQS]({{< ref setup-aws-snssqs.md >}}) | Alpha  | v1                | 1.0   |

### Google Cloud Platform (GCP)

| 名称                                             | Status | Component version | Since |
| ---------------------------------------------- | ------ | ----------------- | ----- |
| [GCP Pub/Sub]({{< ref setup-gcp-pubsub.md >}}) | Alpha  | v1                | 1.0   |

### Microsoft Azure

| 名称                                                         | Status | Component version | Since |
| ---------------------------------------------------------- | ------ | ----------------- | ----- |
| [Azure Events Hub]({{< ref setup-azure-eventhubs.md >}})   | Alpha  | v1                | 1.0   |
| [Azure Service Bus]({{< ref setup-azure-servicebus.md >}}) | GA     | v1                | 1.0   |
