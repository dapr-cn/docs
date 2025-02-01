---
type: docs
title: "Dapr Sidecar Injector 控制平面服务概述"
linkTitle: "Sidecar 注入器"
description: "Dapr Sidecar 注入器过程概述"
---

在 [Kubernetes 模式]({{< ref kubernetes >}}) 下运行 Dapr 时，会创建一个运行 Dapr Sidecar Injector 服务的 pod。该服务会识别那些使用 [Dapr 注解]({{< ref arguments-annotations-overview.md >}}) 初始化的 pod，并为这些 pod 中的 [daprd 服务]({{< ref sidecar >}}) 创建额外的容器。

## 运行 Sidecar 注入器

Sidecar 注入器服务可以通过执行 `dapr init -k` 部署，或者通过 Dapr 的 Helm chart 进行部署。有关在 Kubernetes 上运行 Dapr 的更多信息，请访问 [Kubernetes 托管页面]({{< ref kubernetes >}})。
