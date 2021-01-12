---
type: docs
title: "指标"
linkTitle: "Metrics"
weight: 4000
description: "观察 dapr 指标"
---

Dapr 公开了一个 [Prometheus](https://prometheus.io/) 指标终结点，您可以扫描该终结点，以更深入地了解 Dapr 的行为方式，针对特定条件设置警报。

## 配置

默认情况下，指标终结点处于启用状态，您可以通过命令行参数 `--enable-metrics=false` 来使 Dapr 系统进程来禁用它。

The default metrics port is `9090`. This can be overridden by passing the command line argument `--metrics-port` to Daprd.

To disable the metrics in the Dapr side car, you can use the `metric` spec configuration and set `enabled: false` to disable the metrics in the Dapr runtime.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
  namespace: default
spec:
  tracing:
    samplingRate: "1"
  metric:
    enabled: false
```

## Metrics

Each Dapr system process emits Go runtime/process metrics by default and have their own metrics:

- [Dapr metric list](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md)

## References

* [Howto: Run Prometheus locally]({{< ref prometheus.md >}})
* [Howto: Set up Prometheus and Grafana for metrics]({{< ref grafana.md >}})
* [Howto: Set up Azure monitor to search logs and collect metrics for Dapr]({{< ref azure-monitor.md >}})
