---
type: docs
title: "如何操作：配置状态存储和 发布/订阅 消息代理"
linkTitle: "(optional) Configure state & pub/sub"
weight: 400
description: "配置Dapr的状态存储和 发布/订阅 消息代理"
aliases:
  - /getting-started/configure-redis/
---

为了启动和运行状态和 发布/订阅 构建块，需要两个组件。

1. 一个用于持久化和恢复的状态存储组件。
2. 作为发布/订阅消息代理组件，用于异步式的消息传递。

支持的组件的完整列表可以在这里找到：
- [支持的状态存储]({{< ref supported-state-stores >}})
- [支持的 发布/订阅 消息代理]({{< ref supported-pubsub >}})

此页的其余部分描述了如何使用Redis启动和运行。

{{% alert title="Self-hosted mode" color="warning" %}}
当在自托管模式下初始化时，Dapr会自动运行一个Redis容器并设置所需的 yaml 文件. 您可以跳过此页并跳转到 [下一步](#next-steps)
{{% /alert %}}

## 创建Redis存储

Dapr可以使用任何Redis实例--无论是在本地开发机器上的容器化的还是在托管云服务上的。 如果您已经有了Redis存储，请转到 [配置](#configure-dapr-components) 部分。

{{< tabs "Self-Hosted" "Kubernetes" "Azure" "AWS" "GCP" >}}

{{% codetab %}}
Redis is automatically installed in self-hosted environments by the Dapr CLI as part of the initialization process. You are all set and can skip to the \[next steps\](next steps) 您都已设置完毕，可以跳转到\[下一步\](下一步)
{{% /codetab %}}

{{% codetab %}}
You can use [Helm](https://helm.sh/) to quickly create a Redis instance in our Kubernetes cluster. This approach requires [Installing Helm v3](https://github.com/helm/helm#install). 此方法需要 [安装 Helm v3](https://github.com/helm/helm#install)。

1. 安装 Redis 到您的集群：

   ```bash
   helm repo add bitnami https://charts.bitnami.com/bitnami
   helm repo update
   helm install redis bitnami/redis
   ```

   请注意，您将需要 Redis 版本大于 5, 这是Dapr 的 发布/订阅 功能所要求的。 如果你打算将Redis仅仅作为一个状态存储（而不是用于 发布/订阅），可以使用一个低版本。

2. 运行`kubectl get pods`来查看现在正在集群中运行的Redis容器。

    ```bash
    $ kubectl get pods 
    NAME             READY   STATUS    RESTARTS   AGE
    redis-master-0   1/1     Running   0          69s
    redis-slave-0    1/1     Running   0          69s
    redis-slave-1    1/1     Running   0          22s
    ```

请注意，主机名是 `redis-master.default.svc.cluster.local:6379`，Kubernetes 密钥 `redis`是自动创建的。

{{% /codetab %}}

{{% codetab %}}
此方法需要 Azure 订阅。

1. 打开 [Azure Portal](https://ms.portal.azure.com/#create/Microsoft.Cache) 来启动 Azure Redis Cache 创建流程。 如有必要，请登录。
1. 填写必要的信息
   - Dapr 发布/订阅 使用 [Redis streams](https://redis.io/topics/streams-intro) ，这是由Redis 5.0引入的。 如果您想使用 Azure Redis Cache 来处理 发布/订阅，请确保将版本设置为 (PREVIEW) 6。
1. 点击“创建”来启动您的 Redis 实例的部署。
1. 你需要Redis实例的主机名，你可以从Azure中的 "概述 "中检索。 它看起来像 `xxxxxx.redis.cache.windows.net:6380`。 注意这一点，以备后用。
1. 创建实例后，您需要获取访问密钥。 在“设置”下导航到"访问密钥"并创建一个Kubernetes密钥来存储您的 Redis 密码：
   ```bash
   kubectl create secret generic redis --from-literal=redis-password=*********
   ```

{{% /codetab %}}

{{% codetab %}}
1. 访问 [AWS Redis](https://aws.amazon.com/redis/) 来部署一个 Redis 实例
1. 注意AWS门户中的Redis主机名，以便以后使用。
1. 创建一个Kubernetes密钥来存储您的 Redis 密码：
   ```bash
   kubectl create secret generic redis --from-literal=redis-password=*********
   ```
{{% /codetab %}}

{{% codetab %}}
1. 访问 [GCP Cloud MemoryStore](https://cloud.google.com/memorystore/) 来部署一个 MemoryStore 实例
1. Note the Redis hostname in the GCP portal for use later
1. Create a Kubernetes secret to store your Redis password:
   ```bash
   kubectl create secret generic redis --from-literal=redis-password=*********
   ```
{{% /codetab %}}

{{< /tabs >}}

## Configure Dapr components

Dapr uses components to define what resources to use for building block functionality. These steps go through how to connect the resources you created above to Dapr for state and pub/sub. These steps go through how to connect the resources you created above to Dapr for state and pub/sub.

In self-hosted mode, component files are automatically created under:
- **Windows**: `%USERPROFILE%\.dapr\components\`
- **Linux/MacOS**: `$HOME/.dapr/components`

For Kubernetes, files can be created in any directory, as they are applied with `kubectl`.

### Create State store component

Create a file named `redis-state.yaml`, and paste the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: <REPLACE WITH HOSTNAME FROM ABOVE - for Redis on Kubernetes it is redis-master.default.svc.cluster.local:6379>
  - name: redisPassword
    secretKeyRef:
      name: redis
      key: redis-password
```

This example uses the the kubernetes secret that was created when setting up a cluster with the above instructions.

{{% alert title="Other stores" color="primary" %}}
If using a state store other than Redis, refer to the [supported state stores]({{< ref supported-state-stores >}}) for information on what options to set.
{{% /alert %}}

### Create Pub/sub message broker component

Create a file called redis-pubsub.yaml, and paste the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: default
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: <REPLACE WITH HOSTNAME FROM ABOVE - for Redis on Kubernetes it is redis-master.default.svc.cluster.local:6379>
  - name: redisPassword
    secretKeyRef:
      name: redis
      key: redis-password
```

This example uses the the kubernetes secret that was created when setting up a cluster with the above instructions.

{{% alert title="Other stores" color="primary" %}}
If using a pub/sub message broker other than Redis, refer to the [supported pub/sub message brokers]({{< ref supported-pubsub >}}) for information on what options to set.
{{% /alert %}}

### Hard coded passwords (not recommended)

For development purposes only you can skip creating kubernetes secrets and place passwords directly into the Dapr component file:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: <HOST>
  - name: redisPassword
    value: <PASSWORD>
```

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: default
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: <HOST>
  - name: redisPassword
    value: <PASSWORD>
```

## 应用配置

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}

By default the Dapr CLI creates a local Redis instance when you run `dapr init`. However, if you want to configure a different Redis instance you can either: However, if you want to configure a different Redis instance you can either:
- Update the existing component files or create new ones in the default components directory
   - **Linux/MacOS:** `$HOME/.dapr/components`
   - **Windows:** `%USERPROFILE%\.dapr\components`
- Create a new `components` directory in your app folder containing the YAML files and provide the path to the `dapr run` command with the flag `--components-path`

{{% alert title="Self-hosted slim mode" color="primary" %}}
If you initialized Dapr in [slim mode]({{< ref self-hosted-no-docker.md >}}) (without Docker) you need to manually create the default directory, or always specify a components directory using `--components-path`.
{{% /alert %}}

{{% /codetab %}}

{{% codetab %}}

Run `kubectl apply -f <FILENAME>` for both state and pubsub files:

```bash
kubectl apply -f redis-state.yaml
kubectl apply -f redis-pubsub.yaml
```
{{% /codetab %}}

{{< /tabs >}}

## 下一步
- [Try out a Dapr quickstart]({{< ref quickstarts.md >}})