---
type: docs
title: 应用和控制平面配置
linkTitle: Configuration
weight: 400
description: 更改 Dapr 应用程序 sidecar 的行为或 Dapr 控制平面服务的全局行为
---

Dapr 配置是设置和策略，使您能够更改单个 Dapr 应用程序的行为，或 Dapr 控制平面系统服务的全局行为。 例如，您可以在应用程序 sidecar 配置上设置 ACL 策略，该策略表明可以从其他应用程序调用哪些方法，或者在 Dapr 控制平面配置上，您可以更改部署到应用程序 sidecar 实例的所有证书的证书续订期。

配置以 YAML 文件的形式进行定义和部署。 下面显示了一个捕获所有样本追踪信息的应用程序配置示例，它演示了如何设置一个收集度量信息去向的追踪结点。

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

此配置为指标记录配置跟踪。 您可以通过编辑您的 `.dapr` 目录中名为 `config.yaml` 的默认配置文件，将其加载到本地自托管模式中；或者使用 kubectl/helm 将其应用到您的 Kubernetes 集群。

下面是 `dapr-system` 命名空间中名为 `daprsystem` 的 Dapr 控制面板配置的示例。

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

访问[配置选项概述]({{\<ref "configuration-overview\.md">}})获取配置选项的列表。

{{% alert title="注意" color="primary" %}}
Dapr 应用程序和控制平面配置不应与配置构建块 API 混淆，后者使应用程序能够从配置存储组件中检索键/值数据。 阅读[配置构建块]({{< ref configuration-api-overview >}}) 以获取更多信息。
{{% /alert %}}
