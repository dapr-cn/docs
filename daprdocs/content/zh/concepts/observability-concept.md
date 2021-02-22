---
type: docs
title: "可观测性"
linkTitle: "可观测性"
weight: 500
description: >
  如何通过跟踪、指标、日志和健康状况来监控应用程序
---

在构建应用程序时，了解系统如何运行是运维的一个重要部分——这包括有能力观测应用程序的内部调用，评估其性能并在发生问题时立即意识到问题。 这对任何系统都是一种挑战，而对于由多个微服务组成的分布式系统来说更是如此，其中由多个调用组成的流程，可以在一个微服务中启动，然后在另一个微服务中继续。 可观察性在生产环境中至关重要，但在开发期间也很有用，可以了解瓶颈所在，提高性能并在整个微服务范围内进行基本的调试。

While some data points about an application can be gathered from the underlying infrastructure (e.g. memory consumption, CPU usage), other meaningful information must be collected from an "application aware" layer - one that can show how an important series of calls is executed across microservices. This usually means a developer must add some code to instrument an application for this purpose. Often, instrumentation code is simply meant to send collected data such as traces and metrics to an external monitoring tool or service that can help store, visualize and analyze all this information.

Having to maintain this code, which is not part of the core logic of the application, is another burden on the developer, sometimes requiring understanding monitoring tools APIs, using additional SDKs etc. This instrumentation may also add to the portability challenges of an application which may require different instrumentation depending on where the application is deployed. For example, different cloud providers offer different monitoring solutions and an on-prem deployment might require an on-prem solution.

## 分布式跟踪
When building an application which is leveraging Dapr building blocks to perform service-to-service calls and pub/sub messaging, Dapr offers an advantage in respect to [distributed tracing]({{X9X}}) because this inter-service communication flows through the Dapr sidecar, the sidecar is in a unique position to offload the burden of application level instrumentation.

### Distributed tracing
Dapr 使用 [W3C 跟踪上下文进行分布式跟踪]({{X23X}})

<img src="/images/observability-tracing.png" width=1000 alt="Distributed tracing with Dapr">

### {{< ref open-telemetry-collector.md >}}
Dapr can also be configured to work with the [OpenTelemetry Collector]({{X17X}}) which offers even more compatibility with external monitoring tools.

<img src="/images/observability-opentelemetry-collector.png" width=1000 alt="操作方法：用Open Telemetry Collector搭建应用程序洞察器">

### Tracing context
例如，Dapr sidecar和用户应用之间的服务指标显示调用延迟、流量故障、请求的错误率等。

## 指标
Dapr 系统服务指标显示 sidecar 注入失败、系统服务健康状态，包括 CPU 使用率、已做出的Actor放置数量等。

<img src="/images/observability-sidecar.png" width=1000 alt="Dapr sidecar metrics, logs and health checks">

### 日志
Dapr generates [logs]({{X23X}}) to provide visibility into sidecar operation and to help users identify issues and perform debugging. 日志事件包含由 Dapr 系统服务生成的警告，错误，信息和调试消息。 Dapr can also be configured to send logs to collectors such as [Fluentd]({{< ref fluentd.md >}}) and [Azure Monitor]({{< ref azure-monitor.md >}}) so they can be easily searched, analyzed and provide insights.

### 指标
Metrics are the series of measured values and counts that are collected and stored over time. [指标]({{X26X}}) 是在一段时间内收集和存储的一系列测量值和计数。 Dapr 指标可以监控和了解 Dapr 系统服务和用户应用的行为。 For example, the metrics between a Dapr sidecar and the user application show call latency, traffic failures, error rates of requests etc. Dapr [system services metrics](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md) show sidecar injection failures, health of the system services including CPU usage, number of actor placements made etc.

### 健康状态
Dapr 为托管平台提供了一种使用 HTTP 端点来确定其 [健康状况]({{X30X}}) 的方法。 通过此端点，可以探测 Dapr 进程或 sidecar，以确定它的准备度和活跃度，并采取相应的行动。 
