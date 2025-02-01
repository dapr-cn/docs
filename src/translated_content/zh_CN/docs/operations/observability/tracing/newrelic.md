---
type: docs
title: "操作指南：配置 New Relic 进行分布式追踪"
linkTitle: "New Relic"
weight: 2000
description: "配置 New Relic 进行分布式追踪"
---

## 前提条件

- 需要一个 [New Relic 账户](https://newrelic.com/signup?ref=dapr)，该账户永久免费，每月可免费处理 100 GB 的数据，包含 1 个完全访问用户和无限数量的基本用户。

## 配置 Dapr 追踪

Dapr 可以直接将其捕获的指标和追踪数据发送到 New Relic。最简单的方式是通过配置 Dapr，将追踪数据以 Zipkin 格式发送到 [New Relic 的 Trace API](https://docs.newrelic.com/docs/distributed-tracing/trace-api/report-zipkin-format-traces-trace-api/)。

为了将数据集成到 New Relic 的 [Telemetry Data Platform](https://newrelic.com/platform/telemetry-data-platform)，您需要一个 [New Relic Insights Insert API key](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/#insights-insert-key)。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
  namespace: default
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: "https://trace-api.newrelic.com/trace/v1?Api-Key=<NR-INSIGHTS-INSERT-API-KEY>&Data-Format=zipkin&Data-Format-Version=2"
```

### 查看追踪

New Relic 分布式追踪概览
![New Relic Kubernetes Cluster Explorer App](/images/nr-distributed-tracing-overview.png)

New Relic 分布式追踪详情
![New Relic Kubernetes Cluster Explorer App](/images/nr-distributed-tracing-detail.png)

## （选择性）New Relic 仪器化

为了将数据集成到 New Relic Telemetry Data Platform，您需要一个 [New Relic license key](https://docs.newrelic.com/docs/accounts/accounts-billing/account-setup/new-relic-license-key) 或 [New Relic Insights Insert API key](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/#insights-insert-key)。

### OpenTelemetry 仪器化

您可以使用不同语言的 OpenTelemetry 实现，例如 [New Relic Telemetry SDK 和 .NET 的 OpenTelemetry 支持](https://github.com/newrelic/newrelic-telemetry-sdk-dotnet)。在这种情况下，使用 [OpenTelemetry Trace Exporter](https://github.com/newrelic/newrelic-telemetry-sdk-dotnet/tree/main/src/NewRelic.OpenTelemetry)。示例请参见[此处](https://github.com/harrykimpel/quickstarts/blob/master/distributed-calculator/csharp-otel/Startup.cs)。

### New Relic 语言代理

类似于 OpenTelemetry 仪器化，您也可以使用 New Relic 语言代理。例如，.NET Core 的 [New Relic 代理仪器化](https://docs.newrelic.com/docs/agents/net-agent/other-installation/install-net-agent-docker-container) 是 Dockerfile 的一部分。示例请参见[此处](https://github.com/harrykimpel/quickstarts/blob/master/distributed-calculator/csharp/Dockerfile)。

## （选择性）启用 New Relic Kubernetes 集成

如果 Dapr 和您的应用程序在 Kubernetes 环境中运行，您可以启用额外的指标和日志。

安装 New Relic Kubernetes 集成的最简单方法是使用 [自动安装程序](https://one.newrelic.com/launcher/nr1-core.settings?pane=eyJuZXJkbGV0SWQiOiJrOHMtY2x1c3Rlci1leHBsb3Jlci1uZXJkbGV0Lms4cy1zZXR1cCJ9) 生成清单。它不仅包含集成 DaemonSets，还包括其他 New Relic Kubernetes 配置，如 [Kubernetes 事件](https://docs.newrelic.com/docs/integrations/kubernetes-integration/kubernetes-events/install-kubernetes-events-integration)、[Prometheus OpenMetrics](https://docs.newrelic.com/docs/integrations/prometheus-integrations/get-started/send-prometheus-metric-data-new-relic/) 和 [New Relic 日志监控](https://docs.newrelic.com/docs/logs/ui-data/use-logs-ui/)。

### New Relic Kubernetes 集群浏览器

[New Relic Kubernetes 集群浏览器](https://docs.newrelic.com/docs/integrations/kubernetes-integration/understand-use-data/kubernetes-cluster-explorer) 提供了一个独特的可视化界面，展示了 Kubernetes 集成收集的所有数据和部署。

这是观察所有数据并深入了解应用程序或微服务内部发生的任何性能问题或事件的良好起点。

![New Relic Kubernetes Cluster Explorer App](/images/nr-k8s-cluster-explorer-app.png)

自动关联是 New Relic 可视化功能的一部分。

### Pod 级别详情

![New Relic K8s Pod Level Details](/images/nr-k8s-pod-level-details.png)

### 上下文中的日志

![New Relic K8s Logs In Context](/images/nr-k8s-logs-in-context.png)

## New Relic 仪表板

### Kubernetes 概览

![New Relic Dashboard Kubernetes Overview](/images/nr-dashboard-k8s-overview.png)

### Dapr 系统服务

![New Relic Dashboard Dapr System Services](/images/nr-dashboard-dapr-system-services.png)

### Dapr 指标

![New Relic Dashboard Dapr Metrics 1](/images/nr-dashboard-dapr-metrics-1.png)

## New Relic Grafana 集成

New Relic 与 [Grafana Labs](https://grafana.com/) 合作，您可以使用 [Telemetry Data Platform](https://newrelic.com/platform/telemetry-data-platform) 作为 Prometheus 指标的数据源，并在现有仪表板中查看它们，轻松利用 New Relic 提供的可靠性、规模和安全性。

用于监控 Dapr 系统服务和 sidecar 的 [Grafana 仪表板模板](https://github.com/dapr/dapr/blob/227028e7b76b7256618cd3236d70c1d4a4392c9a/grafana/README.md) 可以轻松使用，无需任何更改。New Relic 提供了一个 [Prometheus 指标的本地端点](https://docs.newrelic.com/docs/integrations/grafana-integrations/set-configure/configure-new-relic-prometheus-data-source-grafana) 到 Grafana。可以轻松设置数据源：

![New Relic Grafana Data Source](/images/nr-grafana-datasource.png)

并且可以导入来自 Dapr 的完全相同的仪表板模板，以可视化 Dapr 系统服务和 sidecar。

![New Relic Grafana Dashboard](/images/nr-grafana-dashboard.png)

## New Relic 警报

从 Dapr、Kubernetes 或任何在其上运行的服务收集的所有数据都可以用于设置警报和通知到您选择的首选渠道。请参见 [Alerts and Applied Intelligence](https://docs.newrelic.com/docs/alerts-applied-intelligence/overview/)。

## 相关链接/参考

* [New Relic 账户注册](https://newrelic.com/signup)
* [Telemetry Data Platform](https://newrelic.com/platform/telemetry-data-platform)
* [分布式追踪](https://docs.newrelic.com/docs/distributed-tracing/concepts/introduction-distributed-tracing/)
* [New Relic Trace API](https://docs.newrelic.com/docs/distributed-tracing/trace-api/introduction-trace-api/)
* [New Relic API 密钥类型](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/)
* [New Relic OpenTelemetry 用户体验](https://blog.newrelic.com/product-news/opentelemetry-user-experience/)
* [Alerts and Applied Intelligence](https://docs.newrelic.com/docs/alerts-applied-intelligence/overview/)
