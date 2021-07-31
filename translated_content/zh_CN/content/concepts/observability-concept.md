---
type: docs
title: "可观测性"
linkTitle: "可观测性"
weight: 500
description: >
  如何通过跟踪、度量、日志和健康状况来监控应用程序
---

When building an application, understanding how the system is behaving is an important part of operating it - this includes having the ability to observe the internal calls of an application, gauging its performance and becoming aware of problems as soon as they occur. This is challenging for any system, but even more so for a distributed system comprised of multiple microservices where a flow, made of several calls, may start in one microservices but continue in another. Observability is critical in production environments, but also useful during development to understand bottlenecks, improve performance and perform basic debugging across the span of microservices.

While some data points about an application can be gathered from the underlying infrastructure (e.g. memory consumption, CPU usage), other meaningful information must be collected from an "application-aware" layer - one that can show how an important series of calls is executed across microservices. 这通常意味着开发人员必须添加一些代码来用于此目的的应用程序。 通常，检测代码只是将收集的数据 ( 例如跟踪（traces）和度量（metrics）） 发送到外部监视工具或服务，由这些工具或服务来帮助存储，可视化和分析所有这些信息。

Having to maintain this code, which is not part of the core logic of the application, is another burden on the developer, sometimes requiring understanding the monitoring tools' APIs, using additional SDKs etc. This instrumentation may also add to the portability challenges of an application, which may require different instrumentation depending on where the application is deployed. 例如，不同的云提供者提供不同的监控解决方案，而在本地部署中可能要求一个本地解决方案。

## 通过 Dapr 进行观测
When building an application which leverages Dapr building blocks to perform service-to-service calls and pub/sub messaging, Dapr offers an advantage with respect to [distributed tracing]({{<ref tracing>}}). Because this inter-service communication flows through the Dapr sidecar, the sidecar is in a unique position to offload the burden of application-level instrumentation.

### 分布式跟踪
Dapr 可以[配置发送跟踪数据]({{<ref setup-tracing.md>}})，并且由于 Dapr 使用广泛采用的协议（如 [Zipkin](https://zipkin.io) 协议）进行跟踪，因此可以轻松地集成多个 [监控后端]({{<ref supported-tracing-backends>}})。

<img src="/images/observability-tracing.png" width=1000 alt="使用 Dapr 进行分布式跟踪">

### OpenTelemetry 采集器
Dapr 还可以通过配置来使用 [OpenTelemetry Collector]({{<ref open-telemetry-collector>}}) ，它会提供更多与外部监控工具的兼容性。

<img src="/images/observability-opentelemetry-collector.png" width=1000 alt="通过 OpenTelemetry collector 进行分布式跟踪">

### 跟踪上下文
Dapr uses [W3C tracing]({{<ref w3c-tracing>}}) specification for tracing context and can generate and propagate the context header itself or propagate user-provided context headers.

## Dapr sidecar 和系统服务的可观察性
As for other parts of your system, you will want to be able to observe Dapr itself and collect metrics and logs emitted by the Dapr sidecar that runs along each microservice, as well as the Dapr-related services in your environment such as the control plane services that are deployed for a Dapr-enabled Kubernetes cluster.

<img src="/images/observability-sidecar.png" width=1000 alt="Dapr sidecar 计量、日志和健康检查">

### 日志
Dapr 生成 [日志]({{<ref "logs.md">}})，以提供 sidecar 操作的可见性，并帮助用户识别问题并执行调试。 日志事件包含由 Dapr 系统服务生成的警告，错误，信息和调试消息。 Dapr 还可以通过配置将日志发送到收集器，例如 [Fluentd]({{< ref fluentd.md >}}) 和 [Azure Monitor]({{< ref azure-monitor.md >}}) ，这样就可以轻松搜索，分析和提供洞察。

### 度量
指标（Metrics）是在一段时间内收集和存储的一系列度量值和计数。 [Dapr 指标]({{<ref "metrics">}}) 提供监控功能，以了解 Dapr sidecar 和系统服务的行为。 For example, the metrics between a Dapr sidecar and the user application show call latency, traffic failures, error rates of requests, etc. Dapr [system services metrics](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md) show sidecar injection failures and the health of system services, including CPU usage, number of actor placements made, etc.

### 健康状态
Dapr sidecar 暴露了 [健康检查]({{<ref sidecar-health.md>}})的 HTTP 终结点。 通过此终结点，可以探测 Dapr 进程或 sidecar，以确定它的准备度和活跃度，并采取相应的行动。
