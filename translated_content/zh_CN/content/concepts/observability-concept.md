---
type: docs
title: "可观测性"
linkTitle: "可观测性"
weight: 500
description: >
  通过追踪、指标、日志和健康状况来监控应用程序
---

在构建应用程序时，了解系统如何运行是运维的一个重要部分——这包括有能力观测应用程序的内部调用，评估其性能，并在问题发生时能立即意识到。 这对任何系统都是一种挑战，而对于由多个微服务组成的分布式系统来说更是如此，其中由多个调用组成的流程，可以在一个微服务中启动，然后在另一个微服务中继续。 可观察性在生产环境中至关重要，但在开发期间也很有用，可以了解瓶颈所在，提高性能，并跨越多个微服务的 span 进行基本的调试。

虽然可以从底层基础设施层收集有关应用程序的一些数据( 例如内存消耗， CPU 使用率) ，但其他有意义的信息必须从"应用程序感知"层收集，比如用于显示一系列调用如何跨微服务执行的信息。 这通常意味着开发人员必须添加一些代码来检测应用程序以实现此目的。 通常，检测代码只是将收集的数据（如跟踪和指标）发送到外部监视工具或服务，以帮助存储、可视化和分析所有这些信息。

这对开发者来说是额外负担：必须维护此代码，而它不属于应用程序核心逻辑的一部分，甚至有时还需要了解监控工具 API，使用额外的 SDK 等。 此检测需求可能会增加应用程序的可移植性难度，比如在不同地方部署时，该应用程序可能需要不同的检测代码。 例如，不同的云提供商提供不同的监控解决方案，而在本地部署中可能需要本地解决方案。

## 使用 Dapr 为应用提供可观察性
在构建使用 Dapr 构建块来执行服务间调用和发布/订阅消息传递的应用时，Dapr 在[分布式跟踪]({{<ref tracing>}})方面具有优势。 由于这种服务间通信流经 Dapr sidecar，因此，sidecar 处于独特的位置，可以缓解应用级遥测的负担。

### 分布式跟踪
Dapr 可以[配置为发送跟踪数据]({{<ref setup-tracing.md>}})，并且由于 Dapr 使用广泛采用的协议（如 [Zipkin](https://zipkin.io) 协议）进行跟踪，因此可以轻松地与多个[监控后端]({{<ref supported-tracing-backends>}})集成。

<img src="/images/observability-tracing.png" width=1000 alt="使用 Dapr 进行分布式跟踪">

### OpenTelemetry 采集器
Dapr还可以配置为与 [OpenTelemetry 采集器]({{<ref open-telemetry-collector>}})一起使用，可以获得与外部监视工具更高的兼容性。

<img src="/images/observability-opentelemetry-collector.png" width=1000 alt="通过 OpenTelemetry 采集器进行分布式跟踪">

### 跟踪上下文
Dapr 使用 [W3C tracing]({{<ref w3c-tracing>}}) 规范来跟踪上下文，并可以生成和传播上下文头本身或传播用户提供的上下文头。

## Dapr sidecar 和系统服务的可观察性
至于系统的其他部分，您将希望能够观察 Dapr 本身，并收集沿着每个微服务运行的 Dapr sidecar 以及您环境中与 Dapr 相关的服务（如部署在启用 Dapr 的 Kubernetes 集群中的控制面板服务）所发出的指标和日志。

<img src="/images/observability-sidecar.png" width=1000 alt="Dapr sidecar 计量、日志和健康检查">

### 日志
Dapr 生成[日志]({{<ref "logs.md">}})，以提供 sidecar 操作的可见性，并帮助用户识别问题和执行调试。 日志事件包含由 Dapr 系统服务生成的警告，错误，信息和调试消息。 Dapr 还可以通过配置将日志发送到收集器，例如 [Fluentd]({{< ref fluentd.md >}}) 和 [Azure Monitor]({{< ref azure-monitor.md >}}) ，这样就可以轻松搜索，分析并提供洞察力。

### 度量
指标（Metrics）是在一段时间内收集和存储的一系列度量值和计数。 [Dapr metrics]({{<ref "metrics">}}) 提供监控功能，以了解 Dapr sidecar 和系统服务的行为。 例如，Dapr sidecar 和用户应用之间的服务指标可以展示调用延迟、流量故障、请求的错误率等。 Dapr [系统服务指标](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md) 显示 sidecar 注入失败和系统服务的健康状态，包括CPU使用情况、actor placement 数量等。

### 健康状态
Dapr sidecar 为[健康检查]({{<ref sidecar-health.md>}})暴露 HTTP 端点。 使用此 API ，用户代码或托管环境可以探测 Dapr sidecar 以确定其状态，并识别 sidecar 就绪状态的问题。
