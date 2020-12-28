---
type: docs
title: "Actors简介"
linkTitle: "Actors background"
weight: 20
description: 了解有关 Actor 模式的更多信息
---

[actor 模式](https://en.wikipedia.org/wiki/Actor_model) 阐述了 **Actors** 为最低级别的“计算单元”。 换句话说，您将代码写入独立单元 ( 称为actor) ，该单元接收消息并一次处理消息，而不进行任何类型的并行或线程处理。

当您的代码处理消息时，它可以发送一个或多个消息给其他Actors，或创建新的Actors。 底层 **运行时** 将管理每个 actor 的运行方式，时机和位置，并在 Actors 之间传递消息。

大量 Actors 可以同时执行，而 Actors 可以相互独立执行。

Dapr 包含专门实现 [virtual actors 模式](https://www.microsoft.com/en-us/research/project/orleans-virtual-actors/) 的运行时。 通过 Dapr 的实现，您可以根据 Actors 模型编写 Dapr Actor，而 Dapr 利用底层平台提供的可扩展性和可靠性保证。

## 快速链接

- [Dapr Actor 特性]({{< ref actors-overview.md >}})
- [Dapr Actor API 规范]({{< ref actors_api.md >}})

### 何时使用 Actors？

与任何其他技术决策一样，您应该根据您尝试解决的问题来决定是否使用 Actors。

Actor 设计模式可以很好适应一些分布式系统问题和场景，但您首先应该考虑的是模式的约束。 一般来说，在下列情况下，考虑 actor 模式来模拟你的问题或场景：

* 您的问题空间涉及大量(数千或更多) 的独立和孤立的小单位和逻辑。
* 您想要处理单线程对象，这些对象不需要外部组件的大量交互，例如在一组 Actors 之间查询状态。
* 您的 actor 实例不会通过发出I/O操作来阻塞调用方。

## Dapr 中的 Actors

每个 actor 都被定义为一个 actor 类型的实例，这对象作为一与一个个类实例的方式相同。 例如，可能存在实现计算器功能的 actor 类型，并且该类型的许多 Actors 分布在集群的各个节点上。 每个这样的 actor 都是由一个 actor ID 确定的。

<img src="/images/actor_background_game_example.png" width=400>

## Actor 生命周期

Dapr Actors 是虚拟的，这意味着他们的生命周期与他们的内存状况无关。 因此，它们不需要显式创建或销毁。 Dapr Actors 运行时在第一次接收到该 actor ID 的请求时自动激活 actor。 如果 actor 在一段时间内未被使用，那么 Dapr Actors 运行时将回收内存对象。 如果以后需要重新启动，它还将保持对 actor 的一切原有数据。

调用 actor 方法和 reminders 都会重置 actor 的空闲时长计时器，例如， reminders 的触发将使 actor 保持活动状态。 不论 actor 是否处于活动状态或不活动状态 Actor reminders 都会触发，对不活动 actor ，那么会首先激活 actor。 Actor timers 不会重置空闲时间，因此 timer 触发不会使参与者保持活动状态。 Timer 仅在 actor 活跃时被触发。

Dapr 运行时中的“空闲超时”和"扫描时间间隔"用于查看是否可以对 actor 进行垃圾收集。 当 Dapr 运行时调用 actor 服务以获取受支持的 actor 类型时，可以传递此信息。

This virtual actor lifetime abstraction carries some caveats as a result of the virtual actor model, and in fact the Dapr Actors implementation deviates at times from this model.

An actor is automatically activated (causing an actor object to be constructed) the first time a message is sent to its actor ID. After some period of time, the actor object is garbage collected. In the future, using the actor ID again, causes a new actor object to be constructed. An actor's state outlives the object's lifetime as state is stored in configured state provider for Dapr runtime.

## Distribution and failover

To provide scalability and reliability, actors instances are distributed throughout the cluster and Dapr  automatically migrates them from failed nodes to healthy ones as required.

Actors are distributed across the instances of the actor service, and those instance are distributed across the nodes in a cluster. Each service instance contains a set of actors for a given actor type.

### Actor placement service
The Dapr actor runtime manages distribution scheme and key range settings for you. This is done by the actor `Placement` service. When a new instance of a service is created, the corresponding Dapr runtime registers the actor types it can create and the `Placement` service calculates the partitioning across all the instances for a given actor type. This table of partition information for each actor type is updated and stored in each Dapr instance running in the environment and can change dynamically as new instance of actor services are created and destroyed. This is shown in the diagram below.

<img src="/images/actors_background_placement_service_registration.png" width=600>

When a client calls an actor with a particular id (for example, actor id 123), the Dapr instance for the client hashes the actor type and id, and uses the information to call onto the corresponding Dapr instance that can serve the requests for that particular actor id. As a result, the same partition (or service instance) is always called for any given actor id. This is shown in the diagram below.

<img src="/images/actors_background_id_hashing_calling.png" width=600>

 This simplifies some choices but also carries some consideration:

* By default, actors are randomly placed into pods resulting in uniform distribution.
* Because actors are randomly placed, it should be expected that actor operations always require network communication, including serialization and deserialization of method call data, incurring latency and overhead.

Note: The Dapr actor Placement service is only used for actor placement and therefore is not needed if your services are not using Dapr actors. The Placement service can run in all [hosting environments]({{< ref hosting >}}), including self-hosted and Kubernetes.

## Actor communication

You can interact with Dapr to invoke the actor method by calling HTTP/gRPC endpoint.

```bash
POST/GET/PUT/DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/<method/state/timers/reminders>
```

You can provide any data for the actor method in the request body, and the response for the request would be in the response body which is the data from actor call.

Refer to [Dapr Actor Features]({{< ref actors-overview.md >}}) for more details.

### Concurrency

The Dapr Actors runtime provides a simple turn-based access model for accessing actor methods. This means that no more than one thread can be active inside an actor object's code at any time. Turn-based access greatly simplifies concurrent systems as there is no need for synchronization mechanisms for data access. It also means systems must be designed with special considerations for the single-threaded access nature of each actor instance.

A single actor instance cannot process more than one request at a time. An actor instance can cause a throughput bottleneck if it is expected to handle concurrent requests.

Actors can deadlock on each other if there is a circular request between two actors while an external request is made to one of the actors simultaneously. The Dapr actor runtime automatically times out on actor calls and throw an exception to the caller to interrupt possible deadlock situations.

<img src="/images/actors_background_communication.png" width=600>


### Turn-based access

A turn consists of the complete execution of an actor method in response to a request from other actors or clients, or the complete execution of a timer/reminder callback. Even though these methods and callbacks are asynchronous, the Dapr Actors runtime does not interleave them. A turn must be fully finished before a new turn is allowed. In other words, an actor method or timer/reminder callback that is currently executing must be fully finished before a new call to a method or callback is allowed. A method or callback is considered to have finished if the execution has returned from the method or callback and the task returned by the method or callback has finished. It is worth emphasizing that turn-based concurrency is respected even across different methods, timers, and callbacks.

The Dapr actors runtime enforces turn-based concurrency by acquiring a per-actor lock at the beginning of a turn and releasing the lock at the end of the turn. Thus, turn-based concurrency is enforced on a per-actor basis and not across actors. Actor methods and timer/reminder callbacks can execute simultaneously on behalf of different actors.

The following example illustrates the above concepts. Consider an actor type that implements two asynchronous methods (say, Method1 and Method2), a timer, and a reminder. The diagram below shows an example of a timeline for the execution of these methods and callbacks on behalf of two actors (ActorId1 and ActorId2) that belong to this actor type.

<img src="/images/actors_background_concurrency.png" width=600>

