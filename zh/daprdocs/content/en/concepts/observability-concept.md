---
type: docs
title: "可观测性"
linkTitle: "Observability"
weight: 500
description: >
  如何通过跟踪、指标、日志和健康状况来监控应用程序
---

可观测性是控制理论中的术语。 可观测性意味着您可以通过观察系统外部来回答系统内部发生了什么问题，而无需为了回答新的问题而发布新的代码。 在生产环境和服务中，可观测性对于调试、运维和监控Dapr系统服务、组件和用户应用至关重要。

可观测性能力使得用户能够监控Dapr系统服务、它们与用户应用程序的交互，并了解这些被监控的服务的行为。 可观测性能力分为以下几个领域。

## 分布式跟踪

[分布式跟踪]({{X21X}}) 用于对 Dapr 系统服务和用户应用程序进行分析和监控。 分布式跟踪有助于确定故障发生的位置和导致性能不佳的原因。 分布式跟踪特别适用于调试和监视分布式软件架构，如微服务。

您可以使用分布式跟踪来帮助调试和优化应用程序代码。 分布式跟踪包含 Dapr 运行时、Dapr 系统服务和跨进程、节点、网络和安全边界的用户应用之间的Trace Span。 它提供了对服务调用 (调用流) 和服务依赖的详细说明。

Dapr 使用 [W3C 跟踪上下文进行分布式跟踪]({{X23X}})

通常建议在生产中运行 Dapr 时开启跟踪。

### Open Telemetry

Dapr 集成了 [OpenTelemetry](https://opentelemetry.io/) ，用于跟踪、指标和日志。 借助 OpenTelemetry，您可以根据您的环境（无论是云上运行还是本地运行）配置各种Exporter进行跟踪和指标。

#### 下一步

- [操作方法：搭建 Zipkin]({{< ref zipkin.md >}})
- [操作方法：用Open Telemetry Collector搭建应用程序洞察器]({{< ref open-telemetry-collector.md >}})

## 指标

[指标]({{X26X}}) 是在一段时间内收集和存储的一系列测量值和计数。 Dapr 指标可以监控和了解 Dapr 系统服务和用户应用的行为。

例如，Dapr sidecar和用户应用之间的服务指标显示调用延迟、流量故障、请求的错误率等。

Dapr 系统服务指标显示 sidecar 注入失败、系统服务健康状态，包括 CPU 使用率、已做出的Actor放置数量等。

#### 下一步

- [操作方法：搭建 Prometheus 和 Grafana]({{< ref prometheus.md >}})
- [操作方法：搭建 Azure Monitor]({{< ref azure-monitor.md >}})

## 日志

[日志]({{X28X}}) 是已发生事件的记录，可用于确定故障或其他状态。

日志事件包含由 Dapr 系统服务生成的警告，错误，信息和调试消息。 每个日志事件都包含消息类型、主机名、组件名、应用 ID、IP 地址等元数据。

#### 下一步

- [操作方法：在 Kubernetes 中搭建 Fluentd、Elastic search 和 Kibana]({{< ref fluentd.md >}})
- [操作方法：搭建 Azure Monitor]({{< ref azure-monitor.md >}})

## 健康状态

Dapr 为托管平台提供了一种使用 HTTP 端点来确定其 [健康状况]({{X30X}}) 的方法。 通过此端点，可以探测 Dapr 进程或 sidecar，以确定它的准备度和活跃度，并采取相应的行动。

#### 下一步

- [健康状况 API]({{< ref health_api.md >}})