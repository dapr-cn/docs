
---
type: docs
title: "教程：配置状态存储和发布/订阅消息代理"
linkTitle: "配置状态 & 发布/订阅"
weight: 80
description: "为 Dapr 配置状态存储和发布/订阅消息代理组件"
aliases:
  - /zh-hans/getting-started/tutorials/configure-redis/
---

要使用状态和发布/订阅功能，您需要配置两个组件：

- 用于数据持久化和恢复的状态存储组件。
- 用于异步消息传递的发布/订阅消息代理组件。

您可以在以下链接找到支持的组件列表：
- [支持的状态存储]({{< ref supported-state-stores >}})
- [支持的发布/订阅消息代理]({{< ref supported-pubsub >}})

本教程将介绍如何使用 Redis 进行配置。

### 步骤 1：创建 Redis 存储

Dapr 可以使用任何 Redis 实例，无论是：

- 在本地开发环境中运行的容器化实例，还是
- 托管在云服务上的实例。

如果您已经有一个 Redis 实例，请直接跳到[配置](#configure-dapr-components)部分。

{{< tabs "自托管" "Kubernetes" "Azure" "AWS" "GCP" >}}

{{% codetab %}}
在自托管环境中，Dapr CLI 会在初始化过程中自动安装 Redis。您可以直接进行[下一步](#next-steps)。
{{% /codetab %}}

{{% codetab %}}
您可以使用 [Helm](https://helm.sh/) 在 Kubernetes 集群中创建 Redis 实例。在开始之前，请确保已[安装 Helm v3](https://github.com/helm/helm#install)。

在集群中安装 Redis：

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm install redis bitnami/redis --set image.tag=6.2
```

Dapr 的发布/订阅功能至少需要 Redis 版本 5。对于状态存储，您可以使用更低版本。
如果您在本地环境中工作，可以在 `install` 命令中添加 `--set architecture=standalone`，以创建单副本 Redis 设置，从而节省内存和资源。

运行 `kubectl get pods` 查看集群中运行的 Redis 容器：

```bash
$ kubectl get pods
NAME             READY   STATUS    RESTARTS   AGE
redis-master-0   1/1     Running   0          69s
redis-replicas-0    1/1     Running   0          69s
redis-replicas-1    1/1     Running   0          22s
```

在 Kubernetes 中：
- 主机名为 `redis-master.default.svc.cluster.local:6379`
- secret `redis` 会自动创建。

{{% /codetab %}}

{{% codetab %}}
确保您拥有 Azure 订阅。

1. 打开并登录 [Azure 门户](https://ms.portal.azure.com/#create/Microsoft.Cache) 以创建 Azure Redis 缓存。
1. 填写必要的信息。
   - Dapr 发布/订阅使用 Redis 5.0 引入的 [Redis 流](https://redis.io/topics/streams-intro)。要使用 Azure Redis 缓存进行发布/订阅，请将版本设置为 *(PREVIEW) 6*。
1. 点击 **创建** 以启动 Redis 实例的部署。
1. 从 Azure 门户的 **概览** 页面中记下 Redis 实例主机名以备后用。
   - 它应该看起来像 `xxxxxx.redis.cache.windows.net:6380`。
1. 实例创建后，获取您的访问密钥：
   1. 导航到 **设置** 下的 **访问密钥**。
   1. 创建一个 Kubernetes secret 来存储您的 Redis 密码：

      ```bash
      kubectl create secret generic redis --from-literal=redis-password=*********
      ```

{{% /codetab %}}

{{% codetab %}}

1. 从 [AWS Redis](https://aws.amazon.com/redis/) 部署一个 Redis 实例。
1. 记下 AWS 门户中的 Redis 主机名以备后用。
1. 创建一个 Kubernetes secret 来存储您的 Redis 密码：

   ```bash
   kubectl create secret generic redis --from-literal=redis-password=*********
   ```

{{% /codetab %}}

{{% codetab %}}

1. 从 [GCP Cloud MemoryStore](https://cloud.google.com/memorystore/) 部署一个 MemoryStore 实例。
1. 记下 GCP 门户中的 Redis 主机名以备后用。
1. 创建一个 Kubernetes secret 来存储您的 Redis 密码：

   ```bash
   kubectl create secret generic redis --from-literal=redis-password=*********
   ```

{{% /codetab %}}

{{< /tabs >}}

### 步骤 2：配置 Dapr 组件

Dapr 使用组件定义来管理构建块功能。以下步骤将指导您如何将上面创建的资源连接到 Dapr，以用于状态和发布/订阅。

#### 定位您的组件文件

{{< tabs "自托管" "Kubernetes" >}}

{{% codetab %}}

在自托管模式下，组件文件会自动创建在：
- **Windows**: `%USERPROFILE%\.dapr\components\`
- **Linux/MacOS**: `$HOME/.dapr/components`

{{% /codetab %}}

{{% codetab %}}

由于 Kubernetes 文件是通过 `kubectl` 应用的，因此可以在任何目录中创建。

{{% /codetab %}}

{{< /tabs >}}

#### 创建状态存储组件

创建一个名为 `redis-state.yaml` 的文件，并粘贴以下内容：

{{< tabs "自托管" "Kubernetes" >}}

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
  # 取消注释以下内容以通过 TLS 连接到 redis 缓存实例（例如 - Azure Redis 缓存）
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
  # 取消注释以下内容以通过 TLS 连接到 redis 缓存实例（例如 - Azure Redis 缓存）
  # - name: enableTLS
  #   value: true 
```

请注意，上述代码示例使用了您在设置集群时创建的 Kubernetes secret。

{{% /codetab %}}

{{< /tabs >}}

{{% alert title="其他存储" color="primary" %}}
如果使用的状态存储不是 Redis，请参考 [支持的状态存储]({{< ref supported-state-stores >}}) 以获取有关设置选项的信息。
{{% /alert %}}

#### 创建发布/订阅消息代理组件

创建一个名为 `redis-pubsub.yaml` 的文件，并粘贴以下内容：

{{< tabs "自托管" "Kubernetes" >}}

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
 # 取消注释以下内容以通过 TLS 连接到 redis 缓存实例（例如 - Azure Redis 缓存）
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
 # 取消注释以下内容以通过 TLS 连接到 redis 缓存实例（例如 - Azure Redis 缓存）
  # - name: enableTLS
  #   value: true 
```

请注意，上述代码示例使用了您在设置集群时创建的 Kubernetes secret。

{{% /codetab %}}

{{< /tabs >}}

{{% alert title="其他存储" color="primary" %}}
如果使用的发布/订阅消息代理不是 Redis，请参考 [支持的发布/订阅消息代理]({{< ref supported-pubsub >}}) 以获取有关设置选项的信息。
{{% /alert %}}

#### 硬编码密码（不推荐）

仅用于开发目的，您可以跳过创建 Kubernetes secret 并将密码直接放入 Dapr 组件文件中：

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
  # 取消注释以下内容以通过 TLS 连接到 redis 缓存实例（例如 - Azure Redis 缓存）
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
  # 取消注释以下内容以通过 TLS 连接到 redis 缓存实例（例如 - Azure Redis 缓存）
  # - name: enableTLS
  #   value: true 
```

### 步骤 3：应用配置

{{< tabs "自托管" "Kubernetes">}}

{{% codetab %}}

当您运行 `dapr init` 时，Dapr 会在您的本地机器上创建一个默认的 redis `pubsub.yaml`。通过打开您的组件目录进行验证：

- 在 Windows 上，位于 `%UserProfile%\.dapr\components\pubsub.yaml`
- 在 Linux/MacOS 上，位于 `~/.dapr/components/pubsub.yaml`

对于新的组件文件：

1. 在您的应用程序文件夹中创建一个包含 YAML 文件的 `components` 目录。
1. 使用 `--resources-path` 标志为 `dapr run` 命令提供路径

如果您在[精简模式]({{< ref self-hosted-no-docker.md >}})（无 Docker）下初始化了 Dapr，您需要手动创建默认目录，或者始终使用 `--resources-path` 指定组件目录。

{{% /codetab %}}

{{% codetab %}}

运行 `kubectl apply -f <FILENAME>` 以应用状态和发布/订阅文件：

```bash
kubectl apply -f redis-state.yaml
kubectl apply -f redis-pubsub.yaml
```

{{% /codetab %}}

{{< /tabs >}}

## 下一步
[尝试 Dapr 快速入门]({{< ref quickstarts.md >}})
