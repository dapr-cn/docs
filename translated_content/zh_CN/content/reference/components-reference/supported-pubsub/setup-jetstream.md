---
type: docs
title: "JetStream"
linkTitle: "JetStream"
description: "Detailed documentation on the NATS JetStream component"
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

| 字段             | 必填 | 详情                                   | 示例                        |
| -------------- |:--:| ------------------------------------ | ------------------------- |
| natsURL        | Y  | NATS 服务器地址 URL                       | "`nats://localhost:4222`" |
| name           | N  | NATS 连接名称                            | `"my-conn-name"`          |
| durableName    | N  | [Durable name][]                     | `"my-durable"`            |
| queueGroupName | N  | 队列组名称                                | `"my-queue"`              |
| startSequence  | N  | [Start Sequence][]                   | `1`                       |
| startTime      | N  | [Start Time][] in Unix format        | `1630349391`              |
| deliverAll     | N  | Set deliver all as [Replay Policy][] | `true`                    |
| flowControl    | N  | [Flow Control][]                     | `true`                    |

## 创建NATS服务器

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
You can run a NATS Server with JetStream enabled locally using Docker:

```bash
docker run -d -p 4222:4222 nats:latest -js
```

然后，您可以使用 `localhost:4222` 与服务器进行交互。
{{% /codetab %}}

{{% codetab %}}
Install NATS JetStream on Kubernetes by using the [helm](https://github.com/nats-io/k8s/tree/main/helm/charts/nats#jetstream):

```bash
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
helm install my-nats nats/nats
```

This installs a single NATS server into the `default` namespace. To interact with NATS, find the service with: `kubectl get svc my-nats`.
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})
- [JetStream Documentation](https://docs.nats.io/nats-concepts/jetstream)
- [NATS CLI](https://github.com/nats-io/natscli)


[Durable name]: https://docs.nats.io/jetstream/concepts/consumers#durable-name
[Start Sequence]: https://docs.nats.io/jetstream/concepts/consumers#deliverbystartsequence
[Start Time]: https://docs.nats.io/jetstream/concepts/consumers#deliverbystarttime
[Replay Policy]: https://docs.nats.io/jetstream/concepts/consumers#replaypolicy
[Flow Control]: https://docs.nats.io/jetstream/concepts/consumers#flowcontrol
