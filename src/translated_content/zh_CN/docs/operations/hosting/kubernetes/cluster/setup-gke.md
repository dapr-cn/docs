---
type: docs
title: "设置 Google Kubernetes Engine (GKE) 集群"
linkTitle: "Google Kubernetes Engine (GKE)"
weight: 3000
description: "设置 Google Kubernetes Engine 集群"
---

### 前提条件

- 安装: 
   - [kubectl](https://kubernetes.io/docs/tasks/tools/)
   - [Google Cloud SDK](https://cloud.google.com/sdk)

## 创建新集群

运行以下命令以创建 GKE 集群：

```bash
$ gcloud services enable container.googleapis.com && \
  gcloud container clusters create $CLUSTER_NAME \
  --zone $ZONE \
  --project $PROJECT_ID
```
更多选项请参阅：
- [Google Cloud SDK 文档](https://cloud.google.com/sdk/gcloud/reference/container/clusters/create)。
- 通过 [Cloud Console](https://console.cloud.google.com/kubernetes) 创建集群以获得更具互动性的体验。

## 私有 GKE 集群的 Sidecar 注入

_**私有集群的 Sidecar 注入需要额外步骤。**_

在私有 GKE 集群中，自动创建的主访问防火墙规则未开放 Dapr 所需的 4000 端口用于 Sidecar 注入。

查看相关的防火墙规则：

```bash
$ gcloud compute firewall-rules list --filter="name~gke-${CLUSTER_NAME}-[0-9a-z]*-master"
```

更新现有规则以允许 Kubernetes 主节点访问 4000 端口：

```bash
$ gcloud compute firewall-rules update <firewall-rule-name> --allow tcp:10250,tcp:443,tcp:4000
```

## 获取 `kubectl` 的凭据

运行以下命令以获取您的凭据：

```bash
$ gcloud container clusters get-credentials $CLUSTER_NAME \
    --zone $ZONE \
    --project $PROJECT_ID
```

## 安装 Helm v3（可选）

如果您使用 Helm，请安装 [Helm v3 客户端](https://helm.sh/docs/intro/install/)。

{{% alert title="重要" color="warning" %}}
最新的 Dapr Helm chart 不再支持 Helm v2。请参考 [从 Helm v2 迁移到 Helm v3](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/)。
{{% /alert %}}

## 故障排除

### Kubernetes 仪表板权限

如果您收到类似以下的错误消息：

```
configmaps is forbidden: User "system:serviceaccount:kube-system:kubernetes-dashboard" cannot list configmaps in the namespace "default"
``` 

请执行此命令：

```bash
kubectl create clusterrolebinding kubernetes-dashboard -n kube-system --clusterrole=cluster-admin --serviceaccount=kube-system:kubernetes-dashboard
```

## 相关链接
- [了解更多关于 GKE 集群的信息](https://cloud.google.com/kubernetes-engine/docs)
- [尝试 Dapr 快速入门]({{< ref quickstarts.md >}})
- 学习如何在您的集群上 [部署 Dapr]({{< ref kubernetes-deploy.md >}})
- [在 Kubernetes 上升级 Dapr]({{< ref kubernetes-upgrade.md >}})
- [Kubernetes 生产指南]({{< ref kubernetes-production.md >}})
