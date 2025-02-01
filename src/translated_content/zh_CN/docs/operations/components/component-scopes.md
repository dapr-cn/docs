---
type: docs
title: "操作指南：将组件限定于一个或多个应用程序"
linkTitle: "限定组件访问"
weight: 400
description: "限制组件访问特定的Dapr实例"
---

Dapr组件具有命名空间（这与Kubernetes的命名空间概念不同），这意味着一个Dapr运行时实例只能访问部署在相同命名空间中的组件。

Dapr运行时，会将其配置的命名空间与加载的组件的命名空间进行匹配，并仅初始化与其命名空间匹配的组件。其他命名空间中的组件将不会被加载。

## 命名空间
命名空间可以用来限制组件对特定Dapr实例的访问。

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
在自托管模式下，开发者可以通过设置`NAMESPACE`环境变量来为Dapr实例指定命名空间。
如果设置了`NAMESPACE`环境变量，Dapr将不会加载任何在其元数据中未指定相同命名空间的组件。

例如，假设在`production`命名空间中有以下组件：
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

要告诉Dapr它被部署到哪个命名空间，设置环境变量：

MacOS/Linux:

```bash
export NAMESPACE=production
# 像往常一样运行Dapr
```
Windows:

```powershell
setx NAMESPACE "production"
# 像往常一样运行Dapr
```
{{% /codetab %}}

{{% codetab %}}
让我们考虑以下在Kubernetes中的组件：

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

在这个例子中，Redis组件仅对运行在`production`命名空间内的Dapr实例可访问。
{{% /codetab %}}

{{< /tabs >}}

{{% alert title="注意" color="primary" %}}
应用于命名空间"A"的组件YAML可以*引用*命名空间"B"中的实现。例如，命名空间"production-A"中的Redis组件YAML可以将Redis主机地址指向部署在命名空间"production-B"中的Redis实例。

参见[配置具有多个命名空间的Pub/Sub组件]({{< ref "pubsub-namespaces.md" >}})以获取示例。
{{% /alert %}}

## 应用程序对具有范围的组件的访问
开发者和操作员可能希望限制某个应用程序或一组特定应用程序对一个数据库的访问。
为实现这一点，Dapr允许您在组件YAML上指定`scopes`。添加到组件的应用程序范围仅限制具有特定ID的应用程序使用该组件。

以下示例展示了如何为两个启用Dapr的应用程序提供访问权限，这两个应用程序的ID分别为`app1`和`app2`，访问名为`statestore`的Redis组件，该组件本身位于`production`命名空间中

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
### 社区电话演示

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/8W-iBDNvCUM?start=1763" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 使用命名空间进行服务调用
阅读[跨命名空间的服务调用]({{< ref "service-invocation-namespaces.md" >}})以获取有关在服务之间调用时使用命名空间的更多信息。

## 使用命名空间进行pub/sub
阅读[配置具有多个命名空间的Pub/Sub组件]({{< ref "pubsub-namespaces.md" >}})以获取有关在pub/sub中使用命名空间的更多信息。

## 相关链接

- [配置具有多个命名空间的Pub/Sub组件]({{< ref "pubsub-namespaces.md" >}})
- [使用secret范围]({{< ref "secrets-scopes.md" >}})
- [限制可以从secret存储中读取的secret]({{< ref "secret-scope.md" >}})
