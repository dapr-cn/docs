---
type: docs
title: "HowTo: 配置具有多个命名空间的 Pub/Sub 组件"
linkTitle: "多个命名空间"
weight: 10000
description: "使用 Dapr Pub/Sub 与多个命名空间"
---

在某些情况下，应用程序可能会跨多个命名空间分布，并通过 PubSub 共享队列或主题。在这种情况下，需要在每个命名空间中配置 PubSub 组件。

{{% alert title="注意" color="primary" %}}
命名空间是 Dapr 用于限定应用程序和组件范围的概念。本示例使用 Kubernetes 命名空间，但 Dapr 组件命名空间范围可以在任何支持的平台上使用。阅读 [How-To: 将组件限定到一个或多个应用程序]({{< ref "component-scopes.md" >}}) 以获取有关限定组件的更多信息。
{{% /alert %}}

本示例使用 [PubSub 示例](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub)。Redis 安装和订阅者位于 `namespace-a`，而发布者 UI 位于 `namespace-b`。即使 Redis 安装在另一个命名空间，或者您使用托管云服务如 Azure ServiceBus、AWS SNS/SQS 或 GCP PubSub，该解决方案也同样适用。

以下是使用命名空间的示例图。

<img src="/images/pubsub-multiple-namespaces.png" width=1000>
<br></br>

下表显示了哪些资源部署到哪些命名空间：

| 资源                    | namespace-a | namespace-b |
|------------------------ |-------------|-------------|
| Redis 主节点            | ✅         | ❌          |
| Redis 副本              | ✅         | ❌          |
| Dapr 的 PubSub 组件     | ✅         | ✅          |
| Node 订阅者             | ✅         | ❌          |
| Python 订阅者           | ✅         | ❌          |
| React UI 发布者         | ❌         | ✅          |

{{% alert title="注意" color="primary" %}}
所有 pub/sub 组件都支持通过 [命名空间或组件范围]({{< ref pubsub-scopes.md >}}) 将 pub/sub 主题限制到特定应用程序。
{{% /alert %}}

## 前提条件

* [在 Kubernetes 上安装 Dapr]({{< ref "kubernetes-deploy.md" >}})，因为 Dapr 在集群级别工作。
* 检出并进入 [PubSub 快速入门](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub) 的目录。

## 设置 `namespace-a`

创建命名空间并切换 kubectl 使用它。
```
kubectl create namespace namespace-a
kubectl config set-context --current --namespace=namespace-a
```

在 `namespace-a` 上安装 Redis（主节点和从节点），按照[这些说明]({{< ref "getting-started/tutorials/configure-state-pubsub.md" >}})。

现在，配置 `deploy/redis.yaml`，确保主机名包含 `namespace-a`。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: "redisHost"
    value: "redis-master.namespace-a.svc:6379"
  - name: "redisPassword"
    value: "YOUR_PASSWORD"
```

将资源部署到 `namespace-a`：
```
kubectl apply -f deploy/redis.yaml
kubectl apply -f deploy/node-subscriber.yaml
kubectl apply -f deploy/python-subscriber.yaml
```

## 设置 `namespace-b`

创建命名空间并切换 kubectl 使用它。
```
kubectl create namespace namespace-b
kubectl config set-context --current --namespace=namespace-b
```

将资源部署到 `namespace-b`，包括 Redis 组件：
```
kubectl apply -f deploy/redis.yaml
kubectl apply -f deploy/react-form.yaml
```

现在，找到 react-form 的 IP 地址，在浏览器中打开它并向每个主题（A、B 和 C）发布消息。
```
kubectl get service -A
```

## 确认订阅者接收到消息。

切换回 `namespace-a`：
```
kubectl config set-context --current --namespace=namespace-a
```

找到 POD 名称：
```
kubectl get pod # 复制 POD 名称并在下一个命令中使用。
```

显示日志：
```
kubectl logs node-subscriber-XYZ node-subscriber
kubectl logs python-subscriber-XYZ python-subscriber
```

在浏览器上发布的消息应显示在相应订阅者的日志中。Node.js 订阅者接收类型为 "A" 和 "B" 的消息，而 Python 订阅者接收类型为 "A" 和 "C" 的消息。

## 清理

```
kubectl delete -f deploy/redis.yaml  --namespace namespace-a
kubectl delete -f deploy/node-subscriber.yaml  --namespace namespace-a
kubectl delete -f deploy/python-subscriber.yaml  --namespace namespace-a
kubectl delete -f deploy/react-form.yaml  --namespace namespace-b
kubectl delete -f deploy/redis.yaml  --namespace namespace-b
kubectl config set-context --current --namespace=default
kubectl delete namespace namespace-a
kubectl delete namespace namespace-b
```

## 相关链接

- [将组件限定到一个或多个应用程序]({{< ref "component-scopes.md" >}})
- [使用 secret 限定]({{< ref "secrets-scopes.md" >}})
- [限制可以从 secret 存储中读取的 secret]({{< ref "secret-scope.md" >}})