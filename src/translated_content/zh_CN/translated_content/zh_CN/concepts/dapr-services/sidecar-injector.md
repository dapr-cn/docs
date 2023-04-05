---
type: docs
title: "Dapr Sidecar Injector 控制平面服务概述"
linkTitle: "Sidecar injector"
description: "Dapr Sidecar Injector 进程概述"
---

When running Dapr in [Kubernetes mode]({{< ref kubernetes >}}), a pod is created running the Dapr Sidecar Injector service, which looks for pods initialized with the [Dapr annotations]({{< ref arguments-annotations-overview.md >}}), and then creates another container in that pod for the [daprd service]({{< ref sidecar >}})

## 运行 sidecar injector

Sidecar injector 服务作为 `dapr init -k` 的一部分部署，或者通过 Dapr Helm chart 部署。 有关在 Kubernetes 上运行 Dapr 的更多信息，请访问 [Kubernetes 托管页面]({{< ref kubernetes >}})。

