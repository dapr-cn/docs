---
type: docs
title: "如何：使用 KEDA 自动扩展 Dapr 应用"
linkTitle: "KEDA"
description: "如何配置您的 Dapr 应用程序以使用 KEDA 进行自动扩展"
weight: 3000
---

Dapr 通过其构建块 API 方法和众多 [pubsub 组件]({{< ref pubsub >}})，简化了消息处理应用程序的编写。由于 Dapr 可以在虚拟机、裸机、云或边缘 Kubernetes 等多种环境中运行，因此 Dapr 应用程序的自动扩展由其运行环境的管理层负责。

在 Kubernetes 环境中，Dapr 与 [KEDA](https://github.com/kedacore/keda) 集成，KEDA 是一个用于 Kubernetes 的事件驱动自动扩展器。Dapr 的许多 pubsub 组件与 KEDA 提供的扩展器功能相似，因此可以轻松配置您的 Dapr 部署在 Kubernetes 上使用 KEDA 根据负载进行自动扩展。

在本指南中，您将配置一个可扩展的 Dapr 应用程序，并在 Kafka 主题上进行负载管理。不过，您可以将此方法应用于 Dapr 提供的 _任何_ [pubsub 组件]({{< ref pubsub >}})。

{{% alert title="注意" color="primary" %}}
 如果您正在使用 Azure 容器应用，请参阅官方 Azure 文档以了解[使用 KEDA 扩展器扩展 Dapr 应用程序](https://learn.microsoft.com/azure/container-apps/dapr-keda-scaling)。
{{% /alert %}}

## 安装 KEDA

要安装 KEDA，请按照 KEDA 网站上的[部署 KEDA](https://keda.sh/docs/latest/deploy/)说明进行操作。

## 安装和部署 Kafka

如果您无法访问 Kafka 服务，可以使用 Helm 将其安装到您的 Kubernetes 集群中以进行此示例：

```bash
helm repo add confluentinc https://confluentinc.github.io/cp-helm-charts/
helm repo update
kubectl create ns kafka
helm install kafka confluentinc/cp-helm-charts -n kafka \
		--set cp-schema-registry.enabled=false \
		--set cp-kafka-rest.enabled=false \
		--set cp-kafka-connect.enabled=false
```

检查 Kafka 部署的状态：

```shell
kubectl rollout status deployment.apps/kafka-cp-control-center -n kafka
kubectl rollout status deployment.apps/kafka-cp-ksql-server -n kafka
kubectl rollout status statefulset.apps/kafka-cp-kafka -n kafka
kubectl rollout status statefulset.apps/kafka-cp-zookeeper -n kafka
```

安装完成后，部署 Kafka 客户端并等待其准备就绪：

```shell
kubectl apply -n kafka -f deployment/kafka-client.yaml
kubectl wait -n kafka --for=condition=ready pod kafka-client --timeout=120s
```

## 创建 Kafka 主题

创建本示例中使用的主题（`demo-topic`）：

```shell
kubectl -n kafka exec -it kafka-client -- kafka-topics \
		--zookeeper kafka-cp-zookeeper-headless:2181 \
		--topic demo-topic \
		--create \
		--partitions 10 \
		--replication-factor 3 \
		--if-not-exists
```

> 主题 `partitions` 的数量与 KEDA 为您的部署创建的最大副本数相关。

## 部署 Dapr pubsub 组件

为 Kubernetes 部署 Dapr Kafka pubsub 组件。将以下 YAML 粘贴到名为 `kafka-pubsub.yaml` 的文件中：

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

上述 YAML 定义了您的应用程序订阅的 pubsub 组件，以及 [您之前创建的 (`demo-topic`)]({{< ref "#create-the-kakfa-topic" >}})。

如果您使用了 [Kafka Helm 安装说明]({{< ref "#install-and-deploy-kafka" >}})，可以保持 `brokers` 值不变。否则，请将此值更改为您的 Kafka brokers 的连接字符串。

注意为 `consumerID` 设置的 `autoscaling-subscriber` 值。此值用于确保 KEDA 和您的部署使用相同的 [Kafka 分区偏移量](http://cloudurable.com/blog/kafka-architecture-topics/index.html#:~:text=Kafka%20continually%20appended%20to%20partitions,fit%20on%20a%20single%20server.)，以便正确进行扩展。

现在，将组件部署到集群：

```bash
kubectl apply -f kafka-pubsub.yaml
```

## 为 Kafka 部署 KEDA 自动扩展器

部署 KEDA 扩展对象，该对象：
- 监控指定 Kafka 主题上的滞后
- 配置 Kubernetes 水平 Pod 自动扩展器 (HPA) 以扩展您的 Dapr 部署

将以下内容粘贴到名为 `kafka_scaler.yaml` 的文件中，并在需要的地方配置您的 Dapr 部署：

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

让我们回顾一下上面文件中的一些元数据值：

| 值 | 描述 |
| ------ | ----------- |
| `scaleTargetRef`/`name` | 在部署中定义的应用程序的 Dapr ID（`dapr.io/id` 注释的值）。 |
| `pollingInterval` | KEDA 检查 Kafka 当前主题分区偏移量的频率（以秒为单位）。 |
| `minReplicaCount` | KEDA 为您的部署创建的最小副本数。如果您的应用程序启动时间较长，最好将其设置为 `1` 以确保您的部署始终至少有一个副本在运行。否则，设置为 `0`，KEDA 会为您创建第一个副本。 |
| `maxReplicaCount` | 您的部署的最大副本数。鉴于 [Kafka 分区偏移量](http://cloudurable.com/blog/kafka-architecture-topics/index.html#:~:text=Kafka%20continually%20appended%20to%20partitions,fit%20on%20a%20single%20server.) 的工作原理，您不应将该值设置得高于主题分区的总数。 |
| `triggers`/`metadata`/`topic` | 应设置为您的 Dapr 部署订阅的相同主题（在本示例中为 `demo-topic`）。 |
| `triggers`/`metadata`/`bootstrapServers` | 应设置为 `kafka-pubsub.yaml` 文件中使用的相同 broker 连接字符串。 |
| `triggers`/`metadata`/`consumerGroup` | 应设置为 `kafka-pubsub.yaml` 文件中 `consumerID` 的相同值。 |

{{% alert title="重要" color="warning" %}}
 为 Dapr 服务订阅和 KEDA 扩展器配置设置相同的连接字符串、主题和消费者组值对于确保自动扩展正常工作至关重要。
{{% /alert %}}

将 KEDA 扩展器部署到 Kubernetes：

```bash
kubectl apply -f kafka_scaler.yaml
```

全部完成！

## 查看 KEDA 扩展器工作

现在 `ScaledObject` KEDA 对象已配置，您的部署将根据 Kafka 主题的滞后进行扩展。[了解有关为 Kafka 主题配置 KEDA 的更多信息](https://keda.sh/docs/2.0/scalers/apache-kafka/)。

如 KEDA 扩展器清单中定义的，您现在可以开始向您的 Kafka 主题 `demo-topic` 发布消息，并在滞后阈值高于 `5` 个主题时观察 pod 自动扩展。使用 Dapr [发布]({{< ref dapr-publish >}}) CLI 命令向 Kafka Dapr 组件发布消息。

## 下一步

[了解有关在 Azure 容器应用中使用 KEDA 扩展 Dapr pubsub 或绑定应用程序的信息](https://learn.microsoft.com/azure/container-apps/dapr-keda-scaling)