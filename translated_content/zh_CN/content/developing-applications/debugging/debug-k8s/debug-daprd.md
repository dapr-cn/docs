---
type: docs
title: "Debug daprd on Kubernetes"
linkTitle: "Dapr sidecar"
weight: 2000
description: "How to debug the Dapr sidecar (daprd) on your Kubernetes cluster"
---


## 概述

有时有必要了解 Dapr sidecar（daprd） 中发生了什么，它作为 sidecar 运行在您的应用程序旁边，尤其是当您诊断您的 Dapr 应用程序并想知道 Dapr 本身是否出了问题时。 此外，您可能正在为 Kubernetes 上的 Dapr 开发新功能，并希望调试您的代码。

本指南将涵盖如何使用内置的Dapr调试来调试您的 Kubernetes pod 中的 Dapr sidecar 。

## 前提

- 阅读 [本指南]({{< ref kubernetes-deploy.md >}}) 来学习如何将 Dapr 部署到您的 Kubernetes 集群。
- 请按照 [本指南]({{< ref "debug-dapr-services.md">}}) ，以构建下一步将部署的 Dapr 调试二进制文件。


## 在调试模式下初始化 Dapr

如果 Dapr 已安装在您的 Kubernetes 集群中，请先卸载它：

```bash
dapr uninstall -k
```
我们将使用"helm"来安装 Dapr 调试二进制文件。 了解更多信息，请参阅 [使用 helm 安装]({{< ref "kubernetes-deploy.md#install-with-helm-advanced" >}})。

首先配置名为 `values.yml` 的文件。

```yaml
global:
   registry: docker.io/<your docker.io id>
   tag: "dev-linux-amd64"
```

然后从您的克隆 [dapr/dapr 存储库](https://github.com/dapr/dapr) 中转到"dapr"目录，并执行以下命令：

```bash
helm install dapr charts/dapr --namespace dapr-system --values values.yml --wait
```

要启用 daprd 调试模式，您需要在应用程序的部署文件中放置额外的注释 `dapr.io/enable-debug` 。 让我们以 [quickstarts/hello-kubernetes](https://github.com/dapr/quickstarts/tree/master/hello-kubernetes) 为例。 修改如下 'deploy/node.yaml'：

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

The annotation `dapr.io/enable-debug` will hint Dapr injector to inject Dapr sidecar into the debug mode. You can also specify the debug port with annotation `dapr.io/debug-port`, otherwise the default port will be "40000".

Deploy the application with the following command. For the complete guide refer to the [Dapr Kubernetes Quickstart](https://github.com/dapr/quickstarts/tree/master/hello-kubernetes):

```bash
kubectl apply -f ./deploy/node.yaml
```

Figure out the target application's pod name with the following command:

```bash
$ kubectl get pods

NAME                       READY   STATUS        RESTARTS   AGE
nodeapp-78866448f5-pqdtr   1/2     Running       0          14s
```

Then use kubectl's `port-forward` command to expose the internal debug port to the external IDE:

```bash
$ kubectl port-forward nodeapp-78866448f5-pqdtr 40000:40000

Forwarding from 127.0.0.1:40000 -> 40000
Forwarding from [::1]:40000 -> 40000
```

All done. Now you can point to port 40000 and start a remote debug session to daprd from your favorite IDE.

## 相关链接

- [Kubernetes上的 Dapr 概述]({{< ref kubernetes-overview >}})
- [将 dapr 部署到 Kubernetes 集群]({{< ref kubernetes-deploy >}})
- [Debug Dapr services on Kubernetes]({{< ref debug-dapr-services >}})
- [Dapr Kubernetes 快速入门](https://github.com/dapr/quickstarts/tree/master/hello-kubernetes)