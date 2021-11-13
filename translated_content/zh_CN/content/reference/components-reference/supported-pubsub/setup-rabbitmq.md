---
type: docs
title: "RabbitMQ"
linkTitle: "RabbitMQ"
description: "RabbitMQ pubsub组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-rabbitmq/"
---

## 配置

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: rabbitmq-pubsub
  namespace: default
spec:
  type: pubsub.rabbitmq
  version: v1
  metadata:
  - name: host
    value: "amqp://localhost:5672"
  - name: durable
    value: "false"
  - name: deletedWhenUnused
    value: "false"
  - name: autoAck
    value: "false"
  - name: deliveryMode
    value: "0"
  - name: requeueInFailure
    value: "false"
  - name: prefetchCount
    value: "0"
  - name: reconnectWait
    value: "0"
  - name: concurrencyMode
    value: parallel
  - name: backOffPolicy
    value: "exponential"
  - name: backOffInitialInterval
    value: "100"
  - name: backOffMaxRetries
    value: "16"
  - name: enableDeadLetter # Optional enable dead Letter or not
    value: "true"
  - name: maxLen # Optional max message count in a queue
    value: "3000"
  - name: maxLenBytes # Optional maximum length in bytes of a queue.
    value: "10485760"
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段                         | 必填 | 详情                                                                                                                                                                                                                                                                                                                                        | Example                           |
| -------------------------- |:--:| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| host                       | Y  | Rabbitmq 的连接地址                                                                                                                                                                                                                                                                                                                            | `amqp://user:pass@localhost:5672` |
| durable                    | N  | 是否使用[durable](https://www.rabbitmq.com/queues.html#durability)队列， 默认值为 `"false"` 默认值为 `"false"`                                                                                                                                                                                                                                           | `"true"`, `"false"`               |
| deletedWhenUnused          | N  | Whether or not the queue should be configured to [auto-delete](https://www.rabbitmq.com/queues.html) Defaults to `"true"`                                                                                                                                                                                                                 | `"true"`, `"false"`               |
| autoAck                    | N  | 队列的消费者是否应该[auto-ack](https://www.rabbitmq.com/confirms.html)消息 默认值为 `"false"` 默认值为 `"false"`                                                                                                                                                                                                                                              | `"true"`, `"false"`               |
| deliveryMode               | N  | 发布消息时的持久化模式， 默认值为 `"0"`. 值为`"2"`时RabbitMQ会进行持久化，其他值反之                                                                                                                                                                                                                                                                                     | `"0"`, `"2"`                      |
| requeueInFailure           | N  | Whether or not to requeue when sending a [negative acknowledgement](https://www.rabbitmq.com/nack.html) in case of a failure. 默认值为 `"false"`                                                                                                                                                                                              | `"true"`, `"false"`               |
| prefetchCount              | N  | Number of messages to [prefetch](https://www.rabbitmq.com/consumer-prefetch.html). 生产环境中需要考虑设置一个非零值。 该值默认为`"0"`，这意味着所有可用消息都将被预先提取                                                                                                                                                                                                         | `"2"`                             |
| reconnectWait              | N  | 如果发生连接失败，在重新连接之前需要等待多长时间（秒）                                                                                                                                                                                                                                                                                                               | `"0"`                             |
| concurrencyMode            | N  | 默认值是`parallel`，表示允许并行处理多个消息（如果配置了`app-max-concurrency`，最大并行数会受到该值限制）, 设置为`single`可禁用并行处理， 大多数情况下没必要去这么做 设置为`single`可禁用并行处理， 大多数情况下没必要去这么做                                                                                                                                                                                                 | `parallel`, `single`              |
| backOffPolicy              | N  | Retry policy, `"constant"` is a backoff policy that always returns the same backoff delay. `"exponential"` is a backoff policy that increases the backoff period for each retry attempt using a randomization function that grows exponentially. Defaults to `"constant"`.                                                                | `constant`、`exponential`          |
| backOffDuration            | N  | The fixed interval only takes effect when the policy is constant. There are two valid formats, one is the fraction with a unit suffix format, and the other is the pure digital format that will be processed as milliseconds. Valid time units are "ns", "us" (or "µs"), "ms", "s", "m", "h". Defaults to `"5s"`.                        | `"5s"`、`"5000"`                   |
| backOffInitialInterval     | N  | The backoff initial interval on retry. Only takes effect when the policy is exponential. There are two valid formats, one is the fraction with a unit suffix format, and the other is the pure digital format that will be processed as milliseconds. Valid time units are "ns", "us" (or "µs"), "ms", "s", "m", "h". Defaults to `"500"` | `"50"`                            |
| backOffMaxInterval         | N  | The backoff initial interval on retry. Only takes effect when the policy is exponential. There are two valid formats, one is the fraction with a unit suffix format, and the other is the pure digital format that will be processed as milliseconds. Valid time units are "ns", "us" (or "µs"), "ms", "s", "m", "h". Defaults to `"60s"` | `"60000"`                         |
| backOffMaxRetries          | N  | The maximum number of retries to process the message before returning an error. Defaults to `"0"` which means the component will not retry processing the message. `"-1"` will retry indefinitely until the message is processed or the application is shutdown. Any positive number is treated as the maximum retry count.               | `"3"`                             |
| backOffRandomizationFactor | N  | Randomization factor, between 1 and 0, including 0 but not 1. Randomized interval = RetryInterval * (1 ± backOffRandomizationFactor). Defaults to `"0.5"`.                                                                                                                                                                                | `"0.5"`                           |
| backOffMultiplier          | N  | Backoff multiplier for the policy. Increments the interval by multiplying it with the multiplier. Defaults to `"1.5"`                                                                                                                                                                                                                     | `"1.5"`                           |
| backOffMaxElapsedTime      | N  | After MaxElapsedTime the ExponentialBackOff returns Stop. There are two valid formats, one is the fraction with a unit suffix format, and the other is the pure digital format that will be processed as milliseconds. Valid time units are "ns", "us" (or "µs"), "ms", "s", "m", "h". Defaults to `"15m"`                                | `"15m"`                           |
| enableDeadLetter           | N  | Enable forwarding Messages that cannot be handled to a dead-letter topic. 默认值为 `"false"`                                                                                                                                                                                                                                                  | `"true"`, `"false"`               |
| maxLen                     | N  | The maximum number of messages of a queue and its dead letter queue (if dead letter enabled). If both `maxLen` and `maxLenBytes` are set then both will apply; whichever limit is hit first will be enforced.  Defaults to no limit.                                                                                                      | `"1000"`                          |
| maxLenBytes                | N  | Maximum length in bytes of a queue and its dead letter queue (if dead letter enabled). If both `maxLen` and `maxLenBytes` are set then both will apply; whichever limit is hit first will be enforced.  Defaults to no limit.                                                                                                             | `"1048576"`                       |


### Backoff policy introduction
Backoff retry strategy can instruct the dapr sidecar how to resend the message. By default, the retry strategy is turned off, which means that the sidecar will send a message to the service once. When the service returns a result, the message will be marked as consumption regardless of whether it is correct or not. The above is based on the condition of `autoAck` and `requeueInFailure` is setting to false(if `requeueInFailure` is set to true, the message will get a second chance).

But in some cases, you may want dapr to retry pushing message with an (exponential or constant) backoff strategy until the message is processed normally or the number of retries is exhausted. This maybe useful when your service breaks down abnormally but the sidecar is not stopped together. Adding backoff policy will retry the message pushing during the service downtime, instead of marking these message as consumed.


## 创建RabbitMQ服务

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
你可以使用Docker在本地运行RabbitMQ ：

```bash
docker run -d --hostname my-rabbit --name some-rabbit rabbitmq:3
```

然后你可以通过`localhost:5672`与服务器交互。
{{% /codetab %}}

{{% codetab %}}
在 Kubernetes 上安装 RabbitMQ 最简单的方法是使用 [Helm chart](https://github.com/helm/charts/tree/master/stable/rabbitmq)。

```bash
helm install rabbitmq stable/rabbitmq
```

根据Helm图表的输出，得到用户名和密码。

这会把 RabbitMQ 安装到 `default` 命名空间中， 这会把 RabbitMQ 安装到 `default` 命名空间中， 要与RabbitMQ进行交互，请使用以下方法找到服务：`kubectl get svc rabbitmq`。

如果使用上面的示例进行安装，RabbitMQ服务器的客户端地址是：

`rabbitmq.default.svc.cluster.local:5672`
{{% /codetab %}}

{{< /tabs >}}


## 相关链接
- [Basic schema for a Dapr component]({{< ref component-schema >}}) in the Related links section
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [发布/订阅构建块]({{< ref pubsub >}})
