---
type: docs
title: "在 Kubernetes 上调试 daprd"
linkTitle: "Dapr sidecar"
weight: 2000
description: "如何在 Kubernetes 集群上调试 Dapr sidecar (daprd)"
---

## 概述

有时我们需要了解 Dapr sidecar (daprd) 的运行情况，特别是在诊断 Dapr 应用程序时，怀疑 Dapr 本身是否存在问题。此外，您可能正在为 Kubernetes 上的 Dapr 开发新功能，并需要调试您的代码。

本指南介绍如何使用 Dapr 的内置调试功能来调试 Kubernetes pod 中的 Dapr sidecar。要了解如何查看日志和排查 Kubernetes 中的 Dapr 问题，请参阅[配置和查看 Dapr 日志指南]({{< ref "logs-troubleshooting.md#logs-in-kubernetes-mode" >}})。

## 前提条件

- 请参阅[本指南]({{< ref kubernetes-deploy.md >}})了解如何将 Dapr 部署到您的 Kubernetes 集群。
- 按照[本指南]({{< ref "debug-dapr-services.md">}})构建您将在下一步中部署的 Dapr 调试二进制文件。

## 初始化 Dapr 调试模式

如果 Dapr 已经安装在您的 Kubernetes 集群中，请先卸载它：

```bash
dapr uninstall -k
```

我们将使用 'helm' 来安装 Dapr 调试二进制文件。有关更多信息，请参阅[使用 Helm 安装]({{< ref "kubernetes-deploy.md#install-with-helm-advanced" >}})。

首先配置一个名为 `values.yml` 的值文件，选项如下：

```yaml
global:
   registry: docker.io/<your docker.io id>
   tag: "dev-linux-amd64"
```

然后进入从您的克隆 [dapr/dapr 仓库](https://github.com/dapr/dapr) 中的 'dapr' 目录，并执行以下命令：

```bash
helm install dapr charts/dapr --namespace dapr-system --values values.yml --wait
```

要为 daprd 启用调试模式，您需要在应用程序的部署文件中添加一个额外的注解 `dapr.io/enable-debug`。让我们以 [quickstarts/hello-kubernetes](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes) 为例。像下面这样修改 'deploy/node.yaml'：

```diff
diff --git a/hello-kubernetes/deploy/node.yaml b/hello-kubernetes/deploy/node.yaml
index 23185a6..6cdb0ae 100644
--- a/hello-kubernetes/deploy/node.yaml
+++ b/hello-kubernetes/deploy/node.yaml
@@ -33,6 +33,7 @@ spec:
         dapr.io/enabled: "true"
         dapr.io/app-id: "nodeapp"
         dapr.io/app-port: "3000"
+        dapr.io/enable-debug: "true"
     spec:
       containers:
       - name: node
```

注解 `dapr.io/enable-debug` 会指示 Dapr 注入器将 Dapr sidecar 置于调试模式。您还可以通过注解 `dapr.io/debug-port` 指定调试端口，否则默认端口将是 "40000"。

使用以下命令部署应用程序。完整指南请参阅 [Dapr Kubernetes 快速入门](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)：

```bash
kubectl apply -f ./deploy/node.yaml
```

使用以下命令找出目标应用程序的 pod 名称：

```bash
$ kubectl get pods

NAME                       READY   STATUS        RESTARTS   AGE
nodeapp-78866448f5-pqdtr   1/2     Running       0          14s
```

然后使用 kubectl 的 `port-forward` 命令将内部调试端口暴露给外部 IDE：

```bash
$ kubectl port-forward nodeapp-78866448f5-pqdtr 40000:40000

Forwarding from 127.0.0.1:40000 -> 40000
Forwarding from [::1]:40000 -> 40000
```

一切就绪。现在您可以指向端口 40000 并从您喜欢的 IDE 开始远程调试会话到 daprd。

## 常用的 `kubectl` 命令

在调试 daprd 和在 Kubernetes 上运行的应用程序时，使用以下常用的 `kubectl` 命令。

获取所有 pod、事件和服务：

```bash
kubectl get all
kubectl get all --n <namespace>
kubectl get all --all-namespaces
```

分别获取每个：

```bash
kubectl get pods
```

```bash
kubectl get events --n <namespace>
kubectl get events --sort-by=.metadata.creationTimestamp --n <namespace>
```

```bash
kubectl get services
```

检查日志：

```bash
kubectl logs <podId> daprd
kubectl logs <podId> <myAppContainerName>
kuebctl logs <deploymentId> daprd
kubectl logs <deploymentId> <myAppContainerName>
```

```bash
kubectl describe pod <podId>
kubectl describe deploy <deployId>
kubectl describe replicaset <replicasetId>
```

通过运行以下命令重启 pod：

```bash
kubectl delete pod <podId>
```

这将导致 `replicaset` 控制器在删除后重启 pod。

## 观看演示

在 [Dapr 社区电话 #36](https://youtu.be/pniLPRbuLD8?si=bGid7oYSp9cThtiI&t=838) 中观看关于在 Kubernetes 上排查 Dapr 问题的演示。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/pniLPRbuLD8?si=bGid7oYSp9cThtiI&amp;start=838" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 相关链接

- [Kubernetes 上的 Dapr 概述]({{< ref kubernetes-overview >}})
- [将 Dapr 部署到 Kubernetes 集群]({{< ref kubernetes-deploy >}})
- [在 Kubernetes 上调试 Dapr 服务]({{< ref debug-dapr-services >}})
- [Dapr Kubernetes 快速入门](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)
