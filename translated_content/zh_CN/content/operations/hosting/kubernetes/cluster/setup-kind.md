---
type: docs
title: "设置 KiND 集群"
linkTitle: "KiND"
weight: 1100
description: >
  如何在 KiND 集群上设置 Dapr。
---

# 设置 KiND 集群

## 先决条件

- [Docker](https://docs.docker.com/install/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

> 注意：对于 Windows，请在 BIOS 中启用虚拟化，并[安装 Hyper-V](https://docs.microsoft.com/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v)

## 安装并配置 KiND

确保遵循 KiND 的 [安装](https://kind.sigs.k8s.io/docs/user/quick-start) 选项之一。

如果您使用的是 Docker Desktop，请检查您是否已执行建议的 [设置](https://kind.sigs.k8s.io/docs/user/quick-start#settings-for-docker-desktop) (Docker 引擎可用 4 个 CPU 和 8 GiB RAM)。

## 配置并创建 KiND 集群

1. 创建名为 `kind-cluster-config.yaml` 的文件, 并粘贴以下内容:
```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 8081
    protocol: TCP
  - containerPort: 443
    hostPort: 8443
    protocol: TCP
- role: worker
- role: worker
```

这将要求 KiND 启动一个由一个控制平面和两个工作节点组成的 kubernetes 集群。 它还允许将来设置 ingress 和向主机暴露容器端口。

2. 运行 `kind create cluster` 并提供群集配置文件：

```bash
kind create cluster --config kind-cluster-config.yaml
```

等待集群创建完成，输出应如下所示：

```md
Creating cluster "kind" ...
 ✓ Ensuring node image (kindest/node:v1.21.1) 🖼
 ✓ Preparing nodes 📦 📦 📦
 ✓ Writing configuration 📜
 ✓ Starting control-plane 🕹️
 ✓ Installing CNI 🔌
 ✓ Installing StorageClass 💾
 ✓ Joining worker nodes 🚜
Set kubectl context to "kind-kind"
You can now use your cluster with:

kubectl cluster-info --context kind-kind

Thanks for using kind! 😊
```

## Dapr

1. 初始化 Dapr 运行环境:
```bash
dapr init --kubernetes
```

Dapr 完成初始化后，其核心组件就可以在集群上使用。

要验证这些组件的状态，请运行：
```bash
dapr status -k
```
输出显示应该如下方所示：

```md
  NAME                   NAMESPACE    HEALTHY  STATUS   REPLICAS  VERSION  AGE  CREATED
  dapr-sentry            dapr-system  True     Running  1         1.5.1    53s  2021-12-10 09:27.17
  dapr-operator          dapr-system  True     Running  1         1.5.1    53s  2021-12-10 09:27.17
  dapr-sidecar-injector  dapr-system  True     Running  1         1.5.1    53s  2021-12-10 09:27.17
  dapr-dashboard         dapr-system  True     Running  1         0.9.0    53s  2021-12-10 09:27.17
  dapr-placement-server  dapr-system  True     Running  1         1.5.1    52s  2021-12-10 09:27.18
```

2. 将端口转发到 [Dapr 仪表板](https://docs.dapr.io/reference/cli/dapr-dashboard/)：

```bash
dapr dashboard -k -p 9999
```

这样，您就可以通过导航到 `http://localhost:9999` 来验证安装是否成功完成。

## 下一步
- [试用 Dapr 快速入门]({{< ref quickstarts.md >}})

