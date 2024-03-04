---
type: docs
title: "Dapr Sidecar Injector 控制平面服务概述"
linkTitle: "Sidecar injector"
description: "Dapr Sidecar Injector 进程概述"
---

当在 [Kubernetes 模式]({{< ref kubernetes >}}) 下运行 Dapr 时，将会创建一个运行 Dapr Sidecar Injector 服务的 Pod，该服务将会查找使用 [Dapr annotations]({{< ref arguments-annotations-overview.md >}}) 初始化的 pod，然后在该 pod 中为 [daprd 服务]({{< ref sidecar >}})创建另一个容器。

## 运行 sidecar injector

Sidecar injector 服务作为 `dapr init -k` 的一部分部署，或者通过 Dapr Helm chart 部署。 有关在 Kubernetes 上运行 Dapr 的更多信息，请访问 [Kubernetes 托管页面]({{< ref kubernetes >}})。

