---
type: docs
title: "概述"
linkTitle: "概述"
weight: 100
description: >
  Introduction to the Distributed Application Runtime
---

Dapr is a portable, event-driven runtime that makes it easy for any developer to build resilient, stateless and stateful applications that run on the cloud and edge and embraces the diversity of languages and developer frameworks.

<div class="embed-responsive embed-responsive-16by9">
  <iframe width="1120" height="630" src="https://www.youtube-nocookie.com/embed/9o9iDAgYBA8" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## Any language, any framework, anywhere

<img src="/images/overview.png" width=1200>

如今，我们正经历着上云浪潮。 开发人员对 Web + 数据库应用架构（例如经典 3 层设计）非常熟悉，并且使用得手，但对本身能支持分布式的微服务应用构建却感觉陌生。 成为分布式系统专家很难，也不应该这样做。 开发人员希望专注于业务逻辑，同时希望平台为其提供可伸缩的、弹性的、可维护的和云原生架构的其他功能。

这就是Dapr所要解决的。 Dapr 将 *最佳实践* 编纂成开放、独立的 API（称为构建基块），使您能够使用所选的语言和框架构建可移植应用程序。 每个构建块都是完全独立的，您可以采用其中一个、多个或全部来构建应用。

使用 Dapr，您可以将现有应用程序增量迁移到微服务架构，从而采用云原生模式，例如横向扩展/收缩（scale out/in）、弹性和独立部署。

此外，Dapr 与平台无关，这意味着您可以在本地、任何 Kubernetes 集群、虚拟机或物理机以及 Dapr 集成的其他托管环境中运行应用程序。 这使您能够构建可在云和边缘上运行的微服务应用程序。

## 用于云和边缘的微服务构建块

<img src="/images/building_blocks.png" width=1200>

在架构微服务应用程序时，有许多考虑因素。 Dapr 在构建微服务应用时为常见功能提供了最佳实践，开发人员可以使用标准方式然后部署到任何环境。 Dapr 通过提供分布式构建块来实现这一目标。

每个构建块 API 都是独立的，这意味着您可以采用其中一个、多个或全部来构建应用。 目前，可用的构建块如下：

| 构建块                                                                               | 说明                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**Service-to-service invocation**]({{< ref "service-invocation-overview.md" >}}) | Resilient service-to-service invocation enables method calls, including retries, on remote services, wherever they are located in the supported hosting environment.                                                                                                                                                                         |
| [**状态管理**]({{< ref "state-management-overview.md" >}})                            | With state management for storing and querying key/value pairs, long-running, highly available, stateful services can be easily written alongside stateless services in your application. The state store is pluggable and examples include AWS DynamoDB, Azure CosmosDB, Azure SQL Server, GCP Firebase, PostgreSQL or Redis, among others. |
| [**Publish and subscribe**]({{< ref "pubsub-overview.md" >}})                     | Publishing events and subscribing to topics between services enables event-driven architectures to simplify horizontal scalability and make them resilient to failure. Dapr provides at-least-once message delivery guarantee, message TTL, consumer groups and other advance features.                                                      |
| [**Resource bindings**]({{< ref "bindings-overview.md" >}})                       | Resource bindings with triggers builds further on event-driven architectures for scale and resiliency by receiving and sending events to and from any external source such as databases, queues, file systems, etc.                                                                                                                          |
| [**Actors**]({{< ref "actors-overview.md" >}})                                    | A pattern for stateful and stateless objects that makes concurrency simple, with method and state encapsulation. Dapr provides many capabilities in its actor runtime, including concurrency, state, and life-cycle management for actor activation/deactivation, and timers and reminders to wake up actors.                                |
| [**可观测性**]({{< ref "observability-concept.md" >}})                                | Dapr emits metrics, logs, and traces to debug and monitor both Dapr and user applications. Dapr supports distributed tracing to easily diagnose and serve inter-service calls in production using the W3C Trace Context standard and Open Telemetry to send to different monitoring tools.                                                   |
| [**Secrets**]({{< ref "secrets-overview.md" >}})                                  | The secrets management API integrates with public cloud and local secret stores to retrieve the secrets for use in application code.                                                                                                                                                                                                         |
| [**Configuration**]({{< ref "configuration-api-overview.md" >}})                  | The configuration API enables you to retrieve and subscribe to application configuration items from configuration stores.                                                                                                                                                                                                                    |
| [**Distributed lock**]({{< ref "distributed-lock-api-overview.md" >}})            | The distributed lock API enables your application to acquire a lock for any resource that gives it exclusive access until either the lock is released by the application, or a lease timeout occurs.                                                                                                                                         |
| [**Workflows**]({{< ref "workflow-overview.md" >}})                               | `/v1.0-alpha1/workflow` | The workflow API can be combined with other Dapr building blocks to define long running, persistent processes or data flows that span multiple microservices using Dapr workflows or workflow components.                                                                                                          |


## Sidecar 架构

Dapr 以 sidecar 架构的方式公开其 HTTP 和 gRPC API，无论是作为容器还是作为进程，不需要应用代码包含任何 Dapr 运行时代码。 这使得 Dapr 与其他运行时的集成变得容易，在应用逻辑层面做了隔离处理，提高了可扩展性。

<img src="/images/overview-sidecar-model.png" width=900>

## 托管环境

Dapr can be hosted in multiple environments, including self-hosted on a Windows/Linux/macOS machines for local development and on Kubernetes or clusters of physical or virtual machines in production.

### Self-hosted local development

在 [自托管模式下]({{< ref self-hosted-overview.md >}}) Dapr 作为一个独立的 sidecar 进程运行，服务代码可以通过 HTTP 或 gRPC 调用。 每个正在运行的服务都有一个 Dapr 运行时进程（或 sidecar），该进程配置为使用状态存储、发布/订阅、绑定组件和其他构建块。

您可以使用 [Dapr CLI](https://github.com/dapr/cli#launch-dapr-and-your-app) 在本地机器上运行支持 Dapr 的应用程序。 下图显示了使用 CLI `init` 命令配置 Dapr 的本地开发环境。 请使用 [入门示例]({{< ref getting-started >}})。

<img src="/images/overview-standalone.png" width=1200 alt="自托管模式下的 Dapr 架构图">

### Kubernetes

Kubernetes 既可用于本地开发（例如使用 [minikube](https://minikube.sigs.k8s.io/docs/), [k3S](https://k3s.io/)），也可用于 [生产]({{< ref kubernetes >}})。 In container hosting environments such as Kubernetes, Dapr runs as a sidecar container with the application container in the same pod.

Dapr有控制平面服务。 The `dapr-sidecar-injector` and `dapr-operator` services provide first-class integration to launch Dapr as a sidecar container in the same pod as the service container and provide notifications of Dapr component updates provisioned in the cluster.

<!-- IGNORE_LINKS -->
`dapr-sentry` 服务是一个证书颁发机构，它支持 Dapr sidecar 实例之间的相互 TLS 以实现安全的数据加密，并通过 [Spiffe](https://spiffe.io/) 提供身份。 关于 `Sentry` 服务的更多信息请阅读 [安全概述]({{< ref "security-concept.md#dapr-to-dapr-communication" >}})
<!-- END_IGNORE -->

在 Kubernetes 集群中部署和运行启用 Dapr 的应用程序非常简单，只需向 deployment 方案添加一些注解。 访问 [Dapr on Kubernetes 文档]({{< ref kubernetes >}})

<img src="/images/overview-kubernetes.png" width=1200 alt="Kubernetes 模式下的 Dapr 架构图">

### 物理机或虚拟机集群

例如，Dapr 控制平面服务可以在高可用性 （HA） 模式下部署到生产环境中的物理机或虚拟机集群，如下图所示。 在这里，Actor `Placement` 和 `Sentry` 服务在三个不同的 VM 上启动，以提供 HA 控制平面。 为了给在集群中运行的应用程序提供使用 DNS 名称解析，Dapr使用 [Hashicorp Consul 服务]({{< ref setup-nr-consul >}})，也在HA模式下运行。

<img src="/images/overview-vms-hosting.png" width=1200 alt="Dapr 控制平面和 Consul 在高可用性模式下部署到 VM 的架构图">

## 开发者语言 SDK 和框架

Dapr提供了各种SDK和框架，使您可以轻松地用您喜欢的语言开始开发Dapr。

### Dapr SDKs

为了使不同语言的人更自然地使用Dapr，它还包括 [特定语言的 SDK]({{<ref sdks>}})，可用于：
- C++
- Go
- Java
- JavaScript
- .NET
- PHP
- Python
- Rust

这些 SDK 通过类型化语言 API 暴露 Dapr 构建块的功能，而不是调用 http/gRPC API。 这使您能够用您选择的语言编写无状态和有状态函数以及actor的组合。 由于这些 SDK 共享 Dapr 运行时，因此您可以获得跨语言的 actor 和功能支持。

### Developer frameworks

Dapr can be used from any developer framework. 下面是一些已经和 Dapr 集成的：

#### Web

| Language                                     | 框架                                                                                 | 说明                                                                                                                                                                                             |
| -------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [.NET]({{< ref dotnet >}})                   | [ASP.NET Core](https://github.com/dapr/dotnet-sdk/tree/master/examples/AspNetCore) | Brings stateful routing controllers that respond to pub/sub events from other services. Can also take advantage of [ASP.NET Core gRPC Services](https://docs.microsoft.com/aspnet/core/grpc/). |
| [Java]({{< ref java >}})                     | [Spring Boot](https://spring.io/)                                                  | Build Spring boot applications with Dapr APIs                                                                                                                                                  |
| [Python]({{< ref python >}})                 | [Flask]({{< ref python-flask.md >}})                                               | Build Flask applications with Dapr APIs                                                                                                                                                        |
| [Javascript](https://github.com/dapr/js-sdk) | [Express](http://expressjs.com/)                                                   | Build Express applications with Dapr APIs                                                                                                                                                      |
| [PHP]({{< ref php >}})                       |                                                                                    | 可以使用 Apache, Nginx, 或 Caddyserver 提供服务。                                                                                                                                                        |

#### 集成和扩展

Visit the [integrations]({{< ref integrations >}}) page to learn about some of the first-class support Dapr has for various frameworks and external products, including:
- Public cloud services
- Visual Studio Code
- GitHub

## 为运维而设计

Dapr 专为[运维]({{< ref operations >}})和安全性而设计。 Dapr sidecar、运行时、组件和配置都可以轻松、安全地管理和部署，以满足组织的需求。

通过 Dapr CLI 安装的[仪表板](https://github.com/dapr/dashboard)提供了基于 Web 的 UI，使您能够查看运行 Dapr 应用程序的信息、日志等。

[监控工具支持]({{< ref monitoring >}}) 提供 Dapr 系统服务和 sidecar 的更深入的可见性，Dapr 的 [可观测性能力]({{<ref "observability-concept.md">}}) 提供了对应用程序的深入了解，例如追踪和度量。
