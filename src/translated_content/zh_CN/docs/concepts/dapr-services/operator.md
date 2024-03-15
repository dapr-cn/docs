---
type: docs
title: Dapr operator 控制平面服务概述
linkTitle: 运算符
description: Dapr operator 服务概述
---

当在[Kubernetes模式]({{< ref kubernetes >}}) 下运行Dapr时，运行Dapr Operator服务的pod负责管理[Dapr组件]({{< ref components >}}) 的更新，并为Dapr提供Kubernetes服务端点。

## 运行 Operator 服务

Operator 服务作为 `dapr init -k` 的一部分部署，或通过 Dapr Helm chart 部署。 有关在 Kubernetes 上运行 Dapr 的更多信息，请访问 [Kubernetes 托管页面]({{< ref kubernetes >}})。

## 其他配置选项

operator 服务还包括其他配置选项。

### Injector watchdog

Operator 服务包括 _injector watchdog_ 功能，它会定期轮询在您的 Kubernetes 集群中运行的所有 pod，并确认 Dapr sidecar 已注入到具有 `dapr.io/enabled=true` 注解的 pod 中。 它主要是为了解决以下情况：[Injector 服务]({{< ref sidecar-injector >}}) 未成功注入sidecar（`daprd`容器）到pod中。

Injector watchdog 在几种情况下很有用，包括：

- 从完全停止的 Kubernetes 集群中恢复。 当集群完全停止然后重新启动时（包括集群完全失效的情况），pod 会以随机顺序重新启动。 如果在 Dapr 控制平面（特别是 Injector 服务）准备就绪之前重新启动应用程序，Dapr sidecar 卡可能无法注入到应用程序的 pod 中，从而导致应用程序出现意外行为。

- 解决 sidecar injector 的潜在随机故障，如 injector 服务内的瞬时故障。

如果 watchdog 检测到一个 pod 在应该有 sidecar 的情况下没有 sidecar，就会将其删除。 然后，Kubernetes 将重新创建 pod，再次调用 Dapr sidecar 注入器。

**默认禁用** injector watchdog 功能。

您可以通过向 `operator` 命令传递 `--watch-interval` 标志来启用它，该标志可以取以下值之一：

- `--watch-interval=0`：禁用注入器监视器（如果省略该标志，则为默认值）。
- `--watch-interval=<interval>`：启用injector watchdog，并以给定的间隔轮询所有pod；间隔值是一个包含单位的字符串。 例如：`--watch-interval=10s`（每 10 秒一次）或`--watch-interval=2m`（每 2 分钟一次）。
- `--watch-interval=once`: injector watchdog 仅在 operator 服务启动时运行一次。

如果您正在使用Helm，您可以使用[`dapr_operator.watchInterval`选项](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md#dapr-operator-options)来配置注入器看门狗，该选项的值与命令行标志相同。

> 当 operator 服务在具有多个副本的 HA（高可用性）模式下运行时，可安全使用 injector watchdog。 在这种情况下，Kubernetes 会自动选出一个 "leader "实例，它是唯一一个运行 injector watchdog 服务的实例。

> 但是，在 HA 模式下，如果将 injector watchdog 置为运行 "一次"，则每次操作员服务实例被选为 leader 时，watchdog 轮询都会实际启动。 这意味着，如果 operator 服务的 leader 崩溃，而新的 leader 又被选出，这将再次触发 injector watchdog。

观看此视频，了解 injector watchdog 的概况：

<div class="embed-responsive embed-responsive-16by9">
<iframe width="360" height="315" src="https://www.youtube-nocookie.com/embed/ecFvpp24lpo?start=1848" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
