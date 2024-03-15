---
type: docs
title: 如何使用 KEDA 对 Dapr 应用进行自动缩放
linkTitle: 如何：使用 KEDA 自动缩放
description: 如何将 Dapr 应用程序配置为使用 KEDA 自动缩放
weight: 3000
---

Dapr以其模块化的构建方式，加上许多[pub/sub组件]({{< ref pubsub >}})，使得编写消息处理应用程序变得容易。 由于Dapr可以在许多环境中运行（例如虚拟机、裸机、云或边缘Kubernetes），因此Dapr应用的自动伸缩是由宿主管理的。

对于 Kubernetes，Dapr集成了[KEDA](https://github.com/kedacore/keda)，这是一个用于 Kubernetes 的事件驱动的自动伸缩组件。 许多 Dapr 的 pub/sub 组件与 [KEDA](https://github.com/kedacore/keda) 提供的缩放器重叠，因此使用 KEDA 可以很容易地在 Kubernetes 上配置 Dapr deployment，以根据背压自动缩放。

在本指南中，您将配置一个可扩展的 Dapr 应用程序，以及对 Kafka 主题的背压。 然而，您可以将这种方法应用于 Dapr 提供的**任何**[发布/订阅组件]({{< ref pubsub >}})。

{{% alert title="注意" color="primary" %}}
如果您正在使用Azure容器应用程序，请参考官方的Azure文档，了解如何使用KEDA扩展器[扩展Dapr应用程序的规模](https://learn.microsoft.com/azure/container-apps/dapr-keda-scaling)。



## 安装KEDA

要安装 KEDA，请遵循 [部署 KEDA](https://keda.sh/docs/latest/deploy/)说明。

## 安装和部署Kafka

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

安装后，部署 Kafka 客户端并等待它准备就绪：

```shell
kubectl apply -n kafka -f deployment/kafka-client.yaml
kubectl wait -n kafka --for=condition=ready pod kafka-client --timeout=120s
```

## 创建 Kafka 主题

创建本例中使用的主题 (`demo-topic`):

```shell
kubectl -n kafka exec -it kafka-client -- kafka-topics \
		--zookeeper kafka-cp-zookeeper-headless:2181 \
		--topic demo-topic \
		--create \
		--partitions 10 \
		--replication-factor 3 \
		--if-not-exists
```

> 主题`分区`的数量与 KEDA 为你的 deployment 创建的最大副本数量有关。

## 部署一个 Dapr Pub/sub 组件

为 Kubernetes 部署 Dapr Kafka 发布/订阅组件。 将以下YAML粘贴到名为`kafka-pubsub.yaml`的文件中：

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

上面的 YAML 定义了你的应用程序订阅的 pub/sub 组件，也就是你之前创建的 [`demo-topic`]({{< ref "#create-the-kakfa-topic" >}})。

如果您使用了[Kafka Helm安装说明]({{< ref "#install-and-deploy-kafka" >}})，您可以按原样保留`brokers`的值。 否则，将此值更改为你的 Kafka broker 的连接地址字符串。

请注意为`consumerID`设置的`autoscaling-subscriber`值。 此值稍后用于确保KEDA和您的部署使用相同的[Kafka分区偏移](http://cloudurable.com/blog/kafka-architecture-topics/index.html#:~:text=Kafka%20continually%20appended%20to%20partitions,fit%20on%20a%20single%20server.)。

现在，将该组件部署到集群中:

```bash
kubectl apply -f kafka-pubsub.yaml
```

## 为 Kafka 部署 KEDA 自动伸缩

部署 KEDA 缩放对象，该对象：

- 监控指定Kafka主题上的延迟
- 配置 Kubernetes Horizontal Pod Autoscaler （HPA） 以纵向扩展和横向扩展 Dapr 部署

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

让我们来回顾一下上面文件中的一些元数据值：

| 值                                        | 说明                                                                                                                                                                                                                                             |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scaleTargetRef`/`name`                  | 在 Deployment 中定义的应用的 Dapr ID（`dapr.io/id` 注解的值）。                                                                                                                                                                                               |
| `pollingInterval`                        | KEDA 检查 Kafka 当前主题分区偏移量的频率，以秒为单位。                                                                                                                                                                                                              |
| `minReplicaCount`                        | KEDA 为你的 deployment 创建的最小副本数量。 如果您的应用程序启动时间较长，可以将此设置为`1`，以确保部署的至少一个副本始终在运行。 否则，设置为`0`，KEDA就会为你创建第一个副本。                                                                                                                                         |
| `maxReplicaCount`                        | 你的 deployment 的最大副本数量。 考虑到[Kafka分区偏移](http://cloudurable.com/blog/kafka-architecture-topics/index.html#:~:text=Kafka%20continually%20appended%20to%20partitions,fit%20on%20a%20single%20server.)的情况 考虑到 Kafka 分区偏移量的工作方式，你不应该将该值设置得高于主题分区的总数量。 |
| `触发器`/`元数据`/`主题`                         | 应该设置为你的 Dapr deployment 订阅的同一主题（在本例中是 `demo-topic`）。                                                                                                                                                                                           |
| `triggers`/`metadata`/`bootstrapServers` | 应该设置为 `kafka-pubsub.yaml` 文件中使用的同一个 broker 的连接地址字符串。                                                                                                                                                                                           |
| `triggers`/`metadata`/`consumerGroup`    | 应该设置为与 `kafka-pubsub.yaml` 文件中的 `consumerID` 相同的值。                                                                                                                                                                                             |

{{% alert title="重要" color="warning" %}}
将连接字符串、主题和消费者组设置为_相同_的值，对于确保自动缩放正常工作，对于Dapr服务订阅和KEDA缩放器配置来说非常关键。



将 KEDA 扩展器部署到 Kubernetes:

```bash
kubectl apply -f kafka_scaler.yaml
```

全部完成！

## 查看 KEDA 扩缩器工作

现在，`ScaledObject` KEDA 对象已经配置好了，你的 deployment 将根据 Kafka 主题的延迟进行扩展。 [了解有关配置KEDA用于Kafka主题的更多信息](https://keda.sh/docs/2.0/scalers/apache-kafka/)。

根据KEDA scaler清单中的定义，您现在可以开始向您的Kafka主题`demo-topic`发布消息，并在滞后阈值高于`5`个主题时观察Pod的自动缩放。 通过使用Dapr [Publish]({{< ref dapr-publish >}}) CLI命令，将消息发布到Kafka Dapr组件。

## 下一步

[了解如何在Azure容器应用中使用KEDA扩展你的Dapr发布/订阅或绑定应用程序](https://learn.microsoft.com/azure/container-apps/dapr-keda-scaling)
