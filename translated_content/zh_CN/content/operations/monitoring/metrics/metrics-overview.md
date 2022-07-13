---
type: docs
title: "度量"
linkTitle: "度量"
weight: 4000
description: "Observing Dapr metrics in Kubernetes"
---

Dapr exposes a [Prometheus](https://prometheus.io/) metrics endpoint that you can scrape to:

- Gain a greater understanding of how Dapr is behaving.
- Set up alerts for specific conditions.

## Configuration (配置)

The metrics endpoint is enabled by default. You can disable it by passing the command line argument `--enable-metrics=false` to Dapr system processes.

默认指标端口为 `9090`。 You can override this by passing the command line argument `--metrics-port` to Daprd.

You can also disable the metrics exporter for a specific application by setting the `dapr.io/enable-metrics: "false"` annotation to your application deployment. With the metrics exporter disabled, `daprd` will not open the metrics listening port.

The follow example shows metrics are explicitly enabled with the port specified as "9090".

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodeapp
  labels:
    app: node
spec:
  replicas: 1
  selector:
    matchLabels:
      app: node
  template:
    metadata:
      labels:
        app: node
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "nodeapp"
        dapr.io/app-port: "3000"
        dapr.io/enable-metrics: "true"
        dapr.io/metrics-port: "9090"
    spec:
      containers:
      - name: node
        image: dapriosamples/hello-k8s-node:latest
        ports:
        - containerPort: 3000
        imagePullPolicy: Always
```

To disable the metrics collection in the Dapr side cars running in a specific namespace:

- Use the `metrics` spec configuration.
- Set `enabled: false` to disable the metrics in the Dapr runtime.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
  namespace: default
spec:
  tracing:
    samplingRate: "1"
  metrics:
    enabled: false
```

## 度量

By default, each Dapr system process emits Go runtime/process metrics and have their own metrics:

- [Dapr metric list](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md)

## 参考资料

* [如何：在本地运行Prometheus]({{< ref prometheus.md >}})
* [如何：设置 Prometheus 和 Grafana 以获取指标]({{< ref grafana.md >}})
* [如何: 设置 Azure 监视器以搜索日志并收集 Dapr 的指标]({{< ref azure-monitor.md >}})
