---
type: docs
title: "度量"
linkTitle: "度量"
weight: 4000
description: "Observing Dapr metrics"
---

Dapr 公开了一个 [Prometheus](https://prometheus.io/) 指标终结点，您可以扫描该终结点，以更深入地了解 Dapr 的行为方式，针对特定条件设置警报。

## Configuration (配置)

默认情况下，指标终结点处于启用状态，您可以通过命令行参数 `--enable-metrics=false` 传递给 Dapr 系统进程来禁用它。

默认指标端口为 `9090`。 This can be overridden by passing the command line argument `--metrics-port` to Daprd.

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

## 度量

默认情况下，每个 Dapr 系统进程都会发出 Go 运行时/进程指标，并有自己的指标：

- [Dapr metric list](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md)

## 参考资料

* [如何：在本地运行Prometheus]({{< ref prometheus.md >}})
* [如何：设置 Prometheus 和 Grafana 以获取指标]({{< ref grafana.md >}})
* [如何: 设置 Azure 监视器以搜索日志并收集 Dapr 的指标]({{< ref azure-monitor.md >}})
