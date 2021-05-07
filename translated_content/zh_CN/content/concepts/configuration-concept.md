---
type: docs
title: "配置"
linkTitle: "配置"
weight: 400
description: "变更 Dapr sidecars 或全局 Dapr 系统服务的行为"
---

Dapr configurations are settings that enable you to change both the behavior of individual Dapr applications, or the global behavior of the system services in the Dapr control plane.

配置定义和部署形式为 YAML 文件。 一个应用程序配置示例就像这样：

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

这个配置文件配置了遥测录制跟踪。 你可以在自托管模式中通过编辑 `.dapr` 目录中名为 `config.yaml` 的配置文件进行加载；或者通过 kubectl/helm 应用到您的 Kubernetes 集群。

阅读 [此页面]({{X6X}}) 查看所有配置选项的列表。
