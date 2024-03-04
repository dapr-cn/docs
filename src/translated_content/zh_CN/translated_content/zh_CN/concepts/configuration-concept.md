---
type: docs
title: "应用和控制平面配置"
linkTitle: "配置"
weight: 400
description: "更改 Dapr 应用程序 sidecar 的行为或 Dapr 控制平面服务的全局行为"
---

Dapr配置是能够更改单个Dapr应用程序的行为及Dapr控制平台系统服务全局行为的设置和策略。 例如，您可以在应用程序 sidecar 配置上设置 ACL 策略，该策略表明可以从其他应用程序调用哪些方法，或者在 Dapr 控制平面配置上，您可以更改部署到应用程序 sidecar 实例的所有证书的证书续订期。

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

此配置为指标记录配置跟踪。 你可以在自托管模式中通过编辑 `.dapr` 目录中名为 `config.yaml` 的配置文件进行加载；或者通过 kubectl/helm 应用到您的 Kubernetes 集群。

下面是在 `dapr-system` 命名空间中称为 daprsystem</code> 的 dapr 控制平面配置 `示例。</p>

<pre><code class="yaml">apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprsystem
  namespace: dapr-system
spec:
  mtls:
    enabled: true
    workloadCertTTL: "24h"
    allowedClockSkew: "15m"
`</pre>

有关配置选项的列表，请访问 [dapr 配置选项概述]({{<ref "configuration-overview.md">}}) 。

{{% alert title="Note" color="primary" %}}
Dapr 应用程序和控制平面配置不应与配置构建块 API 混淆，后者使应用程序能够从配置存储组件中检索键/值数据。 有关详细信息，请阅读[配置构建块]({{< ref configuration-api-overview >}}) 。
{{% /alert %}}
