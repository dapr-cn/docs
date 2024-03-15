---
type: docs
title: 可观测性
linkTitle: 可观测性
weight: 500
description: |
  通过跟踪、指标、日志和健康状况观察应用程序
---

在构建应用程序时，了解系统行为是操作应用程序的一个重要而又具有挑战性的部分，例如：

- 观察应用程序的内部调用
- 衡量其性能
- 一旦出现问题，立即意识到问题的存在

对于由多个微服务组成的分布式系统来说，这一点尤其具有挑战性，因为由多个调用组成的流程可能从一个微服务开始，然后在另一个微服务中继续。

在生产环境中，应用程序的可观察性至关重要，而在开发过程中也非常有用：

- 了解瓶颈
- 提高性能
- 跨微服务执行基本调试

虽然可以从底层基础架构（内存消耗、CPU 使用率）收集有关应用程序的某些数据点，但必须从 "应用程序感知 "层收集其他有意义的信息--该层可以显示重要的一系列调用是如何在微服务间执行的。 通常情况下，您需要添加一些代码来检测应用程序，然后将收集到的数据（如跟踪和指标）发送到可观察性工具或服务，这些工具或服务可以帮助存储、可视化和分析所有这些信息。

维护此检测代码（不是应用程序核心逻辑的一部分）需要了解可观测性工具的 API、使用其他 SDK 等。 此检测还可能给应用程序带来可移植性挑战，需要根据应用程序的部署位置进行不同的检测。 For example:

- 不同的云提供商提供不同的可观测性工具
- 本地部署可能需要自托管解决方案

## 使用 Dapr 为应用提供可观察性

当您利用 Dapr API 构建块来执行服务到服务调用、发布/订阅消息传递和其他 API 时，Dapr 在 [分布式跟踪]({{< ref tracing >}}) 方面具有优势。 由于这种服务间通信是通过 Dapr 运行时（或 "sidecar"）进行的，因此 Dapr 在卸载应用程序级检测负担方面具有独特的优势。

### 分布式跟踪

Dapr可以使用广泛采用的[Open Telemetry (OTEL)](https://opentelemetry.io/)和[Zipkin](https://zipkin.io)协议来[配置以发出跟踪数据]({{< ref setup-tracing.md >}})。 这使得它很容易与多种可观测性工具集成。

<img src="/images/observability-tracing.png" width=1000 alt="Distributed tracing with Dapr">

### 自动生成跟踪上下文

Dapr使用[W3C tracing]({{<ref tracing>}}) 规范来跟踪上下文，作为Open Telemetry（OTEL）的一部分，用于为应用程序生成和传播上下文头，或传播用户提供的上下文头。 这意味着 Dapr 默认会进行跟踪。

## Dapr sidecar 和控制平面的可观测性

您还可以通过以下方式观察 Dapr 本身：

- 生成由 Dapr 副卡和 Dapr 控制平面服务发出的日志
- 收集有关性能、吞吐量和延迟的指标
- 使用健康端点探针显示 Dapr sidecar 健康状况

<img src="/images/observability-sidecar.png" width=1000 alt="Dapr sidecar metrics, logs and health checks">

### 日志

Dapr生成[日志]({{< ref logs.md >}})到：

- 提供 sidecar 运行的可见性
- 帮助用户发现问题并进行调试

日志事件包含由 Dapr 系统服务生成的警告，错误，信息和调试消息。 您还可以配置 Dapr，将日志发送到收集器，如 [Open Telemetry Collector]({{< ref otel-collector >}})，[Fluentd]({{< ref fluentd.md >}})，[New Relic]({{< ref "operations/observability/logging/newrelic.md" >}})，[Azure Monitor]({{< ref azure-monitor.md >}})，以及其他可观察性工具，这样就可以搜索和分析日志，提供见解。

### Metrics

指标（Metrics）是在一段时间内收集和存储的一系列度量值和计数。 [Dapr 指标]({{< ref metrics >}}) 提供监控功能，以了解 Dapr sidecar 和控制面板。 例如，Dapr sidecar 和用户应用之间的服务指标可以展示调用延迟、流量故障、请求的错误率等。

Dapr [控制面板指标](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md) 显示 sidecar 注入失败和控制面板服务的健康状态，包括CPU使用情况、actor placement 数量等。

### 健康检查

Dapr sidecar 暴露了一个HTTP端点用于[健康检查]({{< ref sidecar-health.md >}})。 有了这个应用程序接口，用户代码或托管环境就可以探测 Dapr 侧载程序，以确定其状态，并找出侧载程序就绪性方面的问题。

相反，Dapr 可配置为探测应用程序[的健康状况]({{< ref app-health.md >}})，并对应用程序的健康状况变化做出反应，包括停止发布/订阅和短路服务调用调用。

## 下一步

- [进一步了解使用 Dapr 开发时的可观测性]({{< ref tracing >}})
- [进一步了解使用 Dapr 运行时的可观察性]({{< ref tracing >}})
