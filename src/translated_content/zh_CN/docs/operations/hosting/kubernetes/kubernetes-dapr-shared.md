---
type: docs
title: "使用 Dapr Shared 部署 Dapr 到每个节点或每个集群"
linkTitle: "Dapr Shared"
weight: 50000
description: "了解如何使用 Dapr Shared 作为 sidecar 的替代部署方式"

---

Dapr 会自动为您的应用程序注入一个 sidecar，以启用 Dapr API，从而实现最佳的可用性和可靠性。

Dapr Shared 提供了两种替代的部署策略：通过 Kubernetes 的 `DaemonSet` 实现每节点部署，或通过 `Deployment` 实现每集群部署。

- **`DaemonSet`:** 当以 Kubernetes 的 `DaemonSet` 资源运行 Dapr Shared 时，daprd 容器会在集群中的每个 Kubernetes 节点上运行。这可以减少应用程序与 Dapr 之间的网络延迟。
- **`Deployment`:** 当以 Kubernetes 的 `Deployment` 运行 Dapr Shared 时，Kubernetes 调度器会决定 daprd 容器实例在集群中的哪个节点上运行。

{{% alert title="Dapr Shared 部署" color="primary" %}}
对于您部署的每个 Dapr 应用程序，您需要使用不同的 `shared.appId` 来部署 Dapr Shared Helm chart。
{{% /alert %}}



## 为什么选择 Dapr Shared？

默认情况下，当 Dapr 安装到 Kubernetes 集群中时，Dapr 控制平面会将 Dapr 作为 sidecar 注入到带有 Dapr 注释（`dapr.io/enabled: "true"`）的应用程序中。sidecar 提供了许多优势，包括提高弹性，因为每个应用程序都有一个实例，并且应用程序与 sidecar 之间的所有通信都无需经过网络。

<img src="/images/dapr-shared/sidecar.png" width=800 style="padding-bottom:15px;">

虽然 sidecar 是 Dapr 的默认部署方式，但某些用例需要其他方法。假设您希望将工作负载的生命周期与 Dapr API 解耦。一个典型的例子是函数或函数即服务（FaaS）运行时，它可能会自动缩减您的空闲工作负载以释放资源。在这种情况下，可能需要将 Dapr API 和所有 Dapr 异步功能（如订阅）分开。

Dapr Shared 是为这些场景而创建的，扩展了 Dapr sidecar 模型，提供了两种新的部署方法：`DaemonSet`（每节点）和 `Deployment`（每集群）。

{{% alert title="重要" color="primary" %}}
无论您选择哪种部署方法，重要的是要理解在大多数用例中，每个服务（app-id）都有一个 Dapr Shared 实例（Helm 发布）。这意味着如果您的应用程序由三个微服务组成，建议每个服务都有自己的 Dapr Shared 实例。您可以通过尝试 [Hello Kubernetes with Dapr Shared 教程](https://github.com/dapr/dapr-shared/blob/main/docs/tutorial/README.md) 来看到这一点。
{{% /alert %}}


### `DeamonSet`（每节点）

使用 Kubernetes `DaemonSet`，您可以定义需要在集群中每个节点上部署一次的应用程序。这使得在同一节点上运行的应用程序可以与本地 Dapr API 通信，无论 Kubernetes `Scheduler` 将您的工作负载调度到哪里。

<img src="/images/dapr-shared/daemonset.png" width=800 style="padding-bottom:15px;">

{{% alert title="注意" color="primary" %}}
由于 `DaemonSet` 在每个节点上安装一个实例，与每集群部署的 `Deployment` 相比，它在集群中消耗更多资源，但具有提高弹性的优势。
{{% /alert %}}


### `Deployment`（每集群）

Kubernetes `Deployments` 每个集群安装一次。根据可用资源，Kubernetes `Scheduler` 决定工作负载在哪个节点上调度。对于 Dapr Shared，这意味着您的工作负载和 Dapr 实例可能位于不同的节点上，这可能会引入相当大的网络延迟，但资源使用减少。

<img src="/images/dapr-shared/deployment.png" width=800 style="padding-bottom:15px;">

## 开始使用 Dapr Shared

{{% alert title="先决条件" color="primary" %}}
在安装 Dapr Shared 之前，请确保您已在集群中[安装 Dapr]({{< ref "kubernetes-deploy.md" >}})。
{{% /alert %}}

如果您想开始使用 Dapr Shared，可以通过安装官方 Helm Chart 创建一个新的 Dapr Shared 实例：

```
helm install my-shared-instance oci://registry-1.docker.io/daprio/dapr-shared-chart --set shared.appId=<DAPR_APP_ID> --set shared.remoteURL=<REMOTE_URL> --set shared.remotePort=<REMOTE_PORT> --set shared.strategy=deployment
```

您的 Dapr 启用应用程序现在可以通过将 Dapr SDK 指向或发送请求到 Dapr Shared 实例暴露的 `my-shared-instance-dapr` Kubernetes 服务来使用 Dapr Shared 实例。

> 上述 `my-shared-instance` 是 Helm Chart 发布名称。

如果您使用 Dapr SDK，可以为您的应用程序设置以下环境变量以连接到 Dapr Shared 实例（在此情况下，运行在 `default` 命名空间中）：

```
        env:
        - name: DAPR_HTTP_ENDPOINT
          value: http://my-shared-instance-dapr.default.svc.cluster.local:3500
        - name: DAPR_GRPC_ENDPOINT
          value: http://my-shared-instance-dapr.default.svc.cluster.local:50001 
```

如果您不使用 SDK，可以向这些端点发送 HTTP 或 gRPC 请求。

## 下一步

- 尝试 [Hello Kubernetes with Dapr Shared 教程](https://github.com/dapr/dapr-shared/blob/main/docs/tutorial/README.md)。
- 在 [Dapr Shared 仓库](https://github.com/dapr/dapr-shared/blob/main/README.md)中阅读更多内容。
