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

If you are deploying Dapr on Amazon EKS and using an overlay network such as Calico, you will need to set `hostNetwork` parameter to true, this is a limitation of EKS with such CNIs.

You can set this parameter using Helm `values.yaml` file:

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

or using command line:

```
helm upgrade --install dapr dapr/dapr \
  --namespace dapr-system \
  --create-namespace \
  --set dapr_sidecar_injector.hostNetwork=true
```

## 我的 pod 处于 CrashLoopBackoff 或其他由于 daprd sidecar 而失败的状态

If the Dapr sidecar (`daprd`) is taking too long to initialize, this might be surfaced as a failing health check by Kubernetes.

If your pod is in a failed state you should check this:

```bash
kubectl describe pod <name-of-pod>
```

You might see a table like the following at the end of the command output:

```txt
  Normal   Created    7m41s (x2 over 8m2s)   kubelet, aks-agentpool-12499885-vmss000000  Created container daprd
  Normal   Started    7m41s (x2 over 8m2s)   kubelet, aks-agentpool-12499885-vmss000000  Started container daprd
  Warning  Unhealthy  7m28s (x5 over 7m58s)  kubelet, aks-agentpool-12499885-vmss000000  Readiness probe failed: Get http://10.244.1.10:3500/v1.0/healthz: dial tcp 10.244.1.10:3500: connect: connection refused
  Warning  Unhealthy  7m25s (x6 over 7m55s)  kubelet, aks-agentpool-12499885-vmss000000  Liveness probe failed: Get http://10.244.1.10:3500/v1.0/healthz: dial tcp 10.244.1.10:3500: connect: connection refused
  Normal   Killing    7m25s (x2 over 7m43s)  kubelet, aks-agentpool-12499885-vmss000000  Container daprd failed liveness probe, will be restarted
  Warning  BackOff    3m2s (x18 over 6m48s)  kubelet, aks-agentpool-12499885-vmss000000  Back-off restarting failed container
```

The message `Container daprd failed liveness probe, will be restarted` indicates at the Dapr sidecar has failed its health checks and will be restarted. The messages `Readiness probe failed: Get http://10.244.1.10:3500/v1.0/healthz: dial tcp 10.244.1.10:3500: connect: connection refused` and `Liveness probe failed: Get http://10.244.1.10:3500/v1.0/healthz: dial tcp 10.244.1.10:3500: connect: connection refused` show that the health check failed because no connection could be made to the sidecar.

The most common cause of this failure is that a component (such as a state store) is misconfigured and is causing initialization to take too long. When initialization takes a long time, it's possible that the health check could terminate the sidecar before anything useful is logged by the sidecar.

To diagnose the root cause:

- 显著增加 liveness probe 延迟 - [链接]({{< ref "arguments-annotations-overview.md" >}})
- 将 sidecar 的日志级别设置为 debug - [链接]({{< ref "logs-troubleshooting.md#setting-the-sidecar-log-level" >}})
- 查看日志以获取有意义的信息 - [链接]({{< ref "logs-troubleshooting.md#viewing-logs-on-kubernetes" >}})

> 请记住，在解决问题后，将活动检查延迟和日志级别配置回到您想要的值。

## 我无法保存状态或获取状态

Have you installed an Dapr State store in your cluster?

若要检查，使用 kubectl 获取组件列表:

```bash
kubectl get components
```

If there isn't a state store component, it means you need to set one up. Visit [here]({{< ref "state-management" >}}) for more details.

If everything's set up correctly, make sure you got the credentials right. Search the Dapr runtime logs and look for any state store errors:

```bash
kubectl logs <name-of-pod> daprd
```

## 我无法发布和接收事件

Have you installed an Dapr Message Bus in your cluster?

To check, use kubectl get a list of components:

```bash
kubectl get components
```

If there isn't a pub/sub component, it means you need to set one up. Visit [here]({{< ref "pubsub" >}}) for more details.

If everything is set up correctly, make sure you got the credentials right. Search the Dapr runtime logs and look for any pub/sub errors:

```bash
kubectl logs <name-of-pod> daprd
```

## I'm getting 500 Error responses when calling Dapr

This means there are some internal issue inside the Dapr runtime. To diagnose, view the logs of the sidecar:

```bash
kubectl logs <name-of-pod> daprd
```

## I'm getting 404 Not Found responses when calling Dapr

This means you're trying to call an Dapr API endpoint that either doesn't exist or the URL is malformed. Look at the Dapr API reference [here]({{< ref "api" >}}) and make sure you're calling the right endpoint.

## I don't see any incoming events or calls from other services

Have you specified the port your app is listening on? In Kubernetes, make sure the `dapr.io/app-port` annotation is specified:

```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-id: "nodeapp"
  dapr.io/app-port: "3000"
```

If using Dapr Standalone and the Dapr CLI, make sure you pass the `--app-port` flag to the `dapr run` command.

## My Dapr-enabled app isn't behaving correctly

The first thing to do is inspect the HTTP error code returned from the Dapr API, if any. If you still can't find the issue, try enabling `debug` log levels for the Dapr runtime. See [here]({{< ref "logs.md" >}}) how to do so.

You might also want to look at error logs from your own process. If running on Kubernetes, find the pod containing your app, and execute the following:

```bash
kubectl logs <pod-name> <name-of-your-container>
```

If running in Standalone mode, you should see the stderr and stdout outputs from your app displayed in the main console session.

## I'm getting timeout/connection errors when running Actors locally

Each Dapr instance reports it's host address to the placement service. The placement service then distributes a table of nodes and their addresses to all Dapr instances. If that host address is unreachable, you are likely to encounter socket timeout errors or other variants of failing request errors.

Unless the host name has been specified by setting an environment variable named `DAPR_HOST_IP` to a reachable, pingable address, Dapr will loop over the network interfaces and select the first non-loopback address it finds.

As described above, in order to tell Dapr what the host name should be used, simply set an environment variable with the name of `DAPR_HOST_IP`.

The following example shows how to set the Host IP env var to `127.0.0.1`:

**Note: for versions <= 0.4.0 use `HOST_IP`**

```bash
export DAPR_HOST_IP=127.0.0.1
```

## None of my components are getting loaded when my application starts. I keep getting "Error component X cannot be found"

This is usually due to one of the following issues

- 您可能已经在本地定义了 `NAMESPACE` 环境变量，或者将组件部署到 Kubernetes 中的其他命名空间中。 检查您的应用和组件部署到哪个命名空间。 有关详细信息，请阅读 [将组件范围限定为一个或多个应用程序]({{< ref "component-scopes.md" >}}) 。
- 您可能尚未提供 dapr `--components-path` 给 `run` 命令，或者未将组件放入操作系统的默认组件文件夹中。 有关详细信息，请阅读 [定义组件]({{< ref "get-started-component.md" >}}) 。
- 组件 YAML 文件中可能存在语法问题。 使用 [YAML 示例]({{< ref "components.md" >}})检查组件 YAML。

## Service invocation is failing and my Dapr service is missing an appId (macOS)

Some organizations will implement software that filters out all UPD traffic, which is what mDNS is based on. Mostly commonly, on MacOS, `Microsoft Content Filter` is the culprit.

In order for mDNS to function properly, ensure `Micorosft Content Filter` is inactive.

- 打开终端
- 输入 `mdatp system-extension network-filter disable` 并按下回车键。
- 输入您的帐户密码。

Microsoft Content Filter is disabled when the output is "Success".

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
