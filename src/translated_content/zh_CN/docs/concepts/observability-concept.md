---
type: docs
title: "可观测性"
linkTitle: "可观测性"
weight: 500
description: >
  通过追踪、指标、日志和健康检查来观察应用程序
---

在构建应用程序时，理解系统行为是操作应用程序的重要且具有挑战性的部分，例如：
- 观察应用程序的内部调用
- 评估其性能
- 在问题发生时立即意识到

对于由多个微服务组成的分布式系统来说，这尤其具有挑战性，因为一个由多个调用组成的流程可能在一个微服务中开始并在另一个微服务中继续。

在生产环境中，应用程序的可观测性至关重要，并且在开发过程中也很有用，以便：
- 理解瓶颈
- 提高性能
- 在微服务范围内进行基本调试

虽然可以从底层基础设施（如内存消耗、CPU使用率）中收集一些关于应用程序的数据点，但其他有意义的信息必须从“应用程序感知层”收集——这个层可以显示重要调用系列如何在微服务之间执行。通常，您需要添加一些代码来对应用程序进行检测，这些代码将收集的数据（如追踪和指标）发送到可观测性工具或服务，这些工具或服务可以帮助存储、可视化和分析所有这些信息。

维护这些检测代码（它们不是应用程序核心逻辑的一部分）需要理解可观测性工具的API，使用额外的SDK等。这种检测也可能为您的应用程序带来可移植性挑战，要求根据应用程序的部署位置进行不同的检测。例如：
- 不同的云提供商提供不同的可观测性工具
- 本地部署可能需要自托管解决方案

## 使用Dapr实现应用程序的可观测性

当您利用Dapr API构建块进行服务间调用、发布/订阅消息传递和其他API时，Dapr在[分布式追踪]({{< ref tracing >}})方面提供了优势。由于这种服务间通信通过Dapr运行时（或“sidecar”）流动，Dapr处于一个独特的位置，可以减轻应用程序级别检测的负担。

### 分布式追踪

Dapr可以使用广泛采用的[Open Telemetry (OTEL)](https://opentelemetry.io/)和[Zipkin](https://zipkin.io)协议[配置以发出追踪数据]({{< ref setup-tracing.md >}})。这使得它可以轻松集成到多个可观测性工具中。

<img src="/images/observability-tracing.png" width=1000 alt="使用Dapr的分布式追踪">

### 自动追踪上下文生成

Dapr使用[W3C追踪]({{< ref tracing >}})规范作为追踪上下文的一部分，包含在Open Telemetry (OTEL)中，用于生成和传播应用程序的上下文头或传播用户提供的上下文头。这意味着您可以默认获得Dapr的追踪功能。

## Dapr sidecar和控制平面的可观测性

您还可以通过以下方式观察Dapr本身：
- 生成由Dapr sidecar和Dapr控制平面服务发出的日志
- 收集性能、吞吐量和延迟的指标
- 使用健康端点探测来指示Dapr sidecar的健康状态

<img src="/images/observability-sidecar.png" width=1000 alt="Dapr sidecar的指标、日志和健康检查">

### 日志记录

Dapr生成[日志]({{< ref logs.md >}})以：
- 提供对sidecar操作的可见性
- 帮助用户识别问题并进行调试

日志事件包含由Dapr系统服务生成的警告、错误、信息和调试消息。您还可以配置Dapr将日志发送到收集器，如[Open Telemetry Collector]({{< ref otel-collector >}})、[Fluentd]({{< ref fluentd.md >}})、[New Relic]({{< ref "operations/observability/logging/newrelic.md" >}})、[Azure Monitor]({{< ref azure-monitor.md >}})和其他可观测性工具，以便可以搜索和分析日志以提供见解。

### 指标

指标是一系列测量值和计数，随着时间的推移被收集和存储。[Dapr指标]({{< ref metrics >}})提供监控能力，以理解Dapr sidecar和控制平面的行为。例如，Dapr sidecar和用户应用程序之间的指标显示调用延迟、流量失败、请求错误率等。

Dapr [控制平面指标](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md)显示sidecar注入失败和控制平面服务的健康状况，包括CPU使用率、actor放置的数量等。

### 健康检查

Dapr sidecar公开了一个HTTP端点用于[健康检查]({{< ref sidecar-health.md >}})。通过这个API，用户代码或托管环境可以探测Dapr sidecar以确定其状态并识别sidecar准备就绪的问题。

相反，Dapr可以配置为探测[您的应用程序的健康状况]({{< ref app-health.md >}})，并对应用程序健康状况的变化做出反应，包括停止pub/sub订阅和短路服务调用。

## 下一步

- [了解更多关于使用Dapr进行开发的可观测性]({{< ref tracing >}})
- [了解更多关于使用Dapr进行操作的可观测性]({{< ref tracing >}})