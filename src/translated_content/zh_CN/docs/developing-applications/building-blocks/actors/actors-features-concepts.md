---
type: docs
title: "Actor 的运行时特性"
linkTitle: "运行时特性"
weight: 20
description: "了解 Dapr 中 Actor 的特性和概念"
aliases:
  - "/zh-hans/developing-applications/building-blocks/actors/actors-background"
---

在您已经从高层次上了解了 [Actor 构建块]({{< ref "actors-overview.md" >}})之后，让我们深入探讨 Dapr 中 Actor 的特性和概念。

## Actor 的生命周期

Dapr 中的 Actor 是虚拟的，这意味着它们的生命周期与内存中的表示无关。因此，不需要显式地创建或销毁它们。Dapr 的 Actor 运行时会在首次收到某个 Actor ID 的请求时自动激活该 Actor。如果某个 Actor 在一段时间内未被使用，Dapr 的 Actor 运行时会对其进行垃圾回收，但会保留其存在的信息，以便在需要时重新激活。

调用 Actor 方法、定时器和提醒会重置 Actor 的空闲时间。例如，提醒的触发会保持 Actor 的活跃状态。
- Actor 的提醒会在无论其活跃与否的情况下触发。如果提醒触发了一个不活跃的 Actor，它会先激活该 Actor。
- Actor 的定时器触发会重置空闲时间；然而，定时器仅在 Actor 活跃时触发。

Dapr 运行时用于判断 Actor 是否可以被垃圾回收的空闲超时和扫描间隔是可配置的。当 Dapr 运行时调用 Actor 服务以获取支持的 Actor 类型时，可以传递此信息。

这种虚拟 Actor 生命周期的抽象带来了一些注意事项，尽管 Dapr 的 Actor 实现有时会偏离这种模型。

Actor 在首次向其 Actor ID 发送消息时会自动激活（即构建 Actor 对象）。经过一段时间后，Actor 对象会被垃圾回收。将来再次使用该 Actor ID 会导致构建新的 Actor 对象。Actor 的状态超越对象的生命周期，因为状态存储在为 Dapr 运行时配置的状态提供者中。

## 分布和故障转移

为了提供可扩展性和可靠性，Actor 实例分布在整个集群中，Dapr 会根据需要自动将它们从故障节点迁移到健康节点。

Actor 分布在 Actor 服务的实例中，这些实例分布在集群中的节点上。每个服务实例包含给定 Actor 类型的一组 Actor。

### Actor 放置服务

Dapr 的 Actor 运行时通过 Actor `Placement` 服务为您管理分布方案和键范围设置。当创建服务的新实例时：

1. Sidecar 调用 Actor 服务以检索注册的 Actor 类型和配置设置。
1. 相应的 Dapr 运行时注册它可以创建的 Actor 类型。
1. `Placement` 服务计算给定 Actor 类型的所有实例的分区。

每个 Actor 类型的分区数据表在环境中运行的每个 Dapr 实例中更新和存储，并且可以随着 Actor 服务的新实例的创建和销毁而动态变化。

<img src="/images/actors_background_placement_service_registration.png" width=600>

当客户端调用具有特定 ID 的 Actor（例如，Actor ID 123）时，客户端的 Dapr 实例对 Actor 类型和 ID 进行哈希，并使用信息调用可以为该特定 Actor ID 提供请求的相应 Dapr 实例。因此，对于任何给定的 Actor ID，总是调用相同的分区（或服务实例）。这在下图中显示。

<img src="/images/actors_background_id_hashing_calling.png" width=600>

这简化了一些选择，但也带来了一些考虑：

- 默认情况下，Actor 随机放置到 Pod 中，导致均匀分布。
- 由于 Actor 是随机放置的，因此应预期 Actor 操作总是需要网络通信，包括方法调用数据的序列化和反序列化，从而产生延迟和开销。

{{% alert title="注意" color="primary" %}}
注意：Dapr 的 Actor Placement 服务仅用于 Actor 放置，因此如果您的服务不使用 Dapr Actor，则不需要。Placement 服务可以在所有 [托管环境]({{< ref hosting >}}) 中运行，包括 selfhost 和 Kubernetes。
{{% /alert %}}

## Actor 的通信

您可以通过调用 HTTP 端点与 Dapr 交互以调用 Actor 方法。

```bash
POST/GET/PUT/DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/<method/state/timers/reminders>
```

您可以在请求体中为 Actor 方法提供任何数据，请求的响应将在响应体中，这是来自 Actor 调用的数据。

另一种可能更方便的与 Actor 交互的方式是通过 SDK。Dapr 目前支持 [.NET]({{< ref "dotnet-actors" >}})、[Java]({{< ref "java#actors" >}}) 和 [Python]({{< ref "python-actor" >}}) 的 Actor SDK。

有关更多详细信息，请参阅 [Dapr Actor 特性]({{< ref howto-actors.md >}})。

### 并发

Dapr 的 Actor 运行时为访问 Actor 方法提供了简单的轮转访问模型。这意味着在任何时候，Actor 对象的代码中最多只能有一个线程处于活动状态。轮转访问极大地简化了并发系统，因为不需要同步机制来进行数据访问。这也意味着系统必须针对每个 Actor 实例的单线程访问特性进行特殊设计。

单个 Actor 实例不能同时处理多个请求。如果期望 Actor 实例处理并发请求，它可能会导致吞吐量瓶颈。

如果在两个 Actor 之间存在循环请求，同时对其中一个 Actor 发出外部请求，Actor 可能会相互死锁。Dapr 的 Actor 运行时会自动在 Actor 调用上超时，并向调用者抛出异常以中断可能的死锁情况。

<img src="/images/actors_background_communication.png" width=600>

#### 重入

要允许 Actor "重入" 并调用自身的方法，请参阅 [Actor 重入]({{<ref actor-reentrancy.md>}})。

### 轮转访问

轮转包括响应其他 Actor 或客户端请求的 Actor 方法的完整执行，或定时器/提醒回调的完整执行。即使这些方法和回调是异步的，Dapr 的 Actor 运行时也不会交错它们。一个轮转必须完全完成后，才允许新的轮转。换句话说，当前正在执行的 Actor 方法或定时器/提醒回调必须完全完成后，才允许对方法或回调的新调用。方法或回调被认为已完成，如果执行已从方法或回调返回，并且方法或回调返回的任务已完成。值得强调的是，即使在不同的方法、定时器和回调之间，也要尊重轮转并发性。

Dapr 的 Actor 运行时通过在轮转开始时获取每个 Actor 锁，并在轮转结束时释放锁来强制执行轮转并发性。因此，轮转并发性是在每个 Actor 的基础上强制执行的，而不是跨 Actor。Actor 方法和定时器/提醒回调可以代表不同的 Actor 同时执行。

以下示例说明了上述概念。考虑一个实现了两个异步方法（例如，Method1 和 Method2）、一个定时器和一个提醒的 Actor 类型。下图显示了代表属于此 Actor 类型的两个 Actor（ActorId1 和 ActorId2）的方法和回调执行时间线的示例。

<img src="/images/actors_background_concurrency.png" width=600>

## 下一步

{{< button text="定时器和提醒 >>" page="actors-timers-reminders.md" >}}

## 相关链接

- [Actor API 参考]({{< ref actors_api.md >}})
- [Actor 概述]({{< ref actors-overview.md >}})
- [如何：在 Dapr 中使用虚拟 Actor]({{< ref howto-actors.md >}})
