---
type: docs
title: "Kubernetes上的 Dapr 概述"
linkTitle: "概述"
weight: 10000
description: "如何在 Kubernetes 集群中运行 Dapr 的概述"
---

## Kubernetes上的 Dapr

Dapr 可以配置为在任何 Kubernetes 集群上运行。 为了实现这一目标，Dapr首先部署了`dapr-sidecar-injector`、`dapr-operator`、`dapr-placement`和`dapr-sentry`Kubernetes服务。 这些都提供了一流的集成，使Dapr的应用运行变得简单。
- **dapr-operator:** 管理 [组件]({{< ref components >}}) 更新和 Dapr 的 Kubernetes 服务终结点(状态存储、发布/订阅 等)。
- **dapr-sidecar-injector:** Injects Dapr into [annotated](#adding-dapr-to-a-kubernetes-deployment) deployment pods and adds the environment variables `DAPR_HTTP_PORT` and `DAPR_GRPC_PORT` to enable user-defined applications to easily communicate with Dapr without hard-coding Dapr port values.
- **dapr-placement:** 仅用于 [Actors]({{< ref actors >}})。 创建映射表，将 actor 实例映射到 pods。
- **dapr-sentry:** 管理服务之间的mTLS并作为证书颁发机构。 有关详细信息，请阅读[安全概述]({{< ref "security-concept.md" >}})。

<img src="/images/overview_kubernetes.png" width=800>

## 在 Kubernetes 集群上部署 Dapr

阅读 [本指南]({{< ref kubernetes-deploy.md >}}) 来学习如何将 Dapr 部署到您的 Kubernetes 集群。

## 将 Dapr 添加到 Kubernetes deployment

在 Kubernetes 集群中部署和运行启用 Dapr 的应用程序非常简单，只需向 deployment 方案添加一些注解。 要给您的服务提供一个 `id` 和 `port` 已知的 Dapr, 通过配置进行追踪并启动 Dapr sidecar 容器, 你要像这样注释你的 Kubernetes deployment。 For more information check  [dapr annotations]({{< ref kubernetes-annotations.md >}})

```yml
  annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "nodeapp"
    dapr.io/app-port: "3000"
    dapr.io/config: "tracing"
```

## 快速启动

您可以 [在这里](https://github.com/dapr/quickstarts/tree/master/hello-kubernetes) 看到一些例子，在 Kubernetes 的入门示例中。

## 相关链接

- [将 Dapr 部署到 Kubernetes 集群]({{< ref kubernetes-deploy >}})
- [更新 Kubernetes 集群中的 Dapr]({{< ref kubernetes-upgrade >}})
- [Kubernetes 的 Dapr 生产环境配置指南]({{< ref kubernetes-production.md >}})
- [Dapr Kubernetes 快速入门](https://github.com/dapr/quickstarts/tree/master/hello-kubernetes)
