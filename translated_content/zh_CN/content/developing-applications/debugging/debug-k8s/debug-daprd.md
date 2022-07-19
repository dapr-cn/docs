---
type: docs
title: "在 Kubernetes 模式下调试 Dapr"
linkTitle: "Dapr sidecar"
weight: 2000
description: "如何在你的 Kubernetes 集群中调试 Dapr sidecar(daprd)"
---


## 概述

有时有必要了解 Dapr sidecar（daprd） 中发生了什么，它作为 sidecar 运行在您的应用程序旁边，尤其是当您诊断您的 Dapr 应用程序并想知道 Dapr 本身是否出了问题时。 此外，你可能正在为 Kubernetes 中的 Dapr 开发一个新功能，并且想调试你的代码。

本指南将涵盖如何使用内置的 Dapr 调试来调试您的 Kubernetes pod 中的 Dapr sidecar 。

## 前提

- 阅读 [Kubernetes部署指南]({{< ref kubernetes-deploy.md >}}) 来学习如何将 Dapr 部署到您的 Kubernetes 集群。
- 请按照 [调试dapr服务指南]({{< ref "debug-dapr-services.md">}}) ，以构建下一步将部署的 Dapr 调试二进制文件。


## 在调试模式下初始化 Dapr

如果您的 Kubernetes 集群中已经安装了 Dapr，请先卸载它：

```bash
dapr uninstall -k
```
我们将使用 "helm" 来安装 Dapr 调试二进制文件。 了解更多信息，请参阅 [使用 helm 安装]({{< ref "kubernetes-deploy.md#install-with-helm-advanced" >}})。

首先配置名为 `values.yml` 的文件。

```yaml
global:
   registry: docker.io/<your docker.io id>
   tag: "dev-linux-amd64"
```

然后进入到 "dapr" 目录中，如果你没有这个目录，请参照本指南开始的说明，从 GithHub 中克隆下来。然后执行下面的命令:

```bash
helm install dapr charts/dapr --namespace dapr-system --values values.yml --wait
```

要启用 daprd 的调试模式，您需要在应用程序的部署文件中添加额外的注解 `dapr.io/enable-debug` 。 让我们以 [quickstarts/hello-kubernetes](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes) 为例。 修改如下 'deploy/node.yaml'：

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

`dapr.io/enable-debug` 注解将提示 Dapr 注入器将 Dapr sidecar 注入到调试模式。 您也可以使用注解 `dapr.io/debug-port`指定调试端口，否则默认端口将是“40000”。

使用下面的命令来部署应用。 完整指南请参照 [Dapr Kubernetes 快速入门](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)。

```bash
kubectl apply -f ./deploy/node.yaml
```

下面的命令显示目标应用程序的 pod 名称：

```bash
$ kubectl get pods

NAME                       READY   STATUS        RESTARTS   AGE
nodeapp-78866448f5-pqdtr   1/2     Running       0          14s
```

然后使用 kubectl 的 `port-forward` 命令将内部调试端口曝光到外部 IDE ：

```bash
$ kubectl port-forward nodeapp-78866448f5-pqdtr 40000:40000

Forwarding from 127.0.0.1:40000 -> 40000
Forwarding from [::1]:40000 -> 40000
```

全部完成！ 现在您可以从您喜欢的 IDE 中使用40000端口开启远程调试了。

## 相关链接

- [Kubernetes上的 Dapr 概述]({{< ref kubernetes-overview >}})
- [将 dapr 部署到 Kubernetes 集群]({{< ref kubernetes-deploy >}})
- [在 Kubernetees 中调试 Dapr 服务]({{< ref debug-dapr-services >}})
- [Dapr Kubernetes 快速入门](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)