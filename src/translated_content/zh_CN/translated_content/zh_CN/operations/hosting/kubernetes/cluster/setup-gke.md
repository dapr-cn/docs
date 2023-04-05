---
type: docs
title: "设置 Google Kubernetes Engine （GKE） 集群"
linkTitle: "Google Kubernetes Engine (GKE)"
weight: 3000
description: "Setup a Google Kubernetes Engine cluster"
---

### 前期准备

- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Google Cloud SDK](https://cloud.google.com/sdk)

## Create a new cluster
```bash
$ gcloud services enable container.googleapis.com && \
  gcloud container clusters create $CLUSTER_NAME \
  --zone $ZONE \
  --project $PROJECT_ID
```
For more options refer to the [Google Cloud SDK docs](https://cloud.google.com/sdk/gcloud/reference/container/clusters/create), or instead create a cluster through the [Cloud Console](https://console.cloud.google.com/kubernetes) for a more interactive experience.

{{% alert title="For private GKE clusters" color="warning" %}}
Sidecar 注入不适用于没有额外步骤的私有集群。 为 master 节点自动创建的防火墙规则不会打开4000端口。 这是 Dapr sidecar 注入所必需的。

审查相关防火墙规则：
```bash
$ gcloud compute firewall-rules list --filter="name~gke-${CLUSTER_NAME}-[0-9a-z]*-master"
```

要替换现有的规则并允许 Kubernetes master 访问端口4000：
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

## (可选) 安装 Helm v3

1. [Install Helm v3 client](https://helm.sh/docs/intro/install/)

> **注意：** 最新的 Dapr helm chart 不再支持 Helm v2。 请按照这篇文章 [Helm 迁移指南](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/) 从Helm v2 迁移到Helm v3。

2. 如果您需要 Kubernetes 仪表板权限，(例如 configmaps is forbidden: User "system:serviceaccount:kube-system:kubernetes-dashboard" cannot list configmaps in the namespace "default" 等等），执行这个命令

```bash
kubectl create clusterrolebinding kubernetes-dashboard -n kube-system --clusterrole=cluster-admin --serviceaccount=kube-system:kubernetes-dashboard
```
