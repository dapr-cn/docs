---
type: docs
title: "应用和控制平面配置"
linkTitle: "配置"
weight: 400
description: "调整 Dapr 应用程序的 sidecar 或 Dapr 控制平面系统服务的全局行为"
---

通过 Dapr 配置，您可以通过设置和策略来更改：
- 单个 Dapr 应用程序的行为
- Dapr 控制平面系统服务的全局行为

例如，您可以在应用程序的 sidecar 配置中设置采样率策略，以指定哪些方法可以被其他应用程序调用。如果您在 Dapr 控制平面配置中设置策略，您可以调整部署到应用程序 sidecar 实例的所有证书的更新周期。

配置以 YAML 文件的形式定义并部署。以下是一个应用程序配置示例，其中设置了一个跟踪端点，用于发送指标信息，并捕获所有的跟踪样本。

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

上述 YAML 配置用于记录指标的跟踪。您可以通过以下方式在本地自托管模式中加载它：
- 编辑 `.dapr` 目录中的默认配置文件 `config.yaml`，或
- 使用 `kubectl/helm` 将其应用到您的 Kubernetes 集群。

以下示例展示了在 `dapr-system` 命名空间中名为 `daprsystem` 的 Dapr 控制平面配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprsystem
  namespace: dapr-system
spec:
  mtls:
    enabled: true
    workloadCertTTL: "24h"
    allowedClockSkew: "15m"
```

默认情况下，安装 Dapr 控制平面系统服务时会有一个名为 `daprsystem` 的单一配置文件。此配置文件应用全局控制平面设置，并在 Dapr 部署到 Kubernetes 时设置。

[了解更多关于配置选项的信息。]({{< ref "configuration-overview.md" >}})

{{% alert title="重要" color="warning" %}}
Dapr 应用程序和控制平面配置不应与 [配置构建块 API]({{< ref configuration-api-overview >}}) 混淆，后者使应用程序能够从配置存储组件中检索键/值数据。
{{% /alert %}}

## 下一步

{{< button text="了解更多关于配置的信息" page="configuration-overview" >}}