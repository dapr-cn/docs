---
type: docs
title: "度量"
linkTitle: "度量"
weight: 4000
description: "Observing Dapr metrics in Kubernetes"
---

Dapr 公开了一个 [Prometheus](https://prometheus.io/) 指标终结点，您可以扫描该终结点，以更深入地了解 Dapr 的行为方式，针对特定条件设置警报。

## Configuration (配置)

默认情况下，指标终结点处于启用状态，您可以通过命令行参数 `--enable-metrics=false` 传递给 Dapr 系统进程来禁用它。

默认指标端口为 `9090`。 This can be overridden by passing the command line argument `--metrics-port` to Daprd. Additionally, the metrics exporter can be disabled for a specific application by setting the `dapr.io/enable-metrics: "false"` annotation to your application deployment. With the metrics exporter disabled, `daprd` will not open the metrics listening port.

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

To disable the metrics collection in the Dapr side cars running in a specific namespace, you can use the `metric` spec configuration and set `enabled: false` to disable the metrics in the Dapr runtime.

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
    enabled: true
```

## 度量

默认情况下，每个 Dapr 系统进程都会发出 Go 运行时/进程指标，并有自己的指标：

- [Dapr metric list](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md)

## 参考资料

* [如何：在本地运行Prometheus]({{< ref prometheus.md >}})
* [如何：设置 Prometheus 和 Grafana 以获取指标]({{< ref grafana.md >}})
* [如何: 设置 Azure 监视器以搜索日志并收集 Dapr 的指标]({{< ref azure-monitor.md >}})
