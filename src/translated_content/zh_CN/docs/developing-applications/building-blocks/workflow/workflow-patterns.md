---
type: docs
title: 工作流模式
linkTitle: 工作流模式
weight: 3000
description: "编写不同类型的工作流模式"
---

Dapr 工作流简化了微服务架构中复杂且有状态的协调需求。以下部分描述了几种可以从 Dapr 工作流中受益的应用程序模式。

## 任务链

在任务链模式中，工作流中的多个步骤按顺序运行，一个步骤的输出可以作为下一个步骤的输入。任务链工作流通常涉及创建一系列需要对某些数据执行的操作，例如过滤、转换和归约。

<img src="/images/workflow-overview/workflows-chaining.png" width=800 alt="显示任务链工作流模式如何工作的图示">

在某些情况下，工作流的步骤可能需要在多个微服务之间进行协调。为了提高可靠性和可扩展性，您还可能使用队列来触发各个步骤。

虽然模式简单，但实现中隐藏了许多复杂性。例如：

- 如果某个微服务长时间不可用，会发生什么？
- 可以自动重试失败的步骤吗？
- 如果不能，如何促进先前完成步骤的回滚（如果适用）？
- 除了实现细节之外，是否有办法可视化工作流，以便其他工程师可以理解它的作用和工作原理？

Dapr 工作流通过允许您在所选编程语言中将任务链模式简洁地实现为简单函数来解决这些复杂性，如以下示例所示。

{{< tabs Python JavaScript ".NET" Java Go >}}

{{% codetab %}}
<!--python-->

```python
import dapr.ext.workflow as wf


def task_chain_workflow(ctx: wf.DaprWorkflowContext, wf_input: int):
    try:
        result1 = yield ctx.call_activity(step1, input=wf_input)
        result2 = yield ctx.call_activity(step2, input=result1)
        result3 = yield ctx.call_activity(step3, input=result2)
    except Exception as e:
        yield ctx.call_activity(error_handler, input=str(e))
        raise
    return [result1, result2, result3]


def step1(ctx, activity_input):
    print(f'步骤 1: 接收到输入: {activity_input}.')
    # 执行一些操作
    return activity_input + 1


def step2(ctx, activity_input):
    print(f'步骤 2: 接收到输入: {activity_input}.')
    # 执行一些操作
    return activity_input * 2


def step3(ctx, activity_input):
    print(f'步骤 3: 接收到输入: {activity_input}.')
    # 执行一些操作
    return activity_input ^ 2


def error_handler(ctx, error):
    print(f'执行错误处理程序: {error}.')
    # 执行一些补偿操作
```

> **注意** 工作流重试策略将在 Python SDK 的未来版本中提供。

{{% /codetab %}}

{{% codetab %}}
<!--javascript-->

```javascript
import { DaprWorkflowClient, WorkflowActivityContext, WorkflowContext, WorkflowRuntime, TWorkflow } from "@dapr/dapr";

async function start() {
  // 更新 gRPC 客户端和工作者以使用本地地址和端口
  const daprHost = "localhost";
  const daprPort = "50001";
  const workflowClient = new DaprWorkflowClient({
    daprHost,
    daprPort,
  });
  const workflowRuntime = new WorkflowRuntime({
    daprHost,
    daprPort,
  });

  const hello = async (_: WorkflowActivityContext, name: string) => {
    return `Hello ${name}!`;
  };

  const sequence: TWorkflow = async function* (ctx: WorkflowContext): any {
    const cities: string[] = [];

    const result1 = yield ctx.callActivity(hello, "Tokyo");
    cities.push(result1);
    const result2 = yield ctx.callActivity(hello, "Seattle");
    cities.push(result2);
    const result3 = yield ctx.callActivity(hello, "London");
    cities.push(result3);

    return cities;
  };

  workflowRuntime.registerWorkflow(sequence).registerActivity(hello);

  // 将工作者启动包装在 try-catch 块中以处理启动期间的任何错误
  try {
    await workflowRuntime.start();
    console.log("工作流运行时启动成功");
  } catch (error) {
    console.error("启动工作流运行时时出错:", error);
  }

  // 调度新的编排
  try {
    const id = await workflowClient.scheduleNewWorkflow(sequence);
    console.log(`编排已调度，ID: ${id}`);

    // 等待编排完成
    const state = await workflowClient.waitForWorkflowCompletion(id, undefined, 30);

    console.log(`编排完成！结果: ${state?.serializedOutput}`);
  } catch (error) {
    console.error("调度或等待编排时出错:", error);
  }

  await workflowRuntime.stop();
  await workflowClient.stop();

  // 停止 dapr sidecar
  process.exit(0);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

{{% /codetab %}}

{{% codetab %}}
<!--dotnet-->

```csharp
// 支持长时间中断的指数退避重试策略
var retryOptions = new WorkflowTaskOptions
{
    RetryPolicy = new WorkflowRetryPolicy(
        firstRetryInterval: TimeSpan.FromMinutes(1),
        backoffCoefficient: 2.0,
        maxRetryInterval: TimeSpan.FromHours(1),
        maxNumberOfAttempts: 10),
};

try
{
    var result1 = await context.CallActivityAsync<string>("Step1", wfInput, retryOptions);
    var result2 = await context.CallActivityAsync<byte[]>("Step2", result1, retryOptions);
    var result3 = await context.CallActivityAsync<long[]>("Step3", result2, retryOptions);
    return string.Join(", ", result4);
}
catch (TaskFailedException) // 任务失败会作为 TaskFailedException 显示
{
    // 重试过期 - 应用自定义补偿逻辑
    await context.CallActivityAsync<long[]>("MyCompensation", options: retryOptions);
    throw;
}
```

> **注意** 在上面的示例中，`"Step1"`、`"Step2"`、`"Step3"` 和 `"MyCompensation"` 代表工作流活动，它们是您代码中实际实现工作流步骤的函数。为了简洁起见，这些活动实现未包含在此示例中。

{{% /codetab %}}

{{% codetab %}}
<!--java-->

```java
public class ChainWorkflow extends Workflow {
    @Override
    public WorkflowStub create() {
        return ctx -> {
            StringBuilder sb = new StringBuilder();
            String wfInput = ctx.getInput(String.class);
            String result1 = ctx.callActivity("Step1", wfInput, String.class).await();
            String result2 = ctx.callActivity("Step2", result1, String.class).await();
            String result3 = ctx.callActivity("Step3", result2, String.class).await();
            String result = sb.append(result1).append(',').append(result2).append(',').append(result3).toString();
            ctx.complete(result);
        };
    }
}

    class Step1 implements WorkflowActivity {

        @Override
        public Object run(WorkflowActivityContext ctx) {
            Logger logger = LoggerFactory.getLogger(Step1.class);
            logger.info("Starting Activity: " + ctx.getName());
            // Do some work
            return null;
        }
    }

    class Step2 implements WorkflowActivity {

        @Override
        public Object run(WorkflowActivityContext ctx) {
            Logger logger = LoggerFactory.getLogger(Step2.class);
            logger.info("Starting Activity: " + ctx.getName());
            // Do some work
            return null;
        }
    }

    class Step3 implements WorkflowActivity {

        @Override
        public Object run(WorkflowActivityContext ctx) {
            Logger logger = LoggerFactory.getLogger(Step3.class);
            logger.info("Starting Activity: " + ctx.getName());
            // Do some work
            return null;
        }
    }
```

{{% /codetab %}}

{{% codetab %}}
<!--go-->

```go
func TaskChainWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return "", err
	}
	var result1 int
	if err := ctx.CallActivity(Step1, workflow.ActivityInput(input)).Await(&result1); err != nil {
		return nil, err
	}
	var result2 int
	if err := ctx.CallActivity(Step2, workflow.ActivityInput(input)).Await(&result2); err != nil {
		return nil, err
	}
	var result3 int
	if err := ctx.CallActivity(Step3, workflow.ActivityInput(input)).Await(&result3); err != nil {
		return nil, err
	}
	return []int{result1, result2, result3}, nil
}
func Step1(ctx workflow.ActivityContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return "", err
	}
	fmt.Printf("步骤 1: 接收到输入: %s", input)
	return input + 1, nil
}
func Step2(ctx workflow.ActivityContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return "", err
	}
	fmt.Printf("步骤 2: 接收到输入: %s", input)
	return input * 2, nil
}
func Step3(ctx workflow.ActivityContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return "", err
	}
	fmt.Printf("步骤 3: 接收到输入: %s", input)
	return int(math.Pow(float64(input), 2)), nil
}
```

{{% /codetab %}}

{{< /tabs >}}

如您所见，工作流被表达为所选编程语言中的简单语句序列。这使得组织中的任何工程师都可以快速理解端到端的流程，而不必了解端到端的系统架构。

在幕后，Dapr 工作流运行时：

- 负责执行工作流并确保其运行到完成。
- 自动保存进度。
- 如果工作流进程本身因任何原因失败，自动从上次完成的步骤恢复工作流。
- 允许在目标编程语言中自然地表达错误处理，使您可以轻松实现补偿逻辑。
- 提供内置的重试配置原语，以简化为工作流中的各个步骤配置复杂重试策略的过程。

## 扇出/扇入

在扇出/扇入设计模式中，您可以在多个工作者上同时执行多个任务，等待它们完成，并对结果进行一些聚合。

<img src="/images/workflow-overview/workflows-fanin-fanout.png" width=800 alt="显示扇出/扇入工作流模式如何工作的图示">

除了[前一个模式]({{< ref "workflow-patterns.md#task-chaining" >}})中提到的挑战外，在手动实现扇出/扇入模式时还有几个重要问题需要考虑：

- 如何控制并行度？
- 如何知道何时触发后续聚合步骤？
- 如果并行步骤的数量是动态的怎么办？

Dapr 工作流提供了一种将扇出/扇入模式表达为简单函数的方法，如以下示例所示：

{{< tabs Python JavaScript ".NET" Java Go >}}

{{% codetab %}}
<!--python-->

```python
import time
from typing import List
import dapr.ext.workflow as wf


def batch_processing_workflow(ctx: wf.DaprWorkflowContext, wf_input: int):
    # 获取一批 N 个工作项以并行处理
    work_batch = yield ctx.call_activity(get_work_batch, input=wf_input)

    # 调度 N 个并行任务以处理工作项并等待所有任务完成
    parallel_tasks = [ctx.call_activity(process_work_item, input=work_item) for work_item in work_batch]
    outputs = yield wf.when_all(parallel_tasks)

    # 聚合结果并将其发送到另一个活动
    total = sum(outputs)
    yield ctx.call_activity(process_results, input=total)


def get_work_batch(ctx, batch_size: int) -> List[int]:
    return [i + 1 for i in range(batch_size)]


def process_work_item(ctx, work_item: int) -> int:
    print(f'处理工作项: {work_item}.')
    time.sleep(5)
    result = work_item * 2
    print(f'工作项 {work_item} 已处理. 结果: {result}.')
    return result


def process_results(ctx, final_result: int):
    print(f'最终结果: {final_result}.')
```

{{% /codetab %}}

{{% codetab %}}
<!--javascript-->

```javascript
import {
  Task,
  DaprWorkflowClient,
  WorkflowActivityContext,
  WorkflowContext,
  WorkflowRuntime,
  TWorkflow,
} from "@dapr/dapr";

// 将整个代码包装在一个立即调用的异步函数中
async function start() {
  // 更新 gRPC 客户端和工作者以使用本地地址和端口
  const daprHost = "localhost";
  const daprPort = "50001";
  const workflowClient = new DaprWorkflowClient({
    daprHost,
    daprPort,
  });
  const workflowRuntime = new WorkflowRuntime({
    daprHost,
    daprPort,
  });

  function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async function getWorkItemsActivity(_: WorkflowActivityContext): Promise<string[]> {
    const count: number = getRandomInt(2, 10);
    console.log(`生成 ${count} 个工作项...`);

    const workItems: string[] = Array.from({ length: count }, (_, i) => `工作项 ${i}`);
    return workItems;
  }

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function processWorkItemActivity(context: WorkflowActivityContext, item: string): Promise<number> {
    console.log(`处理工作项: ${item}`);

    // 模拟一些需要可变时间的工作
    const sleepTime = Math.random() * 5000;
    await sleep(sleepTime);

    // 返回给定工作项的结果，在这种情况下也是一个随机数
    // 有关工作流中随机数的更多信息，请查看
    // https://learn.microsoft.com/azure/azure-functions/durable/durable-functions-code-constraints?tabs=csharp#random-numbers
    return Math.floor(Math.random() * 11);
  }

  const workflow: TWorkflow = async function* (ctx: WorkflowContext): any {
    const tasks: Task<any>[] = [];
    const workItems = yield ctx.callActivity(getWorkItemsActivity);
    for (const workItem of workItems) {
      tasks.push(ctx.callActivity(processWorkItemActivity, workItem));
    }
    const results: number[] = yield ctx.whenAll(tasks);
    const sum: number = results.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    return sum;
  };

  workflowRuntime.registerWorkflow(workflow);
  workflowRuntime.registerActivity(getWorkItemsActivity);
  workflowRuntime.registerActivity(processWorkItemActivity);

  // 将工作者启动包装在 try-catch 块中以处理启动期间的任何错误
  try {
    await workflowRuntime.start();
    console.log("工作者启动成功");
  } catch (error) {
    console.error("启动工作者时出错:", error);
  }

  // 调度新的编排
  try {
    const id = await workflowClient.scheduleNewWorkflow(workflow);
    console.log(`编排已调度，ID: ${id}`);

    // 等待编排完成
    const state = await workflowClient.waitForWorkflowCompletion(id, undefined, 30);

    console.log(`编排完成！结果: ${state?.serializedOutput}`);
  } catch (error) {
    console.error("调度或等待编排时出错:", error);
  }

  // 停止工作者和客户端
  await workflowRuntime.stop();
  await workflowClient.stop();

  // 停止 dapr sidecar
  process.exit(0);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

{{% /codetab %}}

{{% codetab %}}
<!--dotnet-->

```csharp
// 获取要并行处理的 N 个工作项的列表。
object[] workBatch = await context.CallActivityAsync<object[]>("GetWorkBatch", null);

// 调度并行任务，但不等待它们完成。
var parallelTasks = new List<Task<int>>(workBatch.Length);
for (int i = 0; i < workBatch.Length; i++)
{
    Task<int> task = context.CallActivityAsync<int>("ProcessWorkItem", workBatch[i]);
    parallelTasks.Add(task);
}

// 一切都已调度。在此处等待，直到所有并行任务完成。
await Task.WhenAll(parallelTasks);

// 聚合所有 N 个输出并发布结果。
int sum = parallelTasks.Sum(t => t.Result);
await context.CallActivityAsync("PostResults", sum);
```

{{% /codetab %}}

{{% codetab %}}
<!--java-->

```java
public class FaninoutWorkflow extends Workflow {
    @Override
    public WorkflowStub create() {
        return ctx -> {
            // 获取要并行处理的 N 个工作项的列表。
            Object[] workBatch = ctx.callActivity("GetWorkBatch", Object[].class).await();
            // 调度并行任务，但不等待它们完成。
            List<Task<Integer>> tasks = Arrays.stream(workBatch)
                    .map(workItem -> ctx.callActivity("ProcessWorkItem", workItem, int.class))
                    .collect(Collectors.toList());
            // 一切都已调度。在此处等待，直到所有并行任务完成。
            List<Integer> results = ctx.allOf(tasks).await();
            // 聚合所有 N 个输出并发布结果。
            int sum = results.stream().mapToInt(Integer::intValue).sum();
            ctx.complete(sum);
        };
    }
}
```

{{% /codetab %}}

{{% codetab %}}
<!--go-->

```go
func BatchProcessingWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return 0, err
	}
	var workBatch []int
	if err := ctx.CallActivity(GetWorkBatch, workflow.ActivityInput(input)).Await(&workBatch); err != nil {
		return 0, err
	}
	parallelTasks := workflow.NewTaskSlice(len(workBatch))
	for i, workItem := range workBatch {
		parallelTasks[i] = ctx.CallActivity(ProcessWorkItem, workflow.ActivityInput(workItem))
	}
	var outputs int
	for _, task := range parallelTasks {
		var output int
		err := task.Await(&output)
		if err == nil {
			outputs += output
		} else {
			return 0, err
		}
	}
	if err := ctx.CallActivity(ProcessResults, workflow.ActivityInput(outputs)).Await(nil); err != nil {
		return 0, err
	}
	return 0, nil
}
func GetWorkBatch(ctx workflow.ActivityContext) (any, error) {
	var batchSize int
	if err := ctx.GetInput(&batchSize); err != nil {
		return 0, err
	}
	batch := make([]int, batchSize)
	for i := 0; i < batchSize; i++ {
		batch[i] = i
	}
	return batch, nil
}
func ProcessWorkItem(ctx workflow.ActivityContext) (any, error) {
	var workItem int
	if err := ctx.GetInput(&workItem); err != nil {
		return 0, err
	}
	fmt.Printf("处理工作项: %d\n", workItem)
	time.Sleep(time.Second * 5)
	result := workItem * 2
	fmt.Printf("工作项 %d 已处理. 结果: %d\n", workItem, result)
	return result, nil
}
func ProcessResults(ctx workflow.ActivityContext) (any, error) {
	var finalResult int
	if err := ctx.GetInput(&finalResult); err != nil {
		return 0, err
	}
	fmt.Printf("最终结果: %d\n", finalResult)
	return finalResult, nil
}
```

{{% /codetab %}}

{{< /tabs >}}

此示例的关键要点是：

- 扇出/扇入模式可以使用普通编程构造表达为简单函数
- 并行任务的数量可以是静态的或动态的
- 工作流本身能够聚合并行执行的结果

此外，工作流的执行是持久的。如果一个工作流启动了 100 个并行任务执行，并且只有 40 个在进程崩溃前完成，工作流会自动重新启动并仅调度剩余的 60 个任务。

可以进一步使用简单的、特定语言的构造来限制并发度。下面的示例代码说明了如何将扇出的程度限制为仅 5 个并发活动执行：

{{< tabs ".NET" >}}

{{% codetab %}}
<!-- .NET -->
```csharp

// 回顾之前的示例...
// 获取要并行处理的 N 个工作项的列表。
object[] workBatch = await context.CallActivityAsync<object[]>("GetWorkBatch", null);

const int MaxParallelism = 5;
var results = new List<int>();
var inFlightTasks = new HashSet<Task<int>>();
foreach(var workItem in workBatch)
{
  if (inFlightTasks.Count >= MaxParallelism)
  {
    var finishedTask = await Task.WhenAny(inFlightTasks);
    results.Add(finishedTask.Result);
    inFlightTasks.Remove(finishedTask);
  }

  inFlightTasks.Add(context.CallActivityAsync<int>("ProcessWorkItem", workItem));
}
results.AddRange(await Task.WhenAll(inFlightTasks));

var sum = results.Sum(t => t);
await context.CallActivityAsync("PostResults", sum);
```

{{% /codetab %}}

{{< /tabs >}}

以这种方式限制并发度对于限制对共享资源的争用可能很有用。例如，如果活动需要调用具有自身并发限制的外部资源（如数据库或外部 API），则确保不超过指定数量的活动同时调用该资源可能很有用。

## 异步 HTTP API

异步 HTTP API 通常使用[异步请求-回复模式](https://learn.microsoft.com/azure/architecture/patterns/async-request-reply)实现。传统上实现此模式涉及以下步骤：

1. 客户端向 HTTP API 端点（_启动 API_）发送请求
1. _启动 API_ 将消息写入后端队列，从而触发长时间运行操作的开始
1. 在调度后端操作后，_启动 API_ 立即向客户端返回 HTTP 202 响应，其中包含可用于轮询状态的标识符
1. _状态 API_ 查询包含长时间运行操作状态的数据库
1. 客户端重复轮询 _状态 API_，直到某个超时到期或收到“完成”响应

以下图示说明了端到端流程。

<img src="/images/workflow-overview/workflow-async-request-response.png" width=800 alt="显示异步请求响应模式如何工作的图示"/>

实现异步请求-回复模式的挑战在于它涉及使用多个 API 和状态存储。它还涉及正确实现协议，以便客户端知道如何自动轮询状态并知道操作何时完成。

Dapr 工作流 HTTP API 开箱即支持异步请求-回复模式，无需编写任何代码或进行任何状态管理。

以下 `curl` 命令说明了工作流 API 如何支持此模式。

```bash
curl -X POST http://localhost:3500/v1.0/workflows/dapr/OrderProcessingWorkflow/start?instanceID=12345678 -d '{"Name":"Paperclips","Quantity":1,"TotalCost":9.95}'
```

上一个命令将导致以下响应 JSON：

```json
{"instanceID":"12345678"}
```

HTTP 客户端然后可以使用工作流实例 ID 构建状态查询 URL，并反复轮询，直到在负载中看到“COMPLETE”、“FAILURE”或“TERMINATED”状态。

```bash
curl http://localhost:3500/v1.0/workflows/dapr/12345678
```

以下是进行中的工作流状态可能的样子。

```json
{
  "instanceID": "12345678",
  "workflowName": "OrderProcessingWorkflow",
  "createdAt": "2023-05-03T23:22:11.143069826Z",
  "lastUpdatedAt": "2023-05-03T23:22:22.460025267Z",
  "runtimeStatus": "RUNNING",
  "properties": {
    "dapr.workflow.custom_status": "",
    "dapr.workflow.input": "{\"Name\":\"Paperclips\",\"Quantity\":1,\"TotalCost\":9.95}"
  }
}
```

如上例所示，工作流的运行时状态为 `RUNNING`，这让客户端知道它应该继续轮询。

如果工作流已完成，状态可能如下所示。

```json
{
  "instanceID": "12345678",
  "workflowName": "OrderProcessingWorkflow",
  "createdAt": "2023-05-03T23:30:11.381146313Z",
  "lastUpdatedAt": "2023-05-03T23:30:52.923870615Z",
  "runtimeStatus": "COMPLETED",
  "properties": {
    "dapr.workflow.custom_status": "",
    "dapr.workflow.input": "{\"Name\":\"Paperclips\",\"Quantity\":1,\"TotalCost\":9.95}",
    "dapr.workflow.output": "{\"Processed\":true}"
  }
}
```

如上例所示，工作流的运行时状态现在为 `COMPLETED`，这意味着客户端可以停止轮询更新。

## 监控

监控模式是一个通常包括以下步骤的重复过程：

1. 检查系统状态
1. 根据该状态采取某些行动 - 例如发送通知
1. 休眠一段时间
1. 重复

下图提供了此模式的粗略说明。

<img src="/images/workflow-overview/workflow-monitor-pattern.png" width=600 alt="显示监控模式如何工作的图示"/>

根据业务需求，可能只有一个监控器，也可能有多个监控器，每个业务实体（例如股票）一个。此外，休眠时间可能需要根据情况进行更改。这些要求使得使用基于 cron 的调度系统不切实际。

Dapr 工作流通过允许您实现_永恒工作流_本地支持此模式。Dapr 工作流公开了一个 _continue-as-new_ API，工作流作者可以使用该 API 从头开始使用新输入重新启动工作流函数，而不是编写无限循环（[这是一种反模式]({{< ref "workflow-features-concepts.md#infinite-loops-and-eternal-workflows" >}})）。

{{< tabs Python JavaScript ".NET" Java Go >}}

{{% codetab %}}
<!--python-->

```python
from dataclasses import dataclass
from datetime import timedelta
import random
import dapr.ext.workflow as wf


@dataclass
class JobStatus:
    job_id: str
    is_healthy: bool


def status_monitor_workflow(ctx: wf.DaprWorkflowContext, job: JobStatus):
    # 轮询与此 job 关联的状态端点
    status = yield ctx.call_activity(check_status, input=job)
    if not ctx.is_replaying:
        print(f"Job '{job.job_id}' is {status}.")

    if status == "healthy":
        job.is_healthy = True
        next_sleep_interval = 60  # 在健康状态下检查频率较低
    else:
        if job.is_healthy:
            job.is_healthy = False
            ctx.call_activity(send_alert, input=f"Job '{job.job_id}' is unhealthy!")
        next_sleep_interval = 5  # 在不健康状态下检查频率较高

    yield ctx.create_timer(fire_at=ctx.current_utc_datetime + timedelta(minutes=next_sleep_interval))

    # 使用新的 JobStatus 输入从头开始重新启动
    ctx.continue_as_new(job)


def check_status(ctx, _) -> str:
    return random.choice(["healthy", "unhealthy"])


def send_alert(ctx, message: str):
    print(f'*** Alert: {message}')
```

{{% /codetab %}}

{{% codetab %}}
<!--javascript-->

```javascript
const statusMonitorWorkflow: TWorkflow = async function* (ctx: WorkflowContext): any {
    let duration;
    const status = yield ctx.callActivity(checkStatusActivity);
    if (status === "healthy") {
      // 在健康状态下检查频率较低
      // 设置持续时间为 1 小时
      duration = 60 * 60;
    } else {
      yield ctx.callActivity(alertActivity, "job unhealthy");
      // 在不健康状态下检查频率较高
      // 设置持续时间为 5 分钟
      duration = 5 * 60;
    }

    // 将工作流置于休眠状态，直到确定的时间
    ctx.createTimer(duration);

    // 使用更新的状态从头开始重新启动
    ctx.continueAsNew();
  };
```

{{% /codetab %}}

{{% codetab %}}
<!--dotnet-->

```csharp
public override async Task<object> RunAsync(WorkflowContext context, MyEntityState myEntityState)
{
    TimeSpan nextSleepInterval;

    var status = await context.CallActivityAsync<string>("GetStatus");
    if (status == "healthy")
    {
        myEntityState.IsHealthy = true;

        // 在健康状态下检查频率较低
        nextSleepInterval = TimeSpan.FromMinutes(60);
    }
    else
    {
        if (myEntityState.IsHealthy)
        {
            myEntityState.IsHealthy = false;
            await context.CallActivityAsync("SendAlert", myEntityState);
        }

        // 在不健康状态下检查频率较高
        nextSleepInterval = TimeSpan.FromMinutes(5);
    }

    // 将工作流置于休眠状态，直到确定的时间
    await context.CreateTimer(nextSleepInterval);

    // 使用更新的状态从头开始重新启动
    context.ContinueAsNew(myEntityState);
    return null;
}
```

> 此示例假设您有一个预定义的 `MyEntityState` 类，其中包含一个布尔 `IsHealthy` 属性。

{{% /codetab %}}

{{% codetab %}}
<!--java-->

```java
public class MonitorWorkflow extends Workflow {

  @Override
  public WorkflowStub create() {
    return ctx -> {

      Duration nextSleepInterval;

      var status = ctx.callActivity(DemoWorkflowStatusActivity.class.getName(), DemoStatusActivityOutput.class).await();
      var isHealthy = status.getIsHealthy();

      if (isHealthy) {
        // 在健康状态下检查频率较低
        nextSleepInterval = Duration.ofMinutes(60);
      } else {

        ctx.callActivity(DemoWorkflowAlertActivity.class.getName()).await();

        // 在不健康状态下检查频率较高
        nextSleepInterval = Duration.ofMinutes(5);
      }

      // 将工作流置于休眠状态，直到确定的时间
      try {
        ctx.createTimer(nextSleepInterval);
      } catch (InterruptedException e) {
        throw new RuntimeException(e);
      }

      // 使用更新的状态从头开始重新启动
      ctx.continueAsNew();
    }
  }
}
```

{{% /codetab %}}

{{% codetab %}}
<!--go-->

```go
type JobStatus struct {
	JobID     string `json:"job_id"`
	IsHealthy bool   `json:"is_healthy"`
}
func StatusMonitorWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var sleepInterval time.Duration
	var job JobStatus
	if err := ctx.GetInput(&job); err != nil {
		return "", err
	}
	var status string
	if err := ctx.CallActivity(CheckStatus, workflow.ActivityInput(job)).Await(&status); err != nil {
		return "", err
	}
	if status == "healthy" {
		job.IsHealthy = true
		sleepInterval = time.Minutes * 60
	} else {
		if job.IsHealthy {
			job.IsHealthy = false
			err := ctx.CallActivity(SendAlert, workflow.ActivityInput(fmt.Sprintf("Job '%s' is unhealthy!", job.JobID))).Await(nil)
			if err != nil {
				return "", err
			}
		}
		sleepInterval = time.Minutes * 5
	}
	if err := ctx.CreateTimer(sleepInterval).Await(nil); err != nil {
		return "", err
	}
	ctx.ContinueAsNew(job, false)
	return "", nil
}
func CheckStatus(ctx workflow.ActivityContext) (any, error) {
	statuses := []string{"healthy", "unhealthy"}
	return statuses[rand.Intn(1)], nil
}
func SendAlert(ctx workflow.ActivityContext) (any, error) {
	var message string
	if err := ctx.GetInput(&message); err != nil {
		return "", err
	}
	fmt.Printf("*** Alert: %s", message)
	return "", nil
}
```

{{% /codetab %}}

{{< /tabs >}}

实现监控模式的工作流可以永远循环，也可以通过不调用 _continue-as-new_ 来优雅地终止自身。

{{% alert title="注意" color="primary" %}}
此模式也可以使用 actor 和提醒来表达。不同之处在于此工作流被表达为具有输入和状态存储在局部变量中的单个函数。如果需要，工作流还可以执行具有更强可靠性保证的操作序列。
{{% /alert %}}

## 外部系统交互

在某些情况下，工作流可能需要暂停并等待外部系统执行某些操作。例如，工作流可能需要暂停并等待接收到付款。在这种情况下，支付系统可能会在收到付款时将事件发布到 pub/sub 主题，并且该主题上的侦听器可以使用[触发事件工作流 API]({{< ref "howto-manage-workflow.md#raise-an-event" >}})向工作流触发事件。

另一个非常常见的场景是工作流需要暂停并等待人类，例如在批准采购订单时。Dapr 工作流通过[外部事件]({{< ref "workflow-features-concepts.md#external-events" >}})功能支持此事件模式。

以下是涉及人类的采购订单工作流示例：

1. 收到采购订单时触发工作流。
1. 工作流中的规则确定需要人类执行某些操作。例如，采购订单成本超过某个自动批准阈值。
1. 工作流发送请求人类操作的通知。例如，它向指定的审批人发送带有批准链接的电子邮件。
1. 工作流暂停并等待人类通过点击链接批准或拒绝订单。
1. 如果在指定时间内未收到批准，工作流将恢复并执行某些补偿逻辑，例如取消订单。

下图说明了此流程。

<img src="/images/workflow-overview/workflow-human-interaction-pattern.png" width=600 alt="显示外部系统交互模式如何与人类交互的图示"/>

以下示例代码显示了如何使用 Dapr 工作流实现此模式。

{{< tabs Python JavaScript ".NET" Java Go >}}

{{% codetab %}}
<!--python-->

```python
from dataclasses import dataclass
from datetime import timedelta
import dapr.ext.workflow as wf


@dataclass
class Order:
    cost: float
    product: str
    quantity: int

    def __str__(self):
        return f'{self.product} ({self.quantity})'


@dataclass
class Approval:
    approver: str

    @staticmethod
    def from_dict(dict):
        return Approval(**dict)


def purchase_order_workflow(ctx: wf.DaprWorkflowContext, order: Order):
    # 低于 $1000 的订单自动批准
    if order.cost < 1000:
        return "Auto-approved"

    # $1000 或以上的订单需要经理批准
    yield ctx.call_activity(send_approval_request, input=order)

    # 必须在 24 小时内收到批准，否则将被取消。
    approval_event = ctx.wait_for_external_event("approval_received")
    timeout_event = ctx.create_timer(timedelta(hours=24))
    winner = yield wf.when_any([approval_event, timeout_event])
    if winner == timeout_event:
        return "Cancelled"

    # 订单已获批准
    yield ctx.call_activity(place_order, input=order)
    approval_details = Approval.from_dict(approval_event.get_result())
    return f"Approved by '{approval_details.approver}'"


def send_approval_request(_, order: Order) -> None:
    print(f'*** 发送审批请求: {order}')


def place_order(_, order: Order) -> None:
    print(f'*** 下订单: {order}')
```

{{% /codetab %}}

{{% codetab %}}
<!--javascript-->

```javascript
import {
  Task,
  DaprWorkflowClient,
  WorkflowActivityContext,
  WorkflowContext,
  WorkflowRuntime,
  TWorkflow,
} from "@dapr/dapr";
import * as readlineSync from "readline-sync";

// 将整个代码包装在一个立即调用的异步函数中
async function start() {
  class Order {
    cost: number;
    product: string;
    quantity: number;
    constructor(cost: number, product: string, quantity: number) {
      this.cost = cost;
      this.product = product;
      this.quantity = quantity;
    }
  }

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 更新 gRPC 客户端和工作者以使用本地地址和端口
  const daprHost = "localhost";
  const daprPort = "50001";
  const workflowClient = new DaprWorkflowClient({
    daprHost,
    daprPort,
  });
  const workflowRuntime = new WorkflowRuntime({
    daprHost,
    daprPort,
  });

  // 发送审批请求给经理的活动函数
  const sendApprovalRequest = async (_: WorkflowActivityContext, order: Order) => {
    // 模拟一些需要时间的工作
    await sleep(3000);
    console.log(`发送审批请求: ${order.product}`);
  };

  // 下订单的活动函数
  const placeOrder = async (_: WorkflowActivityContext, order: Order) => {
    console.log(`下订单: ${order.product}`);
  };

  // 表示采购订单工作流的编排函数
  const purchaseOrderWorkflow: TWorkflow = async function* (ctx: WorkflowContext, order: Order): any {
    // 低于 $1000 的订单自动批准
    if (order.cost < 1000) {
      return "Auto-approved";
    }

    // $1000 或以上的订单需要经理批准
    yield ctx.callActivity(sendApprovalRequest, order);

    // 必须在 24 小时内收到批准，否则将被取消。
    const tasks: Task<any>[] = [];
    const approvalEvent = ctx.waitForExternalEvent("approval_received");
    const timeoutEvent = ctx.createTimer(24 * 60 * 60);
    tasks.push(approvalEvent);
    tasks.push(timeoutEvent);
    const winner = ctx.whenAny(tasks);

    if (winner == timeoutEvent) {
      return "Cancelled";
    }

    yield ctx.callActivity(placeOrder, order);
    const approvalDetails = approvalEvent.getResult();
    return `Approved by ${approvalDetails.approver}`;
  };

  workflowRuntime
    .registerWorkflow(purchaseOrderWorkflow)
    .registerActivity(sendApprovalRequest)
    .registerActivity(placeOrder);

  // 将工作者启动包装在 try-catch 块中以处理启动期间的任何错误
  try {
    await workflowRuntime.start();
    console.log("工作者启动成功");
  } catch (error) {
    console.error("启动工作者时出错:", error);
  }

  // 调度新的编排
  try {
    const cost = readlineSync.questionInt("输入订单金额:");
    const approver = readlineSync.question("输入审批人:");
    const timeout = readlineSync.questionInt("输入订单超时时间（秒）:");
    const order = new Order(cost, "MyProduct", 1);
    const id = await workflowClient.scheduleNewWorkflow(purchaseOrderWorkflow, order);
    console.log(`编排已调度，ID: ${id}`);

    // 异步提示批准
    promptForApproval(approver, workflowClient, id);

    // 等待编排完成
    const state = await workflowClient.waitForWorkflowCompletion(id, undefined, timeout + 2);

    console.log(`编排完成！结果: ${state?.serializedOutput}`);
  } catch (error) {
    console.error("调度或等待编排时出错:", error);
  }

  // 停止工作者和客户端
  await workflowRuntime.stop();
  await workflowClient.stop();

  // 停止 dapr sidecar
  process.exit(0);
}

async function promptForApproval(approver: string, workflowClient: DaprWorkflowClient, id: string) {
  if (readlineSync.keyInYN("按 [Y] 批准订单... Y/是, N/否")) {
    const approvalEvent = { approver: approver };
    await workflowClient.raiseEvent(id, "approval_received", approvalEvent);
  } else {
    return "订单被拒绝";
  }
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

{{% /codetab %}}

{{% codetab %}}
<!--dotnet-->

```csharp
public override async Task<OrderResult> RunAsync(WorkflowContext context, OrderPayload order)
{
    // ...(其他步骤)...

    // 需要对超过某个阈值的订单进行批准
    if (order.TotalCost > OrderApprovalThreshold)
    {
        try
        {
            // 请求人类批准此订单
            await context.CallActivityAsync(nameof(RequestApprovalActivity), order);

            // 暂停并等待人类批准订单
            ApprovalResult approvalResult = await context.WaitForExternalEventAsync<ApprovalResult>(
                eventName: "ManagerApproval",
                timeout: TimeSpan.FromDays(3));
            if (approvalResult == ApprovalResult.Rejected)
            {
                // 订单被拒绝，在此结束工作流
                return new OrderResult(Processed: false);
            }
        }
        catch (TaskCanceledException)
        {
            // 批准超时会导致自动取消订单
            return new OrderResult(Processed: false);
        }
    }

    // ...(其他步骤)...

    // 以成功结果结束工作流
    return new OrderResult(Processed: true);
}
```

> **注意** 在上面的示例中，`RequestApprovalActivity` 是要调用的工作流活动的名称，`ApprovalResult` 是由工作流应用程序定义的枚举。为了简洁起见，这些定义未包含在示例代码中。

{{% /codetab %}}

{{% codetab %}}
<!--java-->

```java
public class ExternalSystemInteractionWorkflow extends Workflow {
    @Override
    public WorkflowStub create() {
        return ctx -> {
            // ...其他步骤...
            Integer orderCost = ctx.getInput(int.class);
            // 需要对超过某个阈值的订单进行批准
            if (orderCost > ORDER_APPROVAL_THRESHOLD) {
                try {
                    // 请求人类批准此订单
                    ctx.callActivity("RequestApprovalActivity", orderCost, Void.class).await();
                    // 暂停并等待人类批准订单
                    boolean approved = ctx.waitForExternalEvent("ManagerApproval", Duration.ofDays(3), boolean.class).await();
                    if (!approved) {
                        // 订单被拒绝，在此结束工作流
                        ctx.complete("Process reject");
                    }
                } catch (TaskCanceledException e) {
                    // 批准超时会导致自动取消订单
                    ctx.complete("Process cancel");
                }
            }
            // ...其他步骤...

            // 以成功结果结束工作流
            ctx.complete("Process approved");
        };
    }
}
```

{{% /codetab %}}

{{% codetab %}}
<!--go-->

```go
type Order struct {
	Cost     float64 `json:"cost"`
	Product  string  `json:"product"`
	Quantity int     `json:"quantity"`
}
type Approval struct {
	Approver string `json:"approver"`
}
func PurchaseOrderWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var order Order
	if err := ctx.GetInput(&order); err != nil {
		return "", err
	}
	// 低于 $1000 的订单自动批准
	if order.Cost < 1000 {
		return "Auto-approved", nil
	}
	// $1000 或以上的订单需要经理批准
	if err := ctx.CallActivity(SendApprovalRequest, workflow.ActivityInput(order)).Await(nil); err != nil {
		return "", err
	}
	// 必须在 24 小时内收到批准，否则将被取消
	var approval Approval
	if err := ctx.WaitForExternalEvent("approval_received", time.Hour*24).Await(&approval); err != nil {
		// 假设发生了超时 - 无论如何；一个错误。
		return "error/cancelled", err
	}
	// 订单已获批准
	if err := ctx.CallActivity(PlaceOrder, workflow.ActivityInput(order)).Await(nil); err != nil {
		return "", err
	}
	return fmt.Sprintf("Approved by %s", approval.Approver), nil
}
func SendApprovalRequest(ctx workflow.ActivityContext) (any, error) {
	var order Order
	if err := ctx.GetInput(&order); err != nil {
		return "", err
	}
	fmt.Printf("*** 发送审批请求: %v\n", order)
	return "", nil
}
func PlaceOrder(ctx workflow.ActivityContext) (any, error) {
	var order Order
	if err := ctx.GetInput(&order); err != nil {
		return "", err
	}
	fmt.Printf("*** 下订单: %v", order)
	return "", nil
}
```

{{% /codetab %}}

{{< /tabs >}}

恢复工作流执行的事件的代码在工作流之外。可以使用[触发事件]({{< ref "howto-manage-workflow.md#raise-an-event" >}})工作流管理 API 将工作流事件传递给等待的工作流实例，如以下示例所示：

{{< tabs Python JavaScript ".NET" Java Go >}}

{{% codetab %}}
<!--python-->

```python
from dapr.clients import DaprClient
from dataclasses import asdict

with DaprClient() as d:
    d.raise_workflow_event(
        instance_id=instance_id,
        workflow_component="dapr",
        event_name="approval_received",
        event_data=asdict(Approval("Jane Doe")))
```

{{% /codetab %}}

{{% codetab %}}
<!--javascript-->

```javascript
import { DaprClient } from "@dapr/dapr";

  public async raiseEvent(workflowInstanceId: string, eventName: string, eventPayload?: any) {
    this._innerClient.raiseOrchestrationEvent(workflowInstanceId, eventName, eventPayload);
  }
```

{{% /codetab %}}

{{% codetab %}}
<!--dotnet-->

```csharp
// 向等待的工作流触发工作流事件
await daprClient.RaiseWorkflowEventAsync(
    instanceId: orderId,
    workflowComponent: "dapr",
    eventName: "ManagerApproval",
    eventData: ApprovalResult.Approved);
```

{{% /codetab %}}

{{% codetab %}}
<!--java-->

```java
System.out.println("**SendExternalMessage: RestartEvent**");
client.raiseEvent(restartingInstanceId, "RestartEvent", "RestartEventPayload");
```

{{% /codetab %}}

{{% codetab %}}
<!--go-->

```go
func raiseEvent() {
  daprClient, err := client.NewClient()
  if err != nil {
    log.Fatalf("failed to initialize the client")
  }
  err = daprClient.RaiseEventWorkflow(context.Background(), &client.RaiseEventWorkflowRequest{
    InstanceID: "instance_id",
    WorkflowComponent: "dapr",
    EventName: "approval_received",
    EventData: Approval{
      Approver: "Jane Doe",
    },
  })
  if err != nil {
    log.Fatalf("failed to raise event on workflow")
  }
  log.Println("raised an event on specified workflow")
}
```

{{% /codetab %}}

{{< /tabs >}}

外部事件不必由人类直接触发。它们也可以由其他系统触发。例如，工作流可能需要暂停并等待接收到付款。在这种情况下，支付系统可能会在收到付款时将事件发布到 pub/sub 主题，并且该主题上的侦听器可以使用触发事件工作流 API 向工作流触发事件。

## 下一步

{{< button text="工作流架构 >>" page="workflow-architecture.md" >}}

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
