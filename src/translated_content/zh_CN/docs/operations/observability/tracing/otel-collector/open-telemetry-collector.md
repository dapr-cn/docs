---
type: docs
title: "使用 OpenTelemetry Collector 收集追踪"
linkTitle: "使用 OpenTelemetry Collector"
weight: 900
description: "如何使用 Dapr 通过 OpenTelemetry Collector 推送追踪事件。"
---

Dapr 推荐使用 OpenTelemetry (OTLP) 协议来写入追踪数据。对于直接支持 OTLP 的可观测性工具，建议使用 [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector)，因为它可以快速卸载数据，并提供重试、批处理和加密等功能。更多信息请参阅 Open Telemetry Collector 的[文档](https://opentelemetry.io/docs/collector/#when-to-use-a-collector)。

Dapr 也支持使用 Zipkin 协议来写入追踪数据。在 OTLP 协议支持之前，Zipkin 协议与 OpenTelemetry Collector 一起使用，以将追踪数据发送到 AWS X-Ray、Google Cloud Operations Suite 和 Azure Monitor 等可观测性工具。虽然两种协议都有效，但推荐使用 OpenTelemetry 协议。

![使用 OpenTelemetry Collector 集成多个后端](/images/open-telemetry-collector.png)

## 先决条件

- [在 Kubernetes 上安装 Dapr]({{< ref kubernetes >}})
- 确保您的追踪后端已准备好接收追踪数据
- 查看 OTEL Collector 导出器所需的参数：
  - [`opentelemetry-collector-contrib/exporter`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter)
  - [`opentelemetry-collector/exporter`](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter)

## 配置 OTEL Collector 推送追踪数据到您的后端

1. 查看 [`open-telemetry-collector-generic.yaml`](/docs/open-telemetry-collector/open-telemetry-collector-generic.yaml)。

1. 将 `<your-exporter-here>` 替换为您的追踪导出器的实际配置。
   - 请参考[先决条件部分]({{< ref "#prerequisites.md" >}})中的 OTEL Collector 链接以获取正确的配置。

1. 使用以下命令应用配置：

   ```sh
   kubectl apply -f open-telemetry-collector-generic.yaml
   ```

## 配置 Dapr 发送追踪数据到 OTEL Collector

创建一个 Dapr 配置文件以启用追踪，并部署一个使用 OpenTelemetry Collector 的追踪导出器组件。

1. 使用此 [`collector-config.yaml`](/docs/open-telemetry-collector/collector-config.yaml) 文件创建您的配置。

1. 使用以下命令应用配置：

   ```sh 
   kubectl apply -f collector-config.yaml
   ```

## 部署应用程序并启用追踪

在需要参与分布式追踪的容器中添加 `dapr.io/config` 注解以应用 `appconfig` 配置，如下所示：

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
如果您正在使用 Dapr 的教程，例如[分布式计算器](https://github.com/dapr/quickstarts/tree/master/tutorials/distributed-calculator)，`appconfig` 配置已设置，无需额外操作。
{{% /alert %}}

您可以同时注册多个追踪导出器，追踪数据将被转发到所有注册的导出器。

就是这样！无需包含任何 SDK 或对您的应用程序代码进行修改。Dapr 会自动为您处理分布式追踪。

## 查看追踪

部署并运行一些应用程序。等待追踪数据传播到您的追踪后端并在那里查看它们。

## 相关链接
- 尝试 [可观测性快速入门](https://github.com/dapr/quickstarts/tree/master/tutorials/observability/README.md)
- 了解如何设置[追踪配置选项]({{< ref "configuration-overview.md#tracing" >}})
