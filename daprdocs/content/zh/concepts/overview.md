---
type: docs
title: "概述"
linkTitle: "Secrets stores overview"
weight: 100
description: >
  分布式应用程序运行时介绍
---

Dapr 是一个可移植的、事件驱动的运行时，它使任何开发人员能够轻松构建出弹性的、无状态和有状态的应用程序，并可运行在云平台或边缘计算中，它同时也支持多种编程语言和开发框架。

<iframe src="//player.bilibili.com/player.html?aid=586108726&bvid=BV1xz4y167XA&cid=277928385&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>

## 任何语言，任何框架，任何地方

<img src="/images/overview.png" width=1000>

如今，我们正经历着上云浪潮。 开发人员对 Web + 数据库应用结构（例如经典 3 层设计）非常熟悉，并且使用得手，但对本身能支持分布式的微服务应用结构却感觉陌生。 成为分布式系统专家很难，并且你也不需要这么做。 开发人员希望专注于业务逻辑，同时希望平台为其提供可伸缩的、弹性的、可维护性和云原生架构的其他功能。

这就是Dapr所要解决的。 Dapr 将构建微服务应用的 *最佳实践* 设计成开放、独立和模块化的方式，让你能够选择的任意开发语言和框架构建可移植应用程序。 每个构建块都是完全独立的，您可以采用其中一个或多个或全部来构建你的应用。

此外，Dapr 是和平台无关的，这意味着您可以在本地、Kubernetes 群集或者其它集成 Dapr 的托管环境中运行应用程序。 这使得您能够在云平台和边缘计算中运行微服务应用。

使用 Dapr，您可以使用任何语言、任何框架轻松构建微服务应用，并运行在任何地方。

## 云平台和边缘计算的微服务构建块

<img src="/images/building_blocks.png" width=1000>

在构建微服务应用时，需要考虑很多。 Dapr 在构建微服务应用时为常见功能提供了最佳实践，开发人员可以使用标准方式然后部署到任何环境。 Dapr 通过提供分布式构建块来实现此目标。

每个构建块都是独立的，这意味着您可以采用其中一个或多个或全部来构建应用。 在当前 Dapr 的初始版本中，提供了以下构建块：

| 构建块                    | 说明                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [**服务间调用**]({{X18X}}) | 弹性的服务间调用能在远程服务上进行方法调用（包括检索），无论它们是否位于受支持的托管环境中的。                                                                                                                                                                                                                                                                                                                                                  |
| [**状态管理**]({{X21X}})  | With state management for storing key/value pairs, long running, highly available, stateful services can be easily written alongside stateless services in your application. The state store is pluggable and can include Azure CosmosDB, Azure SQL Server, PostgreSQL, AWS DynamoDB or Redis among others. 状态存储是可插拔的，可以包括 Azure CosmosDB， Azure SQL Server， PostgreSQL， AWS DynamoDB 或 Redis 等。 |
| [**发布订阅**]({{X24X}})  | Publishing events and subscribing to topics | tween services enables event-driven architectures to simplify horizontal scalability and make them | silient to failure. Dapr provides at least once message delivery guarantee.                                                                                                                                                                   |
| [**资源绑定**]({{X27X}})  | 带触发器的资源绑定通过接收和发送事件到任何外部源（如数据库、队列、文件系统等）来进一步构建事件驱动架构，以实现扩展性和弹性。                                                                                                                                                                                                                                                                                                                                   |
| [**Actor**]({{X30X}}) | 一种用于有状态和无状态对象的模式，通过方法和状态的封装让并发变得简单。 Dapr 在其 actor 运行时提供了很多能力，包括并发，状态管理，用于 actor 激活/停用的生命周期管理，以及唤醒 actor 的计时器和提醒器。                                                                                                                                                                                                                                                                                |
| [**可观察性**]({{X33X}})  | Dapr 可以发出度量，日志和跟踪以调试和监控 Dapr 和用户应用程序。 Dapr 支持分布式跟踪，通过使用 W3C 跟踪上下文标准和 Open Telemetry 发送到不同的监控工具，以方便诊断和服务于生产中的服务间调用。                                                                                                                                                                                                                                                                               |
| [**密钥**]({{X36X}})    | Dapr提供秘密管理，并与公有云和本地秘密存储集成，以检索秘密，用于应用代码。                                                                                                                                                                                                                                                                                                                                                          |

## Sidecar 架构

Dapr以 sidecar 架构的方式公开其API，可以是容器，也可以是进程，不需要应用代码包含任何 Dapr 运行时代码。 这使得 Dapr 与其他运行时的集成变得容易，同时也提供了应用逻辑的分离，改善可支持性。

## 托管环境
Dapr 可以托管在多种环境中，包括用于本地开发的自托管，或部署到一组 VM、Kubernetes 和边缘环境（如 Azure IoT Edge）。

### 自托管

在自托管模式下，Dapr 作为单独的 sidecar 进程运行，服务代码可以通过 HTTP 或 gRPC 调用该进程。 在自托管模式下，您还可以将 Dapr 部署到一组 VM 上。

<img src="/images/overview-sidecar.png" width=1000>

### Kubernetes 托管

在容器托管环境（如 Kubernetes）中，Dapr 作为 sidecar 容器运行，和应用程序容器在同一个 pod 中。

<img src="/images/overview-sidecar-kubernetes.png" width=1000>

## 开发者语言 SDK 和框架

为了让不同的语言更加自然地使用 Dapr ，它还包括用于 Go、Java、JavaScript、.NET 和 Python 的语言特定 SDK。 这些 SDK 通过类型化的语言 API 而不是通过调用 http/gRPC API 来使用 Dapr 构建块中的功能，例如，保存状态，发布事件或创建Actor。 这使您能够以自己选择的语言编写无状态和有状态函数和 actors 的组合。 由于这些 SDK 共享 Dapr 运行时，因此您可以获得跨语言 actor 和功能支持。

### SDK

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
 例如，在 Dapr [.NET SDK ](https://github.com/dapr/dotnet-sdk) 中，您可以与 ASP.NET Core集成，它提供了有状态的路由控制器来响应来自其他服务的 pub/sub 事件。

 在 Dapr [Java SDK](https://github.com/dapr/java-sdk) 中，您可以找到 [Spring Boot](https://spring.io/) 集成。

Dapr 很容易与Python [Flask](https://pypi.org/project/Flask/) 和 node [Express](http://expressjs.com/) 集成。 请参阅 [Dapr 快速开始](https://github.com/dapr/quickstarts) 中的示例。

In the Dapr [PHP-SDK](https://github.com/dapr/php-sdk) you can serve with Apache, Nginx, or Caddyserver.

#### Actor
Dapr SDKs support for [virtual actors]({{< ref actors >}}) which are stateful objects that make concurrency simple, have method and state encapsulation, and are designed for scalable, distributed applications.

#### Azure Functions
Dapr integrates with the Azure Functions runtime via an extension that lets a function seamlessly interact with Dapr. Azure Functions provides an event-driven programming model and Dapr provides cloud-native building blocks. With this  extension, you can bring both together for serverless and event-driven apps. For more information read [Azure Functions extension for Dapr](https://cloudblogs.microsoft.com/opensource/2020/07/01/announcing-azure-functions-extension-for-dapr/) and visit the [Azure Functions extension](https://github.com/dapr/azure-functions-extension) repo to try out the samples.

#### Dapr 工作流
To enable developers to easily build workflow applications that use Dapr’s capabilities including diagnostics and multi-language support, you can use Dapr workflows. Dapr integrates with workflow engines such as Logic Apps.  For more information read [cloud-native workflows using Dapr and Logic Apps](https://cloudblogs.microsoft.com/opensource/2020/05/26/announcing-cloud-native-workflows-dapr-logic-apps/) and visit the [Dapr workflow](https://github.com/dapr/workflows) repo to try out the samples.

## 为运维设计
Dapr is designed for [operations](/operations/). The [services dashboard](https://github.com/dapr/dashboard), installed via the Dapr CLI, provides a web-based UI enabling you to see information, view logs and more for the Dapr sidecars.

[监控工具支持](/operations/monitoring/) 提供 Dapr 系统服务和sidecar 的更深入的可见性，Dapr 的 [可观测性能力]({{X75X}}) 提供了对应用程序的深入了解，例如追踪和度量。

## 在任何地方运行

### 以自托管模式在开发者本地机器上运行 Dapr

Dapr can be configured to run on your local developer machine in [self-hosted mode]({{< ref self-hosted >}}). Each running service has a Dapr runtime process (or sidecar) which is configured to use state stores, pub/sub, binding components and the other building blocks.

You can use the [Dapr CLI](https://github.com/dapr/cli#launch-dapr-and-your-app) to run a Dapr enabled application on your local machine. Try this out with the [getting started samples]({{< ref getting-started >}}).

<img src="/images/overview_standalone.png" width=800>

### 以 Kubernetes 模式运行 dapr

Dapr can be configured to run on any [Kubernetes cluster]({{< ref kubernetes >}}). In Kubernetes the `dapr-sidecar-injector` and `dapr-operator` services provide first class integration to launch Dapr as a sidecar container in the same pod as the service container and provide notifications of Dapr component updates provisioned into the cluster.

The `dapr-sentry` service is a certificate authority that enables mutual TLS between Dapr sidecar instances for secure data encryption. For more information on the `Sentry` service read the [security overview]({{< ref "security-concept.md#dapr-to-dapr-communication" >}})

<img src="/images/overview_kubernetes.png" width=800>

Deploying and running a Dapr enabled application into your Kubernetes cluster is as simple as adding a few annotations to the deployment schemes. You can see some examples [here](https://github.com/dapr/quickstarts/tree/master/hello-kubernetes/deploy) in the Kubernetes getting started sample. Try this out with the [Kubernetes quickstart](https://github.com/dapr/quickstarts/tree/master/hello-kubernetes).
