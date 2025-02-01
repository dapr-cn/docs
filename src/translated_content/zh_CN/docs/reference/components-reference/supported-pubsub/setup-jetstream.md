---
type: docs
title: "JetStream"
linkTitle: "JetStream"
description: "NATS JetStream 组件的详细说明文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-jetstream/"
---

## 组件格式
要配置 JetStream 的发布/订阅功能，需要创建一个类型为 `pubsub.jetstream` 的组件。请参考 [pubsub broker 组件文件]({{< ref setup-pubsub.md >}}) 以了解 ConsumerID 的自动生成方式。阅读 [发布和订阅指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) 以获取创建和应用 pubsub 配置的步骤。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: jetstream-pubsub
spec:
  type: pubsub.jetstream
  version: v1
  metadata:
  - name: natsURL
    value: "nats://localhost:4222"
  - name: jwt # 可选。用于分布式 JWT 认证。
    value: "eyJhbGciOiJ...6yJV_adQssw5c"
  - name: seedKey # 可选。用于分布式 JWT 认证。
    value: "SUACS34K232O...5Z3POU7BNIL4Y"
  - name: tls_client_cert # 可选。用于 TLS 客户端认证。
    value: "/path/to/tls.crt"
  - name: tls_client_key # 可选。用于 TLS 客户端认证。
    value: "/path/to/tls.key"
  - name: token # 可选。用于基于令牌的认证。
    value: "my-token"
  - name: name
    value: "my-conn-name"
  - name: streamName
    value: "my-stream"
  - name: durableName 
    value: "my-durable-subscription"
  - name: queueGroupName
    value: "my-queue-group"
  - name: startSequence
    value: 1
  - name: startTime # Unix 时间戳格式
    value: 1630349391
  - name: flowControl
    value: false
  - name: ackWait
    value: 10s
  - name: maxDeliver
    value: 5
  - name: backOff
    value: "50ms, 1s, 10s"
  - name: maxAckPending
    value: 5000
  - name: replicas
    value: 1
  - name: memoryStorage
    value: false
  - name: rateLimit
    value: 1024
  - name: heartbeat
    value: 15s
  - name: ackPolicy
    value: explicit
  - name: deliverPolicy
    value: all
  - name: domain
    value: hub
  - name: apiPrefix
    value: PREFIX
```

## 规格元数据字段

| 字段            | 必需 | 详情                                      | 示例                              |
| --------------- | :--: | ---------------------------------------- | -------------------------------- |
| natsURL         |  是  | NATS 服务器地址 URL                      | `"nats://localhost:4222"`        |
| jwt             |  否  | NATS 分布式认证 JWT                      | `"eyJhbGciOiJ...6yJV_adQssw5c"`  |
| seedKey         |  否  | NATS 分布式认证种子密钥                  | `"SUACS34K232O...5Z3POU7BNIL4Y"` |
| tls_client_cert |  否  | NATS TLS 客户端认证证书                  | `"/path/to/tls.crt"`             |
| tls_client_key  |  否  | NATS TLS 客户端认证密钥                  | `"/path/to/tls.key"`             |
| token           |  否  | [NATS 基于令牌的认证]                    | `"my-token"`                     |
| name            |  否  | NATS 连接名称                            | `"my-conn-name"`                 |
| streamName      |  否  | 要绑定的 JetStream 流名称                | `"my-stream"`                    |
| durableName     |  否  | [持久名称]                               | `"my-durable"`                   |
| queueGroupName  |  否  | 队列组名称                              | `"my-queue"`                     |
| startSequence   |  否  | [开始序列]                               | `1`                              |
| startTime       |  否  | [开始时间]，Unix 时间戳格式              | `1630349391`                     |
| flowControl     |  否  | [流量控制]                               | `true`                           |
| ackWait         |  否  | [确认等待]                               | `10s`                            |
| maxDeliver      |  否  | [最大投递次数]                           | `15`                             |
| backOff         |  否  | [退避]                                   | `"50ms, 1s, 5s, 10s"`            |
| maxAckPending   |  否  | [最大确认待处理]                         | `5000`                           |
| replicas        |  否  | [副本]                                   | `3`                              |
| memoryStorage   |  否  | [内存存储]                               | `false`                          |
| rateLimit       |  否  | [速率限制]                               | `1024`                           |
| heartbeat       |  否  | [心跳]                                   | `10s`                            |
| ackPolicy       |  否  | [确认策略]                               | `explicit`                       |
| deliverPolicy   |  否  | 其中之一：all, last, new, sequence, time | `all`                            |
| domain          |  否  | [JetStream Leafonodes]                   | `HUB`                            |
| apiPrefix       |  否  | [JetStream Leafnodes]                    | `PREFIX`                         |

## 创建 NATS 服务器

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
您可以使用 Docker 在本地运行启用 JetStream 的 NATS 服务器：

```bash
docker run -d -p 4222:4222 nats:latest -js
```

然后，您可以通过客户端端口与服务器交互：`localhost:4222`。
{{% /codetab %}}

{{% codetab %}}
使用 [helm](https://github.com/nats-io/k8s/tree/main/helm/charts/nats#jetstream) 在 Kubernetes 上安装 NATS JetStream：

```bash
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
helm install --set nats.jetstream.enabled=true my-nats nats/nats
```

这将在 `default` 命名空间中安装一个 NATS 服务器。要与 NATS 交互，请找到服务：

```bash
kubectl get svc my-nats
```

有关 helm chart 设置的更多信息，请参阅 [Helm chart 文档](https://helm.sh/docs/helm/helm_install/)。

{{% /codetab %}}

{{< /tabs >}}

## 创建 JetStream

为特定主题创建 NATS JetStream 是至关重要的。例如，对于在本地运行的 NATS 服务器，使用：

```bash
nats -s localhost:4222 stream add myStream --subjects mySubject
```

## 示例：竞争消费者模式

假设您希望每条消息仅由具有相同 app-id 的一个应用程序或 pod 处理。通常，`consumerID` 元数据规范可以帮助您定义竞争消费者。

由于 NATS JetStream 不支持 `consumerID`，您需要指定 `durableName` 和 `queueGroupName` 来实现竞争消费者模式。例如：

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.jetstream
  version: v1
  metadata:
  - name: name
    value: "my-conn-name"
  - name: streamName
    value: "my-stream"
  - name: durableName 
    value: "my-durable-subscription"
  - name: queueGroupName
    value: "my-queue-group"
```

## 相关链接
- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) 了解配置 pubsub 组件的说明
- [Pub/Sub 构建块]({{< ref pubsub >}})
- [JetStream 文档](https://docs.nats.io/nats-concepts/jetstream)
- [NATS CLI](https://github.com/nats-io/natscli)

[持久名称]: https://docs.nats.io/jetstream/concepts/consumers#durable-name
[开始序列]: https://docs.nats.io/jetstream/concepts/consumers#deliverbystartsequence
[开始时间]: https://docs.nats.io/jetstream/concepts/consumers#deliverbystarttime
[重播策略]: https://docs.nats.io/jetstream/concepts/consumers#replaypolicy
[流量控制]: https://docs.nats.io/jetstream/concepts/consumers#flowcontrol
[确认等待]: https://docs.nats.io/jetstream/concepts/consumers#ackwait
[最大投递次数]: https://docs.nats.io/jetstream/concepts/consumers#maxdeliver
[退避]: https://docs.nats.io/jetstream/concepts/consumers#backoff
[最大确认待处理]: https://docs.nats.io/jetstream/concepts/consumers#maxackpending
[副本]: https://docs.nats.io/jetstream/concepts/consumers#replicas
[内存存储]: https://docs.nats.io/jetstream/concepts/consumers#memorystorage
[速率限制]: https://docs.nats.io/jetstream/concepts/consumers#ratelimit
[心跳]: https://docs.nats.io/jetstream/concepts/consumers#heartbeat
[确认策略]: https://docs.nats.io/nats-concepts/jetstream/consumers#ackpolicy
[JetStream Leafonodes]: https://docs.nats.io/running-a-nats-service/configuration/leafnodes/jetstream_leafnodes
[分布式 JWT 认证/授权]: https://docs.nats.io/running-a-nats-service/configuration/securing_nats/auth_intro/jwt
[NATS 基于令牌的认证]: https://docs.nats.io/running-a-nats-service/configuration/securing_nats/auth_intro/tokens