---
type: docs
title: "操作方法：配置具有多个命名空间的 Pub/Sub 组件"
linkTitle: "多个命名空间"
weight: 10000
description: "多个命名空间下使用 Dapr Pub/Sub"
---

In some scenarios, applications can be spread across namespaces and share a queue or topic via PubSub. In this case, the PubSub component must be provisioned on each namespace.

{{% alert title="Note" color="primary" %}}
命名空间是用于确定应用程序和组件作用域的 Dapr 概念。 这个例子使用的是Kubernetes的命名空间，然而Dapr组件的命名空间范围可以在任何支持的平台上使用。 有关确定组件范围的详细信息，请参阅[操作方法：将组件限定为一个或多个应用程序]({{< ref "component-scopes.md" >}}) 。
{{% /alert %}}

This example uses the [PubSub sample](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub). Redis 安装和订阅服务器位于 ` namespace-a` 中，而发布者 UI 位于 `namespace-b`。 如果 Redis 安装在另一个命名空间上，或者使用 Azure ServiceBus、AWS SNS/SQS 或 GCP PubSub 等云服务，该解决方案也同样奏效。

这是使用命名空间的示例图片。

<img src="/images/pubsub-multiple-namespaces.png" width=1000>
<br></br>

下表描述了部署的资源和所在命名空间的对应关系：

| Resource                | namespace-a | namespace-b |
| ----------------------- | ----------- | ----------- |
| Redis master            | X           |             |
| Redis replicas          | X           |             |
| Dapr's PubSub component | X           | X           |
| Node subscriber         | X           |             |
| Python subscriber       | X           |             |
| React UI publisher      |             | X           |

## 前提

* [Dapr installed on Kubernetes]({{< ref "kubernetes-deploy.md" >}}) in any namespace since Dapr works at the cluster level.
* Checkout and cd into the directory for [PubSub quickstart](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub).

## 设置 `namespace-a`

创建命名空间并切换 kubectl 以使用它。
```
kubectl create namespace namespace-a
kubectl config set-context --current --namespace=namespace-a
```

遵循[这些说明]({{< ref "getting-started/tutorials/configure-state-pubsub.md" >}})，在 `namespace-a` 上安装 Redis（主从）。

现在，配置 `deploy/redis.yaml`，注意包含 `namespace-a` 的主机名。

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

创建命名空间并切换 kubectl 以使用它。
```
kubectl create namespace namespace-b
kubectl config set-context --current --namespace=namespace-b
```

将资源部署到 `namespace-b`，包括 Redis 组件：
```
kubectl apply -f deploy/redis.yaml
kubectl apply -f deploy/react-form.yaml
```

现在，找到 react-form 的IP地址，在浏览器上打开它，并将消息发布到每个主题（A、B、C）。
```
kubectl get service -A
```

## 确认订阅者已收到消息。

切换回 `namespace-a`:
```
kubectl config set-context --current --namespace=namespace-a
```

查找 POD 名称：
```
kubectl get pod # 复制POD名称并在接下来的命令中使用。
```

显示日志：
```
kubectl logs node-subscriber-XYZ node-subscriber
kubectl logs python-subscriber-XYZ python-subscriber
```

在浏览器上发布的消息应显示在相应订阅者的日志中。 Node.js订阅者接收的消息类型为 "A" 和 "B"，而 Python 订阅者接收的消息类型为 "A" 和 "C"。

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

- [Scope components to one or more applications]({{< ref "component-scopes.md" >}})
- [使用秘密范围]({{< ref "secrets-scopes.md" >}})
- [限制可以从秘密仓库中读取的秘密]({{< ref "secret-scope.md" >}})
