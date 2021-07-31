---
type: docs
title: "概述"
linkTitle: "概述"
weight: 100
description: >
  分布式应用程序运行时介绍
---

Dapr 是一个可移植的、事件驱动的运行时，它使任何开发人员能够轻松构建出弹性的、无状态和有状态的应用程序，并可运行在云平台或边缘计算中，它同时也支持多种编程语言和开发框架。 <iframe width="1120" height="630" src="//player.bilibili.com/player.html?aid=586108726&bvid=BV1xz4y167XA&cid=277928385&page=1" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen mark="crwd-mark"></iframe>

## 任何语言，任何框架，任何地方

<img src="/images/overview.png" width=1000>

如今，我们正经历着上云浪潮。 开发人员习惯于 Web + 数据库应用架构(例如经典 3 层设计)，但对天然支持分布式的微服务应用架构却感觉陌生。 成为分布式系统专家很难，并且你也不需要这么做。 开发人员希望专注于业务逻辑，同时希望平台为其提供可伸缩的、弹性的、可维护的和云原生架构的其他功能。

这就是Dapr所要解决的。 Dapr codifies the *best practices* for building microservice applications into open, independent building blocks that enable you to build portable applications with the language and framework of your choice. 每个构建块都是完全独立的，您可以采用其中一个、多个或全部来构建你的应用。

In addition, Dapr is platform agnostic, meaning you can run your applications locally, on any Kubernetes cluster, and in other hosting environments that Dapr integrates with. 这使得您能够在云平台和边缘计算中运行微服务应用。

Using Dapr you can easily build microservice applications using any language and any framework, and run them anywhere.

## 云平台和边缘计算的微服务构建块

<img src="/images/building_blocks.png" width=1000>

在设计微服务应用时，需要考虑很多因素。 Dapr provides best practices for common capabilities when building microservice applications that developers can use in a standard way, and deploy to any environment. Dapr 通过提供分布式构建块来实现此目的。

Each of these building blocks is independent, meaning that you can use one, some, or all of them in your application. 目前，可用的构建块如下：

| 构建块                                                    | 说明                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**服务调用**]({{<ref "service-invocation-overview.md">}}) | Resilient service-to-service invocation enables method calls, including retries, on remote services, wherever they are located in the supported hosting environment.                                                                                                                                          |
| [**状态管理**]({{<ref "state-management-overview.md">}})   | With state management for storing key/value pairs, long-running, highly available, stateful services can be easily written alongside stateless services in your application. The state store is pluggable and can include Azure CosmosDB, Azure SQL Server, PostgreSQL, AWS DynamoDB or Redis, among others.  |
| [**发布订阅**]({{<ref "pubsub-overview.md">}})             | 发布事件和订阅主题。 Dapr provides at-least-once message delivery guarantee.                                                                                                                                                                                                                                            |
| [**资源绑定**]({{<ref "bindings-overview.md">}})           | Dapr的Bindings是建立在事件驱动架构的基础之上的。通过建立触发器与资源的绑定，可以从任何外部源（例如数据库，队列，文件系统等）接收和发送事件，而无需借助消息队列，即可实现灵活的业务场景。                                                                                                                                                                                                            |
| [**Actors**]({{<ref "actors-overview.md">}})           | A pattern for stateful and stateless objects that makes concurrency simple, with method and state encapsulation. Dapr provides many capabilities in its actor runtime, including concurrency, state, and life-cycle management for actor activation/deactivation, and timers and reminders to wake up actors. |
| [**可观测性**]({{<ref "observability-concept.md">}})       | Dapr emits metrics, logs, and traces to debug and monitor both Dapr and user applications. Dapr支持分布式跟踪，其使用W3C跟踪上下文标准和开放式遥测技术，可以轻松地诊断在生产环境中服务间的网络调用，并发送到不同的监视工具。                                                                                                                                               |
| [**秘密**]({{<ref "secrets-overview.md">}})              | Dapr provides secrets management, and integrates with public-cloud and local-secret stores to retrieve the secrets for use in application code.                                                                                                                                                               |

## Sidecar 架构

Dapr以 sidecar 架构的方式公开其API，可以是容器，也可以是进程，不需要应用代码包含任何 Dapr 运行时代码。 这使得 Dapr 与其他运行时的集成变得容易，在应用逻辑层面做了隔离处理，提高了可扩展性。

<img src="/images/overview-sidecar-model.png" width=700>

## 托管环境

Dapr可以托管在多个环境中，包括在Windows/Linux/macOS机器上自托管和Kubernetes。

### 自托管

[自托管模式]({{< ref self-hosted-overview.md >}}) 下，Dapr 运行一个单独的 sidecar 程序，在您的服务代码中可以通过 HTTP 或 gRPC 调用它。 每个运行的服务都有一个 Dapr 运行时进程 (或 sidecar) ，配置为使用状态存储， pub/sub，绑定组件和其他构建块。

You can use the [Dapr CLI](https://github.com/dapr/cli#launch-dapr-and-your-app) to run a Dapr-enabled application on your local machine. 请使用 [入门示例]({{< ref getting-started >}})。

<img src="/images/overview_standalone.png" width=1000 alt="自托管模式下的 Dapr 架构图">

### Kubernetes 托管

在托管在容器环境中（如 Kubernetes），Dapr 作为 sidecar 容器运行，和应用程序容器在同一个 pod 中。

The `dapr-sidecar-injector` and `dapr-operator` services provide first-class integration to launch Dapr as a sidecar container in the same pod as the service container and provide notifications of Dapr component updates provisioned in the cluster.

`dapr-sentry` 服务是一个认证中心，它允许 Dapr sidecar 实例之间的相互 TLS 进行安全数据加密。 For more information on the `Sentry` service, read the [security overview]({{< ref "security-concept.md#dapr-to-dapr-communication" >}})

Deploying and running a Dapr-enabled application into your Kubernetes cluster is as simple as adding a few annotations to the deployment schemes. 访问 [Kubernetes 文档上的 Dapr]({{< ref kubernetes >}})

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

这些 SDK 通过特定语言 API 来暴露 Dapr 构建块的功能，而不是调用 http/gRPC API。 This enables you to write a combination of stateless and stateful functions and actors all in the language of your choice. And because these SDKs share the Dapr runtime, you get cross-language actor and function support.

### 开发框架

Dapr 可以与任何开发框架集成。 下面是一些已经和 Dapr 集成的。

#### Web

| 语言                                           | 框架                                      | 说明                                                                                                                 |
| -------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| [.NET]({{< ref dotnet >}})                   | [ASP.NET]({{< ref dotnet-aspnet.md >}}) | 带来状态路由控制器，从而完成来自其他应用的 发布/订阅 构建块。 也可以利用 [ASP.NET Core gRPC 服务](https://docs.microsoft.com/en-us/aspnet/core/grpc/)。 |
| \[Java\]({{< ref java >}}                    | [Spring Boot](https://spring.io/)       |                                                                                                                    |
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
