---
type: docs
title: "Dapr 在 Kubernetes 上的概述"
linkTitle: "概述"
weight: 10000
description: "如何在 Kubernetes 集群上运行 Dapr 的概述"
---

Dapr 可以在任何支持的 Kubernetes 版本上运行。为此，Dapr 部署了一些 Kubernetes 服务，这些服务提供了良好的集成，使得在 Kubernetes 上运行 Dapr 应用程序变得简单。

| Kubernetes 服务 | 描述 |
| ------------------- | ----------- |
| `dapr-operator` | 管理 Dapr 的[组件]({{< ref components >}})更新和 Kubernetes 服务端点（如状态存储、发布/订阅等） |
| `dapr-sidecar-injector` | 将 Dapr 注入到[已标注的](#adding-dapr-to-a-kubernetes-deployment)部署 pod 中，并添加环境变量 `DAPR_HTTP_PORT` 和 `DAPR_GRPC_PORT`，以便用户应用程序可以轻松与 Dapr 通信，而无需硬编码 Dapr 端口。 |
| `dapr-placement` | 专用于[actor]({{< ref actors >}})。创建映射表，将 actor 实例映射到 pod |
| `dapr-sentry` | 管理服务之间的 mTLS 并充当证书颁发机构。更多信息请参阅[安全概述]({{< ref "security-concept.md" >}}) |

<img src="/images/overview-kubernetes.png" width=1000>

## 支持的版本
Dapr 对 Kubernetes 的支持遵循 [Kubernetes 版本偏差政策](https://kubernetes.io/releases/version-skew-policy)。

## 将 Dapr 部署到 Kubernetes 集群

阅读[在 Kubernetes 集群上部署 Dapr]({{< ref kubernetes-deploy.md >}})以了解如何将 Dapr 部署到您的 Kubernetes 集群。

## 将 Dapr 添加到 Kubernetes 部署

要在 Kubernetes 集群中部署和运行启用 Dapr 的应用程序，只需在 pod 中添加一些注释即可。例如，在以下示例中，您的 Kubernetes pod 被标注为：
- 为您的服务提供 Dapr 识别的 `id` 和 `port`
- 配置追踪功能
- 启动 Dapr sidecar 容器

```yml
  annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "nodeapp"
    dapr.io/app-port: "3000"
    dapr.io/config: "tracing"
```

有关更多信息，请查看 [Dapr 注释]({{< ref arguments-annotations-overview.md >}})。

## 从私有注册表拉取容器镜像

Dapr 可以与任何用户应用程序容器镜像无缝配合使用，无论其来源。只需[初始化 Dapr]({{< ref install-dapr-selfhost.md >}})并在 Kubernetes 定义中添加 [Dapr 注释]({{< ref arguments-annotations-overview.md >}}) 以添加 Dapr sidecar。

Dapr 控制平面和 sidecar 镜像来自 [daprio Docker Hub](https://hub.docker.com/u/daprio) 容器注册表，这是一个公共注册表。

有关以下内容的信息：
- 从私有注册表拉取您的应用程序镜像，请参考[官方 Kubernetes 文档](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/)。
- 使用 Azure 容器注册表与 Azure Kubernetes 服务，请参考 [AKS 文档](https://docs.microsoft.com/azure/aks/cluster-container-registry-integration)。

## 教程

通过[Hello Kubernetes 教程](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)了解如何在您的 Kubernetes 集群上开始使用 Dapr。

## 相关链接

- [将 Dapr 部署到 Kubernetes 集群]({{< ref kubernetes-deploy >}})
- [在 Kubernetes 集群上升级 Dapr]({{< ref kubernetes-upgrade >}})
- [Kubernetes 上 Dapr 的生产指南]({{< ref kubernetes-production.md >}})
- [Dapr Kubernetes 快速入门](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)
- [使用 Bridge to Kubernetes 在本地调试 Dapr 应用程序，同时连接到您的 Kubernetes 集群]({{< ref bridge-to-kubernetes >}})
