---
type: docs
title: "工作流架构"
linkTitle: "工作流架构"
weight: 4000
description: "Dapr 工作流引擎架构"
---

[Dapr 工作流]({{< ref "workflow-overview.md" >}}) 允许开发者使用多种编程语言的普通代码定义工作流。工作流引擎运行在 Dapr sidecar 内部，并协调作为应用程序一部分部署的工作流代码。本文描述了：

- Dapr 工作流引擎的架构
- 工作流引擎如何与应用程序代码交互
- 工作流引擎如何融入整体 Dapr 架构
- 不同的工作流后端如何与工作流引擎协作

有关如何在应用程序中编写 Dapr 工作流的更多信息，请参见 [如何：编写工作流]({{< ref "workflow-overview.md" >}})。

Dapr 工作流引擎的内部支持来自于 Dapr 的 actor 运行时。下图展示了 Kubernetes 模式下的 Dapr 工作流架构：

<img src="/images/workflow-overview/workflows-architecture-k8s.png" width=800 alt="展示 Kubernetes 模式下工作流架构如何工作的图示">

要使用 Dapr 工作流构建块，您需要在应用程序中使用 Dapr 工作流 SDK 编写工作流代码，该 SDK 内部通过 gRPC 流连接到 sidecar。这会注册工作流和任何工作流活动，或工作流可以调度的任务。

引擎直接嵌入在 sidecar 中，并通过 [`durabletask-go`](https://github.com/microsoft/durabletask-go) 框架库实现。此框架允许您更换不同的存储提供者，包括为 Dapr 创建的存储提供者，该提供者在幕后利用内部 actor。由于 Dapr 工作流使用 actor，您可以将工作流状态存储在状态存储中。

## Sidecar 交互

当工作流应用程序启动时，它使用工作流编写 SDK 向 Dapr sidecar 发送 gRPC 请求，并根据 [服务器流式 RPC 模式](https://grpc.io/docs/what-is-grpc/core-concepts/#server-streaming-rpc) 获取工作流工作项流。这些工作项可以是从“启动一个新的 X 工作流”（其中 X 是工作流的类型）到“调度活动 Y，输入 Z 以代表工作流 X 运行”的任何内容。

工作流应用程序执行相应的工作流代码，然后将执行结果通过 gRPC 请求发送回 sidecar。

<img src="/images/workflow-overview/workflow-engine-protocol.png" alt="Dapr 工作流引擎协议" />

所有交互都通过单个 gRPC 通道进行，并由应用程序发起，这意味着应用程序不需要打开任何入站端口。这些交互的细节由特定语言的 Dapr 工作流编写 SDK 内部处理。

### 工作流和 actor sidecar 交互的区别

如果您熟悉 Dapr actor，您可能会注意到工作流与 actor 的 sidecar 交互方式有一些不同。

| Actor | 工作流 |
| ------ | --------- |
| Actor 可以使用 HTTP 或 gRPC 与 sidecar 交互。 | 工作流仅使用 gRPC。由于工作流 gRPC 协议的复杂性，实现工作流时需要一个 SDK。 |
| Actor 操作从 sidecar 推送到应用程序代码。这需要应用程序在特定的 _应用端口_ 上监听。 | 对于工作流，操作是由应用程序使用流协议从 sidecar 拉取的。应用程序不需要监听任何端口即可运行工作流。 |
| Actor 明确地向 sidecar 注册自己。 | 工作流不向 sidecar 注册自己。嵌入的引擎不跟踪工作流类型。这一责任被委托给工作流应用程序及其 SDK。 |

## 工作流分布式追踪

工作流引擎使用 `durabletask-go` 核心通过 Open Telemetry SDKs 写入分布式追踪。这些追踪由 Dapr sidecar 自动捕获并导出到配置的 Open Telemetry 提供者，例如 Zipkin。

引擎管理的每个工作流实例都表示为一个或多个跨度。有一个单一的父跨度表示完整的工作流执行，以及各种任务的子跨度，包括活动任务执行和持久计时器的跨度。

> 工作流活动代码目前**无法**访问追踪上下文。

## 内部工作流 actor

在 Dapr sidecar 内部注册了两种类型的 actor，以支持工作流引擎：

- `dapr.internal.{namespace}.{appID}.workflow`
- `dapr.internal.{namespace}.{appID}.activity`

`{namespace}` 值是 Dapr 命名空间，如果没有配置命名空间，则默认为 `default`。`{appID}` 值是应用程序的 ID。例如，如果您有一个名为 "wfapp" 的工作流应用程序，那么工作流 actor 的类型将是 `dapr.internal.default.wfapp.workflow`，活动 actor 的类型将是 `dapr.internal.default.wfapp.activity`。

下图展示了在 Kubernetes 场景中内部工作流 actor 如何操作：

<img src="/images/workflow-overview/workflow-execution.png" alt="展示跨集群内部注册的 actor 的图示" />

与用户定义的 actor 一样，内部工作流 actor 由 actor 放置服务分布在集群中。它们也维护自己的状态并使用提醒。然而，与存在于应用程序代码中的 actor 不同，这些 _内部_ actor 嵌入在 Dapr sidecar 中。应用程序代码完全不知道这些 actor 的存在。

{{% alert title="注意" color="primary" %}}
只有在应用程序使用 Dapr 工作流 SDK 注册了工作流后，内部工作流 actor 类型才会被注册。如果应用程序从未注册工作流，则内部工作流 actor 永远不会被注册。
{{% /alert %}}

### 工作流 actor

工作流 actor 负责管理应用程序中运行的所有工作流的状态和放置。每当创建一个工作流实例时，就会激活一个新的工作流 actor 实例。工作流 actor 的 ID 是工作流的 ID。这个内部 actor 存储工作流的状态，并通过 actor 放置服务确定工作流代码执行的节点。

每个工作流 actor 使用以下键在配置的状态存储中保存其状态：

| 键 | 描述 |
| --- | ----------- |
| `inbox-NNNNNN` | 工作流的收件箱实际上是一个驱动工作流执行的 _消息_ 的 FIFO 队列。示例消息包括工作流创建消息、活动任务完成消息等。每条消息都存储在状态存储中的一个键中，名称为 `inbox-NNNNNN`，其中 `NNNNNN` 是一个 6 位数，表示消息的顺序。这些状态键在相应的消息被工作流消费后被移除。 |
| `history-NNNNNN` | 工作流的历史是一个有序的事件列表，表示工作流的执行历史。历史中的每个键保存单个历史事件的数据。像一个只追加的日志一样，工作流历史事件只会被添加而不会被移除（除非工作流执行“继续为新”操作，这会清除所有历史并使用新输入重新启动工作流）。 |
| `customStatus` | 包含用户定义的工作流状态值。每个工作流 actor 实例只有一个 `customStatus` 键。 |
| `metadata` | 以 JSON blob 形式包含有关工作流的元信息，包括收件箱的长度、历史的长度以及表示工作流生成的 64 位整数（用于实例 ID 被重用的情况）。长度信息用于确定在加载或保存工作流状态更新时需要读取或写入哪些键。 |

{{% alert title="警告" color="warning" %}}
在 [Dapr 工作流引擎的 Alpha 版本]({{< ref support-preview-features.md >}}) 中，工作流 actor 状态将在工作流完成后仍保留在状态存储中。创建大量工作流可能导致存储使用不受限制。在未来的版本中，将引入数据保留策略，可以自动清除旧工作流状态的状态存储。
{{% /alert %}}

下图展示了工作流 actor 的典型生命周期。

<img src="/images/workflow-overview/workflow-actor-flowchart.png" alt="Dapr 工作流 Actor 流程图"/>

总结：

1. 当工作流 actor 收到新消息时被激活。
2. 新消息触发相关的工作流代码（在您的应用程序中）运行，并将执行结果返回给工作流 actor。
3. 一旦收到结果，actor 会根据需要调度任何任务。
4. 调度后，actor 在状态存储中更新其状态。
5. 最后，actor 进入空闲状态，直到收到另一条消息。在此空闲时间内，sidecar 可能决定从内存中卸载工作流 actor。

### 活动 actor

活动 actor 负责管理所有工作流活动调用的状态和放置。每当工作流调度一个活动任务时，就会激活一个新的活动 actor 实例。活动 actor 的 ID 是工作流的 ID 加上一个序列号（序列号从 0 开始）。例如，如果一个工作流的 ID 是 `876bf371`，并且是工作流调度的第三个活动，它的 ID 将是 `876bf371::2`，其中 `2` 是序列号。

每个活动 actor 将单个键存储到状态存储中：

| 键 | 描述 |
| --- | ----------- |
| `activityState` | 键包含活动调用负载，其中包括序列化的活动输入数据。此键在活动调用完成后自动删除。 |

下图展示了活动 actor 的典型生命周期。

<img src="/images/workflow-overview/workflow-activity-actor-flowchart.png" alt="工作流活动 Actor 流程图"/>

活动 actor 是短暂的：

1. 当工作流 actor 调度一个活动任务时，活动 actor 被激活。
2. 活动 actor 然后立即调用工作流应用程序以调用相关的活动代码。
3. 一旦活动代码完成运行并返回其结果，活动 actor 将执行结果的消息发送给父工作流 actor。
4. 一旦结果被发送，工作流被触发以继续其下一步。

### 提醒使用和执行保证

Dapr 工作流通过使用 [actor 提醒]({{< ref "howto-actors.md#actor-timers-and-reminders" >}}) 来确保工作流的容错性，以从瞬态系统故障中恢复。在调用应用程序工作流代码之前，工作流或活动 actor 将创建一个新的提醒。如果应用程序代码执行没有中断，提醒将被删除。然而，如果托管相关工作流或活动的节点或 sidecar 崩溃，提醒将重新激活相应的 actor 并重试执行。

<img src="/images/workflow-overview/workflow-actor-reminder-flow.png" width=600 alt="展示调用工作流 actor 过程的图示"/>

{{% alert title="重要" color="warning" %}}
集群中过多的活动提醒可能导致性能问题。如果您的应用程序已经大量使用 actor 和提醒，请注意 Dapr 工作流可能给系统增加的额外负载。
{{% /alert %}}

### 状态存储使用

Dapr 工作流在内部使用 actor 来驱动工作流的执行。像任何 actor 一样，这些内部工作流 actor 将其状态存储在配置的状态存储中。任何支持 actor 的状态存储都隐式支持 Dapr 工作流。

如 [工作流 actor]({{< ref "workflow-architecture.md#workflow-actors" >}}) 部分所述，工作流通过追加到历史日志中增量保存其状态。工作流的历史日志分布在多个状态存储键中，以便每个“检查点”只需追加最新的条目。

每个检查点的大小由工作流在进入空闲状态之前调度的并发操作数决定。[顺序工作流]({{< ref "workflow-overview.md#task-chaining" >}}) 因此将对状态存储进行较小的批量更新，而 [扇出/扇入工作流]({{< ref "workflow-overview.md#fan-outfan-in" >}}) 将需要更大的批量。批量的大小还受到工作流 [调用活动]({{< ref "workflow-features-concepts.md#workflow-activities" >}}) 或 [子工作流]({{< ref "workflow-features-concepts.md#child-workflows" >}}) 时输入和输出大小的影响。

<img src="/images/workflow-overview/workflow-state-store-interactions.png" width=600 alt="工作流 actor 状态存储交互图示"/>

不同的状态存储实现可能隐式对您可以编写的工作流类型施加限制。例如，Azure Cosmos DB 状态存储将项目大小限制为 2 MB 的 UTF-8 编码 JSON（[来源](https://learn.microsoft.com/azure/cosmos-db/concepts-limits#per-item-limits)）。活动或子工作流的输入或输出负载作为状态存储中的单个记录存储，因此 2 MB 的项目限制意味着工作流和活动的输入和输出不能超过 2 MB 的 JSON 序列化数据。

同样，如果状态存储对批量事务的大小施加限制，这可能会限制工作流可以调度的并行操作数。

工作流状态可以从状态存储中清除，包括其所有历史记录。每个 Dapr SDK 都公开用于清除特定工作流实例的所有元数据的 API。

## 工作流可扩展性

由于 Dapr 工作流在内部使用 actor 实现，Dapr 工作流具有与 actor 相同的可扩展性特征。放置服务：

- 不区分工作流 actor 和您在应用程序中定义的 actor
- 将使用与 actor 相同的算法对工作流进行负载均衡

工作流的预期可扩展性由以下因素决定：

- 用于托管工作流应用程序的机器数量
- 运行工作流的机器上可用的 CPU 和内存资源
- 为 actor 配置的状态存储的可扩展性
- actor 放置服务和提醒子系统的可扩展性

目标应用程序中工作流代码的实现细节也在个别工作流实例的可扩展性中起作用。每个工作流实例一次在单个节点上执行，但工作流可以调度在其他节点上运行的活动和子工作流。

工作流还可以调度这些活动和子工作流以并行运行，允许单个工作流可能将计算任务分布在集群中的所有可用节点上。

<img src="/images/workflow-overview/workflow-actor-scale-out.png" width=800 alt="跨多个 Dapr 实例扩展的工作流和活动 actor 图示"/>

{{% alert title="重要" color="warning" %}}
目前，没有对工作流和活动并发性施加全局限制。因此，一个失控的工作流可能会在尝试并行调度过多任务时消耗集群中的所有资源。在编写 Dapr 工作流时，请小心调度大量并行工作的批次。

此外，Dapr 工作流引擎要求每个工作流应用程序的所有实例注册完全相同的工作流和活动。换句话说，无法独立扩展某些工作流或活动。应用程序中的所有工作流和活动必须一起扩展。
{{% /alert %}}

工作流不控制负载在集群中的具体分布方式。例如，如果一个工作流调度 10 个活动任务并行运行，所有 10 个任务可能在多达 10 个不同的计算节点上运行，也可能在少至一个计算节点上运行。实际的扩展行为由 actor 放置服务决定，该服务管理表示工作流每个任务的 actor 的分布。

## 工作流后端

工作流后端负责协调和保存工作流的状态。在任何给定时间，只能支持一个后端。您可以将工作流后端配置为一个组件，类似于 Dapr 中的任何其他组件。配置要求：
1. 指定工作流后端的类型。
1. 提供特定于该后端的配置。

例如，以下示例演示了如何定义一个 actor 后端组件。Dapr 工作流目前默认仅支持 actor 后端，用户不需要定义 actor 后端组件即可使用它。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: actorbackend
spec:
  type: workflowbackend.actor
  version: v1
```

## 工作流延迟

为了提供关于持久性和弹性的保证，Dapr 工作流频繁地写入状态存储并依赖提醒来驱动执行。因此，Dapr 工作流可能不适合对延迟敏感的工作负载。预期的高延迟来源包括：

- 在持久化工作流状态时来自状态存储的延迟。
- 在使用大型历史记录重新加载工作流时来自状态存储的延迟。
- 集群中过多活动提醒导致的延迟。
- 集群中高 CPU 使用率导致的延迟。

有关工作流 actor 设计如何影响执行延迟的更多详细信息，请参见 [提醒使用和执行保证部分]({{< ref "workflow-architecture.md#reminder-usage-and-execution-guarantees" >}})。

## 下一步

{{< button text="编写工作流 >>" page="howto-author-workflow.md" >}}

## 相关链接

- [工作流概述]({{< ref workflow-overview.md >}})
- [工作流 API 参考]({{< ref workflow_api.md >}})
- [尝试工作流快速入门]({{< ref workflow-quickstart.md >}})
- 尝试以下示例：
   - [Python](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow)
   - [JavaScript 示例](https://github.com/dapr/js-sdk/tree/main/examples/workflow)
   - [.NET](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
   - [Java](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)
   - [Go 示例](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)
