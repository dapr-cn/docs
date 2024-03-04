---
type: docs
title: "JetStream"
linkTitle: "JetStream"
description: "NATS JetStream 组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-jetstream/"
---

## Component format
To set up JetStream pub/sub, create a component of type `pubsub.jetstream`. See the [pub/sub broker component file]({{< ref setup-pubsub.md >}}) to learn how ConsumerID is automatically generated. Read the [How-to: Publish and Subscribe guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pub/sub configuration.

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
  - name: jwt # Optional. Used for decentralized JWT authentication.
    value: "eyJhbGciOiJ...6yJV_adQssw5c"
  - name: seedKey # Optional. Used for decentralized JWT authentication.
    value: "SUACS34K232O...5Z3POU7BNIL4Y"
  - name: tls_client_cert # Optional. Used for TLS Client authentication.
    value: "/path/to/tls.crt"
  - name: tls_client_key # Optional. Used for TLS Client authentication.
    value: "/path/to/tls.key"
  - name: token # Optional. Used for token based authentication.
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
  - name: startTime # In Unix format
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

## 元数据字段规范

| Field             | Required | 详情                                         | 示例                               |
| ----------------- |:--------:| ------------------------------------------ | -------------------------------- |
| natsURL           |    是     | NATS server address URL                    | `"nats://localhost:4222"`        |
| jwt               |    否     | NATS 去中心化身份验证 JWT                          | `"eyJhbGciOiJ...6yJV_adQssw5c"`  |
| seedKey           |    否     | NATS 去中心化身份验证秘钥种子。                         | `"SUACS34K232O...5Z3POU7BNIL4Y"` |
| tls_client_cert |    否     | NATS TLS Client Authentication Certificate | `"/path/to/tls.crt"`             |
| tls_client_key  |    否     | NATS TLS Client Authentication Key         | `"/path/to/tls.key"`             |
| token             |    否     | [NATS token based authentication][]        | `"my-token"`                     |
| name              |    否     | NATS connection name                       | `"my-conn-name"`                 |
| streamName        |    否     | Name of the JetStream Stream to bind to    | `"my-stream"`                    |
| durableName       |    否     | [Durable name][]                           | `"my-durable"`                   |
| queueGroupName    |    否     | Queue group name                           | `"my-queue"`                     |
| startSequence     |    否     | [Start Sequence][]                         | `1`                              |
| startTime         |    否     | [Start Time][] in Unix format              | `1630349391`                     |
| flowControl       |    否     | [Flow Control][]                           | `true`                           |
| ackWait           |    否     | [Ack Wait][]                               | `10s`                            |
| maxDeliver        |    否     | [Max Deliver][]                            | `15`                             |
| backOff           |    否     | [BackOff][]                                | `"50ms, 1s, 5s, 10s"`            |
| maxAckPending     |    否     | [Max Ack Pending][]                        | `5000`                           |
| replicas          |    否     | [Replicas][]                               | `3`                              |
| memoryStorage     |    否     | [Memory Storage][]                         | `false`                          |
| rateLimit         |    否     | [Rate Limit][]                             | `1024`                           |
| heartbeat         |    否     | [Heartbeat][]                              | `10s`                            |
| ackPolicy         |    否     | [Ack Policy][]                             | `explicit`                       |
| deliverPolicy     |    否     | One of: all, last, new, sequence, time     | `all`                            |
| domain            |    否     | [JetStream Leafondes]                      | `HUB`                            |
| apiPrefix         |    否     | [JetStream Leafnodes]                      | `PREFIX`                         |

## 创建NATS服务器

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
您可以使用 Docker 在本地启用 JetStream 运行 NATS 服务器：

```bash
docker run -d -p 4222:4222 nats:latest -js
```

然后，您可以使用 `localhost:4222` 与服务器进行交互。
{{% /codetab %}}

{{% codetab %}}
使用 [helm](https://github. com/nats-io/k8s/tree/main/helm/charts/nats#jetstream)在 Kubernetes 上安装 NATS JetStream：

```bash
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
helm install --set nats.jetstream.enabled=true my-nats nats/nats
```

在`default` 命名空间安装单进程NATS服务。 要与 NATS 交互，请使用以下命令查找服务：

```bash
kubectl get svc my-nats
```

有关 helm chart 设置的更多信息，请参阅 [Helm chart 文档](https://helm.sh/docs/helm/helm_install/)。

{{% /codetab %}}

{{< /tabs >}}

## 创建 JetStream

It is essential to create a NATS JetStream for a specific subject. For example, for a NATS server running locally use:

```bash
nats -s localhost:4222 stream add myStream --subjects mySubject
```

## Example: Competing consumers pattern

Let's say you'd like each message to be processed by only one application or pod with the same app-id. Typically, the `consumerID` metadata spec helps you define competing consumers.

Since `consumerID` is not supported in NATS JetStream, you need to specify `durableName` and `queueGroupName` to achieve the competing consumers pattern. For example:

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
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})
- [JetStream 文档](https://docs.nats.io/nats-concepts/jetstream)
- [NATCLI](https://github.com/nats-io/natscli)


[Durable name]: https://docs.nats.io/jetstream/concepts/consumers#durable-name
[Start Sequence]: https://docs.nats.io/jetstream/concepts/consumers#deliverbystartsequence
[Start Time]: https://docs.nats.io/jetstream/concepts/consumers#deliverbystarttime
[Flow Control]: https://docs.nats.io/jetstream/concepts/consumers#flowcontrol
[Ack Wait]: https://docs.nats.io/jetstream/concepts/consumers#ackwait
[Max Deliver]: https://docs.nats.io/jetstream/concepts/consumers#maxdeliver
[BackOff]: https://docs.nats.io/jetstream/concepts/consumers#backoff
[Max Ack Pending]: https://docs.nats.io/jetstream/concepts/consumers#maxackpending
[Replicas]: https://docs.nats.io/jetstream/concepts/consumers#replicas
[Memory Storage]: https://docs.nats.io/jetstream/concepts/consumers#memorystorage
[Rate Limit]: https://docs.nats.io/jetstream/concepts/consumers#ratelimit
[Heartbeat]: https://docs.nats.io/jetstream/concepts/consumers#heartbeat
[Ack Policy]: https://docs.nats.io/nats-concepts/jetstream/consumers#ackpolicy
[NATS token based authentication]: https://docs.nats.io/running-a-nats-service/configuration/securing_nats/auth_intro/tokens
