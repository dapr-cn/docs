---
type: docs
title: "Azure Kubernetes Service (AKS) 的 Dapr 扩展"
linkTitle: "Azure Kubernetes Service (AKS) 的 Dapr 扩展"
description: "使用 Dapr 扩展在 Azure Kubernetes Service （AKS） 集群上预配 Dapr"
weight: 4000
---

# 先决条件
- [Azure Subscription](https://azure.microsoft.com/free/?WT.mc_id=A261C142F)
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli-windows?tabs=azure-cli) 和 ***aks-preview*** 扩展。
- [Azure Kubernetes Service (AKS) 群集](https://docs.microsoft.com/azure/aks/tutorial-kubernetes-deploy-cluster?tabs=azure-cli)

## 使用 AKS Dapr 扩展安装 Dapr
在 AKS 上安装 Dapr 的推荐方法是使用 AKS Dapr 扩展。 该扩展通过 Azure CLI 通过命令行参数支持所有本机 Dapr 配置功能，并提供选择自动升级 Dapr 运行时的次要版本升级的选项。

{{% alert title="Note" color="warning" %}}
如果您通过 AKS 扩展安装 Dapr，我们的建议是继续使用该扩展而不是 Dapr CLI 来管理 Dapr。 将这两种工具结合起来可能会导致冲突并导致不良行为。
{{% /alert %}}

### 扩展的工作原理
Dapr 扩展通过 Azure CLI 在 AKS 群集上预配 Dapr 控制面板来工作。 Dapr 控制面板包括：

- **dapr-operator**: 为 Dapr 管理组件更新和 Kubernetes 服务端点 (状态存储、发布/订阅等)
- **dapr-sidecar-injector**：将 Dapr 注入到注解的 deployment pod 中并添加环境变量 `DAPR_HTTP_PORT` 和 `DAPR_GRPC_PORT`。 这使用户定义的应用程序能够与 Dapr 进行通信，而无需对 Dapr 端口值进行硬编码。
- **dapr-placement**: 仅用于 actor. 创建映射表，将 actor 实例映射到 pods。
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

#### 为集群扩展启用 Azure CLI 扩展
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

有关配置选项和针对 Dapr 的特定版本等更多信息，请参阅官方 [AKS Dapr 扩展文档](https://docs.microsoft.com/azure/aks/dapr)。