---
type: docs
title: "配置 Dapr 以发送分布式追踪数据"
linkTitle: "Configure tracing"
weight: 100
description: "配置 Dapr 以发送分布式追踪数据"
---

It is recommended to run Dapr with tracing enabled for any production scenario.  You can configure Dapr to send tracing and telemetry data to many observability tools based on your environment, whether it is running in the cloud or on-premises.

## Configuration

`Configuration` sepc下的 `tracing` 部分包含以下属性：

```yml
spec:
  tracing:
    samplingRate: "1"
    otel: 
      endpointAddress: "https://..."
    zipkin:
      endpointAddress: "https://..."

```

下面的表格给出了调用链追踪功能可配置的属性：

| Property                 | 数据类型   | 说明                                                                                             |
| ------------------------ | ------ | ---------------------------------------------------------------------------------------------- |
| `samplingRate`           | string | Set sampling rate for tracing to be enabled or disabled.                                       |
| `标准输出`                   | bool   | True write more verbose information to the traces                                              |
| `otel.endpointAddress`   | string | Set the Open Telemetry (OTEL) server address.                                                  |
| `otel.isSecure`          | bool   | Is the connection to the endpoint address encryped.                                            |
| `otel.protocol`          | string | Set to `http` or `grpc` protocol.                                                              |
| `zipkin.endpointAddress` | string | Set the Zipkin server address. If this is used, you do not need to specify the `otel` section. |

To enable tracing, use a configuration file (in self hosted mode) or a Kubernetes configuration object (in Kubernetes mode). For example, the following configuration object changes the sample rate to 1 (every span is sampled), and sends trace using OTEL protocol to the OTEL server at localhost:4317

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

## Sampling rate

Dapr uses probabilistic sampling. The sample rate defines the probability a tracing span will be sampled and can have a value between 0 and 1 (inclusive). The default sample rate is 0.0001 (i.e. 1 in 10,000 spans is sampled).

Changing `samplingRate` to 0 disables tracing altogether.
