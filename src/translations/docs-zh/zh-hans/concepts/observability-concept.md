---
type: docs
title: "可观测性"
linkTitle: "可观测性"
weight: 500
description: >
  如何通过跟踪、度量、日志和健康状况来监控应用程序
---

在构建应用程序时，了解系统如何运行是运维的一个重要部分——这包括有能力观测应用程序的内部调用，评估其性能并在发生问题时立即意识到问题。 这对任何系统都是一种挑战，而对于由多个微服务组成的分布式系统来说更是如此，其中由多个调用组成的流程，可以在一个微服务中启动，然后在另一个微服务中继续。 可观察性在生产环境中至关重要，但在开发期间也很有用，可以了解瓶颈所在，提高性能并在整个微服务范围内进行基本的调试。

虽然可以从底层基础设施层收集有关应用程序的一些数据( 例如内存消耗， CPU 使用率) ，但其他有意义的信息必须从 "应用程序感知 " 层收集，比如用于显示一系列调用如何跨微服务执行的信息。 这通常意味着开发人员必须添加一些代码来用于此目的的应用程序。 通常，检测代码只是将收集的数据 ( 例如跟踪（traces）和度量（metrics）） 发送到外部监视工具或服务，由这些工具或服务来帮助存储，可视化和分析所有这些信息。

这是开发者的额外负担：必须维护此代码，即使它不属于应用程序核心逻辑的一部分，甚至有时还需要了解监视工具 API，使用额外的 SDK 等操作。 此检测需求可能会增加应用程序的可移植性难度，比如在不同地方部署时，该应用程序可能需要不同的检测代码。 例如，不同的云提供者提供不同的监控解决方案，而在本地部署中可能要求一个本地解决方案。

## 通过 Dapr 进行观测
在利用 Dapr 构建块来执行服务到服务调用和 pub/sub 消息传递构建应用程序时， Dapr 拥有相对于 [distributed tracing]({{<ref tracing>}}) 的优势，因为此服务间通信全部流经 Dapr sidecar，sidecar 处于这样独特的位置，可以消除应用程序级别检测的负担。

### 分布式跟踪
Dapr 可以[配置发送跟踪数据]({{<ref setup-tracing.md>}})，并且由于 Dapr 使用广泛采用的协议（如 [Zipkin](https://zipkin.io) 协议）进行跟踪，因此可以轻松地集成多个 [监控后端]({{<ref supported-tracing-backends>}})。

<img src="/images/observability-tracing.png" width=1000 alt="使用 Dapr 进行分布式跟踪">

### OpenTelemetry 采集器
Dapr 还可以通过配置来使用 [OpenTelemetry Collector]({{<ref open-telemetry-collector>}}) ，它会提供更多与外部监控工具的兼容性。

<img src="/images/observability-opentelemetry-collector.png" width=1000 alt="通过 OpenTelemetry collector 进行分布式跟踪">

### 跟踪上下文
Dapr 使用 [W3C 跟踪]({{<ref w3c-tracing>}}) 规范来跟踪上下文，并可以生成和传播上下文头本身或传播用户提供的上下文头。

## Dapr sidecar 和系统服务的可观察性
至于系统的其他部分，您希望能够观察 Dapr 本身，并收集 Dapr sidecar 沿每个微服务以及您环境中的 Dapr 相关服务（如部署在 Dapr 启用的 Kubernetes 集群中的控制面板服务）发出的指标和日志。

<img src="/images/observability-sidecar.png" width=1000 alt="Dapr sidecar 计量、日志和健康检查">

### 日志
Dapr 生成 [日志]({{<ref "logs.md">}})，以提供 sidecar 操作的可见性，并帮助用户识别问题并执行调试。 日志事件包含由 Dapr 系统服务生成的警告，错误，信息和调试消息。 Dapr 还可以通过配置将日志发送到收集器，例如 [Fluentd]({{< ref fluentd.md >}}) 和 [Azure Monitor]({{< ref azure-monitor.md >}}) ，这样就可以轻松搜索，分析和提供洞察。

### 度量
指标（Metrics）是在一段时间内收集和存储的一系列度量值和计数。 [Dapr 指标]({{<ref "metrics">}}) 提供监控功能，以了解 Dapr sidecar 和系统服务的行为。 例如，Dapr sidecar 和用户应用之间的服务指标可以展示调用延迟、流量故障、请求的错误率等。 Dapr 的[系统服务度量](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md) 则可以显示 sidecar 注入失败，系统服务的运行状况 ( 包括 CPU 使用率，actor 位置数量等) 。

### 健康状态
Dapr sidecar 暴露了 [健康检查]({{<ref sidecar-health.md>}})的 HTTP 终结点。 通过此终结点，可以探测 Dapr 进程或 sidecar，以确定它的准备度和活跃度，并采取相应的行动。
