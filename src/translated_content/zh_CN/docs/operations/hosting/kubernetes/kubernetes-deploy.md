---
type: docs
title: "在 Kubernetes 集群上部署 Dapr"
linkTitle: "部署 Dapr"
weight: 20000
description: "按照这些步骤在 Kubernetes 上部署 Dapr。"
aliases:
    - /zh-hans/getting-started/install-dapr-kubernetes/
---

在 Kubernetes 上设置 Dapr 时，你可以使用 Dapr CLI 或 Helm。

{{% alert title="混合集群" color="primary" %}}
Dapr CLI 和 Dapr Helm chart 默认会部署到带有标签 `kubernetes.io/os=linux` 的节点上。如果你的应用程序需要，你也可以将 Dapr 部署到 Windows 节点。更多信息请参见[部署到混合 Linux/Windows Kubernetes 集群]({{< ref kubernetes-hybrid-clusters >}})。
{{% /alert %}}

{{< tabs "Dapr CLI" "Helm" >}}
 <!-- Dapr CLI -->
{{% codetab %}}
## 使用 Dapr CLI 安装

你可以使用 [Dapr CLI]({{< ref install-dapr-cli.md >}}) 在 Kubernetes 集群中安装 Dapr。

### 先决条件

- 安装：
   - [Dapr CLI]({{< ref install-dapr-cli.md >}})
   - [kubectl](https://kubernetes.io/docs/tasks/tools/)
- 创建一个带有 Dapr 的 Kubernetes 集群。以下是一些有用的链接：
   - [设置 KiNd 集群]({{< ref setup-kind.md >}})
   - [设置 Minikube 集群]({{< ref setup-minikube.md >}})
   - [设置 Azure Kubernetes 服务集群]({{< ref setup-aks.md >}})
   - [设置 GKE 集群]({{< ref setup-gke.md >}})
   - [设置 Amazon 弹性 Kubernetes 服务](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html)

### 安装选项

你可以从官方 Helm chart 或私有 chart 安装 Dapr，并使用自定义命名空间等。

#### 从官方 Dapr Helm chart 安装 Dapr

`-k` 标志用于在当前上下文的 Kubernetes 集群中初始化 Dapr。

1. 通过检查 `kubectl context (kubectl config get-contexts)` 来验证是否设置了正确的 "目标" 集群。
   - 你可以使用 `kubectl config use-context <CONTEXT>` 设置不同的上下文。

1. 使用以下命令在集群中初始化 Dapr：

    ```bash
    dapr init -k
    ```

    **预期输出**
    
    ```bash
    ⌛  正在初始化...
    
    ✅  正在将 Dapr 控制平面部署到集群中...
    ✅  成功！Dapr 已安装到命名空间 dapr-system。要验证，请在终端中运行 "dapr status -k"。要开始，请访问此处：https://aka.ms/dapr-getting-started
    ```
    
1. 运行仪表板：

    ```bash
    dapr dashboard -k
    ```

    如果你在**非默认命名空间**中安装了 Dapr，请运行：
    
    ```bash
    dapr dashboard -k -n <your-namespace>
    ```

#### 从官方 Dapr Helm chart 安装 Dapr（带开发标志）

添加 `--dev` 标志在当前上下文的 Kubernetes 集群中初始化 Dapr，并附加 Redis 和 Zipkin 部署。

步骤与[从 Dapr Helm chart 安装](#install-dapr-from-an-official-dapr-helm-chart)类似，只是需要在 `init` 命令后附加 `--dev` 标志：

 ```bash
 dapr init -k --dev
 ```

预期输出：

```bash
⌛  正在初始化...
ℹ️  注意：要使用 Helm 安装 Dapr，请参见此处：https://docs.dapr.io/getting-started/install-dapr-kubernetes/#install-with-helm-advanced

ℹ️  容器镜像将从 Docker Hub 拉取
✅  正在将最新版本的 Dapr 控制平面部署到集群中...
✅  正在将最新版本的 Dapr 仪表板部署到集群中...
✅  正在将最新版本的 Dapr Redis 部署到集群中...
✅  正在将最新版本的 Dapr Zipkin 部署到集群中...
ℹ️  正在将 "statestore" 组件应用到 Kubernetes "default" 命名空间。
ℹ️  正在将 "pubsub" 组件应用到 Kubernetes "default" 命名空间。
ℹ️  正在将 "appconfig" zipkin 配置应用到 Kubernetes "default" 命名空间。
✅  成功！Dapr 已安装到命名空间 dapr-system。要验证，请在终端中运行 `dapr status -k`。要开始，请访问此处：https://aka.ms/dapr-getting-started
 ```

经过一段时间（或使用 `--wait` 标志并指定等待时间），你可以检查 Redis 和 Zipkin 组件是否已部署到集群中。

```bash
kubectl get pods --namespace default
```

预期输出：

```bash
NAME                              READY   STATUS    RESTARTS   AGE
dapr-dev-zipkin-bfb4b45bb-sttz7   1/1     Running   0          159m
dapr-dev-redis-master-0           1/1     Running   0          159m
dapr-dev-redis-replicas-0         1/1     Running   0          159m
dapr-dev-redis-replicas-1         1/1     Running   0          159m
dapr-dev-redis-replicas-2         1/1     Running   0          158m 
 ```

#### 从私有 Dapr Helm chart 安装 Dapr

从[私有 Helm chart 安装 Dapr](#install-dapr-from-an-official-dapr-helm-chart)在以下情况下可能有帮助：
- 需要对 Dapr Helm chart 进行更细粒度的控制
- 有自定义的 Dapr 部署
- 从由你的组织管理和维护的受信任注册表中拉取 Helm chart

设置以下参数以允许 `dapr init -k` 从配置的 Helm 仓库安装 Dapr 镜像。

```
export DAPR_HELM_REPO_URL="https://helm.custom-domain.com/dapr/dapr"
export DAPR_HELM_REPO_USERNAME="username_xxx"
export DAPR_HELM_REPO_PASSWORD="passwd_xxx"
```
#### 在高可用模式下安装

你可以在 `dapr-system` 命名空间中运行每个控制平面 pod 的三个副本以用于[生产场景]({{< ref kubernetes-production.md >}})。

```bash
dapr init -k --enable-ha=true
```

#### 在自定义命名空间中安装

初始化 Dapr 时的默认命名空间是 `dapr-system`。你可以使用 `-n` 标志覆盖此设置。

```bash
dapr init -k -n mynamespace
```

#### 禁用 mTLS

Dapr 默认使用 [mTLS]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}}) 初始化。你可以通过以下方式禁用它：

```bash
dapr init -k --enable-mtls=false
```

#### 等待安装完成

你可以使用 `--wait` 标志等待安装完成其部署。默认超时时间为 300 秒（5 分钟），但可以使用 `--timeout` 标志自定义。

```bash
dapr init -k --wait --timeout 600
```

### 使用 CLI 卸载 Kubernetes 上的 Dapr

在本地机器上运行以下命令以卸载集群上的 Dapr：

```bash
dapr uninstall -k
```

{{% /codetab %}}

 <!-- Helm -->
{{% codetab %}}

## 使用 Helm 安装

你可以使用 Helm v3 chart 在 Kubernetes 上安装 Dapr。

❗**重要：** 最新的 Dapr Helm chart 不再支持 Helm v2。[从 Helm v2 迁移到 Helm v3](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/)。

### 先决条件

- 安装：
   - [Helm v3](https://helm.sh/docs/intro/install/)
   - [kubectl](https://kubernetes.io/docs/tasks/tools/)
- 创建一个带有 Dapr 的 Kubernetes 集群。以下是一些有用的链接：
   - [设置 KiNd 集群]({{< ref setup-kind.md >}})
   - [设置 Minikube 集群]({{< ref setup-minikube.md >}})
   - [设置 Azure Kubernetes 服务集群]({{< ref setup-aks.md >}})
   - [设置 GKE 集群]({{< ref setup-gke.md >}})
   - [设置 Amazon 弹性 Kubernetes 服务](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html)

### 添加并安装 Dapr Helm chart

1. 添加 Helm 仓库并更新：

    ```bash
    // 添加官方 Dapr Helm chart。
    helm repo add dapr https://dapr.github.io/helm-charts/
    // 或者也可以添加私有 Dapr Helm chart。
    helm repo add dapr http://helm.custom-domain.com/dapr/dapr/ \
       --username=xxx --password=xxx
    helm repo update
    // 查看哪些 chart 版本可用
    helm search repo dapr --devel --versions
    ```

1. 在 `dapr-system` 命名空间中安装 Dapr chart 到你的集群。

    ```bash
    helm upgrade --install dapr dapr/dapr \
    --version={{% dapr-latest-version short="true" %}} \
    --namespace dapr-system \
    --create-namespace \
    --wait
    ```

   要在**高可用**模式下安装：

    ```bash
    helm upgrade --install dapr dapr/dapr \
    --version={{% dapr-latest-version short="true" %}} \
    --namespace dapr-system \
    --create-namespace \
    --set global.ha.enabled=true \
    --wait
    ```

   要在**高可用**模式下安装并独立于全局缩放选择服务：

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
   
有关使用 Helm 安装和升级 Dapr 的更多信息，请参见[生产就绪部署的 Kubernetes 指南]({{< ref kubernetes-production.md >}})。

### （可选）将 Dapr 仪表板作为控制平面的一部分安装

如果你想安装 Dapr 仪表板，请使用此 Helm chart 并选择附加设置：

`helm install dapr dapr/dapr-dashboard --namespace dapr-system`

例如：

```bash
helm repo add dapr https://dapr.github.io/helm-charts/
helm repo update
kubectl create namespace dapr-system
# 安装 Dapr 仪表板
helm install dapr-dashboard dapr/dapr-dashboard --namespace dapr-system
```

### 验证安装

安装完成后，验证 `dapr-operator`、`dapr-placement`、`dapr-sidecar-injector` 和 `dapr-sentry` pod 是否在 `dapr-system` 命名空间中运行：

```bash
kubectl get pods --namespace dapr-system
```

```bash
NAME                                     READY     STATUS    RESTARTS   AGE
dapr-dashboard-7bd6cbf5bf-xglsr          1/1       Running   0          40s
dapr-operator-7bd6cbf5bf-xglsr           1/1       Running   0          40s
dapr-placement-7f8f76778f-6vhl2          1/1       Running   0          40s
dapr-sidecar-injector-8555576b6f-29cqm   1/1       Running   0          40s
dapr-sentry-9435776c7f-8f7yd             1/1       Running   0          40s
```

### 卸载 Kubernetes 上的 Dapr

```bash
helm uninstall dapr --namespace dapr-system
```

### 更多信息

- 阅读[生产环境的 Kubernetes 指南]({{< ref kubernetes-production.md >}})以获取推荐的 Helm chart 值
- [Dapr Helm chart 的更多细节](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md)

{{% /codetab %}}

{{< /tabs >}}

### 使用基于 Mariner 的镜像

在 Kubernetes 上默认拉取的容器镜像基于 [*distroless*](https://github.com/GoogleContainerTools/distroless)。

或者，你可以使用基于 Mariner 2（最小 distroless）的 Dapr 容器镜像。[Mariner](https://github.com/microsoft/CBL-Mariner/)，官方称为 CBL-Mariner，是一个由微软维护的免费开源 Linux 发行版和容器基础镜像。对于一些 Dapr 用户，利用基于 Mariner 的容器镜像可以帮助你满足合规要求。

要使用基于 Mariner 的 Dapr 镜像，你需要在 Docker 标签中添加 `-mariner`。例如，`ghcr.io/dapr/dapr:latest` 是基于 *distroless* 的 Docker 镜像，而 `ghcr.io/dapr/dapr:latest-mariner` 是基于 Mariner 的。也有固定到特定版本的标签可用，例如 `{{% dapr-latest-version short="true" %}}-mariner`。

{{< tabs "Dapr CLI" "Helm" >}}
 <!-- Dapr CLI -->
{{% codetab %}}

在 Dapr CLI 中，你可以使用 `--image-variant` 标志切换到使用基于 Mariner 的镜像。

```sh
dapr init -k --image-variant mariner
```

{{% /codetab %}}

 <!-- Helm -->
{{% codetab %}}

在 Kubernetes 和 Helm 中，你可以通过设置 `global.tag` 选项并添加 `-mariner` 来使用基于 Mariner 的镜像。例如：

```sh
helm upgrade --install dapr dapr/dapr \
  --version={{% dapr-latest-version short="true" %}} \
  --namespace dapr-system \
  --create-namespace \
  --set global.tag={{% dapr-latest-version long="true" %}}-mariner \
  --wait
```

{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [使用 Helm 参数和其他细节部署 Dapr]({{< ref "kubernetes-production.md#deploy-dapr-with-helm" >}})
- [在 Kubernetes 上升级 Dapr]({{< ref kubernetes-upgrade.md >}})
- [Kubernetes 生产指南]({{< ref kubernetes-production.md >}})
- [配置 state 存储和 pubsub 消息代理]({{< ref "getting-started/tutorials/configure-state-pubsub.md" >}})
