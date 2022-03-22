---
type: docs
title: "设置 Google Kubernetes Engine （GKE） 集群"
linkTitle: "Google Kubernetes Engine (GKE)"
weight: 3000
description: "设置 Google Kubernetes 服务集群"
---

### 先决条件

- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Google Cloud SDK](https://cloud.google.com/sdk)

## 创建新群集
```bash
$ gcloud services enable container.googleapis.com && \
  gcloud container clusters create $CLUSTER_NAME \
  --zone $ZONE \
  --project $PROJECT_ID
```
更多选项请参阅 [Google 云SDK 文档](https://cloud.google.com/sdk/gcloud/reference/container/clusters/create)， 或者通过 [云控制台](https://console.cloud.google.com/kubernetes) 创建集群以获取更多交互体验。

{{% alert title="For private GKE clusters" color="warning" %}}
Sidecar injection will not work for private clusters without extra steps. An automatically created firewall rule for master access does not open port 4000. This is needed for Dapr sidecar injection.

审查相关防火墙规则：
```bash
$ gcloud compute firewall-rules list --filter="name~gke-${CLUSTER_NAME}-[0-9a-z]*-master"
```

要替换现有的规则并允许Kubernetes主访问端口4000：
```bash
$ gcloud compute firewall-rules update <firewall-rule-name> --allow tcp:10250,tcp:443,tcp:4000
```
{{% /alert %}}

## 获取您的 `kubectl` 的凭据

```bash
$ gcloud container clusters get-credentials $CLUSTER_NAME \
    --zone $ZONE \
    --project $PROJECT_ID
```

## (可选) 安装Helm v3

1. [安装 Helm v3 客户端](https://helm.sh/docs/intro/install/)

> **注意：** 最新的 Dapr helm chart 不再支持 Helm v2。 请按照这篇文章 [Helm 迁移指南](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/) 从Helm v2 迁移到Helm v3。

2. 如果您需要 Kubernetes 仪表板权限，(例如 configmaps is forbidden: User "system:serviceaccount:kube-system:kubernetes-dashboard" cannot list configmaps in the namespace "default" 等等），执行这个命令

```bash
kubectl create clusterrolebinding kubernetes-dashboard -n kube-system --clusterrole=cluster-admin --serviceaccount=kube-system:kubernetes-dashboard
```
