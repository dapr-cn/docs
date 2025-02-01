---
type: docs
title: "RabbitMQ"
linkTitle: "RabbitMQ"
description: "RabbitMQ pubsub 组件的详细说明文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-rabbitmq/"
---

## 组件格式

要设置 RabbitMQ 的发布/订阅功能，请创建一个类型为 `pubsub.rabbitmq` 的组件。请参阅 [pub/sub broker 组件文件]({{< ref setup-pubsub.md >}}) 以了解消费者ID（ConsumerID）是如何自动生成的。阅读 [How-to: 发布和订阅指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) 以了解如何创建和应用 pub/sub 配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: rabbitmq-pubsub
spec:
  type: pubsub.rabbitmq
  version: v1
  metadata:
  - name: connectionString
    value: "amqp://localhost:5672"
  - name: protocol
    value: amqp  
  - name: hostname
    value: localhost 
  - name: username
    value: username
  - name: password
    value: password  
  - name: consumerID
    value: channel1
  - name: durable
    value: false
  - name: deletedWhenUnused
    value: false
  - name: autoAck
    value: false
  - name: deliveryMode
    value: 0
  - name: requeueInFailure
    value: false
  - name: prefetchCount
    value: 0
  - name: reconnectWait
    value: 0
  - name: concurrencyMode
    value: parallel
  - name: publisherConfirm
    value: false
  - name: enableDeadLetter # 可选，是否启用死信
    value: true
  - name: maxLen # 可选，队列中的最大消息数
    value: 3000
  - name: maxLenBytes # 可选，队列的最大字节长度
    value: 10485760
  - name: exchangeKind
    value: fanout
  - name: saslExternal
    value: false
  - name: ttlInSeconds
    value: 60
  - name: clientName
    value: {podName}
  - name: heartBeat
    value: 10s
```

{{% alert title="警告" color="warning" %}}
上述示例使用明文字符串作为 secrets。建议使用 secret 存储来存储 secrets，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| connectionString | Y* | RabbitMQ 连接字符串。*与 protocol、hostname、username、password 字段互斥 | `amqp://user:pass@localhost:5672` |
| protocol | N* | RabbitMQ 协议。*与 connectionString 字段互斥 | `amqp` |
| hostname | N* | RabbitMQ 主机名。*与 connectionString 字段互斥 | `localhost` |
| username | N* | RabbitMQ 用户名。*与 connectionString 字段互斥 | `username` |
| password | N* | RabbitMQ 密码。*与 connectionString 字段互斥 | `password` |
| consumerID         | N        | 消费者 ID（消费者标签）将一个或多个消费者组织成一个组。具有相同消费者 ID 的消费者作为一个虚拟消费者工作；例如，消息仅由组中的一个消费者处理一次。如果未提供 `consumerID`，Dapr 运行时会将其设置为 Dapr 应用程序 ID (`appID`) 的值。 | 可以设置为字符串值（如上例中的 `"channel1"`）或字符串格式值（如 `"{podName}"` 等）。[查看您可以在组件元数据中使用的所有模板标签。]({{< ref "component-schema.md#templated-metadata-values" >}})
| durable            | N        | 是否使用 [持久化](https://www.rabbitmq.com/queues.html#durability) 队列。默认为 `"false"`  | `"true"`，`"false"`
| deletedWhenUnused  | N        | 队列是否应配置为 [自动删除](https://www.rabbitmq.com/queues.html) 默认为 `"true"` | `"true"`，`"false"`
| autoAck  | N        | 队列消费者是否应 [自动确认](https://www.rabbitmq.com/confirms.html) 消息。默认为 `"false"` | `"true"`，`"false"`
| deliveryMode  | N        | 发布消息时的持久性模式。默认为 `"0"`。RabbitMQ 将 `"2"` 视为持久性，其他数字视为非持久性 | `"0"`，`"2"`
| requeueInFailure  | N        | 在失败情况下发送 [负确认](https://www.rabbitmq.com/nack.html) 时是否重新排队。默认为 `"false"` | `"true"`，`"false"`
| prefetchCount  | N        | 要 [预取](https://www.rabbitmq.com/consumer-prefetch.html) 的消息数量。考虑将其更改为非零值以用于生产环境。默认为 `"0"`，这意味着将预取所有可用消息。 | `"2"`
| publisherConfirm  | N        | 如果启用，客户端在发布消息后等待 [发布者确认](https://www.rabbitmq.com/confirms.html#publisher-confirms)。默认为 `"false"` | `"true"`，`"false"`
| reconnectWait  | N        | 如果发生连接故障，重新连接前等待的时间（以秒为单位） | `"0"`
| concurrencyMode | N        | `parallel` 是默认值，允许并行处理多个消息（如果配置了 `app-max-concurrency` 注释，则受其限制）。设置为 `single` 以禁用并行处理。在大多数情况下，没有理由更改此设置。 | `parallel`，`single`
| enableDeadLetter      | N        | 启用将无法处理的消息转发到死信主题。默认为 `"false"` | `"true"`，`"false"` |
| maxLen      | N        | 队列及其死信队列（如果启用了死信）的最大消息数。如果同时设置了 `maxLen` 和 `maxLenBytes`，则两者都将适用；首先达到的限制将被强制执行。默认为无限制。 | `"1000"` |
| maxLenBytes      | N        | 队列及其死信队列（如果启用了死信）的最大字节长度。如果同时设置了 `maxLen` 和 `maxLenBytes`，则两者都将适用；首先达到的限制将被强制执行。默认为无限制。 | `"1048576"` |
| exchangeKind      | N        | rabbitmq 交换的交换类型。默认为 `"fanout"`。 | `"fanout"`，`"topic"` |
| saslExternal      | N        | 使用 TLS 时，用户名是否应从附加字段（例如 CN）中获取。请参阅 [RabbitMQ 认证机制](https://www.rabbitmq.com/access-control.html#mechanisms)。默认为 `"false"`。 | `"true"`，`"false"` |
| ttlInSeconds      | N        | 在组件级别设置消息 TTL，可以通过每个请求的消息级别 TTL 覆盖。 | `"60"` |
| caCert | 使用 TLS 时必需 | 用于验证服务器 TLS 证书的 PEM 格式的证书颁发机构（CA）证书。 | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientCert  | 使用 TLS 时必需 | PEM 格式的 TLS 客户端证书。必须与 `clientKey` 一起使用。 | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientKey | 使用 TLS 时必需  | PEM 格式的 TLS 客户端密钥。必须与 `clientCert` 一起使用。可以是 `secretKeyRef` 以使用 secret 引用。 | `"-----BEGIN RSA PRIVATE KEY-----\n<base64-encoded PKCS8>\n-----END RSA PRIVATE KEY-----"`
| clientName | N | 这个 RabbitMQ [客户端提供的连接名称](https://www.rabbitmq.com/connections.html#client-provided-names) 是一个自定义标识符。如果设置，标识符将在 RabbitMQ 服务器日志条目和管理 UI 中提及。可以设置为 {uuid}、{podName} 或 {appID}，Dapr 运行时将其替换为实际值。 | `"app1"`，`{uuid}`，`{podName}`，`{appID}`
| heartBeat  | N | 定义与服务器的心跳间隔，检测与 RabbitMQ 服务器的对等 TCP 连接的存活性。默认为 `10s` 。 | `"10s"`


## 使用 TLS 进行通信

要配置使用 TLS 的通信，请确保 RabbitMQ 节点已启用 TLS，并在组件配置中提供 `caCert`、`clientCert`、`clientKey` 元数据。例如：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: rabbitmq-pubsub
spec:
  type: pubsub.rabbitmq
  version: v1
  metadata:
  - name: host
    value: "amqps://localhost:5671"
  - name: consumerID
    value: myapp
  - name: durable
    value: false
  - name: deletedWhenUnused
    value: false
  - name: autoAck
    value: false
  - name: deliveryMode
    value: 0
  - name: requeueInFailure
    value: false
  - name: prefetchCount
    value: 0
  - name: reconnectWait
    value: 0
  - name: concurrencyMode
    value: parallel
  - name: publisherConfirm
    value: false
  - name: enableDeadLetter # 可选，是否启用死信
    value: true
  - name: maxLen # 可选，队列中的最大消息数
    value: 3000
  - name: maxLenBytes # 可选，队列的最大字节长度
    value: 10485760
  - name: exchangeKind
    value: fanout
  - name: saslExternal
    value: false
  - name: caCert
    value: ${{ myLoadedCACert }}
  - name: clientCert
    value: ${{ myLoadedClientCert }}
  - name: clientKey
    secretKeyRef:
      name: myRabbitMQClientKey
      key: myRabbitMQClientKey
```

请注意，虽然 `caCert` 和 `clientCert` 值可能不是 secrets，但为了方便起见，它们也可以从 Dapr secret 存储中引用。

### 启用消息传递重试

RabbitMQ pub/sub 组件不支持内置的重试策略。这意味着 sidecar 仅将消息发送到服务一次。当服务返回结果时，无论消息是否正确处理，消息都将被标记为已消费。请注意，这在所有 Dapr PubSub 组件中都是常见的，而不仅仅是 RabbitMQ。
当 `autoAck` 设置为 `false` 且 `requeueInFailure` 设置为 `true` 时，Dapr 可以尝试第二次重新传递消息。

要使 Dapr 使用更复杂的重试策略，您可以将 [重试弹性策略]({{< ref "policies.md#retries" >}}) 应用于 RabbitMQ pub/sub 组件。

两种重试消息的方法之间有一个关键区别：

1. 使用 `autoAck = false` 和 `requeueInFailure = true` 时，RabbitMQ 负责重新传递消息，_任何_ 订阅者都可以获取重新传递的消息。如果您的消费者有多个实例，那么可能会有另一个消费者获取它。这通常是更好的方法，因为如果存在瞬态故障，另一个工作者更有可能成功处理消息。
2. 使用 Resiliency 使同一个 Dapr sidecar 重试重新传递消息。因此，将是同一个 Dapr sidecar 和同一个应用程序接收相同的消息。

## 创建 RabbitMQ 服务器

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
您可以使用 Docker 在本地运行 RabbitMQ 服务器：

```bash
docker run -d --hostname my-rabbit --name some-rabbit rabbitmq:3
```

然后，您可以使用客户端端口与服务器交互：`localhost:5672`。
{{% /codetab %}}

{{% codetab %}}
在 Kubernetes 上安装 RabbitMQ 的最简单方法是使用 [Helm chart](https://github.com/helm/charts/tree/master/stable/rabbitmq)：

```bash
helm install rabbitmq stable/rabbitmq
```

查看 chart 输出并获取用户名和密码。

这将 RabbitMQ 安装到 `default` 命名空间。要与 RabbitMQ 交互，请使用以下命令查找服务：`kubectl get svc rabbitmq`。

例如，如果使用上述示例进行安装，RabbitMQ 服务器客户端地址将是：

`rabbitmq.default.svc.cluster.local:5672`
{{% /codetab %}}

{{< /tabs >}}

## 使用主题交换路由消息

将 `exchangeKind` 设置为 `"topic"` 使用主题交换，这通常用于消息的多播路由。为了使用主题交换路由消息，您必须设置以下元数据：

- **`routingKey`:**  
   带有路由键的消息根据订阅时元数据中定义的 `routing key` 路由到一个或多个队列。

- **`queueName`:**  
   如果您没有设置 `queueName`，则只会创建一个队列，所有路由键将路由到该队列。这意味着所有订阅者将绑定到该队列，这不会产生预期的结果。

例如，如果应用程序配置了路由键 `keyA` 和 `queueName` 为 `queue-A`：

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: orderspubsub
spec:
  topic: B
  routes: 
    default: /B
  pubsubname: pubsub
  metadata:
    routingKey: keyA
    queueName: queue-A
```

它将接收路由键为 `keyA` 的消息，而其他路由键的消息将不被接收。

```
// 发布路由键为 `keyA` 的消息，这些消息将被上述示例接收。
client.PublishEvent(context.Background(), "pubsub", "B", []byte("this is a message"), dapr.PublishEventWithMetadata(map[string]string{"routingKey": "keyA"}))
// 发布路由键为 `keyB` 的消息，这些消息将不被上述示例接收。
client.PublishEvent(context.Background(), "pubsub", "B", []byte("this is another message"), dapr.PublishEventWithMetadata(map[string]string{"routingKey": "keyB"}))
```

### 绑定多个 `routingKey`

多个路由键可以用逗号分隔。  
下面的示例绑定了三个 `routingKey`：`keyA`、`keyB` 和 `""`。请注意空键的绑定方法。

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: orderspubsub
spec:
  topic: B
  routes: 
    default: /B
  pubsubname: pubsub
  metadata:
    routingKey: keyA,keyB,
```

有关更多信息，请参阅 [rabbitmq 交换](https://www.rabbitmq.com/tutorials/amqp-concepts.html#exchanges)。

## 使用优先级队列

Dapr 支持 RabbitMQ [优先级队列](https://www.rabbitmq.com/priority.html)。要为队列设置优先级，请使用 `maxPriority` 主题订阅元数据。

### 声明式优先级队列示例

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: pubsub
spec:
  topic: checkout
  routes: 
    default: /orders
  pubsubname: order-pub-sub
  metadata:
    maxPriority: 3
```

### 编程优先级队列示例

{{< tabs Python JavaScript Go>}}

{{% codetab %}}

```python
@app.route('/dapr/subscribe', methods=['GET'])
def subscribe():
    subscriptions = [
      {
        'pubsubname': 'pubsub',
        'topic': 'checkout',
        'routes': {
          'default': '/orders'
        },
        'metadata': {'maxPriority': '3'}
      }
    ]
    return jsonify(subscriptions)
```

{{% /codetab %}}

{{% codetab %}}

```javascript
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json({ type: 'application/*+json' }));

const port = 3000

app.get('/dapr/subscribe', (req, res) => {
  res.json([
    {
      pubsubname: "pubsub",
      topic: "checkout",
      routes: {
        default: '/orders'
      },
      metadata: {
        maxPriority: '3'
      }
    }
  ]);
})
```

{{% /codetab %}}

{{% codetab %}}

```go
package main

	"encoding/json"
	"net/http"

const appPort = 3000

type subscription struct {
	PubsubName string            `json:"pubsubname"`
	Topic      string            `json:"topic"`
	Metadata   map[string]string `json:"metadata,omitempty"`
	Routes     routes            `json:"routes"`
}

type routes struct {
	Rules   []rule `json:"rules,omitempty"`
	Default string `json:"default,omitempty"`
}

// 处理 /dapr/subscribe
func configureSubscribeHandler(w http.ResponseWriter, _ *http.Request) {
	t := []subscription{
		{
			PubsubName: "pubsub",
			Topic:      "checkout",
			Routes: routes{
				Default: "/orders",
			},
      Metadata: map[string]string{
        "maxPriority": "3"
      },
		},
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(t)
}
```
{{% /codetab %}}

{{< /tabs >}}

### 发布消息时设置优先级

要在消息上设置优先级，请将发布元数据键 `maxPriority` 添加到发布端点或 SDK 方法。

{{< tabs "HTTP API (Bash)" Python JavaScript Go>}}

{{% codetab %}}

```bash
curl -X POST http://localhost:3601/v1.0/publish/order-pub-sub/orders?metadata.priority=3 -H "Content-Type: application/json" -d '{"orderId": "100"}'
```

{{% /codetab %}}

{{% codetab %}}

```python
with DaprClient() as client:
        result = client.publish_event(
            pubsub_name=PUBSUB_NAME,
            topic_name=TOPIC_NAME,
            data=json.dumps(orderId),
            data_content_type='application/json',
            metadata= { 'priority': '3' })
```

{{% /codetab %}}

{{% codetab %}}

```javascript
await client.pubsub.publish(PUBSUB_NAME, TOPIC_NAME, orderId, { 'priority': '3' });
```

{{% /codetab %}}

{{% codetab %}}

```go
client.PublishEvent(ctx, PUBSUB_NAME, TOPIC_NAME, []byte(strconv.Itoa(orderId)), map[string]string{"priority": "3"})
```
{{% /codetab %}}

{{< /tabs >}}

## 使用仲裁队列

默认情况下，Dapr 创建 `经典` 队列。要创建 `仲裁` 队列，请将以下元数据添加到您的 pub/sub [订阅]({{< ref subscription-schema.md >}})

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: pubsub
spec:
  topic: checkout
  routes: 
    default: /orders
  pubsubname: order-pub-sub
  metadata:
    queueType: quorum
```

## 生存时间

您可以在消息级别或组件级别设置生存时间（TTL）值。使用组件规范 `ttlInSeconds` 字段在组件中设置默认组件级别 TTL。

{{% alert title="注意" color="primary" %}}
如果同时设置了组件级别和消息级别 TTL，则默认组件级别 TTL 将被忽略，以消息级别 TTL 为准。
{{% /alert %}}

## 单一活动消费者

RabbitMQ [单一活动消费者](https://www.rabbitmq.com/docs/consumers#single-active-consumer) 设置确保一次只有一个消费者从队列中处理消息，并在活动消费者被取消或失败时切换到另一个注册的消费者。当消息必须按到达队列的确切顺序消费且不支持多实例分布式处理时，可能需要这种方法。
当 Dapr 在队列上启用此选项时，Dapr 运行时的一个实例将是单一活动消费者。为了在故障情况下允许另一个应用程序实例接管，Dapr 运行时必须 [探测应用程序的健康状况]({{< ref "app-health.md" >}}) 并从 pub/sub 组件中取消订阅。

{{% alert title="注意" color="primary" %}}
这种模式将阻止应用程序扩展，因为只有一个实例可以处理负载。虽然对于 Dapr 与遗留或敏感应用程序的集成可能很有趣，但如果您需要可扩展性，您应该考虑允许分布式处理的设计。
{{% /alert %}}

```yml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: pubsub
spec:
  topic: orders
  routes:
    default: /orders
  pubsubname: order-pub-sub
  metadata:
    singleActiveConsumer: "true"
```

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}}) 在相关链接部分
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) 以获取有关配置 pub/sub 组件的说明
- [Pub/Sub 构建块]({{< ref pubsub >}})
