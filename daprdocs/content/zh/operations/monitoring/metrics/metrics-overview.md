---
type: docs
title: "指标"
linkTitle: "Metrics"
weight: 4000
description: "观察 dapr 指标"
---

Dapr 公开了一个 [Prometheus](https://prometheus.io/) 指标终结点，您可以扫描该终结点，以更深入地了解 Dapr 的行为方式，针对特定条件设置警报。

## 配置

默认情况下，指标终结点处于启用状态，您可以通过命令行参数 `--enable-metrics=false` 传递给 Dapr 系统进程来禁用它。

默认指标端口为 `9090`。 This can be overridden by passing the command line argument `--metrics-port` to Daprd.

要禁用 Dapr 边车中的指标，您可以使用 `metric` 规范配置并启用设置 `enabled: false` 以禁用 Dapr 运行时中的指标。

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

## 指标

默认情况下，每个 Dapr 系统进程都会发出 Go 运行时/进程指标，并有自己的指标：

- [Dapr metric list](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md)

## 参考文档

* [如何：在本地运行Prometheus]({{< ref prometheus.md >}})
* [如何：设置 Prometheus 和 Grafana 以获取指标]({{< ref grafana.md >}})
* [如何: 设置 Azure 监视器以搜索日志并收集 Dapr 的指标]({{< ref azure-monitor.md >}})
