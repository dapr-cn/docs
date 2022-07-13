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
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                | 必填 | 详情                                                                                                                                        | 示例                                |
| ----------------- |:--:| ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| host              | Y  | Rabbitmq 的连接地址                                                                                                                            | `amqp://user:pass@localhost:5672` |
| durable           | N  | 是否使用[durable](https://www.rabbitmq.com/queues.html#durability)队列， 默认值为 `"false"` 默认值为 `"false"`                                           | `"true"`, `"false"`               |
| deletedWhenUnused | N  | 是否应将队列配置为 [自动删除](https://www.rabbitmq.com/queues.html) 默认值为 `"true"`                                                                      | `"true"`, `"false"`               |
| autoAck           | N  | 队列的消费者是否应该[auto-ack](https://www.rabbitmq.com/confirms.html)消息 默认值为 `"false"` 默认值为 `"false"`                                              | `"true"`, `"false"`               |
| deliveryMode      | N  | 发布消息时的持久化模式， 默认值为 `"0"`. 值为`"2"`时RabbitMQ会进行持久化，其他值反之                                                                                     | `"0"`, `"2"`                      |
| requeueInFailure  | N  | 在发送[否定应答](https://www.rabbitmq.com/nack.html)失败的情况下，是否进行重排。 默认值为 `"false"`                                                                | `"true"`, `"false"`               |
| prefetchCount     | N  | Number of messages to [prefetch](https://www.rabbitmq.com/consumer-prefetch.html). 生产环境中需要考虑设置一个非零值。 该值默认为`"0"`，这意味着所有可用消息都将被预先提取         | `"2"`                             |
| reconnectWait     | N  | 如果发生连接失败，在重新连接之前需要等待多长时间（秒）                                                                                                               | `"0"`                             |
| concurrencyMode   | N  | 默认值是`parallel`，表示允许并行处理多个消息（如果配置了`app-max-concurrency`，最大并行数会受到该值限制）, 设置为`single`可禁用并行处理， 大多数情况下没必要去这么做 设置为`single`可禁用并行处理， 大多数情况下没必要去这么做 | `parallel`, `single`              |


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
- 相关链接部分中的[Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})
