---
type: docs
title: "Actor 概述"
linkTitle: "概述"
weight: 10
description: "Dapr Actor API 构建块概述"
aliases:
  - "/zh-hans/developing-applications/building-blocks/actors/actors-background"
---

[ actor 模式](https://en.wikipedia.org/wiki/Actor_model) 将 Actors 描述为最底层的 "计算单元"。 换句话说，您将代码写入独立单元 ( 称为actor) ，该单元接收消息并一次处理消息，而不进行任何类型的并行或线程处理。

当代码处理消息时，它可以向其他参与者发送一条或多条消息，或者创建新的 Actor。 底层运行时将管理每个 actor 的运行方式，时机和位置，并在 actor 之间传递消息。

大量 actor 可以同时执行，但他们之间是相互独立执行的。

## Dapr 中的 Actors

Dapr 包含专门实现[ 虚拟 actor 模式](https://www.microsoft.com/research/project/orleans-virtual-actors/)的运行时。 通过 Dapr 的实现，您可以根据 Actors 模型编写 Dapr Actor，而 Dapr 利用底层平台提供的可扩展性和可靠性保证。

每个 actor 都定义为 actor 类型的一个实例，这与对象作为类的实例的方式相同。 例如，可能存在实现计算器功能的 actor 类型，并且该类型的许多 Actor 分布在集群的各个节点上。 每个此类 actor 都由一个 actor ID 唯一标识。

<img src="/images/actor_background_game_example.png" width=400 style="padding-bottom:25px;">

[以下概述视频和演示](https://www.youtube.com/live/0y7ne6teHT4?si=dWNgtsp61f3Sjq0n&t=10797) 展示了 Dapr 中 Actors 的工作方式。 

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/0y7ne6teHT4?si=dWNgtsp61f3Sjq0n&amp;start=10797" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Dapr Actors vs. Dapr 工作流程

Dapr actors 以状态管理和服务调用 API 为基础，创建有状态的、长期运行的、具有身份标识的对象。 [Dapr 工作流]({{< ref workflow-overview.md >}}) 和 Dapr Actors 是相关的，工作流建立在 Actors 之上，提供了更高层次的抽象，可以协调一组 Actors，实施常见的工作流模式，并代表您管理 Actors 的生命周期。

Dapr Actors 旨在提供一种在分布式系统中封装状态和行为的方法。 客户端应用程序可根据需要激活 actor。 当一个 actor 被激活时，它会被分配一个唯一的身份，这样它就能在多次调用中保持自己的状态。 这使得 Actors 在构建有状态、可扩展和容错的分布式应用程序时非常有用。

另一方面，Dapr 工作流提供了一种定义和协调复杂工作流的方法，这些工作流涉及分布式系统中的多个服务和组件。 工作流允许你定义一系列需要按特定顺序执行的步骤或任务，可用于实施业务流程、事件驱动工作流和其他类似场景。

如上所述，Dapr 工作流建立在 Dapr Actors 的基础上，管理它们的激活和生命周期。

### 何时使用 Actor？

与其他技术决策一样，你应该根据你要解决的问题来决定是否使用 actor。 例如，如果您正在构建一个聊天应用程序，您可能会使用 Dapr Actors 来实现聊天室和用户之间的单个聊天会话，因为每个聊天会话都需要保持自己的状态，并且具有可扩展性和容错性。

一般来说，在以下情况下，可以考虑用 actor 模式来为你的问题或场景建模：

- 您的问题空间涉及大量（数千个或更多）小型、独立且隔离的状态和逻辑单元。
- 您想要处理单线程对象，这些对象不需要外部组件的大量交互，例如在一组 Actor 之间查询状态。
- 您的 actor 实例不会因为发出 I/O 操作而以不可预知的延迟阻塞调用者。

### 何时使用 Dapr 工作流程

当您需要定义和协调涉及多个服务和组件的复杂工作流时，可以使用 Dapr 工作流。 例如，使用 [聊天应用程序示例]({{< ref "#when-to-use-dapr-actors" >}})，您可以使用 Dapr 工作流来定义应用程序的整体工作流，如如何注册新用户、如何发送和接收消息，以及应用程序如何处理错误和异常。

[了解有关 Dapr 工作流以及如何在应用程序中使用工作流的更多信息。]({{< ref workflow-overview.md >}})

## 特性

### Actor 生命周期

由于 Dapr 行为体是虚拟的，因此无需明确创建或销毁。 Dapr actor 的运行时：
1. 一旦收到某个 actor ID 的初始请求，就会自动激活该 actor。
1. 垃圾--收集内存中未使用的 Actors 对象。
1. 保持对 actor 存在的了解，以防日后重新激活。

Actor 的状态比对象的生命周期更久，因为状态存储在 Dapr 运行时的配置状态提供程序中（也就是说Actor即使不在活跃状态，仍然可以读取它的状态）。

[了解有关 actor 生命周期 的更多信息。]({{< ref "actors-features-concepts.md#actor-lifetime" >}})

### 分发和故障转移

为了提供可扩展性和可靠性，Actors 实例遍布整个集群，Dapr 将 Actors 实例分布在整个集群中，并自动将它们迁移到健康的节点上。

[了解有关 Dapr actor 安排的更多信息。]({{< ref "actors-features-concepts.md#actor-placement-service" >}})

### Actor 通信

您可以通过 HTTP 调用 actor 方法，如下例所示。

<img src="/images/actors-calling-method.png" width=900>

1. 服务会调用 sidecar 的 actor API。
1. 利用缓存的安置服务分区信息，侧车确定哪个 actor ID 服务实例将托管 actor ID **3**。 调用会被转发到相应的 sidecar。
1. Pod 2 中的 sidecar 实例会调用服务实例来调用 actor 并执行 actor 方法。

[了解有关调用 actor 方法的更多信息。]({{< ref "actors-features-concepts.md#actor-communication" >}})

#### 并发

Dapr Actor 运行时提供了一个简单的基于回合的访问模型，用于访问 Actor 方法。 基于回合的访问大大简化了并发系统，因为同步数据不需要访问机制。

- [进一步了解 Actor可重入性]({{< ref "actor-reentrancy.md" >}})
- [进一步了解回合制访问模式]({{< ref "actors-features-concepts.md#turn-based-access" >}})

### State

事务性状态存储可用于存储 Actor 状态。 要为 Actors 指定使用哪种状态存储，请在状态存储组件的元数据部分将属性 `actorStateStore` 的值指定为 `true`。 Actors 的状态以特定的方案存储在事务性状态存储区中，以便进行一致的查询。 只有一个单一的状态存储组件可以被用作所有角色的状态存储。 请阅读 [state API 参考]({{< ref state_api.md >}}) 和 [actors API 参考]({{< ref actors_api.md >}}) ，了解有关 Actors 状态存储的更多信息。

### Actor timer 和 reminder

参与者可以通过注册 timer 或 reminder 来安排自己的定期工作。

Timer 和 reminder 的功能非常相似。 主要的区别在于，Dapr actor 运行时在停用后不保留任何有关 timer 的信息，而使用 Dapr actor 状态提供程序持久化有关 reminder 的信息。

这种区别允许用户在轻量级但无状态的 timer 和需要更多资源但有状态的 reminder 之间进行权衡。

[以下概述视频和演示](https://www.youtube.com/live/0y7ne6teHT4?si=2_xX6mkU3UCy2Plr&t=6607) 展示了 Actor 计时器 和 提醒 的工作原理。 

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/0y7ne6teHT4?si=73VqYUUvNfFw3x5_&amp;start=12184" title="YouTube 视频播放器" style="padding-bottom:25px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

- [了解有关 Actor 计时器 的更多信息。]({{< ref "actors-features-concepts.md#timers" >}})
- [了解有关actor 提醒的更多信息。]({{< ref "actors-features-concepts.md#reminders" >}})
- [进一步了解定时器和提醒器的错误处理和故障转移。]({{< ref "actors-features-concepts.md#timers-and-reminders-error-handling" >}})

## 下一步

{{< button text="Actors features and concepts >>" page="actors-features-concepts.md" >}}

## 相关链接

- [Actors API 参考]({{< ref actors_api.md >}})
- 请参阅 [Dapr SDK 文档和示例]({{< ref "developing-applications/sdks/#sdk-languages" >}})。
