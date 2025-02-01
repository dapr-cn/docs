---
type: docs
title: "Actors 概述"
linkTitle: "概述"
weight: 10
description: "Actors API 构建模块概述"
aliases:
  - "/zh-hans/developing-applications/building-blocks/actors/actors-background"
---

[Actor 模型](https://en.wikipedia.org/wiki/Actor_model)将 actor 描述为“计算的基本单位”。换句话说，您可以将代码编写在一个自包含的单元中（称为 actor），该单元接收消息并一次处理一条消息，而无需任何形式的并发或线程。

当您的代码处理一条消息时，它可以向其他 actor 发送一条或多条消息，或创建新的 actor。底层运行时管理每个 actor 的运行方式、时间和位置，并在 actor 之间路由消息。

大量的 actor 可以同时执行，并且 actor 彼此独立执行。

## Dapr 中的 Actor 模型

Dapr 包含一个专门实现[虚拟 Actor 模型](https://www.microsoft.com/research/project/orleans-virtual-actors/)的运行时。通过 Dapr 的实现，您可以根据 Actor 模型编写 Dapr actor，Dapr 利用底层平台提供的可扩展性和可靠性保证。

每个 actor 都被定义为 actor 类型的一个实例，与对象是类的一个实例相同。例如，可能有一个实现计算器功能的 actor 类型，并且可能有许多此类型的 actor 分布在集群的各个节点上。每个这样的 actor 都由一个 actor ID 唯一标识。

<img src="/images/actor_background_game_example.png" width=400 style="padding-bottom:25px;">

[以下概述视频和演示](https://www.youtube.com/live/0y7ne6teHT4?si=dWNgtsp61f3Sjq0n&t=10797)展示了 Dapr 中的 actor 如何工作。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/0y7ne6teHT4?si=dWNgtsp61f3Sjq0n&amp;start=10797" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Dapr Actors 与 Dapr Workflow

Dapr actors 基于状态管理和服务调用 API 创建具有身份的有状态、长时间运行的对象。[Dapr Workflow]({{< ref workflow-overview.md >}}) 和 Dapr Actors 是相关的，workflow 基于 actor 提供更高层次的抽象来编排一组 actor，实现常见的 workflow 模式并代表您管理 actor 的生命周期。

Dapr actors 旨在提供一种在分布式系统中封装状态和行为的方法。actor 可以按需由客户端应用程序激活。当 actor 被激活时，它被分配一个唯一的身份，这使得它能够在多次调用中保持其状态。这使得 actor 在构建有状态、可扩展和容错的分布式应用程序时非常有用。

另一方面，Dapr Workflow 提供了一种定义和编排涉及多个服务和组件的复杂 workflow 的方法。workflow 允许您定义需要按特定顺序执行的一系列步骤或任务，并可用于实现业务流程、事件驱动的 workflow 和其他类似场景。

如上所述，Dapr Workflow 基于 Dapr Actors 管理其激活和生命周期。

### 何时使用 Dapr Actors

与任何其他技术决策一样，您应该根据要解决的问题来决定是否使用 actor。例如，如果您正在构建一个聊天应用程序，您可能会使用 Dapr actors 来实现聊天室和用户之间的单个聊天会话，因为每个聊天会话都需要维护自己的状态并且具有可扩展性和容错性。

一般来说，如果您的问题空间涉及大量（数千个或更多）小型、独立和隔离的状态和逻辑单元，可以考虑使用 actor 模式来建模您的问题或场景。

- 您的问题空间涉及大量（数千个或更多）小型、独立和隔离的状态和逻辑单元。
- 您希望使用单线程对象，这些对象不需要外部组件的显著交互，包括跨一组 actor 查询状态。
- 您的 actor 实例不会通过发出 I/O 操作来阻塞调用者，导致不可预测的延迟。

### 何时使用 Dapr Workflow

当您需要定义和编排涉及多个服务和组件的复杂 workflow 时，您可以使用 Dapr Workflow。例如，使用[前面提到的聊天应用程序示例]({{< ref "#when-to-use-dapr-actors" >}})，您可能会使用 Dapr Workflow 来定义应用程序的整体 workflow，例如如何注册新用户、如何发送和接收消息以及应用程序如何处理错误和异常。

[了解有关 Dapr Workflow 的更多信息以及如何在应用程序中使用 workflow。]({{< ref workflow-overview.md >}})

## Actor 类型和 Actor ID

actor 被唯一定义为 actor 类型的一个实例，类似于对象是类的一个实例。例如，您可能有一个实现计算器功能的 actor 类型。可能有许多此类型的 actor 分布在集群的各个节点上。

每个 actor 都由一个 actor ID 唯一标识。actor ID 可以是您选择的任何字符串值。如果您不提供 actor ID，Dapr 会为您生成一个随机字符串作为 ID。

## 功能

### 命名空间化的 Actors

Dapr 支持命名空间化的 actor。actor 类型可以部署到不同的命名空间中。您可以在同一命名空间中调用这些 actor 的实例。

[了解有关命名空间化的 actor 及其工作原理的更多信息。]({{< ref namespaced-actors.md >}})

### Actor 生命周期

由于 Dapr actors 是虚拟的，因此不需要显式创建或销毁。Dapr actor 运行时：
1. 一旦收到该 actor ID 的初始请求，就会自动激活 actor。
1. 垃圾收集未使用的 actor 的内存对象。
1. 维护 actor 的存在信息，以防它稍后被重新激活。

actor 的状态超出了对象的生命周期，因为状态存储在为 Dapr 运行时配置的状态提供者中。

[了解有关 actor 生命周期的更多信息。]({{< ref "actors-features-concepts.md#actor-lifetime" >}})

### 分布和故障转移

为了提供可扩展性和可靠性，actor 实例在整个集群中分布，Dapr 在整个集群中分布 actor 实例，并自动将它们迁移到健康的节点。

[了解有关 Dapr actor 放置的更多信息。]({{< ref "actors-features-concepts.md#actor-placement-service" >}})

### Actor 通信

您可以通过 HTTP 调用 actor 方法，如下面的通用示例所示。

<img src="/images/actors-calling-method.png" width=900>

1. 服务调用 sidecar 上的 actor API。
1. 使用来自放置服务的缓存分区信息，sidecar 确定哪个 actor 服务实例将托管 actor ID **3**。调用被转发到适当的 sidecar。
1. pod 2 中的 sidecar 实例调用服务实例以调用 actor 并执行 actor 方法。

[了解有关调用 actor 方法的更多信息。]({{< ref "actors-features-concepts.md#actor-communication" >}})

#### 并发

Dapr actor 运行时为访问 actor 方法提供了一个简单的轮流访问模型。轮流访问极大地简化了并发系统，因为不需要同步机制来进行数据访问。

- [了解有关 actor 重入的更多信息]({{< ref "actor-reentrancy.md" >}})
- [了解有关轮流访问模型的更多信息]({{< ref "actors-features-concepts.md#turn-based-access" >}})

### 状态

事务性状态存储可以用于存储 actor 状态。无论您是否打算在 actor 中存储任何状态，您都必须在状态存储组件的元数据部分中将属性 `actorStateStore` 的值指定为 `true`。actor 状态以特定方案存储在事务性状态存储中，允许进行一致的查询。所有 actor 只能使用单个状态存储组件作为状态存储。阅读[状态 API 参考]({{< ref state_api.md >}})和[actors API 参考]({{< ref actors_api.md >}})以了解有关 actor 状态存储的更多信息。

### Actor 定时器和提醒

actor 可以通过注册定时器或提醒来安排定期工作。

定时器和提醒的功能非常相似。主要区别在于 Dapr actor 运行时在停用后不保留有关定时器的任何信息，而是使用 Dapr actor 状态提供者持久化有关提醒的信息。

这种区别允许用户在轻量级但无状态的定时器与更耗资源但有状态的提醒之间进行权衡。

[以下概述视频和演示](https://www.youtube.com/live/0y7ne6teHT4?si=2_xX6mkU3UCy2Plr&t=6607)展示了 actor 定时器和提醒如何工作。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/0y7ne6teHT4?si=73VqYUUvNfFw3x5_&amp;start=12184" title="YouTube video player" style="padding-bottom:25px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

- [了解有关 actor 定时器的更多信息。]({{< ref "actors-features-concepts.md#timers" >}})
- [了解有关 actor 提醒的更多信息。]({{< ref "actors-features-concepts.md#reminders" >}})
- [了解有关定时器和提醒错误处理及故障转移的更多信息。]({{< ref "actors-features-concepts.md#timers-and-reminders-error-handling" >}})

## 下一步

{{< button text="Actors 功能和概念 >>" page="actors-features-concepts.md" >}}

## 相关链接

- [Actors API 参考]({{< ref actors_api.md >}})
- 请参阅 [Dapr SDK 文档和示例]({{< ref "developing-applications/sdks/#sdk-languages" >}})。
