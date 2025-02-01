---
type: docs
title: "弹性"
linkTitle: "弹性"
weight: 400
description: "配置策略并监控应用和sidecar的健康状况"
---

分布式应用程序通常由许多微服务组成，这些微服务在底层基础设施上可以扩展到数十个甚至数百个实例。随着这些分布式解决方案的规模和复杂性增加，系统故障的可能性也随之增加。服务实例可能由于硬件故障、意外的吞吐量或应用程序生命周期事件（如扩展和重启）等多种问题而失败或无响应。因此，设计和实施能够检测、缓解和响应故障的自愈解决方案至关重要。

## 弹性策略
<img src="/images/resiliency_diagram.png" width="1200" alt="显示应用于Dapr API的弹性的图表">

Dapr允许您为应用程序定义和应用容错的弹性策略。您可以为以下弹性模式设定策略：

- 超时
- 重试/退避
- 断路器

这些策略可以在调用具有[弹性规范]({{< ref resiliency-overview >}})的组件时应用于任何Dapr API调用。

## 应用健康检查
<img src="/images/observability-app-health.webp" width="800" alt="显示应用健康功能的图表。启用应用健康运行Dapr会导致Dapr定期探测应用的健康状况">

应用程序可能由于多种原因变得无响应，例如过于繁忙无法接受新任务、崩溃或死锁。有时这些问题可能是暂时的，也可能是持久的。

Dapr提供了一种通过探测来检查应用程序健康状况并对状态变化做出反应的机制。当检测到应用不健康时，Dapr会停止为该应用分配新任务。

阅读更多关于如何将[应用健康检查]({{< ref app-health >}})应用于您的应用程序。

## Sidecar健康检查
<img src="/images/sidecar-health.png" width="800" alt="显示应用健康功能的图表。启用应用健康运行Dapr会导致Dapr定期探测应用的健康状况">

Dapr提供了一种通过[HTTP `/healthz` 端点]({{< ref health_api.md >}})来确定其健康状况的方法。通过此端点，*daprd*进程或sidecar可以：

- 检查其健康状况
- 确定其准备就绪状态和存活状态

阅读更多关于如何将[dapr健康检查]({{< ref sidecar-health >}})应用于您的应用程序。

## 下一步

- [了解更多关于弹性]({{< ref resiliency-overview.md >}})
- 尝试其中一个弹性快速入门：
  - [弹性：服务到服务]({{< ref resiliency-serviceinvo-quickstart.md >}})
  - [弹性：状态管理]({{< ref resiliency-state-quickstart.md >}})