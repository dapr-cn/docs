---
type: docs
title: "教程：配置状态存储和pub/sub消息代理"
linkTitle: "配置 state & pub/sub"
weight: 400
description: "配置Dapr的状态存储和pub/sub消息代理"
aliases:
  - /zh-hans/getting-started/tutorials/configure-redis/
---

To get up and running with the state and Pub/sub building blocks, you'll need two components:

- A state store component for persistence and restoration.
- As pub/sub message broker component for async-style message delivery.

支持的组件的完整列表可以在这里找到：
- [Supported state stores]({{< ref supported-state-stores >}})
- [支持的pub/sub消息代理]({{< ref supported-pubsub >}})

在本教程中，我们将描述如何启动和运行 Redis。

### Step 1: Create a Redis store

Dapr 可以使用任何 Redis 实例：

- Containerized on your local dev machine, or
- 托管的云服务。

If you already have a Redis store, move on to the [configuration](#configure-dapr-components) section.

{{< tabs "Self-Hosted" "Kubernetes" "Azure" "AWS" "GCP" >}}

{{% codetab %}}
Redis is automatically installed in self-hosted environments by the Dapr CLI as part of the initialization process. 您已经准备就绪了！ 跳到 [下一步](#next-steps)。
{{% /codetab %}}

{{% codetab %}}
您可以使用 [Helm](https://helm.sh/) 在我们的 Kubernetes 集群中创建 Redis 实例。 在开始之前， [安装 Helm v3](https://github.com/helm/helm#install)。

Install Redis into your cluster:

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm install redis bitnami/redis --set image.tag=6.2
```

For Dapr's Pub/sub functionality, you'll need at least Redis version 5. 对于状态存储，您可以使用较低版本。 Note that adding `--set architecture=standalone` to the `install` command creates a single replica Redis setup, which can save memory and resources if you are working in a local environment.

Run `kubectl get pods` to see the Redis containers now running in your cluster:

```bash
$ kubectl get pods
NAME             READY   STATUS    RESTARTS   AGE
redis-master-0   1/1     Running   0          69s
redis-replicas-0    1/1     Running   0          69s
redis-replicas-1    1/1     Running   0          22s
```

对于 Kubernetes：
- The hostname is `redis-master.default.svc.cluster.local:6379`
- 密钥 `redis` 是自动创建的。

{{% /codetab %}}

{{% codetab %}}
Verify you have an Azure subscription.

1. Open and log into the [Azure portal](https://ms.portal.azure.com/#create/Microsoft.Cache) to start the Azure Redis Cache creation flow.
1. Fill out the necessary information.
   - Dapr Pub/sub uses [Redis streams](https://redis.io/topics/streams-intro) introduced by Redis 5.0. To use Azure Redis Cache for Pub/sub, set the version to *(PREVIEW) 6*.
1. Click **Create** to kickoff deployment of your Redis instance.
1. Make note of the Redis instance hostname from the **Overview** page in Azure portal for later.
   - It should look like `xxxxxx.redis.cache.windows.net:6380`.
1. Once your instance is created, grab your access key:
   1. Navigate to **Access Keys** under **Settings**.
   1. Create a Kubernetes secret to store your Redis password:

      ```bash
      kubectl create secret generic redis --from-literal=redis-password=*********
      ```

{{% /codetab %}}

{{% codetab %}}

1. Deploy a Redis instance from [AWS Redis](https://aws.amazon.com/redis/).
1. 记下 AWS 门户中的 Redis 主机名，以便以后使用。
1. Create a Kubernetes secret to store your Redis password:

   ```bash
   kubectl create secret generic redis --from-literal=redis-password=*********
   ```

{{% /codetab %}}

{{% codetab %}}

1. Deploy a MemoryStore instance from [GCP Cloud MemoryStore](https://cloud.google.com/memorystore/).
1. 记下 GCP 门户中的 Redis 主机名，以便以后使用。
1. Create a Kubernetes secret to store your Redis password:

   ```bash
   kubectl create secret generic redis --from-literal=redis-password=*********
   ```

{{% /codetab %}}

{{< /tabs >}}

### 第 2 步：配置 Dapr 组件

Dapr 定义了用于使用组件构建块功能的资源。 这些步骤通过如何将你上面创建的资源连接到Dapr的 state 和 pub/sub 。

#### Locate your component files

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}

In self-hosted mode, component files are automatically created under:
- **Windows**: `%USERPROFILE%\.dapr\components\`
- **Linux/MacOS**: `$HOME/.dapr/components`

{{% /codetab %}}

{{% codetab %}}

由于 Kubernetes 文件使用 `kubectl`应用，因此可以在任何目录中创建它们。

{{% /codetab %}}

{{< /tabs >}}

#### Create State store component

Create a file named `redis-state.yaml`, and paste the following:

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

#### 创建 Pub/sub 消息代理组件

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

#### Hard coded passwords (not recommended)

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

- On Windows, under `%UserProfile%\.dapr\components\pubsub.yaml`
- On Linux/MacOS, under `~/.dapr/components/pubsub.yaml`

对于新的组件文件：

1. Create a new `components` directory in your app folder containing the YAML files.
1. Provide the path to the `dapr run` command with the flag `--resources-path`

If you initialized Dapr in [slim mode]({{< ref self-hosted-no-docker.md >}}) (without Docker), you need to manually create the default directory, or always specify a components directory using `--resources-path`.

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
[Try out a Dapr quickstart]({{< ref quickstarts.md >}})
