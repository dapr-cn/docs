---
type: docs
title: "Kubernetes上的 Dapr 概述"
linkTitle: "概述"
weight: 10000
description: "如何在 Kubernetes 集群中运行 Dapr 的概述"
---

## Kubernetes上的 Dapr

Dapr can be configured to run on any supported versions of Kubernetes. 为了实现这一目标，Dapr首先部署了`dapr-sidecar-injector`、`dapr-operator`、`dapr-placement`和`dapr-sentry`Kubernetes服务。 这些都提供了一流的集成，使Dapr的应用运行变得简单。
- **dapr-operator:** Manages [component]({{< ref components >}}) updates and Kubernetes services endpoints for Dapr (state stores, pub/subs, etc.)
- **dapr-sidecar-injector:** 将 Dapr 注入 [annotated](#adding-dapr-to-a-kubernetes-deployment) deployment pods，并添加环境变量 `DAPR_HTTP_PORT` 和 `DAPR_GRPC_PORT`，以使用户定义的应用程序能够轻松地与 Dapr 通信，而无需硬编码 Dapr 端口值。
- **dapr-placement:** Used for [actors]({{< ref actors >}}) only. 创建映射表，将 actor 实例映射到 pods。
- **dapr-sentry:** 管理服务之间的mTLS并作为证书颁发机构。 For more information read the [security overview]({{< ref "security-concept.md" >}}).

<img src="/images/overview_kubernetes.png" width=800>

## 在 Kubernetes 集群上部署 Dapr

Read [this guide]({{< ref kubernetes-deploy.md >}}) to learn how to deploy Dapr to your Kubernetes cluster.

## 将 Dapr 添加到 Kubernetes deployment

在 Kubernetes 集群中部署和运行启用 Dapr 的应用程序非常简单，只需向 deployment 方案添加一些注解。 要给您的服务提供一个 `id` 和 `port` 已知的 Dapr, 通过配置进行追踪并启动 Dapr sidecar 容器, 你要像这样注释你的 Kubernetes deployment。 For more information check  [dapr annotations]({{< ref arguments-annotations-overview.md >}})

```yml
  annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "nodeapp"
    dapr.io/app-port: "3000"
    dapr.io/config: "tracing"
```

## 入门项

您可以 [在这里](https://github.com/dapr/quickstarts/tree/master/hello-kubernetes) 看到一些例子，在 Kubernetes 的入门示例中。

## Supported versions
Dapr is tested and supported on the following versions of Kubernetes.

| Supported Kubernetes versions |
| ----------------------------- |
| 1.17.x and above              |


## 相关链接

- [将 dapr 部署到 Kubernetes 集群]({{< ref kubernetes-deploy >}})
- [更新 Kubernetes 集群中的 Dapr]({{< ref kubernetes-upgrade >}})
- [Kubernetes 的 Dapr 生产环境配置指南]({{< ref kubernetes-production.md >}})
- [Dapr Kubernetes 快速入门](https://github.com/dapr/quickstarts/tree/master/hello-kubernetes)
- [Use Bridge to Kubernetes to debug Dapr apps locally, while connected to your Kubernetes cluster]({{< ref bridge-to-kubernetes >}})
