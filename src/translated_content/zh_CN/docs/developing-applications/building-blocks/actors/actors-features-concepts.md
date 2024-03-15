---
type: docs
title: Actor 运行功能
linkTitle: 运行时功能
weight: 20
description: 进一步了解 Dapr 中 Actors 的功能和概念
aliases:
  - /zh-hans/developing-applications/building-blocks/actors/actors-background
---

现在，您已经在高级别上了解了 [actor构建块]({{< ref "actors-overview.md" >}}) ，让我们深入探讨Dapr中包含的actor的特性和概念。

## Actor 生命周期

Dapr Actors 是虚拟的，意思是他们的生命周期与他们的 in - memory 表现不相关。 因此，它们不需要显式创建或销毁。 Dapr Actors 运行时在第一次接收到该 actor ID 的请求时自动激活 actor。 如果 actor 在一段时间内未被使用，那么 Dapr Actor 运行时将回收内存对象。 如果以后需要重新激活，它还将保持对 actor 的一切原有数据。

调用actor方法、定时器和提醒会重置actor的空闲时间。 例如，一个提醒触发会保持actor处于活动状态。

- 提醒器无论 actor 是活动的还是非活动的都会触发。 如果为非活动 actor 触发，它会首先激活该 actor。
- Actor 计时器触发会重置空闲时间；然而，计时器只会在 actor 处于活动状态时触发。

空闲超时和扫描间隔是可配置的，Dapr 运行时使用它们来查看 actor 是否可以垃圾回收。 当 Dapr 运行时调用 actor 服务以获取受支持的 actor 类型时，这些信息可以被传递。

由于虚拟 actor 模型的原因，虚拟 actor 生命周期抽象带有一些注意事项，而事实上，Dapr actor 的实现有时会偏离这个模型。

Actor 在第一次有消息发送到它的 actor ID 时就会被自动激活（导致 actor 对象被构建）。 经过一段时间后，actor 对象将被垃圾回收。 在未来，再次使用 actor ID，将导致构建新的 actor 对象。 Actor 的状态比对象的生命周期更久，因为状态存储在 Dapr 运行时的配置状态提供程序中（也就是说 actor 即使不在活跃状态，仍然可以读取它的状态）。

## 分发和故障转移

为了提供可扩展性和可靠性，Actor 实例分布在整个集群中，而 Dapr 会根据需要自动将其从失败的节点迁移到健康的节点。

Actor 分布在 actor 服务的实例中，并且这些实例分布在集群中的节点上。 每个服务实例都包含给定 Actor 类型的一组 Actor。

### Actor Placement 服务

Dapr actor运行时通过actor `Placement`服务为您管理分发方案和键范围设置。 创建服务的新实例时：

1. Sidecar 调用 actor 服务，检索已注册的 actor 类型和配置设置。
2. 相应的 Dapr 运行时会注册它可以创建的 actor 类型。
3. `Placement` 服务为给定的 actor 类型计算所有实例的分区。

每个 actor 类型的分区数据表都会更新并存储在环境中运行的每个 Dapr 实例中，并随着新 actor 服务实例的创建和销毁而动态变化。

<img src="/images/actors_background_placement_service_registration.png" width=600>

当客户端调用具有特定 Id（例如，执行组件 Id 123）的 actor 时，客户端的 Dapr 实例会对 actor 类型和 id 进行哈希，并使用该信息调用相应的 Dapr 实例，该实例可以为该特定 actor id 的请求提供服务。 因此，对于任何给定的 actor id ，始终会调用相同的分区（或服务实例）。 如下图所示。

<img src="/images/actors_background_id_hashing_calling.png" width=600>

这简化了一些选择，但也需要考虑一些因素：

- 默认情况下，actor 被随机放置在 pod 中，从而实现均匀分布。
- 由于 Actors 是随机放置的，因此可知，执行操作始终需要网络通信，包括方法调用数据的序列化和去序列化，产生延迟和开销。

{{% alert title="注意" color="primary" %}}
注: Dapr actor Placement 服务仅用于 actor 安置，因此，如果您的服务未使用 Dapr Actors，那么不需要。 Placement 服务可以在所有[托管环境]({{< ref hosting >}})中运行，包括自托管和Kubernetes。
{{% /alert %}}

## Actor 通信

你可以通过调用 HTTP/gRPC 端点与 Dapr 互动来调用 actor 方法。

```bash
POST/GET/PUT/DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/<method/state/timers/reminders>
```

您可以在请求正文中为 actor 方法提供任何数据，并且请求的响应将位于响应正文中，该响应正文是来自 actor 调用的数据。

另外，也许与 Actor 交互的另一种更方便的方式是通过 SDK。 Dapr目前在[.NET]({{< ref "dotnet-actors" >}})，[Java]({{< ref "java#actors" >}})，和[Python]({{< ref "python-actor" >}})}中支持actors SDKs。

请参考[Dapr Actor 功能]({{< ref howto-actors.md >}})了解更多详情。

### 并发

Dapr Actor 运行时提供了一个简单的基于回合的访问模型，用于访问 Actor 方法。 这意味着任何时候都不能有一个以上的线程在一个 actor 对象的代码内活动。 基于回合的访问大大简化了并发系统，因为不需要同步数据访问机制。 这也意味着系统的设计必须考虑到每个 actor 实例的单线程访问性质。

单个 actor 实例一次无法处理多个请求。 如果 actor 实例预期要处理并发请求，可能会导致吞吐量瓶颈。

如果两个 Actors 之间存在循环请求，而外部请求同时向其中一个 Actors 发出外部请求，那么 Actors 可以相互死锁。 Dapr actor 运行时会自动分出 actor 调用，并向调用方引发异常以中断可能死锁的情况。

<img src="/images/actors_background_communication.png" width=600>

#### 可重入性

要允许Actors "可重入"并调用自身的方法，请参阅[Actor可重入性]({{<ref actor-reentrancy.md>}})。

### 基于回合的访问

一个回合包括执行 actor 方法以响应来自其他 Actors 或客户端的请求，或执行 timer/reminders 回调。 即使这些方法和回调是异步的，Dapr actor 运行时也不会交错它们。 在允许新回合之前，必须完全结束之前的回合。 换句话说，在允许对方法或回调进行新调用之前，必须完全完成当前正在执行的 actor 方法或 timer/reminders 回调。 如果执行从方法或回调返回结果，并且方法或回调返回的任务已完成，则方法或回调将被视为已完成。 值得强调的是，即使在不同方法、timer和回调中，基于回合的并发也一样起作用。

Dapr Actor 运行时通过在回合开始时获取每个 actor 的锁并在回合结束时释放锁来实现基于回合的调用。 因此，基于回合的并发性是按每个 actor 执行的，而不是跨 Actors 执行的。 Actor 方法和 timer/reminders 回调可以代表不同的 Actors 同时执行。

下面的示例演示了上述概念。 现在有一个实现了两个异步方法（例如，方法 1 和方法 2）、timer 和 reminders 的 actor。 下图显示了执行这些方法的时间线的示例，并代表属于此 Actors 类型的两个 Actors ( ActorId1 和 ActorId2) 的回调。

<img src="/images/actors_background_concurrency.png" width=600>

## 下一步

{{< button text="定时器和提醒 >>" page="actors-timers-reminders.md" >}}

## 相关链接

- [Actors API参考]({{< ref actors_api.md >}})
- [Actors概述]({{< ref actors-overview.md >}})
- [操作方法: 在 Dapr 中使用 virtual actors]({{< ref howto-actors.md >}})
