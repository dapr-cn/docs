---
type: docs
title: "Dapr Operator 控制平面服务概述"
linkTitle: "Operator"
description: "Dapr Operator 服务概述"
---

在 [Kubernetes 模式]({{< ref kubernetes >}})下运行 Dapr 时，一个运行 Dapr Operator 服务的 pod 负责管理 [Dapr 组件]({{< ref components >}})的更新，并为 Dapr 提供 Kubernetes 服务端点。

## 运行 Operator 服务

Operator 服务是 `dapr init -k` 部署过程的一部分，或者可以通过 Dapr Helm charts 部署。有关在 Kubernetes 上运行 Dapr 的更多信息，请访问 [Kubernetes 托管页面]({{< ref kubernetes >}})。

## 其他配置选项

Operator 服务提供了一些额外的配置选项。

### 注入器监控功能

Operator 服务包含一个 _注入器监控功能_，它会定期检查 Kubernetes 集群中所有运行的 pod，确保那些标记了 `dapr.io/enabled=true` 的 pod 中正确注入了 Dapr sidecar。这个功能主要用于解决 [注入器服务]({{< ref sidecar-injector >}})未能成功将 sidecar（`daprd` 容器）注入 pod 的问题。

注入器监控功能在以下情况下可能会很有帮助：

- 从完全停止的 Kubernetes 集群中恢复。当集群完全停止后再启动时（包括在集群完全故障的情况下），pod 会以随机顺序重启。如果您的应用程序在 Dapr 控制平面（特别是注入器服务）准备好之前重启，Dapr sidecar 可能不会注入到您的应用程序的 pod 中，导致应用程序行为异常。

- 解决 sidecar 注入器可能出现的随机故障，例如注入器服务中的瞬时故障。

如果监控功能发现某个 pod 缺少 sidecar，而它本应该有一个，它会删除该 pod。然后 Kubernetes 会重新创建该 pod，并再次调用 Dapr sidecar 注入器。

注入器监控功能**默认是禁用的**。

您可以通过向 `operator` 命令传递 `--watch-interval` 标志来启用它，该标志可以取以下值之一：

- `--watch-interval=0`：禁用注入器监控功能（如果省略该标志，则为默认值）。
- `--watch-interval=<interval>`：启用注入器监控功能，并在给定的间隔检查所有 pod；间隔的值是一个包含单位的字符串。例如：`--watch-interval=10s`（每 10 秒）或 `--watch-interval=2m`（每 2 分钟）。
- `--watch-interval=once`：注入器监控功能仅在 Operator 服务启动时运行一次。

如果您使用 Helm，可以使用 [`dapr_operator.watchInterval` 选项](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md#dapr-operator-options)配置注入器监控功能，该选项的值与命令行标志相同。

> 当 Operator 服务以 HA（高可用性）模式运行且有多个副本时，注入器监控功能是安全的。在这种情况下，Kubernetes 会自动选举一个“领导”实例，该实例是唯一运行注入器监控服务的实例。

> 然而，在 HA 模式下，如果您将注入器监控功能配置为“once”运行，则每次 Operator 服务的一个实例被选为领导时，监控功能都会启动。这意味着，如果 Operator 服务的领导崩溃并选出新的领导，这将再次触发注入器监控功能。

观看此视频以了解注入器监控功能的概述：

<div class="embed-responsive embed-responsive-16by9">
<iframe width="360" height="315" src="https://www.youtube-nocookie.com/embed/ecFvpp24lpo?start=1848" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>