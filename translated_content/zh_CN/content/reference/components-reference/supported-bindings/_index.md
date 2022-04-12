---
type: docs
title: "Bindings component specs"
linkTitle: "绑定"
weight: 3000
description: 支持与Dapr衔接的外部绑定
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/"
no_list: true
---

每个绑定都有自己独特的属性集。 点击下方列出的绑定的名称链接可以看到每个绑定的组件YAML。


表格标题：

> `状态`： [组件认证]({{<ref "certification-lifecycle.md">}}) 状态
  - [Alpha]({{<ref "certification-lifecycle.md#alpha">}})
  - [Beta]({{<ref "certification-lifecycle.md#beta">}})
  - [Stable]({{<ref "certification-lifecycle.md#stable">}}) > `Since`: 定义自哪个 Dapr 运行时版本开始，组件处于当前的状态。

> `组件版本`：代表组件的版本
### 通用

| Name                                                  | 输入<br>绑定 | 输出<br>绑定 | 状态     | 组件版本 | 自从  |
| ----------------------------------------------------- |:--------------:|:--------------:| ------ | ---- | --- |
| [Apple Push Notifications (APN)]({{< ref apns.md >}}) |                |       ✅        | Alpha  | v1   | 1.0 |
| [Cron (scheduler)]({{< ref cron.md >}})               |       ✅        |       ✅        | Alpha  | v1   | 1.0 |
| [GraphQL]({{< ref graghql.md >}})                     |                |       ✅        | Alpha  | v1   | 1.0 |
| [HTTP]({{< ref http.md >}})                           |                |       ✅        | Stable | v1   | 1.0 |
| [InfluxDB]({{< ref influxdb.md >}})                   |                |       ✅        | Alpha  | v1   | 1.0 |
| [Kafka]({{< ref kafka.md >}})                         |       ✅        |       ✅        | Alpha  | v1   | 1.0 |
| [Kubernetes 事件]({{< ref "kubernetes-binding.md" >}})  |       ✅        |                | Alpha  | v1   | 1.0 |
| [本地存储]({{< ref localstorage.md >}})                   |                |       ✅        | Alpha  | v1   | 1.1 |
| [MQTT]({{< ref mqtt.md >}})                           |       ✅        |       ✅        | Alpha  | v1   | 1.0 |
| [MySQL]({{< ref mysql.md >}})                         |                |       ✅        | Alpha  | v1   | 1.0 |
| [PostgreSql]({{< ref postgres.md >}})                 |                |       ✅        | Alpha  | v1   | 1.0 |
| [Postmark]({{< ref postmark.md >}})                   |                |       ✅        | Alpha  | v1   | 1.0 |
| [RabbitMQ]({{< ref rabbitmq.md >}})                   |       ✅        |       ✅        | Alpha  | v1   | 1.0 |
| [Redis]({{< ref redis.md >}})                         |                |       ✅        | Alpha  | v1   | 1.0 |
| [SMTP]({{< ref smtp.md >}})                           |                |       ✅        | Alpha  | v1   | 1.0 |
| [Twilio]({{< ref twilio.md >}})                       |                |       ✅        | Alpha  | v1   | 1.0 |
| [Twitter]({{< ref twitter.md >}})                     |       ✅        |       ✅        | Alpha  | v1   | 1.0 |
| [SendGrid]({{< ref sendgrid.md >}})                   |                |       ✅        | Alpha  | v1   | 1.0 |

### Alibaba Cloud

| Name                                                       | 输入<br>绑定 | 输出<br>绑定 | 状态    | 组件版本 | 自从  |
| ---------------------------------------------------------- |:--------------:|:--------------:| ----- | ---- | --- |
| [Alibaba Cloud DingTalk]({{< ref alicloud-dingtalk.md >}}) |       ✅        |       ✅        | Alpha | v1   | 1.2 |
| [Alibaba Cloud OSS]({{< ref alicloudoss.md >}})            |                |       ✅        | Alpha | v1   | 1.0 |
| [阿里云 Tablestore]({{< ref alicloudtablestore.md >}})        |                |       ✅        | Alpha | v1   | 1.5 |

### Amazon Web Services (AWS)

| Name                                    | 输入<br>绑定 | 输出<br>绑定 | 状态    | 组件版本 | 自从  |
| --------------------------------------- |:--------------:|:--------------:| ----- | ---- | --- |
| [AWS DynamoDB]({{< ref dynamodb.md >}}) |                |       ✅        | Alpha | v1   | 1.0 |
| [AWS S3]({{< ref s3.md >}})             |                |       ✅        | Alpha | v1   | 1.0 |
| [AWS SES]({{< ref ses.md >}})           |                |       ✅        | Alpha | v1   | 1.4 |
| [AWS SNS]({{< ref sns.md >}})           |                |       ✅        | Alpha | v1   | 1.0 |
| [AWS SQS]({{< ref sqs.md >}})           |       ✅        |       ✅        | Alpha | v1   | 1.0 |
| [AWS Kinesis]({{< ref kinesis.md >}})   |       ✅        |       ✅        | Alpha | v1   | 1.0 |

### Google Cloud Platform (GCP)

| Name                                           | 输入<br>绑定 | 输出<br>绑定 | 状态    | 组件版本 | 自从  |
| ---------------------------------------------- |:--------------:|:--------------:| ----- | ---- | --- |
| [GCP Cloud Pub/Sub]({{< ref gcppubsub.md >}})  |       ✅        |       ✅        | Alpha | v1   | 1.0 |
| [GCP Storage Bucket]({{< ref gcpbucket.md >}}) |                |       ✅        | Alpha | v1   | 1.0 |

### Microsoft Azure

| Name                                                          | 输入<br>绑定 | 输出<br>绑定 | 状态     | 组件版本 | 自从  |
| ------------------------------------------------------------- |:--------------:|:--------------:| ------ | ---- | --- |
| [Azure Blob Storage]({{< ref blobstorage.md >}})              |                |       ✅        | Beta   | v1   | 1.0 |
| [Azure CosmSDB]({{< ref cosmosdb.md >}})                      |                |       ✅        | Beta   | v1   | 1.0 |
| [Azure CosmosDBGremlinAPI]({{< ref cosmosdbgremlinapi.md >}}) |                |       ✅        | Alpha  | v1   | 1.5 |
| [Azure Event Grid]({{< ref eventgrid.md >}})                  |       ✅        |       ✅        | Alpha  | v1   | 1.0 |
| [Azure Event Hubs]({{< ref eventhubs.md >}})                  |       ✅        |       ✅        | Beta   | v1   | 1.0 |
| [Azure Service Bus Queues]({{< ref servicebusqueues.md >}})   |       ✅        |       ✅        | Beta   | v1   | 1.0 |
| [Azure SignalR]({{< ref signalr.md >}})                       |                |       ✅        | Alpha  | v1   | 1.0 |
| [Azure Storage Queues]({{< ref storagequeues.md >}})          |       ✅        |       ✅        | Stable | v1   | 1.0 |

### Zeebe (Camunda Cloud)

| Name                                               | 输入<br>绑定 | 输出<br>绑定 | 状态    | 组件版本 | 自从  |
| -------------------------------------------------- |:--------------:|:--------------:| ----- | ---- | --- |
| [Zeebe Command]({{< ref zeebe-command.md >}})      |                |       ✅        | Alpha | v1   | 1.2 |
| [Zeebe Job Worker]({{< ref zeebe-jobworker.md >}}) |       ✅        |                | Alpha | v1   | 1.2 |
