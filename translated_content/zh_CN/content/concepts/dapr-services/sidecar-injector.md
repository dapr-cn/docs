---
type: docs
title: "Dapr Sidecar Injector 控制平面服务概述"
linkTitle: "Sidecar injector"
description: "Dapr Sidecar Injector 过程概述"
---

当在 [Kubernetes 模式]({{< ref kubernetes >}}) 运行Dapr时，将会创建一个运行 Dapr Sidecar Injector 服务的Pod，他将会寻找通过 [Dapr annotations]({{< ref arguments-annotations-overview.md >}}) 初始化的pods，然后在该 pod 中为 [daprd service]({{< ref sidecar >}}) 创建另一个容器。

## 运行 sidecar injector

Sidecar injector服务作为`dapr init -k`或Dapr Helm charts的一部分被部署。 有关在 Kubernetes 上运行 Dapr 的更多信息，请访问 [Kubernetes 托管页面]({{< ref kubernetes >}})。

