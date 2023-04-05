---
type: docs
title: "使用 OpenTelemetry Collector 来收集追踪信息，发送至 AppInsights"
linkTitle: "为 Azure AppInsights 使用 OpenTelemetry"
weight: 1000
description: "如何使用 OpenTelemetry Collector 将追踪事件推送到 Azure Application Insights。"
---

Dapr integrates with [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector) using the Zipkin API. This guide walks through an example using Dapr to push trace events to Azure Application Insights, using the OpenTelemetry Collector.

## Requirements

在 Kubernetes 上安装 Dapr。

## 如何配置分布式跟踪与 Application Insights

### Setup Application Insights

1. First, you'll need an Azure account. See instructions [here](https://azure.microsoft.com/free/) to apply for a **free** Azure account.
2. Follow instructions [here](https://docs.microsoft.com/azure/azure-monitor/app/create-new-resource) to create a new Application Insights resource.
3. Get the Application Insights Intrumentation key from your Application Insights page.

### 运行 OpenTelemetry Collector 来推送到您的 Application Insights 实例

安装 OpenTelemetry Collector 到您的 Kubernetes 集群，将事件推送到 Application Insights 实例中

1. Check out the file [open-telemetry-collector-appinsights.yaml](/docs/open-telemetry-collector/open-telemetry-collector-appinsights.yaml) and replace the `<INSTRUMENTATION-KEY>` placeholder with your Application Insights Instrumentation Key.

2. 使用 `kubectl apply -f open-telemetry-collector-appinsights.yaml` 来应用配置。

接下来，设置 Dapr 的配置文件以启用应用分布式追踪并部署一个使用 OpenTelemetry Collector 的应用追踪信息导出组件。

1. Create a collector-config.yaml file with this [content](/docs/open-telemetry-collector/collector-config.yaml)

2. 使用 `kubectl apply -f collector-config.yaml` 来应用配置

### 部署你的应用，并启用应用跟踪功能

在 Kubernetes 模式下运行时，通过将 `dapr.io/config` 注解添加到要参与分布式跟踪的容器中，从而来应用 `appconfig` 配置，示例配置如下所示

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  ...
spec:
  ...
  template:
    metadata:
      ...
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "MyApp"
        dapr.io/app-port: "8080"
        dapr.io/config: "appconfig"
```

一些快速入门案例，例如[分布式计算器](https://github.com/dapr/quickstarts/tree/master/tutorials/distributed-calculator)已经配置了这些设置，因此，如果您在使用这些时，则不需要进行其他的设置

就这么简单！ 没有必要包含任何的 SDK 或分析您的应用程序代码来确定是否能够支持。 Dapr 自动为您的程序负责了分布式跟踪。

> **备注**: 您可以同时注册多个的跟踪导出器，并将跟踪日志转发到所有已注册的导出器中。

部署并运行一些应用程序。 几分钟后，您应该看到在 Application Insights 资源中出现追踪日志。 您也可以使用 **Application Map** 来检查您服务的拓扑，如下所示：

![应用地图](/images/open-telemetry-app-insights.png)

> **注**：只有通过 Dapr sidecar 暴露的 Dapr API 操作（如服务调用或事件发布）才会显示在 Application Map 拓扑中。

## 相关链接
* Try out the [observability quickstart](https://github.com/dapr/quickstarts/tree/master/tutorials/observability/README.md)
* 如何设置[追踪配置选项]({{< ref "configuration-overview.md#tracing" >}})
