---
type: docs
title: "如何：在 JavaScript SDK 中编写和管理 Dapr 工作流"
linkTitle: "如何：编写和管理工作流"
weight: 20000
description: 如何使用 Dapr JavaScript SDK 快速启动和运行工作流
---

我们将创建一个 Dapr 工作流并通过控制台调用它。在这个示例中，您将：

- 使用 [JavaScript 工作流 worker](https://github.com/dapr/js-sdk/tree/main/src/workflow/runtime/WorkflowRuntime.ts) 来执行工作流实例
- 利用 JavaScript 工作流客户端和 API 调用来[启动和终止工作流实例](https://github.com/dapr/js-sdk/tree/main/src/workflow/client/DaprWorkflowClient.ts)

此示例在[自托管模式](https://github.com/dapr/cli#install-dapr-on-your-local-machine-self-hosted)下运行，使用 `dapr init` 的默认配置。

## 先决条件

- [Dapr CLI 和已初始化的环境](https://docs.dapr.io/getting-started)。
- [Node.js 和 npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- 确保您使用的是最新版本的 proto 绑定

## 设置环境

克隆 JavaScript SDK 仓库并进入其中。

```bash
git clone https://github.com/dapr/js-sdk
cd js-sdk
```

从 JavaScript SDK 根目录，导航到 Dapr 工作流示例。

```bash
cd examples/workflow/authoring
```

运行以下命令以安装运行此工作流示例所需的 Dapr JavaScript SDK 依赖。

```bash
npm install
```

## 运行 `activity-sequence.ts`

`activity-sequence` 文件在 Dapr 工作流运行时中注册了一个工作流和一个活动。工作流是按顺序执行的一系列活动。我们使用 DaprWorkflowClient 来调度一个新的工作流实例并等待其完成。

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

// 将 worker 启动包装在 try-catch 块中以处理启动期间的任何错误
try {
  await workflowRuntime.start();
  console.log("工作流运行时启动成功");
} catch (error) {
  console.error("启动工作流运行时出错：", error);
}

// 调度一个新的编排
try {
  const id = await workflowClient.scheduleNewWorkflow(sequence);
  console.log(`编排已调度，ID：${id}`);

  // 等待编排完成
  const state = await workflowClient.waitForWorkflowCompletion(id, undefined, 30);

  console.log(`编排完成！结果：${state?.serializedOutput}`);
} catch (error) {
  console.error("调度或等待编排时出错：", error);
}
```

在上面的代码中：

- `workflowRuntime.registerWorkflow(sequence)` 将 `sequence` 注册为 Dapr 工作流运行时中的一个工作流。
- `await workflowRuntime.start();` 构建并启动 Dapr 工作流运行时中的引擎。
- `await workflowClient.scheduleNewWorkflow(sequence)` 在 Dapr 工作流运行时中调度一个新的工作流实例。
- `await workflowClient.waitForWorkflowCompletion(id, undefined, 30)` 等待工作流实例完成。

在终端中，执行以下命令以启动 `activity-sequence.ts`：

```sh
npm run start:dapr:activity-sequence
```

**预期输出**

```
你已启动并运行！Dapr 和您的应用程序日志将出现在这里。

...

== APP == 编排已调度，ID：dc040bea-6436-4051-9166-c9294f9d2201
== APP == 等待 30 秒以完成实例 dc040bea-6436-4051-9166-c9294f9d2201...
== APP == 收到实例 id 为 'dc040bea-6436-4051-9166-c9294f9d2201' 的 "Orchestrator Request" 工作项
== APP == dc040bea-6436-4051-9166-c9294f9d2201: 使用 0 个历史事件重建本地状态...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: 处理 2 个新历史事件：[ORCHESTRATORSTARTED=1, EXECUTIONSTARTED=1]
== APP == dc040bea-6436-4051-9166-c9294f9d2201: 等待 1 个任务和 0 个事件完成...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: 返回 1 个动作
== APP == 收到 "Activity Request" 工作项
== APP == 活动 hello 完成，输出 "Hello Tokyo!" (14 个字符)
== APP == 收到实例 id 为 'dc040bea-6436-4051-9166-c9294f9d2201' 的 "Orchestrator Request" 工作项
== APP == dc040bea-6436-4051-9166-c9294f9d2201: 使用 3 个历史事件重建本地状态...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: 处理 2 个新历史事件：[ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP == dc040bea-6436-4051-9166-c9294f9d2201: 等待 1 个任务和 0 个事件完成...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: 返回 1 个动作
== APP == 收到 "Activity Request" 工作项
== APP == 活动 hello 完成，输出 "Hello Seattle!" (16 个字符)
== APP == 收到实例 id 为 'dc040bea-6436-4051-9166-c9294f9d2201' 的 "Orchestrator Request" 工作项
== APP == dc040bea-6436-4051-9166-c9294f9d2201: 使用 6 个历史事件重建本地状态...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: 处理 2 个新历史事件：[ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP == dc040bea-6436-4051-9166-c9294f9d2201: 等待 1 个任务和 0 个事件完成...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: 返回 1 个动作
== APP == 收到 "Activity Request" 工作项
== APP == 活动 hello 完成，输出 "Hello London!" (15 个字符)
== APP == 收到实例 id 为 'dc040bea-6436-4051-9166-c9294f9d2201' 的 "Orchestrator Request" 工作项
== APP == dc040bea-6436-4051-9166-c9294f9d2201: 使用 9 个历史事件重建本地状态...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: 处理 2 个新历史事件：[ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP == dc040bea-6436-4051-9166-c9294f9d2201: 编排完成，状态为 COMPLETED
== APP == dc040bea-6436-4051-9166-c9294f9d2201: 返回 1 个动作
INFO[0006] dc040bea-6436-4051-9166-c9294f9d2201: 'sequence' 完成，状态为 COMPLETED。 app_id=activity-sequence-workflow instance=kaibocai-devbox scope=wfengine.backend type=log ver=1.12.3
== APP == 实例 dc040bea-6436-4051-9166-c9294f9d2201 完成
== APP == 编排完成！结果：["Hello Tokyo!","Hello Seattle!","Hello London!"]
```

## 下一步

- [了解更多关于 Dapr 工作流的信息]({{< ref workflow-overview.md >}})
- [工作流 API 参考]({{< ref workflow_api.md >}})
