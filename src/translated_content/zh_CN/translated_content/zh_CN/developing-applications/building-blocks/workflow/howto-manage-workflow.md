---
type: docs
title: "指南：如何管理工作流"
linkTitle: "指南：如何管理工作流"
weight: 6000
description: 管理和运行工作流
---

{{% alert title="Note" color="primary" %}}
Dapr 工作流目前处于 beta 阶段。 [查看 {{% dapr-latest-version cli="true" %}} 的已知限制]({{< ref "workflow-overview.md#limitations" >}})。
{{% /alert %}}

现在，您已经 [在应用程序中编写了工作流及其活动]({{< ref howto-author-workflow.md >}})，可以使用 HTTP API 调用来启动、终止和获取有关工作流的信息。 更多信息，请阅读 [工作流 API 参考]({{< ref workflow_api.md >}})。

{{< tabs Python ".NET" Java HTTP >}}

<!--Python-->
{{% codetab %}}

在代码中管理工作流。 在 [编写工作流]({{< ref "howto-author-workflow.md#write-the-application" >}}) 指南中的工作流示例中，工作流是使用以下 API 在代码中注册的：
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

# 正常参数
instanceId = "exampleInstanceID"
workflowComponent = "dapr"
workflowName = "hello_world_wf"
eventName = "event1"
eventData = "eventData"

# 启动工作流
start_resp = d. start_workflow(instance_id=instanceId).start_workflow(instance_id=instanceId, workflow_component=workflowComponent,
                        workflow_name=workflowName, input=inputData, workflow_options=workflowOptions)

# 获取工作流信息
getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)

# 暂停工作流
d.pause_workflow(instance_id=instanceId, workflow_component=workflowComponent)

# 恢复工作流
d.resume_workflow(instance_id=instanceId, workflow_component=workflowComponent)

# 引发工作流事件。 
 d.raise_workflow_event(instance_id=instanceId, workflow_component=workflowComponent,
                    event_name=eventName, event_data=eventData)

# 清除工作流
d.purge_workflow(instance_id=instanceId, workflow_component=workflowComponent)

# 终止工作流
d.terminate_workflow(instance_id=instanceId, workflow_component=workflowComponent)
```

{{% /codetab %}}

<!--NET-->
{{% codetab %}}

在代码中管理工作流。 在 [编写工作流]({{< ref "howto-author-workflow.md#write-the-application" >}}) 的指南中的 `OrderProcessingWorkflow` 示例中，工作流是在代码中注册的。 现在，您可以启动、终止正在运行的工作流程，并获取相关信息：

```csharp
string orderId = "exampleOrderId";
string workflowComponent = "dapr";
string workflowName = "OrderProcessingWorkflow";
OrderPayload input = new OrderPayload("Paperclips", 99.95);
Dictionary<string, string> workflowOptions; // 这是一个可选参数

// 启动工作流 这将返回 "StartWorkflowResponse"，其中包含特定工作流实例的实例 ID。
StartWorkflowResponse startResponse = await daprClient.StartWorkflowAsync(orderId, workflowComponent, workflowName, input, workflowOptions);

// 获取工作流信息。 此响应包含工作流的状态、开始时间等信息！
GetWorkflowResponse getResponse = await daprClient.GetWorkflowAsync(orderId, workflowComponent, eventName);

// Terminate the workflow
await daprClient.TerminateWorkflowAsync(orderId, workflowComponent);

// Raise an event (an incoming purchase order) that your workflow will wait for. 这将返回等待购买的项目。
await daprClient.RaiseWorkflowEventAsync(orderId, workflowComponent, workflowName, input);

// Pause
await daprClient.PauseWorkflowAsync(orderId, workflowComponent);

// Resume
await daprClient.ResumeWorkflowAsync(orderId, workflowComponent);

// Purge the workflow, removing all inbox and history information from associated instance
await daprClient.PurgeWorkflowAsync(orderId, workflowComponent);
```

{{% /codetab %}}

<!--Python-->
{{% codetab %}}

在代码中管理工作流。 在 Java SDK 中的工作流示例中，使用以下 API 在代码中注册工作流：[In the workflow example from the Java SDK](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/DemoWorkflowClient.java)

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

{{% /codetab %}}


<!--HTTP-->
{{% codetab %}}

使用 HTTP 调用管理工作流。 下面的示例插入了 [编写工作流示例]({{< ref "howto-author-workflow.md#write-the-workflow" >}}) 中的属性，并随机设置了实例 ID 号。

### 启动工作流

要使用 ID `12345678`启动工作流，请运行：

```http
POST http://localhost:3500/v1.0-beta1/workflows/dapr/OrderProcessingWorkflow/start?instanceID=12345678
```

请注意，工作流实例 ID 只能包含字母数字字符、下划线和破折号。

### 终止工作流程

要使用 ID `12345678`终止工作流，请运行：

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

若要规划停机时间、等待输入等，可以暂停，然后恢复工作流。 要暂停 ID 为 `12345678` 的工作流，直到触发恢复，请运行：

```http
POST http://localhost:3500/v1.0-beta1/workflows/dapr/12345678/pause
```

要恢复 ID 为 `12345678`的工作流，请运行：

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

要获取 ID 为 `12345678`的工作流信息（输出和输入），请运行

```http
GET http://localhost:3500/v1.0-beta1/workflows/dapr/12345678
```

更多信息，请阅读 [工作流 API 参考]({{< ref workflow_api.md >}})。


{{% /codetab %}}

{{< /tabs >}}


## 下一步
- [试用工作流快速入门]({{< ref workflow-quickstart.md >}})
- 试用完整的 SDK 示例：
  - [Python 示例](https://github.com/dapr/python-sdk/blob/master/examples/demo_workflow/app.py)
  - [.NET 示例](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
  - [Java 示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)

- [工作流 API 参考文档]({{< ref workflow_api.md >}})
