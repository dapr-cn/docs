---
type: docs
title: "Setup a Google Kubernetes Engine cluster"
linkTitle: "Google Kubernetes Engine"
weight: 3000
description: "Setup a Google Kubernetes Engine cluster"
---

### 前期准备

- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
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
Sidecar injection will not work for private clusters without extra steps. An automatically created firewall rule for master access does not open port 4000. This is needed for Dapr sidecar injection. An automatically created firewall rule for master access does not open port 4000. This is needed for Dapr sidecar injection.

To review the relevant firewall rule:
```bash
$ gcloud compute firewall-rules list --filter="name~gke-${CLUSTER_NAME}-[0-9a-z]*-master"
```

To replace the existing rule and allow kubernetes master access to port 4000:
```bash
$ gcloud compute firewall-rules update <firewall-rule-name> --allow tcp:10250,tcp:443,tcp:4000
```
{{% /alert %}}

## Retrieve your credentials for `kubectl`

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
