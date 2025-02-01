---
type: docs
title: "命名空间中的actor"
linkTitle: "命名空间中的actor"
weight: 40
description: "了解命名空间中的actor"
---

在Dapr中，命名空间用于提供隔离，从而支持多租户。通过为actor添加命名空间，相同的actor类型可以部署在不同的命名空间中。您可以在同一命名空间中使用这些actor的实例。

{{% alert title="注意" color="primary" %}}
每个命名空间中的actor部署必须使用独立的状态存储，特别是在相同的actor类型跨多个命名空间使用时。换句话说，actor记录中不包含任何命名空间信息，因此每个命名空间需要单独的状态存储。请参阅[为命名空间配置actor状态存储]({{< ref "#configuring-actor-state-stores-for-namespacing" >}})部分以获取示例。
{{% /alert %}}

## 创建和配置命名空间

您可以在自托管模式或Kubernetes上使用命名空间。

{{< tabs "自托管" "Kubernetes">}}

{{% codetab %}}
在自托管模式下，您可以通过设置[`NAMESPACE`环境变量]({{< ref environment.md >}})为Dapr实例指定命名空间。

{{% /codetab %}}

{{% codetab %}}
在Kubernetes上，您可以在部署actor应用程序时创建和配置命名空间。例如，使用以下`kubectl`命令开始：

```bash
kubectl create namespace namespace-actorA
kubectl config set-context --current --namespace=namespace-actorA
```

然后，将您的actor应用程序部署到此命名空间中（在示例中为`namespace-actorA`）。

{{% /codetab %}}

{{< /tabs >}}

## 为命名空间配置actor状态存储

每个命名空间中的actor部署**必须**使用独立的状态存储。虽然您可以为每个actor命名空间使用不同的物理数据库，但某些状态存储组件提供了一种通过表、前缀、集合等逻辑分隔数据的方法。这允许您在多个命名空间中使用相同的物理数据库，只要您在Dapr组件定义中提供逻辑分隔即可。

以下是一些示例。

### 示例1：通过etcd中的前缀

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.etcd
  version: v2
  metadata:
  - name: endpoints
    value: localhost:2379
  - name: keyPrefixPath
    value: namespace-actorA
  - name: actorStateStore
    value: "true"
```

### 示例2：通过SQLite中的表名

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.sqlite
  version: v1
  metadata:
  - name: connectionString
    value: "data.db"
  - name: tableName
    value: "namespace-actorA"
  - name: actorStateStore
    value: "true"
```

### 示例3：通过Redis中的逻辑数据库编号

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
  - name: actorStateStore
    value: "true"
  - name: redisDB
    value: "1"
  - name: redisPassword
    secretKeyRef:
      name: redis-secret
      key:  redis-password
  - name: actorStateStore
    value: "true"
  - name: redisDB
    value: "1"
auth:
  secretStore: <SECRET_STORE_NAME>
```

查看您的[状态存储组件规格]({{< ref supported-state-stores.md >}})以了解其提供的功能。

{{% alert title="注意" color="primary" %}}
命名空间中的actor使用多租户Placement服务。在这个控制平面服务中，每个应用程序部署都有自己的命名空间，属于命名空间"ActorA"的应用程序的sidecar不会接收到命名空间"ActorB"的应用程序的placement信息。
{{% /alert %}}

## 下一步
- [了解更多关于Dapr Placement服务的信息]({{< ref placement.md >}})
- [Placement API参考指南]({{< ref placement_api.md >}})