---
type: docs
title: "使用KEDA对Dapr应用进行自动缩放"
linkTitle: "Autoscale with KEDA"
description: "How to configure your Dapr application to autoscale using KEDA"
weight: 2000
---

Dapr, with its modular building-block approach, along with the 10+ different [pub/sub components]({{< ref pubsub >}}), make it easy to write message processing applications. 由于Dapr可以在许多环境中运行（如虚拟机、裸机、云或边缘），因此Dapr应用的自动伸缩是由宿主管理的。

对于Kubernetes，Dapr集成了[KEDA](https://github.com/kedacore/keda)，这是一个用于Kubernetes的事件驱动的自动伸缩组件。 Dapr的许多pub/sub组件与[KEDA](https://github.com/kedacore/keda)提供的扩展器重叠，因此很容易在Kubernetes上配置Dapr的deployment，以使用KEDA根据背压自动扩展。

This how-to walks through the configuration of a scalable Dapr application along with the back pressure on Kafka topic, however you can apply this approach to any [pub/sub components]({{< ref pubsub >}}) offered by Dapr.

## 安装KEDA

要安装KEDA，请遵循KEDA网站上的[部署KEDA](https://keda.sh/docs/latest/deploy/)说明。

## 安装Kafka(可选)

如果你没有Kafka，你可以通过使用Helm将其安装到你的Kubernetes集群中，见下面的示例:

```bash
helm repo add confluentinc https://confluentinc.github.io/cp-helm-charts/
helm repo update
kubectl create ns kafka
helm install kafka confluentinc/cp-helm-charts -n kafka \
        --set cp-schema-registry.enabled=false \
        --set cp-kafka-rest.enabled=false \
        --set cp-kafka-connect.enabled=false
```

检查Kafka部署的状态:

```shell
kubectl rollout status deployment.apps/kafka-cp-control-center -n kafka
kubectl rollout status deployment.apps/kafka-cp-ksql-server -n kafka
kubectl rollout status statefulset.apps/kafka-cp-kafka -n kafka
kubectl rollout status statefulset.apps/kafka-cp-zookeeper -n kafka
```

完成后，还要部署Kafka客户端，并等待就绪:

```shell
kubectl apply -n kafka -f deployment/kafka-client.yaml
kubectl wait -n kafka --for=condition=ready pod kafka-client --timeout=120s
```

接下来，创建本例中使用的主题(这里用`demo-topic`为例):

> 主题分区的数量与KEDA为你的deployment创建的最大副本数量有关。

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

上面的YAML定义了你的应用程序所订阅的pub/sub组件，也就是我们在上面创建的`demo-topic`。 如果你使用了上面的Kafka Helm安装说明，你可以将`brokers`值保持不变。 否则，将其改为你的Kafka broker的连接地址字符串。

另外，请注意`consumerID`的`autoscaling-subscriber`值设置，该值稍后用于确保KEDA和你的deployment使用相同的 [Kafka分区偏移量](http://cloudurable.com/blog/kafka-architecture-topics/index.html#:~:text=Kafka%20continually%20appended%20to%20partitions,fit%20on%20a%20single%20server.)。

现在，将该组件部署到集群中:

```bash
kubectl apply -f kafka-pubsub.yaml
```

## 为Kafka部署KEDA自动伸缩

接下来，我们将部署KEDA缩放对象，该对象可以监控指定Kafka主题上的延迟情况，并配置Kubernetes Horizontal Pod Autoscaler (HPA) 来缩放你的Dapr deployment。

将以下内容粘贴到名为`kafka_scaler.yaml`的文件中，并在需要的地方配置你的Dapr deployment。

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

* `spec:`中`scaleTargetRef`部分的`name`是您的应用程序在Deployment中定义的Dapr ID（`dapr.io/id`注释的值）
* `pollingInterval`是KEDA检查Kafka当前主题分区偏移量的以秒为单位的频率
* `minReplicaCount`是KEDA为你的deployment创建的最小副本数量。 (注意，如果您的应用程序需要很长时间才能启动，最好将其设置为`1`，以确保部署的至少一个副本始终在运行。 否则，设置为`0`，KEDA就会为你创建第一个副本)
* `maxReplicaCount`是你的deployment的最大副本数量。 考虑到 [Kafka分区偏移量](http://cloudurable.com/blog/kafka-architecture-topics/index.html#:~:text=Kafka%20continually%20appended%20to%20partitions,fit%20on%20a%20single%20server.)的工作方式，你不应该将该值设置得高于主题分区的总数量。
* Kafka `metadata`部分的`topic`应该设置为你的Dapr deployment所订阅的同一主题（在本例中`demo-topic`）
* 类似地，`bootstrapServers`应该设置为`kafka-pubsub.yaml`文件中使用的同一个broker的连接地址字符串
* `consumerGroup`应该设置为与`kafka-pubsub.yaml`文件中的`consumerID`相同的值

> 注意：将 Dapr 服务订阅和 KEDA 缩放器配置的连接字符串、主题和消费者组设置为 *相同的*值，对于确保自动缩放正常工作至关重要。

接下来，将KEDA扩展器部署到Kubernetes:

```bash
kubectl apply -f kafka_scaler.yaml
```

全部完成！

现在，`ScaledObject` KEDA对象已经配置好了，你的deployment将根据Kafka主题的延迟进行扩展。 更多关于为Kafka主题配置KEDA的信息可以在[这里](https://keda.sh/docs/2.0/scalers/apache-kafka/)获得。

现在你可以开始将消息发布到您的Kafka主题`demo-topic`，当延迟阈值高于`5`主题时，你可以看到pods开始自动缩放，正如我们在KEDA缩放器清单中定义的那样。 您可以通过使用Dapr [Publish]({{< ref dapr-publish >}}) CLI命令将消息发布到Kafka Dapr组件。
