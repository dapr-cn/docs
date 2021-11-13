---
type: docs
title: "使用 OpenTelemetry Collector 来收集追踪信息，发送至 AppInsights"
linkTitle: "为 Azure AppInsights 使用 OpenTelemetry"
weight: 1000
description: "如何使用OpenTelemetry Collector将追踪事件推送到 Azure Application Insights。"
---

Dapr 使用 Zipkin API 与[OpenTelemetry Collector ](https://github.com/open-telemetry/opentelemetry-collector) 进行集成。 本指南通过一个示例，使用 Dapr 通过 OpenTelemetry Collector 将跟踪事件推送到 Azure Application Insights。

## 必备条件

在 Kubernetes 上安装 Dapr

## 如何配置分布式跟踪与 Application Insights

### 设置 Application Insights

1. 首先，您需要一个 Azure 帐户。 请参阅 [此处](https://azure.microsoft.com/free/) 申请 **免费** Azure 帐户的说明。
2. Follow instructions [here](https://docs.microsoft.com/azure/azure-monitor/app/create-new-resource) to create a new Application Insights resource.
3. 从 Application Insights 页面获取 Application Insights Intrumentation key。

### 运行 OpenTelemetry Collector 来推送到您的 Application Insights 实例

安装 OpenTelemetry Collector 到您的 Kubernetes 集群，将事件推送到 Application Insights 实例中

1. 查看 [open-telemetry-collector-appinsights.yaml](/docs/open-telemetry-collector/open-telemetry-collector-appinsights.yaml)文件 ，用您的 Application Insights Instrumentation key替换 `<INSTRUMENTATION-KEY>` 占位符。

2. 使用 `kubectl apply -f open-telemetry-collector-appinsights.yaml` 来应用配置。

接下来，设置 Dapr 的配置文件以启用应用分布式追踪并部署一个使用 OpenTelemetry Collector 的应用追踪信息导出组件。

1. 创建具有[此内容的](/docs/open-telemetry-collector/collector-config.yaml) 的 collector-config.yaml 文件

2. 使用 `kubectl apply -f collector-config.yaml`来应用配置

### 部署你的应用，并启用应用跟踪功能

在 Kubernetes 模式下运行时，通过将`dapr.io/config`注解添加到要参与分布式跟踪的容器中，从而来应用`appconfig`配置，示例配置如下所示

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

一些快速入门案例，例如[分布式计算器](https://github.com/dapr/quickstarts/tree/master/distributed-calculator)已经配置了这些设置，因此，如果您在使用这些时，则不需要进行其他的设置

就这么简单！ 没有必要包含任何的 SDK 或分析您的应用程序代码来确定是否能够支持。 Dapr 自动为您的程序负责了分布式跟踪。

> **备注**: 您可以同时注册多个的应用痕迹跟踪导出器，并且跟踪日志转发到所有已注册的导出器中。

部署并运行一些应用程序。 几分钟后，您应该看到在 Application Insights 资源中出现追踪日志。 您也可以使用 **Application Map** 来检查您服务的拓扑，如下所示：

![Application map](/images/open-telemetry-app-insights.png)

> **注**：只有通过 Dapr sidecar 暴露的 Dapr API 操作（如服务调用或事件发布）才会显示在 Application Map 拓扑中。

## 相关链接
* 尝试访问[可观察性快速入门](https://github.com/dapr/quickstarts/tree/master/observability/README.md)
* How to set [tracing configuration options]({{< ref "configuration-overview.md#tracing" >}})
