---
type: docs
title: "How-To: 限定组件作用范围在一或多个应用"
linkTitle: "设置组件作用域"
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

例如，将此组件 `production` 命名空间中
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

## Using namespaces with service invocation

When using service invocation an application in a namespace you have to qualify it with the namespace. For example calling the `ping` method on `myapp` which is scoped to the `production` namespace would be like this.

```bash
https://localhost:3500/v1.0/invoke/myapp.production/method/ping
```

Or using a curl command from an external DNS address, in this case `api.demo.dapr.team` would be like this.

MacOS/Linux:
```
curl -i -d '{ "message": "hello" }' \
     -H "Content-type: application/json" \
     -H "dapr-api-token: ${API_TOKEN}" \
     https://api.demo.dapr.team/v1.0/invoke/myapp.production/method/ping
```

## Using namespaces with pub/sub
Read [Pub/Sub and namespaces]({{< ref "component-scopes.md" >}}) for more information on scoping components.

## Application access to components with scopes

Developers and operators might want to limit access for one database to a certain application, or a specific set of applications. To achieve this, Dapr allows you to specify `scopes` on the component YAML. Application scopes added to a component limit only the applications with specific IDs to be able to use the component.

The following example shows how to give access to two Dapr enabled apps, with the app IDs of `app1` and `app2` to the Redis component named `statestore` which itself is in the `production` namespace

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

## 示例 <iframe width="560" height="315" src="https://www.youtube.com/embed/8W-iBDNvCUM?start=1763" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen mark="crwd-mark"></iframe>

## 相关链接

- [Configure Pub/Sub components with multiple namespaces]({{< ref "pubsub-namespaces.md" >}})
- [Use secret scoping]({{< ref "secrets-scopes.md" >}})
- [Limit the secrets that can be read from secret stores]({{< ref "secret-scope.md" >}})