---
type: docs
title: "使用 OpenTelemetry Collector 来收集应用痕迹"
linkTitle: "使用 OpenTelemetry Collector"
weight: 900
description: "如何结合 Dapr 和 OpenTelemetry Collector 实现跟踪事件的推送"
---

{{% alert title="Note" color="primary" %}}
Dapr directly writes traces using the OpenTelemetry (OTEL) protocol as the recommended method. For observability tools that support OTEL protocol, you do not need to use the OpenTelemetry Collector.

Dapr can also write traces using the Zipkin protocol. Previous to supporting the OTEL protocol, combining the Zipkin protocol with the [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector) enabled you to send traces to observability tools such as AWS X-Ray, Google Cloud Operations Suite, and Azure AppInsights. This approach remains for reference purposes only.
{{% /alert %}}

![Using OpenTelemetry Collect to integrate with many backend](/images/open-telemetry-collector.png)

## Requirements

1. A installation of Dapr on Kubernetes.

2. You are already setting up your trace backends  to receive traces.

3. Check OpenTelemetry Collector exporters [here](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter) and [here](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter) to see if your trace backend is supported by the OpenTelemetry Collector. On those linked pages, find the exporter you want to use and read its doc to find out the parameters required.

## 使用 OpenTelemetry Collector

### Run OpenTelemetry Collector to push to your trace backend

1. Check out the file [open-telemetry-collector-generic.yaml](/docs/open-telemetry-collector/open-telemetry-collector-generic.yaml) and replace the section marked with `<your-exporter-here>` with the correct settings for your trace exporter. Again, refer to the OpenTelemetry Collector links in the Prerequisites section to determine the correct settings.

2. 使用 `kubectl apply -f open-telemetry-collector-generic.yaml` 来应用配置。

## 设置 Dapr 从而将应用追踪信息发送到 OpenTelemetry Collector

### 在 Dapr 中启用追踪
Next, set up both a Dapr configuration file to turn on tracing and deploy a tracing exporter component that uses the OpenTelemetry Collector.

1. Create a collector-config.yaml file with this [content](/docs/open-telemetry-collector/collector-config.yaml)

2. 使用 `kubectl apply -f collector-config.yaml` 来应用配置

### 部署你的应用，并启用应用跟踪功能

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

Some of the quickstarts such as [distributed calculator](https://github.com/dapr/quickstarts/tree/master/tutorials/distributed-calculator) already configure these settings, so if you are using those no additional settings are needed.

That's it! There's no need include any SDKs or instrument your application code. Dapr automatically handles the distributed tracing for you.

> **备注**: 您可以同时注册多个的跟踪导出器，并将跟踪日志转发到所有已注册的导出器中。

Deploy and run some applications. Wait for the trace to propagate to your tracing backend and view them there.

## 相关链接
* Try out the [observability quickstart](https://github.com/dapr/quickstarts/tree/master/tutorials/observability/README.md)
* 如何设置[追踪配置选项]({{< ref "configuration-overview.md#tracing" >}})

