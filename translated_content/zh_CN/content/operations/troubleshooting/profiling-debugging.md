---
type: docs
title: "分析 & 调试"
linkTitle: "调试"
weight: 4000
description: "通过分析会话发现问题和问题，如并发性、性能、Cpu 和内存使用情况"
---

在任何实际方案中，应用都可能开始在资源峰值方面表现出不良行为。 在大多数情况下，CPU/内存峰值并不少见。

Dapr 允许用户使用 `pprof` 通过其分析服务器终结点启动按需分析会话，并启动检测会话以发现问题和问题，如并发性、性能、Cpu 和内存使用情况。

## 启用性能分析

Dapr 允许您在 Kubernetes 和独立模式下启用分析。

### 独立

要在独立模式下启用性能分析，请将 `--enable-profiling` 和 `--profile-port` 标志传递给 Dapr CLI： 请注意，不需要 `profile-port` ，如果未提供，Dapr 将选取一个可用端口。

```bash
dapr run --enable-profiling --profile-port 7777 python myapp.py
```

### Kubernetes

要在 Kubernetes 中启用性能分析，只需将 `dapr.io/enable-profiling` annotation 添加到 Dapr 注释的 pod 中：

```yml
   annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "rust-app"
    dapr.io/enable-profiling: "true"
```

## 调试分析会话

启用分析后，我们可以启动分析会话来了解 Dapr 运行时的情况。

### 独立

对于独立模式，找到要分析的 Dapr 实例：

```bash
dapr list
APP ID           DAPR PORT     APP PORT  COMMAND      AGE  CREATED              PID
node-subscriber  3500          3000      node app.js  12s  2019-09-09 15:11.24  896
```

抓住 DAPR 端口，如果已按上述方式启用了性能分析，您现在可以开始使用 `pprof` 来分析 Dapr。 查看上面的 Kubernetes 示例，了解一些用于分析 Dapr 的有用命令。

有关pprof的更多信息， [这里可以找到](https://github.com/google/pprof)。

### Kubernetes

首先，找到包含 Dapr 运行时的 Pod。 如果您还不知道 pod 名称，请键入 `kubectl get pods`：

```bash
NAME                                        READY     STATUS    RESTARTS   AGE
divideapp-6dddf7dc74-6sq4l                  2/2       Running   0          2d23h
```

如果已成功启用分析，则运行时日志应显示以下内容： `time="2019-09-09T20:56:21Z" level=info msg="starting profiling server on port 7777"`

在本例中，我们想要在 pod `divideapp-6dddf7dc74-6sq4l`中启动 Dapr 运行时的会话。

我们可以通过端口转发连接到 Pod 来实现此目的：

```bash
kubectl port-forward divideapp-6dddf7dc74-6sq4 7777:7777
Forwarding from 127.0.0.1:7777 -> 7777
Forwarding from [::1]:7777 -> 7777
Handling connection for 7777
```

现在连接已经建立，我们可以使用 `pprof` 来分析 Dapr 运行时。

下面的示例将创建一个 `cpu.pprof` 文件，其中包含来自持续 120 秒的配置文件会话的示例：

```bash
curl "http://localhost:7777/debug/pprof/profile?seconds=120" > cpu.pprof
```

使用 pprof 分析文件：

```bash
pprof cpu.pprof
```

您还可以以可视化的方式将结果保存在 PDF 中：

```bash
go tool pprof --pdf your-binary-file http://localhost:7777/debug/pprof/profile?seconds=120 > profile.pdf
```

对于与内存相关的问题，您可以分析堆：

```bash
go tool pprof --pdf your-binary-file http://localhost:7777/debug/pprof/heap > heap.pdf
```

![heap](/images/heap.png)

分析分配的对象：

```bash
go tool pprof http://localhost:7777/debug/pprof/heap
> exit

Saved profile in /Users/myusername/pprof/pprof.daprd.alloc_objects.alloc_space.inuse_objects.inuse_space.003.pb.gz
```

要进行分析，请抓取上面的文件路径（这是一个动态文件路径，因此请注意粘贴此路径），然后执行：

```bash
go tool pprof -alloc_objects --pdf /Users/myusername/pprof/pprof.daprd.alloc_objects.alloc_space.inuse_objects.inuse_space.003.pb.gz > alloc-objects.pdf
```

![alloc](/images/alloc.png)
