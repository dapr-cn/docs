---
type: docs
title: "Deploy Dapr on a Kubernetes cluster"
linkTitle: "Deploy Dapr"
weight: 20000
description: "Follow these steps to deploy Dapr on Kubernetes."
aliases:
  - /getting-started/install-dapr-kubernetes/
---

你可以使用 Dapr CLI 或 Helm 在 Kubernetes 中部署 Dapr

有关部署到Kubernetes集群的内容的更多信息，请阅读[Kubernetes概述]({{< ref kubernetes-overview.md >}})。

## 前期准备

- 安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 安装[kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- Kubernetes 集群 (如有需要可参考下文)

### 创建集群

你可以在任何 Kubernetes 集群上安装 Dapr. 下面的链接可以提供帮助:

- [Setup Minikube Cluster]({{< ref setup-minikube.md >}})
- [Setup Azure Kubernetes Service Cluster]({{< ref setup-aks.md >}})
- [Setup Google Cloud Kubernetes Engine](https://cloud.google.com/kubernetes-engine/docs/quickstart)
- [Setup Amazon Elastic Kubernetes Service](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html)

{{% alert title="Hybrid clusters" color="primary" %}}
Dapr CLI 和 Dapr Helm 图表都会自动关联地部署到带有标签`kubernetes.io/os=linux`的节点上。 如果你的应用程序有需要，你也可以将 Dapr 部署到 Windows 节点。 更多信息参见 [部署到Linux/Windows混合型Kubernetes集群]({{X49X}}).
{{% /alert %}}


## 使用 Dapr CLI 安装

你可以使用 [Dapr CLI]({{< ref install-dapr-cli.md >}}) 来把 Dapr 安装到 Kubernetes 集群上。

### 安装 Dapr

`-k` 标志在当前上下文中初始化 Kubernetes 集群上的 Dapr.

{{% alert title="Ensure correct cluster is set" color="warning" %}}
Make sure the correct "target" cluster is set. Check `kubectl context (kubectl config get-contexts)` to verify. You can set a different context using `kubectl config use-context <CONTEXT>`.
{{% /alert %}}

Run the following command on your local machine to init Dapr on your cluster:

```bash
dapr init -k
```

```bash
⌛  Making the jump to hyperspace...

✅  Deploying the Dapr control plane to your cluster...
✅  Success! Dapr has been installed to namespace dapr-system. To verify, run "dapr status -k" in your terminal. To get started, go here: https://aka.ms/dapr-getting-started
```

### Install in custom namespace

The default namespace when initializing Dapr is `dapr-system`. You can override this with the `-n` flag. You can override this with the `-n` flag.

```bash
dapr init -k -n mynamespace
```


### Install in highly available mode

You can run Dapr with 3 replicas of each control plane pod in the dapr-system namespace for [production scenarios]({{< ref kubernetes-production.md >}}).

```bash
dapr init -k --enable-ha=true
```

### Disable mTLS

Dapr is initialized by default with [mTLS]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}}). You can disable it with: You can disable it with:

```bash
dapr init -k --enable-mtls=false
```

### Uninstall Dapr on Kubernetes with CLI

Run the following command on your local machine to uninstall Dapr on your cluster:

```bash
dapr uninstall -k
```

## Install with Helm (advanced)

You can install Dapr on Kubernetes using a Helm 3 chart.

{{% alert title="Ensure you are on Helm v3" color="primary" %}}
The latest Dapr helm chart no longer supports Helm v2. The latest Dapr helm chart no longer supports Helm v2. Please migrate from Helm v2 to Helm v3 by following [this guide](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/).
{{% /alert %}}

### Add and install Dapr Helm chart

1. Make sure [Helm 3](https://github.com/helm/helm/releases) is installed on your machine
2. Add Helm repo and update

    ```bash
    helm repo add dapr https://dapr.github.io/helm-charts/
    helm repo update
    # See which chart versions are available
    helm search repo dapr --devel --versions
    ```
3. Install the Dapr chart on your cluster in the `dapr-system` namespace.

    ```bash
    helm upgrade --install dapr dapr/dapr \
    --version=1.0.1 \
    --namespace dapr-system \
    --create-namespace \
    --wait
    ```

   To install in high availability mode:

    ```bash
    helm upgrade --install dapr dapr/dapr \
    --version=1.0.1 \
    --namespace dapr-system \
    --create-namespace \
    --set global.ha.enabled=true \
    --wait
    ```


   See [Guidelines for production ready deployments on Kubernetes]({{X43X}}) for more information on    installing and upgrading Dapr using Helm.

### Uninstall Dapr on Kubernetes

```bash
helm uninstall dapr --namespace dapr-system
```

### More information

- Read [this guide]({{< ref kubernetes-production.md >}}) for recommended Helm chart values for production setups
- See [this page](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md) for details on Dapr Helm charts.

## Verify installation

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

## Next steps

- [Configure state store & pubsub message broker]({{< ref configure-state-pubsub.md >}})
