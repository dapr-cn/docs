---
type: docs
title: "Dapr Actors 概述"
linkTitle: "Overview"
weight: 10
description: Overview of the actors building block
aliases:
  - "/developing-applications/building-blocks/actors/actors-background"
---

## Introduction
The [actor pattern](https://en.wikipedia.org/wiki/Actor_model) describes actors as the lowest-level "unit of computation". 换句话说，您将代码写入独立单元 ( 称为actor) ，该单元接收消息并一次处理消息，而不进行任何类型的并行或线程处理。

While your code processes a message, it can send one or more messages to other actors, or create new actors. An underlying runtime manages how, when and where each actor runs, and also routes messages between actors.

大量 Actors 可以同时执行，而 Actors 可以相互独立执行。

Dapr includes a runtime that specifically implements the [Virtual Actor pattern](https://www.microsoft.com/en-us/research/project/orleans-virtual-actors/). 通过 Dapr 的实现，您可以根据 Actors 模型编写 Dapr Actor，而 Dapr 利用底层平台提供的可扩展性和可靠性保证。

### 何时使用 Actors？

与任何其他技术决策一样，您应该根据您尝试解决的问题来决定是否使用 Actors。

The actor design pattern can be a good fit to a number of distributed systems problems and scenarios, but the first thing you should consider are the constraints of the pattern. 一般来说，在下列情况下，考虑 actor 模式来模拟你的问题或场景：

* Your problem space involves a large number (thousands or more) of small, independent, and isolated units of state and logic.
* You want to work with single-threaded objects that do not require significant interaction from external components, including querying state across a set of actors.
* Your actor instances won't block callers with unpredictable delays by issuing I/O operations.

## Dapr 中的 Actors

Every actor is defined as an instance of an actor type, identical to the way an object is an instance of a class. 例如，可能存在实现计算器功能的 actor 类型，并且该类型的许多 Actors 分布在集群的各个节点上。 每个这样的 actor 都是由一个 actor ID 确定的。

<img src="/images/actor_background_game_example.png" width=400>

## Actor 生命周期

Dapr actors are virtual, meaning that their lifetime is not tied to their in-memory representation. 因此，它们不需要显式创建或销毁。 Dapr Actors 运行时在第一次接收到该 actor ID 的请求时自动激活 actor。 如果 actor 在一段时间内未被使用，那么 Dapr Actors 运行时将回收内存对象。 如果以后需要重新启动，它还将保持对 actor 的一切原有数据。

Invocation of actor methods and reminders reset the idle time, e.g. reminder firing will keep the actor active. 不论 actor 是否处于活动状态或不活动状态 Actor reminders 都会触发，对不活动 actor ，那么会首先激活 actor。 Actor timers 不会重置空闲时间，因此 timer 触发不会使参与者保持活动状态。 Timer 仅在 actor 活跃时被触发。

The idle timeout and scan interval Dapr runtime uses to see if an actor can be garbage-collected is configurable. 当 Dapr 运行时调用 actor 服务以获取受支持的 actor 类型时，可以传递此信息。

Virtual actors 生命周期抽象会将一些警告作为 virtual actors 模型的结果，而事实上， Dapr Actors 实施有时会偏离此模型。

An actor is automatically activated (causing an actor object to be constructed) the first time a message is sent to its actor ID. 在一段时间后，actor 对象将被垃圾回收。 以后，再次使用 actor ID 访问，将构造新的 actor。 Actor 的状态比对象的生命周期更久，因为状态存储在 Dapr 运行时的配置状态提供程序中（也就是说Actor即使不在活跃状态，仍然可以读取它的状态）。

## 分发和故障转移

为了提供可扩展性和可靠性，Actors 实例分布在整个集群中， Dapr 会根据需要自动将对象从失败的节点迁移到健康的节点。

Actors are distributed across the instances of the actor service, and those instance are distributed across the nodes in a cluster. 每个服务实例都包含给定 Actors 类型的一组 Actors。

### Actor 安置服务 (Actor placement service)
Dapr actor 运行时为您管理分发方案和键范围设置。 这是由 actor `Placement` 服务完成的。 创建服务的新实例时，相应的 Dapr 运行时将注册它可以创建的 actor 类型， `Placement` 服务将计算给定 actor 类型的所有实例之间的分区。 每个 actor 类型的分区信息表将更新并存储在环境中运行的每个 Dapr 实例中，并且可以随着新 actor 服务实例创建和销毁动态更改。 如下图所示。

<img src="/images/actors_background_placement_service_registration.png" width=600>

When a client calls an actor with a particular id (for example, actor id 123), the Dapr instance for the client hashes the actor type and id, and uses the information to call onto the corresponding Dapr instance that can serve the requests for that particular actor id. 因此，始终对任何给定 actor Id 始终会落在同一分区 (或服务实例) 。 如下图所示。

<img src="/images/actors_background_id_hashing_calling.png" width=600>

 这简化了一些选择，但也带有一些考虑：

* By default, actors are randomly placed into pods resulting in uniform distribution.
* Because actors are randomly placed, it should be expected that actor operations always require network communication, including serialization and deserialization of method call data, incurring latency and overhead.

Note: The Dapr actor Placement service is only used for actor placement and therefore is not needed if your services are not using Dapr actors. Placement 服务可以在所有 [ 托管环境中]({{< ref hosting >}})</a> ，包括自托管和 Kubernetes。

## Actor 通信

您可以通过 HTTP/gRPC 来与 Dapr 交互以调用 actor 方法.

```bash
POST/GET/PUT/DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/<method/state/timers/reminders>
```

您可以在请求主体中为 actor 方法提供任何数据，并且请求的响应在响应主体中，这是来自 actor 方法调用的数据。

请参阅 [Dapr Actor 功能部件]({{< ref actors-overview.md >}}) ，以获取更多详细信息。

### 并发（Concurrency）

The Dapr Actors runtime provides a simple turn-based access model for accessing actor methods. 这意味着任何时候都不能有一个以上的线程在一个 actor 对象的代码内活动。 基于回合的访问大大简化了并发系统，因为不需要同步数据访问机制。 这也意味着系统的设计必须考虑到每个 actor 实例的单线程访问性质。

A single actor instance cannot process more than one request at a time. 如果 actor 实例预期要处理并发请求，可能会导致吞吐量瓶颈。

Actors can deadlock on each other if there is a circular request between two actors while an external request is made to one of the actors simultaneously. Dapr actor 运行时会自动分出 actor 调用，并向调用方引发异常以中断可能死锁的情况。

<img src="/images/actors_background_communication.png" width=600>


### 基于回合的访问

一个回合包括执行 actor 方法以响应来自其他 Actors 或客户端的请求，或执行 timer/reminders 回调。 即使这些方法和回调是异步的，但 Dapr Actors 运行时并没有将它们交错（Interleave ，即并发调用它们）。 在允许新回合之前，必须完全结束之前的回合。 换句话说，在允许对方法或回调进行新调用之前，必须完全完成当前正在执行的 actor 方法或 timer/reminders 回调。 如果执行从方法或回调返回结果，并且方法或回调返回的任务已完成，则方法或回调将被视为已完成。 值得强调的是，即使在不同方法、timer和回调中，基于回合的并发也一样起作用。

The Dapr actors runtime enforces turn-based concurrency by acquiring a per-actor lock at the beginning of a turn and releasing the lock at the end of the turn. 因此，基于回合的并发性是按每个 actor 执行的，而不是跨 Actors 执行的。 Actor 方法和 timer/reminders 回调可以代表不同的 Actors 同时执行。

下面的示例演示了上述概念。 现在有一个实现了两个异步方法（例如，方法 1 和方法 2）、timer 和 reminders 的 actor。 The diagram below shows an example of a timeline for the execution of these methods and callbacks on behalf of two actors (ActorId1 and ActorId2) that belong to this actor type.

<img src="/images/actors_background_concurrency.png" width=600>

