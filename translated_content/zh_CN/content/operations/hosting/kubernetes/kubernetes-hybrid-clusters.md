---
type: docs
title: "部署到 Linux/Windows Kubernetes 的混合集群"
linkTitle: "Hybrid clusters"
weight: 60000
description: "如何在 Kubernetes 上运行带有 Windows 节点的 Dapr 应用"
---

Dapr 支持在带有 windows 节点的 kubernetes 集群上运行。 您可以只在 Windows 上运行您的 Dapr 微服务，或只在 Linux 上运行，或者两者兼而有之。 这对那些可能会将遗留应用零散迁移到 Dapr Kubernetes 集群的用户很有帮助。

Kubernetes 使用了一个叫做节点亲和性的概念，这样你就可以表示你的应用是想在 Linux 节点还是 Windows 节点上启动。 当部署到一个同时拥有 Windows 和 Linux 节点的集群时，你必须为你的应用提供亲和性规则，否则 Kubernetes 调度器可能会在错误的节点类型上启动你的应用。

## 前提

您需要一个带有Windows节点的 Kubernetes 集群。 许多 Kubernetes 提供商支持自动配置启用 Windows 的 Kubernetes 集群。

1. 按照您的首选提供商的说明来设置一个带有Windows功能的集群。

- [在 Azure AKS 上设置 Windows](https://docs.microsoft.com/azure/aks/windows-container-cli)
- [在 AWS EKS 上设置 Windows](https://docs.aws.amazon.com/eks/latest/userguide/windows-support.html)
- [在 Google Cloud GKE 上设置 Windows](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-cluster-windows)

2. 一旦你设置了集群，你应该看到它同时有 Windows 和 Linux 节点可用

   ```bash
   kubectl get nodes -o wide
   NAME                                STATUS   ROLES   AGE     VERSION   INTERNAL-IP    EXTERNAL-IP      OS-IMAGE                         KERNEL-VERSION      CONTAINER-RUNTIME
   aks-nodepool1-11819434-vmss000000   Ready    agent   6d      v1.17.9   10.240.0.4     <none>        Ubuntu 16.04.6    LTS               4.15.0-1092-azure   docker://3.0.10+azure
   aks-nodepool1-11819434-vmss000001   Ready    agent   6d      v1.17.9   10.240.0.35    <none>        Ubuntu 16.04.6    LTS               4.15.0-1092-azure   docker://3.0.10+azure
   aks-nodepool1-11819434-vmss000002   Ready    agent   5d10h   v1.17.9   10.240.0.129   <none>        Ubuntu 16.04.6    LTS               4.15.0-1092-azure   docker://3.0.10+azure
   akswin000000                        Ready    agent   6d      v1.17.9   10.240.0.66    <none>        Windows Server 2019    Datacenter   10.0.17763.1339     docker://19.3.5
   akswin000001                        Ready    agent   6d      v1.17.9   10.240.0.97    <none>        Windows Server 2019    Datacenter   10.0.17763.1339     docker://19.3.5
   ```
## 安装 Dapr 控制面板

If you are installing using the Dapr CLI or via a helm chart, simply follow the normal deployment procedures: [Installing Dapr on a Kubernetes cluster]({{< ref "install-dapr-selfhost.md#installing-Dapr-on-a-kubernetes-cluster" >}})

关联性将被自动设置为 `kubernetes.io/os=linux`。 这对于大多数用户来说是足够的，因为Kubernetes至少需要一个Linux节点池。

> **注意：** Dapr 控制面板容器是为windows和linux构建和测试的，但是，我们一般建议使用linux 控制面板容器。 它们往往较小，用户基础也大得多。

如果您理解以上内容，但想要将 Dapr 控制面板部署到Windows，您可以通过设置这样做：

```
helm install dapr dapr/dapr --set global.daprControlPlaneOs=windows
```

## 安装 Dapr 应用程序

### Windows 应用程序
为了在 Windows 上启动 Dapr 应用程序，您需要首先创建一个安装应用程序的 Docker 容器。 指南见 [开始：为容器准备 Windows](https://docs.microsoft.com/virtualization/windowscontainers/quick-start/set-up-environment)。 一旦你拥有一个带有应用程序的Docker container，创建一个 deployment YAML 文件，节点亲和性设置为 kubernetes.io/os: windows。

1. 创建一个 deployment YAML

   这里是一个示例 deployment ，节点关联性设置为“windows”。 根据您的应用程序的需要修改。
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: yourwinapp
     labels:
       app: applabel
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: applablel
     template:
       metadata:
         labels:
           app: applabel
         annotations:
           dapr.io/enabled: "true"
           dapr.io/id: "addapp"
           dapr.io/port: "6000"
           dapr.io/config: "appconfig"
       spec:
         containers:
         - name: add
           image: yourreponsitory/your-windows-dapr-container:your-tag
           ports:
           - containerPort: 6000
           imagePullPolicy: Always
         affinity:
           nodeAffinity:
             requiredDuringSchedulingIgnoredDuringExecution:
               nodeSelectorTerms:
                 - matchExpressions:
                   - key: kubernetes.io/os
                     operator: In
                     values:
                     - windows
   ```
   这个 deployment yaml 将与任何其它的 dapr 应用程序相同，还有一个额外的 spec.template.spec.affinity 部分如上文所示。

2. 部署到您的 Kubernetes 集群

   ```bash
   kubectl apply -f deploy_windows.yaml
   ```

### Linux 应用程序
如果您已经在 Linux 上有运行的 dapr 应用程序， 您仍然需要像以上添加亲和性规则，只不过要选择 linux 亲和性。

1. 创建一个 deployment YAML

   这里是一个示例 deployment，节点亲和性设置为“linux”。 根据您的应用程序的需要修改。
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: yourlinuxapp
     labels:
       app: yourlabel
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: yourlabel
     template:
       metadata:
         labels:
           app: yourlabel
         annotations:
           dapr.io/enabled: "true"
           dapr.io/id: "addapp"
           dapr.io/port: "6000"
           dapr.io/config: "appconfig"
       spec:
         containers:
         - name: add
           image: yourreponsitory/your-application:your-tag
           ports:
           - containerPort: 6000
           imagePullPolicy: Always
         affinity:
           nodeAffinity:
             requiredDuringSchedulingIgnoredDuringExecution:
               nodeSelectorTerms:
                 - matchExpressions:
                   - key: kubernetes.io/os
                     operator: In
                     values:
                     - linux
   ```

2. 部署到您的 Kubernetes 集群

   ```bash
   kubectl apply -f deploy_linux.yaml
   ```

## 清理

```bash
kubectl delete -f deploy_linux.yaml
kubectl delete -f deploy_windows.yaml
helm uninstall dapr
```

## 相关链接

- 通过 [官方的 Kubernetes 文档](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) 获取更高级的节点亲和性配置的案例
- [开始：为容器准备 Windows](https://docs.microsoft.com/virtualization/windowscontainers/quick-start/set-up-environment)
- [在 Azure AKS 上设置一个启用了 Windows Kubernetes 的集群](https://docs.microsoft.com/azure/aks/windows-container-cli)
- [在 AWS EKS 上设置一个启用了 Windows Kubernetes 的集群](https://docs.aws.amazon.com/eks/latest/userguide/windows-support.html)
- [在 Google Cloud GKE 上设置 Windows](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-cluster-windows)

