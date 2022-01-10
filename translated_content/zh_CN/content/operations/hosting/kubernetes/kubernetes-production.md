---
type: docs
title: "Kubernetes生产环境配置指南"
linkTitle: "生产环境配置指南"
weight: 40000
description: "在生产环境中将 Dapr 部署到 Kubernetes 集群的建议和做法"
---

## 集群能力要求

对于生产环境部署的Kubernetes集群，建议你运行一个至少由3个工作节点组成的集群，以支持高可用的控制平面安装。 可以以下面的资源设置起步。 要求会根据集群大小和其他因素而有所不同，因此需要进行单独测试，以找到适合你的环境的值。

*注：有关 CPU 和内存资源单位及其含义的更多信息，请参见[这个](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#resource-units-in-kubernetes)链接。*

| Deployment           | CPU                       | Memory                       |
| -------------------- | ------------------------- | ---------------------------- |
| **Operator**         | Limit: 1, Request: 100m   | Limit: 200Mi, Request: 100Mi |
| **Sidecar Injector** | Limit: 1, Request: 100m   | Limit: 200Mi, Request: 30Mi  |
| **Sentry**           | Limit: 1, Request: 100m   | Limit: 200Mi, Request: 30Mi  |
| **放置**               | Limit: 1, Request: 250m   | Limit: 150Mi, Request: 75Mi  |
| **Dashboard**        | Limit: 200m, Request: 50m | Limit: 200Mi, Request: 20Mi  |

### Helm

使用 Helm 安装 Dapr 时，没有默认限制/请求值。 每个组件都有一个`resources`选项(例如，`dapr_dashboard.resources`)，你可以用它来调整Dapr控制平面以适应你的环境。 [Helm chart readme](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md)有详细的信息和示例。 在本机/开发环境安装的时候，你可以跳过配置`resources`选项。

### 可选组件

下面的 Dapr 控制平面deployment是可选的：

- **Placement**-用于Dapr Actors
- **Sentry** - 用于服务间调用的mTLS
- **Dashboard** - 用于集群的操作视图

## Sidecar 资源设置

To set the resource assignments for the Dapr sidecar, see the annotations [here]({{< ref "arguments-annotations-overview.md" >}}). 与资源约束相关的具体注解如下:

- `dapr.io/sidecar-cpu-limit`
- `dapr.io/sidecar-memory-limit`
- `dapr.io/sidecar-cpu-request`
- `dapr.io/sidecar-memory-request`

如果没有设置，dapr 边车将在没有资源配置的情况下运行，这可能会引起问题。 在生产环境下安装时，强烈建议调整这些配置。

有关在 Kubernetes 中配置资源的详细信息，请参见 [将内存资源分配给容器和 Pods](https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/)和 [将 CPU 资源分配给容器和 Pods](https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/)。

在生产环境中，dapr 边车的设置示例:

| CPU                        | Memory                        |
| -------------------------- | ----------------------------- |
| Limit: 300m, Request: 100m | Limit: 1000Mi, Request: 250Mi |

*注意：由于Dapr的目的是为了替你的应用程序完成大部分的I/O任务，因此给Dapr的资源能让您大幅减少其他应用程序的资源分配。*

上面的CPU和内存限制是出于Dapr存在大量的I/O密集型操作的考虑。 It is strongly recommended that you use a monitoring tool to baseline the sidecar (and app) containers and tune these settings based on those baselines.

## 高可用模式

When deploying Dapr in a production-ready configuration, it's recommended to deploy with a highly available (HA) configuration of the control plane, which creates 3 replicas of each control plane pod in the dapr-system namespace. This configuration allows for the Dapr control plane to survive node failures and other outages.

For a new Dapr deployment, the HA mode can be set with both the [Dapr CLI]({{< ref "kubernetes-deploy.md#install-in-highly-available-mode" >}}) and with [Helm charts]({{< ref "kubernetes-deploy.md#add-and-install-dapr-helm-chart" >}}).

For an existing Dapr deployment, enabling the HA mode requires additional steps. Please refer to [this paragraph]({{< ref "#enabling-high-availability-in-an-existing-dapr-deployment" >}}) for more details.

## 用Helm部署Dapr

For a full guide on deploying Dapr with Helm visit [this guide]({{< ref "kubernetes-deploy.md#install-with-helm-advanced" >}}).

### 参数文件
建议创建一个文件来存储值，而不是在命令行中指定参数。 这个文件应当应用代码版本控制，这样你就可以跟踪对它的修改。

关于您可以在 值文件中设置的所有可用选项的完整列表（或使用 `--set` 命令行选项），请参阅 https://github.com/dapr/dapr/blob/master/charts/dapr/README.md。

你也可以不使用`helm install`或`helm upgrade`，如下图所示，你可以运行`helm upgrade --install` - 这将动态地决定是安装还是升级。

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

该命令将为dapr-system命名空间中每个控制平面service创建3个副本。

*Dapr Cli 和 Dapr Helm 图表都会自动关联地部署到带有标签`kubernetes.io/os=linux`的节点上。 你可以将Dapr控制平面部署到Windows节点，但大多数用户应该不需要。 For more information see [Deploying to a Hybrid Linux/Windows K8s Cluster]({{< ref "kubernetes-hybrid-clusters.md" >}})*

## 用 Helm 升级 Dapr

Dapr支持零停机升级， 升级包括以下步骤： 升级包括以下步骤：

1. 升级CLI版本(可选但推荐)
2. 更新Dapr control plane
3. 更新数据平面(Dapr sidecars)

### 升级CLI

要升级 Dapr CLI，[下载 CLI 的最新版本](https://github.com/dapr/cli/releases)，并确保它在您的当前路径中。

### 更新Dapr control plane

See [steps to upgrade Dapr on a Kubernetes cluster]({{< ref "kubernetes-upgrade.md#helm" >}}).

### 更新数据平面(sidecar)

最后一步是更新正在运行Dapr的pod，以接替新版本的Dapr运行时。 要完成这一步，只需对有`dapr.io/enabled`注解的任何deployment发送rollout restart命令即可。

```bash
kubectl rollout restart deploy/<Application deployment name>
```

要查看所有已启用Dapr的deployment列表，您可以使用[Dapr Dashboard](https://github.com/dapr/dashboard)或使用Dapr CLI运行以下命令。

```bash
dapr list -k

APP ID     APP PORT  AGE  CREATED
nodeapp    3000      16h  2020-07-29 17:16.22
```

### Enabling high-availability in an existing Dapr deployment

Enabling HA mode for an existing Dapr deployment requires two steps.

First, delete the existing placement stateful set:
```bash
kubectl delete statefulset.apps/dapr-placement-server -n dapr-system
```
Second, issue the upgrade command:
```bash
helm upgrade dapr ./charts/dapr -n dapr-system --set global.ha.enabled=true
```

The reason for deletion of the placement stateful set is because in the HA mode, the placement service adds [Raft](https://raft.github.io/) for leader election. However, Kubernetes only allows for limited fields in stateful sets to be patched, subsequently failing upgrade of the placement service.

Deletion of the existing placement stateful set is safe. The agents will reconnect and re-register with the newly created placement service, which will persist its table in Raft.

## 建议的安全配置

当正确配置时，Dapr可确保安全通信， 它还可以通过一些内置的功能使你的应用更加安全。 它还可以通过一些内置的功能使你的应用更加安全。

建议生产环境的部署涵盖以下设置：

1. **启用相互验证 (mTLS)**。 请注意，Dapr默认开启了mTLS。 For details on how to bring your own certificates, see [here]({{< ref "mtls.md#bringing-your-own-certificates" >}})

2. **启用Dapr to App API验证**。 这是你的应用程序和Dapr边车之间的通信。 这能确保Dapr知道它正在与授权的应用程序通信。 See [enable API token authentication in Dapr]({{< ref "api-token.md" >}}) for details

3. **启用Dapr to App API验证**。 这是你的应用程序和Dapr边车之间的通信。 这能确保Dapr知道它正在与授权的应用程序通信。 See [Authenticate requests from Dapr using token authentication]({{< ref "app-api-token.md" >}}) for details

4. 所有的组件YAML都应该把**密钥数据配置在密钥存储中**，而不是硬编码在YAML文件中。 See [here]({{< ref "component-secrets.md" >}}) on how to use secrets with Dapr components

5. Dapr **控制平面安装在一个专用的命名空间**上，如`dapr-system`。

6. Dapr还支持**框定应用程序的组件范围**。 这不是必要的，可以根据您的安全需求启用。 See [here]({{< ref "component-scopes.md" >}}) for more info.


## 追踪和度量配置

Dapr 默认启用追踪和度量。 *建议*在生产环境中为您的应用程序和Dapr控制平面设置分布式追踪和度量。

如果你已经有了自己的可观察测性支持组件，你可以禁用Dapr的追踪和度量。

### 追踪
To configure a tracing backend for Dapr visit [this]({{< ref "setup-tracing.md" >}}) link.

### 度量
对于度量，Dapr在9090端口上暴露了一个Prometheus端点，可以被Prometheus收集。

To setup Prometheus, Grafana and other monitoring tools with Dapr, visit [this]({{< ref "monitoring" >}}) link.

## Best Practices
Watch this video for a deep dive into the best practices for running Dapr in production with Kubernetes

<div class="embed-responsive embed-responsive-16by9"> <iframe width="360" height="315" src="https://www.youtube.com/embed/_U9wJqq-H1g" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen mark="crwd-mark"></iframe>
