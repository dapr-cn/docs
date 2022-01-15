---
type: docs
title: "Dapr operator 控制平面服务概述"
linkTitle: "Operator"
description: "Dapr operator 服务概述"
---

当在 [Kubernetes 模式]({{< ref kubernetes >}})运行 Dapr 时，运行 Dapr Operator 服务的 pod 管理[ dapr 组件]({{< ref components >}}) 更新，并为 Dapr 提供 Kubernetes 服务端点。

## 运行Operator服务

Operator服务作为`dapr init -k`或Dapr Helm charts的一部分被部署。 有关在 Kubernetes 上运行 Dapr 的更多信息，请访问 [Kubernetes 托管页面]({{< ref kubernetes >}})。