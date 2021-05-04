---
type: docs
title: "配置"
linkTitle: "配置"
weight: 400
description: "变更 Dapr sidecars 或全局 Dapr 系统服务的行为"
---

Dapr configurations are settings that enable you to change both the behavior of individual Dapr applications, or the global behavior of the system services in the Dapr control plane.

Configurations are defined and deployed as a YAML file. An application configuration example is like this:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprConfig
  namespace: default
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: "http://localhost:9411/api/v2/spans"
```

This configuration configures tracing for telemetry recording. It can be loaded in self-hosted mode by editing the default configuration file called `config.yaml` file in your `.dapr` directory, or by applying it to your Kubernetes cluster with kubectl/helm.

阅读 [此页面]({{X6X}}) 查看所有配置选项的列表。
