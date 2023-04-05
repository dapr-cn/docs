---
type: docs
title: "教程：配置状态存储和pub/sub消息代理"
linkTitle: "配置 state & pub/sub"
weight: 400
description: "配置Dapr的状态存储和 发布/订阅 消息代理"
aliases:
  - /zh-hans/getting-started/tutorials/configure-redis/
---

要启动并运行状态和Pub/sub构建块，您需要两个组件：

- 用于持久化和恢复的状态存储组件。
- 作为pub/sub的消息代理组件，用于异步式的消息传递。

支持的组件的完整列表可以在这里找到：
- [支持的状态存储]({{< ref supported-state-stores >}})
- [支持的 发布/订阅 消息代理]({{< ref supported-pubsub >}})

在本教程中，我们将描述如何启动和运行 Redis。

### 第 1 步：创建 Redis 存储

Dapr 可以使用任何 Redis 实例：

- 在本地开发计算机上容器化，或
- 托管的云服务。

如果您已经有了Redis存储，请转到 [配置](#configure-dapr-components) 部分。

{{< tabs "Self-Hosted" "Kubernetes" "Azure" "AWS" "GCP" >}}

{{% codetab %}}
作为初始化过程的一部分，Dapr CLI 会自动在自托管环境中安装 Redis。 您已经准备就绪了！ 跳到 [下一步](#next-steps)。
{{% /codetab %}}

{{% codetab %}}
您可以使用 [Helm](https://helm.sh/) 在我们的 Kubernetes 集群中创建 Redis 实例。 在开始之前， [安装 Helm v3](https://github.com/helm/helm#install)。

安装 Redis 到您的集群：

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm install redis bitnami/redis
```

对于 Dapr 的发布/订阅功能，您至少需要 Redis 5 版本。 对于状态存储，您可以使用较低版本。

运行`kubectl get pods`来查看现在正在集群中运行的Redis容器。

```bash
$ kubectl get pods
NAME             READY   STATUS    RESTARTS   AGE
redis-master-0   1/1     Running   0          69s
redis-replicas-0    1/1     Running   0          69s
redis-replicas-1    1/1     Running   0          22s
```

对于 Kubernetes：
- 主机名是 `redis-master.default.svc.cluster.local:6379`
- 密钥 `redis` 是自动创建的。

{{% /codetab %}}

{{% codetab %}}
验证你是否有 [Azure订阅](https://azure.microsoft.com/free/)。

1. 打开并登录到 [Azure 门户](https://ms.portal.azure.com/#create/Microsoft.Cache) 来启动 Azure Redis 缓存创建流程。
1. 填写必要的信息.
   - Dapr Pub/sub使用 [Redis streams](https://redis.io/topics/streams-intro) ，这是由Redis 5.0引入的。 若要将 Azure Redis 缓存用于 Pub/sub，请将版本设置为 *(PREVIEW) 6*。
1. 点击 **创建** ，启动Redis实例的部署。
1. 记下 Azure 门户中 **概述** 页面中的 Redis 实例主机名，以备后用。
   - 它看起来像 `xxxxxx.redis.cache.windows.net:6380`。
1. 创建实例后，获取您的访问密钥：
   1. 导航到 **设置**下的 **访问密钥**。
   1. 创建一个Kubernetes密钥来存储您的 Redis 密码：

      ```bash
      kubectl create secret generic redis --from-literal=redis-password=*********
      ```

{{% /codetab %}}

{{% codetab %}}

1. 从 [AWS Redis](https://aws.amazon.com/redis/) 部署 Redis 实例。
1. 记下 AWS 门户中的 Redis 主机名，以便以后使用。
1. 创建一个Kubernetes密钥来存储您的 Redis 密码：

   ```bash
   kubectl create secret generic redis --from-literal=redis-password=*********
   ```

{{% /codetab %}}

{{% codetab %}}

1. 从 [GCP Cloud MemoryStore](https://cloud.google.com/memorystore/) 部署 MemoryStore 实例。
1. 记下 GCP 门户中的 Redis 主机名，以便以后使用。
1. 创建一个Kubernetes密钥来存储您的 Redis 密码：

   ```bash
   kubectl create secret generic redis --from-literal=redis-password=*********
   ```

{{% /codetab %}}

{{< /tabs >}}

### 第 2 步：配置 Dapr 组件

Dapr 定义了用于使用组件构建块功能的资源。 这些步骤通过如何将你上面创建的资源连接到Dapr的 状态 和 发布/订阅 。

#### 找到您的组件文件

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}

在自托管模式下，组件文件自动创建以下内容：
- **Windows**: `%USERPROFILE%\.dapr\components\`
- **Linux/MacOS**: `$HOME/.dapr/components`

{{% /codetab %}}

{{% codetab %}}

由于 Kubernetes 文件使用 `kubectl`应用，因此可以在任何目录中创建它们。

{{% /codetab %}}

{{< /tabs >}}

#### 创建 状态 存储组件

创建名为 `redis-state.yaml` 的文件, 并粘贴以下内容:

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}

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
    value: localhost:6379
  - name: redisPassword
    secretKeyRef:
      name: redis
      key: redis-password
  # uncomment below for connecting to redis cache instances over TLS (ex - Azure Redis Cache)
  # - name: enableTLS
  #   value: true 
```

{{% /codetab %}}

{{% codetab %}}

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
  # uncomment below for connecting to redis cache instances over TLS (ex - Azure Redis Cache)
  # - name: enableTLS
  #   value: true 
```

请注意，上面的代码示例使用您之前在设置集群时创建的 Kubernetes 密钥。

{{% /codetab %}}

{{< /tabs >}}

{{% alert title="Other stores" color="primary" %}}
如果使用 Redis 以外的其他状态存储，请参考[支持的状态存储]({{< ref supported-state-stores >}})，了解要设置的选项信息。
{{% /alert %}}

#### 创建 发布/订阅 消息代理组件

创建名为 `redis-pubsub.yaml` 的文件，并粘贴以下内容：

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}

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
    value: localhost:6379
  - name: redisPassword
    secretKeyRef:
      name: redis
      key: redis-password
 # uncomment below for connecting to redis cache instances over TLS (ex - Azure Redis Cache)
  # - name: enableTLS
  #   value: true 
```

{{% /codetab %}}

{{% codetab %}}

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
 # uncomment below for connecting to redis cache instances over TLS (ex - Azure Redis Cache)
  # - name: enableTLS
  #   value: true 
```

请注意，上面的代码示例使用您之前在设置集群时创建的 Kubernetes 密钥。

{{% /codetab %}}

{{< /tabs >}}

{{% alert title="Other stores" color="primary" %}}
如果使用 Redis 以外的发布/订阅消息代理，请参考[支持的发布/订阅消息代理]({{< ref supported-pubsub >}})，了解要设置的选项信息。
{{% /alert %}}

#### 硬编码密码（不推荐）

*仅*出于开发目的，您可以跳过创建 Kubernetes secrets，并将密码直接放入 Dapr 组件文件中：

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
  # uncomment below for connecting to redis cache instances over TLS (ex - Azure Redis Cache)
  # - name: enableTLS
  #   value: true 
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
  # uncomment below for connecting to redis cache instances over TLS (ex - Azure Redis Cache)
  # - name: enableTLS
  #   value: true 
```

### 第 3 步：应用配置

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}

当你运行 `dapr init`时，Dapr 在你的本地机器上创建一个默认的 redis `pubsub.yaml`。 通过打开您的组件目录进行验证：

- 在Windows上，在 `%UserProfile%\.dapr\components\pubsub.yaml`
- 在Linux/MacOS上，在 `~/.dapr/components/pubsub.yaml`

对于新的组件文件：

1. 在包含 YAML 文件的应用文件夹中创建一个新的 `components` 目录。
1. 使用标志 `--components-path` 提供 `dapr run` 命令的路径

如果你在 [Slim 模式]({{< ref self-hosted-no-docker.md >}})下初始化了 Dapr (不使用 Docker)，你需要手动创建默认目录， 或者始终使用 `--components-path` 指定组件目录。

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
[试用Dapr快速入门]({{< ref quickstarts.md >}})
