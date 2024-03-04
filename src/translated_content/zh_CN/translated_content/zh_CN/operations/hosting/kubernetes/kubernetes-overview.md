---
type: docs
title: "Kubernetes 上的 Dapr 概述"
linkTitle: "概述"
weight: 10000
description: "如何在 Kubernetes 集群中运行 Dapr 的概述"
---

Dapr can be configured to run on any supported versions of Kubernetes. To achieve this, Dapr begins by deploying the following Kubernetes services, which provide first-class integration to make running applications with Dapr easy.

| Kubernetes services     | 说明                                                                                                                                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dapr-operator`         | Manages [component]({{< ref components >}}) updates and Kubernetes services endpoints for Dapr (state stores, pub/subs, etc.)                                                                                                                                             |
| `dapr-sidecar-injector` | Injects Dapr into [annotated](#adding-dapr-to-a-kubernetes-deployment) deployment pods and adds the environment variables `DAPR_HTTP_PORT` and `DAPR_GRPC_PORT` to enable user-defined applications to easily communicate with Dapr without hard-coding Dapr port values. |
| `dapr-placement`        | Used for [actors]({{< ref actors >}}) only. Creates mapping tables that map actor instances to pods                                                                                                                                                                       |
| `dapr-sentry`           | Manages mTLS between services and acts as a certificate authority. For more information read the [security overview]({{< ref "security-concept.md" >}})                                                                                                                   |

<img src="/images/overview-kubernetes.png" width=1000>

## 支持的版本
只要 Kubernetes 符合 [Kubernetes Version Skew Policy](https://kubernetes.io/releases/version-skew-policy)，Dapr 就能被支持。

## 在 Kubernetes 集群上部署 Dapr

Read [Deploy Dapr on a Kubernetes cluster]({{< ref kubernetes-deploy.md >}}) to learn how to deploy Dapr to your Kubernetes cluster.

## 将 Dapr 添加到 Kubernetes deployment

Deploying and running a Dapr-enabled application into your Kubernetes cluster is as simple as adding a few annotations to the pods schema. For example, in the following example, your Kubernetes pod is annotated to:
- Give your service an `id` and `port` known to Dapr
- Turn on tracing through configuration
- Launch the Dapr sidecar container

```yml
  annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "nodeapp"
    dapr.io/app-port: "3000"
    dapr.io/config: "tracing"
```

For more information, check [Dapr annotations]({{< ref arguments-annotations-overview.md >}}).

## 从私有仓库拉取镜像

Dapr 可与任何用户应用程序容器镜像无缝协作，无论其来源如何。 Simply [initialize Dapr]({{< ref install-dapr-selfhost.md >}}) and add the [Dapr annotations]({{< ref arguments-annotations-overview.md >}}) to your Kubernetes definition to add the Dapr sidecar.

The Dapr control plane and sidecar images come from the [daprio Docker Hub](https://hub.docker.com/u/daprio) container registry, which is a public registry.

For information about:
- Pulling your application images from a private registry, reference the [official Kubernetes documentation](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/).
- Using Azure Container Registry with Azure Kubernetes Service, reference the [AKS documentation](https://docs.microsoft.com/azure/aks/cluster-container-registry-integration).

## 教程

[Work through the Hello Kubernetes tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes) to learn more about getting started with Dapr on your Kubernetes cluster.

## 相关链接

- [Deploy Dapr to a Kubernetes cluster]({{< ref kubernetes-deploy >}})
- [更新 Kubernetes 集群中的 dapr]({{< ref kubernetes-upgrade >}})
- [Kubernetes 的 Dapr 生产环境配置指南]({{< ref kubernetes-production.md >}})
- [Dapr Kubernetes 快速入门](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)
- [使用 Bridge to Kubernetes 在连接到 Kubernetes 集群情况下，在本地调试 Dapr 应用程序]({{< ref bridge-to-kubernetes >}})
