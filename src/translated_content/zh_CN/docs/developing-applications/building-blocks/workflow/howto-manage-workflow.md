---
type: docs
title: "如何：管理工作流"
linkTitle: "如何：管理工作流"
weight: 6000
description: 管理和运行工作流
---

现在您已经在应用程序中[编写了工作流及其活动]({{< ref howto-author-workflow.md >}})，您可以使用HTTP API调用来启动、终止和获取工作流的信息。有关更多信息，请阅读[工作流API参考]({{< ref workflow_api.md >}})。

{{< tabs Python JavaScript ".NET" Java Go HTTP >}}

<!--Python-->
{{% codetab %}}

在代码中管理您的工作流。在[编写工作流]({{< ref "howto-author-workflow.md#write-the-application" >}})指南中的工作流示例中，工作流通过以下API在代码中注册：
- **start_workflow**: 启动工作流的一个实例
- **get_workflow**: 获取工作流状态的信息
- **pause_workflow**: 暂停或挂起一个工作流实例，稍后可以恢复
- **resume_workflow**: 恢复一个暂停的工作流实例
- **raise_workflow_event**: 在工作流上触发一个事件
- **purge_workflow**: 删除与特定工作流实例相关的所有元数据
- **terminate_workflow**: 终止或停止特定的工作流实例

```python
from dapr.ext.workflow import WorkflowRuntime, DaprWorkflowContext, WorkflowActivityContext
from dapr.clients import DaprClient

# 合适的参数
instanceId = "exampleInstanceID"
workflowComponent = "dapr"
workflowName = "hello_world_wf"
eventName = "event1"
eventData = "eventData"

# 启动工作流
start_resp = d.start_workflow(instance_id=instanceId, workflow_component=workflowComponent,
                        workflow_name=workflowName, input=inputData, workflow_options=workflowOptions)

# 获取工作流信息
getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)

# 暂停工作流
d.pause_workflow(instance_id=instanceId, workflow_component=workflowComponent)

# 恢复工作流
d.resume_workflow(instance_id=instanceId, workflow_component=workflowComponent)

# 在工作流上触发一个事件
d.raise_workflow_event(instance_id=instanceId, workflow_component=workflowComponent,
                    event_name=eventName, event_data=eventData)

# 清除工作流
d.purge_workflow(instance_id=instanceId, workflow_component=workflowComponent)

# 终止工作流
d.terminate_workflow(instance_id=instanceId, workflow_component=workflowComponent)
```

{{% /codetab %}}

<!--JavaScript-->
{{% codetab %}}

在代码中管理您的工作流。在[编写工作流]({{< ref "howto-author-workflow.md#write-the-application" >}})指南中的工作流示例中，工作流通过以下API在代码中注册：
- **client.workflow.start**: 启动工作流的一个实例
- **client.workflow.get**: 获取工作流状态的信息
- **client.workflow.pause**: 暂停或挂起一个工作流实例，稍后可以恢复
- **client.workflow.resume**: 恢复一个暂停的工作流实例
- **client.workflow.purge**: 删除与特定工作流实例相关的所有元数据
- **client.workflow.terminate**: 终止或停止特定的工作流实例

```javascript
import { DaprClient } from "@dapr/dapr";

async function printWorkflowStatus(client: DaprClient, instanceId: string) {
  const workflow = await client.workflow.get(instanceId);
  console.log(
    `工作流 ${workflow.workflowName}, 创建于 ${workflow.createdAt.toUTCString()}, 状态为 ${
      workflow.runtimeStatus
    }`,
  );
  console.log(`附加属性: ${JSON.stringify(workflow.properties)}`);
  console.log("--------------------------------------------------\n\n");
}

async function start() {
  const client = new DaprClient();

  // 启动一个新的工作流实例
  const instanceId = await client.workflow.start("OrderProcessingWorkflow", {
    Name: "Paperclips",
    TotalCost: 99.95,
    Quantity: 4,
  });
  console.log(`已启动工作流实例 ${instanceId}`);
  await printWorkflowStatus(client, instanceId);

  // 暂停一个工作流实例
  await client.workflow.pause(instanceId);
  console.log(`已暂停工作流实例 ${instanceId}`);
  await printWorkflowStatus(client, instanceId);

  // 恢复一个工作流实例
  await client.workflow.resume(instanceId);
  console.log(`已恢复工作流实例 ${instanceId}`);
  await printWorkflowStatus(client, instanceId);

  // 终止一个工作流实例
  await client.workflow.terminate(instanceId);
  console.log(`已终止工作流实例 ${instanceId}`);
  await printWorkflowStatus(client, instanceId);

  // 等待工作流完成，30秒！
  await new Promise((resolve) => setTimeout(resolve, 30000));
  await printWorkflowStatus(client, instanceId);

  // 清除一个工作流实例
  await client.workflow.purge(instanceId);
  console.log(`已清除工作流实例 ${instanceId}`);
  // 这将抛出一个错误，因为工作流实例不再存在。
  await printWorkflowStatus(client, instanceId);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

{{% /codetab %}}

<!--NET-->
{{% codetab %}}

在代码中管理您的工作流。在[编写工作流]({{< ref "howto-author-workflow.md#write-the-application" >}})指南中的`OrderProcessingWorkflow`示例中，工作流在代码中注册。您现在可以启动、终止并获取正在运行的工作流的信息：

```csharp
string orderId = "exampleOrderId";
string workflowComponent = "dapr";
string workflowName = "OrderProcessingWorkflow";
OrderPayload input = new OrderPayload("Paperclips", 99.95);
Dictionary<string, string> workflowOptions; // 这是一个可选参数

// 启动工作流。这将返回一个"StartWorkflowResponse"，其中包含特定工作流实例的实例ID。
StartWorkflowResponse startResponse = await daprClient.StartWorkflowAsync(orderId, workflowComponent, workflowName, input, workflowOptions);

// 获取工作流的信息。此响应包含工作流的状态、启动时间等信息！
GetWorkflowResponse getResponse = await daprClient.GetWorkflowAsync(orderId, workflowComponent, eventName);

// 终止工作流
await daprClient.TerminateWorkflowAsync(orderId, workflowComponent);

// 触发一个事件（一个传入的采购订单），您的工作流将等待此事件。这将返回等待购买的项目。
await daprClient.RaiseWorkflowEventAsync(orderId, workflowComponent, workflowName, input);

// 暂停
await daprClient.PauseWorkflowAsync(orderId, workflowComponent);

// 恢复
await daprClient.ResumeWorkflowAsync(orderId, workflowComponent);

// 清除工作流，删除与关联实例的所有收件箱和历史信息
await daprClient.PurgeWorkflowAsync(orderId, workflowComponent);
```

{{% /codetab %}}

<!--Java-->
{{% codetab %}}

在代码中管理您的工作流。[在Java SDK中的工作流示例](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/)中，工作流通过以下API在代码中注册：

- **scheduleNewWorkflow**: 启动一个新的工作流实例
- **getInstanceState**: 获取工作流状态的信息
- **waitForInstanceStart**: 暂停或挂起一个工作流实例，稍后可以恢复
- **raiseEvent**: 为正在运行的工作流实例触发事件/任务
- **waitForInstanceCompletion**: 等待工作流完成其任务
- **purgeInstance**: 删除与特定工作流实例相关的所有元数据
- **terminateWorkflow**: 终止工作流
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
      // 启动工作流
      String instanceId = client.scheduleNewWorkflow(DemoWorkflow.class, "input data");
      
      // 获取工作流的状态信息
      WorkflowInstanceStatus workflowMetadata = client.getInstanceState(instanceId, true);

      // 等待或暂停工作流实例启动
      try {
        WorkflowInstanceStatus waitForInstanceStartResult =
            client.waitForInstanceStart(instanceId, Duration.ofSeconds(60), true);
      }

      // 为工作流触发一个事件；您可以并行触发多个事件
      client.raiseEvent(instanceId, "TestEvent", "TestEventPayload");
      client.raiseEvent(instanceId, "event1", "TestEvent 1 Payload");
      client.raiseEvent(instanceId, "event2", "TestEvent 2 Payload");
      client.raiseEvent(instanceId, "event3", "TestEvent 3 Payload");

      // 等待工作流完成任务
      try {
        WorkflowInstanceStatus waitForInstanceCompletionResult =
            client.waitForInstanceCompletion(instanceId, Duration.ofSeconds(60), true);
      } 

      // 清除工作流实例，删除与其相关的所有元数据
      boolean purgeResult = client.purgeInstance(instanceId);

      // 终止工作流实例
      client.terminateWorkflow(instanceToTerminateId, null);

    System.exit(0);
  }
}
```

{{% /codetab %}}

<!--Go-->
{{% codetab %}}

在代码中管理您的工作流。[在Go SDK中的工作流示例](https://github.com/dapr/go-sdk/tree/main/examples/workflow)中，工作流通过以下API在代码中注册：

- **StartWorkflow**: 启动一个新的工作流实例
- **GetWorkflow**: 获取工作流状态的信息
- **PauseWorkflow**: 暂停或挂起一个工作流实例，稍后可以恢复
- **RaiseEventWorkflow**: 为正在运行的工作流实例触发事件/任务
- **ResumeWorkflow**: 等待工作流完成其任务
- **PurgeWorkflow**: 删除与特定工作流实例相关的所有元数据
- **TerminateWorkflow**: 终止工作流

```go
// 启动工作流
type StartWorkflowRequest struct {
	InstanceID        string // 可选实例标识符
	WorkflowComponent string
	WorkflowName      string
	Options           map[string]string // 可选元数据
	Input             any               // 可选输入
	SendRawInput      bool              // 设置为True以禁用输入的序列化
}

type StartWorkflowResponse struct {
	InstanceID string
}

// 获取工作流状态
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

// 清除工作流
type PurgeWorkflowRequest struct {
	InstanceID        string
	WorkflowComponent string
}

// 终止工作流
type TerminateWorkflowRequest struct {
	InstanceID        string
	WorkflowComponent string
}

// 暂停工作流
type PauseWorkflowRequest struct {
	InstanceID        string
	WorkflowComponent string
}

// 恢复工作流
type ResumeWorkflowRequest struct {
	InstanceID        string
	WorkflowComponent string
}

// 为正在运行的工作流触发一个事件
type RaiseEventWorkflowRequest struct {
	InstanceID        string
	WorkflowComponent string
	EventName         string
	EventData         any
	SendRawData       bool // 设置为True以禁用数据的序列化
}
```

{{% /codetab %}}

<!--HTTP-->
{{% codetab %}}

使用HTTP调用管理您的工作流。下面的示例将[编写工作流示例]({{< ref "howto-author-workflow.md#write-the-workflow" >}})中的属性与一个随机实例ID号结合使用。

### 启动工作流

要使用ID `12345678`启动您的工作流，请运行：

```http
POST http://localhost:3500/v1.0/workflows/dapr/OrderProcessingWorkflow/start?instanceID=12345678
```

请注意，工作流实例ID只能包含字母数字字符、下划线和破折号。

### 终止工作流

要使用ID `12345678`终止您的工作流，请运行：

```http
POST http://localhost:3500/v1.0/workflows/dapr/12345678/terminate
```

### 触发一个事件

对于支持订阅外部事件的工作流组件，例如Dapr工作流引擎，您可以使用以下“触发事件”API将命名事件传递给特定的工作流实例。

```http
POST http://localhost:3500/v1.0/workflows/<workflowComponentName>/<instanceID>/raiseEvent/<eventName>
```

> `eventName`可以是任何自定义的事件名称。

### 暂停或恢复工作流

为了计划停机时间、等待输入等，您可以暂停然后恢复工作流。要暂停ID为`12345678`的工作流，直到触发恢复，请运行：

```http
POST http://localhost:3500/v1.0/workflows/dapr/12345678/pause
```

要恢复ID为`12345678`的工作流，请运行：

```http
POST http://localhost:3500/v1.0/workflows/dapr/12345678/resume
```

### 清除工作流

清除API可用于从底层状态存储中永久删除工作流元数据，包括任何存储的输入、输出和工作流历史记录。这通常对于实施数据保留策略和释放资源很有用。

只有处于COMPLETED、FAILED或TERMINATED状态的工作流实例可以被清除。如果工作流处于其他状态，调用清除将返回错误。

```http
POST http://localhost:3500/v1.0/workflows/dapr/12345678/purge
```

### 获取工作流信息

要获取ID为`12345678`的工作流信息（输出和输入），请运行：

```http
GET http://localhost:3500/v1.0/workflows/dapr/12345678
```

在[工作流API参考指南]({{< ref workflow_api.md >}})中了解更多关于这些HTTP调用的信息。

{{% /codetab %}}

{{< /tabs >}}

## 下一步
- [尝试工作流快速入门]({{< ref workflow-quickstart.md >}})
- 尝试完整的SDK示例：
  - [Python示例](https://github.com/dapr/python-sdk/blob/master/examples/demo_workflow/app.py)
  - [JavaScript示例](https://github.com/dapr/js-sdk/tree/main/examples/workflow)
  - [.NET示例](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
  - [Java示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)
  - [Go示例](https://github.com/dapr/go-sdk/tree/main/examples/workflow)

- [工作流API参考]({{< ref workflow_api.md >}})
