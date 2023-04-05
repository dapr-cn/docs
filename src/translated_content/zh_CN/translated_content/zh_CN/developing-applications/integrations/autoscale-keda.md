---
type: docs
title: "使用 KEDA 对 Dapr 应用进行自动缩放"
linkTitle: "使用 KEDA 自动缩放"
description: "如何将 Dapr 应用程序配置为使用 KEDA 自动缩放"
weight: 2000
---

Dapr, with its modular building-block approach, along with the 10+ different [pub/sub components]({{< ref pubsub >}}), make it easy to write message processing applications. Since Dapr can run in many environments (e.g. VM, bare-metal, Cloud, or Edge) the autoscaling of Dapr applications is managed by the hosting layer.

对于 Kubernetes，Dapr集成了 [KEDA](https://github.com/kedacore/keda)，这是一个用于 Kubernetes 的事件驱动的自动伸缩组件。 许多 Dapr 的 pub/sub 组件与 [KEDA](https://github.com/kedacore/keda) 提供的缩放器重叠，因此使用 KEDA 可以很容易地在 Kubernetes 上配置 Dapr deployment，以根据背压自动缩放。

本操作指南介绍了可扩展 Dapr 应用程序的配置以及 Kafka 主题的背压，但是您可以将此方法应用于 Dapr 提供的任何 [发布/订阅组件]({{< ref pubsub >}}) 。

## Install KEDA

要安装 KEDA，请遵循 KEDA 网站上的[部署 KEDA](https://keda.sh/docs/latest/deploy/)说明。

## 安装Kafka(可选)

如果你没有 Kafka，你可以通过使用 Helm 将其安装到你的 Kubernetes 集群中，见下面的示例:

```bash
helm repo add confluentinc https://confluentinc.github.io/cp-helm-charts/
helm repo update
kubectl create ns kafka
helm install kafka confluentinc/cp-helm-charts -n kafka \
        --set cp-schema-registry.enabled=false \
        --set cp-kafka-rest.enabled=false \
        --set cp-kafka-connect.enabled=false
```

检查 Kafka deployment 的状态:

```shell
kubectl rollout status deployment.apps/kafka-cp-control-center -n kafka
kubectl rollout status deployment.apps/kafka-cp-ksql-server -n kafka
kubectl rollout status statefulset.apps/kafka-cp-kafka -n kafka
kubectl rollout status statefulset.apps/kafka-cp-zookeeper -n kafka
```

完成后，还要部署 Kafka 客户端，并等待就绪:

```shell
kubectl apply -n kafka -f deployment/kafka-client.yaml
kubectl wait -n kafka --for=condition=ready pod kafka-client --timeout=120s
```

接下来，创建本例中使用的主题(这里用 `demo-topic` 为例):

> The number of topic partitions is related to the maximum number of replicas KEDA creates for your deployments

```shell
kubectl -n kafka exec -it kafka-client -- kafka-topics \
        --zookeeper kafka-cp-zookeeper-headless:2181 \
        --topic demo-topic \
        --create \
        --partitions 10 \
        --replication-factor 3 \
        --if-not-exists
```

## 部署 Dapr Pub/Sub 组件

接下来，我们将为Kubernetes部署Dapr Kafka pub/sub组件。 将以下YAML粘贴到一个名为`kafka-pubsub.yaml`的文件中:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: autoscaling-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: kafka-cp-kafka.kafka.svc.cluster.local:9092
    - name: authRequired
      value: "false"
    - name: consumerID
      value: autoscaling-subscriber
```

上面的 YAML 定义了你的应用程序所订阅的 pub/sub 组件，也就是我们在上面创建的 `demo-topic`。 如果你使用了上面的 Kafka Helm 安装说明，你可以将 `brokers` 值保持不变。 否则，将其改为你的 Kafka broker 的连接地址字符串。

另外，请注意 `consumerID` 的 `autoscaling-subscriber` 值设置，该值稍后用于确保 KEDA 和你的 deployment 使用相同的 [Kafka 分区偏移量](http://cloudurable.com/blog/kafka-architecture-topics/index.html#:~:text=Kafka%20continually%20appended%20to%20partitions,fit%20on%20a%20single%20server.)。

现在，将该组件部署到集群中:

```bash
kubectl apply -f kafka-pubsub.yaml
```

## 为 Kafka 部署 KEDA 自动伸缩

接下来，我们将部署 KEDA 缩放对象，该对象可以监控指定 Kafka 主题上的延迟情况，并配置 Kubernetes Horizontal Pod Autoscaler (HPA) 来缩放你的 Dapr deployment。

将以下内容粘贴到名为 `kafka_scaler.yaml` 的文件中，并在需要的地方配置你的 Dapr deployment。

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: subscriber-scaler
spec:
  scaleTargetRef:
    name: <REPLACE-WITH-DAPR-DEPLOYMENT-NAME>
  pollingInterval: 15
  minReplicaCount: 0
  maxReplicaCount: 10
  triggers:
  - type: kafka
    metadata:
      topic: demo-topic
      bootstrapServers: kafka-cp-kafka.kafka.svc.cluster.local:9092
      consumerGroup: autoscaling-subscriber
      lagThreshold: "5"
```

在上面的文件中，这里有几点需要审视:

* `name` in the `scaleTargetRef` section in the `spec:` is the Dapr ID of your app defined in the Deployment (The value of the `dapr.io/id` annotation)
* `pollingInterval` 是 KEDA 检查 Kafka 当前主题分区偏移量的频率，以秒为单位
* `minReplicaCount` 是 KEDA 为你的 deployment 创建的最小副本数量。 (注意，如果您的应用程序需要很长时间才能启动，最好将其设置为`1`，以确保部署的至少一个副本始终在运行。 否则，设置为`0`，KEDA就会为你创建第一个副本)
* `maxReplicaCount` 是你的 deployment 的最大副本数量。 考虑到 [Kafka 分区偏移量](http://cloudurable.com/blog/kafka-architecture-topics/index.html#:~:text=Kafka%20continually%20appended%20to%20partitions,fit%20on%20a%20single%20server.)的工作方式，你不应该将该值设置得高于主题分区的总数量。
* Kafka `metadata` 部分的 `topic` 应该设置为你的 Dapr deployment 所订阅的同一主题（在本例中是 `demo-topic`）
* 类似地，`bootstrapServers` 应该设置为 `kafka-pubsub.yaml` 文件中使用的同一个 broker 的连接地址字符串
* `consumerGroup` 应该设置为与 `kafka-pubsub.yaml` 文件中的 `consumerID` 相同的值

> 注意：将 Dapr 服务订阅和 KEDA 缩放器配置的连接字符串、主题和消费者组设置为 *相同的*值，对于确保自动缩放正常工作至关重要。

接下来，将 KEDA 扩展器部署到 Kubernetes:

```bash
kubectl apply -f kafka_scaler.yaml
```

全部完成！

现在，`ScaledObject` KEDA 对象已经配置好了，你的 deployment 将根据 Kafka 主题的延迟进行扩展。 更多关于为 Kafka 主题配置 KEDA 的信息可以在 [这里](https://keda.sh/docs/2.0/scalers/apache-kafka/) 获得。

现在你可以开始将消息发布到您的 Kafka 主题 `demo-topic`，当延迟阈值高于 `5` 主题时，你可以看到 pods 开始自动缩放，正如我们在 KEDA 缩放器清单中定义的那样。  您可以通过使用 Dapr [Publish]({{< ref dapr-publish >}}) CLI 命令将消息发布到 Kafka Dapr 组件。
