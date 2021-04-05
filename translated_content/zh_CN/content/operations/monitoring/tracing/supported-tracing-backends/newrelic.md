---
type: docs
title: "指南：为 Dapr observability 设置 New Relic"
linkTitle: "New Relic"
weight: 2000
description: "为 Dapr observability 设置 New Relic"
---

## 前期准备

- 永久 [免费的 New Relic 账户](https://newrelic.com/signup), 100 GB/月免费数据摄取, 1 个免费的完整访问权限用户, 无限制免费基本用户

## 配置Dapr追踪

Dapr本机捕获的度量和跟踪可以直接发送到New Relic。 最简单的导出方式是配置Dapr来使用 Zipkin 跟踪格式发送追踪到 [New Relic Trace API](https://docs.newrelic.com/docs/understand-dependencies/distributed-tracing/trace-api/report-zipkin-format-traces-trace-api#existing-zipkin)。

为了集成将数据发送到New Relic [Telemetry Data Platform](https://newrelic.com/platform/telemetry-data-platform)您需要一个 [New Relic Insights Insert API key](https://docs.newrelic.com/docs/apis/get-started/intro-apis/types-new-relic-api-keys#insights-insert-key)。

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

New Relic 分布式追踪概览 ![New Relic Kubernetes 集群资源管理器应用](/images/nr-distributed-tracing-overview.png)

New Relic 分布式追踪详情![New Relic Kubernetes 集群资源管理器应用](/images/nr-distributed-tracing-detail.png)

## (可选) New Relic 仪器

为了将数据发送给New Relic的遥测数据的集成平台,你需要一个 [New Relic的许可证密钥](https://docs.newrelic.com/docs/accounts/accounts-billing/account-setup/new-relic-license-key) 或 [New Relic的Insights Insert API Key](https://docs.newrelic.com/docs/apis/get-started/intro-apis/types-new-relic-api-keys#insights-insert-key)。

### OpenTelemetry 工具

利用不同语言的 OpenTelemetry 实现，例如 [支持 .NET 的 New Relic Telemetry SDK 和 OpenTelemetry](https://github.com/newrelic/newrelic-telemetry-sdk-dotnet)。 在这种情况下，使用 [OpenTelemetry Trace Exporter](https://github.com/newrelic/newrelic-telemetry-sdk-dotnet/tree/main/src/NewRelic.OpenTelemetry)。  [查看示例](https://github.com/harrykimpel/quickstarts/blob/master/distributed-calculator/csharp-otel/Startup.cs)。

### New Relic 语言代理

类似于 OpenTelemetry 仪器, 您也可以利用一个 New Relic 语言代理。 一个例子是 </a>.NET Core 的 New Relic 代理工具
是Docker文件的一部分。  [查看示例](https://github.com/harrykimpel/quickstarts/blob/master/distributed-calculator/csharp/Dockerfile)。</p> 



## (可选) 启用 New Relic Kubernetes 集成

如果 Dapr 和您的应用程序在Kubernetes环境中运行，您可以启用额外的度量和日志。

安装New Relic Kubernetes集成的最简单方法是使用[自动安装程序](https://one.newrelic.com/launcher/nr1-core.settings?pane=eyJuZXJkbGV0SWQiOiJrOHMtY2x1c3Rlci1leHBsb3Jlci1uZXJkbGV0Lms4cy1zZXR1cCJ9)生成一个清单。 它不仅包着集成守护程序，而且包着其他New Relic Kubernetes配置， 像 [Kubernetes 事件](https://docs.newrelic.com/docs/integrations/kubernetes-integration/kubernetes-events/install-kubernetes-events-integration), [Prometheus OpenMetrics](https://docs.newrelic.com/docs/integrations/prometheus-integrations/get-started/new-relic-prometheus-openmetrics-integration-kubernetes), 和 [New Relic日志监测](https://docs.newrelic.com/docs/logs)。



### New Relic Kubernetes 集群浏览器

[New Relic Kubernetes Cluster Explorer](https://docs.newrelic.com/docs/integrations/kubernetes-integration/understand-use-data/kubernetes-cluster-explorer)提供了Kubernetes集成收集的数据的整个数据和部署的独特可视化。

观察您的所有数据并深入了解应用程序或微型服务内发生的任何性能问题或事故是一个很好的起点。

![New Relic Kubernetes 集群资源管理器应用](/images/nr-k8s-cluster-explorer-app.png)

自动关联是New Relic的可视化功能的一部分。



### Pod 级别细节

![New Relic K8s Pod 级别详细信息](/images/nr-k8s-pod-level-details.png)



### 上下文中的日志

![在上下文日志的 New Relic K8s](/images/nr-k8s-logs-in-context.png)



## New Relic 仪表盘



### Kubernetes 概述

![New Relic 仪表盘 Kubernetes 概览](/images/nr-dashboard-k8s-overview.png)



### Dapr 系统服务

![New Relic 仪表盘 Dapr 系统服务](/images/nr-dashboard-dapr-system-services.png)



### Dapr 度量

![New Relic 仪表盘 Dapr Metrics 1](/images/nr-dashboard-dapr-metrics-1.png)



## New Relic Grafana 集成

New Relic 与 [Grafana Labs](https://grafana.com/) 联手让您可以使用 [遥测数据平台](https://newrelic.com/platform/telemetry-data-platform) 作为 Prometheus metrics 的数据源并展示在仪表盘中, 无缝地利用了New Relic提供的可靠性、规模和安全性。

[Grafana 仪表板模板](https://github.com/dapr/dapr/blob/227028e7b76b7256618cd3236d70c1d4a4392c9a/grafana/README.md) 用于监视Dapr系统服务和sidecars可以让你轻松使用而不做任何更改。 New Relic提供了[用于 Prometheus metrics 的原生端点](https://docs.newrelic.com/docs/integrations/grafana-integrations/set-configure/configure-new-relic-prometheus-data-source-grafana)到Grafana。 数据源可以很容易地设置:

![New Relic Grafana Data Source](/images/nr-grafana-datasource.png)

也可以从 Dapr 导入完全相同的仪表板模板以可视化Dapr 系统服务和 sidecars。

![New Relic Grafana 仪表盘](/images/nr-grafana-dashboard.png)



## New Relic 警报

从Dapr、Kubernetes或运行在其上的任何服务收集的所有数据都可以用于设置警报和通知到您选择的首选通道。 参见[警报和应用情报](https://docs.newrelic.com/docs/alerts-applied-intelligence)。



## 关联链接/参考

* [New Relic 注册](https://newrelic.com/signup)
* [遥测数据平台](https://newrelic.com/platform/telemetry-data-platform)
* [分布式跟踪](https://docs.newrelic.com/docs/understand-dependencies/distributed-tracing/get-started/introduction-distributed-tracing)
* [New Relic Trace API](https://docs.newrelic.com/docs/understand-dependencies/distributed-tracing/trace-api)
* [New Relic Metric API](https://docs.newrelic.com/docs/telemetry-data-platform/get-data/apis/introduction-metric-api)
* [New Relic API key 类型](https://docs.newrelic.com/docs/apis/get-started/intro-apis/types-new-relic-api-keys)
* [New Relic OpenTelemetry 用户体验](https://blog.newrelic.com/product-news/opentelemetry-user-experience/)
* [警报和应用情报](https://docs.newrelic.com/docs/alerts-applied-intelligence)
