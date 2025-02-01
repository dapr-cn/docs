---
type: docs
title: "配置 Dapr 发送分布式追踪数据"
linkTitle: "配置追踪"
weight: 30
description: "设置 Dapr 发送分布式追踪数据"
---

{{% alert title="注意" color="primary" %}}
建议在任何生产环境中启用 Dapr 的追踪功能。您可以根据运行环境配置 Dapr，将追踪和遥测数据发送到多种可观测性工具，无论是在云端还是本地。
{{% /alert %}}

## 配置

在 `Configuration` 规范中的 `tracing` 部分包含以下属性：

```yml
spec:
  tracing:
    samplingRate: "1"
    otel: 
      endpointAddress: "myendpoint.cluster.local:4317"
    zipkin:
      endpointAddress: "https://..."
```

下表列出了追踪的属性：

| 属性                | 类型   | 描述 |
|---------------------|--------|------|
| `samplingRate`      | string | 设置追踪的采样率来启用或禁用追踪。 |
| `stdout`            | bool   | 如果为真，则会将更详细的信息写入追踪。 |
| `otel.endpointAddress` | string | 设置 Open Telemetry (OTEL) 目标主机名和可选端口。如果使用此项，则无需指定 'zipkin' 部分。 |
| `otel.isSecure`     | bool   | 指定连接到端点地址的连接是否加密。 |
| `otel.protocol`     | string | 设置为 `http` 或 `grpc` 协议。 |
| `zipkin.endpointAddress` | string | 设置 Zipkin 服务器 URL。如果使用此项，则无需指定 `otel` 部分。 |

要启用追踪，请使用配置文件（在 selfhost 模式下）或 Kubernetes 配置对象（在 Kubernetes 模式下）。例如，以下配置对象将采样率设置为 1（每个 span 都被采样），并使用 OTEL 协议将追踪发送到本地的 OTEL 服务器 localhost:4317。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
spec:
  tracing:
    samplingRate: "1"
    otel:
      endpointAddress: "localhost:4317"
      isSecure: false
      protocol: grpc 
```

## 采样率

Dapr 使用概率采样。采样率定义了追踪 span 被采样的概率，值可以在 0 到 1 之间（包括 0 和 1）。默认采样率为 0.0001（即每 10,000 个 span 中采样 1 个）。

将 `samplingRate` 设置为 0 将完全禁用追踪。

## 环境变量

OpenTelemetry (otel) 端点也可以通过环境变量进行配置。设置 OTEL_EXPORTER_OTLP_ENDPOINT 环境变量将为 sidecar 启用追踪。

| 环境变量                     | 描述 |
|------------------------------|------|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | 设置 Open Telemetry (OTEL) 服务器主机名和可选端口，启用追踪 |
| `OTEL_EXPORTER_OTLP_INSECURE` | 将连接设置为未加密（true/false） |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | 传输协议（`grpc`、`http/protobuf`、`http/json`） |

## 下一步

了解如何使用以下工具之一设置追踪：
- [OTEL Collector]({{< ref otel-collector >}})
- [New Relic]({{< ref newrelic.md >}})
- [Jaeger]({{< ref open-telemetry-collector-jaeger.md >}})
- [Zipkin]({{< ref zipkin.md >}})
- [Datadog]({{< ref datadog.md >}})
