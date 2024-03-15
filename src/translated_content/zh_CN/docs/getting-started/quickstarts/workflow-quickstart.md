---
type: docs
title: 快速入门：工作流
linkTitle: Workflow
weight: 78
description: 开始使用 Dapr 工作流构建块
---

{{% alert title="注意" color="primary" %}}
Dapr工作流目前处于beta阶段。 [查看已知限制 {{% dapr-latest-version cli="true" %}}]({{< ref "workflow-overview.md#limitations" >}}).
{{% /alert %}}

让我们来看看 Dapr 的[Workflow构建块]({{< ref workflow-overview.md >}})。 在这个快速入门中，您将创建一个简单的控制台应用程序，以演示Dapr的工作流编程模型和工作流管理API。

在本指南中，您将：

- 再次运行 `order-processor` 应用程序。
- 启动工作流并观察工作流活动/任务的执行。
- 查看工作流逻辑和工作流活动，以及它们在代码中的表示方式。

<img src="/images/workflow-quickstart-overview.png" width=800 style="padding-bottom:15px;">

在继续快速入门之前，请选择您首选的特定语言 Dapr SDK。
{{< tabs "Python" "JavaScript" ".NET" "Java" Go >}}

 <!-- Python -->

{{% codetab %}}

`order-processor` 控制台应用启动并管理 `order_processing_workflow`，该工作流模拟从商店购买物品。 工作流由五个独特的工作流活动或任务组成：

- `notify_activity`: 利用记录器在整个工作流中打印出消息。 这些消息在以下情况下通知您：
  - 您的库存不足
  - 您的付款无法处理等等。
- `process_payment_activity`: 处理并授权支付。
- `verify_inventory_activity`: 检查状态存储以确保购买时有足够的库存存在。
- `update_inventory_activity`: 从状态存储中删除请求的项目，并使用新的剩余库存值更新存储。
- `request_approval_activity`: 如果付款金额超过50,000美元，则向经理请求批准。

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [已安装Python 3.7+](https://www.python.org/downloads/)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/workflows)。

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

在终端中，使用 [Multi-App Run]({{< ref multi-app-dapr-run >}}) 启动订单处理应用程序，并与一个 Dapr sidecar 并行运行：

```bash
dapr run -f .
```

这将使用唯一的工作流ID启动`order-processor`应用程序，并运行工作流活动。

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

当你运行 `dapr run -f .`：

1. 生成一个唯一的工作流订单ID（在上面的示例中，`f4e1926e-3721-478d-be8a-f5bebd1995da`）并安排工作流。
2. `NotifyActivity` 工作流活动发送通知，说明已收到一份包含10辆车的订单。
3. `ReserveInventoryActivity`工作流活动检查库存数据，确定是否可以提供订购的物料，并使用库存中的汽车数量进行响应。
4. 您的工作流程开始并通知您其状态。
5. `ProcessPaymentActivity` 工作流活动开始处理订单 `f4e1926e-3721-478d-be8a-f5bebd1995da` 的付款，并确认是否成功。
6. `UpdateInventoryActivity` 工作流活动在订单处理完成后，更新库存中当前可用的汽车。
7. `NotifyActivity` 工作流活动发送通知，说明该订单 `f4e1926e-3721-478d-be8a-f5bebd1995da` 已完成。
8. 工作流程已完成终止。

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

在`workflow.py`中，工作流被定义为一个类，其中包含所有相关任务（由工作流活动确定）。

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

 <!-- JavaScript -->

{{% codetab %}}

`order-processor` 控制台应用启动并管理订单处理工作流的生命周期，该工作流在状态存储中存储和检索数据。 工作流由四个工作流活动或任务组成:

- `notifyActivity`: 利用记录器在整个工作流中打印出消息。 这些消息会在库存不足、付款无法处理等情况下通知用户。
- `ReserveInventoryActivity`：检查状态存储以确保购买所需的库存足够。
- `RequestApprovalActivity`：请求批准超过一定阈值的订单
- `processPaymentActivity`: 处理并授权支付。
- `updateInventoryActivity`: 使用新的剩余库存值更新状态存储。

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [已安装最新的Node.js](https://nodejs.org/download/)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/workflows)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

在一个新的终端窗口中，导航到 `order-processor` 目录：

```bash
cd workflows/javascript/sdk/order-processor
```

安装依赖项：

```bash
cd ./javascript/sdk
npm install
npm run build
cd ..
```

### 第3步：运行订单处理程序应用

在终端中，使用 [Multi-App Run]({{< ref multi-app-dapr-run >}}) 启动订单处理应用程序，并与一个 Dapr sidecar 并行运行：

```bash
dapr run -f .
```

这将使用唯一的工作流ID启动`order-processor`应用程序，并运行工作流活动。

预期输出：

```
== APP - workflowApp == == APP == Orchestration scheduled with ID: 0c332155-1e02-453a-a333-28cfc7777642
== APP - workflowApp == == APP == Waiting 30 seconds for instance 0c332155-1e02-453a-a333-28cfc7777642 to complete...
== APP - workflowApp == == APP == Received "Orchestrator Request" work item with instance id '0c332155-1e02-453a-a333-28cfc7777642'
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Rebuilding local state with 0 history event...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, EXECUTIONSTARTED=1]
== APP - workflowApp == == APP == Processing order 0c332155-1e02-453a-a333-28cfc7777642...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Returning 1 action(s)
== APP - workflowApp == == APP == Received "Activity Request" work item
== APP - workflowApp == == APP == Received order 0c332155-1e02-453a-a333-28cfc7777642 for 10 item1 at a total cost of 100
== APP - workflowApp == == APP == Activity notifyActivity completed with output undefined (0 chars)
== APP - workflowApp == == APP == Received "Orchestrator Request" work item with instance id '0c332155-1e02-453a-a333-28cfc7777642'
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Rebuilding local state with 3 history event...
== APP - workflowApp == == APP == Processing order 0c332155-1e02-453a-a333-28cfc7777642...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Returning 1 action(s)
== APP - workflowApp == == APP == Received "Activity Request" work item
== APP - workflowApp == == APP == Reserving inventory for 0c332155-1e02-453a-a333-28cfc7777642 of 10 item1
== APP - workflowApp == == APP == 2024-02-16T03:15:59.498Z INFO [HTTPClient, HTTPClient] Sidecar Started
== APP - workflowApp == == APP == There are 100 item1 in stock
== APP - workflowApp == == APP == Activity reserveInventoryActivity completed with output {"success":true,"inventoryItem":{"perItemCost":100,"quantity":100,"itemName":"item1"}} (86 chars)
== APP - workflowApp == == APP == Received "Orchestrator Request" work item with instance id '0c332155-1e02-453a-a333-28cfc7777642'
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Rebuilding local state with 6 history event...
== APP - workflowApp == == APP == Processing order 0c332155-1e02-453a-a333-28cfc7777642...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Returning 1 action(s)
== APP - workflowApp == == APP == Received "Activity Request" work item
== APP - workflowApp == == APP == Processing payment for order item1
== APP - workflowApp == == APP == Payment of 100 for 10 item1 processed successfully
== APP - workflowApp == == APP == Activity processPaymentActivity completed with output true (4 chars)
== APP - workflowApp == == APP == Received "Orchestrator Request" work item with instance id '0c332155-1e02-453a-a333-28cfc7777642'
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Rebuilding local state with 9 history event...
== APP - workflowApp == == APP == Processing order 0c332155-1e02-453a-a333-28cfc7777642...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Returning 1 action(s)
== APP - workflowApp == == APP == Received "Activity Request" work item
== APP - workflowApp == == APP == Updating inventory for 0c332155-1e02-453a-a333-28cfc7777642 of 10 item1
== APP - workflowApp == == APP == Inventory updated for 0c332155-1e02-453a-a333-28cfc7777642, there are now 90 item1 in stock
== APP - workflowApp == == APP == Activity updateInventoryActivity completed with output {"success":true,"inventoryItem":{"perItemCost":100,"quantity":90,"itemName":"item1"}} (85 chars)
== APP - workflowApp == == APP == Received "Orchestrator Request" work item with instance id '0c332155-1e02-453a-a333-28cfc7777642'
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Rebuilding local state with 12 history event...
== APP - workflowApp == == APP == Processing order 0c332155-1e02-453a-a333-28cfc7777642...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Returning 1 action(s)
== APP - workflowApp == == APP == Received "Activity Request" work item
== APP - workflowApp == == APP == order 0c332155-1e02-453a-a333-28cfc7777642 processed successfully!
== APP - workflowApp == == APP == Activity notifyActivity completed with output undefined (0 chars)
== APP - workflowApp == == APP == Received "Orchestrator Request" work item with instance id '0c332155-1e02-453a-a333-28cfc7777642'
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Rebuilding local state with 15 history event...
== APP - workflowApp == == APP == Processing order 0c332155-1e02-453a-a333-28cfc7777642...
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP - workflowApp == == APP == Order 0c332155-1e02-453a-a333-28cfc7777642 processed successfully!
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Orchestration completed with status COMPLETED
== APP - workflowApp == == APP == 0c332155-1e02-453a-a333-28cfc7777642: Returning 1 action(s)
== APP - workflowApp == time="2024-02-15T21:15:59.5589687-06:00" level=info msg="0c332155-1e02-453a-a333-28cfc7777642: 'orderProcessingWorkflow' completed with a COMPLETED status." app_id=activity-sequence-workflow instance=kaibocai-devbox scope=wfengine.backend type=log ver=1.12.4
== APP - workflowApp == == APP == Instance 0c332155-1e02-453a-a333-28cfc7777642 completed
```

### （可选）第4步：在Zipkin中查看

运行 `dapr init` 启动 [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) Docker 容器。 如果容器已停止运行，请使用以下命令启动Zipkin Docker容器：

```
docker run -d -p 9411:9411 openzipkin/zipkin
```

在 Zipkin web UI 中查看工作流 trace span（通常在 `http://localhost:9411/zipkin/`）。

<img src="/images/workflow-trace-spans-zipkin.png" width=800 style="padding-bottom:15px;">

### 发生了什么？

当你运行 `dapr run -f .`：

1. 生成一个唯一的工作流订单ID（在上面的示例中，`0c332155-1e02-453a-a333-28cfc7777642`）并安排工作流。
2. `notifyActivity` 工作流活动发送通知，说明已收到一份包含10辆车的订单。
3. `reserveInventoryActivity`工作流活动检查库存数据，确定是否可以提供订购的物料，并使用库存中的汽车数量进行响应。
4. 您的工作流程开始并通知您其状态。
5. `processPaymentActivity` 工作流活动开始处理订单 `0c332155-1e02-453a-a333-28cfc7777642` 的付款，并确认是否成功。
6. `updateInventoryActivity` 工作流活动在订单处理完成后，更新库存中当前可用的汽车。
7. `notifyActivity` 工作流活动发送通知，说明该订单 `0c332155-1e02-453a-a333-28cfc7777642` 已完成。
8. 工作流程已完成终止。

#### `order-processor/workflowApp.ts`

在应用程序的文件中：

- 生成了唯一的工作流顺序 ID
- 工作流程已安排
- 检索工作流状态
- 工作流程及其调用的工作流程活动已注册

```javascript
import { DaprWorkflowClient, WorkflowRuntime, DaprClient } from "@dapr/dapr-dev";
import { InventoryItem, OrderPayload } from "./model";
import { notifyActivity, orderProcessingWorkflow, processPaymentActivity, requestApprovalActivity, reserveInventoryActivity, updateInventoryActivity } from "./orderProcessingWorkflow";

async function start() {
  // Update the gRPC client and worker to use a local address and port
  const workflowClient = new DaprWorkflowClient();
  const workflowWorker = new WorkflowRuntime();

  const daprClient = new DaprClient();
  const storeName = "statestore";

  const inventory = new InventoryItem("item1", 100, 100);
  const key = inventory.itemName;

  await daprClient.state.save(storeName, [
    {
      key: key,
      value: inventory,
    }
  ]);

  const order = new OrderPayload("item1", 100, 10);

  workflowWorker
  .registerWorkflow(orderProcessingWorkflow)
  .registerActivity(notifyActivity)
  .registerActivity(reserveInventoryActivity)
  .registerActivity(requestApprovalActivity)
  .registerActivity(processPaymentActivity)
  .registerActivity(updateInventoryActivity);

  // Wrap the worker startup in a try-catch block to handle any errors during startup
  try {
    await workflowWorker.start();
    console.log("Workflow runtime started successfully");
  } catch (error) {
    console.error("Error starting workflow runtime:", error);
  }

  // Schedule a new orchestration
  try {
    const id = await workflowClient.scheduleNewWorkflow(orderProcessingWorkflow, order);
    console.log(`Orchestration scheduled with ID: ${id}`);

    // Wait for orchestration completion
    const state = await workflowClient.waitForWorkflowCompletion(id, undefined, 30);

    console.log(`Orchestration completed! Result: ${state?.serializedOutput}`);
  } catch (error) {
    console.error("Error scheduling or waiting for orchestration:", error);
    throw error;
  }

  await workflowWorker.stop();
  await workflowClient.stop();
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

{{% /codetab %}}

 <!-- .NET -->

{{% codetab %}}

`order-processor` 控制台应用启动并管理订单处理工作流的生命周期，该工作流在状态存储中存储和检索数据。 工作流由四个工作流活动或任务组成:

- `NotifyActivity`: 利用记录器在整个工作流中打印出消息
- `ReserveInventoryActivity`: 检查状态存储以确保购买时有足够的库存
- `ProcessPaymentActivity`: 处理并授权付款
- `UpdateInventoryActivity`: 从状态存储中删除请求的项目，并使用新的剩余库存值更新存储

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [已安装.NET SDK或.NET 6 SDK](https://dotnet.microsoft.com/download)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/workflows)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

在一个新的终端窗口中，导航到 `order-processor` 目录：

```bash
cd workflows/csharp/sdk/order-processor
```

### 第3步：运行订单处理程序应用

在终端中，使用 [Multi-App Run]({{< ref multi-app-dapr-run >}}) 启动订单处理应用程序，并与一个 Dapr sidecar 并行运行：

```bash
dapr run -f .
```

这将使用唯一的工作流ID启动`order-processor`应用程序，并运行工作流活动。

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

当你运行 `dapr run -f .`：

1. 生成一个唯一的工作流订单ID（在上面的示例中，`6d2abcc9`）并安排工作流。
2. `NotifyActivity` 工作流活动发送通知，说明已收到一份包含10辆车的订单。
3. `ReserveInventoryActivity`工作流活动检查库存数据，确定是否可以提供订购的物料，并使用库存中的汽车数量进行响应。
4. 您的工作流程开始并通知您其状态。
5. `ProcessPaymentActivity` 工作流活动开始处理订单 `6d2abcc9` 的付款，并确认是否成功。
6. `UpdateInventoryActivity` 工作流活动在订单处理完成后，更新库存中当前可用的汽车。
7. `NotifyActivity` 工作流活动发送通知，表示订单 `6d2abcc9` 已完成。
8. 工作流程已完成终止。

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

在`OrderProcessingWorkflow.cs`中，工作流被定义为一个类，其中包含所有相关任务（由工作流活动确定）。

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

`Activities`目录包含工作流使用的四个工作流活动，这些活动在以下文件中定义：

- `NotifyActivity.cs`
- `ReserveInventoryActivity.cs`
- `ProcessPaymentActivity.cs`
- `UpdateInventoryActivity.cs`

## 观看演示

观看[此视频演练Dapr Workflow .NET演示](https://youtu.be/BxiKpEmchgQ?t=2564):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/BxiKpEmchgQ?start=2564" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

{{% /codetab %}}

 <!-- Java -->

{{% codetab %}}

`order-processor` 控制台应用启动并管理订单处理工作流的生命周期，该工作流在状态存储中存储和检索数据。 工作流由四个工作流活动或任务组成:

- `NotifyActivity`: 利用记录器在整个工作流中打印出消息
- `RequestApprovalActivity`：请求批准处理付款
- `ReserveInventoryActivity`: 检查状态存储以确保购买时有足够的库存
- `ProcessPaymentActivity`: 处理并授权付款
- `UpdateInventoryActivity`: 从状态存储中删除请求的项目，并使用新的剩余库存值更新存储

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- Java JDK 11（或更高版本）：
  - [Microsoft JDK 11](https://docs.microsoft.com/java/openjdk/download#openjdk-11)
  - [Oracle JDK 11](https://www.oracle.com/technetwork/java/javase/downloads/index.html#JDK11)
  - [OpenJDK 11](https://jdk.java.net/11/)
- [Apache Maven](https://maven.apache.org/install.html) version 3.x.

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/workflows)。

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

在终端中，使用 [Multi-App Run]({{< ref multi-app-dapr-run >}}) 启动订单处理应用程序，并与一个 Dapr sidecar 并行运行：

```bash
dapr run -f .
```

这将使用唯一的工作流ID启动`order-processor`应用程序，并运行工作流活动。

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

当你运行 `dapr run -f .`：

1. 生成一个唯一的工作流订单ID（在上面的示例中，`edceba90-9c45-4be8-ad40-60d16e060797`）并安排工作流。
2. `NotifyActivity` 工作流活动发送通知，说明已收到一份包含10辆车的订单。
3. `ReserveInventoryActivity`工作流活动检查库存数据，确定是否可以提供订购的物料，并使用库存中的汽车数量进行响应。
4. 一旦批准，您的工作流程开始并通知您其状态。
5. `ProcessPaymentActivity` 工作流活动开始处理订单 `edceba90-9c45-4be8-ad40-60d16e060797` 的付款，并确认是否成功。
6. `UpdateInventoryActivity` 工作流活动在订单处理完成后，更新库存中当前可用的汽车。
7. `NotifyActivity` 工作流活动发送通知，说明该订单 `edceba90-9c45-4be8-ad40-60d16e060797` 已完成。
8. 工作流程已完成终止。

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

在`OrderProcessingWorkflow.java`中，工作流被定义为一个类，其中包含所有相关任务（由工作流活动确定）。

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

`Activities`目录包含工作流使用的四个工作流活动，这些活动在以下文件中定义：

- [`NotifyActivity.java`](https://github.com/dapr/quickstarts/tree/master/workflows/java/sdk/order-processor/src/main/java/io/dapr/quickstarts/workflows/activities/NotifyActivity.java)
- [`RequestApprovalActivity`](https://github.com/dapr/quickstarts/tree/master/workflows/java/sdk/order-processor/src/main/java/io/dapr/quickstarts/workflows/activities/RequestApprovalActivity.java)
- [`ReserveInventoryActivity`](https://github.com/dapr/quickstarts/tree/master/workflows/java/sdk/order-processor/src/main/java/io/dapr/quickstarts/workflows/activities/ReserveInventoryActivity.java)
- [`ProcessPaymentActivity`](https://github.com/dapr/quickstarts/tree/master/workflows/java/sdk/order-processor/src/main/java/io/dapr/quickstarts/workflows/activities/ProcessPaymentActivity.java)
- [`UpdateInventoryActivity`](https://github.com/dapr/quickstarts/tree/master/workflows/java/sdk/order-processor/src/main/java/io/dapr/quickstarts/workflows/activities/UpdateInventoryActivity.java)

{{% /codetab %}}

 <!-- Go -->

{{% codetab %}}

`order-processor` 控制台应用程序启动和管理 `OrderProcessingWorkflow` 工作流，模拟从商店购买物品。 工作流由五个独特的工作流活动或任务组成：

- `NotifyActivity`: 利用记录器在整个工作流中打印出消息。 这些消息在以下情况下通知您：
  - 您的库存不足
  - 您的付款无法处理等等。
- `ProcessPaymentActivity`: 处理并授权付款.
- `VerifyInventoryActivity`: 检查状态存储以确保有足够的库存可供购买。
- `UpdateInventoryActivity`: 从状态存储中删除请求的项目，并使用新的剩余库存值更新存储。
- `RequestApprovalActivity`: 如果付款金额超过50,000美元，则向经理请求批准。

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [Go的最新版本](https://go.dev/dl/)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/workflows)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

在一个新的终端窗口中，导航到 `order-processor` 目录：

```bash
cd workflows/go/sdk/order-processor
```

### 第3步：运行订单处理程序应用

在终端中，使用 [Multi-App Run]({{< ref multi-app-dapr-run >}}) 启动订单处理应用程序，并与一个 Dapr sidecar 并行运行：

```bash
dapr run -f .
```

这将使用唯一的工作流ID启动`order-processor`应用程序，并运行工作流活动。

预期输出：

```bash
== APP - order-processor == *** Welcome to the Dapr Workflow console app sample!
== APP - order-processor == *** Using this app, you can place orders that start workflows.
== APP - order-processor == dapr client initializing for: 127.0.0.1:50056
== APP - order-processor == adding base stock item: paperclip
== APP - order-processor == 2024/02/01 12:59:52 work item listener started
== APP - order-processor == INFO: 2024/02/01 12:59:52 starting background processor
== APP - order-processor == adding base stock item: cars
== APP - order-processor == adding base stock item: computers
== APP - order-processor == ==========Begin the purchase of item:==========
== APP - order-processor == NotifyActivity: Received order 48ee83b7-5d80-48d5-97f9-6b372f5480a5 for 10 cars - $150000
== APP - order-processor == VerifyInventoryActivity: Verifying inventory for order 48ee83b7-5d80-48d5-97f9-6b372f5480a5 of 10 cars
== APP - order-processor == VerifyInventoryActivity: There are 100 cars available for purchase
== APP - order-processor == RequestApprovalActivity: Requesting approval for payment of 150000USD for 10 cars
== APP - order-processor == NotifyActivity: Payment for order 48ee83b7-5d80-48d5-97f9-6b372f5480a5 has been approved!
== APP - order-processor == ProcessPaymentActivity: 48ee83b7-5d80-48d5-97f9-6b372f5480a5 for 10 - cars (150000USD)
== APP - order-processor == UpdateInventoryActivity: Checking Inventory for order 48ee83b7-5d80-48d5-97f9-6b372f5480a5 for 10 * cars
== APP - order-processor == UpdateInventoryActivity: There are now 90 cars left in stock
== APP - order-processor == NotifyActivity: Order 48ee83b7-5d80-48d5-97f9-6b372f5480a5 has completed!
== APP - order-processor == Workflow completed - result: COMPLETED
== APP - order-processor == Purchase of item is complete
```

使用 `CTRL+C` 或以下命令停止 Dapr 工作流:

```bash
dapr stop -f .
```

### （可选）第4步：在Zipkin中查看

运行 `dapr init` 启动 [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) Docker 容器。 如果容器已停止运行，请使用以下命令启动Zipkin Docker容器：

```
docker run -d -p 9411:9411 openzipkin/zipkin
```

在 Zipkin web UI 中查看工作流 trace span（通常在 `http://localhost:9411/zipkin/`）。

<img src="/images/workflow-trace-spans-zipkin.png" width=800 style="padding-bottom:15px;">

### 发生了什么？

当你运行 `dapr run`:

1. 生成一个唯一的工作流订单ID（在上面的示例中，`48ee83b7-5d80-48d5-97f9-6b372f5480a5`）并安排工作流。
2. `NotifyActivity` 工作流活动发送通知，说明已收到一份包含10辆车的订单。
3. `ReserveInventoryActivity`工作流活动检查库存数据，确定是否可以提供订购的物料，并使用库存中的汽车数量进行响应。
4. 您的工作流程开始并通知您其状态。
5. `ProcessPaymentActivity` 工作流活动开始处理订单 `48ee83b7-5d80-48d5-97f9-6b372f5480a5` 的付款，并确认是否成功。
6. `UpdateInventoryActivity` 工作流活动在订单处理完成后，更新库存中当前可用的汽车。
7. `NotifyActivity` 工作流活动发送通知，说明该订单 `48ee83b7-5d80-48d5-97f9-6b372f5480a5` 已完成。
8. 工作流程已完成终止。

#### `order-processor/main.go`

在应用程序的程序文件中：

- 生成了唯一的工作流顺序 ID
- 工作流程已安排
- 检索工作流状态
- 工作流程及其调用的工作流程活动已注册

```go
func main() {
	fmt.Println("*** Welcome to the Dapr Workflow console app sample!")
	fmt.Println("*** Using this app, you can place orders that start workflows.")

  // ...

  // Register workflow and activities
	if err := w.RegisterWorkflow(OrderProcessingWorkflow); err != nil {
		log.Fatal(err)
	}
	if err := w.RegisterActivity(NotifyActivity); err != nil {
		log.Fatal(err)
	}
	if err := w.RegisterActivity(RequestApprovalActivity); err != nil {
		log.Fatal(err)
	}
	if err := w.RegisterActivity(VerifyInventoryActivity); err != nil {
		log.Fatal(err)
	}
	if err := w.RegisterActivity(ProcessPaymentActivity); err != nil {
		log.Fatal(err)
	}
	if err := w.RegisterActivity(UpdateInventoryActivity); err != nil {
		log.Fatal(err)
	}

  // Build and start workflow runtime, pulling and executing tasks
	if err := w.Start(); err != nil {
		log.Fatal(err)
	}

	daprClient, err := client.NewClient()
	if err != nil {
		log.Fatalf("failed to initialise dapr client: %v", err)
	}
	wfClient, err := workflow.NewClient(workflow.WithDaprClient(daprClient))
	if err != nil {
		log.Fatalf("failed to initialise workflow client: %v", err)
	}

  // Check inventory
	inventory := []InventoryItem{
		{ItemName: "paperclip", PerItemCost: 5, Quantity: 100},
		{ItemName: "cars", PerItemCost: 15000, Quantity: 100},
		{ItemName: "computers", PerItemCost: 500, Quantity: 100},
	}
	if err := restockInventory(daprClient, inventory); err != nil {
		log.Fatalf("failed to restock: %v", err)
	}

	fmt.Println("==========Begin the purchase of item:==========")

	itemName := defaultItemName
	orderQuantity := 10

	totalCost := inventory[1].PerItemCost * orderQuantity

	orderPayload := OrderPayload{
		ItemName:  itemName,
		Quantity:  orderQuantity,
		TotalCost: totalCost,
	}

  // Start workflow events, like receiving order, verifying inventory, and processing payment 
	id, err := wfClient.ScheduleNewWorkflow(context.Background(), workflowName, workflow.WithInput(orderPayload))
	if err != nil {
		log.Fatalf("failed to start workflow: %v", err)
	}

	// ...

  // Notification that workflow has completed or failed
	for {
		timeDelta := time.Since(startTime)
		metadata, err := wfClient.FetchWorkflowMetadata(context.Background(), id)
		if err != nil {
			log.Fatalf("failed to fetch workflow: %v", err)
		}
		if (metadata.RuntimeStatus == workflow.StatusCompleted) || (metadata.RuntimeStatus == workflow.StatusFailed) || (metadata.RuntimeStatus == workflow.StatusTerminated) {
			fmt.Printf("Workflow completed - result: %v\n", metadata.RuntimeStatus.String())
			break
		}
		if timeDelta.Seconds() >= 10 {
			metadata, err := wfClient.FetchWorkflowMetadata(context.Background(), id)
			if err != nil {
				log.Fatalf("failed to fetch workflow: %v", err)
			}
			if totalCost > 50000 && !approvalSought && ((metadata.RuntimeStatus != workflow.StatusCompleted) || (metadata.RuntimeStatus != workflow.StatusFailed) || (metadata.RuntimeStatus != workflow.StatusTerminated)) {
				approvalSought = true
				promptForApproval(id)
			}
		}
		// Sleep to not DoS the dapr dev instance
		time.Sleep(time.Second)
	}

	fmt.Println("Purchase of item is complete")
}

// Request approval (RequestApprovalActivity)
func promptForApproval(id string) {
	wfClient, err := workflow.NewClient()
	if err != nil {
		log.Fatalf("failed to initialise wfClient: %v", err)
	}
	if err := wfClient.RaiseEvent(context.Background(), id, "manager_approval"); err != nil {
		log.Fatal(err)
	}
}

// Update inventory for remaining stock (UpdateInventoryActivity)
func restockInventory(daprClient client.Client, inventory []InventoryItem) error {
	for _, item := range inventory {
		itemSerialized, err := json.Marshal(item)
		if err != nil {
			return err
		}
		fmt.Printf("adding base stock item: %s\n", item.ItemName)
		if err := daprClient.SaveState(context.Background(), stateStoreName, item.ItemName, itemSerialized, nil); err != nil {
			return err
		}
	}
	return nil
}
```

同时，`OrderProcessingWorkflow`及其活动在[`workflow.go`](https://github.com/dapr/quickstarts/workflows/go/sdk/order-processor/workflow.go)中定义为方法。

{{% /codetab %}}

{{< /tabs >}}

## 告诉我们您的想法

我们一直在努力改进我们的快速入门示例，并重视您的反馈。 您觉得此快速入门有帮助吗？ 您有改进的建议吗？

加入我们的[discord频道](https://discord.com/channels/778680217417809931/953427615916638238)参与讨论。

## 下一步

- 使用任何编程语言[HTTP而不是SDK]({{< ref howto-manage-workflow.md >}})设置Dapr工作流
- 浏览更详细的 [.NET SDK 示例工作流程](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
- 了解有关[Dapr 构建块的 Workflow]({{< ref workflow-overview >}})

{{< button text="探索 Dapr 教程  >>" page="getting-started/tutorials/_index.md" >}}
