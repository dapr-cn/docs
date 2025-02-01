---
type: docs
title: "如何：编写一个工作流"
linkTitle: "如何：编写工作流"
weight: 5000
description: "学习如何使用Dapr工作流引擎开发和编写工作流"
---

本文提供了如何编写由Dapr工作流引擎执行的工作流的高级概述。

{{% alert title="注意" color="primary" %}}
如果您还没有尝试过，[请尝试工作流快速入门]({{< ref workflow-quickstart.md >}})，以快速了解如何使用工作流。

{{% /alert %}}

## 以代码形式编写工作流

Dapr工作流逻辑是通过通用编程语言实现的，这使您可以：

- 使用您喜欢的编程语言（无需学习新的DSL或YAML模式）。
- 访问语言的标准库。
- 构建您自己的库和抽象。
- 使用调试器并检查本地变量。
- 为您的工作流编写单元测试，就像应用程序逻辑的其他部分一样。

Dapr sidecar不加载任何工作流定义。相反，sidecar仅负责驱动工作流的执行，而所有具体的工作流任务则由应用程序的一部分来处理。

## 编写工作流任务

[工作流任务]({{< ref "workflow-features-concepts.md#workflow-activites" >}})是工作流中的基本工作单元，是在业务流程中被编排的任务。

{{< tabs Python JavaScript ".NET" Java Go >}}

{{% codetab %}}

<!--python-->

定义您希望工作流执行的工作流任务。任务是一个函数定义，可以接受输入并返回输出。以下示例创建了一个名为`hello_act`的任务，用于打印当前计数器的值。`hello_act`是一个从`WorkflowActivityContext`类派生的函数。

```python
def hello_act(ctx: WorkflowActivityContext, input):
    global counter
    counter += input
    print(f'New counter value is: {counter}!', flush=True)
```

[查看上下文中的`hello_act`工作流任务。](https://github.com/dapr/python-sdk/blob/master/examples/demo_workflow/app.py#LL40C1-L43C59)

{{% /codetab %}}

{{% codetab %}}

<!--javascript-->

定义您希望工作流执行的工作流任务。任务被封装在实现工作流任务的`WorkflowActivityContext`类中。

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

[查看上下文中的工作流任务。](https://github.com/dapr/js-sdk/blob/main/src/workflow/runtime/WorkflowActivityContext.ts)

{{% /codetab %}}

{{% codetab %}}

<!--csharp-->

定义您希望工作流执行的工作流任务。任务是一个类定义，可以接受输入并返回输出。任务还可以通过依赖注入与Dapr客户端进行交互。

以下示例中调用的任务是：
- `NotifyActivity`：接收新订单的通知。
- `ReserveInventoryActivity`：检查是否有足够的库存来满足新订单。
- `ProcessPaymentActivity`：处理订单的付款。包括`NotifyActivity`以发送成功订单的通知。

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

[查看完整的`NotifyActivity.cs`工作流任务示例。](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Activities/NotifyActivity.cs)

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
[查看完整的`ReserveInventoryActivity.cs`工作流任务示例。](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Activities/ReserveInventoryActivity.cs)

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

[查看完整的`ProcessPaymentActivity.cs`工作流任务示例。](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Activities/ProcessPaymentActivity.cs)

{{% /codetab %}}

{{% codetab %}}

<!--java-->

定义您希望工作流执行的工作流任务。任务被封装在实现工作流任务的公共`DemoWorkflowActivity`类中。

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

[查看上下文中的Java SDK工作流任务示例。](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/DemoWorkflowActivity.java)

{{% /codetab %}}

{{% codetab %}}

<!--go-->

定义您希望工作流执行的每个工作流任务。任务输入可以通过`ctx.GetInput`从上下文中解组。任务应定义为接受`ctx workflow.ActivityContext`参数并返回接口和错误。

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

[查看上下文中的Go SDK工作流任务示例。](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)

{{% /codetab %}}

{{< /tabs >}}

## 编写工作流

接下来，在工作流中注册并调用任务。

{{< tabs Python JavaScript ".NET" Java Go >}}

{{% codetab %}}

<!--python-->

`hello_world_wf`函数是从一个名为`DaprWorkflowContext`的类派生的，具有输入和输出参数类型。它还包括一个`yield`语句，该语句完成工作流的繁重工作并调用工作流任务。

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

接下来，使用`WorkflowRuntime`类注册工作流并启动工作流运行时。

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

`OrderProcessingWorkflow`类是从一个名为`Workflow`的基类派生的，具有输入和输出参数类型。它还包括一个`RunAsync`方法，该方法完成工作流的繁重工作并调用工作流任务。

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

[查看`OrderProcessingWorkflow.cs`中的完整工作流示例。](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Workflows/OrderProcessingWorkflow.cs)

{{% /codetab %}}

{{% codetab %}}

<!--java-->

接下来，使用`WorkflowRuntimeBuilder`注册工作流并启动工作流运行时。

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

定义您的工作流函数，参数为`ctx *workflow.WorkflowContext`，返回任何和错误。从您的工作流中调用您定义的任务。

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

[在以下示例中](https://github.com/dapr/python-sdk/blob/master/examples/demo_workflow/app.py)，对于使用Python SDK的基本Python hello world应用程序，您的项目代码将包括：

- 一个名为`DaprClient`的Python包，用于接收Python SDK功能。
- 一个带有扩展的构建器，称为：
  - `WorkflowRuntime`：允许您注册工作流和工作流任务
  - `DaprWorkflowContext`：允许您[创建工作流]({{< ref "#write-the-workflow" >}})
  - `WorkflowActivityContext`：允许您[创建工作流任务]({{< ref "#write-the-workflow-activities" >}})
- API调用。在下面的示例中，这些调用启动、暂停、恢复、清除和终止工作流。

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

[以下示例](https://github.com/dapr/js-sdk/blob/main/src/workflow/client/DaprWorkflowClient.ts)是一个使用JavaScript SDK的基本JavaScript应用程序。在此示例中，您的项目代码将包括：

- 一个带有扩展的构建器，称为：
  - `WorkflowRuntime`：允许您注册工作流和工作流任务
  - `DaprWorkflowContext`：允许您[创建工作流]({{< ref "#write-the-workflow" >}})
  - `WorkflowActivityContext`：允许您[创建工作流任务]({{< ref "#write-the-workflow-activities" >}})
- API调用。在下面的示例中，这些调用启动、终止、获取状态、暂停、恢复、引发事件和清除工作流。

```javascript
import { TaskHubGrpcClient } from "@microsoft/durabletask-js";
import { WorkflowState } from "./WorkflowState";
import { generateApiTokenClientInterceptors, generateEndpoint, getDaprApiToken } from "../internal/index";
import { TWorkflow } from "../../types/workflow/Workflow.type";
import { getFunctionName } from "../internal";
import { WorkflowClientOptions } from "../../types/workflow/WorkflowClientOption";

/** DaprWorkflowClient类定义了管理工作流实例的客户端操作。 */

export default class DaprWorkflowClient {
  private readonly _innerClient: TaskHubGrpcClient;

  /** 初始化DaprWorkflowClient的新实例。
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
   * 使用DurableTask客户端调度新的工作流。
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
   * 终止与提供的实例ID关联的工作流。
   *
   * @param {string} workflowInstanceId - 要终止的工作流实例ID。
   * @param {any} output - 为终止的工作流实例设置的可选输出。
   */
  public async terminateWorkflow(workflowInstanceId: string, output: any) {
    await this._innerClient.terminateOrchestration(workflowInstanceId, output);
  }

  /**
   * 从配置的持久存储中获取工作流实例元数据。
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
   * 等待工作流开始运行
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
   * 等待工作流完成运行
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
   * 向等待的工作流实例发送事件通知消息
   */
  public async raiseEvent(workflowInstanceId: string, eventName: string, eventPayload?: any) {
    this._innerClient.raiseOrchestrationEvent(workflowInstanceId, eventName, eventPayload);
  }

  /**
   * 从工作流状态存储中清除工作流实例状态。
   */
  public async purgeWorkflow(workflowInstanceId: string): Promise<boolean> {
    const purgeResult = await this._innerClient.purgeOrchestration(workflowInstanceId);
    if (purgeResult !== undefined) {
      return purgeResult.deletedInstanceCount > 0;
    }
    return false;
  }

  /**
   * 关闭内部DurableTask客户端并关闭GRPC通道。
   */
  public async stop() {
    await this._innerClient.stop();
  }
}
```

{{% /codetab %}}

{{% codetab %}}

<!--csharp-->

[在以下`Program.cs`示例中](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Program.cs)，对于使用.NET SDK的基本ASP.NET订单处理应用程序，您的项目代码将包括：

- 一个名为`Dapr.Workflow`的NuGet包，用于接收.NET SDK功能
- 一个带有扩展方法的构建器，称为`AddDaprWorkflow`
  - 这将允许您注册工作流和工作流任务（工作流可以调度的任务）
- HTTP API调用
  - 一个用于提交新订单
  - 一个用于检查现有订单的状态

```csharp
using Dapr.Workflow;
//...

// Dapr工作流作为服务配置的一部分注册
builder.Services.AddDaprWorkflow(options =>
{
    // 请注意，也可以将lambda函数注册为工作流或任务实现，而不是类。
    options.RegisterWorkflow<OrderProcessingWorkflow>();

    // 这些是由工作流调用的任务。
    options.RegisterActivity<NotifyActivity>();
    options.RegisterActivity<ReserveInventoryActivity>();
    options.RegisterActivity<ProcessPaymentActivity>();
});

WebApplication app = builder.Build();

// POST启动新的订单工作流实例
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

// GET获取订单工作流的状态以报告状态
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

[如以下示例所示](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/DemoWorkflow.java)，使用Java SDK和Dapr工作流的hello-world应用程序将包括：

- 一个名为`io.dapr.workflows.client`的Java包，用于接收Java SDK客户端功能。
- 导入`io.dapr.workflows.Workflow`
- 扩展`Workflow`的`DemoWorkflow`类
- 使用输入和输出创建工作流。
- API调用。在下面的示例中，这些调用启动并调用工作流任务。

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
 * DemoWorkflow的服务器端实现。
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

[如以下示例所示](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)，使用Go SDK和Dapr工作流的hello-world应用程序将包括：

- 一个名为`client`的Go包，用于接收Go SDK客户端功能。
- `TestWorkflow`方法
- 使用输入和输出创建工作流。
- API调用。在下面的示例中，这些调用启动并调用工作流任务。

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
	respStart, err := daprClient.StartWorkflow(ctx, &client.StartWorkflowRequest{
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
	err = daprClient.PauseWorkflow(ctx, &client.PauseWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
	})

	if err != nil {
		log.Fatalf("failed to pause workflow: %v", err)
	}

	respGet, err := daprClient.GetWorkflow(ctx, &client.GetWorkflowRequest{
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
	err = daprClient.ResumeWorkflow(ctx, &client.ResumeWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
	})

	if err != nil {
		log.Fatalf("failed to resume workflow: %v", err)
	}

	respGet, err = daprClient.GetWorkflow(ctx, &client.GetWorkflowRequest{
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

	err = daprClient.RaiseEventWorkflow(ctx, &client.RaiseEventWorkflowRequest{
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

	respGet, err = daprClient.GetWorkflow(ctx, &client.GetWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
	})
	if err != nil {
		log.Fatalf("failed to get workflow: %v", err)
	}

	fmt.Printf("workflow status: %v\n", respGet.RuntimeStatus)

	// Purge workflow test
	err = daprClient.PurgeWorkflow(ctx, &client.PurgeWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
	})
	if err != nil {
		log.Fatalf("failed to purge workflow: %v", err)
	}

	respGet, err = daprClient.GetWorkflow(ctx, &client.GetWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
	})
	if err != nil && respGet != nil {
		log.Fatal("failed to purge workflow")
	}

	fmt.Println("workflow purged")

	fmt.Printf("stage: %d\n", stage)

	// Terminate workflow test
	respStart, err = daprClient.StartWorkflow(ctx, &client.StartWorkflowRequest{
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

	err = daprClient.TerminateWorkflow(ctx, &client.TerminateWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
	})
	if err != nil {
		log.Fatalf("failed to terminate workflow: %v", err)
	}

	respGet, err = daprClient.GetWorkflow(ctx, &client.GetWorkflowRequest{
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

	err = daprClient.PurgeWorkflow(ctx, &client.PurgeWorkflowRequest{
		InstanceID:        "a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9",
		WorkflowComponent: workflowComponent,
	})

	respGet, err = daprClient.GetWorkflow(ctx, &client.GetWorkflowRequest{
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

[查看上下文中的完整Go SDK工作流示例。](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)

{{% /codetab %}}

{{< /tabs >}}

{{% alert title="重要" color="warning" %}}
由于基于重放的工作流的执行方式，您将编写在任务内部执行I/O和与系统交互的逻辑。同时，工作流方法仅用于编排这些任务。

{{% /alert %}}

## 下一步

现在您已经编写了一个工作流，学习如何管理它。

{{< button text="管理工作流 >>" page="howto-manage-workflow.md" >}}

## 相关链接
- [工作流概述]({{< ref workflow-overview.md >}})
- [工作流API参考]({{< ref workflow_api.md >}})
- 尝试完整的SDK示例：
  - [Python示例](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow)
  - [JavaScript示例](https://github.com/dapr/js-sdk/tree/main/examples/workflow)
  - [.NET示例](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
  - [Java示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)
  - [Go示例](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)
