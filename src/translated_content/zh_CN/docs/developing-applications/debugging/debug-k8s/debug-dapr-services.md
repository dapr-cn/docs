---
type: docs
title: "在 Kubernetes 上调试 Dapr 控制平面"
linkTitle: "Dapr 控制平面"
weight: 1000
description: "如何在 Kubernetes 集群上调试 Dapr 控制平面"
---

## 概述

有时我们需要了解 Dapr 控制平面（即 Kubernetes 服务）的运行情况，包括 `dapr-sidecar-injector`、`dapr-operator`、`dapr-placement` 和 `dapr-sentry`，特别是在诊断 Dapr 应用程序时，想知道 Dapr 本身是否存在问题。此外，您可能正在为 Kubernetes 上的 Dapr 开发新功能，并希望调试您的代码。

本指南将介绍如何使用 Dapr 调试二进制文件来调试 Kubernetes 集群上的 Dapr 服务。

## 调试 Dapr Kubernetes 服务

### 前置条件

- 熟悉[本指南]({{< ref kubernetes-deploy.md >}})以了解如何将 Dapr 部署到您的 Kubernetes 集群。
- 设置您的[开发环境](https://github.com/dapr/dapr/blob/master/docs/development/developing-dapr.md)
- [Helm](https://github.com/helm/helm/releases)

### 1. 构建 Dapr 调试二进制文件

为了调试 Dapr Kubernetes 服务，需要重新构建所有 Dapr 二进制文件和 Docker 镜像以禁用编译器优化。为此，执行以下命令：

```bash
git clone https://github.com/dapr/dapr.git
cd dapr
make release GOOS=linux GOARCH=amd64 DEBUG=1
```

> 在 Windows 上下载 [MingGW](https://sourceforge.net/projects/mingw/files/MinGW/Extension/make/mingw32-make-3.80-3/) 并使用 `ming32-make.exe` 替代 `make`。

在上述命令中，通过将 'DEBUG' 设置为 '1' 来禁用编译器优化。'GOOS=linux' 和 'GOARCH=amd64' 也是必要的，因为二进制文件将在下一步中打包到基于 Linux 的 Docker 镜像中。

二进制文件可以在 'dapr' 目录下的 'dist/linux_amd64/debug' 子目录中找到。

### 2. 构建 Dapr 调试 Docker 镜像

使用以下命令将调试二进制文件打包到 Docker 镜像中。在此之前，您需要登录您的 docker.io 账户，如果还没有账户，您可能需要考虑在 "https://hub.docker.com/" 注册一个。

```bash
export DAPR_TAG=dev
export DAPR_REGISTRY=<your docker.io id>
docker login
make docker-push DEBUG=1
```

一旦 Dapr Docker 镜像构建并推送到 Docker hub 上，您就可以在 Kubernetes 集群中重新安装 Dapr。

### 3. 安装 Dapr 调试二进制文件

如果 Dapr 已经安装在您的 Kubernetes 集群中，首先卸载它：

```bash
dapr uninstall -k
```

我们将使用 'helm' 来安装 Dapr 调试二进制文件。在接下来的部分中，我们将以 Dapr operator 为例，演示如何在 Kubernetes 环境中配置、安装和调试 Dapr 服务。

首先配置一个 values 文件，包含以下选项：

```yaml
global:
   registry: docker.io/<your docker.io id>
   tag: "dev-linux-amd64"
dapr_operator:
  debug:
    enabled: true
    initialDelaySeconds: 3000
```

{{% alert title="注意" color="primary" %}}
如果您需要调试 Dapr 服务的启动时间，您可以将 `initialDelaySeconds` 配置为一个较长的时间值，例如 "3000" 秒。如果不需要，请将其配置为一个较短的时间值，例如 "3" 秒。
{{% /alert %}}

然后进入本指南开头从 GitHub 克隆的 'dapr' 目录中，如果还没有，执行以下命令：

```bash
helm install dapr charts/dapr --namespace dapr-system --values values.yml --wait
```

### 4. 转发调试端口

要调试目标 Dapr 服务（在本例中为 Dapr operator），其预配置的调试端口需要对您的 IDE 可见。为此，我们需要首先找到目标 Dapr 服务的 pod：

```bash
$ kubectl get pods -n dapr-system -o wide

NAME                                     READY   STATUS    RESTARTS   AGE   IP            NODE       NOMINATED NODE   READINESS GATES
dapr-dashboard-64b46f98b6-dl2n9          1/1     Running   0          61s   172.17.0.9    minikube   <none>           <none>
dapr-operator-7878f94fcd-6bfx9           1/1     Running   1          61s   172.17.0.7    minikube   <none>           <none>
dapr-placement-server-0                  1/1     Running   1          61s   172.17.0.8    minikube   <none>           <none>
dapr-sentry-68c7d4c7df-sc47x             1/1     Running   0          61s   172.17.0.6    minikube   <none>           <none>
dapr-sidecar-injector-56c8f489bb-t2st9   1/1     Running   0          61s   172.17.0.10   minikube   <none>           <none>
```

然后使用 kubectl 的 `port-forward` 命令将内部调试端口暴露给外部 IDE：

```bash
$ kubectl port-forward dapr-operator-7878f94fcd-6bfx9 40000:40000 -n dapr-system

Forwarding from 127.0.0.1:40000 -> 40000
Forwarding from [::1]:40000 -> 40000
```

一切就绪。现在您可以指向端口 40000 并从您喜欢的 IDE 开始远程调试会话。

## 相关链接

- [Kubernetes 上的 Dapr 概述]({{< ref kubernetes-overview >}})
- [将 Dapr 部署到 Kubernetes 集群]({{< ref kubernetes-deploy >}})
- [Dapr Kubernetes 快速入门](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)