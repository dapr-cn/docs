---
type: docs
title: "RocketMQ"
linkTitle: "RocketMQ"
description: "关于 RocketMQ pubsub 组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-rocketmq/"
---

## 组件格式
要设置 RocketMQ pub/sub，创建一个类型为 `pubsub.rocketmq` 的组件。请参阅 [pub/sub broker 组件文件]({{< ref setup-pubsub.md >}}) 了解 ConsumerID 是如何自动生成的。阅读 [如何：发布和订阅指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) 了解如何创建和应用 pub/sub 配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: rocketmq-pubsub
spec:
  type: pubsub.rocketmq
  version: v1
  metadata:
    - name: instanceName
      value: dapr-rocketmq-test
    - name: consumerGroup
      value: dapr-rocketmq-test-g-c
    - name: producerGroup 
      value: dapr-rocketmq-test-g-p
    - name: consumerID
      value: channel1
    - name: nameSpace
      value: dapr-test
    - name: nameServer
      value: "127.0.0.1:9876,127.0.0.2:9876"
    - name: retries
      value: 3
    - name: consumerModel
      value: "clustering"
    - name: consumeOrderly
      value: false
```

{{% alert title="警告" color="warning" %}}
上述示例中，secret 使用了明文字符串。建议使用 secret 存储来存储 secret，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 规格元数据字段
| 字段                                 | 必需 | 详情                                                      | 默认值                                                     | 示例                                                      |
| ------------------------------------- | :------: | ------------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------ |
| instanceName                          |    N     | 实例名称                                                | `time.Now().String()`                                       | `dapr-rocketmq-test`                                         |
| consumerGroup                         |    N     | 消费者组名称。建议使用。如果 `producerGroup` 为 `null`，则使用 `groupName`。 |                                                             | `dapr-rocketmq-test-g-c `                                    |
| producerGroup (consumerID)            |    N     | 生产者组名称。建议使用。如果 `producerGroup` 为 `null`，则使用 `consumerID`。如果 `consumerID` 也为 null，则使用 `groupName`。 |                                                             | `dapr-rocketmq-test-g-p`                                     |
| consumerID        |    N     | 消费者 ID（消费者标签）用于将一个或多个消费者组织成一个组。具有相同消费者 ID 的消费者作为一个虚拟消费者工作；例如，一条消息仅由组中的一个消费者处理一次。如果未提供 `consumerID`，Dapr 运行时将其设置为 Dapr 应用程序 ID (`appID`) 值。 | 可以设置为字符串值（如上例中的 `"channel1"`）或字符串格式值（如 `"{podName}"` 等）。[查看可以在组件元数据中使用的所有模板标签。]({{< ref "component-schema.md#templated-metadata-values" >}})
| groupName                             |    N     | 消费者/生产者组名称。**已弃用**。               |                                                             | `dapr-rocketmq-test-g`                                       |
| nameSpace                             |    N     | RocketMQ 命名空间                                           |                                                             | `dapr-rocketmq`                                              |
| nameServerDomain                      |    N     | RocketMQ 名称服务器域名                                  |                                                             | `https://my-app.net:8080/nsaddr`                             |
| nameServer                            |    N     | RocketMQ 名称服务器，使用 "," 或 ";" 分隔                |                                                             | `127.0.0.1:9876;127.0.0.2:9877,127.0.0.3:9877`               |
| accessKey                             |    N     | 访问密钥（用户名）                                        |                                                             | `"admin"`                                                    |
| secretKey                             |    N     | 密钥（密码）                                        |                                                             | `"password"`                                                 |
| securityToken                         |    N     | 安全令牌                                               |                                                             |                                                              |
| retries                               |    N     | 向 broker 发送消息的重试次数                | `3`                                                         | `3`                                                          |
| producerQueueSelector (queueSelector) |    N     | 生产者队列选择器。有五种队列选择器实现：`hash`、`random`、`manual`、`roundRobin`、`dapr`。 | `dapr`                                                      | `hash`                                                       |
| consumerModel                         |    N     | 定义消息如何传递到每个消费者客户端的消息模型。RocketMQ 支持两种消息模型：`clustering` 和 `broadcasting`。 | `clustering`                                                | `broadcasting` , `clustering`                                |
| fromWhere (consumeFromWhere)          |    N     | 消费者启动时的消费点。有三个消费点：`CONSUME_FROM_LAST_OFFSET`、`CONSUME_FROM_FIRST_OFFSET`、`CONSUME_FROM_TIMESTAMP` | `CONSUME_FROM_LAST_OFFSET`                                  | `CONSUME_FROM_LAST_OFFSET`                                   |
| consumeTimestamp |    N     | 以秒为精度回溯消费时间。时间格式为 `yyyymmddhhmmss`。例如，`20131223171201` 表示 2013 年 12 月 23 日 17:12:01 | ` time.Now().Add(time.Minute * (-30)).Format("20060102150405")` | `20131223171201`                   |
| consumeOrderly                        |    N     | 确定是否使用 FIFO 顺序的有序消息。      | `false`                                                     | `false`                                                      |
| consumeMessageBatchMaxSize            |    N     | 批量消费大小，范围 `[1, 1024]`              | `512`                                                       | `10`                                                         |
| consumeConcurrentlyMaxSpan            |    N     | 并发最大跨度偏移。这对顺序消费没有影响。范围：`[1, 65535]` | `1000`                                                    | `1000`                                             |
| maxReconsumeTimes                     |    N     | 最大重新消费次数。`-1` 表示 16 次。如果消息在成功前被重新消费超过 {@link maxReconsumeTimes} 次，它们将被定向到删除队列。 | 顺序消息为 `MaxInt32`；并发消息为 `16` | `16`                                                         |
| autoCommit                            |    N     | 启用自动提交                                           | `true`                                                      | `false`                                                      |
| consumeTimeout                            |    N     | 消息可能阻塞消费线程的最大时间。时间单位：分钟 | `15`                                      | `15`                                                   |
| consumerPullTimeout                           |    N     | 套接字超时时间，单位为毫秒         |                                                       |                                                       |
| pullInterval                          |    N     | 消息拉取间隔                                        | `100`                                                       | `100`                                                        |
| pullBatchSize                         |    N     | 一次从 broker 拉取的消息数量。如果 `pullBatchSize` 为 `null`，使用 `ConsumerBatchSize`。`pullBatchSize` 范围 `[1, 1024]` | `32`                                                        | `10`                                                         |
| pullThresholdForQueue |    N     | 队列级别的流量控制阈值。默认情况下，每个消息队列将缓存最多 1000 条消息。考虑 `PullBatchSize` - 瞬时值可能超过限制。范围：`[1, 65535]` | `1024`                                     | `1000`                                                       |
| pullThresholdForTopic    |    N     | 主题级别的流量控制阈值。如果 `pullThresholdForQueue` 不是无限制的，将被 `pullThresholdForTopic` 的值覆盖并计算。例如，如果 `pullThresholdForTopic` 的值为 1000，并且为此消费者分配了 10 个消息队列，则 `pullThresholdForQueue` 将设置为 100。范围：`[1, 6553500]` | `-1(无限制)`                                           | `10`                                                         |
| pullThresholdSizeForQueue                        |    N     | 限制队列级别的缓存消息大小。考虑 `pullBatchSize` - 瞬时值可能超过限制。消息的大小仅通过消息体测量，因此不准确。范围：`[1, 1024]` | `100`                                                     | `100`                                                        |
| pullThresholdSizeForTopic                        |    N     | 限制主题级别的缓存消息大小。如果 `pullThresholdSizeForQueue` 不是无限制的，将被 `pullThresholdSizeForTopic` 的值覆盖并计算。例如，如果 `pullThresholdSizeForTopic` 的值为 1000 MiB，并且为此消费者分配了 10 个消息队列，则 `pullThresholdSizeForQueue` 将设置为 100 MiB。范围：`[1, 102400]` | `-1`                                                     | `100`                                                        |
| content-type                          |    N     | 消息内容类型。                                        | `"text/plain"`                                              | `"application/cloudevents+json; charset=utf-8"`, `"application/octet-stream"` |
| logLevel                              |    N     | 日志级别                                                    | `warn`                                                      | `info`                                                       |
| sendTimeOut                           |    N     | 连接 RocketMQ 的 broker 发送消息超时，以纳秒为单位。**已弃用**。 | 3 秒                                                   | `10000000000`                                                |
| sendTimeOutSec                        |    N     | 发布消息的超时时间，以秒为单位。如果 `sendTimeOutSec` 为 `null`，则使用 `sendTimeOut`。 | 3 秒                                                   | `3`                                                          |
| mspProperties                         |    N     | RocketMQ 消息属性集合中的属性传递给应用程序，数据用 "," 分隔多个属性 |                                                             | `key,mkey`                                                   |

出于向后兼容的原因，元数据中的以下值仍然支持，尽管不推荐使用。

| 字段（支持但已弃用） | 必需 | 详情                                                  | 示例                  |
| -------------------------------- | :------: | -------------------------------------------------------- | ------------------------ |
| groupName                        |    N     | RocketMQ 发布者的生产者组名称              | `"my_unique_group_name"` |
| sendTimeOut                      |    N     | 发布消息的超时时间，以纳秒为单位 | `0`                      |
| consumerBatchSize                |    N     | 一次从 broker 拉取的消息数量  | `32`                       |

## 设置 RocketMQ
请参阅 https://rocketmq.apache.org/docs/quick-start/ 以设置本地 RocketMQ 实例。

## 每次调用的元数据字段

### 分区键

在调用 RocketMQ pub/sub 时，可以通过在请求 URL 中使用 `metadata` 查询参数提供可选的分区键。

您需要在 `metadata` 中指定 `rocketmq-tag` 、`"rocketmq-key"` 、`rocketmq-shardingkey` 、`rocketmq-queue`

示例：

```shell
curl -X POST http://localhost:3500/v1.0/publish/myRocketMQ/myTopic?metadata.rocketmq-tag=?&metadata.rocketmq-key=?&metadata.rocketmq-shardingkey=key&metadata.rocketmq-queue=1 \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        }
      }'
```

## 队列选择器

RocketMQ 组件提供了五种队列选择器。RocketMQ 客户端提供以下队列选择器：
- `HashQueueSelector`
- `RandomQueueSelector`
- `RoundRobinQueueSelector`
- `ManualQueueSelector`

要了解有关这些 RocketMQ 客户端队列选择器的更多信息，请阅读 [RocketMQ 文档](https://rocketmq.apache.org/docs)。

Dapr RocketMQ 组件实现了以下队列选择器：
- `DaprQueueSelector`

本文重点介绍 `DaprQueueSelector` 的设计。

### DaprQueueSelector

`DaprQueueSelector` 集成了三个队列选择器：
- `HashQueueSelector`
- `RoundRobinQueueSelector`
- `ManualQueueSelector`

`DaprQueueSelector` 从请求参数中获取队列 ID。您可以通过运行以下命令设置队列 ID：

```
http://localhost:3500/v1.0/publish/myRocketMQ/myTopic?metadata.rocketmq-queue=1
```

`ManualQueueSelector` 是通过上述方法实现的。

接下来，`DaprQueueSelector` 尝试：
- 获取 `ShardingKey`
- 哈希 `ShardingKey` 以确定队列 ID。

您可以通过以下方式设置 `ShardingKey`：

```
http://localhost:3500/v1.0/publish/myRocketMQ/myTopic?metadata.rocketmq-shardingkey=key
```

如果 `ShardingKey` 不存在，则使用 `RoundRobin` 算法确定队列 ID。

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [Pub/Sub 构建块]({{< ref pubsub >}})
- 阅读[本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})以获取有关配置 pub/sub 组件的说明
