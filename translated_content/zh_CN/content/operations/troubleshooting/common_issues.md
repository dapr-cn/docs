---
type: docs
title: "运行 Dapr 时的常见问题"
linkTitle: "常见问题"
weight: 1000
description: "运行 Dapr 应用程序时面临的常见问题"
---

## 我没有看到 Dapr sidecar 注入我的 pod 中

可能有几个原因可以解释为什么 sidecar 不会被注入 pod。 首先，检查您的 deployment 或 pod YAML 文件，并检查您在正确的地方有以下注解：

```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-id: "nodeapp"
  dapr.io/app-port: "3000"
```

### 示例 deployment：

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

如果您的 pod spec 模板注解正确，您仍然看不到 sidecar 注入， 请确保 Dapr 在 deployment 或 pod 之前被部署到集群中。

如果情况如此，重新启动 pods 将解决问题。

如果你在一个私有的 GKE 集群上部署 Dapr ，没有额外的步骤，sidecar 注入就无法工作。 请参阅[设置 Google Kubernetes Engine 集群]({{< ref setup-gke.md >}})。

为了进一步诊断任何问题，请检查 Dapr sidecar 注入器的日志：

```bash
 kubectl logs -l app=dapr-sidecar-injector -n dapr-system
```

*注意：如果将 Dapr 安装到其他命名空间，请将上面的 dapr-system 替换为所需的命名空间*

## 我的 pod 处于 CrashLoopBackoff 或其他由于 daprd sidecar 而失败的状态

如果 Dapr sidecar (`daprd`) 需要太长时间才能初始化， 这可能是 Kubernetes 健康检查失败的结果。

如果您的 pod 处于失败状态，您应该检查以下内容：

```bash
kubectl describe pod <name-of-pod>
```

您可能会在命令输出的末尾看到如下所示的表：

```txt
  Normal   Created    7m41s (x2 over 8m2s)   kubelet, aks-agentpool-12499885-vmss000000  Created container daprd
  Normal   Started    7m41s (x2 over 8m2s)   kubelet, aks-agentpool-12499885-vmss000000  Started container daprd
  Warning  Unhealthy  7m28s (x5 over 7m58s)  kubelet, aks-agentpool-12499885-vmss000000  Readiness probe failed: Get http://10.244.1.10:3500/v1.0/healthz: dial tcp 10.244.1.10:3500: connect: connection refused
  Warning  Unhealthy  7m25s (x6 over 7m55s)  kubelet, aks-agentpool-12499885-vmss000000  Liveness probe failed: Get http://10.244.1.10:3500/v1.0/healthz: dial tcp 10.244.1.10:3500: connect: connection refused
  Normal   Killing    7m25s (x2 over 7m43s)  kubelet, aks-agentpool-12499885-vmss000000  Container daprd failed liveness probe, will be restarted
  Warning  BackOff    3m2s (x18 over 6m48s)  kubelet, aks-agentpool-12499885-vmss000000  Back-off restarting failed container
```

消息为 `Container daprd failed liveness probe, will be restarted` 表示 Dapr sidecar 没有通过健康检查并将重新启动。 消息为 `Readiness probe failed: Get http://10.244.1.10:3500/v1.0/healthz: dial tcp 10.244.1.10:3500: connect: connection refused` 和 `Liveness probe failed: Get http://10.244.1.10:3500/v1.0/healthz: dial tcp 10.244.1.10:3500: connect: connection refused` 表示健康检查失败，因为无法连接到 sidecar。

这个失败的最常见原因是组件(例如状态存储) 配置不正确，导致初始化时间过长。 当初始化需要很长时间时，运行状况检查可能会在 sidecar 记录任何有用的东西之前终止 sidecar。

要诊断出根本原因：

- 显著增加 liveness probe 延迟 - [链接]({{< ref "arguments-annotations-overview.md" >}})
- 将 sidecar 的日志级别设置为 debug - [链接]({{< ref "logs-troubleshooting.md#setting-the-sidecar-log-level" >}})
- 查看日志以获取有意义的信息 - [链接]({{< ref "logs-troubleshooting.md#viewing-logs-on-kubernetes" >}})

> 请记住，在解决问题后，将活动检查延迟和日志级别配置回到您想要的值。

## 我无法保存状态或获取状态

您是否在集群中安装了 Dapr 状态存储？

若要检查，使用 kubectl 获取组件列表:

```bash
kubectl get components
```

如果没有状态存储组件，则意味着您需要设置一个。 更多详情请访问[这里.]({{< ref "state-management" >}})

如果一切设置正确，请确保您的凭据正确。 搜索 Dapr 运行日志并查找任何状态存储错误：

```bash
kubectl logs <name-of-pod> daprd
```

## 我无法发布和接收事件

您是否在集群中安装了 Dapr 消息总线？

若要检查，使用 kubectl 获取组件列表:

```bash
kubectl get components
```

如果没有发布/订阅组件，则意味着您需要设置一个。 更多详情请访问 [这里.]({{< ref "pubsub" >}})

如果一切设置正确，请确保您的凭据正确。 搜索 Dapr 运行时日志并查找任何发布/订阅错误：

```bash
kubectl logs <name-of-pod> daprd
```

## Dapr Operator pod 不断崩溃

检查群集中是否只有一个 Dapr Operator 安装。 通过运行找出答案

```bash
kubectl get pods -l app=dapr-operator --all-namespaces
```

如果出现两个 Pod，请删除冗余的 Dapr 安装。

## 我在调用 Dapr 时收到 500 Error 响应

这意味着 Dapr 运行时中存在一些内部问题。 若要诊断，查看sidecar的日志：

```bash
kubectl logs <name-of-pod> daprd
```

## 我在调用 Dapr 时收到 404 Found Error 响应

这意味着您正在尝试调用不存在或 URL 格式不正确的 Dapr API 端点。 查看此处的 Dapr API 参考 []({{< ref "api" >}}) ，并确保调用正确的端点。

## 我没有看到来自其他服务的任何传入事件或调用

您是否指定了应用程序监听的端口？ 在 Kubernetes 中，请确保指定了 `dapr.io/app-port` 注解:

```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-id: "nodeapp"
  dapr.io/app-port: "3000"
```

如果使用 Dapr 独立和Dapr CLI, 请确保您将 `--app-port` 标记传递到 `Dapr run` 命令。

## 我的 Dapr 启用的应用程序的行为不正确

第一件事是检查从 Dapr API返回的 HTTP 错误代码，如果有的话。 如果您仍然找不到问题，请尝试为 Dapr 运行时启用 `debug` 日志级别。 请参阅此处 []({{< ref "logs.md" >}}) 如何执行此操作。

您可能还想要查看您自己进程中的错误日志。 如果在 Kubernetes 上运行，请找到包含你的应用的 pod，然后执行以下操作：

```bash
kubectl logs <pod-name> <name-of-your-container>
```

如果在独立模式下运行，您应该看到应用程序在主控制台会话中显示的标准输出和标准输出结果。

## 我在本地运行 Actor 时出现超时/连接错误

每个 Dapr 实例都会向放置服务报告其主机地址。 然后，放置服务将节点表及其地址分发到所有 Dapr 实例。 如果无法访问该主机地址，则可能会遇到套接字超时错误或失败请求错误的其他变体。

除非通过将名为 `DAPR_HOST_IP` 的环境变量设置为可访问的、可 ping 的地址来指定主机名，否则 Dapr 将遍历网络接口并选择它找到的第一个非环回地址。

如上所述，为了告诉 Dapr 应使用什么主机名，只需设置一个名为 `DAPR_HOST_IP` 的环境变量。

下面的示例显示如何将主机 IP 环境变量设置为 `127.0.0.1`：

**注意：对于版本 <= 0.4.0，请使用 `HOST_IP`**

```bash
export DAPR_HOST_IP=127.0.0.1
```

## 当我的应用程序启动时，我的组件都没有加载。 我不断收到"Error component X cannot be found"

这通常是由于以下问题之一

- 您可能已经在本地定义了 `NAMESPACE` 环境变量，或者将组件部署到 Kubernetes 中的其他命名空间中。 检查您的应用和组件部署到哪个命名空间。 有关详细信息，请阅读 [将组件范围限定为一个或多个应用程序]({{< ref "component-scopes.md" >}}) 。
- 您可能尚未提供 dapr `--components-path` 给 `run` 命令，或者未将组件放入操作系统的默认组件文件夹中。 有关详细信息，请阅读 [定义组件]({{< ref "get-started-component.md" >}}) 。
- 组件 YAML 文件中可能存在语法问题。 使用 [YAML 示例]({{< ref "components.md" >}})检查组件 YAML。

## 服务调用失败，我的 Dapr 服务缺少 appId （macOS）

有些组织将采用能过滤所有 UPD 流量的软件，这是 mDNS 的基础。 通常，在MacOS上， `Microsoft Content Filter` 是罪魁祸首。

为了让 mDNS 正常工作，请确认 `Micorosft Content Filter` 处于未激活状态。

- 打开终端
- 输入 `mdatp system-extension network-filter disable` 并按下回车键。
- 输入您的帐户密码。

当输出为“成功”时，Microsoft Content Filter 被禁用。

> 有些组织将不时重新启用过滤器。 如果反复遇到缺少 app-id 值的情况，请先检查筛选器是否已重新启用，然后再进行更广泛的故障排除。

## Admission webhook 拒绝请求

你可能会遇到与下面类似的错误，这是因为 admission webhook 具有一个允许服务账户创建或修改资源的列表。

```
root:[dapr]$ kubectl run -i --tty --rm debug --image=busybox --restart=Never -- sh
Error from server: admission webhook "sidecar-injector.dapr.io" denied the request: service account 'user-xdd5l' not on the list of allowed controller accounts
```

要解决此错误，您应该为当前用户创建一个 `clusterrolebind` ：

```bash
kubectl create clusterrolebinding dapr-<name-of-user> --clusterrole=dapr-operator-admin --user <name-of-user>
```

您可以运行以下命令来获取集群中的所有用户：

```bash
kubectl config get-users
```

您可以在[这里](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/)了解更多关于 webhooks 。
