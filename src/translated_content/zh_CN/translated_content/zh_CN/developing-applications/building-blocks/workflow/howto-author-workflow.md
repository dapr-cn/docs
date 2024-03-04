---
type: docs
title: "指南：如何编写工作流"
linkTitle: "指南：如何编写工作流"
weight: 5000
description: "学习如何开发和编写工作流"
---

{{% alert title="Note" color="primary" %}}
Dapr 工作流目前处于 beta 阶段。 [查看 {{% dapr-latest-version cli="true" %}} 的已知限制]({{< ref "workflow-overview.md#limitations" >}})。
{{% /alert %}}

本文简要概述了如何创作由 Dapr 工作流引擎执行的工作流。

{{% alert title="Note" color="primary" %}}
 如果还没有， [尝试工作流快速入门]({{< ref workflow-quickstart.md >}}) ，快速了解如何使用工作流。

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

[工作流活动]({{< ref "workflow-features-concepts.md#workflow-activites" >}}) 是工作流中工作的基本单位，也是业务流程中进行协调的任务。

{{< tabs Python ".NET" Java >}}

{{% codetab %}}

<!--python-->

定义您希望工作流执行的工作流活动。 活动是一个函数定义，可以接受输入和输出。 下面的示例创建了一个名为 `hello_act` 的计数器（活动），通知用户当前的计数器值。 `hello_act` 是一个从名为 `WorkflowActivityContext`的类派生出来的函数。

```python
def hello_act(ctx: WorkflowActivityContext, input):
    global counter
    counter += input
    print(f'New counter value is: {counter}!', flush=True)
```

[See the `hello_act` workflow activity in context.](https://github.com/dapr/python-sdk/blob/master/examples/demo_workflow/app.py#LL40C1-L43C59)


{{% /codetab %}}

{{% codetab %}}

<!--csharp-->

定义您希望工作流执行的工作流活动。 活动是一个类的定义，可以有输入和输出。 活动还参与依赖注入，如绑定到 Dapr 客户端。

以下示例中调用的活动包括：
- `NotifyActivity`: 接收新订单通知。
- `ReserveInventoryActivity`：检查是否有足够的库存来满足新订单。
- `ProcessPaymentActivity`: 处理订单付款。 包括 `NotifyActivity` ，用于发送订单成功的通知。

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

[请参阅完整的 `NotifyActivity.cs` 工作流活动示例。](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Activities/NotifyActivity.cs)

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
[请参阅完整的 `ReserveInventoryActivity.cs` 工作流活动示例。](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Activities/ReserveInventoryActivity.cs)

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

[请参阅完整的 `ProcessPaymentActivity.cs` 工作流活动示例。](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Activities/ProcessPaymentActivity.cs)

{{% /codetab %}}

{{% codetab %}}

<!--java-->

定义您希望工作流执行的工作流活动。 活动被包装在实现工作流活动的公共`DemoWorkflowActivity`类中。

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

[请参阅上下文中的 Java SDK 工作流活动示例。](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/DemoWorkflowActivity.java)

{{% /codetab %}}


{{< /tabs >}}

## 编写工作流

接下来，在工作流中注册并调用活动。

{{< tabs Python ".NET" Java >}}

{{% codetab %}}

<!--python-->

`hello_world_wf` 函数派生于一个名为 `DaprWorkflowContext` 的类，该类具有输入和输出参数类型。 它还包括一个 `yield` 语句，用于完成工作流的繁重任务并调用工作流活动。

```python
def hello_world_wf(ctx: DaprWorkflowContext, input):
    print(f'{input}')
    yield ctx.call_activity(hello_act, input=1)
    yield ctx.call_activity(hello_act, input=10)
    yield ctx.wait_for_external_event("event1")
    yield ctx.call_activity(hello_act, input=100)
    yield ctx.call_activity(hello_act, input=1000)
```

[请参阅 `hello_world_wf` 工作流的上下文。](https://github.com/dapr/python-sdk/blob/master/examples/demo_workflow/app.py#LL32C1-L38C51)


{{% /codetab %}}

{{% codetab %}}

<!--csharp-->

`OrderProcessingWorkflow` 类是从名为 `Workflow` 的基类派生出来的，具有输入和输出参数类型。 它还包括一个 ` RunAsync ` 执行工作流的繁重工作并调用工作流活动的方法。

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

[请参见 `OrderProcessingWorkflow.cs`中的完整工作流示例。](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Workflows/OrderProcessingWorkflow.cs)


{{% /codetab %}}

{{% codetab %}}

<!--java-->

接下来，将工作流注册到 `WorkflowRuntimeBuilder` 并启动工作流运行时。

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

[请参阅 Java SDK 工作流的上下文。](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/DemoWorkflowWorker.java)


{{% /codetab %}}

{{< /tabs >}}

## 编写应用程序

最后，使用工作流编写应用程序。

{{< tabs Python ".NET" Java >}}

{{% codetab %}}

<!--python-->

[在下面的示例](https://github.com/dapr/python-sdk/blob/master/examples/demo_workflow/app.py)中，对于使用 Python SDK 的基本 Python hello world 应用程序，您的项目代码将包括

- 一个名为 `Dapr. Workflow` 的 NuGet 包，用于接收. NET SDK 功能。
- 调用具有扩展的构建器：
  - `WorkflowRuntime`：允许您注册工作流和工作流活动
  - `DaprWorkflowContext`: 允许您 [创建工作流]({{< ref "#write-the-workflow" >}})
  - `WorkflowActivityContext`: 允许您 [创建工作流活动]({{< ref "#write-the-workflow-activities" >}})
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

        # 启动工作流
        print("==========Start Counter Increase as per Input:==========")
        start_resp = d.start_workflow(instance_id=instanceId, workflow_component=workflowComponent,
                        workflow_name=workflowName, input=inputData, workflow_options=workflowOptions)
        print(f "start_resp {start_resp.instance_id}")

        # ...

        # 暂停工作流
        d.pause_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f "Get response from {workflowName} after pause call: {getResponse.runtime_status}")

        # 恢复工作流
        d.getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)resume_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f "Get response from {workflowName} after resume call: {getResponse.runtime_status}")

        sleep(1)
        # 引发工作流
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

        # 为终止目的启动另一个工作流 
        start_resp = d.start_workflow(instance_id=instanceId, workflow_component=workflowComponent,
                        workflow_name=workflowName, input=inputData, workflow_options=workflowOptions)
        print(f "start_resp {start_resp.instance_id}")

        # 终止工作流
        d.terminate_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        sleep(1)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f "Get response from {workflowName} after terminate call: {getResponse.runtime_status}")

        # 清理工作流
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

<!--csharp-->

[在以下 `Program.cs` 示例](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Program.cs)中，对于使用 .NET SDK 的基本 ASP.NET 订单处理应用程序，您的项目代码将包括：

- 一个名为 `Dapr.Workflow` 的 NuGet 包，用于接收 .NET SDK 功能
- 带有扩展方法的构建器 `AddDaprWorkflow`
  - 这将允许您注册工作流和工作流活动（工作流可以调度的任务）。
- HTTP API 调用
  - 一个用于提交新订单
  - 一个用于检查现有订单的状态

```csharp
using Dapr.Workflow;
//...

// Dapr 工作流是作为服务配置的一部分注册的
builder.Services.AddDaprWorkflow(options =>
{
    // 请注意，也可以将 lambda 函数注册为工作流
    // 或活动实现，而不是一个类。
    options.RegisterWorkflow<OrderProcessingWorkflow>();

    // 这些是工作流调用的活动。
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

[在下面的示例](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/DemoWorkflow.java)中，使用 Java SDK 和 Dapr Workflow 的 hello-world 应用程序将包括:

- 一个名为 `io.dapr.workflows.client` 的 Java 包，用于接收 Java SDK 客户端功能。
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

[请参阅上下文中的完整 Java SDK 工作流示例。](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/DemoWorkflow.java)

{{% /codetab %}}


{{< /tabs >}}


{{% alert title="Important" color="warning" %}}
由于基于重播的工作流的执行方式，您将编写执行 I/O 和与系统交互等操作的逻辑 **内部活动**. 与此同时， **工作流方法** 只是为了协调这些活动。

{{% /alert %}}

## 下一步

现在您已经编写了工作流程，请学习如何管理它。

{{< button text="Manage workflows >>" page="howto-manage-workflow.md" >}}

## 相关链接
- [工作流概述]({{< ref workflow-overview.md >}})
- [工作流 API 参考文档]({{< ref workflow_api.md >}})
- 试用完整的 SDK 示例：
  - [Python 示例](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow)
  - [.NET 示例](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
  - [Java 示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)
