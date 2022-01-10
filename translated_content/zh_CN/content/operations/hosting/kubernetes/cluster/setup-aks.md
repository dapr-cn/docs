---
type: docs
title: "Setup an Azure Kubernetes Service (AKS) cluster"
linkTitle: "Azure Kubernetes Service (AKS)"
weight: 2000
description: >
  如何在 Azure Kubernetes 集群上设置 Dapr。
---

# 设置 Azure Kubernetes 服务集群

## 先决条件

- [Docker](https://docs.docker.com/install/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli?view=azure-cli-latest)

## 部署 Azure Kubernetes 服务集群

本指南将告诉您安装 Azure Kubernetes 服务集群。 如果您需要更多信息，请参阅 [快速启动：使用 Azure CLI 部署 Azure Kubernetes 服务 (AKS) 集群](https://docs.microsoft.com/azure/aks/kubernetes-walkthrough)

1. 登录到 Azure

```bash
az login
```

2. 设置默认订阅

```bash
az account set -s [your_subscription_id]
```

3. 创建资源组

```bash
az group create --name [your_resource_group] --location [region]
```

4. 创建 Azure Kubernetes 服务集群

> **注意：** 要使用特定版本的 Kubernetes 请使用 `--kubernetes-version` (1.13.x 或需要更新版本)

```bash
az aks create --resource-group [your_resource_group] --name [your_aks_cluster_name] --node-count 2 --enable-addons http_application_routing --generate-ssh-keys
```

5. 获取 Azure Kubernetes 集群的访问凭据

```bash
az aks get-credentials -n [your_aks_cluster_name] -g [your_resource_group]
```

## (可选) 安装Helm v3

1. [安装 Helm v3 客户端](https://helm.sh/docs/intro/install/)

> **注意：** 最新的 Dapr helm chart 不再支持 Helm v2。 请按照这篇文章 [Helm 迁移指南](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/) 从Helm v2 迁移到Helm v3。

2. 如果您需要 Kubernetes 仪表板权限，(例如 configmaps is forbidden: User "system:serviceaccount:kube-system:kubernetes-dashboard" cannot list configmaps in the namespace "default" 等等），执行这个命令

```bash
kubectl create clusterrolebinding kubernetes-dashboard -n kube-system --clusterrole=cluster-admin --serviceaccount=kube-system:kubernetes-dashboard
```