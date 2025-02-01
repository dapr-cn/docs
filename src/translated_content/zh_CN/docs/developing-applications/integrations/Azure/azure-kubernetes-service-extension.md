---
type: docs
title: "适用于 Azure Kubernetes Service (AKS) 的 Dapr 扩展"
linkTitle: "适用于 Azure Kubernetes Service (AKS) 的 Dapr 扩展"
description: "通过 Dapr 扩展在您的 Azure Kubernetes Service (AKS) 集群上部署 Dapr"
weight: 4000
---

在 AKS 上安装 Dapr 的推荐方法是使用 AKS Dapr 扩展。该扩展提供以下功能：
- 通过 Azure CLI 命令行参数支持所有原生 Dapr 配置功能
- 可选择自动升级 Dapr 运行时的小版本

{{% alert title="注意" color="warning" %}}
如果通过 AKS 扩展安装 Dapr，最佳实践是继续使用该扩展进行 Dapr 的后续管理，而不是使用 Dapr CLI。混合使用这两种工具可能会导致冲突并产生意外行为。
{{% /alert %}}

使用 AKS 的 Dapr 扩展的先决条件：
- [一个 Azure 订阅](https://azure.microsoft.com/free/?WT.mc_id=A261C142F)
- [最新版本的 Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
- [已有的 AKS 集群](https://learn.microsoft.com/azure/aks/tutorial-kubernetes-deploy-cluster)
- [Azure Kubernetes Service RBAC 管理员角色](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles#azure-kubernetes-service-rbac-admin)

{{< button text="了解有关 AKS 的 Dapr 扩展的更多信息" link="https://learn.microsoft.com/azure/aks/dapr" >}}