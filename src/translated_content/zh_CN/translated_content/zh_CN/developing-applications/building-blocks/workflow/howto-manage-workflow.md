---
type: docs
title: 指南：如何管理工作流
linkTitle: 指南：如何管理工作流
weight: 6000
description: 管理和运行工作流
---

{{% alert title="注意" color="primary" %}}
Dapr Workflow 目前处于 beta 版阶段。 [查看已知限制{{% dapr-latest-version cli="true" %}}]({{< ref "workflow-overview\.md#limitations" >}})。
{{% /alert %}}

现在，您已经[在应用程序中编写了工作流及其活动]({{< ref howto-author-workflow\.md >}})，可以使用HTTP API调用来启动、终止和获取有关工作流的信息。 更多信息，请阅读 [工作流 API 参考]({{< ref workflow_api.md >}})。



<!--Python-->

{{% codetab %}}

在代码中管理工作流。 在[编写工作流]({{< ref "howto-author-workflow\.md#write-the-application" >}})指南中的工作流示例中，工作流是使用以下API在代码中注册的：

- **start_workflow**: 启动一个工作流实例
- **get_workflow**: 获取工作流的状态信息
- **pause_workflow**: 暂停或中止一个工作流实例，稍后可恢复该实例
- **resume_workflow**: 恢复暂停的工作流实例
- **raise_workflow_event**: 在工作流中引发事件
- **purge_workflow**: 删除与特定工作流实例相关的所有元数据
- **terminate_workflow**: 终止或停止工作流的特定实例

```python
from dapr.ext.workflow import WorkflowRuntime, DaprWorkflowContext, WorkflowActivityContext
from dapr.clients import DaprClient

# Sane parameters
instanceId = "exampleInstanceID"
workflowComponent = "dapr"
workflowName = "hello_world_wf"
eventName = "event1"
eventData = "eventData"

# Start the workflow
start_resp = d.start_workflow(instance_id=instanceId, workflow_component=workflowComponent,
                        workflow_name=workflowName, input=inputData, workflow_options=workflowOptions)

# Get info on the workflow
getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)

# Pause the workflow
d.pause_workflow(instance_id=instanceId, workflow_component=workflowComponent)

# Resume the workflow
d.resume_workflow(instance_id=instanceId, workflow_component=workflowComponent)

# Raise an event on the workflow. 
 d.raise_workflow_event(instance_id=instanceId, workflow_component=workflowComponent,
                    event_name=eventName, event_data=eventData)

# Purge the workflow
d.purge_workflow(instance_id=instanceId, workflow_component=workflowComponent)

# Terminate the workflow
d.terminate_workflow(instance_id=instanceId, workflow_component=workflowComponent)
```



<!--JavaScript-->

{{% codetab %}}

在代码中管理工作流。 在[编写工作流]({{< ref "howto-author-workflow\.md#write-the-application" >}})指南中的工作流示例中，工作流是使用以下API在代码中注册的：

- **client.workflow\.start**: 启动一个工作流实例
- **client.workflow\.get**: 获取工作流的状态信息
- **client.workflow\.pause**: 暂停或中止一个工作流实例，稍后可恢复该实例
- **client.workflow\.resume**: 恢复暂停的工作流实例
- **client.workflow\.purge**: 删除与特定工作流实例相关的所有元数据
- **client.workflow\.terminate**: 终止或停止工作流的特定实例

```javascript
import { DaprClient } from "@dapr/dapr";

async function printWorkflowStatus(client: DaprClient, instanceId: string) {
  const workflow = await client.workflow.get(instanceId);
  console.log(
    `Workflow ${workflow.workflowName}, created at ${workflow.createdAt.toUTCString()}, has status ${
      workflow.runtimeStatus
    }`,
  );
  console.log(`Additional properties: ${JSON.stringify(workflow.properties)}`);
  console.log("--------------------------------------------------\n\n");
}

async function start() {
  const client = new DaprClient();

  // Start a new workflow instance
  const instanceId = await client.workflow.start("OrderProcessingWorkflow", {
    Name: "Paperclips",
    TotalCost: 99.95,
    Quantity: 4,
  });
  console.log(`Started workflow instance ${instanceId}`);
  await printWorkflowStatus(client, instanceId);

  // Pause a workflow instance
  await client.workflow.pause(instanceId);
  console.log(`Paused workflow instance ${instanceId}`);
  await printWorkflowStatus(client, instanceId);

  // Resume a workflow instance
  await client.workflow.resume(instanceId);
  console.log(`Resumed workflow instance ${instanceId}`);
  await printWorkflowStatus(client, instanceId);

  // Terminate a workflow instance
  await client.workflow.terminate(instanceId);
  console.log(`Terminated workflow instance ${instanceId}`);
  await printWorkflowStatus(client, instanceId);

  // Wait for the workflow to complete, 30 seconds!
  await new Promise((resolve) => setTimeout(resolve, 30000));
  await printWorkflowStatus(client, instanceId);

  // Purge a workflow instance
  await client.workflow.purge(instanceId);
  console.log(`Purged workflow instance ${instanceId}`);
  // This will throw an error because the workflow instance no longer exists.
  await printWorkflowStatus(client, instanceId);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```



<!--NET-->

{{% codetab %}}

在代码中管理工作流。 在`OrderProcessingWorkflow`示例中，来自[编写工作流]({{< ref "howto-author-workflow\.md#write-the-application" >}})指南，工作流在代码中注册。 现在，您可以启动、终止正在运行的工作流程，并获取相关信息：

```csharp
string orderId = "exampleOrderId";
string workflowComponent = "dapr";
string workflowName = "OrderProcessingWorkflow";
OrderPayload input = new OrderPayload("Paperclips", 99.95);
Dictionary<string, string> workflowOptions; // This is an optional parameter

// Start the workflow. This returns back a "StartWorkflowResponse" which contains the instance ID for the particular workflow instance.
StartWorkflowResponse startResponse = await daprClient.StartWorkflowAsync(orderId, workflowComponent, workflowName, input, workflowOptions);

// Get information on the workflow. This response contains information such as the status of the workflow, when it started, and more!
GetWorkflowResponse getResponse = await daprClient.GetWorkflowAsync(orderId, workflowComponent, eventName);

// Terminate the workflow
await daprClient.TerminateWorkflowAsync(orderId, workflowComponent);

// Raise an event (an incoming purchase order) that your workflow will wait for. This returns the item waiting to be purchased.
await daprClient.RaiseWorkflowEventAsync(orderId, workflowComponent, workflowName, input);

// Pause
await daprClient.PauseWorkflowAsync(orderId, workflowComponent);

// Resume
await daprClient.ResumeWorkflowAsync(orderId, workflowComponent);

// Purge the workflow, removing all inbox and history information from associated instance
await daprClient.PurgeWorkflowAsync(orderId, workflowComponent);
```



<!--Java-->

{{% codetab %}}

在代码中管理工作流。 [在Java SDK的工作流示例中](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/)，工作流是使用以下API在代码中注册的：

- **scheduleNewWorkflow**: 启动新的工作流实例
- **getInstanceState**: 获取工作流的状态信息
- **waitForInstanceStart**: 暂停或中止一个工作流实例，稍后可恢复该实例
- **raiseEvent**: 为正在运行的工作流实例触发事件/任务
- **waitForInstanceCompletion**: 等待工作流完成其任务
- **purgeInstance**: 删除与特定工作流实例相关的所有元数据
- **terminateWorkflow**: 终止工作流程
- **purgeInstance**: 删除与特定工作流相关的所有元数据

```java
package io.dapr.examples.workflows;

import io.dapr.workflows.client.DaprWorkflowClient;
import io.dapr.workflows.client.WorkflowInstanceStatus;

// ...
public class DemoWorkflowClient {

  // ...
  public static void main(String[] args) throws InterruptedException {
    DaprWorkflowClient client = new DaprWorkflowClient();

    try (client) {
      // Start a workflow
      String instanceId = client.scheduleNewWorkflow(DemoWorkflow.class, "input data");
      
      // Get status information on the workflow
      WorkflowInstanceStatus workflowMetadata = client.getInstanceState(instanceId, true);

      // Wait or pause for the workflow instance start
      try {
        WorkflowInstanceStatus waitForInstanceStartResult =
            client.waitForInstanceStart(instanceId, Duration.ofSeconds(60), true);
      }

      // Raise an event for the workflow; you can raise several events in parallel
      client.raiseEvent(instanceId, "TestEvent", "TestEventPayload");
      client.raiseEvent(instanceId, "event1", "TestEvent 1 Payload");
      client.raiseEvent(instanceId, "event2", "TestEvent 2 Payload");
      client.raiseEvent(instanceId, "event3", "TestEvent 3 Payload");

      // Wait for workflow to complete running through tasks
      try {
        WorkflowInstanceStatus waitForInstanceCompletionResult =
            client.waitForInstanceCompletion(instanceId, Duration.ofSeconds(60), true);
      } 

      // Purge the workflow instance, removing all metadata associated with it
      boolean purgeResult = client.purgeInstance(instanceId);

      // Terminate the workflow instance
      client.terminateWorkflow(instanceToTerminateId, null);

    System.exit(0);
  }
}
```



<!--Go-->

{{% codetab %}}

在代码中管理工作流。 [在Go SDK的工作流示例](https://github.com/dapr/go-sdk/tree/main/examples/workflow)中，工作流是使用以下API在代码中注册的：

- **StartWorkflow**: 启动新的工作流实例
- **GetWorkflow**: 获取工作流的状态信息
- **PauseWorkflow**: 暂停或中止一个工作流实例，稍后可恢复该实例
- **RaiseEventWorkflow**: 为正在运行的工作流实例触发事件/任务
- **ResumeWorkflow**: 等待工作流完成其任务
- **PurgeWorkflow**：删除与特定工作流实例相关的所有元数据
- **TerminateWorkflow**: 终止工作流程

```go
// Start workflow
type StartWorkflowRequest struct {
	InstanceID        string // Optional instance identifier
	WorkflowComponent string
	WorkflowName      string
	Options           map[string]string // Optional metadata
	Input             any               // Optional input
	SendRawInput      bool              // Set to True in order to disable serialization on the input
}

type StartWorkflowResponse struct {
	InstanceID string
}

// Get the workflow status
type GetWorkflowRequest struct {
	InstanceID        string
	WorkflowComponent string
}

type GetWorkflowResponse struct {
	InstanceID    string
	WorkflowName  string
	CreatedAt     time.Time
	LastUpdatedAt time.Time
	RuntimeStatus string
	Properties    map[string]string
}

// Purge workflow
type PurgeWorkflowRequest struct {
	InstanceID        string
	WorkflowComponent string
}

// Terminate workflow
type TerminateWorkflowRequest struct {
	InstanceID        string
	WorkflowComponent string
}

// Pause workflow
type PauseWorkflowRequest struct {
	InstanceID        string
	WorkflowComponent string
}

// Resume workflow
type ResumeWorkflowRequest struct {
	InstanceID        string
	WorkflowComponent string
}

// Raise an event for the running workflow
type RaiseEventWorkflowRequest struct {
	InstanceID        string
	WorkflowComponent string
	EventName         string
	EventData         any
	SendRawData       bool // Set to True in order to disable serialization on the data
}
```



<!--HTTP-->

{{% codetab %}}

使用 HTTP 调用管理工作流。 下面的示例插入了 [编写工作流示例]({{< ref "howto-author-workflow\.md#write-the-workflow" >}}) 中的属性，并随机设置了实例 ID 号。

### 启动工作流

要使用 ID `12345678` 启动工作流，请运行：

```http
POST http://localhost:3500/v1.0-beta1/workflows/dapr/OrderProcessingWorkflow/start?instanceID=12345678
```

请注意，工作流实例 ID 只能包含字母数字字符、下划线和破折号。

### 终止工作流程

要使用 ID `12345678` 终止工作流，请运行：

```http
POST http://localhost:3500/v1.0-beta1/workflows/dapr/12345678/terminate
```

### 引发事件

对于支持订阅外部事件的工作流组件（如 Dapr 工作流引擎），您可以使用以下 "raise event" API 向特定工作流实例发送已命名的事件。

```http
POST http://localhost:3500/v1.0-beta1/workflows/<workflowComponentName>/<instanceID>/raiseEvent/<eventName>
```

> `eventName` 可以是任何函数。

### 暂停或恢复工作流

若要规划停机时间、等待输入等，可以暂停，然后恢复工作流。 要暂停一个带有ID `12345678`的工作流，直到触发恢复，请运行：

```http
POST http://localhost:3500/v1.0-beta1/workflows/dapr/12345678/pause
```

要恢复一个带有 ID `12345678` 的工作流，请运行：

```http
POST http://localhost:3500/v1.0-beta1/workflows/dapr/12345678/resume
```

### 清除工作流

清除 API 可用于从底层状态存储中永久删除工作流元数据，包括任何已存储的输入、输出和工作流历史记录。 这通常有助于实施数据保留政策和释放资源。

只有处于 "已完成"、"已失败 "或 "已终止 "状态的工作流实例才能被清除。 如果工作流处于任何其他状态，调用清除会返回错误。

```http
POST http://localhost:3500/v1.0-beta1/workflows/dapr/12345678/purge
```

### 获取工作流程信息

要获取工作流信息（输出和输入）的 ID 为 `12345678`，请运行:

```http
GET http://localhost:3500/v1.0-beta1/workflows/dapr/12345678
```

了解有关这些HTTP调用的更多信息，请参阅[工作流API参考指南]({{< ref workflow_api.md >}})。



{{< /tabs >}}

## 下一步

- [尝试 Dapr 快速入门]({{< ref workflow-quickstart.md >}})

- 试用完整的 SDK 示例：
  - [Python示例](https://github.com/dapr/python-sdk/blob/master/examples/demo_workflow/app.py)
  - [JavaScript示例](https://github.com/dapr/js-sdk/tree/main/examples/workflow)
  - [.NET示例](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
  - [Java示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)
  - [Go示例](https://github.com/dapr/go-sdk/tree/main/examples/workflow)

- [Workflow API 参考文档]({{< ref workflow_api.md >}})
