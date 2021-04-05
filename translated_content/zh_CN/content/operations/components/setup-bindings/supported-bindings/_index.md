---
type: docs
title: "支持的外部绑定"
linkTitle: "Supported bindings"
weight: 200
description: 支持与Dapr衔接的外部绑定
no_list: true
---

每个绑定都有自己独特的属性集。 点击下方列出的绑定的名称链接可以看到每个绑定的组件YAML。


表格标题：

> `Status`: [Component certification]({{X64X}}) status
  - [Alpha]({{X53X}})
  - [Beta]({{X55X}})
  - [GA]({{X57X}}) > `Since`: defines from which Dapr Runtime version, the component is in the current status

> `组件版本`：代表组件的版本
### 通用

| 名称                                                    | 输入<br>绑定 | 输出<br>绑定 | 状态    | 组件版本 | 自从  |
| ----------------------------------------------------- |:--------------:|:--------------:| ----- | ---- | --- |
| [Apple Push Notifications (APN)]({{< ref apns.md >}}) |                |       ✅        | Alpha | v1   | 1.0 |
| [Cron (scheduler)]({{< ref cron.md >}})               |       ✅        |       ✅        | Alpha | v1   | 1.0 |
| [HTTP]({{< ref http.md >}})                           |                |       ✅        | GA    | v1   | 1.0 |
| [InfluxDB]({{< ref influxdb.md >}})                   |                |       ✅        | Alpha | v1   | 1.0 |
| [Kafka]({{< ref kafka.md >}})                         |       ✅        |       ✅        | Alpha | v1   | 1.0 |
| [Kubernetes 事件]({{< ref "kubernetes-binding.md" >}})  |       ✅        |                | Alpha | v1   | 1.0 |
| [Local Storage]({{< ref localstorage.md >}})          |                |       ✅        | Alpha | v1   | 1.1 |
| [MQTT]({{< ref mqtt.md >}})                           |       ✅        |       ✅        | Alpha | v1   | 1.0 |
| [MySQL]({{< ref mysql.md >}})                         |                |       ✅        | Alpha | v1   | 1.0 |
| [PostgrSQL]({{< ref postgres.md >}})                  |                |       ✅        | Alpha | v1   | 1.0 |
| [Postmark]({{< ref postmark.md >}})                   |                |       ✅        | Alpha | v1   | 1.0 |
| [RabbitMQ]({{< ref rabbitmq.md >}})                   |       ✅        |       ✅        | Alpha | v1   | 1.0 |
| [Redis]({{< ref redis.md >}})                         |                |       ✅        | Alpha | v1   | 1.0 |
| [SMTP]({{< ref smtp.md >}})                           |                |       ✅        | Alpha | v1   | 1.0 |
| [Twilio]({{< ref twilio.md >}})                       |                |       ✅        | Alpha | v1   | 1.0 |
| [Twitter]({{< ref twitter.md >}})                     |       ✅        |       ✅        | Alpha | v1   | 1.0 |
| [SendGrid]({{< ref sendgrid.md >}})                   |                |       ✅        | Alpha | v1   | 1.0 |


### Alibaba Cloud

| 名称                                              | 输入<br>绑定 | 输出<br>绑定 | 状态    |
| ----------------------------------------------- |:--------------:|:--------------:| ----- |
| [Alibaba Cloud OSS]({{< ref alicloudoss.md >}}) |                |       ✅        | Alpha |

### Amazon Web Services (AWS)

| 名称                                      | 输入<br>绑定 | 输出<br>绑定 | 状态    | 组件版本 | 自从  |
| --------------------------------------- |:--------------:|:--------------:| ----- | ---- | --- |
| [AWS DynamoDB]({{< ref dynamodb.md >}}) |                |       ✅        | Alpha | v1   | 1.0 |
| [AWS S3]({{< ref s3.md >}})             |                |       ✅        | Alpha | v1   | 1.0 |
| [AWS SNS]({{< ref sns.md >}})           |                |       ✅        | Alpha | v1   | 1.0 |
| [AWS SQS]({{< ref sqs.md >}})           |       ✅        |       ✅        | Alpha | v1   | 1.0 |
| [AWS Kinesis]({{< ref kinesis.md >}})   |       ✅        |       ✅        | Alpha | v1   | 1.0 |

### Google Cloud Platform (GCP)

| 名称                                             | 输入<br>绑定 | 输出<br>绑定 | 状态    | 组件版本 | 自从  |
| ---------------------------------------------- |:--------------:|:--------------:| ----- | ---- | --- |
| [GCP Cloud Pub/Sub]({{< ref gcppubsub.md >}})  |       ✅        |       ✅        | Alpha | v1   | 1.0 |
| [GCP Storage Bucket]({{< ref gcpbucket.md >}}) |                |       ✅        | Alpha | v1   | 1.0 |

### Microsoft Azure

| 名称                                                          | 输入<br>绑定 | 输出<br>绑定 | 状态    | 组件版本 | 自从  |
| ----------------------------------------------------------- |:--------------:|:--------------:| ----- | ---- | --- |
| [Azure Blob Storage]({{< ref blobstorage.md >}})            |                |       ✅        | Alpha | v1   | 1.0 |
| [Azure CosmosDB]({{< ref cosmosdb.md >}})                   |                |       ✅        | Alpha | v1   | 1.0 |
| [Azure Event Grid]({{< ref eventgrid.md >}})                |       ✅        |       ✅        | Alpha | v1   | 1.0 |
| [Azure Event Hubs]({{< ref eventhubs.md >}})                |       ✅        |       ✅        | Alpha | v1   | 1.0 |
| [Azure Service Bus Queues]({{< ref servicebusqueues.md >}}) |       ✅        |       ✅        | Alpha | v1   | 1.0 |
| [Azure SignalR]({{< ref signalr.md >}})                     |                |       ✅        | Alpha | v1   | 1.0 |
| [Azure Storage Queues]({{< ref storagequeues.md >}})        |       ✅        |       ✅        | GA    | v1   | 1.0 |
