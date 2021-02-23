---
type: docs
title: "可观测性"
linkTitle: "可观测性"
weight: 500
description: >
  如何通过跟踪、指标、日志和健康状况来监控应用程序
---

在构建应用程序时，了解系统如何运行是运维的一个重要部分——这包括有能力观测应用程序的内部调用，评估其性能并在发生问题时立即意识到问题。 这对任何系统都是一种挑战，而对于由多个微服务组成的分布式系统来说更是如此，其中由多个调用组成的流程，可以在一个微服务中启动，然后在另一个微服务中继续。 可观察性在生产环境中至关重要，但在开发期间也很有用，可以了解瓶颈所在，提高性能并在整个微服务范围内进行基本的调试。

虽然可以从底层基础设施层收集有关应用程序的一些数据( 例如内存消耗， CPU 使用率) ，但其他有意义的信息必须从 "应用程序感知 " 层收集，比如用于显示一系列调用如何跨微服务执行的信息。 开发者为此目的必须为应用添加一些代码进行检测。 通常，检测代码只是将收集的数据 ( 例如跟踪（traces）和度量（metrics）） 发送到外部监视工具或服务，由这些工具或服务来帮助存储，可视化和分析所有这些信息。

这是开发者的额外负担：必须维护此代码，即使它不属于应用程序的核心逻辑的一部分，有时还需要了解监视工具 API，使用额外的 SDK 等操作。 此检测需求可能会增加应用程序的可移植性难度，比如在不同地方部署时，该应用程序可能需要不同的检测代码。 例如，不同的云提供者提供不同的监控解决方案，而在本地部署中可能要求一个本地解决方案。

## 分布式跟踪
在利用 Dapr 构建块来执行服务到服务调用和 pub/sub 消息传递构建应用程序时， Dapr 拥有相对于 [distributed tracing]({{X9X}}) 的优势，因为此服务间通信全部流经 Dapr sidecar，sidecar 处于这样独特的位置，可以消除应用程序级别检测的负担。

### 分布式跟踪
Dapr 使用 [W3C 跟踪上下文进行分布式跟踪]({{X23X}})

<img src="/images/observability-tracing.png" width=1000 alt="使用 Dapr 进行分布式跟踪">

### {{< ref open-telemetry-collector.md >}}
Dapr 还可以通过配置来使用 [OpenTelemetry Collector]({{X17X}}) ，它会提供更多与外部监控工具的兼容性。

<img src="/images/observability-opentelemetry-collector.png" width=1000 alt="通过 OpenTelemetry collector 进行分布式跟踪">

### 跟踪上下文
例如，Dapr sidecar和用户应用之间的服务指标显示调用延迟、流量故障、请求的错误率等。

## Dapr sidecar和系统服务的观测性
对于系统的其他部分，您将希望能够观察 Dapr 本身并收集 Dapr sidecar 发出的度量和日志，这些度量和日志沿每个微服务运行，以及在环境中的 Dapr 相关服务，例如为启用Dapr的Kubernetes集群部署的控制平面服务。

<img src="/images/observability-sidecar.png" width=1000 alt="Dapr sidecar 计量、日志和健康检查">

### 日志
Dapr生成 [日志]({{X23X}}) 以提供sidecar操作的可见性，并帮助用户识别问题和执行调试操作。 日志事件包含由 Dapr 系统服务生成的警告，错误，信息和调试消息。 Dapr 还可以通过配置将日志发送到收集器，例如 [Fluentd]({{< ref fluentd.md >}}) 和 [Azure Monitor]({{< ref azure-monitor.md >}}) ，这样就可以轻松搜索，分析和提供洞察。

### 指标
指标（Metrics）是在一段时间内收集和存储的一系列度量值和计数。 [Dapr 指标]({{X27X}}) 提供监控功能，以了解 Dapr sidecar 和系统服务的行为。 例如，Dapr sidecar 和用户应用之间的服务指标可以展示调用延迟、流量故障、请求的错误率等。 Dapr 的[系统服务度量](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md) 则可以显示 sidecar 注入失败，系统服务的运行状况 ( 包括 CPU 使用率，actor 位置数量等) 。

### 健康检查
Dapr 为托管平台提供了一种使用 HTTP 端点来确定其 [健康状况]({{X30X}}) 的方法。 使用此 API ，用户代码或托管环境可以探测 Dapr sidecar 以确定其状态，并识别 sidecar 就绪状态的问题。 
