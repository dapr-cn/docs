---
type: docs
title: "如何：使用StatefulSets水平扩展订阅者"
linkTitle: "如何：使用StatefulSets水平扩展订阅者"
weight: 6000
description: "学习如何使用StatefulSet进行订阅，并通过一致的消费者ID水平扩展"
---

与在Deployments中Pod是临时的不同，[StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)通过为每个Pod保持固定的身份，使得在Kubernetes上可以部署有状态应用程序。

以下是一个使用Dapr的StatefulSet示例：
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: python-subscriber
spec:
  selector:
    matchLabels:
      app: python-subscriber  # 必须匹配.spec.template.metadata.labels
  serviceName: "python-subscriber"
  replicas: 3
  template:
    metadata:
      labels:
        app: python-subscriber # 必须匹配.spec.selector.matchLabels
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

在通过Dapr订阅pubsub主题时，应用程序可以定义一个`consumerID`，这个ID决定了订阅者在队列或主题中的位置。利用StatefulSets中Pod的固定身份，您可以为每个Pod分配一个唯一的`consumerID`，从而实现订阅者应用程序的水平扩展。Dapr会跟踪每个Pod的名称，并可以在组件中使用`{podName}`标记来声明。

当扩展某个主题的订阅者数量时，每个Dapr组件都有特定的设置来决定其行为。通常，对于多个消费者有两种选择：

- 广播：发布到主题的每条消息将被所有订阅者接收。
- 共享：一条消息仅由一个订阅者接收（而不是所有订阅者）。

Kafka通过`consumerID`为每个订阅者分配独立的位置。当实例重新启动时，它会使用相同的`consumerID`继续从上次的位置处理消息，而不会遗漏任何消息。以下组件示例展示了如何让多个Pod使用Kafka组件：

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

MQTT3协议支持共享主题，允许多个订阅者“竞争”处理来自主题的消息，这意味着每条消息仅由其中一个订阅者处理。例如：

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

- 尝试[pubsub教程](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub)。
- 了解[使用CloudEvents进行消息传递]({{< ref pubsub-cloudevents.md >}})以及何时可能需要[发送不带CloudEvents的消息]({{< ref pubsub-raw.md >}})。
- 查看[pubsub组件列表]({{< ref setup-pubsub >}})。
- 阅读[API参考]({{< ref pubsub_api.md >}})。
