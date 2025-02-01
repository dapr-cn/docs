---
type: docs
title: "运行 Dapr 时的常见问题"
linkTitle: "常见问题"
weight: 1000
description: "运行 Dapr 应用程序时遇到的常见问题和问题"
---

本指南涵盖了安装和运行 Dapr 时可能遇到的常见问题。

## 安装 Dapr CLI 时 Dapr 无法连接到 Docker

在安装和初始化 Dapr CLI 时，如果在运行 `dapr init` 后看到以下错误信息：

```bash
⌛  正在进行初始化...
❌  无法连接到 Docker。Docker 可能未安装或未运行
```

请通过以下步骤进行排查：

1. [确保容器正确运行。]({{< ref "install-dapr-selfhost.md#step-4-verify-containers-are-running" >}})
2. 在 Docker Desktop 中，确认已选择 **允许使用默认 Docker 套接字（需要密码）** 选项。

   <img src="/images/docker-desktop-setting.png" width=800 style="padding-bottom:15px;">

## 我没有看到 Dapr sidecar 注入到我的 pod 中

sidecar 未注入到 pod 中可能有多种原因。首先，检查您的部署或 pod YAML 文件，确保在正确的位置有以下注释：

```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-id: "nodeapp"
  dapr.io/app-port: "3000"
```

### 示例部署：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodeapp
  namespace: default
  labels:
    app: node
spec:
  replicas: 1
  selector:
    matchLabels:
      app: node
  template:
    metadata:
      labels:
        app: node
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "nodeapp"
        dapr.io/app-port: "3000"
    spec:
      containers:
      - name: node
        image: dapriosamples/hello-k8s-node
        ports:
        - containerPort: 3000
        imagePullPolicy: Always
```

在某些情况下，这可能无法正常工作：

- 如果您的 pod 规范模板注释正确，但仍未看到 sidecar 注入，请确保在部署或 pod 部署之前，Dapr 已部署到集群中。

  如果是这种情况，重启 pod 将解决问题。

- 如果您在私有 GKE 集群上部署 Dapr，sidecar 注入在没有额外步骤的情况下不起作用。请参阅 [设置 Google Kubernetes Engine 集群]({{< ref setup-gke.md >}})。

  为了进一步诊断任何问题，请检查 Dapr sidecar 注入器的日志：

  ```bash
   kubectl logs -l app=dapr-sidecar-injector -n dapr-system
  ```

  *注意：如果您将 Dapr 安装到不同的命名空间，请将上面的 dapr-system 替换为所需的命名空间*

- 如果您在 Amazon EKS 上部署 Dapr 并使用诸如 Calico 的覆盖网络，您需要将 `hostNetwork` 参数设置为 true，这是 EKS 在此类 CNI 上的限制。

  您可以使用 Helm `values.yaml` 文件设置此参数：

  ```
  helm upgrade --install dapr dapr/dapr \
  --namespace dapr-system \
  --create-namespace \
  --values values.yaml
  ```

  `values.yaml`
  ```yaml
  dapr_sidecar_injector:
    hostNetwork: true
  ```

  或使用命令行：

  ```
  helm upgrade --install dapr dapr/dapr \
  --namespace dapr-system \
  --create-namespace \
  --set dapr_sidecar_injector.hostNetwork=true
  ```
  
- 确保 kube api 服务器可以访问以下 webhook 服务：
  - [Sidecar Mutating Webhook Injector Service](https://github.com/dapr/dapr/blob/44235fe8e8799589bb393a3124d2564db2dd6885/charts/dapr/charts/dapr_sidecar_injector/templates/dapr_sidecar_injector_deployment.yaml#L157) 在端口 __4000__，由 sidecar 注入器提供服务。
  - [Resource Conversion Webhook Service](https://github.com/dapr/dapr/blob/44235fe8e8799589bb393a3124d2564db2dd6885/charts/dapr/charts/dapr_operator/templates/dapr_operator_service.yaml#L28) 在端口 __19443__，由 operator 提供服务。
  
  请与您的集群管理员联系，以设置允许从 kube api 服务器到上述端口 __4000__ 和 __19443__ 的入口规则。

## 由于 daprd sidecar，我的 pod 处于 CrashLoopBackoff 或其他失败状态

如果 Dapr sidecar (`daprd`) 初始化时间过长，可能会被 Kubernetes 视为健康检查失败。

如果您的 pod 处于失败状态，您应该检查以下内容：

```bash
kubectl describe pod <name-of-pod>
```

您可能会在命令输出的末尾看到如下表格：

```txt
  Normal   Created    7m41s (x2 over 8m2s)   kubelet, aks-agentpool-12499885-vmss000000  Created container daprd
  Normal   Started    7m41s (x2 over 8m2s)   kubelet, aks-agentpool-12499885-vmss000000  Started container daprd
  Warning  Unhealthy  7m28s (x5 over 7m58s)  kubelet, aks-agentpool-12499885-vmss000000  Readiness probe failed: Get http://10.244.1.10:3500/v1.0/healthz: dial tcp 10.244.1.10:3500: connect: connection refused
  Warning  Unhealthy  7m25s (x6 over 7m55s)  kubelet, aks-agentpool-12499885-vmss000000  Liveness probe failed: Get http://10.244.1.10:3500/v1.0/healthz: dial tcp 10.244.1.10:3500: connect: connection refused
  Normal   Killing    7m25s (x2 over 7m43s)  kubelet, aks-agentpool-12499885-vmss000000  Container daprd failed liveness probe, will be restarted
  Warning  BackOff    3m2s (x18 over 6m48s)  kubelet, aks-agentpool-12499885-vmss000000  Back-off restarting failed container
```

消息 `Container daprd failed liveness probe, will be restarted` 表示 Dapr sidecar 未通过健康检查并将被重启。消息 `Readiness probe failed: Get http://10.244.1.10:3500/v1.0/healthz: dial tcp 10.244.1.10:3500: connect: connection refused` 和 `Liveness probe failed: Get http://10.244.1.10:3500/v1.0/healthz: dial tcp 10.244.1.10:3500: connect: connection refused` 表明健康检查失败是因为无法连接到 sidecar。

此故障的最常见原因是某个组件（如状态存储）配置错误，导致初始化时间过长。当初始化时间过长时，健康检查可能会在 sidecar 记录任何有用信息之前终止它。

要诊断根本原因：

- 显著增加存活探测延迟 - [链接]({{< ref "arguments-annotations-overview.md" >}})
- 将 sidecar 的日志级别设置为调试 - [链接]({{< ref "logs-troubleshooting.md#setting-the-sidecar-log-level" >}})
- 观察日志以获取有意义的信息 - [链接]({{< ref "logs-troubleshooting.md#viewing-logs-on-kubernetes" >}})

> 解决问题后，请记得将存活检查延迟和日志级别配置回您期望的值。

## 我无法保存状态或获取状态

您是否在集群中安装了 Dapr 状态存储？

要检查，请使用 kubectl 获取组件列表：

```bash
kubectl get components
```

如果没有状态存储组件，则意味着您需要设置一个。
访问 [这里]({{< ref "state-management" >}}) 了解更多详细信息。

如果一切设置正确，请确保您获得了正确的凭据。
搜索 Dapr 运行时日志并查找任何状态存储错误：

```bash
kubectl logs <name-of-pod> daprd
```

## 我无法发布和接收事件

您是否在集群中安装了 Dapr 消息总线？

要检查，请使用 kubectl 获取组件列表：

```bash
kubectl get components
```

如果没有 pub/sub 组件，则意味着您需要设置一个。
访问 [这里]({{< ref "pubsub" >}}) 了解更多详细信息。

如果一切设置正确，请确保您获得了正确的凭据。
搜索 Dapr 运行时日志并查找任何 pub/sub 错误：

```bash
kubectl logs <name-of-pod> daprd
```

## 调用 Dapr 时收到 500 错误响应

这意味着 Dapr 运行时内部存在一些问题。
要诊断，请查看 sidecar 的日志：

```bash
kubectl logs <name-of-pod> daprd
```

## 调用 Dapr 时收到 404 未找到响应

这意味着您正在尝试调用一个不存在的 Dapr API 端点或 URL 格式错误。
查看 Dapr API 参考 [这里]({{< ref "api" >}}) 并确保您正在调用正确的端点。

## 我没有看到来自其他服务的任何传入事件或调用

您是否指定了应用程序正在监听的端口？
在 Kubernetes 中，确保指定了 `dapr.io/app-port` 注释：

```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-id: "nodeapp"
  dapr.io/app-port: "3000"
```

如果使用 Dapr Standalone 和 Dapr CLI，请确保将 `--app-port` 标志传递给 `dapr run` 命令。

## 我的 Dapr 启用的应用程序行为不正确

首先要做的是检查 Dapr API 返回的 HTTP 错误代码（如果有）。
如果仍然找不到问题，请尝试为 Dapr 运行时启用 `debug` 日志级别。请参阅 [这里]({{< ref "logs.md" >}}) 了解如何操作。

您可能还需要查看您自己进程的错误日志。如果在 Kubernetes 上运行，找到包含您的应用程序的 pod，并执行以下操作：

```bash
kubectl logs <pod-name> <name-of-your-container>
```

如果在 Standalone 模式下运行，您应该在主控制台会话中看到应用程序的 stderr 和 stdout 输出。

## 本地运行 actor 时出现超时/连接错误

每个 Dapr 实例都会向放置服务报告其主机地址。放置服务然后将节点及其地址的表分发给所有 Dapr 实例。如果该主机地址无法访问，您可能会遇到套接字超时错误或其他请求失败错误。

除非通过设置名为 `DAPR_HOST_IP` 的环境变量为可访问的、可 ping 的地址来指定主机名，否则 Dapr 将遍历网络接口并选择第一个非回环地址。

如上所述，为了告诉 Dapr 应该使用哪个主机名，只需设置一个名为 `DAPR_HOST_IP` 的环境变量。

以下示例显示如何将主机 IP 环境变量设置为 `127.0.0.1`：

**注意：对于版本 <= 0.4.0 使用 `HOST_IP`**

```bash
export DAPR_HOST_IP=127.0.0.1
```

## 我的应用程序启动时没有加载任何组件。我不断收到“错误组件 X 找不到”

这通常是由于以下问题之一

- 您可能在本地定义了 `NAMESPACE` 环境变量或将组件部署到 Kubernetes 中的不同命名空间。检查您的应用程序和组件部署到哪个命名空间。阅读 [将组件限定到一个或多个应用程序]({{< ref "component-scopes.md" >}}) 了解更多信息。
- 您可能没有在 Dapr `run` 命令中提供 `--resources-path` 或没有将组件放入操作系统的默认组件文件夹中。阅读 [定义组件]({{< ref "get-started-component.md" >}}) 了解更多信息。
- 您的组件 YAML 文件中可能存在语法问题。使用组件 [YAML 示例]({{< ref "components.md" >}}) 检查您的组件 YAML。

## 服务调用失败，我的 Dapr 服务缺少 appId（macOS）

一些组织会实施软件来过滤掉所有 UDP 流量，而 mDNS 正是基于此的。在 MacOS 上，`Microsoft Content Filter` 通常是罪魁祸首。

为了使 mDNS 正常工作，请确保 `Microsoft Content Filter` 处于非活动状态。

- 打开终端 shell。
- 输入 `mdatp system-extension network-filter disable` 并按回车。
- 输入您的帐户密码。

当输出为“Success”时，Microsoft Content Filter 被禁用。

> 一些组织会不时重新启用过滤器。如果您反复遇到 app-id 值丢失，首先检查过滤器是否已重新启用，然后再进行更广泛的故障排除。

## 准入 webhook 拒绝了请求

由于准入 webhook 对服务帐户创建或修改资源有一个允许列表，您可能会遇到类似于以下的错误。

```
root:[dapr]$ kubectl run -i --tty --rm debug --image=busybox --restart=Never -- sh
Error from server: admission webhook "sidecar-injector.dapr.io" denied the request: service account 'user-xdd5l' not on the list of allowed controller accounts
```

要解决此错误，您应该为当前用户创建一个 `clusterrolebind`：

```bash
kubectl create clusterrolebinding dapr-<name-of-user> --clusterrole=dapr-operator-admin --user <name-of-user>
```

您可以运行以下命令以获取集群中的所有用户：

```bash
kubectl config get-users
```

您可以在 [这里](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/) 了解有关 webhooks 的更多信息。
