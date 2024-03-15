---
type: docs
title: 工作流模式
linkTitle: 工作流模式
weight: 3000
description: 编写不同类型的工作流模式
---

Dapr 工作流简化了微服务架构中复杂的有状态协调要求。 以下部分介绍了可以从 Dapr 工作流中受益的几种应用程序模式。

## 任务链

在任务链模式中，工作流中的多个步骤连续运行，一个步骤的输出可以作为下一步的输入传递。 任务链工作流通常涉及创建需要对某些数据执行的操作序列，例如筛选、转换和缩减。

<img src="/images/workflow-overview/workflows-chaining.png" width=800 alt="Diagram showing how the task chaining workflow pattern works">

在某些情况下，可能需要跨多个微服务编排工作流的步骤。 为了提高可靠性和可伸缩性，还可以使用队列来触发各个步骤。

虽然模式很简单，但实现中隐藏着许多复杂性。 For example:

- 如果其中一个微服务长时间不可用，会发生什么情况？
- 失败的步骤可以自动重试吗？
- 如果不行，如何在适用的情况下为回滚先前完成的步骤提供便利？
- 撇开实施细节不谈，是否有办法将工作流程可视化，以便其他工程师了解工作流程的作用和工作方式？

Dapr 工作流解决了这些复杂问题，它允许您在自己选择的编程语言中以简单函数的形式简洁地实现任务链模式，如下例所示。



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
    print(f'Step 1: Received input: {activity_input}.')
    # Do some work
    return activity_input + 1


def step2(ctx, activity_input):
    print(f'Step 2: Received input: {activity_input}.')
    # Do some work
    return activity_input * 2


def step3(ctx, activity_input):
    print(f'Step 3: Received input: {activity_input}.')
    # Do some work
    return activity_input ^ 2


def error_handler(ctx, error):
    print(f'Executing error handler: {error}.')
    # Do some compensating work
```

> **注意** 工作流重试策略将在 Python SDK 的未来版本中提供。



{{% codetab %}}

<!--javascript-->

```javascript
import { DaprWorkflowClient, WorkflowActivityContext, WorkflowContext, WorkflowRuntime, TWorkflow } from "@dapr/dapr";

async function start() {
  // Update the gRPC client and worker to use a local address and port
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

  // Wrap the worker startup in a try-catch block to handle any errors during startup
  try {
    await workflowRuntime.start();
    console.log("Workflow runtime started successfully");
  } catch (error) {
    console.error("Error starting workflow runtime:", error);
  }

  // Schedule a new orchestration
  try {
    const id = await workflowClient.scheduleNewWorkflow(sequence);
    console.log(`Orchestration scheduled with ID: ${id}`);

    // Wait for orchestration completion
    const state = await workflowClient.waitForWorkflowCompletion(id, undefined, 30);

    console.log(`Orchestration completed! Result: ${state?.serializedOutput}`);
  } catch (error) {
    console.error("Error scheduling or waiting for orchestration:", error);
  }

  await workflowRuntime.stop();
  await workflowClient.stop();

  // stop the dapr side car
  process.exit(0);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```



{{% codetab %}}

<!--dotnet-->

```csharp
// Expotential backoff retry policy that survives long outages
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
catch (TaskFailedException) // Task failures are surfaced as TaskFailedException
{
    // Retries expired - apply custom compensation logic
    await context.CallActivityAsync<long[]>("MyCompensation", options: retryOptions);
    throw;
}
```

> **注意** 在上面的示例中， `"Step1"`, `"Step2"`, `"Step3"`, 和 `"MyCompensation"` 代表工作流活动，它们是代码中实际执行工作流步骤的函数。 为简洁起见，此示例中省略了这些活动实现。



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
	if err := ctx.CallActivity(Step1, workflow.ActivityInput(input)).Await(&result2); err != nil {
		return nil, err
	}
	var result3 int
	if err := ctx.CallActivity(Step1, workflow.ActivityInput(input)).Await(&result3); err != nil {
		return nil, err
	}
	return []int{result1, result2, result3}, nil
}
func Step1(ctx workflow.ActivityContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return "", err
	}
	fmt.Printf("Step 1: Received input: %s", input)
	return input + 1, nil
}
func Step2(ctx workflow.ActivityContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return "", err
	}
	fmt.Printf("Step 2: Received input: %s", input)
	return input * 2, nil
}
func Step3(ctx workflow.ActivityContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return "", err
	}
	fmt.Printf("Step 3: Received input: %s", input)
	return int(math.Pow(float64(input), 2)), nil
}
```



{{< /tabs >}}

如您所见，工作流以您选择的编程语言表示为一系列简单的语句。 这使组织中的任何工程师都可以快速了解端到端流程，而不必了解端到端系统架构。

幕后是 Dapr 工作流运行时：

- 负责执行工作流程，确保流程顺利完成。
- 自动保存进度。
- 如果工作流程本身因故失败，则自动从最后完成的步骤恢复工作流程。
- 可在目标编程语言中自然表达错误处理，让您轻松实现补偿逻辑。
- 提供内置重试配置原语，简化了为工作流中各个步骤配置复杂重试策略的过程。

## Fan-out/fan-in

在扇出/扇入（fan-out/fan-in）设计模式中，您可能会在多个 Worker 上同时执行多个任务，等待它们完成，然后对结果进行聚合。

<img src="/images/workflow-overview/workflows-fanin-fanout.png" width=800 alt="Diagram showing how the fan-out/fan-in workflow pattern works">

除了在[之前的模式](workflow-patterns.md#task-chaining)中提到的挑战之外，在手动实施扇出/扇入模式时还需要考虑几个重要问题：

- 如何控制并行度？
- 如何知道何时触发后续聚合步骤？
- 如果并行步骤的数量是动态的，该怎么办？

Dapr 工作流提供了一种将扇出/扇入模式表达为简单函数的方法，如下例所示：



{{% codetab %}}

<!--python-->

```python
import time
from typing import List
import dapr.ext.workflow as wf


def batch_processing_workflow(ctx: wf.DaprWorkflowContext, wf_input: int):
    # get a batch of N work items to process in parallel
    work_batch = yield ctx.call_activity(get_work_batch, input=wf_input)

    # schedule N parallel tasks to process the work items and wait for all to complete
    parallel_tasks = [ctx.call_activity(process_work_item, input=work_item) for work_item in work_batch]
    outputs = yield wf.when_all(parallel_tasks)

    # aggregate the results and send them to another activity
    total = sum(outputs)
    yield ctx.call_activity(process_results, input=total)


def get_work_batch(ctx, batch_size: int) -> List[int]:
    return [i + 1 for i in range(batch_size)]


def process_work_item(ctx, work_item: int) -> int:
    print(f'Processing work item: {work_item}.')
    time.sleep(5)
    result = work_item * 2
    print(f'Work item {work_item} processed. Result: {result}.')
    return result


def process_results(ctx, final_result: int):
    print(f'Final result: {final_result}.')
```



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

// Wrap the entire code in an immediately-invoked async function
async function start() {
  // Update the gRPC client and worker to use a local address and port
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
    console.log(`generating ${count} work items...`);

    const workItems: string[] = Array.from({ length: count }, (_, i) => `work item ${i}`);
    return workItems;
  }

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function processWorkItemActivity(context: WorkflowActivityContext, item: string): Promise<number> {
    console.log(`processing work item: ${item}`);

    // Simulate some work that takes a variable amount of time
    const sleepTime = Math.random() * 5000;
    await sleep(sleepTime);

    // Return a result for the given work item, which is also a random number in this case
    // For more information about random numbers in workflow please check
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

  // Wrap the worker startup in a try-catch block to handle any errors during startup
  try {
    await workflowRuntime.start();
    console.log("Worker started successfully");
  } catch (error) {
    console.error("Error starting worker:", error);
  }

  // Schedule a new orchestration
  try {
    const id = await workflowClient.scheduleNewWorkflow(workflow);
    console.log(`Orchestration scheduled with ID: ${id}`);

    // Wait for orchestration completion
    const state = await workflowClient.waitForWorkflowCompletion(id, undefined, 30);

    console.log(`Orchestration completed! Result: ${state?.serializedOutput}`);
  } catch (error) {
    console.error("Error scheduling or waiting for orchestration:", error);
  }

  // stop worker and client
  await workflowRuntime.stop();
  await workflowClient.stop();

  // stop the dapr side car
  process.exit(0);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```



{{% codetab %}}

<!--dotnet-->

```csharp
// Get a list of N work items to process in parallel.
object[] workBatch = await context.CallActivityAsync<object[]>("GetWorkBatch", null);

// Schedule the parallel tasks, but don't wait for them to complete yet.
var parallelTasks = new List<Task<int>>(workBatch.Length);
for (int i = 0; i < workBatch.Length; i++)
{
    Task<int> task = context.CallActivityAsync<int>("ProcessWorkItem", workBatch[i]);
    parallelTasks.Add(task);
}

// Everything is scheduled. Wait here until all parallel tasks have completed.
await Task.WhenAll(parallelTasks);

// Aggregate all N outputs and publish the result.
int sum = parallelTasks.Sum(t => t.Result);
await context.CallActivityAsync("PostResults", sum);
```



{{% codetab %}}

<!--java-->

```java
public class FaninoutWorkflow extends Workflow {
    @Override
    public WorkflowStub create() {
        return ctx -> {
            // Get a list of N work items to process in parallel.
            Object[] workBatch = ctx.callActivity("GetWorkBatch", Object[].class).await();
            // Schedule the parallel tasks, but don't wait for them to complete yet.
            List<Task<Integer>> tasks = Arrays.stream(workBatch)
                    .map(workItem -> ctx.callActivity("ProcessWorkItem", workItem, int.class))
                    .collect(Collectors.toList());
            // Everything is scheduled. Wait here until all parallel tasks have completed.
            List<Integer> results = ctx.allOf(tasks).await();
            // Aggregate all N outputs and publish the result.
            int sum = results.stream().mapToInt(Integer::intValue).sum();
            ctx.complete(sum);
        };
    }
}
```



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
	fmt.Printf("Processing work item: %d\n", workItem)
	time.Sleep(time.Second * 5)
	result := workItem * 2
	fmt.Printf("Work item %d processed. Result: %d\n", workItem, result)
	return result, nil
}
func ProcessResults(ctx workflow.ActivityContext) (any, error) {
	var finalResult int
	if err := ctx.GetInput(&finalResult); err != nil {
		return 0, err
	}
	fmt.Printf("Final result: %d\n", finalResult)
	return finalResult, nil
}
```



{{< /tabs >}}

此示例的关键要点是：

- 扇出/扇入模式可以用普通编程结构表达为一个简单函数
- 并行任务的数量可以是静态的，也可以是动态的
- 工作流本身能够聚合并行执行的结果

虽然示例中未显示，但可以使用特定于语言的简单构造更进一步并限制并发程度。 此外，工作流的执行是持久的。 如果工作流启动 100 个并行任务执行，并且在流程崩溃之前仅完成 40 个，则工作流会自动重新启动，并且仅计划剩余的 60 个任务。

## 异步 HTTP API

异步HTTP API通常使用[异步请求-回复模式](https://learn.microsoft.com/azure/architecture/patterns/async-request-reply)来实现。 传统上，实现此模式涉及以下内容：

1. 一个客户端向一个HTTP API端点发送请求（_start API_）
2. _start API_ 向后端队列写入信息，从而触发长期运行操作的启动
3. 在调度后端操作后，_start API_ 立即向客户端返回 HTTP 202 响应，其中包含可用于轮询状态的标识符
4. _status API_ 查询包含长期运行操作状态的数据库
5. 客户端会反复轮询_status API_，直到超时或收到"完成"响应为止

端到端流程如下图所示。

<img src="/images/workflow-overview/workflow-async-request-response.png" width=800 alt="Diagram showing how the async request response pattern works"/>

实现异步请求-回复模式的挑战在于，它涉及多个应用程序接口和状态存储的使用。 这还包括正确执行协议，以便客户端知道如何自动轮询状态，并知道操作何时完成。

Dapr 工作流 HTTP API 支持开箱即用的异步请求-回复模式，无需编写任何代码或进行任何状态管理。

以下 `curl` 命令说明了工作流 API 如何支持这种模式。

```bash
curl -X POST http://localhost:3500/v1.0-beta1/workflows/dapr/OrderProcessingWorkflow/start?instanceID=12345678 -d '{"Name":"Paperclips","Quantity":1,"TotalCost":9.95}'
```

上一条命令将产生以下 JSON 响应：

```json
{"instanceID":"12345678"}
```

然后，HTTP 客户端可以使用工作流实例 ID 构建状态查询 URL，并反复轮询，直到在有效负载中看到 "COMPLETE"、"FAILURE "或 "TERMINATED "状态。

```bash
curl http://localhost:3500/v1.0-beta1/workflows/dapr/12345678
```

下面是一个正在进行的工作流程状态示例。

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

如您可以从前面的示例中看到，工作流的运行状态是`RUNNING`，这让客户端知道它应该继续轮询。

如果工作流已完成，则状态可能如下所示。

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

从上一个示例可以看出，工作流的运行状态现在是 `COMPLETED`，这意味着客户端可以停止轮询更新。

## 监控

监控模式是一种典型的循环过程：

1. 检查系统状态
2. 根据该状态采取一些操作 - 例如发送通知
3. 睡眠一段时间
4. 重复

下图提供了此模式的粗略说明。

<img src="/images/workflow-overview/workflow-monitor-pattern.png" width=600 alt="Diagram showing how the monitor pattern works"/>

根据业务需要，可能只有一个监控器，也可能有多个监控器，每个业务实体（如股票）一个。 此外，睡眠时间可能需要根据具体情况进行调整。 这些要求使得使用基于 cron 的调度系统变得不切实际。

Dapr 工作流原生支持这种模式，允许您实现_永恒的工作流_。 与其编写无限的 while 循环（这是一种反模式），Dapr Workflow 提供了一个 _continue-as-new_ API，工作流作者可以使用它从头开始重新启动一个工作流函数，并使用新的输入。



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
    # poll a status endpoint associated with this job
    status = yield ctx.call_activity(check_status, input=job)
    if not ctx.is_replaying:
        print(f"Job '{job.job_id}' is {status}.")

    if status == "healthy":
        job.is_healthy = True
        next_sleep_interval = 60  # check less frequently when healthy
    else:
        if job.is_healthy:
            job.is_healthy = False
            ctx.call_activity(send_alert, input=f"Job '{job.job_id}' is unhealthy!")
        next_sleep_interval = 5  # check more frequently when unhealthy

    yield ctx.create_timer(fire_at=ctx.current_utc_datetime + timedelta(seconds=next_sleep_interval))

    # restart from the beginning with a new JobStatus input
    ctx.continue_as_new(job)


def check_status(ctx, _) -> str:
    return random.choice(["healthy", "unhealthy"])


def send_alert(ctx, message: str):
    print(f'*** Alert: {message}')
```



{{% codetab %}}

<!--javascript-->

```javascript
const statusMonitorWorkflow: TWorkflow = async function* (ctx: WorkflowContext): any {
    let duration;
    const status = yield ctx.callActivity(checkStatusActivity);
    if (status === "healthy") {
      // Check less frequently when in a healthy state
      // set duration to 1 hour
      duration = 60 * 60;
    } else {
      yield ctx.callActivity(alertActivity, "job unhealthy");
      // Check more frequently when in an unhealthy state
      // set duration to 5 minutes
      duration = 5 * 60;
    }

    // Put the workflow to sleep until the determined time
    ctx.createTimer(duration);

    // Restart from the beginning with the updated state
    ctx.continueAsNew();
  };
```



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

        // Check less frequently when in a healthy state
        nextSleepInterval = TimeSpan.FromMinutes(60);
    }
    else
    {
        if (myEntityState.IsHealthy)
        {
            myEntityState.IsHealthy = false;
            await context.CallActivityAsync("SendAlert", myEntityState);
        }

        // Check more frequently when in an unhealthy state
        nextSleepInterval = TimeSpan.FromMinutes(5);
    }

    // Put the workflow to sleep until the determined time
    await context.CreateTimer(nextSleepInterval);

    // Restart from the beginning with the updated state
    context.ContinueAsNew(myEntityState);
    return null;
}
```

> 这个示例假设您有一个预定义的 `MyEntityState` 类，其中有一个布尔 `IsHealthy` 属性。



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
        // Check less frequently when in a healthy state
        nextSleepInterval = Duration.ofMinutes(60);
      } else {

        ctx.callActivity(DemoWorkflowAlertActivity.class.getName()).await();

        // Check more frequently when in an unhealthy state
        nextSleepInterval = Duration.ofMinutes(5);
      }

      // Put the workflow to sleep until the determined time
      try {
        ctx.createTimer(nextSleepInterval);
      } catch (InterruptedException e) {
        throw new RuntimeException(e);
      }

      // Restart from the beginning with the updated state
      ctx.continueAsNew();
    }
  }
}
```



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
		sleepInterval = time.Second * 60
	} else {
		if job.IsHealthy {
			job.IsHealthy = false
			err := ctx.CallActivity(SendAlert, workflow.ActivityInput(fmt.Sprintf("Job '%s' is unhealthy!", job.JobID))).Await(nil)
			if err != nil {
				return "", err
			}
		}
		sleepInterval = time.Second * 5
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



{{< /tabs >}}

实施监控模式的工作流可以永远循环，也可以通过不调用 _continue-as-new_ 从容终止。

{{% alert title="注意" color="primary" %}}
这个模式也可以使用**actors**和**提醒**来表示。 不同之处在于，该工作流程以单个函数的形式表达，输入和状态存储在本地变量中。 必要时，工作流还可以执行一系列具有更强可靠性保证的操作。
{{% /alert %}}

## 外部系统交互

在某些情况下，工作流可能需要暂停并等待外部系统执行某些操作。 例如，工作流可能需要暂停，等待收到付款。 在这种情况下，支付系统可能会在收到付款时将事件发布到发布/订阅主题，并且该主题的监听器可以使用[发起事件工作流 API]({{< ref "howto-manage-workflow\.md#raise-an-event" >}})。

另一种非常常见的情况是工作流需要暂停并等待人工操作，例如在审批采购订单时。 Dapr Workflow通过[外部事件]({{< ref "workflow-features-concepts.md#external-events" >}})特性来支持这种事件模式。

下面是涉及人员的采购订单的示例工作流：

1. 收到采购订单时将触发工作流。
2. 工作流中的规则确定需要人工执行某些操作。 例如，采购订单金额超过了某个自动审批阈值。
3. 工作流发送通知，请求人工操作。 例如，向指定的审批人发送带有审批链接的电子邮件。
4. 工作流暂停，等待人工点击链接批准或拒绝订单。
5. 如果在指定时间内未收到审核，工作流将恢复并执行一些补偿逻辑，例如取消订单。

下图说明了此流程。

<img src="/images/workflow-overview/workflow-human-interaction-pattern.png" width=600 alt="Diagram showing how the external system interaction pattern works with a human involved"/>

下面的示例代码展示了如何使用 Dapr 工作流实现这种模式。



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
    # Orders under $1000 are auto-approved
    if order.cost < 1000:
        return "Auto-approved"

    # Orders of $1000 or more require manager approval
    yield ctx.call_activity(send_approval_request, input=order)

    # Approvals must be received within 24 hours or they will be canceled.
    approval_event = ctx.wait_for_external_event("approval_received")
    timeout_event = ctx.create_timer(timedelta(hours=24))
    winner = yield wf.when_any([approval_event, timeout_event])
    if winner == timeout_event:
        return "Cancelled"

    # The order was approved
    yield ctx.call_activity(place_order, input=order)
    approval_details = Approval.from_dict(approval_event.get_result())
    return f"Approved by '{approval_details.approver}'"


def send_approval_request(_, order: Order) -> None:
    print(f'*** Sending approval request for order: {order}')


def place_order(_, order: Order) -> None:
    print(f'*** Placing order: {order}')
```



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

// Wrap the entire code in an immediately-invoked async function
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

  // Update the gRPC client and worker to use a local address and port
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

  // Activity function that sends an approval request to the manager
  const sendApprovalRequest = async (_: WorkflowActivityContext, order: Order) => {
    // Simulate some work that takes an amount of time
    await sleep(3000);
    console.log(`Sending approval request for order: ${order.product}`);
  };

  // Activity function that places an order
  const placeOrder = async (_: WorkflowActivityContext, order: Order) => {
    console.log(`Placing order: ${order.product}`);
  };

  // Orchestrator function that represents a purchase order workflow
  const purchaseOrderWorkflow: TWorkflow = async function* (ctx: WorkflowContext, order: Order): any {
    // Orders under $1000 are auto-approved
    if (order.cost < 1000) {
      return "Auto-approved";
    }

    // Orders of $1000 or more require manager approval
    yield ctx.callActivity(sendApprovalRequest, order);

    // Approvals must be received within 24 hours or they will be cancled.
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

  // Wrap the worker startup in a try-catch block to handle any errors during startup
  try {
    await workflowRuntime.start();
    console.log("Worker started successfully");
  } catch (error) {
    console.error("Error starting worker:", error);
  }

  // Schedule a new orchestration
  try {
    const cost = readlineSync.questionInt("Cost of your order:");
    const approver = readlineSync.question("Approver of your order:");
    const timeout = readlineSync.questionInt("Timeout for your order in seconds:");
    const order = new Order(cost, "MyProduct", 1);
    const id = await workflowClient.scheduleNewWorkflow(purchaseOrderWorkflow, order);
    console.log(`Orchestration scheduled with ID: ${id}`);

    // prompt for approval asynchronously
    promptForApproval(approver, workflowClient, id);

    // Wait for orchestration completion
    const state = await workflowClient.waitForWorkflowCompletion(id, undefined, timeout + 2);

    console.log(`Orchestration completed! Result: ${state?.serializedOutput}`);
  } catch (error) {
    console.error("Error scheduling or waiting for orchestration:", error);
  }

  // stop worker and client
  await workflowRuntime.stop();
  await workflowClient.stop();

  // stop the dapr side car
  process.exit(0);
}

async function promptForApproval(approver: string, workflowClient: DaprWorkflowClient, id: string) {
  if (readlineSync.keyInYN("Press [Y] to approve the order... Y/yes, N/no")) {
    const approvalEvent = { approver: approver };
    await workflowClient.raiseEvent(id, "approval_received", approvalEvent);
  } else {
    return "Order rejected";
  }
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```



{{% codetab %}}

<!--dotnet-->

```csharp
public override async Task<OrderResult> RunAsync(WorkflowContext context, OrderPayload order)
{
    // ...(other steps)...

    // Require orders over a certain threshold to be approved
    if (order.TotalCost > OrderApprovalThreshold)
    {
        try
        {
            // Request human approval for this order
            await context.CallActivityAsync(nameof(RequestApprovalActivity), order);

            // Pause and wait for a human to approve the order
            ApprovalResult approvalResult = await context.WaitForExternalEventAsync<ApprovalResult>(
                eventName: "ManagerApproval",
                timeout: TimeSpan.FromDays(3));
            if (approvalResult == ApprovalResult.Rejected)
            {
                // The order was rejected, end the workflow here
                return new OrderResult(Processed: false);
            }
        }
        catch (TaskCanceledException)
        {
            // An approval timeout results in automatic order cancellation
            return new OrderResult(Processed: false);
        }
    }

    // ...(other steps)...

    // End the workflow with a success result
    return new OrderResult(Processed: true);
}
```

> **注意** 在上面的示例中，`RequestApprovalActivity`是要调用的工作流活动的名称，`ApprovalResult`是工作流应用程序定义的枚举。 为简洁起见，示例代码中未包含这些定义。



{{% codetab %}}

<!--java-->

```java
public class ExternalSystemInteractionWorkflow extends Workflow {
    @Override
    public WorkflowStub create() {
        return ctx -> {
            // ...other steps...
            Integer orderCost = ctx.getInput(int.class);
            // Require orders over a certain threshold to be approved
            if (orderCost > ORDER_APPROVAL_THRESHOLD) {
                try {
                    // Request human approval for this order
                    ctx.callActivity("RequestApprovalActivity", orderCost, Void.class).await();
                    // Pause and wait for a human to approve the order
                    boolean approved = ctx.waitForExternalEvent("ManagerApproval", Duration.ofDays(3), boolean.class).await();
                    if (!approved) {
                        // The order was rejected, end the workflow here
                        ctx.complete("Process reject");
                    }
                } catch (TaskCanceledException e) {
                    // An approval timeout results in automatic order cancellation
                    ctx.complete("Process cancel");
                }
            }
            // ...other steps...

            // End the workflow with a success result
            ctx.complete("Process approved");
        };
    }
}
```



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
	// Orders under $1000 are auto-approved
	if order.Cost < 1000 {
		return "Auto-approved", nil
	}
	// Orders of $1000 or more require manager approval
	if err := ctx.CallActivity(SendApprovalRequest, workflow.ActivityInput(order)).Await(nil); err != nil {
		return "", err
	}
	// Approvals must be received within 24 hours or they will be cancelled
	var approval Approval
	if err := ctx.WaitForExternalEvent("approval_received", time.Hour*24).Await(&approval); err != nil {
		// Assuming that a timeout has taken place - in any case; an error.
		return "error/cancelled", err
	}
	// The order was approved
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
	fmt.Printf("*** Sending approval request for order: %v\n", order)
	return "", nil
}
func PlaceOrder(ctx workflow.ActivityContext) (any, error) {
	var order Order
	if err := ctx.GetInput(&order); err != nil {
		return "", err
	}
	fmt.Printf("*** Placing order: %v", order)
	return "", nil
}
```



{{< /tabs >}}

传递事件以恢复工作流执行的代码是工作流的外部代码。 工作流事件可通过 [raise event]({{< ref "howto-manage-workflow\.md#raise-an-event" >}}) 工作流管理 API 传递到等待中的工作流实例，如下例所示:



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



{{% codetab %}}

<!--javascript-->

```javascript
import { DaprClient } from "@dapr/dapr";

  public async raiseEvent(workflowInstanceId: string, eventName: string, eventPayload?: any) {
    this._innerClient.raiseOrchestrationEvent(workflowInstanceId, eventName, eventPayload);
  }
```



{{% codetab %}}

<!--dotnet-->

```csharp
// Raise the workflow event to the waiting workflow
await daprClient.RaiseWorkflowEventAsync(
    instanceId: orderId,
    workflowComponent: "dapr",
    eventName: "ManagerApproval",
    eventData: ApprovalResult.Approved);
```



{{% codetab %}}

<!--java-->

```java
System.out.println("**SendExternalMessage: RestartEvent**");
client.raiseEvent(restartingInstanceId, "RestartEvent", "RestartEventPayload");
```



{{% codetab %}}

<!--go-->

```go
func raiseEvent() {
  daprClient, err := client.NewClient()
  if err != nil {
    log.Fatalf("failed to initialize the client")
  }
  err = daprClient.RaiseEventWorkflowBeta1(context.Background(), &client.RaiseEventWorkflowRequest{
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



{{< /tabs >}}

外部事件不一定由人类直接触发。 它们也可以由其他系统触发。 例如，工作流可能需要暂停，等待收到付款。 在这种情况下，支付系统可能会在收到付款时将事件发布到发布/订阅主题，并且该主题的监听器可以使用 发起事件工作流 API.

## 下一步

{{< button text="工作流模式 >>" page="workflow-architecture.md" >}}

## 相关链接

- [尝试使用 Dapr Workflows 快速入门]({{< ref workflow-quickstart.md >}})
- [Dapr概述]({{< ref workflow-overview\.md >}})
- [Workflow API 参考文档]({{< ref workflow_api.md >}})
- 试用以下示例:
  - [Python](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow)
  - [JavaScript](https://github.com/dapr/js-sdk/tree/main/examples/workflow)
  - [.NET](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
  - [Java](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)
  - [Go](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)
