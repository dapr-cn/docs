---
type: docs
title: "Azure Kubernetes Service (AKS) 的 Dapr 扩展"
linkTitle: "Azure Kubernetes Service (AKS) 的 Dapr 扩展"
description: "使用 Dapr 扩展在 Azure Kubernetes Service （AKS） 集群上预配 Dapr"
weight: 4000
---

在 AKS 上安装 Dapr 的推荐方法是使用 AKS Dapr 扩展。 该扩展提供以下功能：
- 通过Azure CLI的命令行参数，支持所有原生Dapr配置功能
- 选择自动升级 Dapr 运行时的次要版本的选项

{{% alert title="Note" color="warning" %}}
如果通过 AKS 扩展安装 Dapr，最佳做法是继续使用该扩展来管理 Dapr _而不是 Dapr CLI_. 将这两种工具结合起来可能会导致冲突并导致不良行为。
{{% /alert %}}

使用 Dapr 扩展程序的 AKS 先决条件：
- [Azure 订阅](https://azure.microsoft.com/free/?WT.mc_id=A261C142F)
- [最新版本的 Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
- [一个现有的AKS集群](https://learn.microsoft.com/azure/aks/tutorial-kubernetes-deploy-cluster)
- [Azure Kubernetes Service RBAC 管理员角色](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles#azure-kubernetes-service-rbac-admin)

{{< button text="了解更多关于 Dapr 扩展的 AKS" link="https://learn.microsoft.com/azure/aks/dapr" >}}
