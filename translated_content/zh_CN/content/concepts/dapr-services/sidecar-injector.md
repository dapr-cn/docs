---
type: docs
title: "Dapr Sidecar Injector 控制平面服务概述"
linkTitle: "Sidecar injector"
description: "Overview of the Dapr sidecar injector process"
---

当在 [Kubernetes 模式]({{< ref kubernetes >}}) 下运行 Dapr 时，将会创建一个运行 Dapr Sidecar Injector 服务的 Pod，该服务将会查找使用 [Dapr annotations]({{< ref arguments-annotations-overview.md >}}) 初始化的 pod，然后在该 pod 中为 [daprd 服务]({{< ref sidecar >}})创建另一个容器。

## Running the sidecar injector

The sidecar injector service is deployed as part of `dapr init -k`, or via the Dapr Helm charts. For more information on running Dapr on Kubernetes, visit the [Kubernetes hosting page]({{< ref kubernetes >}}).

