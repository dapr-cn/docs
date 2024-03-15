---
type: docs
title: 特性和概念
linkTitle: 特性和概念
weight: 2000
description: 了解有关 Dapr 工作流特性和概念的详细信息
---

{{% alert title="注意" color="primary" %}}
Dapr工作流目前处于beta阶段。 [查看已知限制 {{% dapr-latest-version cli="true" %}}]({{< ref "workflow-overview\.md#limitations" >}}).
{{% /alert %}}

现在，您已经在高级别上了解了 [工作流构建块]({{< ref workflow-overview\.md >}}) ，让我们深入探讨 Dapr 工作流引擎和 SDK 所包含的特性和概念。 Dapr 工作流暴露了几个核心特性和概念，这些特性和概念在所有支持的语言中都是通用的。

{{% alert title="注意" color="primary" %}}
有关工作流状态管理的更多信息，请参阅[工作流架构指南]({{< ref workflow-architecture.md >}})。
{{% /alert %}}

## Workflows

Dapr 工作流是您编写的函数，它定义了一系列按特定顺序执行的任务。 Dapr 工作流引擎负责任务的调度和执行，包括管理失败和重试。 如果托管工作流的应用跨多台计算机横向扩展，则工作流引擎还可以跨多台计算机对工作流及其任务的执行进行负载平衡。

工作流可以计划几种不同类型的任务，包括

- 执行自定义逻辑的[活动]({{< ref "workflow-features-concepts.md#workflow-activities" >}})
- [持久定时器]({{< ref "workflow-features-concepts.md#durable-timers" >}})用于将工作流程休眠一段任意长度的时间
- [子工作流]({{< ref "workflow-features-concepts.md#child-workflows" >}}) 用于将较大的工作流拆分成较小的部分
- [外部事件等待者]({{< ref "workflow-features-concepts.md#external-events" >}})用于阻塞工作流，直到它们接收到外部事件信号。 这些任务将在相应章节中详细介绍。

### 工作流标识

您定义的每个工作流都有一个类型名称，并且工作流的单独执行需要唯一的 _instance ID_。 工作流 Instance ID 可以由应用程序代码生成，这在工作流对应文档或作业等业务实体时非常有用，也可以是自动生成的 UUID。 工作流的实例ID对于调试和使用[Workflow APIs]({{< ref workflow_api.md >}})管理工作流非常有用。

在任何给定时间只能存在一个具有给定 ID 的工作流实例。 不过，如果一个工作流实例完成或失败，其 ID 可以被新的工作流实例重复使用。 但请注意，新的工作流实例会在配置的状态存储中有效取代旧的工作流实例。

### 工作流重播

Dapr Workflows通过使用一种称为[event sourcing](https://learn.microsoft.com/azure/architecture/patterns/event-sourcing)的技术来维护它们的执行状态。 工作流引擎不是将工作流的当前状态存储为快照，而是管理描述工作流已执行的各种步骤的历史记录事件的仅追加日志。 使用工作流 SDK 时，只要工作流 "等待 "计划任务的结果，这些历史事件就会自动存储。

当工作流 "等待/await" 预定任务时，它会从内存中卸载自己，直到任务完成。 任务完成后，工作流引擎会安排工作流函数再次运行。 第二个工作流函数执行称为一个 _replay_。

重播工作流函数时，它将从头开始再次运行。 但是，当它遇到已完成的任务时，工作流引擎不会再次计划该任务，而是：

1. 将已完成任务的存储结果返回给工作流。
2. 继续执行，直到下一个 "等待/await" 点。

此 “重播” 行为一直持续到工作流函数完成或失败并显示错误。

使用此重播技术，工作流能够从任何 “等待/await” 点恢复执行，就好像它从未从内存中卸载过一样。 甚至可以恢复以前运行的局部变量的值，而工作流引擎对这些变量存储的数据一无所知。 这种恢复状态的能力使 Dapr Workflows _持久性_ 和 _容错性_。

{{% alert title="注意" color="primary" %}}这里描述的工作流重播行为要求工作流函数代码是_确定性的_。 确定性工作流函数在提供完全相同的输入时会执行完全相同的操作。 [Learn more about the limitations around deterministic workflow code.]({{< ref "workflow-features-concepts.md#workflow-determinism-and-code-constraints" >}})
{{% /alert %}}

### 无限循环和永恒的工作流

如 [工作流重播]({{< ref "#workflow-replay" >}}) 部分所述，工作流维护其所有操作的只写事件源历史记录日志。 为避免资源使用失控，工作流必须限制其安排的操作数量。 例如，确保您的工作流程不会：

- 在其实现中使用无限循环
- 安排数千个任务。

您可以使用以下两种技术来编写可能需要安排大量任务的工作流：

1. **使用 _continue-as-new_ API**：
   每个工作流 SDK 都公开了 _continue-as-new_ API，工作流可调用该 API 以新的输入和历史记录重新启动。 _continue-as-new_ API 尤其适用于实现 "永恒的工作流"，如监控代理，否则就需要使用类似 `while (true)` 的结构来实现。 使用_continue-as-new_是保持工作流历史记录大小较小的好方法。

   > _continue-as-new_ API截断现有的历史记录，并用新的历史记录替换它。

2. **使用子工作流**：
   每个工作流 SDK 都提供用于创建子工作流的 API。 子工作流的行为与其他工作流类似，只是它是由父工作流调度的。 子工作流具有：
   - 他们自己的历史
   - 在多台机器上分散执行工作流函数的好处。
   如果一个工作流需要安排数千个或更多任务，建议将这些任务分配到子工作流中，这样就不会出现单个工作流历史记录过大的情况。

### 更新工作流代码

由于工作流长时间运行且持久，因此更新工作流代码时必须格外小心。 正如 [工作流确定性]({{< ref "#workflow-determinism-and-code-constraints" >}}) 限制部分所述，工作流代码必须是确定性的。 如果系统中有任何未完成的工作流实例，则对工作流代码的更新必须保留此确定性。 否则，工作流代码的更新可能会导致这些工作流下次执行时出现运行故障。

[查看已知限制]({{< ref "workflow-features-concepts.md#workflow-determinism-and-code-constraints" >}})

## 工作流活动

工作流活动是工作流中的基本工作单元，是在业务流程中编排的任务。 例如，您可以创建一个工作流来处理订单。 这些任务可能涉及检查库存、向客户收费和创建配送。 每项任务都是一项单独的活动。 这些活动可以串行执行，也可以并行执行，或两者结合执行。

与工作流不同的是，活动并不限制你在其中可以进行的工作类型。 活动经常用于进行网络调用或运行 CPU 密集型操作。 活动还可以将数据返回给工作流。

Dapr 工作流引擎保证每个被调用的活动作为工作流执行的一部分**至少执行一次**。 由于活动仅保证至少执行一次，因此建议尽可能将活动逻辑实现为幂等。

## 子工作流

除活动外，工作流可以将其他工作流安排为**子工作流**。 子工作流具有自己的实例 ID、历史记录和状态，独立于启动它的父工作流。

子工作流具有许多优点：

- 您可以将大型工作流拆分为一系列较小的子工作流，从而使代码更易于维护。
- 可以同时跨多个计算节点分布工作流逻辑，这在工作流逻辑需要协调大量任务时非常有用。
- 通过减少父工作流的历史记录，可以减少内存使用量和 CPU 开销。

子工作流的返回值是其输出。 如果子工作流失败并出现异常，则该异常将呈现给父工作流，就像活动任务因异常而失败一样。 子工作流还支持自动重试策略。

终止父工作流将终止工作流实例创建的所有子工作流。 查看更多信息，请参阅[终止工作流 API]({{< ref "workflow_api.md#terminate-workflow-request" >}})。

## 持久计时器

Dapr 工作流程允许您为任何时间范围（包括分钟、天甚至年）安排类似提醒的持久性延迟。 这些 _持久定时器_ 可由工作流调度，以实现简单的延迟或在其他异步任务上设置临时超时。 更具体地说，可以将持久计时器设置为在特定日期或指定持续时间之后触发。 持久计时器的最长持续时间没有限制，这些计时器由内部 actor 提醒器在内部提供支持。 例如，跟踪 30 天免费订阅服务的工作流可以使用持久定时器来实现，该定时器在工作流创建 30 天后触发。 在等待持久计时器启动时，工作流程可以安全地从内存中卸载。

{{% alert title="Note" color="primary" %}}
工作流创作 SDK 中的某些 API 可能会在内部安排持久计时器，以实现内部超时行为。
{{% /alert %}}

## 重试策略

工作流支持活动和子工作流的持久重试策略。 工作流重试策略与[Dapr弹性策略]({{< ref "resiliency-overview\.md" >}})在以下方面是独立和不同的。

- 工作流重试策略由工作流作者在代码中配置，而 Dapr 弹性策略则由应用运维人员在 YAML 中配置。
- 工作流重试策略是持久的，可在应用程序重启时保持状态，而 Dapr 弹性策略不是持久的，必须在应用程序重启后重新应用。
- 工作流重试策略由活动和子工作流中未处理的错误/异常触发，而 Dapr 弹性策略则由操作超时和连接故障触发。

重试在内部使用持久计时器实现。 这意味着，在等待重试启动时，工作流可以安全地从内存中卸载，从而节省系统资源。 这也意味着重试之间的延迟时间可以很长，包括几分钟、几小时甚至几天。

{{% alert title="注意" color="primary" %}}重试策略执行的操作会保存到工作流的历史记录中。 在工作流已执行后，必须注意不要更改重试策略的行为。 否则，工作流在重放时可能会出现意外行为。 查看有关[更新工作流代码]({{< ref "#updating-workflow-code" >}})的说明，获取更多信息。
{{% /alert %}}

可以同时使用工作流重试策略和 Dapr 弹性策略。 例如，如果工作流活动使用 Dapr 客户端调用服务，Dapr 客户端就会使用已配置的弹性策略。 查看[快速入门：服务到服务弹性能力]({{< ref "#resiliency-serviceinvo-quickstart" >}})了解更多信息和示例。  但是，如果活动本身因任何原因失败，包括用尽了弹性策略的重试次数，那么工作流的弹性策略就会启动。

{{% alert title="Note" color="primary" %}}
同时使用工作流重试策略和弹性策略可能会导致意外行为。 例如，如果工作流活动用尽了其配置的重试策略，工作流引擎仍会根据工作流重试策略重试该活动。 这可能导致活动重试次数超过预期。
{{% /alert %}}

由于工作流重试策略是在代码中配置的，开发人员的具体体验可能会因工作流 SDK 版本的不同而有所差异。 通常，可以使用以下参数配置工作流重试策略。

| Parameter   | 说明                     |
| ----------- | ---------------------- |
| **最大尝试次数**  | 执行活动或子工作流的最大次数。        |
| **第一次重试间隔** | 第一次重试前的等待时间。           |
| **回退系数**    | 每次后续重试之前等待的时间。         |
| **最大重试间隔**  | 每次后续重试之前等待的最长时间。       |
| **重试超时**    | 重试的总超时时间，与配置的最大尝试次数无关。 |

## 外部事件

有时，工作流需要等待外部系统引发的事件。 例如，如果总成本超过某个阈值，审批工作流可能要求在订单处理工作流中明确人工审批订单请求。 另一个例子是小游戏协调工作流，在等待所有参与者提交小问题答案时会暂停。 这些执行中期输入被称为_外部事件_。

外部事件具有 _名字（name）_ 和 _有效载荷（payload）_ 并传递到单个工作流实例。 工作流可以创建"_等待外部事件_"任务，这些任务订阅外部事件并_等待_直到收到事件以阻止执行。 然后，工作流可以读取这些事件的有效负载，并决定要执行哪些后续步骤。 外部事件可以串行或并行处理。 外部事件可由其他工作流或工作流代码引发。

工作流也可以等待多个同名的外部事件信号，在这种情况下，它们会以先进先出（FIFO）的方式被分派给相应的工作流任务。 如果工作流接收到外部事件信号，但尚未创建 "等待外部事件" 任务，则事件将保存到工作流的历史记录中，并在工作流请求事件后立即消费。

了解更多关于[外部系统交互。]({{< ref "workflow-patterns.md#external-system-interaction" >}})

## Workflow backend

Dapr Workflow 依赖于 Durable Task Framework for Go（也称为 [durabletask-go](https://github.com/microsoft/durabletask-go))作为执行工作流的核心引擎。 该引擎旨在支持多个后端实现。 例如，[durabletask-go](https://github.com/microsoft/durabletask-go) 仓库包含了一个 SQLite 实现，而 Dapr 仓库包含了一个 Actors 实现。

默认情况下，Dapr Workflow 支持 Actors 后端，该后端稳定且可扩展。 然而，在Dapr工作流中，你可以选择一个不同的后端来支持。 例如，[SQLite](https://github.com/microsoft/durabletask-go/tree/main/backend/sqlite)(TBD 未来发布) 可以作为本地开发和测试的后端选项。

后端实现在很大程度上与工作流核心引擎或您所看到的编程模型解耦。 后端主要影响的是：

- 工作流状态是如何存储的
- 如何在多个副本之间协调工作流执行

在这个意义上，它类似于Dapr的状态存储抽象，只是专门设计用于工作流。 所有的API和编程模型功能都是相同的，无论使用哪个后端。

## 清除

工作流状态可以从状态存储中清除，清除所有与特定工作流实例相关的历史记录和元数据。 清除功能用于已运行到“完成”，“失败”或“终止”状态的工作流程。

在[工作流 API 参考]({{< ref workflow_api.md >}})中了解更多信息。

## 局限性

### 工作流确定性和代码限制

要利用工作流重播技术，工作流代码必须具有确定性。 为了使工作流代码具有确定性，可能需要解决一些限制。

#### 工作流函数必须调用确定性 API。

生成随机数、随机 UUID 或当前日期的 API 是_非确定性_。 要解决此限制，您可以：

- 在活动函数中使用这些 API，或
- (首选）使用 SDK 提供的内置等效 API。 例如，每个创作 SDK 都提供 API，用于以确定的方式检索当前时间。

例如，可以用以下方式代替



{{% codetab %}}

```csharp
// DON'T DO THIS!
DateTime currentTime = DateTime.UtcNow;
Guid newIdentifier = Guid.NewGuid();
string randomString = GetRandomString();
```



{{% codetab %}}

```java
// DON'T DO THIS!
Instant currentTime = Instant.now();
UUID newIdentifier = UUID.randomUUID();
string randomString = GetRandomString();
```



{{% codetab %}}

```javascript
// DON'T DO THIS!
const currentTime = new Date();
const newIdentifier = uuidv4();
const randomString = getRandomString();
```



{{% codetab %}}

```go
// DON'T DO THIS!
const currentTime = time.Now()
```



{{< /tabs >}}

这样做：



{{% codetab %}}

```csharp
// Do this!!
DateTime currentTime = context.CurrentUtcDateTime;
Guid newIdentifier = context.NewGuid();
string randomString = await context.CallActivityAsync<string>("GetRandomString");
```



{{% codetab %}}

```java
// Do this!!
Instant currentTime = context.getCurrentInstant();
Guid newIdentifier = context.NewGuid();
String randomString = context.callActivity(GetRandomString.class.getName(), String.class).await();
```



{{% codetab %}}

```javascript
// Do this!!
const currentTime = context.getCurrentUtcDateTime();
const randomString = yield context.callActivity(getRandomString);
```



{{% codetab %}}

```go
const currentTime = ctx.CurrentUTCDateTime()
```



{{< /tabs >}}

#### 工作流函数只能与外部状态 _间接_ 交互。

外部数据包括未存储在工作流状态中的任何数据。 工作流不得与全局变量、环境变量、文件系统交互，也不得进行网络调用。

相反，工作流应通过工作流输入、活动任务和通过外部事件处理 _间接地_ 与外部状态交互。

例如，可以用以下方式代替



{{% codetab %}}

```csharp
// DON'T DO THIS!
string configuration = Environment.GetEnvironmentVariable("MY_CONFIGURATION")!;
string data = await new HttpClient().GetStringAsync("https://example.com/api/data");
```



{{% codetab %}}

```java
// DON'T DO THIS!
String configuration = System.getenv("MY_CONFIGURATION");

HttpRequest request = HttpRequest.newBuilder().uri(new URI("https://postman-echo.com/post")).GET().build();
HttpResponse<String> response = HttpClient.newBuilder().build().send(request, HttpResponse.BodyHandlers.ofString());
```



{{% codetab %}}

```javascript
// DON'T DO THIS!
// Accessing an Environment Variable (Node.js)
const configuration = process.env.MY_CONFIGURATION;

fetch('https://postman-echo.com/get')
  .then(response => response.text())
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```



{{% codetab %}}

```go
// DON'T DO THIS!
resp, err := http.Get("http://example.com/api/data")
```



{{< /tabs >}}

这样做：



{{% codetab %}}

```csharp
// Do this!!
string configuation = workflowInput.Configuration; // imaginary workflow input argument
string data = await context.CallActivityAsync<string>("MakeHttpCall", "https://example.com/api/data");
```



{{% codetab %}}

```java
// Do this!!
String configuation = ctx.getInput(InputType.class).getConfiguration(); // imaginary workflow input argument
String data = ctx.callActivity(MakeHttpCall.class, "https://example.com/api/data", String.class).await();
```



{{% codetab %}}

```javascript
// Do this!!
const configuation = workflowInput.getConfiguration(); // imaginary workflow input argument
const data = yield ctx.callActivity(makeHttpCall, "https://example.com/api/data");
```



{{% codetab %}}

```go
// Do this!!
err := ctx.CallActivity(MakeHttpCallActivity, workflow.ActivityInput("https://example.com/api/data")).Await(&output)

```



####

每种语言 SDK 的实现都要求所有函数操作在同一线程（goroutine 等）上运行。 该功能已安排。 工作流函数不得：

- 安排后台线程，或
- 使用调度回调函数在另一个线程上运行的 API。

不遵守此规则可能会导致未定义的行为。 任何后台处理都应委托给活动任务，活动任务可按计划串行或并行运行。

例如，可以用以下方式代替



{{% codetab %}}

```csharp
// DON'T DO THIS!
Task t = Task.Run(() => context.CallActivityAsync("DoSomething"));
await context.CreateTimer(5000).ConfigureAwait(false);
```



{{% codetab %}}

```java
// DON'T DO THIS!
new Thread(() -> {
    ctx.callActivity(DoSomethingActivity.class.getName()).await();
}).start();
ctx.createTimer(Duration.ofSeconds(5)).await();
```



{{% codetab %}}

不要将JavaScript工作流声明为`async`。 Node.js运行时不保证异步函数是确定性的。



{{% codetab %}}

```go
// DON'T DO THIS!
go func() {
  err := ctx.CallActivity(DoSomething).Await(nil)
}()
err := ctx.CreateTimer(time.Second).Await(nil)
```



{{< /tabs >}}

这样做：



{{% codetab %}}

```csharp
// Do this!!
Task t = context.CallActivityAsync("DoSomething");
await context.CreateTimer(5000).ConfigureAwait(true);
```



{{% codetab %}}

```java
// Do this!!
ctx.callActivity(DoSomethingActivity.class.getName()).await();
ctx.createTimer(Duration.ofSeconds(5)).await();
```



{{% codetab %}}

由于Node.js运行时不能保证异步函数是确定性的，所以始终将JavaScript工作流声明为同步生成器函数。



{{% codetab %}}

```go
// Do this!
task := ctx.CallActivity(DoSomething)
task.Await(nil)
```



{{< /tabs >}}

### 更新工作流代码

确保对工作流代码的更新能保持其确定性。 几个可能破坏工作流确定性的代码更新示例：

- **更改工作流函数签名**：
  更改工作流或活动函数的名称、输入或输出被视为破坏性更改，必须避免。

- **更改工作流任务的数量或顺序**：
  更改工作流任务的数量或顺序会导致工作流实例的历史记录与代码不再匹配，并可能导致运行时错误或其他意外行为。

为了解决这些制约因素：

- 不要更新现有工作流代码，而是保持现有工作流代码不变，并创建包含更新的新工作流定义。
- 创建工作流的上游代码应更新为仅创建新工作流的实例。
- 保留旧代码，以确保现有工作流实例可以继续运行而不会中断。 如果已知旧工作流逻辑的所有实例都已完成，则可以安全地删除旧工作流代码。

## 下一步

{{< button text="工作流模式 >>" page="workflow-patterns.md" >}}

## 相关链接

- [尝试使用快速入门来体验 Dapr 工作流]({{< ref workflow-quickstart.md >}})
- [Dapr概述]({{< ref workflow-overview\.md >}})
- [Workflow API 参考文档]({{< ref workflow_api.md >}})
- 试用以下示例:
  - [Python](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow)
  - [JavaScript](https://github.com/dapr/js-sdk/tree/main/examples/workflow)
  - [.NET](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
  - [Java](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)
  - [Go](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)
