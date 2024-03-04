---
type: docs
title: "Actor 运行功能"
linkTitle: "运行时功能"
weight: 20
description: "进一步了解 Dapr 中 Actors 的功能和概念"
aliases:
  - "/zh-hans/developing-applications/building-blocks/actors/actors-background"
---

现在，您已经从高层了解了 [actor构建模块]({{< ref "actors-overview.md" >}}) ，让我们深入探讨 Dapr 中 Actors 的功能和概念。

## Actor 生命周期

Dapr Actors 是虚拟的，意思是他们的生命周期与他们的 in - memory 表现不相关。 因此，它们不需要显式创建或销毁。 Dapr Actors 运行时在第一次接收到该 actor ID 的请求时自动激活 actor。 如果 actor 在一段时间内未被使用，那么 Dapr Actor 运行时将回收内存对象。 如果以后需要重新激活，它还将保持对 actor 的一切原有数据。

调用 actor 方法和 reminder 将重置空闲时间，例如，reminder 触发将使 actor 保持活动状态。 不论 actor 是否处于活动状态或非活动状态 Actor reminders 都会触发，对于非活动状态的 actor 会先进行激活。 Actor timers 不会重置空闲时间，因此 timer 触发不会使 actor 保持活动状态。 Timer 仅在 actor 活跃时被触发。

空闲超时和扫描间隔是可配置的，Dapr 运行时使用它们来查看 actor 是否可以垃圾回收。 当 Dapr 运行时调用 actor 服务以获取受支持的 actor 类型时，这些信息可以被传递。

由于虚拟 actor 模型的原因，虚拟 actor 生命周期抽象带有一些注意事项，而事实上，Dapr actor 的实现有时会偏离这个模型。

Actor 在第一次有消息发送到它的 actor ID 时就会被自动激活（导致 actor 对象被构建）。 经过一段时间后，actor 对象将被垃圾回收。 在未来，再次使用 actor ID，将导致构建新的 actor 对象。 Actor 的状态比对象的生命周期更久，因为状态存储在 Dapr 运行时的配置状态提供程序中（也就是说 actor 即使不在活跃状态，仍然可以读取它的状态）。

## 分发和故障转移

为了提供可扩展性和可靠性，Actor 实例分布在整个集群中，而 Dapr 会根据需要自动将其从失败的节点迁移到健康的节点。

Actor 分布在 actor 服务的实例中，并且这些实例分布在集群中的节点上。 每个服务实例都包含给定 Actor 类型的一组 Actor。

### Actor Placement 服务

Dapr actor 运行时通过 actor `Placement` 服务为您管理分发方案和j键范围设置。 创建服务的新实例时：

1. Sidecar 调用 actor 服务，检索已注册的 actor 类型和配置设置。
1. 相应的 Dapr 运行时会注册它可以创建的 actor 类型。
1. `Placement` 服务为给定的 actor 类型计算所有实例的分区。

每个 actor 类型的分区数据表都会更新并存储在环境中运行的每个 Dapr 实例中，并随着新 actor 服务实例的创建和销毁而动态变化。

<img src="/images/actors_background_placement_service_registration.png" width=600>

当客户端调用具有特定 Id（例如，执行组件 Id 123）的 actor 时，客户端的 Dapr 实例会对 actor 类型和 id 进行哈希，并使用该信息调用相应的 Dapr 实例，该实例可以为该特定 actor id 的请求提供服务。 因此，对于任何给定的 actor id ，始终会调用相同的分区（或服务实例）。 如下图所示。

<img src="/images/actors_background_id_hashing_calling.png" width=600>

这简化了一些选择，但也需要考虑一些因素：

- 默认情况下，actor 被随机放置在 pod 中，从而实现均匀分布。
- 由于 actor 是随机放置的，因此可以预期 actor 操作始终需要网络通信，包括方法调用数据的序列化和反序列化，从而导致延迟和开销。

{{% alert title="Note" color="primary" %}}
 注: Dapr actor Placement 服务仅用于 actor 安置，因此，如果您的服务未使用 Dapr Actors，那么不需要。 Placement 服务可以运行在[托管环境]({{< ref hosting >}})，包括自托管和 Kubernetes。
{{% /alert %}}

## Actor 通信

你可以通过调用 HTTP/gRPC 端点与 Dapr 互动来调用 actor 方法。

```bash
POST/GET/PUT/DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/<method/state/timers/reminders>
```

您可以在请求正文中为 actor 方法提供任何数据，并且请求的响应将位于响应正文中，该响应正文是来自 actor 调用的数据。

另外，也许与 Actor 交互的另一种更方便的方式是通过 SDK。 Dapr 目前在 [.NET]({{< ref "dotnet-actors" >}}), [Java]({{< ref "java#actors" >}}) 和 [Python]({{< ref "python-actor" >}}) 中支持 actors SDK。

详情请参阅 [Dapr Actor Features]({{< ref howto-actors.md >}})。

### 并发

Dapr Actor 运行时提供了一个简单的基于回合的访问模型，用于访问 Actor 方法。 这意味着在任何时候，在 actor 对象的代码中不能有多个线程处于活动状态。 基于回合的访问大大简化了并发系统，因为同步数据不需要访问机制。 这也意味着在设计系统时必须特别考虑每个 actor 实例的单线程访问特性。

单个 actor 实例不能一次处理多个请求。 如果 actor 实例需要处理并发请求，则可能会导致吞吐量瓶颈。

如果两个 Actor 之间存在循环请求，而同时向其中一个 Actor 发出外部请求，那么 Actor 可以相互死锁。 Dapr actor 运行时在 actor 调用时自动超时，并向调用方引发异常以中断可能的死锁情况。

<img src="/images/actors_background_communication.png" width=600>

#### 可重入性

要允许 Actors "可重入 "并调用自身的方法，请参阅 [Actor Reentrancy]({{<ref actor-reentrancy.md>}})。

### 基于回合的访问

回合包括完全执行 actor 方法以响应来自其他 actor 或客户端的请求，或者完全执行 timer/reminders 回调。 即使这些方法和回调是异步的，Dapr actor 运行时也不会交错它们。 在允许新回合之前，必须完全结束之前的回合。 换句话说，在允许对方法或回调进行新调用之前，必须完全完成当前正在执行的 actor 方法或 timer/reminders 回调。 如果执行从方法或回调返回结果，并且方法或回调返回的任务已完成，则方法或回调将被视为已完成。 值得强调的是，即使在不同方法、timer 和回调中，基于回合的并发也一样起作用。

Dapr Actor 运行时通过在回合开始时获取每个 actor 的锁并在回合结束时释放锁来实现基于回合的调用。 因此，基于回合的并发是按每个 actor 强制执行的，而不是跨 Actor 执行的。 Actor 方法和 timer/reminders 回调可以代表不同的 Actor 同时执行。

下面的示例演示了上述概念。 考虑一个实现两个异步方法（例如，Method1 和 Method2）、一个计时器和一个提醒的 actor 类型。 下图显示了执行这些方法的时间线的示例，并代表属于此 Actor 类型的两个 Actor ( ActorId1 和 ActorId2) 的回调。

<img src="/images/actors_background_concurrency.png" width=600>

## 下一步

{{< button text="Timers and reminders >>" page="actors-timers-reminders.md" >}}

## 相关链接

- [Actors API 参考]({{< ref actors_api.md >}})
- [Actor 概述]({{< ref actors-overview.md >}})
- [How-to: 在 Dapr 中使用 virtual actors]({{< ref howto-actors.md >}})