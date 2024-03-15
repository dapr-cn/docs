---
type: docs
title: 教程：配置状态存储和pub/sub消息代理
linkTitle: 配置状态 & 发布/订阅
weight: 80
description: 配置Dapr的状态存储和pub/sub消息代理
aliases:
  - /zh-hans/getting-started/tutorials/configure-redis/
---

要启动并运行状态和Pub/sub构建块，您需要两个组件：

- 用于持久化和还原状态的状态存储组件
- 作为pub/sub的消息代理组件，用于异步式的消息传递。

支持的组件的完整列表可以在这里找到：

- [Supported state stores]({{< ref supported-state-stores >}})
- [支持的发布/订阅消息代理]({{< ref supported-pubsub >}})

在本教程中，我们将描述如何启动和运行 Redis。

### 第 1 步：创建 Redis 存储

Dapr 可以使用任何 Redis 实例：

- 在本地开发计算机上容器化，或
- 托管的云服务。

如果您已经有了 Redis 存储，请转到 [配置](#configure-dapr-components) 部分。



{{% codetab %}}
作为初始化过程的一部分，Dapr CLI 会自动在自托管环境中安装 Redis。 您已经准备就绪了！ 跳到 [下一步](#next-steps)。
{{% /codetab %}}

{{% codetab %}}
您可以使用[Helm](https://helm.sh/)在我们的Kubernetes集群中创建一个Redis实例。 开始之前，[安装 Helm v3](https://github.com/helm/helm#install)。

安装 Redis 到您的集群：

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm install redis bitnami/redis --set image.tag=6.2
```

对于 Dapr 的发布/订阅功能，您至少需要 Redis 版本 5。 对于状态存储，您可以使用较低版本。
请注意，添加 `--set architecture=standalone` 到 `install` 命令创建一个单副本 Redis 设置，如果您在本地环境中工作，它可以节省内存和资源。

运行 `kubectl get pods` 命令来查看现在在你的集群中运行的Redis容器：

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



{{% codetab %}}
验证你是否有 Azure订阅.

1. 打开并登录[Azure 门户](https://ms.portal.azure.com/#create/Microsoft.Cache)，开始创建 Azure Redis Cache 流程。
2. 填写必要的信息.
   - Dapr发布/订阅使用由Redis 5.0引入的[Redis streams](https://redis.io/topics/streams-intro)。 要使用 Azure Redis Cache 进行发布/订阅，请将版本设置为 _(PREVIEW) 6_。
3. 点击**创建**，启动Redis实例的部署。
4. 记下 Azure 门户中概述页面中的 Redis 实例主机名，以备后用。
   - 它应该看起来像`xxxxxx.redis.cache.windows.net:6380`。
5. 创建实例后，获取您的访问密钥：
   1. 导航到 **设置** 下的 **访问密钥**。
   2. 创建一个 Kubernetes secret 来存储您的 Redis 密码：

      ```bash
      kubectl create secret generic redis --from-literal=redis-password=*********
      ```



{{% codetab %}}

1. 从[AWS Redis](https://aws.amazon.com/redis/)部署一个Redis实例。
2. 记下 AWS 门户中的 Redis 主机名，以便以后使用。
3. 创建一个 Kubernetes secret 来存储您的 Redis 密码：

   ```bash
   kubectl create secret generic redis --from-literal=redis-password=*********
   ```



{{% codetab %}}

1. 从[GCP云内存存储](https://cloud.google.com/memorystore/)部署一个MemoryStore实例。
2. 记下 GCP 门户中的 Redis 主机名，以便以后使用。
3. 创建一个 Kubernetes secret 来存储您的 Redis 密码：

   ```bash
   kubectl create secret generic redis --from-literal=redis-password=*********
   ```



{{< /tabs >}}

### 第 2 步：配置 Dapr 组件

Dapr 定义了用于使用组件构建块功能的资源。 这些步骤将介绍如何将上面创建的资源连接到 Dapr 以进行状态和发布/订阅。

#### 找到您的组件文件



{{% codetab %}}

在自托管模式下，组件文件在以下位置自动创建：

- **Windows**: `%USERPROFILE%\.dapr\components\`
- **Linux/MacOS**: `$HOME/.dapr/components`



{{% codetab %}}

由于 Kubernetes 文件使用 `kubectl` 应用，因此可以在任何目录中创建它们。



{{< /tabs >}}

#### 创建状态存储组件

创建一个名为`redis-state.yaml`的文件，并粘贴以下内容：



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



{{< /tabs >}}

{{% alert title="其他存储" color="primary" %}}
如果使用状态存储 Redis 以外的存储，请参考[支持的状态存储]({{< ref supported-state-stores >}}) 了解要设置的选项信息。
{{% /alert %}}

#### 创建发布/订阅消息代理组件

创建一个名为 `redis-pubsub.yaml` 的文件，并粘贴以下内容：



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



{{< /tabs >}}

{{% alert title="其他存储" color="primary" %}}
如果使用 Redis 以外的发布/订阅消息代理，请参考[支持的发布/订阅消息代理]({{< ref supported-pubsub >}}) 了解要设置的选项信息。
{{% /alert %}}

#### 硬编码密码（不推荐）

仅用于开发目的，你可以跳过创建 Kubernetes 密钥，直接将密码放入 Dapr 组件文件中：

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



{{% codetab %}}

当你运行`dapr init`时，Dapr会在你的本地机器上创建一个默认的Redis`pubsub.yaml`。 通过打开您的组件目录进行验证：

- 在Windows上，在 `%UserProfile%\.dapr\components\pubsub.yaml`
- 在Linux/MacOS上，在`~/.dapr/components/pubsub.yaml`

对于新的组件文件：

1. 在您的应用文件夹中创建一个新的 `components` 目录，其中包含 YAML 文件。
2. 使用标志 `--resources-path` 提供 `dapr run` 命令的路径

如果你在[无 Docker 的 Slim 模式]({{< ref self-hosted-no-docker.md >}})下初始化了 Dapr，你需要手动创建默认目录，或者始终使用 `--resources-path` 指定一个组件目录。



{{% codetab %}}

运行 `kubectl apply -f <FILENAME>` 同时适用于状态文件和发布订阅文件：

```bash
kubectl apply -f redis-state.yaml
kubectl apply -f redis-pubsub.yaml
```



{{< /tabs >}}

## 下一步

[尝试 Dapr 快速入门]({{< ref quickstarts.md >}})
