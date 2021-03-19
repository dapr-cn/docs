---
type: docs
title: "设置 Minikube 集群"
linkTitle: "Minikube"
weight: 2000
description: >
  如何在 Minikube 集群中设置 Dapr。
---

# 设置 Minikube 集群

## 前期准备

- [Docker](https://docs.docker.com/install/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)

> 注意：对于Windows，在 BIOS 和 [安装 Hyper-V](https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v) 启用虚拟化（Vitualization）

## 启动 Minikube 集群

1. (可选) 设置默认的 VM 驱动

```bash
minikube config set vm-driver [driver_name]
```

> 注意：关于支持的驱动程序和如何安装插件的详细信息，请参阅 [DRIVERS](https://minikube.sigs.k8s.io/docs/reference/drivers/)。

2. 使用 1.13.x 或更新版本的 Kubernetes `--kubernetes-version` 启动集群

```bash
minikube start --cpus=4 --memory=4096 --kubernetes-version=1.16.2 --extra-config=apiserver.authorization-mode=RBAC
```

3. 启用仪表盘和 ingress 插件

```bash
# 启用 dashboard
minikube addons enable dashboard

# 启用 ingress
minikube addons enable ingress
```

## (可选) 安装Helm v3

1. [安装 Helm v3 客户端](https://helm.sh/docs/intro/install/)

> **注意：** 最新的 Dapr helm chart 不再支持 Helm v2。 请按照这篇文章 [Helm 迁移指南](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/) 从Helm v2 迁移到Helm v3。

### 疑难解答

1. The external IP address of load balancer is not shown from `kubectl get svc`

In Minikube, EXTERNAL-IP in `kubectl get svc` shows `<pending>` state for your service. In this case, you can run `minikube service [service_name]` to open your service without external IP address. In this case, you can run `minikube service [service_name]` to open your service without external IP address.

```bash
$ kubectl get svc
NAME                        TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)            AGE
...
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

$ minikube service calculator-front-end
|-----------|----------------------|-------------|---------------------------|
| NAMESPACE |         NAME         | TARGET PORT |            URL            |
|-----------|----------------------|-------------|---------------------------|
| default   | calculator-front-end |             | http://192.168.64.7:30534 |
|-----------|----------------------|-------------|---------------------------|
🎉  Opening kubernetes service  default/calculator-front-end in default browser...
```
