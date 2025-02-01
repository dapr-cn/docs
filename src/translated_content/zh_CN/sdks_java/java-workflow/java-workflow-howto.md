---
type: docs
title: "如何：在 Java SDK 中编写和管理 Dapr 工作流"
linkTitle: "如何：编写和管理工作流"
weight: 20000
description: 如何使用 Dapr Java SDK 快速启动和运行工作流
---

我们来创建一个 Dapr 工作流，并通过控制台调用它。通过[提供的工作流示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)，您将：

- 使用 [Java 工作流工作者](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/DemoWorkflowWorker.java) 执行工作流实例
- 利用 Java 工作流客户端和 API 调用来[启动和终止工作流实例](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/DemoWorkflowClient.java)

在[自托管模式](https://github.com/dapr/cli#install-dapr-on-your-local-machine-self-hosted)下，此示例使用 `dapr init` 的默认配置运行。

## 准备工作

- [Dapr CLI 和已初始化的环境](https://docs.dapr.io/getting-started)。
- Java JDK 11（或更高版本）：
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads)，或
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html)，版本 3.x。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->
- 确保您使用的是最新版本的 proto 绑定

## 设置环境

克隆 Java SDK 仓库并进入其中。

```bash
git clone https://github.com/dapr/java-sdk.git
cd java-sdk
```

运行以下命令以安装运行此工作流示例所需的 Dapr Java SDK 依赖项。

```bash
mvn clean install
```

从 Java SDK 根目录，导航到 Dapr 工作流示例。

```bash
cd examples
```

## 运行 `DemoWorkflowWorker`

`DemoWorkflowWorker` 类在 Dapr 的工作流运行时引擎中注册了 `DemoWorkflow` 的实现。在 `DemoWorkflowWorker.java` 文件中，您可以找到 `DemoWorkflowWorker` 类和 `main` 方法：

```java
public class DemoWorkflowWorker {

  public static void main(String[] args) throws Exception {
    // Register the Workflow with the runtime.
    WorkflowRuntime.getInstance().registerWorkflow(DemoWorkflow.class);
    System.out.println("Start workflow runtime");
    WorkflowRuntime.getInstance().startAndBlock();
    System.exit(0);
  }
}
```

在上面的代码中：
- `WorkflowRuntime.getInstance().registerWorkflow()` 将 `DemoWorkflow` 注册为 Dapr 工作流运行时中的一个工作流。
- `WorkflowRuntime.getInstance().start()` 在 Dapr 工作流运行时中构建并启动引擎。

在终端中，执行以下命令以启动 `DemoWorkflowWorker`：

```sh
dapr run --app-id demoworkflowworker --resources-path ./components/workflows --dapr-grpc-port 50001 -- java -jar target/dapr-java-sdk-examples-exec.jar io.dapr.examples.workflows.DemoWorkflowWorker
```

**预期输出**

```
You're up and running! Both Dapr and your app logs will appear here.

...

== APP == Start workflow runtime
== APP == Sep 13, 2023 9:02:03 AM com.microsoft.durabletask.DurableTaskGrpcWorker startAndBlock
== APP == INFO: Durable Task worker is connecting to sidecar at 127.0.0.1:50001.
```

## 运行 `DemoWorkflowClient`

`DemoWorkflowClient` 启动已在 Dapr 中注册的工作流实例。

```java
public class DemoWorkflowClient {

  // ...
  public static void main(String[] args) throws InterruptedException {
    DaprWorkflowClient client = new DaprWorkflowClient();

    try (client) {
      String separatorStr = "*******";
      System.out.println(separatorStr);
      String instanceId = client.scheduleNewWorkflow(DemoWorkflow.class, "input data");
      System.out.printf("Started new workflow instance with random ID: %s%n", instanceId);

      System.out.println(separatorStr);
      System.out.println("**GetInstanceMetadata:Running Workflow**");
      WorkflowInstanceStatus workflowMetadata = client.getInstanceState(instanceId, true);
      System.out.printf("Result: %s%n", workflowMetadata);

      System.out.println(separatorStr);
      System.out.println("**WaitForInstanceStart**");
      try {
        WorkflowInstanceStatus waitForInstanceStartResult =
            client.waitForInstanceStart(instanceId, Duration.ofSeconds(60), true);
        System.out.printf("Result: %s%n", waitForInstanceStartResult);
      } catch (TimeoutException ex) {
        System.out.printf("waitForInstanceStart has an exception:%s%n", ex);
      }

      System.out.println(separatorStr);
      System.out.println("**SendExternalMessage**");
      client.raiseEvent(instanceId, "TestEvent", "TestEventPayload");

      System.out.println(separatorStr);
      System.out.println("** Registering parallel Events to be captured by allOf(t1,t2,t3) **");
      client.raiseEvent(instanceId, "event1", "TestEvent 1 Payload");
      client.raiseEvent(instanceId, "event2", "TestEvent 2 Payload");
      client.raiseEvent(instanceId, "event3", "TestEvent 3 Payload");
      System.out.printf("Events raised for workflow with instanceId: %s\n", instanceId);

      System.out.println(separatorStr);
      System.out.println("** Registering Event to be captured by anyOf(t1,t2,t3) **");
      client.raiseEvent(instanceId, "e2", "event 2 Payload");
      System.out.printf("Event raised for workflow with instanceId: %s\n", instanceId);

      System.out.println(separatorStr);
      System.out.println("**WaitForInstanceCompletion**");
      try {
        WorkflowInstanceStatus waitForInstanceCompletionResult =
            client.waitForInstanceCompletion(instanceId, Duration.ofSeconds(60), true);
        System.out.printf("Result: %s%n", waitForInstanceCompletionResult);
      } catch (TimeoutException ex) {
        System.out.printf("waitForInstanceCompletion has an exception:%s%n", ex);
      }

      System.out.println(separatorStr);
      System.out.println("**purgeInstance**");
      boolean purgeResult = client.purgeInstance(instanceId);
      System.out.printf("purgeResult: %s%n", purgeResult);

      System.out.println(separatorStr);
      System.out.println("**raiseEvent**");

      String eventInstanceId = client.scheduleNewWorkflow(DemoWorkflow.class);
      System.out.printf("Started new workflow instance with random ID: %s%n", eventInstanceId);
      client.raiseEvent(eventInstanceId, "TestException", null);
      System.out.printf("Event raised for workflow with instanceId: %s\n", eventInstanceId);

      System.out.println(separatorStr);
      String instanceToTerminateId = "terminateMe";
      client.scheduleNewWorkflow(DemoWorkflow.class, null, instanceToTerminateId);
      System.out.printf("Started new workflow instance with specified ID: %s%n", instanceToTerminateId);

      TimeUnit.SECONDS.sleep(5);
      System.out.println("Terminate this workflow instance manually before the timeout is reached");
      client.terminateWorkflow(instanceToTerminateId, null);
      System.out.println(separatorStr);

      String restartingInstanceId = "restarting";
      client.scheduleNewWorkflow(DemoWorkflow.class, null, restartingInstanceId);
      System.out.printf("Started new  workflow instance with ID: %s%n", restartingInstanceId);
      System.out.println("Sleeping 30 seconds to restart the workflow");
      TimeUnit.SECONDS.sleep(30);

      System.out.println("**SendExternalMessage: RestartEvent**");
      client.raiseEvent(restartingInstanceId, "RestartEvent", "RestartEventPayload");

      System.out.println("Sleeping 30 seconds to terminate the eternal workflow");
      TimeUnit.SECONDS.sleep(30);
      client.terminateWorkflow(restartingInstanceId, null);
    }

    System.out.println("Exiting DemoWorkflowClient.");
    System.exit(0);
  }
}
```

在第二个终端窗口中，通过运行以下命令启动工作流：

```sh
java -jar target/dapr-java-sdk-examples-exec.jar io.dapr.examples.workflows.DemoWorkflowClient
```

**预期输出**

```
*******
Started new workflow instance with random ID: 0b4cc0d5-413a-4c1c-816a-a71fa24740d4
*******
**GetInstanceMetadata:Running Workflow**
Result: [Name: 'io.dapr.examples.workflows.DemoWorkflow', ID: '0b4cc0d5-413a-4c1c-816a-a71fa24740d4', RuntimeStatus: RUNNING, CreatedAt: 2023-09-13T13:02:30.547Z, LastUpdatedAt: 2023-09-13T13:02:30.699Z, Input: '"input data"', Output: '']
*******
**WaitForInstanceStart**
Result: [Name: 'io.dapr.examples.workflows.DemoWorkflow', ID: '0b4cc0d5-413a-4c1c-816a-a71fa24740d4', RuntimeStatus: RUNNING, CreatedAt: 2023-09-13T13:02:30.547Z, LastUpdatedAt: 2023-09-13T13:02:30.699Z, Input: '"input data"', Output: '']
*******
**SendExternalMessage**
*******
** Registering parallel Events to be captured by allOf(t1,t2,t3) **
Events raised for workflow with instanceId: 0b4cc0d5-413a-4c1c-816a-a71fa24740d4
*******
** Registering Event to be captured by anyOf(t1,t2,t3) **
Event raised for workflow with instanceId: 0b4cc0d5-413a-4c1c-816a-a71fa24740d4
*******
**WaitForInstanceCompletion**
Result: [Name: 'io.dapr.examples.workflows.DemoWorkflow', ID: '0b4cc0d5-413a-4c1c-816a-a71fa24740d4', RuntimeStatus: FAILED, CreatedAt: 2023-09-13T13:02:30.547Z, LastUpdatedAt: 2023-09-13T13:02:55.054Z, Input: '"input data"', Output: '']
*******
**purgeInstance**
purgeResult: true
*******
**raiseEvent**
Started new workflow instance with random ID: 7707d141-ebd0-4e54-816e-703cb7a52747
Event raised for workflow with instanceId: 7707d141-ebd0-4e54-816e-703cb7a52747
*******
Started new workflow instance with specified ID: terminateMe
Terminate this workflow instance manually before the timeout is reached
*******
Started new  workflow instance with ID: restarting
Sleeping 30 seconds to restart the workflow
**SendExternalMessage: RestartEvent**
Sleeping 30 seconds to terminate the eternal workflow
Exiting DemoWorkflowClient.
```

## 发生了什么？

1. 当您运行 `dapr run` 时，工作流工作者将工作流（`DemoWorkflow`）及其活动注册到 Dapr 工作流引擎。
2. 当您运行 `java` 时，工作流客户端启动了具有以下活动的工作流实例。您可以在运行 `dapr run` 的终端中查看输出。
   1. 工作流启动，触发三个并行任务，并等待它们完成。
   2. 工作流客户端调用活动并将 "Hello Activity" 消息发送到控制台。
   3. 工作流超时并被清除。
   4. 工作流客户端启动一个具有随机 ID 的新工作流实例，使用另一个名为 `terminateMe` 的工作流实例终止它，并使用名为 `restarting` 的工作流重新启动它。
   5. 然后工作流客户端退出。

## 下一步
- [了解更多关于 Dapr 工作流的信息]({{< ref workflow-overview.md >}})
- [工作流 API 参考]({{< ref workflow_api.md >}})
