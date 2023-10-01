---
type: docs
title: "概述"
linkTitle: "概述"
weight: 100
description: >
  分布式应用运行时介绍
---

Dapr 是一个可移植的、事件驱动的运行时，它使任何开发人员能够轻松构建出弹性的、无状态和有状态的应用程序，并可运行在云平台或边缘计算中，它同时也支持多种编程语言和开发框架。

<div class="embed-responsive embed-responsive-16by9">
  <iframe width="1120" height="630" src="https://www.youtube-nocookie.com/embed/9o9iDAgYBA8" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 任何语言，任何框架，任何地方

<img src="/images/overview.png" width=1200>

如今，我们正经历着上云浪潮。 开发人员对 Web + 数据库应用架构（例如经典 3 层设计）非常熟悉，并且使用得手，但对本身能支持分布式的微服务应用构建却感觉陌生。 成为分布式系统专家很难，也不应该这样做。 开发人员希望专注于业务逻辑，同时希望平台为其提供可伸缩的、弹性的、可维护的和云原生架构的其他功能。

这就是Dapr所要解决的。 Dapr 将 *最佳实践* 编纂成开放、独立的 API（称为构建基块），使您能够使用所选的语言和框架构建可移植应用程序。 每个构建块都是完全独立的，您可以采用其中一个、多个或全部来构建应用。

使用 Dapr，您可以将现有应用程序增量迁移到微服务架构，从而采用云原生模式，例如横向扩展/收缩（scale out/in）、弹性和独立部署。

此外，Dapr 与平台无关，这意味着您可以在本地、任何 Kubernetes 集群、虚拟机或物理机以及 Dapr 集成的其他托管环境中运行应用程序。 这使您能够构建可在云和边缘上运行的微服务应用程序。

## 用于云和边缘的微服务构建块

<img src="/images/building_blocks.png" width=1200>

在架构微服务应用程序时，有许多考虑因素。 Dapr 在构建微服务应用时为常见功能提供了最佳实践，开发人员可以使用标准方式然后部署到任何环境。 Dapr 通过提供分布式构建块来实现这一目标。

每个构建块 API 都是独立的，这意味着您可以采用其中一个、多个或全部来构建应用。 目前，可用的构建块如下：

| 构建块                                                        | 说明                                                                                                                                                          |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**服务间调用**]({{< ref "service-invocation-overview.md" >}})  | 服务间调用允许进行远程方法调用(包括重试)，无论远程服务处于任何位置，只需该服务托管于受支持的环境即可。                                                                                                        |
| [**状态管理**]({{< ref "state-management-overview.md" >}})     | 通过采用存储和查询键/值对机制的状态管理，可以轻松的使长时运行、高可用的有状态服务和无状态服务共同运行在您的应用程序中。 状态存储是可插拔的，示例包括 AWS DynamoDB、Azure CosmosDB、Azure SQL Server、GCP Firebase、PostgreSQL 或 Redis 等。 |
| [**发布与订阅**]({{< ref "pubsub-overview.md" >}})              | 在服务之间发布事件和订阅主题，使事件驱动的架构能够简化水平可伸缩性，并使其能够灵活应对故障。 Dapr 提供至少一次的消息传递保证，消息TTL，消费者组等高级功能。                                                                          |
| [**资源绑定**]({{< ref "bindings-overview.md" >}})             | 通过接收和发送事件到任何外部来源，如数据库、队列、文件系统等，带触发器的资源绑定进一步加强了事件驱动架构的规模和弹性。                                                                                                 |
| [**Actors**]({{< ref "actors-overview.md" >}})             | 一种用于有状态和无状态对象的模式，它通过对方法和状态的封装使并发变得简单。 Dapr 在 Actor 模式中提供了很多功能，包括并发，状态管理，用于 actor 激活/停用的生命周期管理，以及唤醒 actor 的计时器和提醒器。                                          |
| [**可观测性**]({{< ref "observability-concept.md" >}})         | Dapr会发出各种指标、日志、链路以调试和监控 Dapr 和用户应用的运行状况。 Dapr 支持分布式跟踪，通过使用 W3C 跟踪上下文标准和 Open Telemetry 发送到不同的监控工具，以方便诊断和服务于生产中的服务间调用。                                       |
| [**密钥**]({{< ref "secrets-overview.md" >}})                | Dapr 提供了密钥管理，支持与公有云和本地的 Secret 存储集成，以供应用检索使用。                                                                                                               |
| [**配置**]({{< ref "configuration-api-overview.md" >}})      | 配置 API 使您能够从配置存储中检索和订阅应用程序配置项。                                                                                                                              |
| [**分布式锁**]({{< ref "distributed-lock-api-overview.md" >}}) | 分布式锁 API 使应用程序能够获取任何资源的锁，该资源会授予其独占访问权限，直到应用程序释放锁或发生租约超时。                                                                                                    |
| [**工作流**]({{< ref "workflow-overview.md" >}})              | `/v1.0-alpha1/工作流` |工作流 API 可以与其他 Dapr 构建块结合使用，做到使用 Dapr 工作流或工作流组件定义跨多个微服务的长时间运行的持久进程或数据流。                                                                  |


## Sidecar 架构

Dapr 以 sidecar 架构的方式公开其 HTTP 和 gRPC API，无论是作为容器还是作为进程，不需要应用代码包含任何 Dapr 运行时代码。 这使得 Dapr 与其他运行时的集成变得容易，在应用逻辑层面做了隔离处理，提高了可扩展性。

<img src="/images/overview-sidecar-model.png" width=900>

## 托管环境

Dapr可以在多种环境中托管，包括在 Windows/Linux/MacOS 机器上的自托管以进行本地开发，和在 Kubernetes 或生产环境中的物理机或虚拟机器集群上托管。

### 自托管模式本地开发

在 [自托管模式下]({{< ref self-hosted-overview.md >}}) Dapr 作为一个独立的 sidecar 进程运行，服务代码可以通过 HTTP 或 gRPC 调用。 每个正在运行的服务都有一个 Dapr 运行时进程（或 sidecar），该进程配置为使用状态存储、发布/订阅、绑定组件和其他构建块。

您可以使用 [Dapr CLI](https://github.com/dapr/cli#launch-dapr-and-your-app) 在本地机器上运行支持 Dapr 的应用程序。 下图显示了使用 CLI `init` 命令配置 Dapr 的本地开发环境。 请使用 [入门示例]({{< ref getting-started >}})。

<img src="/images/overview-standalone.png" width=1200 alt="自托管模式下的 Dapr 架构图">

### Kubernetes

Kubernetes 既可用于本地开发（例如使用 [minikube](https://minikube.sigs.k8s.io/docs/), [k3S](https://k3s.io/)），也可用于 [生产]({{< ref kubernetes >}})。 在容器托管环境（如 Kubernetes）中，Dapr 作为 sidecar 容器运行，和应用程序容器在同一个 pod 中。

Dapr有控制平面服务。 在 Kubernetes 中， `dapr-sidecar-injector` 和 `dapr-operator` 服务提供一流的集成，以将 Dapr 作为 sidecar 容器启动在与服务容器相同的 pod 中 ，并为在集群中部署的 Dapr 组件提供更新通知。

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

### Dapr SDK列表

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

### 开发框架

Dapr 可以与任何开发框架集成。 下面是一些已经和 Dapr 集成的：

#### Web

| 语言                                           | 框架                                                                                 | 说明                                                                                                       |
| -------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [.NET]({{< ref dotnet >}})                   | [ASP.NET Core](https://github.com/dapr/dotnet-sdk/tree/master/examples/AspNetCore) | 提供有状态路由控制器，相应来自其他服务的发布/订阅事件。 也可以利用 [ASP.NET Core gRPC 服务](https://docs.microsoft.com/aspnet/core/grpc/)。 |
| [Java]({{< ref java >}})                     | [Spring Boot](https://spring.io/)                                                  | 使用 Dapr API 构建 Spring boot应用程序。                                                                          |
| [Python]({{< ref python >}})                 | [Flask]({{< ref python-flask.md >}})                                               | 使用 Dapr API 构建 Flask 应用程序。                                                                               |
| [Javascript](https://github.com/dapr/js-sdk) | [Express](http://expressjs.com/)                                                   | 使用 Dapr API 构建 Express 应用程序。                                                                             |
| [PHP]({{< ref php >}})                       |                                                                                    | 可以使用 Apache, Nginx, 或 Caddyserver 提供服务。                                                                  |

#### 集成和扩展

访问 [集成]({{< ref integrations >}}) 页面以了解 Dapr 对各种框架和外部产品的一些一流支持，包括：
- 公共云服务
- Visual Studio Code
- GitHub

## 为运维而设计

Dapr 专为[运维]({{< ref operations >}})和安全性而设计。 Dapr sidecar、运行时、组件和配置都可以轻松、安全地管理和部署，以满足组织的需求。

通过 Dapr CLI 安装的[仪表板](https://github.com/dapr/dashboard)提供了基于 Web 的 UI，使您能够查看运行 Dapr 应用程序的信息、日志等。

[监控工具支持]({{< ref monitoring >}}) 提供 Dapr 系统服务和 sidecar 的更深入的可见性，Dapr 的 [可观测性能力]({{<ref "observability-concept.md">}}) 提供了对应用程序的深入了解，例如追踪和度量。
