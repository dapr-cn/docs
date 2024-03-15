---
type: docs
title: 如何：在 JavaScript SDK 中创作和管理 Dapr 工作流
linkTitle: 指南：如何编写和管理工作流
weight: 20000
description: 如何使用 Dapr JavaScript SDK 启动和运行工作流
---

{{% alert title="注意" color="primary" %}}
Dapr工作流目前处于beta阶段。 [查看已知限制 {{% dapr-latest-version cli="true" %}}]({{< ref "workflow-overview\.md#limitations" >}}).
{{% /alert %}}

让我们创建一个 Dapr 工作流，并使用控制台调用它。 通过[提供的工作流示例](https://github.com/dapr/js-sdk/tree/main/examples/workflow)，您将：

- 使用[JavaScript工作流工作者](https://github.com/dapr/js-sdk/tree/main/src/workflow/runtime/WorkflowRuntime.ts)执行工作流实例
- 利用JavaScript工作流客户端和API调用来[启动和终止工作流实例](https://github.com/dapr/js-sdk/tree/main/src/workflow/client/DaprWorkflowClient.ts)

这个示例使用[dapr init](https://github.com/dapr/cli#install-dapr-on-your-local-machine-self-hosted)中的默认配置，在[自托管模式](https://github.com/dapr/cli#install-dapr-on-your-local-machine-self-hosted)下。

## 前期准备

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [Node.js 和 npm](https://docs.npmjs.com/zh/downloading-and-installing-node-js-and-npm)，
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

- 验证您是否正在使用最新的proto绑定

## 设置环境

克隆JavaScript SDK存储库并进入该存储库。

```bash
git clone https://github.com/dapr/js-sdk
cd js-sdk
```

从 JavaScript SDK 根目录中，导航到 Dapr Workflow 示例。

```bash
cd examples/workflow/authoring
```

运行以下命令使用 Dapr JavaScript SDK 安装运行此工作流示例所需的依赖项。

```bash
npm install
```

## 运行`activity-sequence.ts`

`activity-sequence` 文件在 Dapr 工作流运行时中注册了一个工作流和一个活动。 工作流是按顺序执行的一系列活动。 我们使用DaprWorkflowClient来调度一个新的工作流实例并等待其完成。

```typescript
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
```

在上面的代码中:

- `workflowRuntime.registerWorkflow(sequence)` 在 Dapr Workflow 运行时中将 `sequence` 注册为一个工作流。
- `await workflowRuntime.start();` 构建并启动 Dapr Workflow 运行时内的引擎。
- `await workflowClient.scheduleNewWorkflow(sequence)` 使用 Dapr Workflow 运行时调度一个新的工作流实例。
- `await workflowClient.waitForWorkflowCompletion(id, undefined, 30)` 等待工作流实例完成。

在终端中执行以下命令来启动 `activity-sequence.ts`：

```sh
npm run start:dapr:activity-sequence
```

**预期输出**

```
You're up and running! Both Dapr and your app logs will appear here.

...

== APP == Orchestration scheduled with ID: dc040bea-6436-4051-9166-c9294f9d2201
== APP == Waiting 30 seconds for instance dc040bea-6436-4051-9166-c9294f9d2201 to complete...
== APP == Received "Orchestrator Request" work item with instance id 'dc040bea-6436-4051-9166-c9294f9d2201'
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Rebuilding local state with 0 history event...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, EXECUTIONSTARTED=1]
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Waiting for 1 task(s) and 0 event(s) to complete...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Returning 1 action(s)
== APP == Received "Activity Request" work item
== APP == Activity hello completed with output "Hello Tokyo!" (14 chars)
== APP == Received "Orchestrator Request" work item with instance id 'dc040bea-6436-4051-9166-c9294f9d2201'
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Rebuilding local state with 3 history event...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Waiting for 1 task(s) and 0 event(s) to complete...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Returning 1 action(s)
== APP == Received "Activity Request" work item
== APP == Activity hello completed with output "Hello Seattle!" (16 chars)
== APP == Received "Orchestrator Request" work item with instance id 'dc040bea-6436-4051-9166-c9294f9d2201'
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Rebuilding local state with 6 history event...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Waiting for 1 task(s) and 0 event(s) to complete...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Returning 1 action(s)
== APP == Received "Activity Request" work item
== APP == Activity hello completed with output "Hello London!" (15 chars)
== APP == Received "Orchestrator Request" work item with instance id 'dc040bea-6436-4051-9166-c9294f9d2201'
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Rebuilding local state with 9 history event...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Orchestration completed with status COMPLETED
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Returning 1 action(s)
INFO[0006] dc040bea-6436-4051-9166-c9294f9d2201: 'sequence' completed with a COMPLETED status.  app_id=activity-sequence-workflow instance=kaibocai-devbox scope=wfengine.backend type=log ver=1.12.3
== APP == Instance dc040bea-6436-4051-9166-c9294f9d2201 completed
== APP == Orchestration completed! Result: ["Hello Tokyo!","Hello Seattle!","Hello London!"]
```

## 下一步

- [了解更多关于Dapr工作流]({{< ref workflow-overview\.md >}})
- [Workflow API 参考文档]({{< ref workflow_api.md >}})
