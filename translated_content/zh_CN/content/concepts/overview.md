---
type: docs
title: "概述"
linkTitle: "概述"
weight: 100
description: >
  分布式应用程序运行时介绍
---

Dapr 是一个可移植的、事件驱动的运行时，它使任何开发人员能够轻松构建出弹性的、无状态和有状态的应用程序，并可运行在云平台或边缘计算中，它同时也支持多种编程语言和开发框架。

<iframe src="//player.bilibili.com/player.html?aid=586108726&bvid=BV1xz4y167XA&cid=277928385&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>

## 任何语言，任何框架，任何地方

<img src="/images/overview.png" width=1000>

如今，我们正经历着上云浪潮。 开发人员习惯于 Web + 数据库应用架构(例如经典 3 层设计)，但对天然支持分布式的微服务应用架构却感觉陌生。 成为分布式系统专家很难，并且你也不需要这么做。 开发人员希望专注于业务逻辑，同时希望平台为其提供可伸缩的、弹性的、可维护的和云原生架构的其他功能。

这就是Dapr所要解决的。 Dapr 将构建微服务应用的 *最佳实践* 设计成开放、独立和模块化的方式，让你能够选择的任意开发语言和框架构建可移植应用程序。 每个构建块都是完全独立的，您可以采用其中一个、多个或全部来构建你的应用。

此外，Dapr 是和平台无关的，这意味着您可以在本地、Kubernetes 群集或者其它集成 Dapr 的托管环境中运行应用程序。 这使得您能够在云平台和边缘计算中运行微服务应用。

使用 Dapr，您可以使用任何语言、任何框架轻松构建微服务应用，并运行在任何地方。

## 云平台和边缘计算的微服务构建块

<img src="/images/building_blocks.png" width=1000>

在设计微服务应用时，需要考虑很多因素。 Dapr 在构建微服务应用时为常见功能提供了最佳实践，开发人员可以使用标准方式然后部署到任何环境。 Dapr 通过提供分布式构建块来实现此目的。

每个构建块都是独立的，这意味着您可以采用其中一个或多个或全部来构建应用。 在当前 Dapr 的初始版本中，提供了以下构建块：

| 构建块                                                    | 说明                                                                                                                                                                                                                                              |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**服务调用**]({{<ref "service-invocation-overview.md">}}) | 跨服务调用允许进行远程方法调用(包括重试)，不管处于任何位置，只需该服务托管于受支持的环境即可。                                                                                                                                                                                                |
| [**状态管理**]({{<ref "state-management-overview.md">}})   | 独立的状态管理，使用键/值对作为存储机制，可以轻松的使长时运行、高可用的有状态服务和无状态服务共同运行在您的应用程序中。 状态存储是可插拔的，目前支持使用Azure CosmosDB、 Azure SQL Server、 PostgreSQL,、AWS DynamoDB、Redis 作为状态存储介质。                                                                                         |
| [**发布订阅**]({{<ref "pubsub-overview.md">}})             | 发布事件和订阅主题。 Dapr 提供至少一次消息传递保证。                                                                                                                                                                                                                   |
| [**资源绑定**]({{<ref "bindings-overview.md">}})           | Dapr的Bindings是建立在事件驱动架构的基础之上的。通过建立触发器与资源的绑定，可以从任何外部源（例如数据库，队列，文件系统等）接收和发送事件，而无需借助消息队列，即可实现灵活的业务场景。                                                                                                                                              |
| [**参与者**]({{<ref "actors-overview.md">}})              | Actor模型 = 状态 + 行为 + 消息。一个应用/服务由多个Actor组成，每个Actor都是一个独立的运行单元，拥有隔离的运行空间，在隔离的空间内，其有独立的状态和行为，不被外界干预，Actor之间通过消息进行交互，而同一时刻，每个Actor只能被单个线程执行，这样既有效避免了数据共享和并发问题，又确保了应用的伸缩性。 Dapr 在Actor模式中提供了很多功能，包括并发，状态管理，用于 actor 激活/停用的生命周期管理，以及唤醒 actor 的计时器和提醒器。 |
| [**可观测性**]({{<ref "observability-concept.md">}})       | Dapr记录指标，日志，链路以调试和监视Dapr和用户应用的运行状况。 Dapr支持分布式跟踪，其使用W3C跟踪上下文标准和开放式遥测技术，可以轻松地诊断在生产环境中服务间的网络调用，并发送到不同的监视工具。                                                                                                                                        |
| [**Secrets**]({{<ref "secrets-overview.md">}})         | Dapr 提供了密钥管理，支持与公有云和本地的Secret存储集成，以供应用检索使用。                                                                                                                                                                                                     |

## Sidecar 架构

Dapr以 sidecar 架构的方式公开其API，可以是容器，也可以是进程，不需要应用代码包含任何 Dapr 运行时代码。 这使得 Dapr 与其他运行时的集成变得容易，在应用逻辑层面做了隔离处理，提高了可扩展性。

## 托管环境
Dapr 可以托管在多种环境中，包括用于本地开发的自托管，或部署到一组 VM、Kubernetes 和边缘环境（如 Azure IoT Edge）。

### 自托管

在自托管模式下，Dapr 作为单独的 sidecar 进程运行，服务代码可以通过 HTTP 或 gRPC 调用该进程。 在自托管模式下，您还可以将 Dapr 部署到一组 VM 上。

<img src="/images/overview-sidecar.png" width=1000>

### Kubernetes 托管

在容器托管环境（如 Kubernetes）中，Dapr 作为 sidecar 容器运行，和应用程序容器在同一个 pod 中。

<img src="/images/overview-sidecar-kubernetes.png" width=1000>

## 开发者语言 SDK 和框架

为了让不同的开发语言用户能够更加自然地使用到 Dapr ，它还提供了适用于 C++、Go、Java、JavaScript、Python、Rust、 .NET 和 PHP的 [SDK]({{<ref sdks>}})。 这些 SDK 通过类型化的语言 API 而不是通过调用 http/gRPC API 来使用 Dapr 构建块中的功能，例如，保存状态，发布事件或创建Actor。 这使您能够以自己选择的语言编写无状态和有状态函数和 actors 的组合。 由于这些 SDK 共享 Dapr 运行时，因此您可以获得跨语言 actor 和功能支持。

### SDKs

- **[C++ SDK](https://github.com/dapr/cpp-sdk)**
- **[Go SDK](https://github.com/dapr/go-sdk)**
- **[Java SDK](https://github.com/dapr/java-sdk)**
- **[Javascript SDK](https://github.com/dapr/js-sdk)**
- **[Python SDK](https://github.com/dapr/python-sdk)**
- **[RUST SDK](https://github.com/dapr/rust-sdk)**
- **[.NET SDK](https://github.com/dapr/dotnet-sdk)**
- **[PHP SDK](https://github.com/dapr/php-sdk)**

> 注意： Dapr 是语言无关的， 除了 protobuf 客户端外，还提供 [ RESTful HTTP API ]({{< ref api >}}) 。

### 开发框架
Dapr 可以与任何开发框架集成。 下面是一些已经和 Dapr 集成的。

#### Web
 在 Dapr [Java SDK](https://github.com/dapr/java-sdk) 中，您可以找到 [Spring Boot](https://spring.io/) 集成。

 在 Dapr [PHP-SDK](https://github.com/dapr/php-sdk) 您可以与 Apache, Nginx, 或者 Caddyserver 一起运行。

Dapr 很容易与Python [Flask](https://pypi.org/project/Flask/) 和 node [Express](http://expressjs.com/) 集成。 请参阅 [Dapr 快速开始](https://github.com/dapr/quickstarts) 中的示例。

在 Dapr [PHP-SDK](https://github.com/dapr/php-sdk) 您可以与 Apache, Nginx, 或者 Caddyserver 一起运行。

#### 参与者
Dapr SDK 支持 [virtual actors]({{< ref actors >}}) ，这是简化并发、具有方法和状态封装的有状态对象，设计用于可扩展的分布式应用程序。

#### Azure Functions
Dapr 通过扩展与 Azure Functions 运行时集成，使函数可以与 Dapr 无缝交互。 Azure Functions 提供事件驱动的编程模型， 而 Dapr 提供了云原生的构建块。 通过此扩展，您可以为无服务器和事件驱动的应用程序同时提供两者。 更多信息请阅读 [用于 Dapr 的 Azure Functions扩展](https://cloudblogs.microsoft.com/opensource/2020/07/01/announcing-azure-functions-extension-for-dapr/) 并访问 [Azure Functions 扩展](https://github.com/dapr/azure-functions-extension) 仓库以试用示例。

#### Dapr 工作流
要使开发者能够轻松构建使用 Dapr 能力的工作流应用程序，包括诊断和多语言支持，您可以使用 Dapr 工作流。 Dapr 集成了诸如 Logic Apps 之类的工作流引擎。  更多信息请阅读 [用于 Dapr 和 Logic Apps 的云原生工作流](https://cloudblogs.microsoft.com/opensource/2020/05/26/announcing-cloud-native-workflows-dapr-logic-apps/) 并访问 [Azure Functions 扩展](https://github.com/dapr/workflows) 仓库以试用示例。

## 为运维设计
Dapr 有为 [运维](/operations/) 做专门设计。 通过 Dapr CLI 安装的 [服务仪表板](https://github.com/dapr/dashboard)提供了基于 Web 的 UI ，使您能够查看信息，查看日志以及 Dapr sidecar 的更多内容。

[监控工具支持](/operations/monitoring/) 提供 Dapr 系统服务和sidecar 的更深入的可见性，Dapr 的 [可观测性能力]({{<ref "observability-concept.md">}}) 提供了对应用程序的深入了解，例如追踪和度量。

## 在任何地方运行

### 以自托管模式在开发者本地机器上运行 Dapr

Dapr 可以配置为在开发人员本地计算机上以 [自托管模式]({{< ref self-hosted >}}) 运行。 每个运行的服务都有一个 Dapr 运行时进程 (或 sidecar) ，配置为使用状态存储， pub/sub，绑定组件和其他构建块。

您可以使用 [Dapr CLI](https://github.com/dapr/cli#launch-dapr-and-your-app) 在本地机器上运行启用了 Dapr 的应用程序。 请使用 [入门示例]({{< ref getting-started >}})。

<img src="/images/overview_standalone.png" width=800>

### 以 Kubernetes 模式运行 dapr

Dapr 可以配置为在任何 [Kubernetes 集群]({{< ref kubernetes >}}) 上运行。 在 Kubernetes 中， `dapr-sidecar-injector` 和 `dapr-operator` 服务提供一流的集成，以将 Dapr 作为 sidecar 容器启动在与服务容器相同的 pod 中 ，并为在集群中部署的 Dapr 组件提供更新通知。

`dapr-sentry` 服务是一个认证中心，它允许 Dapr sidecar 实例之间的相互 TLS 进行安全数据加密。 关于 `Sentry` 服务的更多信息请阅读 [安全概述]({{< ref "security-concept.md#dapr-to-dapr-communication" >}})

<img src="/images/overview_kubernetes.png" width=800>

在 Kubernetes 集群中部署和运行启用 Dapr 的应用程序非常简单，只需向 deployment 方案添加一些注解。 You can see some examples [here](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes/deploy) in the Kubernetes getting started sample. Try this out with the [Kubernetes quickstart](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes).
