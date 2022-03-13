---
type: docs
title: "在 Kubernetes 集群上部署 Dapr"
linkTitle: "部署 Dapr"
weight: 20000
description: "按照以下步骤在 Kubernetes 上部署 Dapr。"
aliases:
  - /zh-hans/getting-started/install-dapr-kubernetes/
---

你可以使用 Dapr CLI 或 Helm 在 Kubernetes 中部署 Dapr。

有关部署到 Kubernetes 集群的内容的更多信息，请阅读 [Kubernetes 概述]({{< ref kubernetes-overview.md >}})。

## 先决条件

- 安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 安装 [kubectl](https://kubernetes.io/docs/tasks/tools/)
- Kubernetes 集群（如果需要，请参阅下文）

### 创建集群

你可以在任何 Kubernetes 集群上安装 Dapr。 以下是一些有用的链接：

- [设置 Minikube 集群]({{< ref setup-minikube.md >}})
- [设置 Azure Kubernetes Service 集群]({{< ref setup-aks.md >}})
- [设置 Google Cloud Kubernetes Engine](https://cloud.google.com/kubernetes-engine/docs/quickstart)
- [设置 Amazon Elastic Kubernetes Service](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html)

{{% alert title="Hybrid clusters" color="primary" %}}
Dapr CLI 和 Dapr Helm 图表都会自动关联地部署到带有标签 `kubernetes.io/os=linux` 的节点上。 如果你的应用程序有需要，你也可以将 Dapr 部署到 Windows 节点。 更多信息参见[部署到 Linux/Windows 混合型 Kubernetes 集群]({{<ref kubernetes-hybrid-clusters>}})。
{{% /alert %}}


## 使用 Dapr CLI 安装

你可以使用 [Dapr CLI]({{< ref install-dapr-cli.md >}}) 来把 Dapr 安装到 Kubernetes 集群上。

### 安装 Dapr

`-k` 标志在当前上下文中初始化 Kubernetes 集群上的 Dapr。

{{% alert title="Ensure correct cluster is set" color="warning" %}}
请确保设置了正确的 "目标" 集群。 检查 `kubectl context (kubectl config get-contexts)` 以进行验证。 你可以使用 `kubectl config use-context <CONTEXT>` 来设置其他的上下文。
{{% /alert %}}

在您的本地机器上运行以下命令，在您的集群上启动 Dapr：

```bash
dapr init -k
```

```bash
⌛  Making the jump to hyperspace...

✅  Deploying the Dapr control plane to your cluster...
✅  Success! Dapr has been installed to namespace dapr-system. To verify, run "dapr status -k" in your terminal. To get started, go here: https://aka.ms/dapr-getting-started
```

### 在自定义命名空间安装

初始化 Dapr 时默认的命名空间是 `dapr-system`。 你可以用 `-n` 标志来覆盖它。

```bash
dapr init -k -n mynamespace
```

### 在高可用模式下安装

你可以在 [生产环境]({{< ref kubernetes-production.md >}}) 中，为在 dapr-system 命名空间里的每个控制平面 pod 设置3个副本的方式运行 Dapr。

```bash
dapr init -k --enable-ha=true
```

### 关闭 mTLS

Dapr 初始化默认开启 [mTLS]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}})。 您可以通过以下方式禁用它：

```bash
dapr init -k --enable-mtls=false
```

### 等待安装完成

 您可以使用 `--wait` 标志来等待安装完成。

 默认超时是 300s (5分钟)，但可以使用 `--timeout` 标志自定义超时。

```bash
dapr init -k --wait --timeout 600
```

### 使用 CLI 卸载 Kubernetes 上的 Dapr

在您的本地机器上运行以下命令，以卸载你的集群上的 Dapr:

```bash
dapr uninstall -k
```

## 使用 Helm 安装(推荐)

你可以使用 Helm 3 图表在 Kubernetes 上安装 Dapr 。

{{% alert title="Ensure you are on Helm v3" color="primary" %}}
最新的 Dapr Helm 图表不再支持 Helm v2。 请按照这篇文章 [Helm迁移指南](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/) 从Helm v2 迁移到Helm v3。
{{% /alert %}}

### 添加和安装 Dapr Helm 图表

1. 请确保你的机器已经安装了 [Helm 3](https://github.com/helm/helm/releases) 。
2. 添加 Helm 库并更新

    ```bash
    helm repo add dapr https://dapr.github.io/helm-charts/
    helm repo update
    # See which chart versions are available
    helm search repo dapr --devel --versions
    ```
3. 将 Dapr 图表安装在你的集群的 `dapr-system` 命名空间中。

    ```bash
    helm upgrade --install dapr dapr/dapr \
    --version={{% dapr-latest-version short="true" %}} \
    --namespace dapr-system \
    --create-namespace \
    --wait
    ```

   以高可用模式安装：

    ```bash
    helm upgrade --install dapr dapr/dapr \
    --version={{% dapr-latest-version short="true" %}} \
    --namespace dapr-system \
    --create-namespace \
    --set global.ha.enabled=true \
    --wait
    ```


   有关使用 Helm 安装和升级 Dapr 的更多信息，请参阅 [Kubernetes 上的生产环境部署指南]({{<ref kubernetes-production.md>}})。

### 卸载 Kubernetes 上的 Dapr

```bash
helm uninstall dapr --namespace dapr-system
```

### 详情

- 阅读[本指南]({{< ref kubernetes-production.md >}})，了解生产环境中推荐的 Helm 图表值。
- 请参阅[本页面](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md)，了解有关 Dapr Helm 图表的详细信息。

## 安装验证

安装完成后，验证 dapr-operator、dapr-placement、dapr-sidecar-injector 和 dapr-sentry 的pods是否在 `dapr-system` 命名空间中运行。

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

## 下一步

- [配置状态存储 & pubsub 消息代理]({{< ref configure-state-pubsub.md >}})
