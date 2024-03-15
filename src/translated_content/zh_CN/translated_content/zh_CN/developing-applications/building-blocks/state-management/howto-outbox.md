---
type: docs
title: "操作方法: 启用事务性发件箱模式"
linkTitle: "操作方法: 启用事务性发件箱模式"
weight: 400
description: 在状态存储和Pub/sub（发布/订阅）消息代理之间提交单个事务
---

事务性发件箱模式是一个用于发送有关应用程序状态更改通知的众所周知的设计模式。 事务性发件箱模式使用跨数据库和消息代理传递通知的单个事务。

开发人员在尝试自行实现此模式时面临许多困难的技术挑战，这往往涉及编写容易出错的中央协调管理器，最多支持一到两个数据库和消息代理的组合。

例如，您可以使用发件箱模式来：

1. 向账户数据库中写入新用户记录。
2. 发送通知消息，账户已成功创建。

借助 Dapr 的发件箱支持，您可以在调用 Dapr 的 [transactions API]（{{< ref "state_api.md#state-transactions" >}}） 时，在创建或更新应用程序状态时通知订阅者。

下图概述了发件箱功能的工作原理：

1. Service A使用事务将状态保存/更新到状态存储中。
2. 在同一事务下将消息写入代理。 当消息成功传递到消息代理时，事务完成，确保状态和消息一起进行事务处理。
3. 消息代理将消息主题传递给任何订阅者 - 在本例中是服务B。

<img src="/images/state-management-outbox.png" width=800 alt="Diagram showing the steps of the outbox pattern">

## 要求

发件箱功能可以与 Dapr 支持的任何 [事务状态存储]（{{< ref supported-state-stores >}}） 一起使用。 发件箱功能支持所有 [pub/sub brokers]（{{< ref supported-pubsub >}}）。

{{% alert title="Note" color="primary" %}}
鼓励使用竞争使用者模式（例如，[Apache Kafka]（{{< ref setup-apache-kafka>}}）的消息代理来减少重复事件的可能性。
{{% /alert %}}

## 用法

要启用发件箱功能，请在状态存储组件上添加以下必需和可选字段：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mysql-outbox
spec:
  type: state.mysql
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
  - name: outboxPublishPubsub # Required
    value: "mypubsub"
  - name: outboxPublishTopic # Required
    value: "newOrder"
  - name: outboxPubsub # Optional
    value: "myOutboxPubsub"
  - name: outboxDiscardWhenMissingState #Optional. Defaults to false
    value: false
```

### 元数据字段

| 名称                            | 必填  | 默认值                   | 说明                                                                                                                                                  |
| ----------------------------- | --- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| outboxPublishPubsub           | Yes | N/A                   | 设置 pub/sub 组件的名称，以便在发布状态更改时传递通知                                                                                                                     |
| outboxPublishTopic            | Yes | N/A                   | 设置接收通过 `outboxPublishPubsub` 配置的发布/订阅上的状态更改的主题。 消息主体将是“insert”或“update”操作的状态事务项                                                                     |
| outboxPubsub                  | No  | `outboxPublishPubsub` | 设置 Dapr 使用的 pub/sub 组件，以协调状态和发布/订阅事务。 如果未设置，则使用配置为 `outboxPublishPubsub` 的 pub/sub 组件。 如果您想要将用于发送通知状态更改的发布/订阅组件与用于协调事务的组件分开，这将非常有用                  |
| outboxDiscardWhenMissingState | No  | `false`               | 通过将`outboxDiscardWhenMissingState`设置为`true`，Dapr 会在数据库中找不到状态并且不重试时丢弃事务。 如果在 Dapr 能够传递消息之前由于任何原因状态存储数据已被删除，并且您希望 Dapr 从发布/订阅中删除项目并停止重试获取状态，则此设置可能很有用 |

### 在同一个状态存储上合并发件箱和非发件箱消息

如果您想要使用相同的状态存储来发送收件箱和非收件箱消息，只需定义两个状态存储组件，连接到相同的状态存储，其中一个具有收件箱功能，另一个没有。

#### MySQL状态存储，不带outbox

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mysql
spec:
  type: state.mysql
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
```

#### MySQL状态存储，带outbox

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mysql-outbox
spec:
  type: state.mysql
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
  - name: outboxPublishPubsub # Required
    value: "mypubsub"
  - name: outboxPublishTopic # Required
    value: "newOrder"
```

## 例子

观看[此视频以了解 outbox 模式的概述](https://youtu.be/rTovKpG0rhY?t=1338):

<div class="embed-responsive embed-responsive-16by9">
<iframe width="360" height="315" src="https://www.youtube-nocookie.com/embed/rTovKpG0rhY?si=1xlS54vcdYnLLtOL&amp;start=1338" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
