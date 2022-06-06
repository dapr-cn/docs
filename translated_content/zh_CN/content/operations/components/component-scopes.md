---
type: docs
title: "How-To: 限定组件作用范围在一或多个应用"
linkTitle: "对组件的访问范围"
weight: 300
description: "限制特定 Dapr 实例的组件访问"
---

Dapr 组件的名称空间（注意与 Kubernetes 名称空间概念区分），这意味着 Dapr runtime 实例只能访问已部署到同一名称空间的组件。

当 Dapr 运行时，它将自己的配置名称空间与其加载的组件的命名空间进行匹配，并且仅初始化与其名称空间匹配的组件。 并且不会加载不同命名空间中的所有其他组件。

## 命名空间
名称空间可用于限制组件访问特定的 Dapr 实例。

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
在自托管模式下，开发人员可以通过设置 `NAMESPACE` 环境变量来指定 Dapr 实例的名称空间。 如果设置了 `NAMESPACE` 环境变量，Dapr 只会加载其元数据中指定相同名称空间的组件。

例如，在 `production` 命名空间中给定该组件
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: production
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: redis-master:6379
```

若要告诉 Dapr 它部署到哪个名称空间，请设置环境变量：

MacOS/Linux:

```bash
export NAMESPACE=production
# run Dapr as usual
```
Windows:

```powershell
setx NAMESPACE "production"

# run Dapr as usual
```
{{% /codetab %}}

{{% codetab %}}
让我们考虑在 Kubernetes 中的以下组件：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: production
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: redis-master:6379
```

在此示例中，只有运行在 `production` 名称空间内的 Dapr 实例才能访问 Redis 组件。
{{% /codetab %}}

{{< /tabs >}}

{{% alert title="Note" color="primary" %}}
应用于名称空间“A”的组件 YAML 可以*引用*在名称空间“B”中的实现 例如，在名称空间“production-A”的 Redis 组件 YAML 可以将 Redis 主机地址指向部署在名称空间“production-B”中的 Redis实例。

有关示例，请参阅[使用多个名称空间配置 Pub/Sub 组件]({{< ref "pubsub-namespaces.md" >}})
{{% /alert %}}

## 对具有作用域的组件的应用程序访问
开发人员和运维人员可能希望将一个数据库的访问权限限制为某个应用程序或一组特定应用程序。 为此，Dapr 允许您在组件 YAML 上指定</code>scopes`作用域。 添加到组件的应用程序范围仅限制具有特定 ID 的应用程序使用该组件。</p>

<p spaces-before="0">下面的示例演示如何给予两个启用的Dapr应用访问权限， 使用 <code>app1` 和 `app2` 两个应用程序可以访问名为 `statestore` 的 Redis 组件，这个组件部署在 `production` 命名空间

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: production
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: redis-master:6379
scopes:
- app1
- app2
```
### 社区示例

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube.com/embed/8W-iBDNvCUM?start=1763" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 在服务调用时使用名称空间
有关在服务间调用时使用命名空间的详细信息，请参阅 [跨命名空间的服务调用]({{< ref "service-invocation-namespaces.md" >}}) 。

## 使用 pub/sub 的命名空间
阅读[配置具有多个命名空间的Pub/Sub组件]({{< ref "pubsub-namespaces.md" >}})以获得更多关于使用 pub/sub 命名空间的信息。

## 相关链接

- [操作：配置具有多个命名空间的 Pub/Sub 组件]({{< ref "pubsub-namespaces.md" >}})
- [使用密钥作用域]({{< ref "secrets-scopes.md" >}})
- [限制可以从密钥仓库中读取的密钥]({{< ref "secret-scope.md" >}})
