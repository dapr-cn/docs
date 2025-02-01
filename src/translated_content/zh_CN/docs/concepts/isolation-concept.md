---
type: docs
title: "隔离"
linkTitle: "隔离"
weight: 700
description: Dapr 如何提供命名空间和隔离
---

Dapr 的命名空间功能提供了隔离和多租户支持，增强了安全性。通常，应用程序和组件会被部署到命名空间中，以便在特定环境中实现隔离，例如在 Kubernetes 中。

Dapr 支持在以下场景中使用命名空间：应用程序之间的服务调用、访问组件、在消费者组中发送 pubsub 消息以及 actor 类型的部署。无论是在自托管模式还是 Kubernetes 模式下，命名空间隔离都受到支持。

要开始使用，请先创建并配置您的命名空间。

{{< tabs "自托管" "Kubernetes">}}

{{% codetab %}}

在自托管模式下，通过设置 `NAMESPACE` 环境变量为 Dapr 实例指定命名空间。

{{% /codetab %}}

{{% codetab %}}

在 Kubernetes 上，创建并配置命名空间：

```bash
kubectl create namespace namespaceA
kubectl config set-context --current --namespace=namespaceA
```

然后将您的应用程序部署到此命名空间中。

{{% /codetab %}}

{{< /tabs >}}

了解如何在 Dapr 中全面使用命名空间：

- [服务调用命名空间]({{< ref service-invocation-namespaces.md >}})
- [如何设置 pubsub 命名空间消费者组]({{< ref howto-namespace.md >}})
- 组件：
  - [如何配置具有多个命名空间的 pubsub 组件]({{< ref pubsub-namespaces.md >}})
  - [将组件限定到一个或多个应用程序]({{< ref component-scopes.md >}})
- [命名空间的 actor]({{< ref namespaced-actors.md >}})
