---
type: docs
title: "How to: Horizontally scale subscribers with StatefulSets"
linkTitle: "How to: Horizontally scale subscribers with StatefulSets"
weight: 6000
description: 学习如何使用StatefulSet进行订阅，并使用一致的消费者ID进行水平扩展
---

与 Deployment 不同，Pod在Deployments中是短暂的，[StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) 允许在Kubernetes上部署有状态的应用程序，为每个Pod保持一个固定的标识。

以下是一个带有 Dapr 的 StatefulSet 示例：

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: python-subscriber
spec:
  selector:
    matchLabels:
      app: python-subscriber  # has to match .spec.template.metadata.labels
  serviceName: "python-subscriber"
  replicas: 3
  template:
    metadata:
      labels:
        app: python-subscriber # has to match .spec.selector.matchLabels
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "python-subscriber"
        dapr.io/app-port: "5001"
    spec:
      containers:
      - name: python-subscriber
        image: ghcr.io/dapr/samples/pubsub-python-subscriber:latest
        ports:
        - containerPort: 5001
        imagePullPolicy: Always
```

当通过 Dapr 订阅 pub/sub 主题时，应用程序可以定义 `consumerID`，该 consumerID 决定了订阅者在队列或主题中的位置。 使用 Pod 的 StatefulSets 粘性标识，你可以拥有一个唯一的 `consumerID` 每个 Pod，允许订阅者应用程序的每个水平缩放。 Dapr会跟踪每个Pod的名称，在使用`{podName}`标记时可以用来声明组件。

在扩展给定主题的订阅者数量时，每个 Dapr 组件都有确定其行为的唯一设置。 通常，对于多个消费者，有两个选项：

- 广播：发布到主题的每条消息都将被所有订阅者消费。
- 共享：消息被任何订阅者消费（但不是全部）。

Kafka通过`consumerID`将每个订阅者与主题中的自己位置隔离。 当实例重新启动时，它将重用相同的`consumerID`，并从其上次已知的位置继续，而不跳过消息。 下面的组件演示了如何让多个 Pod 使用 Kafka 组件：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers
    value: my-cluster-kafka-bootstrap.kafka.svc.cluster.local:9092
  - name: consumerID
    value: "{podName}"
  - name: authRequired
    value: "false"
```

MQTT3协议具有共享主题，允许多个订阅者对主题的消息进行"竞争"，这意味着消息只会被其中一个订阅者处理。 例如：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-pubsub
spec:
  type: pubsub.mqtt3
  version: v1
  metadata:
    - name: consumerID
      value: "{podName}"
    - name: cleanSession
      value: "true"
    - name: url
      value: "tcp://admin:public@localhost:1883"
    - name: qos
      value: 1
    - name: retain
      value: "false"
```

## 下一步

- 尝试一下[pub/sub（发布/订阅）教程](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub)。
- 了解[messaging with CloudEvents]({{< ref pubsub-cloudevents.md >}})以及您可能想要[在没有CloudEvents的情况下发送消息]({{< ref pubsub-raw\.md >}})。
- 查看列表 [发布/订阅组件]({{< ref setup-pubsub >}})。
- 阅读[API参考]({{< ref pubsub_api.md >}})。
