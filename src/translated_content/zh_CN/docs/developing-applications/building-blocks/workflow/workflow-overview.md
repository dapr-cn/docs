---
type: docs
title: 工作流概述
linkTitle: 概述
weight: 1000
description: "Dapr 工作流概述"
---

Dapr 工作流让开发人员能够可靠地编写业务逻辑和集成。由于 Dapr 工作流是有状态的，它们支持长时间运行和容错应用程序，非常适合编排微服务。Dapr 工作流与其他 Dapr 构建块（如服务调用、发布订阅、状态管理和绑定）无缝协作。

Dapr 工作流的耐用性和弹性功能包括：

- 提供内置的工作流运行时以驱动 Dapr 工作流执行。
- 提供用于在代码中编写工作流的 SDK，支持多种编程语言。
- 提供用于管理工作流（启动、查询、暂停/恢复、触发事件、终止、清除）的 HTTP 和 gRPC API。
- 通过工作流组件与其他工作流运行时集成。

<img src="/images/workflow-overview/workflow-overview.png" width=800 alt="显示 Dapr 工作流基础的图示">

Dapr 工作流可以应用于以下场景：

- 涉及库存管理、支付系统和运输服务之间编排的订单处理。
- 协调多个部门和参与者任务的人力资源入职工作流。
- 在全国餐饮连锁店中协调数字菜单更新的推出。
- 涉及基于 API 的分类和存储的图像处理工作流。

## 功能

### 工作流和活动

使用 Dapr 工作流，您可以编写活动，然后在工作流中编排这些活动。工作流活动是：

- 工作流中的基本工作单元
- 用于调用其他（Dapr）服务、与状态存储交互以及发布订阅代理。

[了解更多关于工作流活动的信息。]({{< ref "workflow-features-concepts.md##workflow-activities" >}})

### 子工作流

除了活动之外，您还可以编写工作流以调度其他工作流作为子工作流。子工作流具有独立于启动它的父工作流的实例 ID、历史记录和状态，除了终止父工作流会终止由其创建的所有子工作流这一事实。子工作流还支持自动重试策略。

[了解更多关于子工作流的信息。]({{< ref "workflow-features-concepts.md#child-workflows" >}})

### 定时器和提醒

与 Dapr actor 相同，您可以为任何时间范围安排类似提醒的持久延迟。

[了解更多关于工作流定时器]({{< ref "workflow-features-concepts.md#durable-timers" >}})和[提醒]({{< ref "workflow-architecture.md#reminder-usage-and-execution-guarantees" >}})

### 使用 HTTP 调用管理工作流

当您使用工作流代码创建应用程序并使用 Dapr 运行它时，您可以调用驻留在应用程序中的特定工作流。每个单独的工作流可以：

- 通过 POST 请求启动或终止
- 通过 POST 请求触发以传递命名事件
- 通过 POST 请求暂停然后恢复
- 通过 POST 请求从您的状态存储中清除
- 通过 GET 请求查询工作流状态

[了解更多关于如何使用 HTTP 调用管理工作流的信息。]({{< ref workflow_api.md >}})

## 工作流模式

Dapr 工作流简化了微服务架构中复杂的、有状态的协调需求。以下部分描述了可以从 Dapr 工作流中受益的几种应用程序模式。

了解更多关于[不同类型的工作流模式]({{< ref workflow-patterns.md >}})

## 工作流 SDK

Dapr 工作流 _编写 SDK_ 是特定语言的 SDK，包含用于实现工作流逻辑的类型和函数。工作流逻辑存在于您的应用程序中，并由运行在 Dapr sidecar 中的 Dapr 工作流引擎通过 gRPC 流进行编排。

### 支持的 SDK

您可以使用以下 SDK 编写工作流。

| 语言栈 | 包 |
| - | - |
| Python | [dapr-ext-workflow](https://github.com/dapr/python-sdk/tree/master/ext/dapr-ext-workflow) |
| JavaScript | [DaprWorkflowClient](https://github.com/dapr/js-sdk/blob/main/src/workflow/client/DaprWorkflowClient.ts) |
| .NET | [Dapr.Workflow](https://www.nuget.org/profiles/dapr.io) |
| Java | [io.dapr.workflows](https://dapr.github.io/java-sdk/io/dapr/workflows/package-summary.html) |
| Go | [workflow](https://github.com/dapr/go-sdk/tree/main/client/workflow.go) |

## 试用工作流

### 快速入门和教程

想要测试工作流？通过以下快速入门和教程来查看工作流的实际应用：

| 快速入门/教程 | 描述 |
| ------------------- | ----------- |
| [工作流快速入门]({{< ref workflow-quickstart.md >}}) | 运行一个包含四个工作流活动的工作流应用程序，查看 Dapr 工作流的实际应用 |
| [工作流 Python SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow) | 了解如何使用 Python `dapr-ext-workflow` 包创建和调用 Dapr 工作流。 |
| [工作流 JavaScript SDK 示例](https://github.com/dapr/js-sdk/tree/main/examples/workflow) | 了解如何使用 JavaScript SDK 创建和调用 Dapr 工作流。 |
| [工作流 .NET SDK 示例](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow) | 了解如何使用 ASP.NET Core web API 创建和调用 Dapr 工作流。 |
| [工作流 Java SDK 示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows) | 了解如何使用 Java `io.dapr.workflows` 包创建和调用 Dapr 工作流。 |
| [工作流 Go SDK 示例](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md) | 了解如何使用 Go `workflow` 包创建和调用 Dapr 工作流。 |

### 直接在您的应用中开始使用工作流

想要跳过快速入门？没问题。您可以直接在您的应用程序中试用工作流构建块。在[Dapr 安装完成后]({{< ref install-dapr-cli.md >}})，您可以开始使用工作流，从[如何编写工作流]({{< ref howto-author-workflow.md >}})开始。

## 限制

- **状态存储：** 由于某些数据库选择的底层限制，通常是 NoSQL 数据库，您可能会遇到存储内部状态的限制。例如，CosmosDB 在单个请求中最多只能有 100 个状态的单操作项限制。

## 观看演示

观看[此视频以了解 Dapr 工作流的概述](https://youtu.be/s1p9MNl4VGo?t=131)：

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/s1p9MNl4VGo?start=131" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 下一步

{{< button text="工作流功能和概念 >>" page="workflow-features-concepts.md" >}}

## 相关链接

- [工作流 API 参考]({{< ref workflow_api.md >}})
- 试用完整的 SDK 示例：
  - [Python 示例](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow)
  - [JavaScript 示例](https://github.com/dapr/js-sdk/tree/main/examples/workflow)
  - [.NET 示例](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
  - [Java 示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)
  - [Go 示例](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)
