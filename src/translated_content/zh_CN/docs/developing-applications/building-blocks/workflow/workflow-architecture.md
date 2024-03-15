---
type: docs
title: 工作流架构
linkTitle: 工作流架构
weight: 4000
description: Dapr 工作流引擎架构
---

{{% alert title="注意" color="primary" %}}
Dapr工作流目前处于beta阶段。 [查看已知限制 {{% dapr-latest-version cli="true" %}}]({{< ref "workflow-overview\.md#limitations" >}}).
{{% /alert %}}

[Dapr工作流]({{< ref "workflow-overview\.md" >}})允许开发人员使用各种编程语言的普通代码定义工作流。 工作流引擎在 Dapr sidecar 中运行，并协调作为应用程序一部分部署的工作流代码。 本文介绍：

- Dapr 工作流引擎的架构
- 工作流引擎如何与应用程序代码交互
- 工作流引擎如何融入整个 Dapr 架构
- 不同的工作流后端如何与工作流引擎配合工作

有关如何在应用程序中创建 Dapr 工作流的更多信息，请参阅 [指南：如何创建工作流]({{< ref "workflow-overview\.md" >}})。

Dapr 工作流引擎由 Dapr 的 actor 运行时提供内部支持。 下图展示了 Kubernetes 模式下的 Dapr 工作流架构：

<img src="/images/workflow-overview/workflows-architecture-k8s.png" width=800 alt="Diagram showing how the workflow architecture works in Kubernetes mode">

要使用 Dapr 工作流构建模块，您需要使用 Dapr 工作流 SDK 在应用程序中编写工作流代码，该代码内部使用 gRPC 流连接到 sidecar。 这将注册工作流和任何工作流活动，或工作流可以安排的任务。

该引擎直接嵌入到 sidecar 中，并使用 [`durabletask-go`](https://github.com/microsoft/durabletask-go) 框架库实现。 这个框架允许你更换不同的存储提供商，包括为 Dapr 创建的存储提供商，它在幕后利用内部 actor。 由于 Dapr 工作流使用 Actor，因此可以在状态存储中存储工作流状态。

## Sidecar 交互

当一个工作流应用程序启动时，它使用工作流创作 SDK 向 Dapr sidecar 发送一个 gRPC 请求，并按照 [服务器流 RPC 模式](https://grpc.io/docs/what-is-grpc/core-concepts/#server-streaming-rpc) 获取一系列工作流工作项。 这些工作项可以是 "启动一个新的 X 工作流"（其中 X 是工作流的类型），也可以是 "安排输入为 Z 的活动 Y 以代表工作流 X 运行"。

工作流应用程序执行相应的工作流代码，然后将 gRPC 请求和执行结果发回 sidecar。

<img src="/images/workflow-overview/workflow-engine-protocol.png" alt="Dapr Workflow Engine Protocol" />

所有交互都通过单个 gRPC 通道进行，并由应用程序启动，这意味着应用程序无需打开任何入站（inbound）端口。 这些交互的细节由特定语言的 Dapr 工作流创作 SDK 在内部处理。

### 工作流与 actor sidecar 交互的区别

如果你熟悉 Dapr actor，你可能会注意到工作流中的 sidecar 交互方式与 actor 有一些不同。

| Actors                                                | Workflows                                                                                           |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Actor 可以使用 HTTP 或 gRPC 与 sidecar 进行交互。                | 工作流只使用 gRPC。 由于工作流 gRPC 协议的复杂性，在实施工作流时，需要 SDK。                                                      |
| Actor 操作是从 sidecar 推送到应用程序代码。 这就要求应用程序监听特定的 _应用程序端口_。 | 对于工作流，应用程序使用流式处理协议从 sidecar 中_拉取_操作。 应用程序无需监听任何端口即可运行工作流。 |
| Actor 显式地向 sidecar 注册自己。                              | 工作流不会向 Sidecar 注册自身。 嵌入式引擎不会跟踪工作流类型。 此责任将委派给工作流应用程序及其 SDK。                                          |

## 工作流分布式跟踪

工作流引擎使用的 `durabletask-go` 内核使用 Open Telemetry SDK 写入分布式跟踪。 这些跟踪由 Dapr Sidecar 自动捕获，并导出到配置的 Open Telemetry 提供程序，例如 Zipkin。

引擎管理的每个工作流实例都表示为一个或多个 span。 有一个父 span 代表整个工作流程的执行，子 span 代表各种任务，包括活动任务执行 span 和持久定时器 span。 工作流活动代码还可以访问跟踪上下文，从而允许分布式跟踪上下文流向工作流调用的外部服务。

## 内部工作流 Actor

有两种类型的 actor 在 Dapr sidea中内部注册以支持工作流引擎：

- `dapr.internal.{namespace}.{appID}.workflow`
- `dapr.internal.{namespace}.{appID}.activity`

`{namespace}` 值是 Dapr 命名空间，如果没有配置命名空间，默认值为 `default`。 `{appID}` 值是应用程序的 ID。 例如，如果您有一个名为"wfapp"的工作流应用程序，那么工作流 actor的类型将是`dapr.internal.default.wfapp.workflow`，活动 actor的类型将是`dapr.internal.default.wfapp.activity`。

下图展示了内部工作流 actor 在 Kubernetes 场景中的运行方式：

<img src="/images/workflow-overview/workflow-execution.png" alt="Diagram demonstrating internally registered actors across a cluster" />

与用户定义的 actor 一样，内部工作流 actor 也是通过 actor placement 服务分布在整个集群中的。 它们还能保持自己的状态，并利用提醒功能。 然而，与生存在应用程序代码中的 actor 不同，这些**内部** actor被嵌入到Dapr sidecar中。 应用程序代码完全不知道这些 actor 的存在。

{{% alert title="注意" color="primary" %}}内部工作流 actor 类型仅在应用使用 Dapr 工作流 SDK 注册工作流后注册。 如果应用从不注册工作流，则永远不会注册内部工作流 actor。
{{% /alert %}}

### 工作流 actor

工作流 actor 负责管理应用程序中运行的所有工作流的状态和放置。 每创建一个工作流实例，就会激活一个新的工作流 actor 实例。 工作流 actor 的 ID 就是工作流的 ID。 这个内部 actor 在工作流进行过程中存储工作流程的状态，并通过 actor 放置服务确定工作流代码的执行节点。

每个工作流 actor 都使用配置的状态存储中的以下键保存其状态：

| Key              | 说明                                                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `inbox-NNNNNN`   | 工作流的收件箱实际上是驱动工作流执行的 _消息_ 的 FIFO 队列。 示例消息包括工作流创建消息、活动任务完成消息等。 每条消息都用自己的键存储在状态存储中，名称为 `inbox-NNNNNN`，这里的 `NNNNNN` 是一个 6 位数字，指示消息的顺序。 一旦工作流消费了相应的信息，这些状态键就会被移除。 |
| `history-NNNNNN` | 工作流的历史记录是一个有序的事件列表，代表了工作流的执行历史。 历史记录中的每个键都保存单个历史记录事件的数据。 与仅附加日志一样，工作流历史事件只会添加而不会删除（除非工作流执行了 "continue as new" 操作，该操作会清除所有历史事件，并以新输入重新启动工作流）。                 |
| `customStatus`   | 包含用户定义的工作流状态值。 每个工作流 actor 实例都有一个 `customStatus` 键。                                                                                                          |
| `metadata`       | 以 JSON blob 的形式包含工作流的元信息，其中包括 inbox 长度、历史记录长度以及代表工作流生成的 64 位整数（适用于实例 ID 被重复使用的情况）等详细信息。 在加载或保存工作流状态更新时，长度信息用于确定需要读取或写入哪些键。                                   |

{{% alert title="警告" color="warning" %}}
在[Dapr工作流引擎的Alpha版本]({{< ref support-preview-features.md >}})中，即使工作流已完成，工作流actor的状态仍会保留在状态存储中。 创建大量工作流可能会导致存储空间的无限制使用。 在未来的版本中，将引入数据保留策略，可自动清除状态存储中的旧工作流状态。
{{% /alert %}}

下图说明了工作流 actor 的典型生命周期。

<img src="/images/workflow-overview/workflow-actor-flowchart.png" alt="Dapr Workflow Actor Flowchart"/>

总的来说：

1. 工作流 actor 在收到新消息时被激活。
2. 然后，新消息会触发相关的工作流代码（在您的应用程序中）运行，并将执行结果返回给工作流 actor。
3. 一旦收到结果，actor 就会根据需要安排任务。
4. 调度结束后，actor 会更新状态存储中的状态。
5. 最后，actor 进入空闲状态，直到收到另一条消息。 在此空闲时间内，sidecar 可能会决定从内存中卸载工作流 actor。

### 活动 actor

活动 actor 负责管理所有工作流活动调用的状态和放置。 工作流调度的每个活动任务都会激活一个新的活动 actor 实例。 活动 actor 的 ID 是工作流的 ID 与序列号（序列号从 0 开始）的组合。 例如，如果一个工作流的ID是`876bf371`，并且是工作流要计划的第三个活动，它的ID将是`876bf371::2`，其中`2`是序列号。

每个活动 actor 将单个键存储到状态存储中：

| Key             | 说明                                             |
| --------------- | ---------------------------------------------- |
| `activityState` | 这个键包含活动调用有效负载，其中包括序列化的活动输入数据。 活动调用完成后，该键将自动删除。 |

下图说明了活动 actor 的典型生命周期。

<img src="/images/workflow-overview/workflow-activity-actor-flowchart.png" alt="Workflow Activity Actor Flowchart"/>

活动 actor 是短暂的：

1. 当工作流 actor 调度活动任务时，活动 actor 就会被激活。
2. 然后，活动 actor 会立即调用工作流应用程序，调用相关的活动代码。
3. 一旦活动代码运行完毕并返回结果，活动 actor 就会向父工作流 actor 发送一条包含执行结果的消息。
4. 发送结果后，将触发工作流以继续执行下一步。

### 提醒使用和执行保证

Dapr工作流通过使用[actor reminders]({{< ref "howto-actors.md#actor-timers-and-reminders" >}})来从瞬时系统故障中恢复，从而确保工作流的容错性。 在调用应用程序工作流代码之前，工作流或活动 actor 将创建一个新的提醒。 如果应用程序代码不间断地执行，则会删除提醒。 但是，如果承载相关工作流或活动的节点或 sidecar 崩溃，提醒会重新激活相应的 actor，并重新执行。

<img src="/images/workflow-overview/workflow-actor-reminder-flow.png" width=600 alt="Diagram showing the process of invoking workflow actors"/>

{{% alert title="Important" color="warning" %}}
集群中的活动提醒太多可能会导致性能问题。 如果您的应用程序已经在大量使用 actor 和提醒，请注意 Dapr 工作流可能会给您的系统增加额外负担。
{{% /alert %}}

### 状态存储使用情况

Dapr 工作流在内部使用 actor 来驱动工作流的执行。 与其他 actor 一样，这些内部工作流 actor 也会在配置的状态存储中存储其状态。 任何支持 actor 的状态存储都隐式支持 Dapr 工作流。

正如 [工作流 actor](workflow-architecture.md#workflow-actors) 部分所述，工作流通过附加到历史日志来增量保存其状态。 工作流的历史日志分布在多个状态存储键上，因此每个 "检查点" 只需添加最新条目。

每个检查点的大小取决于工作流在进入空闲状态前调度的并发操作的数量。 [顺序工作流]({{< ref "workflow-overview\.md#task-chaining" >}})将因此对状态存储进行较小批量更新，而[扇出/扇入工作流]({{< ref "workflow-overview\.md#fan-outfan-in" >}})将需要较大批量更新。 批处理的大小也受到工作流[调用活动]({{< ref "workflow-features-concepts.md#workflow-activities" >}})或[子工作流]({{< ref "workflow-features-concepts.md#child-workflows" >}})的输入和输出大小的影响。

<img src="/images/workflow-overview/workflow-state-store-interactions.png" width=600 alt="Diagram of workflow actor state store interactions"/>

不同的状态存储实现可能会隐式限制您可以创作的工作流类型。 例如，Azure Cosmos DB 状态存储将项大小限制为2 MB的UTF-8编码的JSON（[来源](https://learn.microsoft.com/azure/cosmos-db/concepts-limits#per-item-limits)）。 活动或子工作流的输入或输出有效载荷在状态存储中存储为单条记录，因此项目限制为 2 MB 意味着工作流和活动的输入和输出不能超过 2 MB 的 JSON 序列化数据。

同样，如果状态存储对批处理事务的大小设置了限制，就会限制工作流可以调度的并行操作的数量。

工作流状态可以从状态存储中清除，包括其所有历史记录。 每个 Dapr SDK 都暴露了用于清除与特定工作流实例相关的所有元数据的 API。

## 工作流可扩展性

由于 Dapr 工作流在内部使用 actor 实现，因此 Dapr 工作流具有与 actor 相同的可扩展性。 安置服务：

- 不区分工作流 actor 和在应用程序中定义的 actor
- 将使用与 actor 相同的算法对工作流进行负载平衡

工作流的预期可伸缩性由以下因素决定：

- 用于托管工作流应用程序的机器数量
- 运行工作流的机器上可用的 CPU 和内存资源
- 为 actor 配置的状态存储的可扩展性
- Actor 安置服务和提醒子系统的可扩展性

目标应用程序中工作流代码的实施细节也会影响单个工作流实例的可扩展性。 每个工作流实例一次只能在一个节点上执行，但工作流可以调度在其他节点上运行的活动和子工作流。

工作流还可以安排这些活动和子工作流并行运行，从而使单个工作流有可能将计算任务分配到集群中的所有可用节点上。

<img src="/images/workflow-overview/workflow-actor-scale-out.png" width=800 alt="Diagram of workflow and activity actors scaled out across multiple Dapr instances"/>

{{% alert title="Important" color="warning" %}}
目前，对工作流和活动并发没有全局限制。 因此，如果失控的工作流尝试并行调度太多任务，则可能会消耗群集中的所有资源。 在编写并行调度大批量工作的 Dapr 工作流时，请务必谨慎。

此外，Dapr 工作流引擎要求每个工作流应用程序的所有实例都注册完全相同的工作流和活动集。 换句话说，无法独立扩展某些工作流程或活动。 应用程序中的所有工作流和活动都必须一起扩展。
{{% /alert %}}

工作流无法控制负载如何在集群中分配的具体细节。 例如，如果一个工作流安排了 10 个并行运行的活动任务，那么所有 10 个任务可能在多达 10 个不同的计算节点上运行，也可能只在一个计算节点上运行。 实际缩放行为由 actor 放置服务确定，该服务管理表示工作流每个任务的 actor 的分布。

## Workflow backend

工作流后端负责编排和保留工作流的状态。 在任何给定的时间，只能支持一个后端。 您可以将工作流后端配置为组件，类似于Dapr中的任何其他组件。 配置需要:

1. 指定工作流后端的类型。
2. 提供特定于该后端的配置。

例如，以下示例演示了如何定义一个 actor 后端组件。 Dapr工作流当前默认仅支持actor后端，并且用户不需要定义actor后端组件来使用它。

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

为了提供有关持久性和弹性的保证，Dapr 工作流经常写入状态存储，并依靠提醒来推动执行。 因此，Dapr 工作流可能不适合对延迟敏感的工作负载。 高延迟的预期来源包括：

- 持久化工作流状态时来自状态存储的延迟。
- 在对具有大量历史记录的工作流进行处理时，状态存储会产生延迟。
- 集群中活动提醒过多造成的延迟。
- 集群中的高 CPU 使用率导致的延迟。

请参阅[提醒使用和执行保证部分]({{< ref "workflow-architecture.md#reminder-usage-and-execution-guarantees" >}})，了解有关工作流 actor 的设计如何影响执行延迟的更多详情。

## 下一步

{{< button text="管理工作流程 >>" page="howto-author-workflow\.md" >}}

## 相关链接

- [Dapr概述]({{< ref workflow-overview\.md >}})
- [Workflow API 参考文档]({{< ref workflow_api.md >}})
- [尝试 Dapr 快速入门]({{< ref workflow-quickstart.md >}})
- 试用以下示例:
  - [Python](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow)
  - [JavaScript示例](https://github.com/dapr/js-sdk/tree/main/examples/workflow)
  - [.NET](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
  - [Java](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)
  - [Go示例](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)
