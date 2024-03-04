---
type: docs
title: 工作流模式
linkTitle: 工作流模式
weight: 3000
description: "编写不同类型的工作流模式"
---

Dapr 工作流简化了微服务架构中复杂的有状态协调要求。 以下部分介绍了可以从 Dapr 工作流中受益的几种应用程序模式。

## 任务链

在任务链模式中，工作流中的多个步骤连续运行，一个步骤的输出可以作为下一步的输入传递。 任务链工作流通常涉及创建需要对某些数据执行的操作序列，例如筛选、转换和缩减。

<img src="/images/workflow-overview/workflows-chaining.png" width=800 alt="任务链工作流程模式工作原理图">

在某些情况下，可能需要跨多个微服务编排工作流的步骤。 为了提高可靠性和可伸缩性，还可以使用队列来触发各个步骤。

虽然模式很简单，但实现中隐藏着许多复杂性。 例如：

- 如果其中一个微服务长时间不可用，会发生什么情况？
- 失败的步骤可以自动重试吗？
- 如果不行，如何在适用的情况下为回滚先前完成的步骤提供便利？
- 撇开实施细节不谈，是否有办法将工作流程可视化，以便其他工程师了解工作流程的作用和工作方式？

Dapr 工作流解决了这些复杂问题，它允许您在自己选择的编程语言中以简单函数的形式简洁地实现任务链模式，如下例所示。

{{< tabs Python ".NET" Java >}}

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
    # 做一些补偿性工作
```

> **注意** 工作流重试策略将在 Python SDK 的未来版本中提供。

{{% /codetab %}}

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

<img src="/images/workflow-overview/workflows-fanin-fanout.png" width=800 alt="扇出/扇入工作流程模式示意图">

除了在 [之前的模式]({{< ref "workflow-patterns.md#task-chaining" >}})中提到的挑战之外，在手动实施扇出/扇入模式时还需要考虑几个重要问题：

- 如何控制并行度？
- 如何知道何时触发后续聚合步骤？
- 如果并行步骤的数量是动态的，该怎么办？

Dapr 工作流提供了一种将扇出/扇入模式表达为简单函数的方法，如下例所示：

{{< tabs Python ".NET" Java >}}

{{% codetab %}}
<!--python-->

```python
import time
from typing import List
import dapr.ext.workflow as wf


def batch_processing_workflow(ctx: wf.DaprWorkflowContext, wf_input: int)：
    # 获得一批 N 个并行处理的工作项
    work_batch = yield ctx.call_activity(get_work_batch, input=wf_input)

    # 安排 N 个并行任务来处理工作项，并等待所有任务完成
    parallel_tasks = [ctx.call_activity(process_work_item, input=work_item) for work_item in work_batch]
    outputs = yield wf.when_all(parallel_tasks)

    # 汇总结果并将其发送到另一个活动
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

{{% /codetab %}}

{{% codetab %}}
<!--dotnet-->

```csharp
// 获取要并行处理的 N 个工作项的列表。
object[] workBatch = await context.CallActivityAsync<object[]>("GetWorkBatch", null);

// 安排并行任务，但先不要等待它们完成。
var parallelTasks = new List<Task<int>>(workBatch.Length);
for (int i = 0; i < workBatch.Length; i++)
{
    Task<int> task = context.CallActivityAsync<int>("ProcessWorkItem", workBatch[i]);
    parallelTasks.Add(task);
}

// 一切都已排定。 在此等待，直到所有并行任务完成。
await Task.WhenAll(parallelTasks);

// 汇总所有 N 个输出并发布结果。
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
            // Get a list of N work items to process in parallel.
            Object[] workBatch = ctx.callActivity("GetWorkBatch", Object[].class).await();
            // Schedule the parallel tasks, but don't wait for them to complete yet.
            List<Task<Integer>> tasks = Arrays.stream(workBatch)
                    .map(workItem -> ctx.callActivity("ProcessWorkItem", workItem, int.class))
                    .collect(Collectors.toList());
            // Everything is scheduled. 在此等待，直到所有并行任务完成。
            List<Integer> results = ctx.allOf(tasks).await();
            // Aggregate all N outputs and publish the result.
            int sum = results.stream().mapToInt(Integer::intValue).sum();
            ctx.complete(sum);
        };
    }
}
```

{{% /codetab %}}

{{< /tabs >}}

此示例的关键要点是：

- 扇出/扇入模式可以用普通编程结构表达为一个简单函数
- 并行任务的数量可以是静态的，也可以是动态的
- 工作流本身能够聚合并行执行的结果

虽然示例中未显示，但可以使用特定于语言的简单构造更进一步并限制并发程度。 此外，工作流的执行是持久的。 如果工作流启动 100 个并行任务执行，并且在流程崩溃之前仅完成 40 个，则工作流会自动重新启动，并且仅计划剩余的 60 个任务。

## 异步 HTTP API

异步 HTTP API 通常使用 [异步请求-回复模式](https://learn.microsoft.com/azure/architecture/patterns/async-request-reply)来实现。 传统上，实现此模式涉及以下内容：

1. 客户端向 HTTP API 端点发送请求（ _start API_)
1. _start API_ 向后端队列写入信息，从而触发长期运行操作的启动
1. 在调度后端操作后， _start API_ 立即向客户端返回 HTTP 202 响应，其中包含可用于轮询状态的标识符
1. _status API_ 查询包含长期运行操作状态的数据库
1. 客户端会反复轮询 _status API_ ，直到超时或收到 "完成 "响应为止。

端到端流程如下图所示。

<img src="/images/workflow-overview/workflow-async-request-response.png" width=800 alt="异步请求响应模式工作原理图" />

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

从上一个示例可以看出，工作流的运行状态是 `RUNNING`，这让客户端知道它应该继续轮询。

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
1. 根据该状态采取一些操作 - 例如发送通知
1. 睡眠一段时间
1. 重复

下图提供了此模式的粗略说明。

<img src="/images/workflow-overview/workflow-monitor-pattern.png" width=600 alt="监视器模式工作原理图" />

根据业务需要，可能只有一个监控器，也可能有多个监控器，每个业务实体（如股票）一个。 此外，睡眠时间可能需要根据具体情况进行调整。 这些要求使得使用基于 cron 的调度系统变得不切实际。

Dapr 工作流原生支持这种模式，允许您实现 _永恒的工作流_。 Dapr Workflow 提供了 _continue-as-new_ API，工作流作者可以使用它从头开始重新启动工作流函数，并输入新的内容，而不是编写无限的 while-loops（[这是一种反模式]({{< ref "workflow-features-concepts.md#infinite-loops-and-eternal-workflows" >}})）。

{{< tabs Python ".NET" Java >}}

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


def status_monitor_workflow(ctx: wf.DaprWorkflowContext, job: JobStatus)：
    # 轮询与此作业关联的状态端点
    status = yield ctx.call_activity(check_status, input=job)
    if not ctx.is_replaying:
        print(f "Job '{job.job_id}' is {status}.")

    if status == "healthy":
        job.is_healthy = True
        next_sleep_interval = 60  # check less frequently when healthy
    else:
        if job.is_healthy:
            job.is_healthy = False
            ctx.call_activity(send_alert, input=f"Job '{job.job_id}' is unhealthy!")
        next_sleep_interval = 5 # 不健康时更频繁地检查

    yield ctx.create_timer(fire_at=ctx.current_utc_datetime + timedelta(seconds=next_sleep_interval))

    # 使用新的 JobStatus 输入从头开始
    ctx.continue_as_new(job)


def check_status(ctx, _) -> str：
    return random.choice(["healthy", "unhealthy"])


def send_alert(ctx, message: str):
    print(f'*** Alert: {message}')
```

{{% /codetab %}}

{{% codetab %}}
<!--dotnet-->

```csharp
public override async Task<object> RunAsync(WorkflowContext context, MyEntityState myEntityState)
{
    TimeSpan nextSleepInterval;

    var status = await context.CallActivityAsync<string>("GetStatus");
    if (status =="healthy")
    {
        myEntityState.IsHealthy = true;

        // 处于健康状态时减少检查频率
        nextSleepInterval = TimeSpan.FromMinutes(60);
    }
    else
    {
        if (myEntityState.IsHealthy)
        {
            myEntityState.IsHealthy = false;
            await context.CallActivityAsync("SendAlert", myEntityState);
        }

        // 处于不健康状态时更频繁地检查
        nextSleepInterval = TimeSpan.FromMinutes(5);
    }

    // 让工作流休眠到确定的时间
    await context.CreateTimer(nextSleepInterval);

    // 用更新的状态从头开始重新启动
    context.ContinueAsNew(myEntityState);
    return null;
}
```

> 本示例假定您有一个预定义的 `MyEntityState` 类，其中有一个布尔 `IsHealthy` 属性。

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
        // Check less frequently when in a healthy state
        nextSleepInterval = Duration.ofMinutes(60);
      } else {

        ctx.callActivity(DemoWorkflowAlertActivity.class.getName()).await();

        // Check more frequently when in an unhealthy state
        nextSleepInterval = Duration.ofMinutes(5);
      }

      // Put the workflow to sleep until the determined time
      // Note: ctx.createTimer() method is not supported in the Java SDK yet
      try {
        TimeUnit.SECONDS.sleep(nextSleepInterval.getSeconds());
      } catch (InterruptedException e) {
        throw new RuntimeException(e);
      }

      // Restart from the beginning with the updated state
      ctx.continueAsNew();
    }
  }
}
```

{{% /codetab %}}

{{< /tabs >}}

实施监控模式的工作流可以永远循环，也可以通过不调用 _continue-as-new_ 从容终止。

{{% alert title="Note" color="primary" %}}
这种模式也可以用 actor 和提醒来表达。 不同之处在于，该工作流程以单个函数的形式表达，输入和状态存储在本地变量中。 必要时，工作流还可以执行一系列具有更强可靠性保证的操作。
{{% /alert %}}

## 外部系统交互

在某些情况下，工作流可能需要暂停并等待外部系统执行某些操作。 例如，工作流可能需要暂停，等待收到付款。 在这种情况下，支付系统可能会在收到付款时将事件发布到发布/订阅主题，并且该主题的监听器可以使用 [发起事件工作流 API]({{< ref "howto-manage-workflow.md#raise-an-event" >}}).

另一种非常常见的情况是工作流需要暂停并等待人工操作，例如在审批采购订单时。 Dapr 工作流通过 [外部事件]({{< ref "workflow-features-concepts.md#external-events" >}}) 功能支持这种事件模式。

下面是涉及人员的采购订单的示例工作流：

1. 收到采购订单时将触发工作流。
1. 工作流中的规则确定需要人工执行某些操作。 例如，采购订单金额超过了某个自动审批阈值。
1. 工作流发送通知，请求人工操作。 例如，向指定的审批人发送带有审批链接的电子邮件。
1. 工作流暂停，等待人工点击链接批准或拒绝订单。
1. 如果在指定时间内未收到审核，工作流将恢复并执行一些补偿逻辑，例如取消订单。

下图说明了此流程。

<img src="/images/workflow-overview/workflow-human-interaction-pattern.png" width=600 alt="显示外部系统互动模式如何与人类互动的示意图" />

下面的示例代码展示了如何使用 Dapr 工作流实现这种模式。

{{< tabs Python ".NET" Java >}}

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


def purchase_order_workflow(ctx: wf.DaprWorkflowContext, order: Order)：
    # 1000 美元以下的订单自动批准
    if order.cost < 1000:
        return "Auto-approved"

    # 1000 美元或以上的订单需要经理批准
    yield ctx.call_activity(send_approval_request, input=order)

    # 批准必须在 24 小时内收到，否则将被取消。
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

{{% /codetab %}}

{{% codetab %}}
<!--dotnet-->

```csharp
public override async Task<OrderResult> RunAsync(WorkflowContext context, OrderPayload order)
{
    // ...(other steps)...

    // 要求超过一定阈值的订单才能获得批准
    if (order.TotalCost > OrderApprovalThreshold)
    {
        try
        {
            // 请求人工批准此订单
            await context.CallActivityAsync(nameof(RequestApprovalActivity), order);

            // 暂停并等待人工审批订单
            ApprovalResult approvalResult = await context.WaitForExternalEventAsync<ApprovalResult>(
                eventName："ManagerApproval",
                timeout：TimeSpan.FromDays(3));
            if (approvalResult == ApprovalResult.Rejected)
            {
                // 订单被拒绝，在此结束工作流
                return new OrderResult(Processed: false);
            }
        }
        catch (TaskCanceledException)
        {
            // 批准超时导致自动取消订单
            return new OrderResult(Processed: false);
        }
    }

    // ...（其他步骤）...

    // End the workflow with a success result
    return new OrderResult(Processed: true);
}
```

> **注意** 在上例中，`RequestApprovalActivity` 是要调用的工作流活动名称，`ApprovalResult` 是工作流应用程序定义的枚举。 为简洁起见，示例代码中未包含这些定义。

{{% /codetab %}}

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

{{% /codetab %}}

{{< /tabs >}}

传递事件以恢复工作流执行的代码是工作流的外部代码。 工作流事件可通过 [raise event]({{< ref "howto-manage-workflow.md#raise-an-event" >}}) 工作流管理 API 传递到等待中的工作流实例，如下例所示：

{{< tabs Python ".NET" Java >}}

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
<!--dotnet-->

```csharp
// 向等待中的工作流引发工作流事件
await daprClient.RaiseWorkflowEventAsync(
    instanceId: orderId,
    workflowComponent："dapr",
    eventName："ManagerApproval",
    eventData：ApprovalResult.Approved)；
```

{{% /codetab %}}

{{% codetab %}}
<!--java-->

```java
System.out.println("**SendExternalMessage: RestartEvent**");
client.raiseEvent(restartingInstanceId, "RestartEvent", "RestartEventPayload");
```

{{% /codetab %}}

{{< /tabs >}}

外部事件不一定由人类直接触发。 它们也可以由其他系统触发。 例如，工作流可能需要暂停，等待收到付款。 在这种情况下，支付系统可能会在收到付款时将事件发布到发布/订阅主题，并且该主题的监听器可以使用 发起事件工作流 API.

## 下一步

{{< button text="Workflow architecture >>" page="workflow-architecture.md" >}}

## 相关链接

- [使用快速入门试用 Dapr 工作流]({{< ref workflow-quickstart.md >}})
- [工作流概述]({{< ref workflow-overview.md >}})
- [工作流 API 参考文档]({{< ref workflow_api.md >}})
- 试用以下示例:
   - [Python](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow)
   - [.NET](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
   - [Java](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)