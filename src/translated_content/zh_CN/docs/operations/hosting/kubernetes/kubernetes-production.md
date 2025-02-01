---
type: docs
title: "Kubernetes 生产指南"
linkTitle: "生产指南"
weight: 40000
description: "在 Kubernetes 集群中以生产就绪配置部署 Dapr 的最佳实践"
---

## 集群和容量要求

Dapr 对 Kubernetes 的支持遵循 [Kubernetes 版本偏差政策](https://kubernetes.io/releases/version-skew-policy/)。

以下资源配置可作为起始参考。具体要求会因集群规模、pod 数量及其他因素而有所不同。请根据您的环境进行测试以确定合适的配置值。在生产环境中，建议不要为 Dapr 控制平面组件设置内存限制，以避免出现 `OOMKilled` pod 状态。

| 部署  | CPU | 内存
|-------------|-----|-------
| **Operator**  | 限制: 1, 请求: 100m | 请求: 100Mi
| **Sidecar Injector** | 限制: 1, 请求: 100m  | 请求: 30Mi
| **Sentry**    | 限制: 1, 请求: 100m  | 请求: 30Mi
| **Placement** | 限制: 1, 请求: 250m  | 请求: 75Mi

{{% alert title="注意" color="primary" %}}
有关更多信息，请参阅 Kubernetes 文档中的 [CPU 和内存资源单位及其含义](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#resource-units-in-kubernetes)。
{{% /alert %}}

### Helm

使用 Helm 安装 Dapr 时，默认未设置限制/请求值。每个组件都有一个 `resources` 选项（例如，`dapr_dashboard.resources`），您可以根据需要调整 Dapr 控制平面的资源配置。

[Helm chart 说明](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md) 提供了详细信息和示例。

对于本地/开发安装，您可以选择不配置 `resources` 选项。

### 可选组件

以下 Dapr 控制平面部署是可选的：

- **Placement**: 用于 Dapr actor
- **Sentry**: 用于服务到服务调用的 mTLS
- **Dashboard**: 用于集群的操作视图

## Sidecar 资源设置

[使用支持的注释设置 Dapr sidecar 的资源分配]({{< ref "arguments-annotations-overview.md" >}})。与 **资源约束** 相关的特定注释是：

- `dapr.io/sidecar-cpu-limit`
- `dapr.io/sidecar-memory-limit`
- `dapr.io/sidecar-cpu-request`
- `dapr.io/sidecar-memory-request`

如果未设置，Dapr sidecar 将在没有资源设置的情况下运行，这可能会导致问题。对于生产就绪的设置，强烈建议配置这些设置。

生产就绪设置中 Dapr sidecar 的示例设置：

| CPU | 内存 |
|-----|--------|
| 限制: 300m, 请求: 100m | 限制: 1000Mi, 请求: 250Mi

上述 CPU 和内存限制考虑了 Dapr 支持大量 I/O 绑定操作。使用 [监控工具]({{< ref observability >}}) 获取 sidecar（和应用程序）容器的基线，并根据这些基线调整这些设置。

有关在 Kubernetes 中配置资源的更多详细信息，请参阅以下 Kubernetes 指南：
- [为容器和 Pod 分配内存资源](https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/) 
- [为容器和 Pod 分配 CPU 资源](https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/)

{{% alert title="注意" color="primary" %}}
由于 Dapr 旨在为您的应用程序完成大量 I/O 工作，分配给 Dapr 的资源会大大减少应用程序的资源分配。
{{% /alert %}}

### 在 Dapr sidecar 上设置软内存限制

当您设置了内存限制时，建议在 Dapr sidecar 上设置软内存限制。使用软内存限制时，sidecar 垃圾收集器在超过限制时释放内存，而不是等待其达到运行时堆中最后一次存在的内存量的两倍。Go 的 [垃圾收集器](https://tip.golang.org/doc/gc-guide#Memory_limit) 默认会等待，这可能导致 OOM Kill 事件。

例如，对于一个内存限制设置为 1000Mi 的应用程序，其 app-id 为 `nodeapp`，您可以在 pod 注释中使用以下内容：

```yaml
  annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "nodeapp"
    # 我们的 daprd 内存设置
    dapr.io/sidecar-memory-limit: "1000Mi"   # 您的内存限制
    dapr.io/env: "GOMEMLIMIT=900MiB"         # 您内存限制的 90%。还请注意后缀 "MiB" 而不是 "Mi"
```

在此示例中，软限制设置为 90%，以留出 5-10% 给其他服务，[如推荐](https://tip.golang.org/doc/gc-guide#Memory_limit)。

`GOMEMLIMIT` 环境变量 [允许某些内存大小的后缀：`B`、`KiB`、`MiB`、`GiB` 和 `TiB`。](https://pkg.go.dev/runtime)

## 高可用模式

在生产就绪配置中部署 Dapr 时，最好以控制平面的高可用 (HA) 配置进行部署。这将在 `dapr-system` 命名空间中为每个控制平面 pod 创建三个副本，使 Dapr 控制平面能够保留三个运行实例并在单个节点故障和其他中断中幸存。

对于新的 Dapr 部署，可以通过以下两种方式设置 HA 模式：
- [Dapr CLI]({{< ref "kubernetes-deploy.md#install-in-highly-available-mode" >}})，和
- [Helm charts]({{< ref "kubernetes-deploy.md#add-and-install-dapr-helm-chart" >}})

对于现有的 Dapr 部署，[您可以通过几个额外步骤启用 HA 模式]({{< ref "#enabling-high-availability-in-an-existing-dapr-deployment" >}})。

### 单个服务 HA Helm 配置

您可以通过将 `global.ha.enabled` 标志设置为 `true` 来跨所有服务配置 HA 模式。默认情况下，`--set global.ha.enabled=true` 完全被尊重且无法覆盖，因此不可能同时将 placement 或调度服务作为单个实例。

> **注意：** 调度和 placement 服务的 HA 不是默认设置。

要独立于 `global.ha.enabled` 标志将调度和 placement 扩展到三个实例，请将 `global.ha.enabled` 设置为 `false`，并将 `dapr_scheduler.ha` 和 `dapr_placement.ha` 设置为 `true`。例如：

   ```bash
   helm upgrade --install dapr dapr/dapr \
    --version={{% dapr-latest-version short="true" %}} \
    --namespace dapr-system \
    --create-namespace \
    --set global.ha.enabled=false \
    --set dapr_scheduler.ha=true \
    --set dapr_placement.ha=true \
    --wait
   ```

## 为控制平面服务设置集群关键优先级类名称

在某些情况下，节点可能会有内存和/或 CPU 压力，Dapr 控制平面 pod 可能会被选中进行驱逐。为防止这种情况，您可以为 Dapr 控制平面 pod 设置一个关键优先级类名称。这确保了 Dapr 控制平面 pod 不会被驱逐，除非所有其他优先级较低的 pod 都被驱逐。

了解更多关于 [保护关键任务 Pod](https://kubernetes.io/blog/2023/01/12/protect-mission-critical-pods-priorityclass/) 的信息。

Kubernetes 中有两个内置的关键优先级类：
- `system-cluster-critical`
- `system-node-critical`（最高优先级）

建议将 `priorityClassName` 设置为 `system-cluster-critical` 用于 Dapr 控制平面 pod。

对于新的 Dapr 控制平面部署，可以通过 helm 值 `global.priorityClassName` 设置 `system-cluster-critical` 优先级类模式。

此优先级类可以通过 Dapr CLI 和 Helm charts 设置，
使用 helm `--set global.priorityClassName=system-cluster-critical` 参数。

#### Dapr 版本 < 1.14

对于低于 v1.14 的 Dapr 版本，建议您向 Dapr 控制平面命名空间添加 `ResourceQuota`。这可以防止与调度 pod 相关的问题 [集群可能被配置](https://kubernetes.io/docs/concepts/policy/resource-quotas/#limit-priority-class-consumption-by-default ) 限制哪些 pod 可以被分配高优先级类。对于 v1.14 及更高版本，Helm chart 会自动添加此项。

如果您在命名空间 `dapr-system` 中安装了 Dapr，您可以创建一个 `ResourceQuota`，内容如下：

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: dapr-system-critical-quota
  namespace: dapr-system
spec:
  scopeSelector:
    matchExpressions:
      - operator : In
        scopeName: PriorityClass
        values: [system-cluster-critical]
```

## 使用 Helm 部署 Dapr

[访问使用 Helm 部署 Dapr 的完整指南]({{< ref "kubernetes-deploy.md#install-with-helm-advanced" >}})。

### 参数文件

建议创建一个 values 文件，而不是在命令中指定参数。将 values 文件检入源代码控制，以便您可以跟踪其更改。

[查看可用参数和设置的完整列表](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md)。

以下命令在 `dapr-system` 命名空间中运行每个控制平面服务的三个副本。

```bash
# 添加/更新官方 Dapr Helm 仓库。
helm repo add dapr https://dapr.github.io/helm-charts/
# 或添加/更新私有 Dapr Helm 仓库。
helm repo add dapr http://helm.custom-domain.com/dapr/dapr/ \
   --username=xxx --password=xxx
helm repo update

# 查看哪些 chart 版本可用
helm search repo dapr --devel --versions

# 创建一个 values 文件来存储变量
touch values.yml
cat << EOF >> values.yml
global:
  ha:
    enabled: true
EOF

# 运行安装/升级
helm install dapr dapr/dapr \
  --version=<Dapr chart version> \
  --namespace dapr-system \
  --create-namespace \
  --values values.yml \
  --wait

# 验证安装
kubectl get pods --namespace dapr-system
```

{{% alert title="注意" color="primary" %}}
上面的示例使用 `helm install` 和 `helm upgrade`。您还可以运行 `helm upgrade --install` 来动态确定是安装还是升级。
{{% /alert %}}

Dapr Helm chart 自动部署具有 `kubernetes.io/os=linux` 标签的节点的亲和性。您可以将 Dapr 控制平面部署到 Windows 节点。有关更多信息，请参阅 [部署到混合 Linux/Windows K8s 集群]({{< ref "kubernetes-hybrid-clusters.md" >}})。

## 使用 Helm 升级 Dapr

Dapr 支持以下步骤的零停机时间升级。

### 升级 CLI（推荐）

升级 CLI 是可选的，但推荐。

1. [下载最新版本](https://github.com/dapr/cli/releases) 的 CLI。
1. 验证 Dapr CLI 是否在您的路径中。

### 升级控制平面

[在 Kubernetes 集群上升级 Dapr]({{< ref "kubernetes-upgrade.md#helm" >}})。

### 更新数据平面（sidecars）

更新运行 Dapr 的 pod 以获取 Dapr 运行时的新版本。

1. 对任何具有 `dapr.io/enabled` 注释的部署发出滚动重启命令：

   ```bash
   kubectl rollout restart deploy/<Application deployment name>
   ```

1. 通过以下任一方式查看所有启用 Dapr 的部署列表：  
   - [Dapr Dashboard](https://github.com/dapr/dashboard) 
   - 使用 Dapr CLI 运行以下命令：

      ```bash
      dapr list -k
      
      APP ID     APP PORT  AGE  CREATED
      nodeapp    3000      16h  2020-07-29 17:16.22
      ```

### 在现有 Dapr 部署中启用高可用性

为现有 Dapr 部署启用 HA 模式需要两个步骤：

1. 删除现有的 placement 有状态集。

   ```bash
   kubectl delete statefulset.apps/dapr-placement-server -n dapr-system
   ```

   您删除 placement 有状态集是因为在 HA 模式下，placement 服务添加了 [Raft](https://raft.github.io/) 用于领导者选举。然而，Kubernetes 仅允许有限的字段在有状态集中进行修补，随后会导致 placement 服务的升级失败。

   删除现有的 placement 有状态集是安全的。代理会重新连接并重新注册到新创建的 placement 服务，该服务在 Raft 中持久化其表。

1. 发出升级命令。

   ```bash
   helm upgrade dapr ./charts/dapr -n dapr-system --set global.ha.enabled=true
   ```

## 推荐的安全配置

正确配置时，Dapr 确保安全通信，并可以通过许多内置功能使您的应用程序更安全。

验证您的生产就绪部署包括以下设置：

1. **相互认证 (mTLS)** 已启用。Dapr 默认启用 mTLS。[了解更多关于如何使用您自己的证书]({{< ref "mtls.md#bringing-your-own-certificates" >}})。

1. **应用程序到 Dapr API 认证** 已启用。这是您的应用程序与 Dapr sidecar 之间的通信。为了保护 Dapr API 免受未经授权的应用程序访问，[启用 Dapr 的基于令牌的认证]({{< ref "api-token.md" >}})。

1. **Dapr 到应用程序 API 认证** 已启用。这是 Dapr 与您的应用程序之间的通信。[让 Dapr 知道它正在使用令牌认证与授权应用程序通信]({{< ref "app-api-token.md" >}})。

1. **组件 secret 数据配置在 secret 存储中**，而不是硬编码在组件 YAML 文件中。[了解如何使用 Dapr 组件的 secret]({{< ref "component-secrets.md" >}})。

1. Dapr **控制平面安装在专用命名空间中**，例如 `dapr-system`。

1. Dapr 支持并启用 **为某些应用程序设置组件范围**。这不是必需的实践。[了解更多关于组件范围]({{< ref "component-scopes.md" >}})。

## 推荐的 Placement 服务配置

[Placement 服务]({{< ref "placement.md" >}}) 是 Dapr 中的一个组件，负责通过 placement 表向所有 Dapr sidecar 传播 actor 地址信息（更多信息可以在 [这里]({{< ref "actors-features-concepts.md#actor-placement-service" >}}) 找到）。

在生产环境中运行时，建议使用以下值配置 Placement 服务：

1. **高可用性**。确保 Placement 服务具有高可用性（三个副本）并能在单个节点故障中幸存。Helm chart 值：`dapr_placement.ha=true`
2. **内存日志**。使用内存 Raft 日志存储以加快写入速度。权衡是更多的 placement 表传播（因此，在最终的 Placement 服务 pod 故障中，网络流量会增加）。Helm chart 值：`dapr_placement.cluster.forceInMemoryLog=true`
3. **无元数据端点**。禁用未认证的 `/placement/state` 端点，该端点暴露了 Placement 服务的 placement 表信息。Helm chart 值：`dapr_placement.metadataEnabled=false`
4. **超时** 控制 Placement 服务与 sidecar 之间网络连接的敏感性，使用以下超时值。默认值已设置，但您可以根据网络条件调整这些值。
   1. `dapr_placement.keepAliveTime` 设置 Placement 服务在 gRPC 流上向 Dapr sidecar 发送 [keep alive](https://grpc.io/docs/guides/keepalive/) ping 的间隔，以检查连接是否仍然存活。较低的值将在 pod 丢失/重启时导致较短的 actor 重新平衡时间，但在正常操作期间会增加网络流量。接受 `1s` 到 `10s` 之间的值。默认值为 `2s`。
   2. `dapr_placement.keepAliveTimeout` 设置 Dapr sidecar 响应 Placement 服务的 [keep alive](https://grpc.io/docs/guides/keepalive/) ping 的超时时间，然后 Placement 服务关闭连接。较低的值将在 pod 丢失/重启时导致较短的 actor 重新平衡时间，但在正常操作期间会增加网络流量。接受 `1s` 到 `10s` 之间的值。默认值为 `3s`。
   3. `dapr_placement.disseminateTimeout` 设置在 actor 成员更改（通常与 pod 重启相关）后传播延迟的超时时间，以避免在多个 pod 重启期间过度传播。较高的值将减少传播频率，但会延迟表传播。接受 `1s` 到 `3s` 之间的值。默认值为 `2s`。

## 服务账户令牌

默认情况下，Kubernetes 在每个容器中挂载一个包含 [服务账户令牌](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/) 的卷。应用程序可以使用此令牌，其权限因集群和命名空间的配置等因素而异，以对 Kubernetes 控制平面执行 API 调用。

在创建新 Pod（或 Deployment、StatefulSet、Job 等）时，您可以通过在 pod 的 spec 中设置 `automountServiceAccountToken: false` 来禁用自动挂载服务账户令牌。

建议您考虑在不依赖服务账户令牌的情况下，将应用程序部署为 `automountServiceAccountToken: false`，以提高 pod 的安全性。例如，您可能需要服务账户令牌，如果：

- 您的应用程序需要与 Kubernetes API 交互。
- 您正在使用与 Kubernetes API 交互的 Dapr 组件；例如，[Kubernetes secret 存储]({{< ref "kubernetes-secret-store.md" >}}) 或 [Kubernetes 事件绑定]({{< ref "kubernetes-binding.md" >}})。

因此，Dapr 不会自动为您设置 `automountServiceAccountToken: false`。然而，在您的解决方案不需要服务账户的所有情况下，建议您在 pod 的 spec 中设置此选项。

{{% alert title="注意" color="primary" %}}
使用存储为 Kubernetes secret 的 [组件 secret]({{< ref "component-secrets.md" >}}) 初始化 Dapr 组件不需要服务账户令牌，因此在这种情况下您仍然可以设置 `automountServiceAccountToken: false`。只有在运行时调用 Kubernetes secret 存储，使用 [Secrets 管理]({{< ref "secrets-overview.md" >}}) 构建块时，才会受到影响。
{{% /alert %}}

## 跟踪和指标配置

Dapr 默认启用跟踪和指标。建议您为您的应用程序和 Dapr 控制平面在生产中设置分布式跟踪和指标。

如果您已经有自己的可观察性设置，您可以禁用 Dapr 的跟踪和指标。

### 跟踪

[为 Dapr 配置跟踪后端]({{< ref "setup-tracing.md" >}})。

### 指标

对于指标，Dapr 在端口 9090 上暴露了一个 Prometheus 端点，可以被 Prometheus 抓取。

[设置 Prometheus、Grafana 和其他监控工具与 Dapr]({{< ref "observability" >}})。

## 注入器看门狗

Dapr Operator 服务包括一个 **注入器看门狗**，可用于检测和修复您的应用程序的 pod 可能在没有 Dapr sidecar（`daprd` 容器）的情况下部署的情况。例如，它可以帮助在集群完全故障后恢复应用程序。

在 Kubernetes 模式下运行 Dapr 时，注入器看门狗默认禁用。然而，您应该考虑根据您的具体情况启用它并设置适当的值。

请参阅 [Dapr operator 服务文档]({{< ref operator >}}) 以获取有关注入器看门狗及其启用方法的更多详细信息。

## 为 sidecar 容器配置 `seccompProfile`

默认情况下，Dapr sidecar 注入器注入一个没有任何 `seccompProfile` 的 sidecar。然而，为了使 Dapr sidecar 容器在具有 [受限](https://kubernetes.io/docs/concepts/security/pod-security-standards/#restricted) 配置文件的命名空间中成功运行，sidecar 容器需要 `securityContext.seccompProfile.Type` 不为 `nil`。

请参阅 [参数和注释概述]({{< ref "arguments-annotations-overview.md" >}}) 以在 sidecar 容器上设置适当的 `seccompProfile`。

## 最佳实践

观看此视频，深入了解在 Kubernetes 上运行 Dapr 的最佳实践。

<div class="embed-responsive embed-responsive-16by9">
<iframe width="360" height="315" src="https://www.youtube-nocookie.com/embed/_U9wJqq-H1g" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 相关链接

- [在 Kubernetes 上部署 Dapr]({{< ref kubernetes-deploy.md >}})
- [在 Kubernetes 上升级 Dapr]({{< ref kubernetes-upgrade.md >}})
