---
type: docs
title: "Kubernetes 生产环境配置指南"
linkTitle: "生产环境配置指南"
weight: 40000
description: "在生产环境中将 Dapr 部署到 Kubernetes 集群的建议和做法"
---

## 集群能力要求

对于生产环境部署的 Kubernetes 集群，建议你运行一个至少由3个工作节点组成的集群，以支持高可用的控制平面安装。 可以以下面的资源设置起步。 要求会根据集群大小和其他因素而有所不同，因此需要进行单独测试，以找到适合你的环境的值。

*注：有关 CPU 和内存资源单位及其含义的更多信息，请参见[这个](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#resource-units-in-kubernetes)链接。*

| Deployment           | CPU                       | Memory                       |
| -------------------- | ------------------------- | ---------------------------- |
| **Operator**         | Limit: 1, Request: 100m   | Limit: 200Mi, Request: 100Mi |
| **Sidecar Injector** | Limit: 1, Request: 100m   | Limit: 200Mi, Request: 30Mi  |
| **Sentry**           | Limit: 1, Request: 100m   | Limit: 200Mi, Request: 30Mi  |
| **Placement**        | Limit: 1, Request: 250m   | Limit: 150Mi, Request: 75Mi  |
| **Dashboard**        | Limit: 200m, Request: 50m | Limit: 200Mi, Request: 20Mi  |

### Helm

使用 Helm 安装 Dapr 时，没有默认限制/请求值。 每个组件都有一个 `resources` 选项(例如，`dapr_dashboard.resources`)，你可以用它来调整 Dapr 控制平面以适应你的环境。 [Helm chart readme](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md) 有详细的信息和示例。 在本机/开发环境安装的时候，你可以跳过配置 `resources` 选项。

### 可选组件

下面的 Dapr 控制平面 deployment 是可选的：

- **Placement**-用于Dapr Actor
- **Sentry** - 用于服务间调用的 mTLS
- **Dashboard** - 用于集群的操作视图

## Sidecar 资源设置

要为 Dapr sidecar 设置资源分配，请参阅[此处]({{< ref "arguments-annotations-overview.md" >}})。 与资源约束相关的具体注解如下:

- `dapr.io/sidecar-cpu-limit`
- `dapr.io/sidecar-memory-limit`
- `dapr.io/sidecar-cpu-request`
- `dapr.io/sidecar-memory-request`

如果没有设置，dapr sidecar 将在没有资源配置的情况下运行，这可能会引起问题。 在生产环境下安装时，强烈建议调整这些配置。

有关在 Kubernetes 中配置资源的详细信息，请参见[将内存资源分配给容器和 Pods](https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/) 和[将 CPU 资源分配给容器和 Pods](https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/)。

在生产环境中，dapr sidecar 的设置示例：

| CPU                        | Memory                        |
| -------------------------- | ----------------------------- |
| Limit: 300m, Request: 100m | Limit: 1000Mi, Request: 250Mi |

*注意：由于 Dapr 的目的是为了替你的应用程序完成大部分的 I/O 任务，因此给 Dapr 的资源能让您大幅减少其他应用程序的资源分配。*

上面的CPU和内存限制是出于Dapr存在大量的I/O密集型操作的考虑。 强烈建议你使用监控工具对 sidecar (和应用) 容器进行基准监控，并根据基准来调整这些设置。

## 高可用模式

当在生产环境中部署 Dapr 时，建议使用控制平面的高可用 (HA) 配置进行部署，将会在 dapr-system 命名空间中为每个控制平面 pod 创建3个副本。 此配置允许 Dapr 控制平面在节点故障和其他中断中幸存下来。

对于新部署的 Dapr ，高可用模式可以通过 [Dapr CLI]({{< ref "kubernetes-deploy.md#install-in-highly-available-mode" >}}) 和 [Helm charts]({{< ref "kubernetes-deploy.md#add-and-install-dapr-helm-chart" >}}) 来设置。

对于已部署的 Dapr，启用高可用模式需要执行额外的步骤。 更多详细信息，请参阅 [本段]({{< ref "#enabling-high-availability-in-an-existing-dapr-deployment" >}}) 。

## 用 Helm 部署 Dapr

有关使用 Helm 部署 Dapr 的完整指南，请访问[本指南]({{< ref "kubernetes-deploy.md#install-with-helm-advanced" >}}).

### 参数文件
建议创建一个文件来存储值，而不是在命令行中指定参数。 这个文件应当应用代码版本控制，这样你就可以跟踪对它的修改。

关于您可以在值文件中设置的所有可用选项的完整列表（或使用 `--set` 命令行选项），请参阅 https://github.com/dapr/dapr/blob/master/charts/dapr/README.md。

你也可以不使用 `helm install` 或 `helm upgrade`，如下图所示，你可以运行 `helm upgrade --install` - 这将动态地决定是安装还是升级。

```bash
# add/update the helm repo
helm repo add dapr https://dapr.github.io/helm-charts/
helm repo update

# See which chart versions are available
helm search repo dapr --devel --versions

# create a values file to store variables
touch values.yml
cat << EOF >> values.yml
global:
  ha:
    enabled: true
EOF

# run install/upgrade
helm install dapr dapr/dapr \
  --version=<Dapr chart version> \
  --namespace dapr-system \
  --create-namespace \
  --values values.yml \
  --wait

# verify the installation
kubectl get pods --namespace dapr-system
```

该命令将为 dapr-system 命名空间中每个控制平面 service 创建3个副本。

*Dapr Cli 和 Dapr Helm 图表都会自动关联地部署到带有标签 `kubernetes.io/os=linux` 的节点上。 您可以将 Dapr 控制平面部署到 Windows 节点，但大多数用户应该不需要这样做。 更多信息参见[部署到 Linux/Windows Kubernetes 的混合集群]({{< ref "kubernetes-hybrid-clusters.md" >}})。*

## 用 Helm 升级 Dapr

Dapr 支持零停机升级， 升级包括以下步骤： 升级包括以下步骤：

1. 升级CLI版本(可选但推荐)
2. 更新 Dapr 控制平面
3. 更新数据平面(Dapr sidecar)

### 升级 CLI

要升级 Dapr CLI，[下载 CLI 的最新版本](https://github.com/dapr/cli/releases)，并确保它在您的当前路径中。

### 更新 Dapr 控制平面

请参阅 [在 Kubernetes 集群上升级 Dapr 的步骤]({{< ref "kubernetes-upgrade.md#helm" >}})。

### 更新数据平面（sidecar）

最后一步是更新正在运行 Dapr 的 pod，以接替新版本的 Dapr 运行时。 要完成这一步，只需对有 `dapr.io/enabled` 注解的任何 deployment 发送 rollout restart 命令即可。

```bash
kubectl rollout restart deploy/<Application deployment name>
```

要查看所有已启用 Dapr 的 deployment 列表，您可以使用 [Dapr Dashboard](https://github.com/dapr/dashboard) 或使用 Dapr CLI 运行以下命令：

```bash
dapr list -k

APP ID     APP PORT  AGE  CREATED
nodeapp    3000      16h  2020-07-29 17:16.22
```

### 在现有 Dapr 部署中启用高可用

在现有 Dapr 部署中启用高可用模式需要两步。

首先，删除已有的 placement 有状态集合：
```bash
kubectl delete statefulset.apps/dapr-placement-server -n dapr-system
```
其次，执行升级命令：
```bash
helm upgrade dapr ./charts/dapr -n dapr-system --set global.ha.enabled=true
```

删除 Placement 状态集的原因是，在高可用模式下，Placement 服务为 Leader 选举添加 [Raft](https://raft.github.io/)。 然而，Kubernetes 仅允许在状态集中更新有限的字段，从而导致 Placement 服务更新失败。

删除现有的 Placement 状态集是安全的。 代理将重新连接并重新注册新创建的 Placement 服务，该服务会将表持久化在 Raft 中。

## 建议的安全配置

当正确配置时，Dapr 可确保安全通信。 它还可以通过一些内置的功能使你的应用更加安全。

建议生产环境的部署涵盖以下设置：

1. **启用双向验证 (mTLS)**。 请注意，Dapr 默认开启了 mTLS。 有关如何携带自定义证书的详细信息，请参见 [这里]({{< ref "mtls.md#bringing-your-own-certificates" >}})。

2. **启用应用到 dapr 的 API 验证**。 这是应用程序和 Dapr sidecar 之间的通信。 为了保护 Dapr API 免受未经授权的应用程序访问，建议启用 Dapr 基于令牌的身份验证。 有关详细信息，请参阅[在 Dapr 中启用 API 令牌身份验证]({{< ref "api-token.md" >}})

3. **启用 Dapr 到应用的 API 验证**。 这是 Dapr 和应用之间的通信。 这能确保 Dapr 知道它正在与授权的应用程序通信。 请参阅 [使用令牌认证对来自 Dapr 的请求进行认证]({{< ref "app-api-token.md" >}}) 了解详情

4. 所有的组件 YAML 都应该把**秘密数据配置在秘密存储中**，而不是硬编码在 YAML 文件中。 请参阅 [此处]({{< ref "component-secrets.md" >}}秘密)，了解如何在 Dapr 组件中使用秘密。

5. Dapr **控制平面安装在专用的命名空间**上，如 `dapr-system`。

6. Dapr 还支持**框定应用程序的组件范围**。 这不是必需的做法，可以根据您的安全需求启用。 请参阅 [此处]({{< ref "component-scopes.md" >}}) 以获取更多信息。


## 追踪和度量配置

Dapr 默认启用追踪和度量。 *建议*在生产环境中为您的应用程序和 Dapr 控制平面设置分布式追踪和度量。

如果你已经有了自己的可观察测性支持组件，你可以禁用 Dapr 的追踪和度量。

### 追踪
要为 Dapr 配置追踪后端，请访问[这个]({{< ref "setup-tracing.md" >}})链接。

### 度量
对于度量，Dapr 在 9090 端口上暴露了 Prometheus 端点，可以被 Prometheus 收集。

要为 Dapr 配置 Prometheus、Grafana 和其他监控工具，请访问 [这个]({{< ref "monitoring" >}})链接。

## 最佳实践
观看此视频，深入了解使用 Kubernetes 中在生产环境中运行 Dapr 的最佳实践

<div class="embed-responsive embed-responsive-16by9">
<iframe width="360" height="315" src="https://www.youtube.com/embed/_U9wJqq-H1g" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
