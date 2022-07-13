---
type: docs
title: "概述"
linkTitle: "概述"
weight: 100
description: >
  分布式应用程序运行时介绍
---

Dapr 是一个可移植的、事件驱动的运行时，它使任何开发人员能够轻松构建出弹性的、无状态和有状态的应用程序，并可运行在云平台或边缘计算中，它同时也支持多种编程语言和开发框架。

<iframe width="1120" height="630" src="https://www.youtube.com/embed/9o9iDAgYBA8" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 任何语言，任何框架，任何地方

<img src="/images/overview.png" width=1000>

如今，我们正经历着上云浪潮。 开发人员习惯于 Web + 数据库应用架构(例如经典 3 层设计)，但对天然支持分布式的微服务应用架构却感觉陌生。 成为分布式系统专家很难，并且你也不需要这么做。 开发人员希望专注于业务逻辑，同时希望平台为其提供可伸缩的、弹性的、可维护的和云原生架构的其他功能。

这就是Dapr所要解决的。 Dapr 将构建微服务应用的 *最佳实践* 设计成开放、独立和模块化的方式，让你能够选择的任意开发语言和框架构建可移植应用程序。 每个构建块都是完全独立的，您可以采用其中一个、多个或全部来构建你的应用。

此外，Dapr 是和平台无关的，这意味着您可以在本地、Kubernetes 群集或者其它集成 Dapr 的托管环境中运行应用程序。 这使得您能够在云平台和边缘计算中运行微服务应用。

使用 Dapr，您可以使用任何语言、任何框架轻松构建微服务应用，并运行在任何地方。

## 云平台和边缘计算的微服务构建块

<img src="/images/building_blocks.png" width=1000>

在设计微服务应用时，需要考虑很多因素。 Dapr 在构建微服务应用时为常见功能提供了最佳实践，开发人员可以使用标准方式然后部署到任何环境。 Dapr 通过提供分布式构建块来实现此目的。

每个构建块都是独立的，这意味着您可以采用其中一个或多个或全部来构建应用。 目前，可用的构建块如下：

| 构建块                                                    | 说明                                                                                                                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**服务调用**]({{<ref "service-invocation-overview.md">}}) | 跨服务调用允许进行远程方法调用(包括重试)，不管处于任何位置，只需该服务托管于受支持的环境即可。                                                                                                        |
| [**状态管理**]({{<ref "state-management-overview.md">}})   | 独立的状态管理，使用键/值对作为存储机制，可以轻松的使长时运行、高可用的有状态服务和无状态服务共同运行在您的应用程序中。 状态存储是可插拔的，目前支持使用Azure CosmosDB、 Azure SQL Server、 PostgreSQL,、AWS DynamoDB、Redis 作为状态存储介质。 |
| [**发布订阅**]({{<ref "pubsub-overview.md">}})             | 发布事件和订阅主题。 Dapr 提供至少一次消息传递保证。                                                                                                                           |
| [**资源绑定**]({{<ref "bindings-overview.md">}})           | Dapr的Bindings是建立在事件驱动架构的基础之上的。通过建立触发器与资源的绑定，可以从任何外部源（例如数据库，队列，文件系统等）接收和发送事件，而无需借助消息队列，即可实现灵活的业务场景。                                                      |
| [**参与者**]({{<ref "actors-overview.md">}})              | 状态和无状态对象的模式，使并发简单，方法和状态封装。 Dapr 在Actor模式中提供了很多功能，包括并发，状态管理，用于 actor 激活/停用的生命周期管理，以及唤醒 actor 的计时器和提醒器。                                                   |
| [**可观测性**]({{<ref "observability-concept.md">}})       | Dapr记录指标，日志，链路以调试和监视Dapr和用户应用的运行状况。 Dapr支持分布式跟踪，其使用W3C跟踪上下文标准和开放式遥测技术，可以轻松地诊断在生产环境中服务间的网络调用，并发送到不同的监视工具。                                                |
| [**Secrets**]({{<ref "secrets-overview.md">}})         | Dapr 提供了密钥管理，支持与公有云和本地的Secret存储集成，以供应用检索使用。                                                                                                             |

## Sidecar 架构

Dapr以 sidecar 架构的方式公开其API，可以是容器，也可以是进程，不需要应用代码包含任何 Dapr 运行时代码。 这使得 Dapr 与其他运行时的集成变得容易，在应用逻辑层面做了隔离处理，提高了可扩展性。

<img src="/images/overview-sidecar-model.png" width=700>

## 托管环境

Dapr可以托管在多个环境中，包括在Windows/Linux/macOS机器上自托管和Kubernetes。

### 自托管

[自托管模式]({{< ref self-hosted-overview.md >}}) 下，Dapr 运行一个单独的 sidecar 程序，在您的服务代码中可以通过 HTTP 或 gRPC 调用它。 每个运行的服务都有一个 Dapr 运行时进程 (或 sidecar) ，配置为使用状态存储， pub/sub，绑定组件和其他构建块。

您可以使用 [Dapr CLI](https://github.com/dapr/cli#launch-dapr-and-your-app) 在本地机器上运行启用了 Dapr 的应用程序。 请使用 [入门示例]({{< ref getting-started >}})。

<img src="/images/overview_standalone.png" width=1000 alt="自托管模式下的 Dapr 架构图">

### Kubernetes 托管

在托管在容器环境中（如 Kubernetes），Dapr 作为 sidecar 容器运行，和应用程序容器在同一个 pod 中。

在 Kubernetes 中， `dapr-sidecar-injector` 和 `dapr-operator` 服务提供一流的集成，以将 Dapr 作为 sidecar 容器启动在与服务容器相同的 pod 中 ，并为在集群中部署的 Dapr 组件提供更新通知。

`dapr-sentry` 服务是一个认证中心，它允许 Dapr sidecar 实例之间的相互 TLS 进行安全数据加密。 关于 `Sentry` 服务的更多信息请阅读 [安全概述]({{< ref "security-concept.md#dapr-to-dapr-communication" >}})

在 Kubernetes 集群中部署和运行启用 Dapr 的应用程序非常简单，只需向 deployment 方案添加一些注解。 访问 [Kubernetes 文档上的 Dapr]({{< ref kubernetes >}})

<img src="/images/overview_kubernetes.png" width=1000 alt="Kubernetes 模式下的 Dapr 架构图">

## 开发者语言 SDK 和框架

Dapr 提供各种 SDK 和框架，便于开始以您喜欢的语言与 Dapr 一起开发。

### Dapr SDKs

为了让不同语言使用 Dapr 更加自然，它还包含了 [语言特定的 SDK]({{<ref sdks>}})：
- C++
- Go
- Java
- JavaScript
- Python
- Rust
- .NET
- PHP

这些 SDK 通过特定语言 API 来暴露 Dapr 构建块的功能，而不是调用 http/gRPC API。 这使您能够用您选择的语言编写无状态和状态功能以及 Actors 的组合。 由于这些 SDK 共享 Dapr 运行时，因此您可以获得跨语言 actor 和功能支持。

### 开发框架

Dapr 可以与任何开发框架集成。 下面是一些已经和 Dapr 集成的。

#### Web

| 语言                                           | 框架                                      | 说明                                                                                                                 |
| -------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| [.NET]({{< ref dotnet >}})                   | [ASP.NET]({{< ref dotnet-aspnet.md >}}) | 带来状态路由控制器，从而完成来自其他应用的 发布/订阅 构建块。 也可以利用 [ASP.NET Core gRPC 服务](https://docs.microsoft.com/en-us/aspnet/core/grpc/)。 |
| [Java]({{< ref java >}})                     | [Spring Boot](https://spring.io/)       |                                                                                                                    |
| [Python]({{< ref python >}})                 | [Flask]({{< ref python-flask.md >}})    |                                                                                                                    |
| [Javascript](https://github.com/dapr/js-sdk) | [Express](http://expressjs.com/)        |                                                                                                                    |
| [PHP]({{< ref php >}})                       |                                         | 您可以使用 Apache, Nginx, 或 Caddyserver 进行托管                                                                            |

#### 集成和扩展

访问 [integrations]({{< ref integrations >}}) 页面，了解 Dapr 对各种框架和外部产品的一流支持，包括：
- Azure Functions runtime
- Azure Logic Apps runtime
- Azure API 管理
- KEDA
- Visual Studio Code

## 为运维而设计

Dapr 专为 [运维]({{< ref operations >}}) 和安全性而设计。 Dapr sidecar、运行时间、组件和配置都可以轻松、安全地管理和部署，以满足组织的需求。

通过 Dapr CLI 安装的 [服务仪表板](https://github.com/dapr/dashboard)提供了基于 Web 的 UI ，使您能够查看信息，查看日志以及 Dapr sidecar 的更多内容。

[监控工具支持]({{< ref monitoring >}}) 提供 Dapr 系统服务和sidecar 的更深入的可见性，Dapr 的 [可观测性能力]({{<ref "observability-concept.md">}}) 提供了对应用程序的深入了解，例如追踪和度量。
