---
type: docs
title: "Dapr operator 控制平面服务概述"
linkTitle: "Operator"
description: "Dapr operator 服务概述"
---

当在 [Kubernetes 模式]({{< ref kubernetes >}})运行 Dapr 时，运行 Dapr Operator 服务的 pod 负责管理[ dapr 组件]({{< ref components >}})的更新，并为 Dapr 提供 Kubernetes 服务端点。

## Running the operator service

The operator service is deployed as part of `dapr init -k`, or via the Dapr Helm charts. For more information on running Dapr on Kubernetes, visit the [Kubernetes hosting page]({{< ref kubernetes >}}).