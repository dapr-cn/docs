---
type: docs
title: "配置和查看 Dapr 日志"
linkTitle: "日志"
weight: 2000
description: "了解日志记录在 Dapr 中的工作原理以及如何配置和查看日志"
---

本节将帮助您了解日志记录在 Dapr 中的工作原理，配置和查看日志。

## 概述

日志具有不同的、可配置的详细级别。 下面列出的级别对于系统组件和 Dapr sidecar 进程/容器都是相同的：

1. error
2. warn
3. info
4. debug

error 产生最小输出量，debug 产生最大输出量。 默认级别是 info，它为在正常情况下操作 Dapr 提供均衡的信息量。

若要设置输出级别，可以使用 `--log-level` 命令行选项。 例如:

```bash
./daprd --log-level error
./placement --log-level debug
```

这将启动日志级别为 `error` 的 Dapr 运行时二进制文件和日志级别为 `debug` 的 Dapr Actor 放置服务。

## 独立模式下的日志

若要在使用 Dapr CLI 运行应用时设置日志级别，请传递 `log-level` 参数：

```bash
dapr run --log-level warn node myapp.js
```

如上所述，每个 Dapr 二进制文件都采用 `--log-level` 参数。 例如，要启动日志级别为 warning 的放置服务，请执行以下操作：

```bash
./placement --log-level warn
```

### 在独立模式下查看日志

使用 Dapr CLI 运行 Dapr 时， 您的应用的日志输出和运行时的输出都会被重定向到同一会话，以方便调试操作。 例如，这是运行 Dapr 时的输出：

```bash
dapr run node myapp.js
ℹ️  Starting Dapr with id Trackgreat-Lancer on port 56730
✅  You are up and running! Both Dapr and your app logs will appear here.

== APP == App listening on port 3000!
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="starting Dapr Runtime -- version 0.3.0-alpha -- commit b6f2810-dirty"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="log level set to: info"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="standalone mode configured"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="app id: Trackgreat-Lancer"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="loaded component statestore (state.redis)"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="loaded component messagebus (pubsub.redis)"
== DAPR == 2019/09/05 12:26:43 redis: connecting to localhost:6379
== DAPR == 2019/09/05 12:26:43 redis: connected to localhost:6379 (localAddr: [::1]:56734, remAddr: [::1]:6379)
== DAPR == time="2019-09-05T12:26:43-07:00" level=warn msg="failed to init input bindings: app channel not initialized"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="actor runtime started. actor idle timeout: 1h0m0s. actor scan interval: 30s"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="actors: starting connection attempt to placement service at localhost:50005"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="http server is running on port 56730"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="gRPC server is running on port 56731"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="dapr initialized. Status: Running. Init Elapsed 8.772922000000001ms"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="actors: established connection to placement service at localhost:50005"
```

## Kubernetes 模式下的日志

您可以通过在 Pod spec 模板中提供以下注解 ，为每个 sidecar 单独设置日志级别：

```yml
annotations:
  dapr.io/log-level: "debug"
```

### 设置系统 Pod 日志级别

使用 Helm 3.x 将 Dapr 部署到集群时，您可以为每个 Dapr 系统组件单独设置日志级别：

```bash
helm install dapr dapr/dapr --namespace dapr-system --set <COMPONENT>.logLevel=<LEVEL>
```

组件:
- dapr_operator
- dapr_placement
- dapr_sidecar_injector

示例:

```bash
helm install dapr dapr/dapr --namespace dapr-system --set dapr_operator.logLevel=error
```

### 查看 Kubernetes 日志

Dapr 日志被写入 stdout 和 stderr。 本节将指导您如何查看 Dapr 系统组件以及 Dapr sidecar的日志。

#### Sidecar 日志

在 Kubernetes 中部署时，Dapr sidecar 注入器会将一个名为 `daprd` 的 Dapr 容器注入到带注解的 pod 中。 为了查看 sidecar 的日志，只需运行 `kubectl get pods` 找到有问题的 pod：

```bash
NAME                                        READY     STATUS    RESTARTS   AGE
addapp-74b57fb78c-67zm6                     2/2       Running   0          40h
```

接下来，获取 Dapr sidecar 容器的日志：

```bash
kubectl logs addapp-74b57fb78c-67zm6 -c daprd

time="2019-09-04T02:52:27Z" level=info msg="starting Dapr Runtime -- version 0.3.0-alpha -- commit b6f2810-dirty"
time="2019-09-04T02:52:27Z" level=info msg="log level set to: info"
time="2019-09-04T02:52:27Z" level=info msg="kubernetes mode configured"
time="2019-09-04T02:52:27Z" level=info msg="app id: addapp"
time="2019-09-04T02:52:27Z" level=info msg="application protocol: http. waiting on port 6000"
time="2019-09-04T02:52:27Z" level=info msg="application discovered on port 6000"
time="2019-09-04T02:52:27Z" level=info msg="actor runtime started. actor idle timeout: 1h0m0s. actor scan interval: 30s"
time="2019-09-04T02:52:27Z" level=info msg="actors: starting connection attempt to placement service at dapr-placement.dapr-system.svc.cluster.local:80"
time="2019-09-04T02:52:27Z" level=info msg="http server is running on port 3500"
time="2019-09-04T02:52:27Z" level=info msg="gRPC server is running on port 50001"
time="2019-09-04T02:52:27Z" level=info msg="dapr initialized. Status: Running. Init Elapsed 64.234049ms"
time="2019-09-04T02:52:27Z" level=info msg="actors: established connection to placement service at dapr-placement.dapr-system.svc.cluster.local:80"
```

#### 系统日志

Dapr 运行以下系统 Pod：

* Dapr operator
* Dapr sidecar injector
* Dapr placement service

#### Operator 日志

```Bash
kubectl logs -l app=dapr-operator -n dapr-system

I1207 06:01:02.891031 1 leaderelection.go:243] attempting to acquire leader lease dapr-system/operator.dapr.io...
I1207 06:01:02.913696 1 leaderelection.go:253] successfully acquired lease dapr-system/operator.dapr.io
time="2021-12-07T06:01:03.092529085Z" level=info msg="getting tls certificates" instance=dapr-operator-84bb47f895-dvbsj scope=dapr.operator type=log ver=unknown
time="2021-12-07T06:01:03.092703283Z" level=info msg="tls certificates loaded successfully" instance=dapr-operator-84bb47f895-dvbsj scope=dapr.operator type=log ver=unknown
time="2021-12-07T06:01:03.093062379Z" level=info msg="starting gRPC server" instance=dapr-operator-84bb47f895-dvbsj scope=dapr.operator.api type=log ver=unknown
time="2021-12-07T06:01:03.093123778Z" level=info msg="Healthz server is listening on :8080" instance=dapr-operator-84bb47f895-dvbsj scope=dapr.operator type=log ver=unknown
time="2021-12-07T06:01:03.497889776Z" level=info msg="starting webhooks" instance=dapr-operator-84bb47f895-dvbsj scope=dapr.operator type=log ver=unknown
I1207 06:01:03.497944 1 leaderelection.go:243] attempting to acquire leader lease dapr-system/webhooks.dapr.io...
I1207 06:01:03.516641 1 leaderelection.go:253] successfully acquired lease dapr-system/webhooks.dapr.io
time="2021-12-07T06:01:03.526202227Z" level=info msg="Successfully patched webhook in CRD "subscriptions.dapr.io"" instance=dapr-operator-84bb47f895-dvbsj scope=dapr.operator type=log ver=unknown
```

*注意：如果 Dapr 安装到与 dapr-system 不同的命名空间，只需在上面的命令中将命名空间替换为所需的命名空间即可*

#### Sidecar 注入器日志

```Bash
kubectl logs -l app=dapr-sidecar-injector -n dapr-system

time="2021-12-07T06:01:01.554859058Z" level=info msg="log level set to: info" instance=dapr-sidecar-injector-5d88fcfcf5-2gmvv scope=dapr.injector type=log ver=unknown
time="2021-12-07T06:01:01.555114755Z" level=info msg="metrics server started on :9090/" instance=dapr-sidecar-injector-5d88fcfcf5-2gmvv scope=dapr.metrics type=log ver=unknown
time="2021-12-07T06:01:01.555233253Z" level=info msg="starting Dapr Sidecar Injector -- version 1.5.1 -- commit c6daae8e9b11b3e241a9cb84c33e5aa740d74368" instance=dapr-sidecar-injector-5d88fcfcf5-2gmvv scope=dapr.injector type=log ver=unknown
time="2021-12-07T06:01:01.557646524Z" level=info msg="Healthz server is listening on :8080" instance=dapr-sidecar-injector-5d88fcfcf5-2gmvv scope=dapr.injector type=log ver=unknown
time="2021-12-07T06:01:01.621291968Z" level=info msg="Sidecar injector is listening on :4000, patching Dapr-enabled pods" instance=dapr-sidecar-injector-5d88fcfcf5-2gmvv scope=dapr.injector type=log ver=unknown
```

*注意：如果 Dapr 安装到与 dapr-system 不同的命名空间，只需在上面的命令中将命名空间替换为所需的命名空间即可*

#### 查看放置服务日志

```Bash
kubectl logs -l app=dapr-placement-server -n dapr-system

time="2021-12-04T05:08:05.733416791Z" level=info msg="starting Dapr Placement Service -- version 1.5.0 -- commit 83fe579f5dc93bef1ce3b464d3167a225a3aff3a" instance=dapr-placement-server-0 scope=dapr.placement type=log ver=unknown
time="2021-12-04T05:08:05.733469491Z" level=info msg="log level set to: info" instance=dapr-placement-server-0 scope=dapr.placement type=log ver=1.5.0
time="2021-12-04T05:08:05.733512692Z" level=info msg="metrics server started on :9090/" instance=dapr-placement-server-0 scope=dapr.metrics type=log ver=1.5.0
time="2021-12-04T05:08:05.735207095Z" level=info msg="Raft server is starting on 127.0.0.1:8201..." instance=dapr-placement-server-0 scope=dapr.placement.raft type=log ver=1.5.0
time="2021-12-04T05:08:05.735221195Z" level=info msg="mTLS enabled, getting tls certificates" instance=dapr-placement-server-0 scope=dapr.placement type=log ver=1.5.0
time="2021-12-04T05:08:05.735265696Z" level=info msg="tls certificates loaded successfully" instance=dapr-placement-server-0 scope=dapr.placement type=log ver=1.5.0
time="2021-12-04T05:08:05.735276396Z" level=info msg="placement service started on port 50005" instance=dapr-placement-server-0 scope=dapr.placement type=log ver=1.5.0
time="2021-12-04T05:08:05.735553696Z" level=info msg="Healthz server is listening on :8080" instance=dapr-placement-server-0 scope=dapr.placement type=log ver=1.5.0
time="2021-12-04T05:08:07.036850257Z" level=info msg="cluster leadership acquired" instance=dapr-placement-server-0 scope=dapr.placement type=log ver=1.5.0
time="2021-12-04T05:08:07.036909357Z" level=info msg="leader is established." instance=dapr-placement-server-0 scope=dapr.placement type=log ver=1.5.0
```

*注意：如果 Dapr 安装到与 dapr-system 不同的命名空间，只需在上面的命令中将命名空间替换为所需的命名空间即可*

### 非 Kubernetes 环境

上面的示例特定于 Kubernetes，但对于任何类型的基于容器的环境，主体都是相同的：只需获取 Dapr sidecar 和/或系统组件（如果适用）的容器 ID 并查看其日志即可。

## 参考资料

* [如何在 Dapr 中设置日志记录]({{< ref "logging.md" >}})
