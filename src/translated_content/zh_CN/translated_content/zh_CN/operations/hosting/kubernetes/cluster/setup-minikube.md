---
type: docs
title: "设置 Minikube 集群"
linkTitle: "Minikube"
weight: 1000
description: >
  如何在 Minikube 集群中设置 Dapr。
---

# 设置 Minikube 集群

## Prerequisites

- [Docker](https://docs.docker.com/install/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)

> Note: For Windows, enable Virtualization in BIOS and [install Hyper-V](https://docs.microsoft.com/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v)

## 启动 Minikube 集群

1. (optional) Set the default VM driver

```bash
minikube config set vm-driver [driver_name]
```

> 注意：有关支持的驱动程序以及如何安装插件的详细信息，请参阅 [驱动程序](https://minikube.sigs.k8s.io/docs/reference/drivers/) 。

2. 启动集群：使用 1.13.x 或更新版本的 Kubernetes `--kubernetes-version`

```bash
minikube start --cpus=4 --memory=4096
```

3. 启用仪表盘和 ingress 插件

```bash
# 启用 dashboard
minikube addons enable dashboard

# 启用 ingress
minikube addons enable ingress
```

## (可选) 安装 Helm v3

1. [安装 Helm v3 客户端](https://helm.sh/docs/intro/install/)

> **注意：** 最新的 Dapr helm chart 不再支持 Helm v2。 请按照这篇文章 [Helm 迁移指南](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/) 从Helm v2 迁移到Helm v3。

### 疑难解答

1. 负载均衡器的外部 IP 地址不显示在 `kubectl get svc`

在 Minikube 中， `kubectl get svc` 中的 EXTERNAL-IP 显示服务处于 `<pending>` 状态。 在这种情况下，您可以运行 `minikube service [service_name]` 在没有外部 IP 地址的情况下打开您的服务。

```bash
$ kubectl get svc
NAME                        TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)            AGE
...
calculator-front-end        LoadBalancer   10.103.98.37     <pending>     80:30534/TCP       25h
calculator-front-end-dapr   ClusterIP      10.107.128.226   <none>        80/TCP,50001/TCP   25h
...

$ minikube service calculator-front-end
|-----------|----------------------|-------------|---------------------------|
| NAMESPACE |         NAME         | TARGET PORT |            URL            |
|-----------|----------------------|-------------|---------------------------|
| default   | calculator-front-end |             | http://192.168.64.7:30534 |
|-----------|----------------------|-------------|---------------------------|
🎉  Opening kubernetes service  default/calculator-front-end in default browser...
```
