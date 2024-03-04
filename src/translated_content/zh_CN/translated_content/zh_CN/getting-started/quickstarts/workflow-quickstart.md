---
type: docs
title: "快速入门：工作流"
linkTitle: Workflow
weight: 78
description: 开始使用 Dapr 工作流构建块
---

{{% alert title="Note" color="primary" %}}
Dapr 工作流目前处于 beta 阶段。 [查看 {{% dapr-latest-version cli="true" %}} 的已知限制]({{< ref "workflow-overview.md#limitations" >}})。
{{% /alert %}}

让我们来看看 Dapr [工作流构建块]({{< ref workflow-overview.md >}})。 在这个快速入门中，您将创建一个简单的控制台应用程序，以演示Dapr的工作流编程模型和工作流管理API。

在本指南中，您将：

- 运行 `order-processor` 应用程序。
- 启动工作流并观察工作流活动/任务的执行。
- 查看工作流逻辑和工作流活动，以及它们在代码中的表示方式。

<img src="/images/workflow-quickstart-overview.png" width=800 style="padding-bottom:15px;">


{{< tabs "Python" ".NET" "Java" >}}

 <!-- Python -->
{{% codetab %}}

`order-processor` 控制台应用程序启动和管理模拟从商店购买物品的 `order_processing_workflow`。 工作流由五个独特的工作流活动或任务组成：

- `notify_activity`: 利用记录器在整个工作流中打印出消息。 这些消息在以下情况下通知您：
   - 您的库存不足
   - 您的付款无法处理等等。
- `process_payment_activity`: 处理并授权支付。
- `verify_inventory_activity`: 检查状态存储以确保有足够的库存可供购买。
- `update_inventory_activity`：从状态存储中删除请求的项目，并使用新的剩余库存值更新存储。
- `request_approval_activity`：如果付款金额超过50,000美元，则向经理请求批准。

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI和初始化环境](https://docs.dapr.io/getting-started)。
- [Python 3.7+ 已安装](https://www.python.org/downloads/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第2步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/workflows)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

在一个新的终端窗口中，导航到 `order-processor` 目录：

```bash
cd workflows/python/sdk/order-processor
```

安装 Dapr Python SDK 包:

```bash
pip3 install -r requirements.txt
```

### 第3步：运行订单处理程序应用

在终端中，启动订单处理程序应用程序并与 Dapr sidecar 并行运行:

```bash
dapr run --app-id order-processor --resources-path ../../../components/ -- python3 app.py
```

> **注意：** 由于Python3.exe在Windows中未定义，您可能需要使用 `python app.py` 替代 `python3 app.py`。

这将使用唯一的工作流ID启动 `order-processor` 应用程序，并运行工作流活动。

预期输出：

```bash
== APP == Starting order workflow, purchasing 10 of cars
== APP == 2023-06-06 09:35:52.945 durabletask-worker INFO: Successfully connected to 127.0.0.1:65406. Waiting for work items...
== APP == INFO:NotifyActivity:Received order f4e1926e-3721-478d-be8a-f5bebd1995da for 10 cars at $150000 !
== APP == INFO:VerifyInventoryActivity:Verifying inventory for order f4e1926e-3721-478d-be8a-f5bebd1995da of 10 cars
== APP == INFO:VerifyInventoryActivity:There are 100 Cars available for purchase
== APP == INFO:RequestApprovalActivity:Requesting approval for payment of 165000 USD for 10 cars
== APP == 2023-06-06 09:36:05.969 durabletask-worker INFO: f4e1926e-3721-478d-be8a-f5bebd1995da Event raised: manager_approval
== APP == INFO:NotifyActivity:Payment for order f4e1926e-3721-478d-be8a-f5bebd1995da has been approved!
== APP == INFO:ProcessPaymentActivity:Processing payment: f4e1926e-3721-478d-be8a-f5bebd1995da for 10 cars at 150000 USD
== APP == INFO:ProcessPaymentActivity:Payment for request ID f4e1926e-3721-478d-be8a-f5bebd1995da processed successfully
== APP == INFO:UpdateInventoryActivity:Checking inventory for order f4e1926e-3721-478d-be8a-f5bebd1995da for 10 cars
== APP == INFO:UpdateInventoryActivity:There are now 90 cars left in stock
== APP == INFO:NotifyActivity:Order f4e1926e-3721-478d-be8a-f5bebd1995da has completed!
== APP == 2023-06-06 09:36:06.106 durabletask-worker INFO: f4e1926e-3721-478d-be8a-f5bebd1995da: Orchestration completed with status: COMPLETED
== APP == Workflow completed! Result: Completed
== APP == Purchase of item is  Completed
```

### （可选）第4步：在Zipkin中查看

运行 `dapr init` 启动 [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) Docker 容器。 如果容器已停止运行，请使用以下命令启动Zipkin Docker容器：

```
docker run -d -p 9411:9411 openzipkin/zipkin
```

在 Zipkin web UI 中查看工作流 trace span（通常在 `http://localhost:9411/zipkin/`）。

<img src="/images/workflow-trace-spans-zipkin.png" width=800 style="padding-bottom:15px;">

### 发生了什么？

当您运行 `dapr run --app-id order-processor --resources-path ../../../components/ -- python3 app.py`:

1. 生成一个唯一的工作流订单ID（在上面的示例中， `f4e1926e-3721-478d-be8a-f5bebd1995da`）并安排工作流。
1. `NotifyActivity` 工作流活动发送通知，表示已收到10辆汽车的订单。
1. `ReserveInventoryActivity` 工作流活动检查库存数据，确定是否可以提供订购的物料，并使用库存中的汽车数量进行响应。
1. 您的工作流程开始并通知您其状态。
1. `ProcessPaymentActivity` 工作流活动开始处理订单 `f4e1926e-3721-478d-be8a-f5bebd1995da` 的付款，并确认是否成功。
1. 在订单处理完成后， `UpdateInventoryActivity` 工作流活动会更新库存中当前可用的汽车。
1. `NotifyActivity` 工作流活动发送通知，说明该订单 `F4E1926E-3721-478D-Be8A-F5BEBD1995DA` 已完成。
1. 工作流程已完成终止。

#### `order-processor/app.py`

在应用程序的程序文件中：
- 生成了唯一的工作流顺序 ID
- 工作流程已安排
- 检索工作流状态
- 工作流程及其调用的工作流程活动已注册

```python
class WorkflowConsoleApp:    
    def main(self):
        # Register workflow and activities
        workflowRuntime = WorkflowRuntime(settings.DAPR_RUNTIME_HOST, settings.DAPR_GRPC_PORT)
        workflowRuntime.register_workflow(order_processing_workflow)
        workflowRuntime.register_activity(notify_activity)
        workflowRuntime.register_activity(requst_approval_activity)
        workflowRuntime.register_activity(verify_inventory_activity)
        workflowRuntime.register_activity(process_payment_activity)
        workflowRuntime.register_activity(update_inventory_activity)
        workflowRuntime.start()

        print("==========Begin the purchase of item:==========", flush=True)
        item_name = default_item_name
        order_quantity = 10

        total_cost = int(order_quantity) * baseInventory[item_name].per_item_cost
        order = OrderPayload(item_name=item_name, quantity=int(order_quantity), total_cost=total_cost)

        # Start Workflow
        print(f'Starting order workflow, purchasing {order_quantity} of {item_name}', flush=True)
        start_resp = daprClient.start_workflow(workflow_component=workflow_component,
                                               workflow_name=workflow_name,
                                               input=order)
        _id = start_resp.instance_id

        def prompt_for_approval(daprClient: DaprClient):
            daprClient.raise_workflow_event(instance_id=_id, workflow_component=workflow_component, 
                                            event_name="manager_approval", event_data={'approval': True})

        approval_seeked = False
        start_time = datetime.now()
        while True:
            time_delta = datetime.now() - start_time
            state = daprClient.get_workflow(instance_id=_id, workflow_component=workflow_component)
            if not state:
                print("Workflow not found!")  # not expected
            elif state.runtime_status == "Completed" or\
                    state.runtime_status == "Failed" or\
                    state.runtime_status == "Terminated":
                print(f'Workflow completed! Result: {state.runtime_status}', flush=True)
                break
            if time_delta.total_seconds() >= 10:
                state = daprClient.get_workflow(instance_id=_id, workflow_component=workflow_component)
                if total_cost > 50000 and (
                    state.runtime_status != "Completed" or 
                    state.runtime_status != "Failed" or
                    state.runtime_status != "Terminated"
                    ) and not approval_seeked:
                    approval_seeked = True
                    threading.Thread(target=prompt_for_approval(daprClient), daemon=True).start()

        print("Purchase of item is ", state.runtime_status, flush=True)

    def restock_inventory(self, daprClient: DaprClient, baseInventory):
        for key, item in baseInventory.items():
            print(f'item: {item}')
            item_str = f'{{"name": "{item.item_name}", "quantity": {item.quantity},\
                          "per_item_cost": {item.per_item_cost}}}'
            daprClient.save_state("statestore-actors", key, item_str)

if __name__ == '__main__':
    app = WorkflowConsoleApp()
    app.main()
```

#### `order-processor/workflow.py`

在 `workflow.py`中，工作流被定义为一个类，其中包含所有相关任务（由工作流活动确定）。

```python
  def order_processing_workflow(ctx: DaprWorkflowContext, order_payload_str: OrderPayload):
    """Defines the order processing workflow.
    When the order is received, the inventory is checked to see if there is enough inventory to
    fulfill the order. If there is enough inventory, the payment is processed and the inventory is
    updated. If there is not enough inventory, the order is rejected.
    If the total order is greater than $50,000, the order is sent to a manager for approval.
    """
    order_id = ctx.instance_id
    order_payload=json.loads(order_payload_str)
    yield ctx.call_activity(notify_activity, 
                            input=Notification(message=('Received order ' +order_id+ ' for '
                                               +f'{order_payload["quantity"]}' +' ' +f'{order_payload["item_name"]}'
                                               +' at $'+f'{order_payload["total_cost"]}' +' !')))
    result = yield ctx.call_activity(verify_inventory_activity,
                                     input=InventoryRequest(request_id=order_id,
                                                            item_name=order_payload["item_name"],
                                                            quantity=order_payload["quantity"]))
    if not result.success:
        yield ctx.call_activity(notify_activity,
                                input=Notification(message='Insufficient inventory for '
                                                   +f'{order_payload["item_name"]}'+'!'))
        return OrderResult(processed=False)

    if order_payload["total_cost"] > 50000:
        yield ctx.call_activity(requst_approval_activity, input=order_payload)
        approval_task = ctx.wait_for_external_event("manager_approval")
        timeout_event = ctx.create_timer(timedelta(seconds=200))
        winner = yield when_any([approval_task, timeout_event])
        if winner == timeout_event:
            yield ctx.call_activity(notify_activity, 
                                    input=Notification(message='Payment for order '+order_id
                                                       +' has been cancelled due to timeout!'))
            return OrderResult(processed=False)
        approval_result = yield approval_task
        if approval_result["approval"]:
            yield ctx.call_activity(notify_activity, input=Notification(
                message=f'Payment for order {order_id} has been approved!'))
        else:
            yield ctx.call_activity(notify_activity, input=Notification(
                message=f'Payment for order {order_id} has been rejected!'))
            return OrderResult(processed=False)    

    yield ctx.call_activity(process_payment_activity, input=PaymentRequest(
        request_id=order_id, item_being_purchased=order_payload["item_name"],
        amount=order_payload["total_cost"], quantity=order_payload["quantity"]))

    try:
        yield ctx.call_activity(update_inventory_activity, 
                                input=PaymentRequest(request_id=order_id,
                                                     item_being_purchased=order_payload["item_name"],
                                                     amount=order_payload["total_cost"],
                                                     quantity=order_payload["quantity"]))
    except Exception:
        yield ctx.call_activity(notify_activity, 
                                input=Notification(message=f'Order {order_id} Failed!'))
        return OrderResult(processed=False)

    yield ctx.call_activity(notify_activity, input=Notification(
        message=f'Order {order_id} has completed!'))
    return OrderResult(processed=True) 
```
{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}

`order-processor` 控制台应用启动并管理订单处理工作流的生命周期，该工作流在状态存储中存储和检索数据。 工作流由四个工作流活动或任务组成:
- `NotifyActivity`: 利用记录器在整个工作流中打印出消息
- `ReserveInventoryActivity`：检查状态存储以确保购买所需的库存足够
- `ProcessPaymentActivity`: 处理并授权付款
- `UpdateInventoryActivity`: 从状态存储中删除请求的项目，并使用新的剩余库存值更新存储


### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI和初始化环境](https://docs.dapr.io/getting-started)。
- [.NET SDK 或 .NET 6 SDK 已安装](https://dotnet.microsoft.com/download).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第2步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/workflows)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

在一个新的终端窗口中，导航到 `order-processor` 目录：

```bash
cd workflows/csharp/sdk/order-processor
```

### 第3步：运行订单处理程序应用

在终端中，启动订单处理程序应用程序并与 Dapr sidecar 并行运行:

```bash
dapr run --app-id order-processor dotnet run
```

这将使用唯一的工作流ID启动 `order-processor` 应用程序，并运行工作流活动。

预期输出：

```
== APP == Starting workflow 6d2abcc9 purchasing 10 Cars

== APP == info: Microsoft.DurableTask.Client.Grpc.GrpcDurableTaskClient[40]
== APP ==       Scheduling new OrderProcessingWorkflow orchestration with instance ID '6d2abcc9' and 47 bytes of input data.
== APP == info: WorkflowConsoleApp.Activities.NotifyActivity[0]
== APP ==       Received order 6d2abcc9 for 10 Cars at $15000
== APP == info: WorkflowConsoleApp.Activities.ReserveInventoryActivity[0]
== APP ==       Reserving inventory for order 6d2abcc9 of 10 Cars
== APP == info: WorkflowConsoleApp.Activities.ReserveInventoryActivity[0]
== APP ==       There are: 100, Cars available for purchase

== APP == Your workflow has started. Here is the status of the workflow: Dapr.Workflow.WorkflowState

== APP == info: WorkflowConsoleApp.Activities.ProcessPaymentActivity[0]
== APP ==       Processing payment: 6d2abcc9 for 10 Cars at $15000
== APP == info: WorkflowConsoleApp.Activities.ProcessPaymentActivity[0]
== APP ==       Payment for request ID '6d2abcc9' processed successfully
== APP == info: WorkflowConsoleApp.Activities.UpdateInventoryActivity[0]
== APP ==       Checking Inventory for: Order# 6d2abcc9 for 10 Cars
== APP == info: WorkflowConsoleApp.Activities.UpdateInventoryActivity[0]
== APP ==       There are now: 90 Cars left in stock
== APP == info: WorkflowConsoleApp.Activities.NotifyActivity[0]
== APP ==       Order 6d2abcc9 has completed!

== APP == Workflow Status: Completed
```

### （可选）第4步：在Zipkin中查看

运行 `dapr init` 启动 [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) Docker 容器。 如果容器已停止运行，请使用以下命令启动Zipkin Docker容器：

```
docker run -d -p 9411:9411 openzipkin/zipkin
```

在 Zipkin web UI 中查看工作流 trace span（通常在 `http://localhost:9411/zipkin/`）。

<img src="/images/workflow-trace-spans-zipkin.png" width=800 style="padding-bottom:15px;">

### 发生了什么？

当您运行 `dapr run --app-id order-processor dotnet run`：

1. 生成一个唯一的工作流订单ID（在上面的示例中， `6d2abcc9`）并安排工作流。
1. `NotifyActivity` 工作流活动发送通知，表示已收到10辆汽车的订单。
1. `ReserveInventoryActivity` 工作流活动检查库存数据，确定是否可以提供订购的物料，并使用库存中的汽车数量进行响应。
1. 您的工作流程开始并通知您其状态。
1. `ProcessPaymentActivity` 工作流活动开始处理订单 `6d2abcc9` 的付款，并确认是否成功。
1. 在订单处理完成后， `UpdateInventoryActivity` 工作流活动会更新库存中当前可用的汽车。
1. `NotifyActivity` 工作流活动发送通知，说明该订单 `6d2abcc9` 已完成。
1. 工作流程已完成终止。

#### `order-processor/Program.cs`

在应用程序的程序文件中：
- 生成了唯一的工作流顺序 ID
- 工作流程已安排
- 检索工作流状态
- 工作流程及其调用的工作流程活动已注册

```csharp
using Dapr.Client;
using Dapr.Workflow;
//...

{
    services.AddDaprWorkflow(options =>
    {
        // Note that it's also possible to register a lambda function as the workflow
        // or activity implementation instead of a class.
        options.RegisterWorkflow<OrderProcessingWorkflow>();

        // These are the activities that get invoked by the workflow(s).
        options.RegisterActivity<NotifyActivity>();
        options.RegisterActivity<ReserveInventoryActivity>();
        options.RegisterActivity<ProcessPaymentActivity>();
        options.RegisterActivity<UpdateInventoryActivity>();
    });
};

//...

// Generate a unique ID for the workflow
string orderId = Guid.NewGuid().ToString()[..8];
string itemToPurchase = "Cars";
int ammountToPurchase = 10;

// Construct the order
OrderPayload orderInfo = new OrderPayload(itemToPurchase, 15000, ammountToPurchase);

// Start the workflow
Console.WriteLine("Starting workflow {0} purchasing {1} {2}", orderId, ammountToPurchase, itemToPurchase);

await daprClient.StartWorkflowAsync(
    workflowComponent: DaprWorkflowComponent,
    workflowName: nameof(OrderProcessingWorkflow),
    input: orderInfo,
    instanceId: orderId);

// Wait for the workflow to start and confirm the input
GetWorkflowResponse state = await daprClient.WaitForWorkflowStartAsync(
    instanceId: orderId,
    workflowComponent: DaprWorkflowComponent);

Console.WriteLine("Your workflow has started. Here is the status of the workflow: {0}", state.RuntimeStatus);

// Wait for the workflow to complete
state = await daprClient.WaitForWorkflowCompletionAsync(
    instanceId: orderId,
    workflowComponent: DaprWorkflowComponent);

Console.WriteLine("Workflow Status: {0}", state.RuntimeStatus);
```

#### `order-processor/Workflows/OrderProcessingWorkflow.cs`

在 `OrderProcessingWorkflow.cs`中，工作流被定义为一个类，其中包含所有相关任务（由工作流活动确定）。

```csharp
using Dapr.Workflow;
//...

class OrderProcessingWorkflow : Workflow<OrderPayload, OrderResult>
    {
        public override async Task<OrderResult> RunAsync(WorkflowContext context, OrderPayload order)
        {
            string orderId = context.InstanceId;

            // Notify the user that an order has come through
            await context.CallActivityAsync(
                nameof(NotifyActivity),
                new Notification($"Received order {orderId} for {order.Quantity} {order.Name} at ${order.TotalCost}"));

            string requestId = context.InstanceId;

            // Determine if there is enough of the item available for purchase by checking the inventory
            InventoryResult result = await context.CallActivityAsync<InventoryResult>(
                nameof(ReserveInventoryActivity),
                new InventoryRequest(RequestId: orderId, order.Name, order.Quantity));

            // If there is insufficient inventory, fail and let the user know 
            if (!result.Success)
            {
                // End the workflow here since we don't have sufficient inventory
                await context.CallActivityAsync(
                    nameof(NotifyActivity),
                    new Notification($"Insufficient inventory for {order.Name}"));
                return new OrderResult(Processed: false);
            }

            // There is enough inventory available so the user can purchase the item(s). Process their payment
            await context.CallActivityAsync(
                nameof(ProcessPaymentActivity),
                new PaymentRequest(RequestId: orderId, order.Name, order.Quantity, order.TotalCost));

            try
            {
                // There is enough inventory available so the user can purchase the item(s). Process their payment
                await context.CallActivityAsync(
                    nameof(UpdateInventoryActivity),
                    new PaymentRequest(RequestId: orderId, order.Name, order.Quantity, order.TotalCost));                
            }
            catch (TaskFailedException)
            {
                // Let them know their payment was processed
                await context.CallActivityAsync(
                    nameof(NotifyActivity),
                    new Notification($"Order {orderId} Failed! You are now getting a refund"));
                return new OrderResult(Processed: false);
            }

            // Let them know their payment was processed
            await context.CallActivityAsync(
                nameof(NotifyActivity),
                new Notification($"Order {orderId} has completed!"));

            // End the workflow with a success result
            return new OrderResult(Processed: true);
        }
    }
```

#### `order-processor/Activities` 文件夹

The `Activities` directory holds the four workflow activities used by the workflow, defined in the following files:
- `NotifyActivity.cs`
- `ReserveInventoryActivity.cs`
- `ProcessPaymentActivity.cs`
- `UpdateInventoryActivity.cs`

## 观看演示

看 [此视频将演练 Dapr Workflow .NET 演示](https://youtu.be/BxiKpEmchgQ?t=2564):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/BxiKpEmchgQ?start=2564" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}

`order-processor` 控制台应用启动并管理订单处理工作流的生命周期，该工作流在状态存储中存储和检索数据。 工作流由四个工作流活动或任务组成:
- `NotifyActivity`: 利用记录器在整个工作流中打印出消息
- `RequestApprovalActivity`：请求批准进行付款处理
- `ReserveInventoryActivity`：检查状态存储以确保购买所需的库存足够
- `ProcessPaymentActivity`: 处理并授权付款
- `UpdateInventoryActivity`: 从状态存储中删除请求的项目，并使用新的剩余库存值更新存储


### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI和初始化环境](https://docs.dapr.io/getting-started)。
- Java JDK 11（或更高版本）：
    - [Microsoft JDK 11](https://docs.microsoft.com/java/openjdk/download#openjdk-11)
    - [Oracle JDK 11](https://www.oracle.com/technetwork/java/javase/downloads/index.html#JDK11)
    - [OpenJDK 11](https://jdk.java.net/11/)
- [Apache Maven](https://maven.apache.org/install.html)，版本 3.x。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第2步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/workflows)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

导航到 `order-processor` 目录：

```bash
cd workflows/java/sdk/order-processor
```

安装依赖项：

```bash
mvn clean install
```

### 第3步：运行订单处理程序应用

在终端中，启动订单处理程序应用程序并与 Dapr sidecar 并行运行:

```bash
dapr run --app-id WorkflowConsoleApp --resources-path ../../../components/ --dapr-grpc-port 50001 -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar io.dapr.quickstarts.workflows.WorkflowConsoleApp
```

这将使用唯一的工作流ID启动 `order-processor` 应用程序，并运行工作流活动。

预期输出：

```
== APP == *** Welcome to the Dapr Workflow console app sample!
== APP == *** Using this app, you can place orders that start workflows.
== APP == Start workflow runtime
== APP == Sep 20, 2023 3:23:05 PM com.microsoft.durabletask.DurableTaskGrpcWorker startAndBlock
== APP == INFO: Durable Task worker is connecting to sidecar at 127.0.0.1:50001.

== APP == ==========Begin the purchase of item:==========
== APP == Starting order workflow, purchasing 10 of cars

== APP == scheduled new workflow instance of OrderProcessingWorkflow with instance ID: edceba90-9c45-4be8-ad40-60d16e060797
== APP == [Thread-0] INFO io.dapr.workflows.WorkflowContext - Starting Workflow: io.dapr.quickstarts.workflows.OrderProcessingWorkflow
== APP == [Thread-0] INFO io.dapr.workflows.WorkflowContext - Instance ID(order ID): edceba90-9c45-4be8-ad40-60d16e060797
== APP == [Thread-0] INFO io.dapr.workflows.WorkflowContext - Current Orchestration Time: 2023-09-20T19:23:09.755Z
== APP == [Thread-0] INFO io.dapr.workflows.WorkflowContext - Received Order: OrderPayload [itemName=cars, totalCost=150000, quantity=10]
== APP == [Thread-0] INFO io.dapr.quickstarts.workflows.activities.NotifyActivity - Received Order: OrderPayload [itemName=cars, totalCost=150000, quantity=10]
== APP == workflow instance edceba90-9c45-4be8-ad40-60d16e060797 started
== APP == [Thread-0] INFO io.dapr.quickstarts.workflows.activities.ReserveInventoryActivity - Reserving inventory for order 'edceba90-9c45-4be8-ad40-60d16e060797' of 10 cars
== APP == [Thread-0] INFO io.dapr.quickstarts.workflows.activities.ReserveInventoryActivity - There are 100 cars available for purchase
== APP == [Thread-0] INFO io.dapr.quickstarts.workflows.activities.ReserveInventoryActivity - Reserved inventory for order 'edceba90-9c45-4be8-ad40-60d16e060797' of 10 cars
== APP == [Thread-0] INFO io.dapr.quickstarts.workflows.activities.RequestApprovalActivity - Requesting approval for order: OrderPayload [itemName=cars, totalCost=150000, quantity=10]
== APP == [Thread-0] INFO io.dapr.quickstarts.workflows.activities.RequestApprovalActivity - Approved requesting approval for order: OrderPayload [itemName=cars, totalCost=150000, quantity=10]
== APP == [Thread-0] INFO io.dapr.quickstarts.workflows.activities.ProcessPaymentActivity - Processing payment: edceba90-9c45-4be8-ad40-60d16e060797 for 10 cars at $150000
== APP == [Thread-0] INFO io.dapr.quickstarts.workflows.activities.ProcessPaymentActivity - Payment for request ID 'edceba90-9c45-4be8-ad40-60d16e060797' processed successfully
== APP == [Thread-0] INFO io.dapr.quickstarts.workflows.activities.UpdateInventoryActivity - Updating inventory for order 'edceba90-9c45-4be8-ad40-60d16e060797' of 10 cars
== APP == [Thread-0] INFO io.dapr.quickstarts.workflows.activities.UpdateInventoryActivity - Updated inventory for order 'edceba90-9c45-4be8-ad40-60d16e060797': there are now 90 cars left in stock
== APP == [Thread-0] INFO io.dapr.quickstarts.workflows.activities.NotifyActivity - Order completed! : edceba90-9c45-4be8-ad40-60d16e060797

== APP == workflow instance edceba90-9c45-4be8-ad40-60d16e060797 completed, out is: {"processed":true}
```

### （可选）第4步：在Zipkin中查看

运行 `dapr init` 启动 [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) Docker 容器。 如果容器已停止运行，请使用以下命令启动Zipkin Docker容器：

```
docker run -d -p 9411:9411 openzipkin/zipkin
```

在 Zipkin web UI 中查看工作流 trace span（通常在 `http://localhost:9411/zipkin/`）。

<img src="/images/workflow-trace-spans-zipkin.png" width=800 style="padding-bottom:15px;">

### 发生了什么？

When you ran `dapr run`:

1. 生成一个唯一的工作流订单ID（在上面的示例中， `edceba90-9c45-4be8-ad40-60d16e060797`）并安排工作流。
1. `NotifyActivity` 工作流活动发送通知，表示已收到10辆汽车的订单。
1. `ReserveInventoryActivity` 工作流活动检查库存数据，确定是否可以提供订购的物料，并使用库存中的汽车数量进行响应。
1. 一旦批准，您的工作流程开始并通知您其状态。
1. `ProcessPaymentActivity` 工作流活动开始处理订单 `edceba90-9c45-4be8-ad40-60d16e060797` 的付款，并确认是否成功。
1. 在订单处理完成后， `UpdateInventoryActivity` 工作流活动会更新库存中当前可用的汽车。
1. `NotifyActivity` 工作流活动发送通知，说明该订单 `edceba90-9c45-4be8-ad40-60d16e060797` 已完成。
1. 工作流程已完成终止。

#### `order-processor/WorkflowConsoleApp.java`

在应用程序的程序文件中：
- 生成了唯一的工作流顺序 ID
- 工作流程已安排
- 检索工作流状态
- 工作流程及其调用的工作流程活动已注册

```java
package io.dapr.quickstarts.workflows;
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.workflows.client.DaprWorkflowClient;

public class WorkflowConsoleApp {

  private static final String STATE_STORE_NAME = "statestore-actors";

  // ...
  public static void main(String[] args) throws Exception {
    System.out.println("*** Welcome to the Dapr Workflow console app sample!");
    System.out.println("*** Using this app, you can place orders that start workflows.");
    // Wait for the sidecar to become available
    Thread.sleep(5 * 1000);

    // Register the OrderProcessingWorkflow and its activities with the builder.
    WorkflowRuntimeBuilder builder = new WorkflowRuntimeBuilder().registerWorkflow(OrderProcessingWorkflow.class);
    builder.registerActivity(NotifyActivity.class);
    builder.registerActivity(ProcessPaymentActivity.class);
    builder.registerActivity(RequestApprovalActivity.class);
    builder.registerActivity(ReserveInventoryActivity.class);
    builder.registerActivity(UpdateInventoryActivity.class);

    // Build the workflow runtime
    try (WorkflowRuntime runtime = builder.build()) {
      System.out.println("Start workflow runtime");
      runtime.start(false);
    }

    InventoryItem inventory = prepareInventoryAndOrder();

    DaprWorkflowClient workflowClient = new DaprWorkflowClient();
    try (workflowClient) {
      executeWorkflow(workflowClient, inventory);
    }

  }

  // Start the workflow runtime, pulling and executing tasks
  private static void executeWorkflow(DaprWorkflowClient workflowClient, InventoryItem inventory) {
    System.out.println("==========Begin the purchase of item:==========");
    String itemName = inventory.getName();
    int orderQuantity = inventory.getQuantity();
    int totalcost = orderQuantity * inventory.getPerItemCost();
    OrderPayload order = new OrderPayload();
    order.setItemName(itemName);
    order.setQuantity(orderQuantity);
    order.setTotalCost(totalcost);
    System.out.println("Starting order workflow, purchasing " + orderQuantity + " of " + itemName);

    String instanceId = workflowClient.scheduleNewWorkflow(OrderProcessingWorkflow.class, order);
    System.out.printf("scheduled new workflow instance of OrderProcessingWorkflow with instance ID: %s%n",
        instanceId);

    // Check workflow instance start status
    try {
      workflowClient.waitForInstanceStart(instanceId, Duration.ofSeconds(10), false);
      System.out.printf("workflow instance %s started%n", instanceId);
    } catch (TimeoutException e) {
      System.out.printf("workflow instance %s did not start within 10 seconds%n", instanceId);
      return;
    }

    // Check workflow instance complete status
    try {
      WorkflowInstanceStatus workflowStatus = workflowClient.waitForInstanceCompletion(instanceId,
          Duration.ofSeconds(30),
          true);
      if (workflowStatus != null) {
        System.out.printf("workflow instance %s completed, out is: %s %n", instanceId,
            workflowStatus.getSerializedOutput());
      } else {
        System.out.printf("workflow instance %s not found%n", instanceId);
      }
    } catch (TimeoutException e) {
      System.out.printf("workflow instance %s did not complete within 30 seconds%n", instanceId);
    }

  }

  private static InventoryItem prepareInventoryAndOrder() {
    // prepare 100 cars in inventory
    InventoryItem inventory = new InventoryItem();
    inventory.setName("cars");
    inventory.setPerItemCost(15000);
    inventory.setQuantity(100);
    DaprClient daprClient = new DaprClientBuilder().build();
    restockInventory(daprClient, inventory);

    // prepare order for 10 cars
    InventoryItem order = new InventoryItem();
    order.setName("cars");
    order.setPerItemCost(15000);
    order.setQuantity(10);
    return order;
  }

  private static void restockInventory(DaprClient daprClient, InventoryItem inventory) {
    String key = inventory.getName();
    daprClient.saveState(STATE_STORE_NAME, key, inventory).block();
  }
}
```

#### `OrderProcessingWorkflow.java`

在 `OrderProcessingWorkflow.java`中，工作流被定义为一个类，其中包含所有相关任务（由工作流活动确定）。

```java
package io.dapr.quickstarts.workflows;
import io.dapr.workflows.Workflow;

public class OrderProcessingWorkflow extends Workflow {

  @Override
  public WorkflowStub create() {
    return ctx -> {
      Logger logger = ctx.getLogger();
      String orderId = ctx.getInstanceId();
      logger.info("Starting Workflow: " + ctx.getName());
      logger.info("Instance ID(order ID): " + orderId);
      logger.info("Current Orchestration Time: " + ctx.getCurrentInstant());

      OrderPayload order = ctx.getInput(OrderPayload.class);
      logger.info("Received Order: " + order.toString());
      OrderResult orderResult = new OrderResult();
      orderResult.setProcessed(false);

      // Notify the user that an order has come through
      Notification notification = new Notification();
      notification.setMessage("Received Order: " + order.toString());
      ctx.callActivity(NotifyActivity.class.getName(), notification).await();

      // Determine if there is enough of the item available for purchase by checking
      // the inventory
      InventoryRequest inventoryRequest = new InventoryRequest();
      inventoryRequest.setRequestId(orderId);
      inventoryRequest.setItemName(order.getItemName());
      inventoryRequest.setQuantity(order.getQuantity());
      InventoryResult inventoryResult = ctx.callActivity(ReserveInventoryActivity.class.getName(),
          inventoryRequest, InventoryResult.class).await();

      // If there is insufficient inventory, fail and let the user know
      if (!inventoryResult.isSuccess()) {
        notification.setMessage("Insufficient inventory for order : " + order.getItemName());
        ctx.callActivity(NotifyActivity.class.getName(), notification).await();
        ctx.complete(orderResult);
        return;
      }

      // Require orders over a certain threshold to be approved
      if (order.getTotalCost() > 5000) {
        ApprovalResult approvalResult = ctx.callActivity(RequestApprovalActivity.class.getName(),
            order, ApprovalResult.class).await();
        if (approvalResult != ApprovalResult.Approved) {
          notification.setMessage("Order " + order.getItemName() + " was not approved.");
          ctx.callActivity(NotifyActivity.class.getName(), notification).await();
          ctx.complete(orderResult);
          return;
        }
      }

      // There is enough inventory available so the user can purchase the item(s).
      // Process their payment
      PaymentRequest paymentRequest = new PaymentRequest();
      paymentRequest.setRequestId(orderId);
      paymentRequest.setItemBeingPurchased(order.getItemName());
      paymentRequest.setQuantity(order.getQuantity());
      paymentRequest.setAmount(order.getTotalCost());
      boolean isOK = ctx.callActivity(ProcessPaymentActivity.class.getName(),
          paymentRequest, boolean.class).await();
      if (!isOK) {
        notification.setMessage("Payment failed for order : " + orderId);
        ctx.callActivity(NotifyActivity.class.getName(), notification).await();
        ctx.complete(orderResult);
        return;
      }

      inventoryResult = ctx.callActivity(UpdateInventoryActivity.class.getName(),
          inventoryRequest, InventoryResult.class).await();
      if (!inventoryResult.isSuccess()) {
        // If there is an error updating the inventory, refund the user
        // paymentRequest.setAmount(-1 * paymentRequest.getAmount());
        // ctx.callActivity(ProcessPaymentActivity.class.getName(),
        // paymentRequest).await();

        // Let users know their payment processing failed
        notification.setMessage("Order failed to update inventory! : " + orderId);
        ctx.callActivity(NotifyActivity.class.getName(), notification).await();
        ctx.complete(orderResult);
        return;
      }

      // Let user know their order was processed
      notification.setMessage("Order completed! : " + orderId);
      ctx.callActivity(NotifyActivity.class.getName(), notification).await();

      // Complete the workflow with order result is processed
      orderResult.setProcessed(true);
      ctx.complete(orderResult);
    };
  }

}
```

#### `activities` 目录

这 `Activities` 目录包含工作流使用的四个工作流活动，这些活动在以下文件中定义：
- [`NotifyActivity.java`](https://github.com/dapr/quickstarts/tree/master/workflows/java/sdk/order-processor/src/main/java/io/dapr/quickstarts/workflows/activities/NotifyActivity.java)
- [`RequestApprovalActivity`](https://github.com/dapr/quickstarts/tree/master/workflows/java/sdk/order-processor/src/main/java/io/dapr/quickstarts/workflows/activities/RequestApprovalActivity.java)
- [`ReserveInventoryActivity`](https://github.com/dapr/quickstarts/tree/master/workflows/java/sdk/order-processor/src/main/java/io/dapr/quickstarts/workflows/activities/ReserveInventoryActivity.java)
- [`ProcessPaymentActivity`](https://github.com/dapr/quickstarts/tree/master/workflows/java/sdk/order-processor/src/main/java/io/dapr/quickstarts/workflows/activities/ProcessPaymentActivity.java)
- [`UpdateInventoryActivity`](https://github.com/dapr/quickstarts/tree/master/workflows/java/sdk/order-processor/src/main/java/io/dapr/quickstarts/workflows/activities/UpdateInventoryActivity.java)

{{% /codetab %}}

{{< /tabs >}}

## 告诉我们您的想法
我们一直在努力改进我们的快速入门示例，并重视您的反馈。 您觉得此快速入门有帮助吗？ 您有改进的建议吗？

加入我们的 [discord 频道](https://discord.com/channels/778680217417809931/953427615916638238)中的讨论。

## 下一步

- 使用 [HTTP而不是SDK，使用任何编程语言设置Dapr工作流]({{< ref howto-manage-workflow.md >}})
- 通过一个更深入的 [.NET SDK 示例工作流程](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
- [了解有关 Dapr 构建块的 Workflow 的更多信息]({{< ref workflow-overview >}})

{{< button text="探索 Dapr 教程  >>" page="getting-started/tutorials/_index.md" >}}