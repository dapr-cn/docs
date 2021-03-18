---
type: docs
title: "操作：配置具有多个命名空间的 Pub/Sub 组件"
linkTitle: "Multiple namespaces"
weight: 20000
description: "多个命名空间下使用Dapr Pub/Sub"
---

在某些场景下，应用程序分布在不同的命名空间，并通过PubSub共享一个队列或主题。 在这种情况下，必须在每个命名空间上都提供PubSub组件。

{{% alert title="Note" color="primary" %}}
命名空间是一个Dapr里的，用于确定应用程序和组件的作用范围概念。 这个例子使用的是Kubernetes的命名空间，然而Dapr组件的命名空间范围可以在任何支持的平台上使用。 请阅读[指南：将组件作用范围限定到一个或多个应用程序]({< ref "component-scopes.md" >}})，以了解更多关于组件作用范围限定的信息。
{{% /alert %}}

这个例子使用了[PubSub示例](https://github.com/dapr/quickstarts/tree/master/pub-sub)。 Redis安装和其订阅者在`namespace-a`中，而发布者UI在`namespace-b`中。 如果Redis安装在另一个命名空间上，或者使用Azure ServiceBus、AWS SNS/SQS或GCP PubSub等云服务，该解决方案也同样奏效。

这是一个使用命名空间的示例图片。

<img src="/images/pubsub-multiple-namespaces.png" width=1000>
<br></br>

下表描述了部署的资源和所在命名空间的对应关系：

| 资源                      | namespace-a | namespace-b |
| ----------------------- | ----------- | ----------- |
| Redis master            | X           |             |
| Redis slave             | X           |             |
| Dapr's PubSub component | X           | X           |
| Node subscriber         | X           |             |
| Python subscriber       | X           |             |
| React UI publisher      |             | X           |

## 前提

* [Dapr installed on Kubernetes]({{< ref "kubernetes-deploy.md" >}}) in any namespace since Dapr works at the cluster level.
* Checkout and cd into the directory for [PubSub quickstart](https://github.com/dapr/quickstarts/tree/master/pub-sub).

## Setup `namespace-a`

Create namespace and switch kubectl to use it.
```
kubectl create namespace namespace-a
kubectl config set-context --current --namespace=namespace-a
```

Install Redis (master and slave) on `namespace-a`, following [these instructions]({{< ref "configure-state-pubsub.md" >}}).

Now, configure `deploy/redis.yaml`, paying attention to the hostname containing `namespace-a`.

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

Deploy resources to `namespace-a`:
```
kubectl apply -f deploy/redis.yaml
kubectl apply -f deploy/node-subscriber.yaml
kubectl apply -f deploy/python-subscriber.yaml
```

## Setup `namespace-b`

Create namespace and switch kubectl to use it.
```
kubectl create namespace namespace-b
kubectl config set-context --current --namespace=namespace-b
```

Deploy resources to `namespace-b`, including the Redis component:
```
kubectl apply -f deploy/redis.yaml
kubectl apply -f deploy/react-form.yaml
```

Now, find the IP address for react-form, open it on your browser and publish messages to each topic (A, B and C).
```
kubectl get service -A
```

## Confirm subscribers received the messages.

Switch back to `namespace-a`:
```
kubectl config set-context --current --namespace=namespace-a
```

Find the POD names:
```
kubectl get pod # Copy POD names and use in the next commands.
```

Display logs:
```
kubectl logs node-subscriber-XYZ node-subscriber
kubectl logs python-subscriber-XYZ python-subscriber
```

The messages published on the browser should show in the corresponding subscriber's logs. The messages published on the browser should show in the corresponding subscriber's logs. The Node.js subscriber receives messages of type "A" and "B", while the Python subscriber receives messages of type "A" and "C".

## Clean up

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
- [Use secret scoping]({{< ref "secrets-scopes.md" >}})
- [Limit the secrets that can be read from secret stores]({{< ref "secret-scope.md" >}})
