---
type: docs
title: "Kubernetes 中的 Dapr 调试面板"
linkTitle: "Dapr控制面板"
weight: 1000
description: "在 Kubernetes 中如何在 Dapr 控制面板中进行调试"
---

## 概述

Sometimes it is necessary to understand what's going on in Dapr control plane (aka, Kubernetes services), including `dapr-sidecar-injector`, `dapr-operator`, `dapr-placement`, and `dapr-sentry`, especially when you diagnose your Dapr application and wonder if there's something wrong in Dapr itself. Additionally, you may be developing a new feature for Dapr on Kubernetes and want to debug your code.

这份指南将展示在 Kubernetes 集群中如何使用 Dapr 调试二进制文件对 Dapr 服务进行调试。

## 调试 Dapr Kubernetes 服务

### 前提

- Familiarize yourself with [this guide]({{< ref kubernetes-deploy.md >}}) to learn how to deploy Dapr to your Kubernetes cluster.
- Setup your [dev environment](https://github.com/dapr/dapr/blob/master/docs/development/developing-dapr.md)
-  [Helm](https://github.com/helm/helm/releases)

### 1. 构建 Dapr 调试二进制文件

为了调试 Dapr Kubernetes 服务，需要重新构建所有的 Dapr 二进制文件 和 Docker 镜像来禁用编译器优化。 要做到这一点，请运行以下命令：

```bash
git clone https://github.com/dapr/dapr.git
cd dapr
make release GOOS=linux GOARCH=amd64 DEBUG=1
```
> Windows：下载 [MingGW](https://sourceforge.net/projects/mingw/files/MinGW/Extension/make/mingw32-make-3.80-3/) ，并使用 `ming32-make.exe` 而不是 `make`。

在上述命令中，“DEBUG” 设定为“1”可禁用编译器优化。 'GOOS=linux' 和 'GOARCH=amd64' 也是必要的，因为二进制文件将在下一步中打包到基于 Linux 的 Docker 镜像。

可以在 “dapr” 目录下的 'dist/linux_amd64/debug' 子目录下找到二进制文件。

### 2. 构建 Dapr 调试 Docker 镜像

使用下面的命令将调试二进制文件打包成 Docker 镜像。 在此之前，你需要登录到你的 docker 账号，如果还没有 docker 账号，可以在 "https://hub.docker.com/" 中注册。

```bash
export DAPR_TAG=dev
export DAPR_REGISTRY=<your docker.io id>
docker login
make docker-push DEBUG=1
```

一旦 Dapr 镜像构建完成并推送到 Docker hub 中，你就已经做好了在你的 Kubernetes 中重新安装 Dapr 的准备。

### 3. 安装 Dapr 调试二进制文件

如果您的 Kubernetes 集群中已经安装了 Dapr，请先卸载它：

```bash
dapr uninstall -k
```

我们将使用 "helm" 来安装 Dapr 调试二进制文件。 接下来的章节，我们将使用 Dapr Operator 来演示在 Kubernetes 环境中如何配置、安装和调试 Dapr 服务。

首先配置名为 `values.yml` 的文件。

```yaml
global:
   registry: docker.io/<your docker.io id>
   tag: "dev-linux-amd64"
dapr_operator:
  debug:
    enabled: true
    initialDelaySeconds: 3000
```

{{% alert title="Notice" color="primary" %}}
如果你需要调试 Dapr 服务的启动阶段， 可以将配置中的 `initialDelaySeconds` 设定到一个很长的时间值，例如："3000" 秒。 除此之外的情况，请将其配置为一个短时间值，如："3"秒。
{{% /alert %}}

然后进入到 "dapr" 目录中，如果你没有这个目录，请参照本指南开始的说明，从 GithHub 中克隆下来。然后执行下面的命令:

```bash
helm install dapr charts/dapr --namespace dapr-system --values values.yml --wait
```

### 4. 转发调试端口

要调试目标 Dapr 服务 (在这种情况下为 Dapr Operator)，其预配置的调试端口需要是对你的 IDE 可见。 为了做到这一点，我们需要首先找到目标 Dapr 服务的节点：

```bash
$ kubectl get pods -n dapr-system -o wide

NAME                                     READY   STATUS    RESTARTS   AGE   IP            NODE       NOMINATED NODE   READINESS GATES
dapr-dashboard-64b46f98b6-dl2n9          1/1     Running   0          61s   172.17.0.9    minikube   <none>           <none>
dapr-operator-7878f94fcd-6bfx9           1/1     Running   1          61s   172.17.0.7    minikube   <none>           <none>
dapr-placement-server-0                  1/1     Running   1          61s   172.17.0.8    minikube   <none>           <none>
dapr-sentry-68c7d4c7df-sc47x             1/1     Running   0          61s   172.17.0.6    minikube   <none>           <none>
dapr-sidecar-injector-56c8f489bb-t2st9   1/1     Running   0          61s   172.17.0.10   minikube   <none>           <none>
```

然后使用 kubectl 的 `port-forward` 命令将内部调试端口曝光到外部 IDE ：

```bash
$ kubectl port-forward dapr-operator-7878f94fcd-6bfx9 40000:40000 -n dapr-system

Forwarding from 127.0.0.1:40000 -> 40000
Forwarding from [::1]:40000 -> 40000
```

全部完成！ 现在您可以从您喜欢的 IDE 中使用40000端口开启远程调试了。

## 相关链接

- [Kubernetes 上的 Dapr 概述]({{< ref kubernetes-overview >}})
- [Deploy Dapr to a Kubernetes cluster]({{< ref kubernetes-deploy >}})
- [Dapr Kubernetes 快速入门](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)
