---
type: docs
title: "在 Kubernetes 集群上部署 Dapr"
linkTitle: "部署 Dapr"
weight: 20000
description: "按照这些步骤在 Kubernetes 上部署 Dapr"
aliases:
  - /zh-hans/getting-started/install-dapr-kubernetes/
---

When setting up Kubernetes you can use either the Dapr CLI or Helm.

有关部署到 Kubernetes 集群的内容的更多信息，请阅读 [Kubernetes 概述]({{< ref kubernetes-overview.md >}})。

## Prerequisites

- Install [Dapr CLI]({{< ref install-dapr-cli.md >}})
- Install [kubectl](https://kubernetes.io/docs/tasks/tools/)
- Kubernetes cluster (see below if needed)

### Create cluster

您可以在任何 Kubernetes 集群上安装 Dapr。 以下是一些有用的链接：

- [Setup KiNd Cluster]({{< ref setup-kind.md >}})
- [Setup Minikube Cluster]({{< ref setup-minikube.md >}})
- [Setup Azure Kubernetes Service Cluster]({{< ref setup-aks.md >}})
- [Setup Google Cloud Kubernetes Engine](https://docs.dapr.io/operations/hosting/kubernetes/cluster/setup-gke/)
- [Setup Amazon Elastic Kubernetes Service](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html)

{{% alert title="Hybrid clusters" color="primary" %}}
Dapr CLI 和 Dapr Helm 图表都会自动关联地部署到带有标签 `kubernetes.io/os=linux` 的节点上。 如果你的应用程序有需要，你也可以将 Dapr 部署到 Windows 节点。 更多信息参见[部署到 Linux/Windows 混合型 Kubernetes 集群]({{<ref kubernetes-hybrid-clusters>}})。
{{% /alert %}}


## 使用 Dapr CLI 安装

你可以使用 [Dapr CLI]({{< ref install-dapr-cli.md >}}) 来把 Dapr 安装到 Kubernetes 集群上。

### Install Dapr (from an official Dapr Helm chart)

`-k` 标志在当前上下文中初始化 Kubernetes 集群上的 Dapr。

{{% alert title="Ensure correct cluster is set" color="warning" %}}
请确保设置了正确的 "目标" 集群。 检查 `kubectl context (kubectl config get-contexts)` 以进行验证。 你可以使用 `kubectl config use-context <CONTEXT>` 来设置其他的上下文。
{{% /alert %}}

在您的本地机器上运行以下命令，在您的集群上启动 Dapr:

```bash
dapr init -k
```

```bash
⌛  Making the jump to hyperspace...

✅  Deploying the Dapr control plane to your cluster...
✅  Success! Dapr has been installed to namespace dapr-system. To verify, run "dapr status -k" in your terminal. To get started, go here: https://aka.ms/dapr-getting-started
```

### Install Dapr (a private Dapr Helm chart)
There are some scenarios where it's necessary to install Dapr from a private Helm chart, such as:
- needing more granular control of the Dapr Helm chart
- having a custom Dapr deployment
- pulling Helm charts from trusted registries that are managed and maintained by your organization

```
export DAPR_HELM_REPO_URL="https://helm.custom-domain.com/dapr/dapr"
export DAPR_HELM_REPO_USERNAME="username_xxx"
export DAPR_HELM_REPO_PASSWORD="passwd_xxx"
```

Setting the above parameters will allow `dapr init -k` to install Dapr images from the configured Helm repository.

### Install in custom namespace

The default namespace when initializing Dapr is `dapr-system`. You can override this with the `-n` flag.

```bash
dapr init -k -n mynamespace
```

### Install in highly available mode

You can run Dapr with 3 replicas of each control plane pod in the dapr-system namespace for [production scenarios]({{< ref kubernetes-production.md >}}).

```bash
dapr init -k --enable-ha=true
```

### Disable mTLS

Dapr is initialized by default with [mTLS]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}}). You can disable it with:

```bash
dapr init -k --enable-mtls=false
```

### Wait for the installation to complete

 You can wait for the installation to complete its deployment with the `--wait` flag.

 The default timeout is 300s (5 min), but can be customized with the `--timeout` flag.

```bash
dapr init -k --wait --timeout 600
```

### Uninstall Dapr on Kubernetes with CLI

Run the following command on your local machine to uninstall Dapr on your cluster:

```bash
dapr uninstall -k
```

## 使用 Helm 安装(推荐)

You can install Dapr on Kubernetes using a Helm 3 chart.

{{% alert title="Ensure you are on Helm v3" color="primary" %}}
The latest Dapr helm chart no longer supports Helm v2. Please migrate from Helm v2 to Helm v3 by following [this guide](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/).
{{% /alert %}}

### Add and install Dapr Helm chart

1. Make sure [Helm 3](https://github.com/helm/helm/releases) is installed on your machine
2. 添加 Helm 库并更新

    ```bash
    // Add the official Dapr Helm chart.
    helm repo add dapr https://dapr.github.io/helm-charts/
    // Or also add a private Dapr Helm chart.
    helm repo add dapr http://helm.custom-domain.com/dapr/dapr/ \
       --username=xxx --password=xxx
    helm repo update
    # See which chart versions are available
    helm search repo dapr --devel --versions
    ```
3. Install the Dapr chart on your cluster in the `dapr-system` namespace.

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

### Uninstall Dapr on Kubernetes

```bash
helm uninstall dapr --namespace dapr-system
```

### More information

- Read [this guide]({{< ref kubernetes-production.md >}}) for recommended Helm chart values for production setups
- See [this page](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md) for details on Dapr Helm charts.

## 安装验证

Once the installation is complete, verify that the dapr-operator, dapr-placement, dapr-sidecar-injector and dapr-sentry pods are running in the `dapr-system` namespace:

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

## Using Mariner-based images

When deploying Dapr, whether on Kubernetes or in Docker self-hosted, the default container images that are pulled are based on [*distroless*](https://github.com/GoogleContainerTools/distroless).

Alternatively, you can use Dapr container images based on Mariner 2 (minimal distroless). [Mariner](https://github.com/microsoft/CBL-Mariner/), officially known as CBL-Mariner, is a free and open-source Linux distribution and container base image maintained by Microsoft. For some Dapr users, leveraging container images based on Mariner can help you meet compliance requirements.

To use Mariner-based images for Dapr, you need to add `-mariner` to your Docker tags. For example, while `ghcr.io/dapr/dapr:latest` is the Docker image based on *distroless*, `ghcr.io/dapr/dapr:latest-mariner` is based on Mariner. Tags pinned to a specific version are also available, such as `{{% dapr-latest-version short="true" %}}-mariner`.

With Kubernetes and Helm, you can use Mariner-based images by setting the `global.tag` option and adding `-mariner`. For example:

```sh
helm upgrade --install dapr dapr/dapr \
  --version={{% dapr-latest-version short="true" %}} \
  --namespace dapr-system \
  --create-namespace \
  --set global.tag={{% dapr-latest-version long="true" %}}-mariner \
  --wait
```

## 下一步

- [Configure state store & pubsub message broker]({{< ref "getting-started/tutorials/configure-state-pubsub.md" >}})
