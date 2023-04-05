---
type: docs
title: "Kubernetes 上的 Dapr 概述"
linkTitle: "概述"
weight: 10000
description: "如何在 Kubernetes 集群中运行 Dapr 的概述"
---

## Dapr on Kubernetes

Dapr can be configured to run on any supported versions of Kubernetes. To achieve this, Dapr begins by deploying the `dapr-sidecar-injector`, `dapr-operator`, `dapr-placement`, and `dapr-sentry` Kubernetes services. These provide first-class integration to make running applications with Dapr easy.
- **dapr-operator:** Manages [component]({{< ref components >}}) updates and Kubernetes services endpoints for Dapr (state stores, pub/subs, etc.)
- **dapr-sidecar-injector:** Injects Dapr into [annotated](#adding-dapr-to-a-kubernetes-deployment) deployment pods and adds the environment variables `DAPR_HTTP_PORT` and `DAPR_GRPC_PORT` to enable user-defined applications to easily communicate with Dapr without hard-coding Dapr port values.
- **dapr-placement:** Used for [actors]({{< ref actors >}}) only. Creates mapping tables that map actor instances to pods
- **dapr-sentry:** Manages mTLS between services and acts as a certificate authority. For more information read the [security overview]({{< ref "security-concept.md" >}}).

<img src="/images/overview-kubernetes.png" width=1000>

## 在 Kubernetes 集群上部署 Dapr

阅读 [本指南]({{< ref kubernetes-deploy.md >}}) 来学习如何将 Dapr 部署到您的 Kubernetes 集群。

## 将 Dapr 添加到 Kubernetes deployment

在 Kubernetes 集群中部署和运行启用 Dapr 的应用程序非常简单，只需向 pod 方案添加一些注解。 要给您的服务提供一个 `id` 和 `port` 已知的 Dapr, 通过配置进行追踪并启动 Dapr sidecar 容器, 你要像这样注释你的 Kubernetes pod。 更多信息请查看[dapr 注解]({{< ref arguments-annotations-overview.md >}})。

```yml
  annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "nodeapp"
    dapr.io/app-port: "3000"
    dapr.io/config: "tracing"
```

## 从私有仓库拉取镜像

Dapr 可与任何用户应用程序容器镜像无缝协作，无论其来源如何。 简单的初始化 Dapr 并添加 [Dapr 注解]({{< ref arguments-annotations-overview.md >}}) 到您的 Kubernetes 定义即可添加 Dapr Sidecar。

Dapr 控制平面和 sidecar 镜像来自公共的 [daprio Docker Hub](https://hub.docker.com/u/daprio).

从私有仓库中拉取应用程序映像的有关信息，请参阅 [Kubernetes 文档](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/)。 如果您在 Azure Kubernetes Service 中使用 Azure Container Registry，请参考 [AKS 文档](https://docs.microsoft.com/azure/aks/cluster-container-registry-integration).

## Quickstart

您可以 [在这里](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes) 看到一些例子，在 Kubernetes 的入门示例中。

## 支持的版本
只要 Kubernetes 符合 [Kubernetes Version Skew Policy](https://kubernetes.io/releases/version-skew-policy)，Dapr 就能被支持。

## 相关链接

- [Deploy Dapr to a Kubernetes cluster]({{< ref kubernetes-deploy >}})
- [更新 Kubernetes 集群中的 dapr]({{< ref kubernetes-upgrade >}})
- [Kubernetes 的 Dapr 生产环境配置指南]({{< ref kubernetes-production.md >}})
- [Dapr Kubernetes 快速入门](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)
- [使用 Bridge to Kubernetes 在连接到 Kubernetes 集群情况下，在本地调试 Dapr 应用程序]({{< ref bridge-to-kubernetes >}})
