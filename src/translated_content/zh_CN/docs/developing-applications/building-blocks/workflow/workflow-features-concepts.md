---
type: docs
title: "功能和概念"
linkTitle: "功能和概念"
weight: 2000
description: "详细了解 Dapr 工作流的功能和概念"
---

在您已经从高层次了解了[工作流构建块]({{< ref workflow-overview.md >}})之后，让我们深入探讨 Dapr 工作流引擎和 SDK 所包含的功能和概念。Dapr 工作流在所有支持的语言中都提供了几个核心功能和概念。

{{% alert title="注意" color="primary" %}}
有关工作流状态管理的更多信息，请参阅[工作流架构指南]({{< ref workflow-architecture.md >}})。
{{% /alert %}}

## 工作流

Dapr 工作流是您编写的函数，用于定义一系列按特定顺序执行的任务。Dapr 工作流引擎负责调度和执行这些任务，包括管理故障和重试。如果托管工作流的应用程序在多台机器上扩展，工作流引擎还可以在多台机器上负载均衡工作流及其任务的执行。

工作流可以调度多种类型的任务，包括：
- 用于执行自定义逻辑的[活动]({{< ref "workflow-features-concepts.md#workflow-activities" >}})
- 用于将工作流休眠任意时间长度的[持久计时器]({{< ref "workflow-features-concepts.md#durable-timers" >}})
- 用于将较大的工作流分解为较小部分的[子工作流]({{< ref "workflow-features-concepts.md#child-workflows" >}})
- 用于阻塞工作流直到接收到外部事件信号的[外部事件等待器]({{< ref "workflow-features-concepts.md#external-events" >}})。这些任务在其相应的部分中有更详细的描述。

### 工作流标识

每个您定义的工作流都有一个类型名称，工作流的每次执行都需要一个唯一的_实例 ID_。工作流实例 ID 可以由您的应用程序代码生成，这在工作流对应于业务实体（如文档或作业）时很有用，或者可以是自动生成的 UUID。工作流的实例 ID 对于调试以及使用[工作流 API]({{< ref workflow_api.md >}})管理工作流非常有用。

在任何给定时间，只能存在一个具有给定 ID 的工作流实例。然而，如果一个工作流实例完成或失败，其 ID 可以被新的工作流实例重用。但请注意，新工作流实例实际上会在配置的状态存储中替换旧的实例。

### 工作流重放

Dapr 工作流通过使用一种称为[事件溯源](https://learn.microsoft.com/azure/architecture/patterns/event-sourcing)的技术来维护其执行状态。工作流引擎不是将工作流的当前状态存储为快照，而是管理一个仅追加的历史事件日志，描述工作流所采取的各种步骤。当使用工作流 SDK 时，这些历史事件会在工作流“等待”计划任务的结果时自动存储。

当工作流“等待”计划任务时，它会从内存中卸载自己，直到任务完成。一旦任务完成，工作流引擎会再次调度工作流函数运行。此时的工作流函数执行被称为_重放_。

当工作流函数被重放时，它会从头开始再次运行。然而，当它遇到已经完成的任务时，工作流引擎不会再次调度该任务，而是：

1. 将已完成任务的存储结果返回给工作流。
1. 继续执行直到下一个“等待”点。

这种“重放”行为会持续到工作流函数完成或因错误而失败。

通过这种重放技术，工作流能够从任何“等待”点恢复执行，就像它从未从内存中卸载过一样。即使是先前运行的局部变量的值也可以恢复，而无需工作流引擎了解它们存储了什么数据。这种恢复状态的能力使 Dapr 工作流具有_持久性_和_容错性_。

{{% alert title="注意" color="primary" %}}
这里描述的工作流重放行为要求工作流函数代码是_确定性的_。确定性的工作流函数在提供完全相同的输入时采取完全相同的操作。[了解有关确定性工作流代码限制的更多信息。]({{< ref "workflow-features-concepts.md#workflow-determinism-and-code-restraints" >}})
{{% /alert %}}

### 无限循环和永恒工作流

如[工作流重放]({{< ref "#workflow-replay" >}})部分所述，工作流维护其所有操作的仅写事件溯源历史日志。为了避免资源使用失控，工作流必须限制其调度的操作数量。例如，确保您的工作流不会：

- 在其实现中使用无限循环
- 调度数千个任务。

您可以使用以下两种技术来编写可能需要调度极大量任务的工作流：

1. **使用 _continue-as-new_ API**：  
    每个工作流 SDK 都公开了一个 _continue-as-new_ API，工作流可以调用该 API 以使用新的输入和历史记录重新启动自己。_continue-as-new_ API 特别适合实现“永恒工作流”，如监控代理，否则将使用 `while (true)` 类构造实现。使用 _continue-as-new_ 是保持工作流历史记录小的好方法。
   
    > _continue-as-new_ API 会截断现有历史记录，并用新的历史记录替换它。

1. **使用子工作流**：  
    每个工作流 SDK 都公开了一个用于创建子工作流的 API。子工作流的行为与任何其他工作流相同，只是它由父工作流调度。子工作流具有：
    - 自己的历史记录
    - 在多台机器上分布工作流函数执行的好处。
    
    如果一个工作流需要调度数千个或更多任务，建议将这些任务分布在子工作流中，以免单个工作流的历史记录大小过大。

### 更新工作流代码

由于工作流是长时间运行且持久的，因此更新工作流代码必须非常小心。如[工作流确定性]({{< ref "#workflow-determinism-and-code-restraints" >}})限制部分所述，工作流代码必须是确定性的。如果系统中有任何未完成的工作流实例，更新工作流代码必须保留这种确定性。否则，更新工作流代码可能会导致下次这些工作流执行时出现运行时故障。

[查看已知限制]({{< ref "#limitations" >}})

## 工作流活动

工作流活动是工作流中的基本工作单元，是在业务流程中被编排的任务。例如，您可能会创建一个工作流来处理订单。任务可能涉及检查库存、向客户收费和创建发货。每个任务将是一个单独的活动。这些活动可以串行执行、并行执行或两者的某种组合。

与工作流不同，活动在您可以在其中执行的工作类型上没有限制。活动经常用于进行网络调用或运行 CPU 密集型操作。活动还可以将数据返回给工作流。

Dapr 工作流引擎保证每个被调用的活动在工作流的执行过程中至少执行一次。由于活动仅保证至少一次执行，建议尽可能将活动逻辑实现为幂等。

## 子工作流

除了活动之外，工作流还可以调度其他工作流作为_子工作流_。子工作流具有独立于启动它的父工作流的实例 ID、历史记录和状态。

子工作流有许多好处：

* 您可以将大型工作流拆分为一系列较小的子工作流，使您的代码更易于维护。
* 您可以在多个计算节点上同时分布工作流逻辑，这在您的工作流逻辑需要协调大量任务时很有用。
* 您可以通过保持父工作流的历史记录较小来减少内存使用和 CPU 开销。

子工作流的返回值是其输出。如果子工作流因异常而失败，则该异常会像活动任务失败时一样显示给父工作流。子工作流还支持自动重试策略。

终止父工作流会终止由工作流实例创建的所有子工作流。有关更多信息，请参阅[终止工作流 API]({{< ref "workflow_api.md#terminate-workflow-request" >}})。

## 持久计时器

Dapr 工作流允许您为任何时间范围安排类似提醒的持久延迟，包括分钟、天甚至年。这些_持久计时器_可以由工作流安排以实现简单的延迟或为其他异步任务设置临时超时。更具体地说，持久计时器可以设置为在特定日期触发或在指定持续时间后触发。持久计时器的最大持续时间没有限制，它们在内部由内部 actor 提醒支持。例如，跟踪服务 30 天免费订阅的工作流可以使用在工作流创建后 30 天触发的持久计时器实现。工作流在等待持久计时器触发时可以安全地从内存中卸载。

{{% alert title="注意" color="primary" %}}
工作流创作 SDK 中的一些 API 可能会在内部安排持久计时器以实现内部超时行为。
{{% /alert %}}

## 重试策略

工作流支持活动和子工作流的持久重试策略。工作流重试策略与[Dapr 弹性策略]({{< ref "resiliency-overview.md" >}})在以下方面是分开的和不同的。

- 工作流重试策略由工作流作者在代码中配置，而 Dapr 弹性策略由应用程序操作员在 YAML 中配置。
- 工作流重试策略是持久的，并在应用程序重启时保持其状态，而 Dapr 弹性策略不是持久的，必须在应用程序重启后重新应用。
- 工作流重试策略由活动和子工作流中的未处理错误/异常触发，而 Dapr 弹性策略由操作超时和连接故障触发。

重试在内部使用持久计时器实现。这意味着工作流在等待重试触发时可以安全地从内存中卸载，从而节省系统资源。这也意味着重试之间的延迟可以任意长，包括分钟、小时甚至天。

{{% alert title="注意" color="primary" %}}
重试策略执行的操作会保存到工作流的历史记录中。在工作流已经执行后，必须小心不要更改重试策略的行为。否则，工作流在重放时可能会表现出意外行为。有关更多信息，请参阅[更新工作流代码]({{< ref "#updating-workflow-code" >}})的说明。
{{% /alert %}}

可以同时使用工作流重试策略和 Dapr 弹性策略。例如，如果工作流活动使用 Dapr 客户端调用服务，则 Dapr 客户端使用配置的弹性策略。有关示例的更多信息，请参阅[快速入门：服务到服务的弹性]({{< ref "resiliency-serviceinvo-quickstart.md" >}})。但是，如果活动本身因任何原因失败，包括耗尽弹性策略的重试次数，则工作流的弹性策略会启动。

{{% alert title="注意" color="primary" %}}
同时使用工作流重试策略和弹性策略可能会导致意外行为。例如，如果工作流活动耗尽其配置的重试策略，工作流引擎仍会根据工作流重试策略重试该活动。这可能导致活动被重试的次数超过预期。
{{% /alert %}}

由于工作流重试策略是在代码中配置的，因此具体的开发者体验可能会因工作流 SDK 的版本而异。通常，工作流重试策略可以通过以下参数进行配置。

| 参数 | 描述 |
| --- | --- |
| **最大尝试次数** | 执行活动或子工作流的最大次数。 |
| **首次重试间隔** | 第一次重试前的等待时间。 |
| **退避系数** | 用于确定退避增长率的系数。例如，系数为 2 会使每次后续重试的等待时间加倍。 |
| **最大重试间隔** | 每次后续重试前的最大等待时间。 |
| **重试超时** | 重试的总体超时，无论配置的最大尝试次数如何。 |

## 外部事件

有时工作流需要等待由外部系统引发的事件。例如，如果订单处理工作流中的总成本超过某个阈值，审批工作流可能需要人类明确批准订单请求。另一个例子是一个问答游戏编排工作流，它在等待所有参与者提交他们对问答问题的答案时暂停。这些中间执行输入被称为_外部事件_。

外部事件具有_名称_和_负载_，并传递给单个工作流实例。工作流可以创建“_等待外部事件_”任务，订阅外部事件并_等待_这些任务以阻止执行，直到接收到事件。然后，工作流可以读取这些事件的负载，并决定采取哪些下一步。外部事件可以串行或并行处理。外部事件可以由其他工作流或工作流代码引发。

工作流还可以等待同名的多个外部事件信号，在这种情况下，它们会以先进先出 (FIFO) 的方式分派给相应的工作流任务。如果工作流接收到外部事件信号，但尚未创建“等待外部事件”任务，则事件将保存到工作流的历史记录中，并在工作流请求事件后立即消费。

了解有关[外部系统交互]({{< ref "workflow-patterns.md#external-system-interaction" >}})的更多信息。

## 工作流后端

Dapr 工作流依赖于 Go 的持久任务框架（即 [durabletask-go](https://github.com/microsoft/durabletask-go)）作为执行工作流的核心引擎。该引擎设计为支持多种后端实现。例如，[durabletask-go](https://github.com/microsoft/durabletask-go) 仓库包括一个 SQLite 实现，Dapr 仓库包括一个 actor 实现。

默认情况下，Dapr 工作流支持 actor 后端，该后端稳定且可扩展。然而，您可以选择 Dapr 工作流中支持的其他后端。例如，[SQLite](https://github.com/microsoft/durabletask-go/tree/main/backend/sqlite)（待定未来版本）可以是本地开发和测试的后端选项。

后端实现在很大程度上与您看到的工作流核心引擎或编程模型解耦。后端主要影响：
- 如何存储工作流状态
- 如何在副本之间协调工作流执行

从这个意义上说，它类似于 Dapr 的状态存储抽象，但专为工作流设计。无论使用哪个后端，所有 API 和编程模型功能都是相同的。

## 清除

工作流状态可以从状态存储中清除，清除其所有历史记录并删除与特定工作流实例相关的所有元数据。清除功能用于已运行到 `COMPLETED`、`FAILED` 或 `TERMINATED` 状态的工作流。

在[工作流 API 参考指南]({{< ref workflow_api.md >}})中了解更多信息。

## 限制

### 工作流确定性和代码限制

为了利用工作流重放技术，您的工作流代码需要是确定性的。为了使您的工作流代码确定性，您可能需要绕过一些限制。

#### 工作流函数必须调用确定性 API。
生成随机数、随机 UUID 或当前日期的 API 是_非确定性_的。要解决此限制，您可以：
 - 在活动函数中使用这些 API，或
 - （首选）使用 SDK 提供的内置等效 API。例如，每个创作 SDK 都提供了一个以确定性方式检索当前时间的 API。

例如，不要这样做：

{{< tabs ".NET" Java JavaScript Go >}}

{{% codetab %}}

```csharp
// 不要这样做！
DateTime currentTime = DateTime.UtcNow;
Guid newIdentifier = Guid.NewGuid();
string randomString = GetRandomString();
```

{{% /codetab %}}

{{% codetab %}}

```java
// 不要这样做！
Instant currentTime = Instant.now();
UUID newIdentifier = UUID.randomUUID();
String randomString = getRandomString();
```

{{% /codetab %}}

{{% codetab %}}

```javascript
// 不要这样做！
const currentTime = new Date();
const newIdentifier = uuidv4();
const randomString = getRandomString();
```

{{% /codetab %}}

{{% codetab %}}

```go
// 不要这样做！
const currentTime = time.Now()
```

{{% /codetab %}}

{{< /tabs >}}

这样做：

{{< tabs ".NET" Java JavaScript Go >}}

{{% codetab %}}

```csharp
// 这样做！！
DateTime currentTime = context.CurrentUtcDateTime;
Guid newIdentifier = context.NewGuid();
string randomString = await context.CallActivityAsync<string>("GetRandomString");
```

{{% /codetab %}}

{{% codetab %}}

```java
// 这样做！！
Instant currentTime = context.getCurrentInstant();
Guid newIdentifier = context.newGuid();
String randomString = context.callActivity(GetRandomString.class.getName(), String.class).await();
```

{{% /codetab %}}

{{% codetab %}}

```javascript
// 这样做！！
const currentTime = context.getCurrentUtcDateTime();
const randomString = yield context.callActivity(getRandomString);
```

{{% /codetab %}}

{{% codetab %}}

```go
const currentTime = ctx.CurrentUTCDateTime()
```

{{% /codetab %}}

{{< /tabs >}}

#### 工作流函数必须仅_间接_与外部状态交互。
外部数据包括任何不存储在工作流状态中的数据。工作流不得与全局变量、环境变量、文件系统交互或进行网络调用。

相反，工作流应通过工作流输入、活动任务和外部事件处理_间接_与外部状态交互。

例如，不要这样做：

{{< tabs ".NET" Java JavaScript Go >}}

{{% codetab %}}

```csharp
// 不要这样做！
string configuration = Environment.GetEnvironmentVariable("MY_CONFIGURATION")!;
string data = await new HttpClient().GetStringAsync("https://example.com/api/data");
```
{{% /codetab %}}

{{% codetab %}}

```java
// 不要这样做！
String configuration = System.getenv("MY_CONFIGURATION");

HttpRequest request = HttpRequest.newBuilder().uri(new URI("https://postman-echo.com/post")).GET().build();
HttpResponse<String> response = HttpClient.newBuilder().build().send(request, HttpResponse.BodyHandlers.ofString());
```

{{% /codetab %}}

{{% codetab %}}

```javascript
// 不要这样做！
// 访问环境变量（Node.js）
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

{{% /codetab %}}

{{% codetab %}}

```go
// 不要这样做！
resp, err := http.Get("http://example.com/api/data")
```

{{% /codetab %}}

{{< /tabs >}}

这样做：

{{< tabs ".NET" Java JavaScript Go >}}

{{% codetab %}}

```csharp
// 这样做！！
string configuration = workflowInput.Configuration; // 假想的工作流输入参数
string data = await context.CallActivityAsync<string>("MakeHttpCall", "https://example.com/api/data");
```

{{% /codetab %}}

{{% codetab %}}

```java
// 这样做！！
String configuration = ctx.getInput(InputType.class).getConfiguration(); // 假想的工作流输入参数
String data = ctx.callActivity(MakeHttpCall.class, "https://example.com/api/data", String.class).await();
```

{{% /codetab %}}

{{% codetab %}}

```javascript
// 这样做！！
const configuration = workflowInput.getConfiguration(); // 假想的工作流输入参数
const data = yield ctx.callActivity(makeHttpCall, "https://example.com/api/data");
```

{{% /codetab %}}

{{% codetab %}}

```go
// 这样做！！
err := ctx.CallActivity(MakeHttpCallActivity, workflow.ActivityInput("https://example.com/api/data")).Await(&output)

```

{{% /codetab %}}
{{< /tabs >}}

#### 工作流函数必须仅在工作流调度线程上执行。
每种语言 SDK 的实现要求所有工作流函数操作在函数被调度的同一线程（goroutine 等）上运行。工作流函数绝不能：
- 调度后台线程，或
- 使用调度回调函数在另一个线程上运行的 API。

不遵循此规则可能导致未定义的行为。任何后台处理都应委托给活动任务，这些任务可以串行或并行调度运行。

例如，不要这样做：

{{< tabs ".NET" Java JavaScript Go >}}

{{% codetab %}}

```csharp
// 不要这样做！
Task t = Task.Run(() => context.CallActivityAsync("DoSomething"));
await context.CreateTimer(5000).ConfigureAwait(false);
```
{{% /codetab %}}

{{% codetab %}}

```java
// 不要这样做！
new Thread(() -> {
    ctx.callActivity(DoSomethingActivity.class.getName()).await();
}).start();
ctx.createTimer(Duration.ofSeconds(5)).await();
```

{{% /codetab %}}

{{% codetab %}}

不要将 JavaScript 工作流声明为 `async`。Node.js 运行时不保证异步函数是确定性的。

{{% /codetab %}}

{{% codetab %}}

```go
// 不要这样做！
go func() {
  err := ctx.CallActivity(DoSomething).Await(nil)
}()
err := ctx.CreateTimer(time.Second).Await(nil)
```

{{% /codetab %}}

{{< /tabs >}}

这样做：

{{< tabs ".NET" Java JavaScript Go >}}

{{% codetab %}}

```csharp
// 这样做！！
Task t = context.CallActivityAsync("DoSomething");
await context.CreateTimer(5000).ConfigureAwait(true);
```

{{% /codetab %}}

{{% codetab %}}

```java
// 这样做！！
ctx.callActivity(DoSomethingActivity.class.getName()).await();
ctx.createTimer(Duration.ofSeconds(5)).await();
```

{{% /codetab %}}

{{% codetab %}}

由于 Node.js 运行时不保证异步函数是确定性的，因此始终将 JavaScript 工作流声明为同步生成器函数。

{{% /codetab %}}

{{% codetab %}}

```go
// 这样做！
task := ctx.CallActivity(DoSomething)
task.Await(nil)
```

{{% /codetab %}}

{{< /tabs >}}

### 更新工作流代码

确保您对工作流代码所做的更新保持其确定性。以下是可能破坏工作流确定性的代码更新示例：

- **更改工作流函数签名**：  
   更改工作流或活动函数的名称、输入或输出被视为重大更改，必须避免。

- **更改工作流任务的数量或顺序**：   
   更改工作流任务的数量或顺序会导致工作流实例的历史记录不再与代码匹配，可能导致运行时错误或其他意外行为。

要解决这些限制：

- 不要更新现有工作流代码，而是保持现有工作流代码不变，并创建包含更新的新工作流定义。
- 上游创建工作流的代码应仅更新以创建新工作流的实例。
- 保留旧代码以确保现有工作流实例可以继续运行而不受干扰。如果已知旧工作流逻辑的所有实例都已完成，则可以安全地删除旧工作流代码。

## 下一步

{{< button text="工作流模式 >>" page="workflow-patterns.md" >}}

## 相关链接

- [使用快速入门尝试 Dapr 工作流]({{< ref workflow-quickstart.md >}})
- [工作流概述]({{< ref workflow-overview.md >}})
- [工作流 API 参考]({{< ref workflow_api.md >}})
- 尝试以下示例：
   - [Python](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow)
   - [JavaScript](https://github.com/dapr/js-sdk/tree/main/examples/workflow)
   - [.NET](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
   - [Java](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)
   - [Go](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)
