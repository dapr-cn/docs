---
type: docs
title: "使用 OpenTelemetry Collector 收集追踪信息并发送到 Jaeger"
linkTitle: "使用 OpenTelemetry 发送到 Jaeger"
weight: 1200
description: "如何使用 OpenTelemetry Collector 将追踪事件推送到 Jaeger 分布式追踪平台。"
---

Dapr 支持通过 OpenTelemetry (OTLP) 和 Zipkin 协议进行追踪信息的写入。然而，由于 Jaeger 对 Zipkin 的支持已被弃用，建议使用 OTLP。虽然 Jaeger 可以直接支持 OTLP，但在生产环境中，推荐使用 OpenTelemetry Collector 从 Dapr 收集追踪信息并发送到 Jaeger。这样可以让您的应用程序更高效地处理数据，并利用重试、批处理和加密等功能。更多信息请阅读 Open Telemetry Collector [文档](https://opentelemetry.io/docs/collector/#when-to-use-a-collector)。
{{< tabs Self-hosted Kubernetes >}}

{{% codetab %}}
<!-- self-hosted -->
## 在自托管模式下配置 Jaeger

### 本地设置

启动 Jaeger 的最简单方法是运行发布到 DockerHub 的预构建的 all-in-one Jaeger 镜像，并暴露 OTLP 端口：

```bash
docker run -d --name jaeger \
  -p 4317:4317  \
  -p 16686:16686 \
  jaegertracing/all-in-one:1.49
```

接下来，在本地创建以下 `config.yaml` 文件：

> **注意：** 因为您使用 Open Telemetry 协议与 Jaeger 通信，您需要填写追踪配置的 `otel` 部分，并将 `endpointAddress` 设置为 Jaeger 容器的地址。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
  namespace: default
spec:
  tracing:
    samplingRate: "1"
    stdout: true
    otel:
      endpointAddress: "localhost:4317"
      isSecure: false
      protocol: grpc 
```

要启动引用新 YAML 配置文件的应用程序，请使用 `--config` 选项。例如：

```bash
dapr run --app-id myapp --app-port 3000 node app.js --config config.yaml
```

### 查看追踪信息

要在浏览器中查看追踪信息，请访问 `http://localhost:16686` 查看 Jaeger UI。
{{% /codetab %}}

{{% codetab %}}
<!-- kubernetes -->
## 在 Kubernetes 上使用 OpenTelemetry Collector 配置 Jaeger

以下步骤展示了如何配置 Dapr 以将分布式追踪数据发送到 OpenTelemetry Collector，然后将追踪信息发送到 Jaeger。

### 前提条件

- [在 Kubernetes 上安装 Dapr]({{< ref kubernetes >}})
- 使用 Jaeger Kubernetes Operator [设置 Jaeger](https://www.jaegertracing.io/docs/1.49/operator/)

### 设置 OpenTelemetry Collector 推送到 Jaeger

要将追踪信息推送到您的 Jaeger 实例，请在您的 Kubernetes 集群上安装 OpenTelemetry Collector。

1. 下载并检查 [`open-telemetry-collector-jaeger.yaml`](/docs/open-telemetry-collector/open-telemetry-collector-jaeger.yaml) 文件。

1. 在 `otel-collector-conf` ConfigMap 的数据部分，更新 `otlp/jaeger.endpoint` 值以匹配您的 Jaeger collector Kubernetes 服务对象的端点。

1. 将 OpenTelemetry Collector 部署到运行 Dapr 应用程序的相同命名空间中：

   ```sh
   kubectl apply -f open-telemetry-collector-jaeger.yaml
   ```

### 设置 Dapr 发送追踪信息到 OpenTelemetryCollector

创建一个 Dapr 配置文件以启用追踪，并将 sidecar 追踪信息导出到 OpenTelemetry Collector。

1. 使用 [`collector-config-otel.yaml`](/docs/open-telemetry-collector/collector-config-otel.yaml) 文件创建您自己的 Dapr 配置。

1. 更新 `namespace` 和 `otel.endpointAddress` 值以与部署 Dapr 应用程序和 OpenTelemetry Collector 的命名空间对齐。

1. 应用配置：

   ```sh
   kubectl apply -f collector-config.yaml
   ```

### 部署启用追踪的应用程序

通过在您希望启用分布式追踪的应用程序部署中添加 `dapr.io/config` 注释来应用 `tracing` Dapr 配置，如下例所示：

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
          dapr.io/config: "tracing"
  ```

您可以同时注册多个追踪导出器，追踪日志将被转发到所有注册的导出器。

就是这样！无需包含 OpenTelemetry SDK 或对您的应用程序代码进行检测。Dapr 会自动为您处理分布式追踪。

### 查看追踪信息

要查看 Dapr sidecar 追踪信息，请端口转发 Jaeger 服务并打开 UI：

```bash
kubectl port-forward svc/jaeger-query 16686 -n observability
```

在您的浏览器中，访问 `http://localhost:16686`，您将看到 Jaeger UI。

![jaeger](/images/jaeger_ui.png)
{{% /codetab %}}

{{< /tabs >}}
## 参考资料

- [Jaeger 入门](https://www.jaegertracing.io/docs/1.49/getting-started/)
- [Jaeger Kubernetes Operator](https://www.jaegertracing.io/docs/1.49/operator/)
- [OpenTelemetry Collector 导出器](https://opentelemetry.io/docs/collector/configuration/#exporters)
