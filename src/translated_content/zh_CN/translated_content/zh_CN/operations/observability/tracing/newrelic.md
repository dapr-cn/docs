---
type: docs
title: "操作方法：为分布式追踪安装 New Relic"
linkTitle: "New Relic"
weight: 2000
description: "为分布式追踪安装 New Relic"
---

## 前期准备

- Perpetually [free New Relic account](https://newrelic.com/signup?ref=dapr), 100 GB/month of free data ingest, 1 free full access user, unlimited free basic users

## 配置 Dapr 追踪

Dapr natively captures metrics and traces that can be send directly to New Relic. The easiest way to export these is by configuring Dapr to send the traces to [New Relic's Trace API](https://docs.newrelic.com/docs/distributed-tracing/trace-api/report-zipkin-format-traces-trace-api/) using the Zipkin trace format.

为了使集成将数据发送到 New Relic [遥测数据平台](https://newrelic.com/platform/telemetry-data-platform)，您需要一个 [New Relic Insights Insert API 密钥](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/#insights-insert-key)。

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

New Relic 分布式追踪概览 ![New Relic Kubernetes Cluster Explorer App](/images/nr-distributed-tracing-overview.png)

New Relic 分布式追踪详情 ![New Relic Kubernetes Cluster Explorer App](/images/nr-distributed-tracing-detail.png)

## (可选) New Relic 指令

为了能将 New Relic 与 Dapr 的集成的数据送往 New Relic Telemetry Data Platform，你需要 [New Relic license key](https://docs.newrelic.com/docs/accounts/accounts-billing/account-setup/new-relic-license-key) 或者 [New Relic Insights Insert API key](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/#insights-insert-key)。

### OpenTelemetry 指令

使用不同语言的特定 OpenTelemetry 指令， 比如 [New Relic Telemetry SDK 和 OpenTelemetry .NET 支持](https://github.com/newrelic/newrelic-telemetry-sdk-dotnet)。 在使用.NET的情况下，请使用 [OpenTelemetry Trace Exporter](https://github.com/newrelic/newrelic-telemetry-sdk-dotnet/tree/main/src/NewRelic.OpenTelemetry) 来导出数据。 [查看示例](https://github.com/harrykimpel/quickstarts/blob/master/distributed-calculator/csharp-otel/Startup.cs)。

### New Relic 代理

与 OpenTelemetry 指令类似，您还可以利用 New Relic 语言代理。 一个例子是 </a>.NET Core 的 New Relic 代理工具
是Docker文件的一部分。 [查看示例](https://github.com/harrykimpel/quickstarts/blob/master/distributed-calculator/csharp/Dockerfile)。</p> 



## （可选）启用 New Relic Kubernetes 集成

如果 Dapr 和您的应用程序在 Kubernetes 环境中运行，您可以启用额外的指标和日志。

安装 New Relic Kubernetes 集成的最简单方法是使用 [自动安装程序](https://one.newrelic.com/launcher/nr1-core.settings?pane=eyJuZXJkbGV0SWQiOiJrOHMtY2x1c3Rlci1leHBsb3Jlci1uZXJkbGV0Lms4cy1zZXR1cCJ9) 生成清单。 它不仅打包集成守护进程集，还捆绑了其他 New Relic Kubernetes 配置，如 [Kubernetes事件 ](https://docs.newrelic.com/docs/integrations/kubernetes-integration/kubernetes-events/install-kubernetes-events-integration)， [Prometheus OpenMetrics](https://docs.newrelic.com/docs/integrations/prometheus-integrations/get-started/send-prometheus-metric-data-new-relic/)，以及 [New Relic 日志监控](https://docs.newrelic.com/docs/logs/ui-data/use-logs-ui/)。



### New Relic Kubernetes 集群 Explorer

[New Relic Kubernetes Cluster Explorer](https://docs.newrelic.com/docs/integrations/kubernetes-integration/understand-use-data/kubernetes-cluster-explorer) 提供了 Kubernetes 集成所收集的所有数据和部署的独特可视化。

这是个好的开始，你可以观察所有数据并且深入了解应用程序或者微服务中的性能问题或者偶发问题。

![New Relic Kubernetes Cluster Explorer App](/images/nr-k8s-cluster-explorer-app.png)

自动关联是 New Relic 可视化功能的一部分。



### 容器级别详细信息

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

New Relic 与 [Grafana Labs](https://grafana.com/) 一起协作，所以你可以用 [Telemetry Data Platform](https://newrelic.com/platform/telemetry-data-platform) 做为 Prometheus metrics 的数据源， 并在现有的仪表盘中查看他们，从而无缝地利用 New Relic 提供的可靠性，可扩展性和安全性。

[Grafana 仪表板模板](https://github.com/dapr/dapr/blob/227028e7b76b7256618cd3236d70c1d4a4392c9a/grafana/README.md)监控 Dapr 系统服务和 sidecar，无需任何更改即可轻松使用。 New Relic 在 Grafana 中提供了一个 [给 Prometheus metrics 的原生端点](https://docs.newrelic.com/docs/integrations/grafana-integrations/set-configure/configure-new-relic-prometheus-data-source-grafana)。 让您可以轻松设置数据源：

![New Relic Grafana Data Source](/images/nr-grafana-datasource.png)

可以从 Dapr 导入完全相同的仪表板模板，以可视化 Dapr 系统服务和 sidecar。

![New Relic Grafana Dashboard](/images/nr-grafana-dashboard.png)



## New Relic 警报

从 Dapr、Kubernetes 或任何在其上运行的服务收集的所有数据都可用于将警报和通知设置到您选择的首选频道中。 See [Alerts and Applied Intelligence](https://docs.newrelic.com/docs/alerts-applied-intelligence/overview/).



## 相关链接/参考资料

* [New Relic Account Signup](https://newrelic.com/signup)
* [Telemetry 数据平台](https://newrelic.com/platform/telemetry-data-platform)
* [分布式追踪](https://docs.newrelic.com/docs/distributed-tracing/concepts/introduction-distributed-tracing/)
* [New Relic Trace API](https://docs.newrelic.com/docs/distributed-tracing/trace-api/introduction-trace-api/)
* [New Relic API 密钥类型](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/)
* [New Relic OpenTelemetry 用户体验](https://blog.newrelic.com/product-news/opentelemetry-user-experience/)
* [警报和应用智能](https://docs.newrelic.com/docs/alerts-applied-intelligence/overview/)
