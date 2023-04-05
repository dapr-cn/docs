---
type: docs
title: "JetStream"
linkTitle: "JetStream"
description: "NATS JetStream 组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-jetstream/"
---

## 配置
要设置 JetStream pubsub，请创建一个类型为 `pubsub.jetstream` 的组件。 请参阅[本指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}})，了解如何创建和应用 pubsub 配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: jetstream-pubsub
  namespace: default
spec:
  type: pubsub.jetstream
  version: v1
  metadata:
  - name: natsURL
    value: "nats://localhost:4222"
  - name: jwt
    value: "eyJhbGciOiJ...6yJV_adQssw5c" # Optional. Used for decentralized JWT authentication
  - name: seedKey
    value: "SUACS34K232O...5Z3POU7BNIL4Y" # Optional. Used for decentralized JWT authentication
  - name: name
    value: "connection name"
  - name: durableName
    value: "consumer durable name"
  - name: queueGroupName
    value: "queue group name"
  - name: startSequence
    value: 1
  - name: startTime # in Unix format
    value: 1630349391
  - name: deliverAll
    value: false
  - name: flowControl
    value: false
```

## 元数据字段规范

| 字段             | 必填 | 详情                  | 示例                               |
| -------------- |:--:| ------------------- | -------------------------------- |
| natsURL        | 是  | NATS 服务器地址 URL      | "`nats://localhost:4222`"        |
| jwt            | 否  | NATS 去中心化身份验证 JWT   | "`eyJhbGciOiJ...6yJV_adQssw5c`"  |
| seedKey        | 否  | NATS 去中心化身份验证秘钥种子。  | "`SUACS34K232O...5Z3POU7BNIL4Y`" |
| name           | 否  | NATS 连接名称           | `"my-conn-name"`                 |
| durableName    | 否  | [持久名称][]            | `"my-durable"`                   |
| queueGroupName | 否  | 队列组名称               | `"my-queue"`                     |
| startSequence  | 否  | [起始编号][]            | `1`                              |
| startTime      | 否  | Unix 时间戳格式的[开始时间][] | `1630349391`                     |
| deliverAll     | 否  | 将全部交付设置为 [重播策略][]   | `true`                           |
| flowControl    | 否  | [流量控制][]            | `true`                           |

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

为特定主题创建 NATS JetStream 至关重要。 例如，对于本地运行的 NATS 服务器，请使用：

```bash
nats -s localhost:4222 stream add myStream --subjects mySubject
```

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})
- [JetStream 文档](https://docs.nats.io/nats-concepts/jetstream)
- [NATCLI](https://github.com/nats-io/natscli)


[持久名称]: https://docs.nats.io/jetstream/concepts/consumers#durable-name
[起始编号]: https://docs.nats.io/jetstream/concepts/consumers#deliverbystartsequence
[开始时间]: https://docs.nats.io/jetstream/concepts/consumers#deliverbystarttime
[重播策略]: https://docs.nats.io/jetstream/concepts/consumers#replaypolicy
[流量控制]: https://docs.nats.io/jetstream/concepts/consumers#flowcontrol