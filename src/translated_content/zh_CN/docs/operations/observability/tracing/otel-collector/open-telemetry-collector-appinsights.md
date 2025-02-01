---
type: docs
title: "使用 OpenTelemetry Collector 将跟踪信息发送到应用程序洞察"
linkTitle: "通过 OpenTelemetry 连接 Azure 应用程序洞察"
weight: 1000
description: "如何使用 OpenTelemetry Collector 将跟踪事件推送到 Azure 应用程序洞察。"
---

Dapr 使用 Zipkin API 集成了 [OpenTelemetry (OTEL) Collector](https://github.com/open-telemetry/opentelemetry-collector)。本指南演示了如何通过 Dapr 使用 OpenTelemetry Collector 将跟踪事件推送到 Azure 应用程序洞察。

## 前提条件

- [在 Kubernetes 上安装 Dapr]({{< ref kubernetes >}})
- [设置一个应用程序洞察资源](https://docs.microsoft.com/azure/azure-monitor/app/create-new-resource)并记录下你的应用程序洞察仪器密钥。

## 配置 OTEL Collector 以推送数据到应用程序洞察

要将事件推送到你的应用程序洞察实例，请在 Kubernetes 集群中安装 OTEL Collector。

1. 查看 [`open-telemetry-collector-appinsights.yaml`](/docs/open-telemetry-collector/open-telemetry-collector-appinsights.yaml) 文件。

1. 用你的应用程序洞察仪器密钥替换 `<INSTRUMENTATION-KEY>` 占位符。

1. 使用以下命令应用配置：

   ```sh 
   kubectl apply -f open-telemetry-collector-appinsights.yaml
   ```

## 配置 Dapr 以发送跟踪数据到 OTEL Collector

创建一个 Dapr 配置文件以启用跟踪，并部署一个使用 OpenTelemetry Collector 的跟踪导出组件。

1. 使用此 [`collector-config.yaml`](/docs/open-telemetry-collector/collector-config.yaml) 文件创建你自己的配置。

1. 使用以下命令应用配置：

   ```sh
   kubectl apply -f collector-config.yaml
   ```

## 部署应用程序并启用跟踪

在你希望参与分布式跟踪的容器中添加 `dapr.io/config` 注解以应用 `appconfig` 配置，如下例所示：

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

{{% alert title="注意" color="primary" %}}
如果你正在使用 Dapr 教程之一，例如 [分布式计算器](https://github.com/dapr/quickstarts/tree/master/tutorials/distributed-calculator)，`appconfig` 配置已经设置好，因此不需要额外的配置。
{{% /alert %}}

你可以同时注册多个跟踪导出器，跟踪日志会被转发到所有注册的导出器。

就是这样！无需包含任何 SDK 或对你的应用程序代码进行额外的修改。Dapr 会自动为你处理分布式跟踪。

## 查看跟踪

部署并运行一些应用程序。几分钟后，你应该会在你的应用程序洞察资源中看到跟踪日志。你还可以使用 **应用程序地图** 来检查你的服务拓扑，如下所示：

![应用程序地图](/images/open-telemetry-app-insights.png)

{{% alert title="注意" color="primary" %}}
只有通过 Dapr sidecar 暴露的 Dapr API（例如，服务调用或事件发布）的操作会显示在应用程序地图拓扑中。
{{% /alert %}}

## 相关链接
- 尝试 [可观测性快速入门](https://github.com/dapr/quickstarts/tree/master/tutorials/observability/README.md)
- 了解如何设置 [跟踪配置选项]({{< ref "configuration-overview.md#tracing" >}})