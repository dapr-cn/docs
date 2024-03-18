---
type: docs
title: 指南：如何编写工作流
linkTitle: 如何：创作工作流
weight: 5000
description: 学习如何开发和编写工作流
---

{{% alert title="注意" color="primary" %}}
Dapr工作流目前处于beta阶段。 [查看已知限制 {{% dapr-latest-version cli="true" %}}]({{< ref "workflow-overview\.md#limitations" >}}).
{{% /alert %}}

本文简要概述了如何创作由 Dapr 工作流引擎执行的工作流。

{{% alert title="注意" color="primary" %}}
如果你还没有，请[尝试使用工作流快速入门]({{< ref workflow-quickstart.md >}})快速了解如何使用工作流。

{{% /alert %}}

## 将工作流作为代码编写

Dapr 工作流逻辑使用通用编程语言实现，使您可以：

- 使用你喜欢的编程语言（无需学习新的 DSL 或 YAML 模式）。
- 可以访问该语言的标准库。
- 构建您自己的库和抽象。
- 使用调试器并检查局部变量。
- 为工作流编写单元测试，就像应用程序逻辑的其他部分一样。

Dapr sidecar 不加载任何工作流定义。 相反，Sidecar 只是驱动工作流的执行，让所有工作流活动成为应用程序的一部分。

## 编写工作流活动

[工作流活动]({{< ref "workflow-features-concepts.md#workflow-activites" >}})是工作流中的基本工作单元，是在业务流程中编排的任务。

{{< tabs Python JavaScript ".NET" Java Go >}}

{{% codetab %}}

<!--python-->

定义您希望工作流执行的工作流活动。 活动是一个函数定义，可以接受输入和输出。 下面的示例创建了一个计数器（活动）称为 `hello_act`，通知用户当前的计数器值。 `hello_act` 是一个从名为 `WorkflowActivityContext` 的类派生出来的函数。

```python
def hello_act(ctx: WorkflowActivityContext, input):
    global counter
    counter += input
    print(f'New counter value is: {counter}!', flush=True)
```

[查看上下文中的`hello_act`工作流活动。](https://github.com/dapr/python-sdk/blob/master/examples/demo_workflow/app.py#LL40C1-L43C59)

{{% /codetab %}}

{{% codetab %}}

<!--javascript-->

定义您希望工作流执行的工作流活动。 活动被包装在实现工作流活动的`WorkflowActivityContext`类中。

```javascript
export default class WorkflowActivityContext {
  private readonly _innerContext: ActivityContext;
  constructor(innerContext: ActivityContext) {
    if (!innerContext) {
      throw new Error("ActivityContext cannot be undefined");
    }
    this._innerContext = innerContext;
  }

  public getWorkflowInstanceId(): string {
    return this._innerContext.orchestrationId;
  }

  public getWorkflowActivityId(): number {
    return this._innerContext.taskId;
  }
}
```

[查看工作流活动的上下文。](https://github.com/dapr/js-sdk/blob/main/src/workflow/runtime/WorkflowActivityContext.ts)

{{% /codetab %}}

{{% codetab %}}

<!--csharp-->

定义您希望工作流执行的工作流活动。 活动是一个类的定义，可以有输入和输出。 活动还参与依赖注入，如绑定到 Dapr 客户端。

以下示例中调用的活动包括：

- `NotifyActivity`: 接收新订单通知。
- `ReserveInventoryActivity`：检查是否有足够的库存来满足新订单。
- `ProcessPaymentActivity`: 处理订单的付款。 包括`NotifyActivity`来发送成功订单的通知。

### NotifyActivity

```csharp
public class NotifyActivity : WorkflowActivity<Notification, object>
{
    //...

    public NotifyActivity(ILoggerFactory loggerFactory)
    {
        this.logger = loggerFactory.CreateLogger<NotifyActivity>();
    }

    //...
}
```

[查看完整的 `NotifyActivity.cs` 工作流活动示例。](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Activities/NotifyActivity.cs)

### ReserveInventoryActivity

```csharp
public class ReserveInventoryActivity : WorkflowActivity<InventoryRequest, InventoryResult>
{
    //...

    public ReserveInventoryActivity(ILoggerFactory loggerFactory, DaprClient client)
    {
        this.logger = loggerFactory.CreateLogger<ReserveInventoryActivity>();
        this.client = client;
    }

    //...

}
```

[查看完整的 `ReserveInventoryActivity.cs` 工作流活动示例。](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Activities/ReserveInventoryActivity.cs)

### ProcessPaymentActivity

```csharp
public class ProcessPaymentActivity : WorkflowActivity<PaymentRequest, object>
{
    //...
    public ProcessPaymentActivity(ILoggerFactory loggerFactory)
    {
        this.logger = loggerFactory.CreateLogger<ProcessPaymentActivity>();
    }

    //...

}
```

[查看完整的 `ProcessPaymentActivity.cs` 工作流活动示例。](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Activities/ProcessPaymentActivity.cs)

{{% /codetab %}}

{{% codetab %}}

<!--java-->

定义您希望工作流执行的工作流活动。 活动被包装在公共的`DemoWorkflowActivity`类中，该类实现了工作流活动。

```java
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class DemoWorkflowActivity implements WorkflowActivity {

  @Override
  public DemoActivityOutput run(WorkflowActivityContext ctx) {
    Logger logger = LoggerFactory.getLogger(DemoWorkflowActivity.class);
    logger.info("Starting Activity: " + ctx.getName());

    var message = ctx.getInput(DemoActivityInput.class).getMessage();
    var newMessage = message + " World!, from Activity";
    logger.info("Message Received from input: " + message);
    logger.info("Sending message to output: " + newMessage);

    logger.info("Sleeping for 5 seconds to simulate long running operation...");

    try {
      TimeUnit.SECONDS.sleep(5);
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }


    logger.info("Activity finished");

    var output = new DemoActivityOutput(message, newMessage);
    logger.info("Activity returned: " + output);

    return output;
  }
}
```

[查看上下文中的Java SDK工作流活动示例。](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/DemoWorkflowActivity.java)

{{% /codetab %}}

{{% codetab %}}

<!--go-->

定义您希望工作流执行的每个工作流活动。 可以使用`ctx.GetInput`从上下文中解组活动输入。 活动应该被定义为接受一个 `ctx workflow.ActivityContext` 参数并返回一个接口和错误。

```go
func TestActivity(ctx workflow.ActivityContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return "", err
	}
	
	// Do something here
	return "result", nil
}
```

[查看Go SDK工作流活动示例的上下文。](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)

{{% /codetab %}}

{{< /tabs >}}

## 编写工作流

接下来，在工作流中注册并调用活动。

{{< tabs Python JavaScript ".NET" Java Go >}}

{{% codetab %}}

<!--python-->

`hello_world_wf` 函数是从一个名为 `DaprWorkflowContext` 的类派生出来的，具有输入和输出参数类型。 它还包括一个“yield”语句，用于执行工作流的繁重工作并调用工作流活动。

```python
def hello_world_wf(ctx: DaprWorkflowContext, input):
    print(f'{input}')
    yield ctx.call_activity(hello_act, input=1)
    yield ctx.call_activity(hello_act, input=10)
    yield ctx.wait_for_external_event("event1")
    yield ctx.call_activity(hello_act, input=100)
    yield ctx.call_activity(hello_act, input=1000)
```

[查看上下文中的`hello_world_wf`工作流。](https://github.com/dapr/python-sdk/blob/master/examples/demo_workflow/app.py#LL32C1-L38C51)

{{% /codetab %}}

{{% codetab %}}

<!--javascript-->

接下来，使用 `WorkflowRuntime` 类注册工作流并启动工作流运行时。

```javascript
export default class WorkflowRuntime {

  //..
  // Register workflow implementation for handling orchestrations
  public registerWorkflow(workflow: TWorkflow): WorkflowRuntime {
    const name = getFunctionName(workflow);
    const workflowWrapper = (ctx: OrchestrationContext, input: any): any => {
      const workflowContext = new WorkflowContext(ctx);
      return workflow(workflowContext, input);
    };
    this.worker.addNamedOrchestrator(name, workflowWrapper);
    return this;
  }

  // Register workflow activities
  public registerActivity(fn: TWorkflowActivity<TInput, TOutput>): WorkflowRuntime {
    const name = getFunctionName(fn);
    const activityWrapper = (ctx: ActivityContext, intput: TInput): TOutput => {
      const wfActivityContext = new WorkflowActivityContext(ctx);
      return fn(wfActivityContext, intput);
    };
    this.worker.addNamedActivity(name, activityWrapper);
    return this;
  }

  // Start the workflow runtime processing items and block.
  public async start() {
    await this.worker.start();
  }

}
```

[查看上下文中的`WorkflowRuntime`。](https://github.com/dapr/js-sdk/blob/main/src/workflow/runtime/WorkflowRuntime.ts)

{{% /codetab %}}

{{% codetab %}}

<!--csharp-->

`OrderProcessingWorkflow` 类是从一个名为 `Workflow` 的基类派生出来的，具有输入和输出参数类型。 它还包括一个`RunAsync`方法，用于执行工作流的繁重工作并调用工作流活动。

```csharp
 class OrderProcessingWorkflow : Workflow<OrderPayload, OrderResult>
    {
        public override async Task<OrderResult> RunAsync(WorkflowContext context, OrderPayload order)
        {
            //...

            await context.CallActivityAsync(
                nameof(NotifyActivity),
                new Notification($"Received order {orderId} for {order.Name} at {order.TotalCost:c}"));

            //...

            InventoryResult result = await context.CallActivityAsync<InventoryResult>(
                nameof(ReserveInventoryActivity),
                new InventoryRequest(RequestId: orderId, order.Name, order.Quantity));
            //...
            
            await context.CallActivityAsync(
                nameof(ProcessPaymentActivity),
                new PaymentRequest(RequestId: orderId, order.TotalCost, "USD"));

            await context.CallActivityAsync(
                nameof(NotifyActivity),
                new Notification($"Order {orderId} processed successfully!"));

            // End the workflow with a success result
            return new OrderResult(Processed: true);
        }
    }
```

[查看完整的 `OrderProcessingWorkflow.cs` 工作流示例。](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Workflows/OrderProcessingWorkflow.cs)

{{% /codetab %}}

{{% codetab %}}

<!--java-->

接下来，使用 `WorkflowRuntimeBuilder` 注册工作流并启动工作流运行时。

```java
public class DemoWorkflowWorker {

  public static void main(String[] args) throws Exception {

    // Register the Workflow with the builder.
    WorkflowRuntimeBuilder builder = new WorkflowRuntimeBuilder().registerWorkflow(DemoWorkflow.class);
    builder.registerActivity(DemoWorkflowActivity.class);

    // Build and then start the workflow runtime pulling and executing tasks
    try (WorkflowRuntime runtime = builder.build()) {
      System.out.println("Start workflow runtime");
      runtime.start();
    }

    System.exit(0);
  }
}
```

[查看上下文中的Java SDK工作流。](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/DemoWorkflowWorker.java)

{{% /codetab %}}

{{% codetab %}}

<!--go-->

使用参数 `ctx *workflow.WorkflowContext` 定义您的工作流函数，并返回任何结果和错误。 从您的工作流中调用您定义的活动。

```go
func TestWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	var output string
	if err := ctx.CallActivity(TestActivity, workflow.ActivityInput(input)).Await(&output); err != nil {
		return nil, err
	}
	if err := ctx.WaitForExternalEvent("testEvent", time.Second*60).Await(&output); err != nil {
		return nil, err
	}
	
	if err := ctx.CreateTimer(time.Second).Await(nil); err != nil {
		return nil, nil
	}
	return output, nil
}
```

[查看上下文中的Go SDK工作流。](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)

{{% /codetab %}}

{{< /tabs >}}

## 编写应用程序

最后，使用工作流编写应用程序。

{{< tabs Python JavaScript ".NET" Java Go >}}

{{% codetab %}}

<!--python-->

[在下面的示例](https://github.com/dapr/python-sdk/blob/master/examples/demo_workflow/app.py)中，对于使用 Python SDK 的基本 Python hello world 应用程序，您的项目代码将包括：

- 一个名为 `DaprClient` 的 Python 包，用于接收 Python SDK 功能。
- 调用具有扩展的构建器：
  - `WorkflowRuntime`: 允许您注册工作流和工作流活动
  - `DaprWorkflowContext`: 允许您[创建工作流]({{< ref "#write-the-workflow" >}})
  - `WorkflowActivityContext`：允许您[创建工作流活动]({{< ref "#write-the-workflow-activities" >}})
- API 调用 在下面的示例中，这些调用包括启动、暂停、恢复、清除和终止工作流。

```python
from dapr.ext.workflow import WorkflowRuntime, DaprWorkflowContext, WorkflowActivityContext
from dapr.clients import DaprClient

# ...

def main():
    with DaprClient() as d:
        host = settings.DAPR_RUNTIME_HOST
        port = settings.DAPR_GRPC_PORT
        workflowRuntime = WorkflowRuntime(host, port)
        workflowRuntime = WorkflowRuntime()
        workflowRuntime.register_workflow(hello_world_wf)
        workflowRuntime.register_activity(hello_act)
        workflowRuntime.start()

        # Start workflow
        print("==========Start Counter Increase as per Input:==========")
        start_resp = d.start_workflow(instance_id=instanceId, workflow_component=workflowComponent,
                        workflow_name=workflowName, input=inputData, workflow_options=workflowOptions)
        print(f"start_resp {start_resp.instance_id}")

        # ...

        # Pause workflow
        d.pause_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f"Get response from {workflowName} after pause call: {getResponse.runtime_status}")

        # Resume workflow
        d.resume_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f"Get response from {workflowName} after resume call: {getResponse.runtime_status}")
        
        sleep(1)
        # Raise workflow
        d.raise_workflow_event(instance_id=instanceId, workflow_component=workflowComponent,
                    event_name=eventName, event_data=eventData)

        sleep(5)
        # Purge workflow
        d.purge_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        try:
            getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        except DaprInternalError as err:
            if nonExistentIDError in err._message:
                print("Instance Successfully Purged")

        # Kick off another workflow for termination purposes 
        start_resp = d.start_workflow(instance_id=instanceId, workflow_component=workflowComponent,
                        workflow_name=workflowName, input=inputData, workflow_options=workflowOptions)
        print(f"start_resp {start_resp.instance_id}")

        # Terminate workflow
        d.terminate_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        sleep(1)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f"Get response from {workflowName} after terminate call: {getResponse.runtime_status}")

        # Purge workflow
        d.purge_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        try:
            getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        except DaprInternalError as err:
            if nonExistentIDError in err._message:
                print("Instance Successfully Purged")

        workflowRuntime.shutdown()

if __name__ == '__main__':
    main()
```

{{% /codetab %}}

{{% codetab %}}

<!--javascript-->

[下面的示例](https://github.com/dapr/js-sdk/blob/main/src/workflow/client/DaprWorkflowClient.ts)是使用JavaScript SDK的基本JavaScript应用程序。 就像这个例子一样，您的项目代码将包括：

- 调用具有扩展的构建器：
  - `WorkflowRuntime`: 允许您注册工作流和工作流活动
  - `DaprWorkflowContext`: 允许您[创建工作流]({{< ref "#write-the-workflow" >}})
  - `WorkflowActivityContext`：允许您[创建工作流活动]({{< ref "#write-the-workflow-activities" >}})
- API 调用 在下面的示例中，这些调用启动、终止、获取状态、暂停、恢复、触发事件和清除工作流程。

```javascript
import { TaskHubGrpcClient } from "@microsoft/durabletask-js";
import { WorkflowState } from "./WorkflowState";
import { generateApiTokenClientInterceptors, generateEndpoint, getDaprApiToken } from "../internal/index";
import { TWorkflow } from "../../types/workflow/Workflow.type";
import { getFunctionName } from "../internal";
import { WorkflowClientOptions } from "../../types/workflow/WorkflowClientOption";

/** DaprWorkflowClient class defines client operations for managing workflow instances. */

export default class DaprWorkflowClient {
  private readonly _innerClient: TaskHubGrpcClient;

  /** Initialize a new instance of the DaprWorkflowClient.
   */
  constructor(options: Partial<WorkflowClientOptions> = {}) {
    const grpcEndpoint = generateEndpoint(options);
    options.daprApiToken = getDaprApiToken(options);
    this._innerClient = this.buildInnerClient(grpcEndpoint.endpoint, options);
  }

  private buildInnerClient(hostAddress: string, options: Partial<WorkflowClientOptions>): TaskHubGrpcClient {
    let innerOptions = options?.grpcOptions;
    if (options.daprApiToken !== undefined && options.daprApiToken !== "") {
      innerOptions = {
        ...innerOptions,
        interceptors: [generateApiTokenClientInterceptors(options), ...(innerOptions?.interceptors ?? [])],
      };
    }
    return new TaskHubGrpcClient(hostAddress, innerOptions);
  }

  /**
   * Schedule a new workflow using the DurableTask client.
   */
  public async scheduleNewWorkflow(
    workflow: TWorkflow | string,
    input?: any,
    instanceId?: string,
    startAt?: Date,
  ): Promise<string> {
    if (typeof workflow === "string") {
      return await this._innerClient.scheduleNewOrchestration(workflow, input, instanceId, startAt);
    }
    return await this._innerClient.scheduleNewOrchestration(getFunctionName(workflow), input, instanceId, startAt);
  }

  /**
   * Terminate the workflow associated with the provided instance id.
   *
   * @param {string} workflowInstanceId - Workflow instance id to terminate.
   * @param {any} output - The optional output to set for the terminated workflow instance.
   */
  public async terminateWorkflow(workflowInstanceId: string, output: any) {
    await this._innerClient.terminateOrchestration(workflowInstanceId, output);
  }

  /**
   * Fetch workflow instance metadata from the configured durable store.
   */
  public async getWorkflowState(
    workflowInstanceId: string,
    getInputsAndOutputs: boolean,
  ): Promise<WorkflowState | undefined> {
    const state = await this._innerClient.getOrchestrationState(workflowInstanceId, getInputsAndOutputs);
    if (state !== undefined) {
      return new WorkflowState(state);
    }
  }

  /**
   * Waits for a workflow to start running
   */
  public async waitForWorkflowStart(
    workflowInstanceId: string,
    fetchPayloads = true,
    timeoutInSeconds = 60,
  ): Promise<WorkflowState | undefined> {
    const state = await this._innerClient.waitForOrchestrationStart(
      workflowInstanceId,
      fetchPayloads,
      timeoutInSeconds,
    );
    if (state !== undefined) {
      return new WorkflowState(state);
    }
  }

  /**
   * Waits for a workflow to complete running
   */
  public async waitForWorkflowCompletion(
    workflowInstanceId: string,
    fetchPayloads = true,
    timeoutInSeconds = 60,
  ): Promise<WorkflowState | undefined> {
    const state = await this._innerClient.waitForOrchestrationCompletion(
      workflowInstanceId,
      fetchPayloads,
      timeoutInSeconds,
    );
    if (state != undefined) {
      return new WorkflowState(state);
    }
  }

  /**
   * Sends an event notification message to an awaiting workflow instance
   */
  public async raiseEvent(workflowInstanceId: string, eventName: string, eventPayload?: any) {
    this._innerClient.raiseOrchestrationEvent(workflowInstanceId, eventName, eventPayload);
  }

  /**
   * Purges the workflow instance state from the workflow state store.
   */
  public async purgeWorkflow(workflowInstanceId: string): Promise<boolean> {
    const purgeResult = await this._innerClient.purgeOrchestration(workflowInstanceId);
    if (purgeResult !== undefined) {
      return purgeResult.deletedInstanceCount > 0;
    }
    return false;
  }

  /**
   * Closes the inner DurableTask client and shutdown the GRPC channel.
   */
  public async stop() {
    await this._innerClient.stop();
  }
}
```

{{% /codetab %}}

{{% codetab %}}

<!--csharp-->

[在下面的 `Program.cs` 示例](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Program.cs)中，对于使用 .NET SDK 的基本 ASP.NET 订单处理应用程序，您的项目代码将包括：

- 一个名为 `Dapr.Workflow` 的 NuGet 包，用于接收 .NET SDK 的功能
- 一个带有名为 `AddDaprWorkflow` 的扩展方法的构建器
  - 这将允许您注册工作流和工作流活动（工作流可以调度的任务）。
- HTTP API 调用
  - 一个用于提交新订单
  - 一个用于检查现有订单的状态

```csharp
using Dapr.Workflow;
//...

// Dapr Workflows are registered as part of the service configuration
builder.Services.AddDaprWorkflow(options =>
{
    // Note that it's also possible to register a lambda function as the workflow
    // or activity implementation instead of a class.
    options.RegisterWorkflow<OrderProcessingWorkflow>();

    // These are the activities that get invoked by the workflow(s).
    options.RegisterActivity<NotifyActivity>();
    options.RegisterActivity<ReserveInventoryActivity>();
    options.RegisterActivity<ProcessPaymentActivity>();
});

WebApplication app = builder.Build();

// POST starts new order workflow instance
app.MapPost("/orders", async (DaprWorkflowClient client, [FromBody] OrderPayload orderInfo) =>
{
    if (orderInfo?.Name == null)
    {
        return Results.BadRequest(new
        {
            message = "Order data was missing from the request",
            example = new OrderPayload("Paperclips", 99.95),
        });
    }

//...
});

// GET fetches state for order workflow to report status
app.MapGet("/orders/{orderId}", async (string orderId, DaprWorkflowClient client) =>
{
    WorkflowState state = await client.GetWorkflowStateAsync(orderId, true);
    if (!state.Exists)
    {
        return Results.NotFound($"No order with ID = '{orderId}' was found.");
    }

    var httpResponsePayload = new
    {
        details = state.ReadInputAs<OrderPayload>(),
        status = state.RuntimeStatus.ToString(),
        result = state.ReadOutputAs<OrderResult>(),
    };

//...
}).WithName("GetOrderInfoEndpoint");

app.Run();
```

{{% /codetab %}}

{{% codetab %}}

<!--java-->

[如下面的示例所示](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/DemoWorkflow.java)，使用Java SDK和Dapr Workflow的hello-world应用程序将包括：

- 一个名为 `io.dapr.workflows.client` 的 Java 包，用于接收 Java SDK 客户端的功能。
- 导入 `io.dapr.workflows.Workflow`
- 扩展`Workflow`的`DemoWorkflow`类
- 使用输入和输出创建工作流。
- API 调用 在下面的示例中，这些调用会启动并调用工作流活动。

```java
package io.dapr.examples.workflows;

import com.microsoft.durabletask.CompositeTaskFailedException;
import com.microsoft.durabletask.Task;
import com.microsoft.durabletask.TaskCanceledException;
import io.dapr.workflows.Workflow;
import io.dapr.workflows.WorkflowStub;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;

/**
 * Implementation of the DemoWorkflow for the server side.
 */
public class DemoWorkflow extends Workflow {
  @Override
  public WorkflowStub create() {
    return ctx -> {
      ctx.getLogger().info("Starting Workflow: " + ctx.getName());
      // ...
      ctx.getLogger().info("Calling Activity...");
      var input = new DemoActivityInput("Hello Activity!");
      var output = ctx.callActivity(DemoWorkflowActivity.class.getName(), input, DemoActivityOutput.class).await();
      // ...
    };
  }
}
```

[查看上下文中的完整Java SDK工作流示例。](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/DemoWorkflow.java)

{{% /codetab %}}

{{% codetab %}}

<!--go-->

[如下面的示例所示](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)，使用 Go SDK 和 Dapr Workflow 的 hello-world 应用程序将包括：

- 一个Go包叫做`client`，用于接收Go SDK客户端功能。
- `TestWorkflow` 方法
- 使用输入和输出创建工作流。
- API 调用 在下面的示例中，这些调用会启动并调用工作流活动。

```go
package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/dapr/go-sdk/client"
	"github.com/dapr/go-sdk/workflow"
)

var stage = 0

const (
	workflowComponent = "dapr"
)

func main() {
	w, err := workflow.NewWorker()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Worker initialized")

	if err := w.RegisterWorkflow(TestWorkflow); err != nil {
		log.Fatal(err)
	}
	fmt.Println("TestWorkflow registered")

	if err := w.RegisterActivity(TestActivity); err != nil {
		log.Fatal(err)
	}
	fmt.Println("TestActivity registered")

	// Start workflow runner
	if err := w.Start(); err != nil {
		log.Fatal(err)
	}
	fmt.Println("runner started")

	daprClient, err := client.NewClient()
	if err != nil {
		log.Fatalf("failed to intialise client: %v", err)
	}
	defer daprClient.Close()
	ctx := context.Background()

	// Start workflow test
	respStart, err := daprClient.StartWorkflowBeta1(ctx, &client.StartWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
		WorkflowName:      "TestWorkflow",
		Options:           nil,
		Input:             1,
		SendRawInput:      false,
	})
	if err != nil {
		log.Fatalf("failed to start workflow: %v", err)
	}
	fmt.Printf("workflow started with id: %v\n", respStart.InstanceID)

	// Pause workflow test
	err = daprClient.PauseWorkflowBeta1(ctx, &client.PauseWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
	})

	if err != nil {
		log.Fatalf("failed to pause workflow: %v", err)
	}

	respGet, err := daprClient.GetWorkflowBeta1(ctx, &client.GetWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
	})
	if err != nil {
		log.Fatalf("failed to get workflow: %v", err)
	}

	if respGet.RuntimeStatus != workflow.StatusSuspended.String() {
		log.Fatalf("workflow not paused: %v", respGet.RuntimeStatus)
	}

	fmt.Printf("workflow paused\n")

	// Resume workflow test
	err = daprClient.ResumeWorkflowBeta1(ctx, &client.ResumeWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
	})

	if err != nil {
		log.Fatalf("failed to resume workflow: %v", err)
	}

	respGet, err = daprClient.GetWorkflowBeta1(ctx, &client.GetWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
	})
	if err != nil {
		log.Fatalf("failed to get workflow: %v", err)
	}

	if respGet.RuntimeStatus != workflow.StatusRunning.String() {
		log.Fatalf("workflow not running")
	}

	fmt.Println("workflow resumed")

	fmt.Printf("stage: %d\n", stage)

	// Raise Event Test

	err = daprClient.RaiseEventWorkflowBeta1(ctx, &client.RaiseEventWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
		EventName:         "testEvent",
		EventData:         "testData",
		SendRawData:       false,
	})

	if err != nil {
		fmt.Printf("failed to raise event: %v", err)
	}

	fmt.Println("workflow event raised")

	time.Sleep(time.Second) // allow workflow to advance

	fmt.Printf("stage: %d\n", stage)

	respGet, err = daprClient.GetWorkflowBeta1(ctx, &client.GetWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
	})
	if err != nil {
		log.Fatalf("failed to get workflow: %v", err)
	}

	fmt.Printf("workflow status: %v\n", respGet.RuntimeStatus)

	// Purge workflow test
	err = daprClient.PurgeWorkflowBeta1(ctx, &client.PurgeWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
	})
	if err != nil {
		log.Fatalf("failed to purge workflow: %v", err)
	}

	respGet, err = daprClient.GetWorkflowBeta1(ctx, &client.GetWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
	})
	if err != nil && respGet != nil {
		log.Fatal("failed to purge workflow")
	}

	fmt.Println("workflow purged")

	fmt.Printf("stage: %d\n", stage)

	// Terminate workflow test
	respStart, err = daprClient.StartWorkflowBeta1(ctx, &client.StartWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
		WorkflowName:      "TestWorkflow",
		Options:           nil,
		Input:             1,
		SendRawInput:      false,
	})
	if err != nil {
		log.Fatalf("failed to start workflow: %v", err)
	}

	fmt.Printf("workflow started with id: %s\n", respStart.InstanceID)

	err = daprClient.TerminateWorkflowBeta1(ctx, &client.TerminateWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
	})
	if err != nil {
		log.Fatalf("failed to terminate workflow: %v", err)
	}

	respGet, err = daprClient.GetWorkflowBeta1(ctx, &client.GetWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
	})
	if err != nil {
		log.Fatalf("failed to get workflow: %v", err)
	}
	if respGet.RuntimeStatus != workflow.StatusTerminated.String() {
		log.Fatal("failed to terminate workflow")
	}

	fmt.Println("workflow terminated")

	err = daprClient.PurgeWorkflowBeta1(ctx, &client.PurgeWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
	})

	respGet, err = daprClient.GetWorkflowBeta1(ctx, &client.GetWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
	})
	if err == nil || respGet != nil {
		log.Fatalf("failed to purge workflow: %v", err)
	}

	fmt.Println("workflow purged")

	stage = 0
	fmt.Println("workflow client test")

	wfClient, err := workflow.NewClient()
	if err != nil {
		log.Fatalf("[wfclient] faield to initialize: %v", err)
	}

	id, err := wfClient.ScheduleNewWorkflow(ctx, "TestWorkflow", workflow.WithInstanceID("a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9"), workflow.WithInput(1))
	if err != nil {
		log.Fatalf("[wfclient] failed to start workflow: %v", err)
	}

	fmt.Printf("[wfclient] started workflow with id: %s\n", id)

	metadata, err := wfClient.FetchWorkflowMetadata(ctx, id)
	if err != nil {
		log.Fatalf("[wfclient] failed to get worfklow: %v", err)
	}

	fmt.Printf("[wfclient] workflow status: %v\n", metadata.RuntimeStatus.String())

	if stage != 1 {
		log.Fatalf("Workflow assertion failed while validating the wfclient. Stage 1 expected, current: %d", stage)
	}

	fmt.Printf("[wfclient] stage: %d\n", stage)

	// raise event

	if err := wfClient.RaiseEvent(ctx, id, "testEvent", workflow.WithEventPayload("testData")); err != nil {
		log.Fatalf("[wfclient] failed to raise event: %v", err)
	}

	fmt.Println("[wfclient] event raised")

	// Sleep to allow the workflow to advance
	time.Sleep(time.Second)

	if stage != 2 {
		log.Fatalf("Workflow assertion failed while validating the wfclient. Stage 2 expected, current: %d", stage)
	}

	fmt.Printf("[wfclient] stage: %d\n", stage)

	// stop workflow
	if err := wfClient.TerminateWorkflow(ctx, id); err != nil {
		log.Fatalf("[wfclient] failed to terminate workflow: %v", err)
	}

	fmt.Println("[wfclient] workflow terminated")

	if err := wfClient.PurgeWorkflow(ctx, id); err != nil {
		log.Fatalf("[wfclient] failed to purge workflow: %v", err)
	}

	fmt.Println("[wfclient] workflow purged")

	// stop workflow runtime
	if err := w.Shutdown(); err != nil {
		log.Fatalf("failed to shutdown runtime: %v", err)
	}

	fmt.Println("workflow worker successfully shutdown")
}

func TestWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	var output string
	if err := ctx.CallActivity(TestActivity, workflow.ActivityInput(input)).Await(&output); err != nil {
		return nil, err
	}

	err := ctx.WaitForExternalEvent("testEvent", time.Second*60).Await(&output)
	if err != nil {
		return nil, err
	}

	if err := ctx.CallActivity(TestActivity, workflow.ActivityInput(input)).Await(&output); err != nil {
		return nil, err
	}

	return output, nil
}

func TestActivity(ctx workflow.ActivityContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return "", err
	}

	stage += input

	return fmt.Sprintf("Stage: %d", stage), nil
}
```

[在上下文中查看完整的Go SDK工作流示例。](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)

{{% /codetab %}}

{{< /tabs >}}

{{% alert title="重要" color="warning" %}}
由于基于重播的工作流的执行方式，您将编写执行 I/O 和与系统交互等操作的逻辑 **内部活动**。 与此同时，**工作流方法**只是为了协调这些活动。

{{% /alert %}}

## 下一步

现在您已经编写了工作流程，请学习如何管理它。

{{< button text="管理工作流程 >>" page="howto-manage-workflow\.md" >}}

## 相关链接

- [Dapr概述]({{< ref workflow-overview\.md >}})
- [Workflow API 参考文档]({{< ref workflow_api.md >}})
- 试用完整的 SDK 示例：
  - [Python示例](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow)
  - [JavaScript示例](https://github.com/dapr/js-sdk/tree/main/examples/workflow)
  - [.NET示例](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
  - [Java示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)
  - [Go示例](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)
