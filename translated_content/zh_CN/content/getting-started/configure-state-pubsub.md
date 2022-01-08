---
type: docs
title: "如何操作：配置 状态存储 和 发布/订阅 消息代理"
linkTitle: "(可选) 配置 状态 & 发布/订阅"
weight: 400
description: "配置Dapr的状态存储和 发布/订阅 消息代理"
aliases:
  - /zh-hans/getting-started/configure-redis/
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
作为初始化过程的一部分，Dapr CLI 会自动在自托管环境中安装 Redis。 您都已设置完毕，可以跳转到\[下一步\](下一步)
{{% /codetab %}}

{{% codetab %}}
我们可以使用 [Helm](https://helm.sh/) 在 Kubernetes 集群中快速创建一个 Redis 实例。 此方法需要 [安装 Helm v3](https://github.com/helm/helm#install)。

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
    redis-replicas-0    1/1     Running   0          69s
    redis-replicas-1    1/1     Running   0          22s
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
1. 注意GCP门户中的Redis主机名，以便以后使用。
1. 创建一个Kubernetes密钥来存储您的 Redis 密码：
   ```bash
   kubectl create secret generic redis --from-literal=redis-password=*********
   ```
{{% /codetab %}}

{{< /tabs >}}

## 配置 Dapr 组件

Dapr 使用组件来定义用于构建块功能的资源。 这些步骤通过如何将你上面创建的资源连接到Dapr的 状态 和 发布/订阅 。

在自托管模式下，组件文件自动创建以下内容：
- **Windows**: `%USERPROFILE%\.dapr\components\`
- **Linux/MacOS**: `$HOME/.dapr/components`

对于Kubernetes来说，文件可以在任何目录下创建，因为它们是用`kubectl`应用的。

### 创建 状态 存储组件

创建名为 `redis-state.yaml` 的文件, 并粘贴以下内容:

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

这个例子使用了kubernetes secret，它是在使用上面的指令设置集群时创建的。

{{% alert title="Other stores" color="primary" %}}
如果使用 Redis 以外的其他状态存储，请参考 [支持的状态存储]({{< ref supported-state-stores >}})，了解要设置哪些选项。
{{% /alert %}}

### 创建 发布/订阅 消息代理组件

创建名为 redis-pubsub.yaml 的文件, 并粘贴以下内容:

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

这个例子使用了kubernetes secret，它是在使用上面的指令设置集群时创建的。

{{% alert title="Other stores" color="primary" %}}
如果使用 Redis 以外的 发布/订阅 消息代理，请参考 [支持的 发布/订阅 消息代理]({{< ref supported-pubsub >}})，了解要设置哪些选项。
{{% /alert %}}

### 硬编码密码（不推荐）

仅用于开发目的，你可以跳过创建 kubernetes 密钥，直接将密码放入 Dapr 组件文件中。

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

默认情况下，当你运行 `dapr init` 时，CLI 创建一个本地的 Redis 实例。 但是，如果你想要配置一个不同的 Redis 实例你可以：
- 更新现有的组件文件或在默认的组件目录下创建新的组件文件。
   - **Linux/MacOS:** `$HOME/.dapr/components`
   - **Windows:** `%USERPROFILE%\.dapr\components`
- 在你的应用程序文件夹中创建一个新的`components`目录，其中包含YAML文件，并提供`dapr run`命令的路径，标志为`--components-path`。

{{% alert title="Self-hosted slim mode" color="primary" %}}
如果你在 [Slim模式]({{< ref self-hosted-no-docker.md >}})下初始化了Dapr (不使用Docker)，你需要手动创建默认目录， 或者总是使用 `--components-path` 指定组件目录。
{{% /alert %}}

{{% /codetab %}}

{{% codetab %}}

运行 `kubectl apply -f <FILENAME>` 同时适用于 状态文件 和 发布订阅文件：

```bash
kubectl apply -f redis-state.yaml
kubectl apply -f redis-pubsub.yaml
```
{{% /codetab %}}

{{< /tabs >}}

## 下一步
- [试用Dapr快速入门]({{< ref quickstarts.md >}})
