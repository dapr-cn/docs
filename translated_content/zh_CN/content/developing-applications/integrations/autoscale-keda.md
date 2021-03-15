---
type: docs
title: "Autoscaling a Dapr app with KEDA"
linkTitle: "Autoscale"
weight: 2000
---

Dapr采用模块化的构件方法，加上10多个不同的[pub/sub组件]({{< ref pubsub >}})，简化了消息处理程序的编写工作。 由于Dapr可以在许多环境中运行（如虚拟机、裸机、云或边缘），因此Dapr应用的自动伸缩是由宿主管理的。

对于Kubernetes，Dapr集成了[KEDA](https://github.com/kedacore/keda)，这是一个用于Kubernetes的事件驱动的自动伸缩组件。 Dapr的许多pub/sub组件与[KEDA](https://github.com/kedacore/keda)提供的扩展器重叠，因此很容易在Kubernetes上配置Dapr的deployment，以使用KEDA根据背压自动扩展。

这篇文章中配置了一个可扩展的Dapr应用以及背压的Kafka主题，然而你也可以将这种方法应用到Dapr提供的[pub/sub组件]({{< ref pubsub >}})中。

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

另外，请注意`consumerID`的`autoscaling-subscriber`值设置，该值稍后用于确保KEDA和你的deployment使用相同的 [Kafka partition offset](http://cloudurable.com/blog/kafka-architecture-topics/index.html#:~:text=Kafka%20continually%20appended%20to%20partitions,fit%20on%20a%20single%20server.)。

现在，将该组件部署到集群中:

```bash
kubectl apply -f kafka-pubsub.yaml
```

## 为Kafka部署KEDA自动伸缩

Next, we will deploy the KEDA scaling object that monitors the lag on the specified Kafka topic and configures the Kubernetes Horizontal Pod Autoscaler (HPA) to scale your Dapr deployment in and out.

Paste the following into a file named `kafka_scaler.yaml`, and configure your Dapr deployment in the required place:

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

A few things to review here in the above file:

* `name` in the `scaleTargetRef` section in the `spec:` is the Dapr ID of your app defined in the Deployment (The value of the `dapr.io/id` annotation)
* `pollingInterval` is the frequency in seconds with which KEDA checks Kafka for current topic partition offset
* `minReplicaCount` is the minimum number of replicas KEDA creates for your deployment. (Note, if your application takes a long time to start it may be better to set that to `1` to ensure at least one replica of your deployment is always running. Otherwise, set that to `0` and KEDA creates the first replica for you) (Note, if your application takes a long time to start it may be better to set that to `1` to ensure at least one replica of your deployment is always running. Otherwise, set that to `0` and KEDA creates the first replica for you)
* `maxReplicaCount` is the maximum number of replicas for your deployment. `maxReplicaCount` is the maximum number of replicas for your deployment. Given how [Kafka partition offset](http://cloudurable.com/blog/kafka-architecture-topics/index.html#:~:text=Kafka%20continually%20appended%20to%20partitions,fit%20on%20a%20single%20server.) works, you shouldn't set that value higher than the total number of topic partitions
* `topic` in the Kafka `metadata` section which should be set to the same topic to which your Dapr deployment subscribe (In this example `demo-topic`)
* Similarly the `bootstrapServers` should be set to the same broker connection string used in the `kafka-pubsub.yaml` file
* The `consumerGroup` should be set to the same value as the `consumerID` in the `kafka-pubsub.yaml` file

> Note: setting the connection string, topic, and consumer group to the *same* values for both the Dapr service subscription and the KEDA scaler configuration is critical to ensure the autoscaling works correctly.

Next, deploy the KEDA scaler to Kubernetes:

```bash
kubectl apply -f kafka_scaler.yaml
```

All done!

Now, that the `ScaledObject` KEDA object is configured, your deployment will scale based on the lag of the Kafka topic. More information on configuring KEDA for Kafka topics is available [here](https://keda.sh/docs/2.0/scalers/apache-kafka/). More information on configuring KEDA for Kafka topics is available [here](https://keda.sh/docs/2.0/scalers/apache-kafka/).

You can now start publishing messages to your Kafka topic `demo-topic` and watch the pods autoscale when the lag threshold is higher than `5` topics, as we have defined in the KEDA scaler manifest. You can publish messages to the Kafka Dapr component by using the Dapr [Publish](https://github.com/dapr/CLI#publishsubscribe) CLI command You can publish messages to the Kafka Dapr component by using the Dapr [Publish](https://github.com/dapr/CLI#publishsubscribe) CLI command
