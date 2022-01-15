---
type: docs
title: "Set up a KiND cluster"
linkTitle: "KiND"
weight: 1100
description: >
  How to set up Dapr on a KiND cluster.
---

# Set up a KiND cluster

## 先决条件

- [Docker](https://docs.docker.com/install/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

> 注意：对于Windows，在 BIOS 和 [安装 Hyper-V](https://docs.microsoft.com/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v) 启用虚拟化（Vitualization）

## Install and configure KiND

Make sure you follow one of the [Installation](https://kind.sigs.k8s.io/docs/user/quick-start) options for KiND.

In case you are using Docker Desktop, double-check that you have performed the recommended [settings](https://kind.sigs.k8s.io/docs/user/quick-start#settings-for-docker-desktop) (4 CPUs and 8 GiB of RAM available to Docker Engine).

## Configure and create the KiND cluster

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

This is going to request KiND to spin up a kubernetes cluster comprised of a control plane and two worker nodes. It also allows for future setup of ingresses and exposes container ports to the host machine.

2. Run the `kind create cluster` providing the cluster configuration file:

```bash
kind create cluster --config kind-cluster-config.yaml
```

Wait until the cluster is created, the output should look like this:

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

Once Dapr finishes initializing its core components are ready to be used on the cluster.

To verify the status of these components run:
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

2. Forward a port to [Dapr dashboard](https://docs.dapr.io/reference/cli/dapr-dashboard/):

```bash
dapr dashboard -k -p 9999
```

So that you can validate that the setup finished successfully by navigating to `http://localhost:9999`.

## 下一步
- [试用Dapr快速入门]({{< ref quickstarts.md >}})

