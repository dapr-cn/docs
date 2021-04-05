---
type: docs
title: "使用 OpenTelemetry Collector 来收集应用痕迹"
linkTitle: "使用 OpenTelemetry Collector"
weight: 900
description: "如何结合 Dapr 和 OpenTelemetry Collector 实现跟踪事件的推送"
---

当 OpenTelemetry 项目进入到 GA（General Availability, 正式发布的版本）阶段时，Dapr 将会以 OpenTelemetry 的格式规范导出应用的痕迹信息。 同时，可以使用 Zipkin 要求的格式导出应用痕迹信息。 与 [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector) 结合一起使用，你可以将应用的痕迹信息发送到许多流行的分布式追踪后端程序中（例如 Azure AppInsights，AWS X-Ray ，StackDriver 等）

![使用 OpenTelemetry 收集器与别的后端进行集成](/images/open-telemetry-collector.png)

## 必备条件

1. A installation of Dapr on Kubernetes.

2. 您已经设置好了分布式追踪后端程序用以接受应用痕迹信息

3. 点击 [这里](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter) 和 [这里](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter) 去查看你的分布式追踪程序是否支持 OpenTelemetry Collector。 在这些外链的页面上，找到您要使用的应用痕迹导出工具，并阅读其文档以查找所需的参数。

## 使用 OpenTelemetry Collector

### 运行 OpenTelemetry Collector 推送到您的分布式应用跟踪后端程序


1. 签出这个文件 [open-telemetry-collector-generic.yaml](/docs/open-telemetry-collector/open-telemetry-collector-generic.yaml) 并将标记为 `<your-exporter-here>` 的部分替换成您正在正确使用的追踪导出器的设置。 再次提醒，请参阅前提条件中的关于 OpenTelemetry Collector 的链接以确定您的设置是正确的。

2. 使用 `kubectl apply -f open-telemetry-collector-generic.yaml` 来应用配置。

## 设置 Dapr 从而将应用痕迹信息发送到 OpenTelemetry Collector

### 在 Dapr 中启用应用痕迹追踪功能
Next, set up both a Dapr configuration file to turn on tracing and deploy a tracing exporter component that uses the OpenTelemetry Collector.

1. 创建具有[此内容的](/docs/open-telemetry-collector/collector-config.yaml) collector-config.yaml 文件

2. 使用 `kubectl apply -f collector-config.yaml`来应用配置

### 部署你的应用，并启用应用痕迹跟踪功能

When running in Kubernetes mode, apply the `appconfig` configuration by adding a `dapr.io/config` annotation to the container that you want to participate in the distributed tracing, as shown in the following example:

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

Some of the quickstarts such as [distributed calculator](https://github.com/dapr/quickstarts/tree/master/distributed-calculator) already configure these settings, so if you are using those no additional settings are needed.

That's it! There's no need include any SDKs or instrument your application code. Dapr automatically handles the distributed tracing for you.

> **备注**: 您可以同时注册多个的应用痕迹跟踪导出器，并且跟踪日志转发到所有已注册的导出器中。

Deploy and run some applications. 等待应用痕迹信息推送到您的分布式跟踪后端中，并在那里查看它们。

## 相关链接
* 尝试访问[可观察性快速入门](https://github.com/dapr/quickstarts/tree/master/observability/README.md)
* 如何设置[应用跟踪配置选项]({{< ref "configuration-overview.md#tracing" >}})

