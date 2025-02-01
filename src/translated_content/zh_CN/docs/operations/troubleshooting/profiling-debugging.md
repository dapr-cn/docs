---
type: docs
title: "性能分析与调试"
linkTitle: "调试"
weight: 4000
description: "通过性能分析会话发现并解决并发、性能、CPU和内存使用等问题"
---

在实际应用中，程序可能会出现资源使用高峰的问题。CPU和内存的使用高峰在很多情况下是常见的。

Dapr 允许用户通过其性能分析服务端点使用 `pprof` 启动按需性能分析会话，以检测并发、性能、CPU 和内存使用等问题。

## 启用性能分析

Dapr 支持在 Kubernetes 和独立模式下启用性能分析。

### 独立模式

在独立模式下启用性能分析时，可以通过 Dapr CLI 传递 `--enable-profiling` 和 `--profile-port` 标志：
注意，`profile-port` 是可选的，如果未指定，Dapr 会自动选择一个可用端口。

```bash
dapr run --enable-profiling --profile-port 7777 python myapp.py
```

### Kubernetes

在 Kubernetes 中启用性能分析，只需在 Dapr 注解的 pod 中添加 `dapr.io/enable-profiling` 注解：

```yml
   annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "rust-app"
    dapr.io/enable-profiling: "true"
```

## 调试性能分析会话

启用性能分析后，可以启动性能分析会话来调查 Dapr 运行时的情况。

### 独立模式

对于独立模式，首先找到需要分析的 Dapr 实例：

```bash
dapr list
APP ID           DAPR PORT     APP PORT  COMMAND      AGE  CREATED              PID
node-subscriber  3500          3000      node app.js  12s  2019-09-09 15:11.24  896
```

获取 DAPR PORT，如果已按上述步骤启用性能分析，现在可以使用 `pprof` 对 Dapr 进行分析。
查看上面的 Kubernetes 示例以获取一些有用的命令来分析 Dapr。

有关 pprof 的更多信息可以在[这里](https://github.com/google/pprof)找到。

### Kubernetes

首先，找到包含 Dapr 运行时的 pod。如果不确定 pod 名称，可以输入 `kubectl get pods`：

```bash
NAME                                        READY     STATUS    RESTARTS   AGE
divideapp-6dddf7dc74-6sq4l                  2/2       Running   0          2d23h
```

如果性能分析已成功启用，运行时日志应显示以下内容：
`time="2019-09-09T20:56:21Z" level=info msg="starting profiling server on port 7777"`

在这种情况下，我们希望在 pod `divideapp-6dddf7dc74-6sq4l` 内启动 Dapr 运行时的会话。

可以通过端口转发连接到 pod 来实现：

```bash
kubectl port-forward divideapp-6dddf7dc74-6sq4 7777:7777
Forwarding from 127.0.0.1:7777 -> 7777
Forwarding from [::1]:7777 -> 7777
Handling connection for 7777
```

现在连接已建立，可以使用 `pprof` 对 Dapr 运行时进行分析。

以下示例将创建一个 `cpu.pprof` 文件，其中包含持续 120 秒的分析会话的样本：

```bash
curl "http://localhost:7777/debug/pprof/profile?seconds=120" > cpu.pprof
```

使用 pprof 分析文件：

```bash
pprof cpu.pprof
```

还可以将结果以可视化方式保存在 PDF 中：

```bash
go tool pprof --pdf your-binary-file http://localhost:7777/debug/pprof/profile?seconds=120 > profile.pdf
```

对于内存相关问题，可以分析堆：

```bash
go tool pprof --pdf your-binary-file http://localhost:7777/debug/pprof/heap > heap.pdf
```

![heap](/images/heap.png)

分析已分配的对象：

```bash
go tool pprof http://localhost:7777/debug/pprof/heap
> exit

Saved profile in /Users/myusername/pprof/pprof.daprd.alloc_objects.alloc_space.inuse_objects.inuse_space.003.pb.gz
```

要进行分析，获取上面的文件路径（这是一个动态文件路径，因此请注意不要粘贴此路径），然后执行：

```bash
go tool pprof -alloc_objects --pdf /Users/myusername/pprof/pprof.daprd.alloc_objects.alloc_space.inuse_objects.inuse_space.003.pb.gz > alloc-objects.pdf
```

![alloc](/images/alloc.png)