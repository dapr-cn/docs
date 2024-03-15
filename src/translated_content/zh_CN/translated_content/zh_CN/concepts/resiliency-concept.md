---
type: docs
title: 弹性
linkTitle: 弹性
weight: 400
description: 配置策略并监控应用程序和 sidecar 的健康状况
---

分布式应用通常由许多微服务组成，在底层基础设施上扩展数十个（有时是数百个）实例。 随着这些分布式解决方案的规模和复杂性不断增加，系统发生故障的可能性也不可避免地增加。 由于硬件故障、意外吞吐量或应用程序生命周期事件（如扩展和应用程序重启）等各种原因，服务实例可能会出现故障或无响应。 设计和实施具有检测、缓解和应对故障能力的自愈解决方案至关重要。

## 复原力政策

<img src="/images/resiliency_diagram.png" width="1200" alt="Diagram showing the resiliency applied to Dapr APIs">

Dapr 提供了为应用程序定义和应用容错弹性策略的功能。 您可以为以下复原模式定义策略：

- 超时
- 重试/取消
- 断路器

在调用具有[resiliency spec]({{< ref resiliency-overview >}})}的组件时，这些策略可应用于任何Dapr API调用。

## 应用程序健康检查

<img src="/images/observability-app-health.webp" width="800" alt="Diagram showing the app health feature. Running Dapr with app health enabled causes Dapr to periodically probe the app for its health">

应用程序无法响应的原因有很多。 例如，它们太忙，无法接受新工作，可能已经崩溃，或处于死锁状态。 有时这种情况可能是暂时的或持续的。

Dapr 可通过探针监控应用程序的健康状况，探针可检查应用程序的健康状况并对状态变化做出反应。 检测到不健康的应用程序时，Dapr 会停止代表该应用程序接受新工作。

了解更多有关如何将[应用程序健康检查]({{< ref app-health >}})应用于您的应用程序。

## Sidecar 健康检查

<img src="/images/sidecar-health.png" width="800" alt="Diagram showing the app health feature. Running Dapr with app health enabled causes Dapr to periodically probe the app for its health">

Dapr提供了一种使用[HTTP `/healthz`端点]({{< ref health_api.md >}})来确定其健康状况的方法。 有了这个端点，_daprd_ 进程或者 sidecar 就可以：

- 检测其健康状况
- 确定是否准备就绪和有效

了解更多有关如何将[dapr健康检查]({{< ref sidecar-health >}}) 应用于您的应用程序的信息。

## 下一步

- [了解更多关于弹性的信息]({{< ref resiliency-overview\.md >}})
- 试一试复原力快速入门课程：
  - [弹性：服务到服务]({{< ref resiliency-serviceinvo-quickstart.md >}})
  - [状态管理：[State management\*\*]({{< ref "resiliency-state-quickstart.md" >}})]({{< ref resiliency-state-quickstart.md >}})
