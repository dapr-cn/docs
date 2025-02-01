---
type: docs
title: "操作指南：为分布式追踪设置 Datadog"
linkTitle: "Datadog"
weight: 5000
description: "为分布式追踪设置 Datadog"
---

Dapr 捕获的指标和追踪信息可以通过 OpenTelemetry Collector 的 Datadog 导出器直接发送到 Datadog。

## 使用 OpenTelemetry Collector 和 Datadog 配置 Dapr 追踪

您可以使用 OpenTelemetry Collector 的 Datadog 导出器来配置 Dapr，为 Kubernetes 集群中的每个应用程序创建追踪，并将这些追踪信息收集到 Datadog 中。

> 在开始之前，请先[设置 OpenTelemetry Collector]({{< ref "open-telemetry-collector.md#setting-opentelemetry-collector" >}})。

1. 在 `datadog` 导出器的配置部分，将您的 Datadog API 密钥添加到 `./deploy/opentelemetry-collector-generic-datadog.yaml` 文件中：
    ```yaml
    data:
      otel-collector-config:
        ...
        exporters:
          ...
          datadog:
            api:
              key: <YOUR_API_KEY>
    ```

1. 运行以下命令以应用 `opentelemetry-collector` 的配置。

    ```sh
    kubectl apply -f ./deploy/open-telemetry-collector-generic-datadog.yaml
    ```

1. 设置一个 Dapr 配置文件以启用追踪，并部署一个使用 OpenTelemetry Collector 的追踪导出器组件。

   ```sh
   kubectl apply -f ./deploy/collector-config.yaml
   ```

1. 在您希望参与分布式追踪的容器中添加 `dapr.io/config` 注解，以应用 `appconfig` 配置。

   ```yml
   annotations:
      dapr.io/config: "appconfig"
   ```

1. 创建并配置应用程序。应用程序运行后，遥测数据将被发送到 Datadog，并可以在 Datadog APM 中查看。

<img src="/images/datadog-traces.png" width=1200 alt="Datadog APM 显示遥测数据。">

## 相关链接/参考

* [在 Kubernetes 集群上设置 Dapr 的完整示例](https://github.com/ericmustin/quickstarts/tree/master/hello-kubernetes)
* [关于 OpenTelemetry 支持的 Datadog 文档](https://docs.datadoghq.com/opentelemetry/)
* [Datadog 应用性能监控](https://docs.datadoghq.com/tracing/)
