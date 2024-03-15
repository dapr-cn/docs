---
type: docs
title: 工作流程概述
linkTitle: 概述
weight: 1000
description: Dapr 工作流程概述
---

{{% alert title="注意" color="primary" %}}
Dapr工作流目前处于beta阶段。 [查看已知限制]({{< ref "#limitations" >}})。
{{% /alert %}}

Dapr 工作流使开发人员可以轻松地以可靠的方式编写业务逻辑和集成。 由于 Dapr 工作流是有状态的，因此支持长期运行和容错的应用程序，是协调微服务的理想选择。 Dapr 工作流可与其他 Dapr 构建块无缝协作，例如服务调用、发布/订阅、状态管理和绑定。

持久、可复原的 Dapr 工作流功能：

- 提供内置工作流运行时，用于驱动 Dapr 工作流的执行。
- 提供 SDK，可使用任何语言以代码编写工作流。
- 提供 HTTP 和 gRPC 应用程序接口，用于管理工作流（启动、查询、暂停/继续、引发事件、终止、清除）。
- 通过工作流组件与任何其他工作流运行时集成。

<img src="/images/workflow-overview/workflow-overview.png" width=800 alt="Diagram showing basics of Dapr Workflow">

Dapr 工作流程可以执行的一些示例场景包括：

- 订单处理涉及库存管理、支付系统和配送服务之间的编排。
- 人力资源入职工作流程，协调跨多个部门和参与者的任务。
- 在一家全国性连锁餐厅协调推出数字菜单更新。
- 涉及基于 API 的分类和存储的图像处理工作流。

## 特性

### 工作流和活动

使用 Dapr 工作流，可以编写活动，然后在工作流中协调这些活动。 工作流活动包括：

- 工作流中的基本工作单元
- 用于调用其他 （Dapr） 服务、与状态存储和发布/订阅代理交互。

[了解更多关于工作流活动。]({{< ref "workflow-features-concepts.md##workflow-activities" >}})

### 子工作流

除活动外，您还可以编写工作流，将其他工作流安排为子工作流。 子工作流具有自己的实例ID、历史记录和状态，与启动它的父工作流是独立的，只是在终止父工作流时会终止由其创建的所有子工作流。 子工作流还支持自动重试策略。

[了解更多关于子工作流。]({{< ref "workflow-features-concepts.md#child-workflows" >}})

### 计时器和提醒器

与 Dapr actor 相同，您可以在任何时间范围内安排类似提醒的持久延迟。

[了解有关工作流定时器]({{< ref "workflow-features-concepts.md#durable-timers" >}})和[提醒]({{< ref "workflow-architecture.md#reminder-usage-and-execution-guarantees" >}})

### 用于管理工作流的工作流 HTTP 调用

使用工作流代码创建应用程序并使用 Dapr 运行该应用程序时，可以调用驻留在应用程序中的特定工作流。 每个单独的工作流可以是：

- 通过 POST 请求启动或终止
- 通过 POST 请求触发，以传送指定事件
- 暂停，然后通过 POST 请求恢复
- 通过 POST 请求从状态存储中清除
- 通过 GET 请求查询工作流状态

[了解有关如何使用HTTP调用管理工作流。]({{< ref workflow_api.md >}})

## 工作流模式

Dapr 工作流简化了微服务体系结构中复杂的有状态协调要求。 下面几节将介绍几种可受益于 Dapr 工作流的应用模式。

了解有关 [不同类型的工作流模式]({{< ref workflow-patterns.md >}})的更多信息

## 工作流 SDK

Dapr 工作流 _创作 SDK_ 是特定于语言的 SDK，其中包含用于实现工作流逻辑的类型和函数。 工作流逻辑位于应用程序中，由通过 gRPC 流在 Dapr Sidecar 中运行的 Dapr 工作流引擎进行编排。

### 支持的 SDK

您可以使用以下 SDK 创作工作流。

| 语言栈        | 包                                                                                                        |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| Python     | [dapr-ext-workflow](https://github.com/dapr/python-sdk/tree/master/ext/dapr-ext-workflow)                |
| JavaScript | [DaprWorkflowClient](https://github.com/dapr/js-sdk/blob/main/src/workflow/client/DaprWorkflowClient.ts) |
| .NET       | [Dapr.Workflow](https://www.nuget.org/profiles/dapr.io)                                                  |
| Java       | [io.dapr.workflows](https://dapr.github.io/java-sdk/io/dapr/workflows/package-summary.html)              |
| Go         | [工作流](https://github.com/dapr/go-sdk/tree/main/client/workflow.go)                                       |

## 试用工作流

### 快速启动和教程

想要测试工作流？ 通过以下快速入门和教程了解工作流的实际操作：

| 快速入门/教程                                                                                                               | 说明                                                  |
| --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| [配置快速入门]({{< ref workflow-quickstart.md >}})   | 运行具有四个工作流活动的工作流应用程序，以查看 Dapr 工作流的运行情况               |
| [Workflow Python SDK示例](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow)                        | 了解如何创建 Dapr 工作流并使用 Python 的 `DaprClient` 包调用它。      |
| [Workflow JavaScript SDK示例](https://github.com/dapr/js-sdk/tree/main/examples/workflow)                               | 了解如何使用JavaScript SDK创建Dapr工作流并调用它。                  |
| [Workflow .NET SDK示例](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)                               | 了解如何创建 Dapr 工作流并使用 ASP.NET Core Web API 调用它。        |
| [Workflow Java SDK示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows) | 了解如何创建 Dapr 工作流并使用 Java 的 `io.dapr.workflows` 包调用它。 |
| [Workflow Go SDK示例](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)                             | 了解如何创建 Dapr 工作流并使用 Go 的 `workflow` 包调用它。            |

### 直接在应用中开始使用工作流

想跳过快速入门？ Not a problem. 您可以直接在应用程序中试用工作流构建模块。 在安装[Dapr命令行工具]({{< ref install-dapr-cli.md >}})之后，您可以开始使用工作流，从[如何编写工作流]({{< ref howto-author-workflow.md >}})开始。

## 局限性

- **状态存储:** 对于 Dapr Workflow 的 1.12.0 beta 版本，使用 NoSQL 数据库作为状态存储会导致在存储内部状态方面存在限制。 例如，CosmosDB 在单个请求中仅有100个状态的最大单个操作项限制。
- \*\*水平扩展：\*\*从 Dapr Workflow 1.12.0 beta 版本开始，如果您将 Dapr sidecars 或应用程序 pods 扩展到超过 2 个，则工作流执行的并发性会下降。 建议测试1或2个实例，不要超过2个。

## 观看演示

观看[此视频以了解 Dapr Workflow 的概述](https://youtu.be/s1p9MNl4VGo?t=131):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/s1p9MNl4VGo?start=131" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 下一步

{{< button text="工作流特性和概念>>" page="workflow-features-concepts.md" >}}

## 相关链接

- [Workflow API 参考文档]({{< ref workflow_api.md >}})
- 试用完整的 SDK 示例：
  - [Python示例](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow)
  - [JavaScript示例](https://github.com/dapr/js-sdk/tree/main/examples/workflow)
  - [.NET示例](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
  - [Java示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)
  - [Go示例](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)
