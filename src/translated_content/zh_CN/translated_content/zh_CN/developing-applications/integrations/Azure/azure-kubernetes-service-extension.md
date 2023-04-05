---
type: docs
title: "Azure Kubernetes Service (AKS) 的 Dapr 扩展"
linkTitle: "Azure Kubernetes Service (AKS) 的 Dapr 扩展"
description: "使用 Dapr 扩展在 Azure Kubernetes Service （AKS） 集群上预配 Dapr"
weight: 4000
---

# Prerequisites
- Azure subscription
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli-windows?tabs=azure-cli) and the ***aks-preview*** extension.
- [Azure Kubernetes Service (AKS) cluster](https://docs.microsoft.com/azure/aks/tutorial-kubernetes-deploy-cluster?tabs=azure-cli)

## 使用 AKS Dapr 扩展安装 Dapr
The recommended approach for installing Dapr on AKS is to use the AKS Dapr extension. The extension offers support for all native Dapr configuration capabilities through command-line arguments via the Azure CLI and offers the option of opting into automatic minor version upgrades of the Dapr runtime.

{{% alert title="Note" color="warning" %}}
如果您通过 AKS 扩展安装 Dapr，我们的建议是继续使用该扩展而不是 Dapr CLI 来管理 Dapr。 将这两种工具结合起来可能会导致冲突并导致不良行为。
{{% /alert %}}

### How the extension works
Dapr 扩展通过 Azure CLI 在 AKS 群集上预配 Dapr 控制面板来工作。 Dapr 控制面板包括：

- **dapr-operator**: Manages component updates and Kubernetes services endpoints for Dapr (state stores, pub/subs, etc.)
- **dapr-sidecar-injector**：将 Dapr 注入到注解的 deployment pod 中并添加环境变量 `DAPR_HTTP_PORT` 和 `DAPR_GRPC_PORT`。 这使用户定义的应用程序能够与 Dapr 进行通信，而无需对 Dapr 端口值进行硬编码。
- **dapr-placement**: 仅用于 actor. Creates mapping tables that map actor instances to pods
- **dapr-sentry**: 管理服务之间的 mTLS 并充当证书颁发机构。 有关更多信息，请阅读安全性概述。

### 扩展先决条件
要使用 AKS Dapr 扩展，必须首先在 Azure 订阅上启用 `AKS-ExtensionManager` 和 `AKS-Dapr` 功能标志。

以下命令将在您的 Azure 订阅上注册 `AKS-ExtensionManager` 和 `AKS-Dapr` 功能标志：

```bash
az feature register --namespace "Microsoft.ContainerService" --name "AKS-ExtensionManager"
az feature register --namespace "Microsoft.ContainerService" --name "AKS-Dapr"
```

几分钟后，检查状态以显示 `Registered`。 使用 az feature list 命令确认注册状态：

```bash
az feature list -o table --query "[?contains(name, 'Microsoft.ContainerService/AKS-ExtensionManager')].{Name:name,State:properties.state}"
az feature list -o table --query "[?contains(name, 'Microsoft.ContainerService/AKS-Dapr')].{Name:name,State:properties.state}"
```

接下来，使用 az provider register 命令刷新 `Microsoft.KubernetesConfiguration` 和 `Microsoft.ContainerService` 资源提供程序的注册：

```bash
az provider register --namespace Microsoft.KubernetesConfiguration
az provider register --namespace Microsoft.ContainerService
```

#### Enable the Azure CLI extension for cluster extensions
您还需要 `k8s-extension` Azure CLI 扩展。 通过运行以下命令来安装它：

```bash
az extension add --name k8s-extension
```

如果 `k8s-extension` 扩展已经存在，您可以使用以下命令将其更新到最新版本：

```bash
az extension update --name k8s-extension
```

#### 在 AKS 群集上创建扩展并安装 Dapr
在您的订阅注册为使用 Kubernetes 扩展后，通过创建 Dapr 扩展在集群上安装 Dapr。 例如:

```bash
az k8s-extension create --cluster-type managedClusters \
--cluster-name myAKSCluster \
--resource-group myResourceGroup \
--name myDaprExtension \
--extension-type Microsoft.Dapr
```

此外，Dapr 可以自动更新其次要版本。 要启用此功能，请将 `--auto-upgrade-minor-version` 参数设置为 true：

```bash
--auto-upgrade-minor-version true
```

K8-extension 完成配置后，您可以通过运行以下命令确认 Dapr 控制面板已安装在您的 AKS 集群上：

```bash
kubectl get pods -n dapr-system
```

In the example output below, note how the Dapr control plane is installed with high availability mode, enabled by default.

```
~  kubectl get pods -n dapr-system
NAME                                    READY   STATUS    RESTARTS   AGE
dapr-dashboard-5f49d48796-rnt5t         1/1     Running   0          1h
dapr-operator-98579b8b4-fpz7k           1/1     Running   0          1h
dapr-operator-98579b8b4-nn5vm           1/1     Running   0          1h
dapr-operator-98579b8b4-pplqr           1/1     Running   0          1h
dapr-placement-server-0                 1/1     Running   0          1h
dapr-placement-server-1                 1/1     Running   0          1h
dapr-placement-server-2                 1/1     Running   0          1h
dapr-sentry-775bccdddb-htcl7            1/1     Running   0          1h
dapr-sentry-775bccdddb-vtfxj            1/1     Running   0          1h
dapr-sentry-775bccdddb-w4l8x            1/1     Running   0          1h
dapr-sidecar-injector-9555889bc-klb9g   1/1     Running   0          1h
dapr-sidecar-injector-9555889bc-rpjwl   1/1     Running   0          1h
dapr-sidecar-injector-9555889bc-rqjgt   1/1     Running   0          1h
```

For more information about configuration options and targeting specific Dapr versions, see the official [AKS Dapr Extension Docs](https://docs.microsoft.com/azure/aks/dapr).
