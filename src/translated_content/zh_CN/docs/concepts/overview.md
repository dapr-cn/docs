---
type: docs
title: 概述
linkTitle: 概述
weight: 100
description: |
  分布式应用运行时介绍
---

Dapr 是一个可移植的、事件驱动的运行时，它使任何开发人员能够轻松构建出弹性的、无状态和有状态的应用程序，并可运行在云平台或边缘计算中，它同时也支持多种编程语言和开发框架。

<div class="embed-responsive embed-responsive-16by9">
  <iframe width="1120" height="630" src="https://www.youtube-nocookie.com/embed/9o9iDAgYBA8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 任何语言，任何框架，任何地方

<img src="/images/overview.png" width=1200 style="padding-bottom:15px;">

随着当前云采用的浪潮，Web + 数据库应用程序架构（例如经典的 3 层设计）更倾向于本质上是分布式的微服务应用程序架构。 您不必仅仅为了创建微服务应用程序而成为分布式系统专家。

这就是Dapr所要解决的。 Dapr 将_最佳实践_编纂成开放、独立的API（称为[构建块]({{< ref "#microservice-building-blocks-for-cloud-and-edge" >}})），使您能够使用所选的语言和框架构建可移植应用程序。 Dapr 构建块:

- 使您能够使用您所选的语言和框架来构建可移植的应用程序。
- 完全独立
- 对在应用程序中的使用数量没有限制

使用Dapr，您可以逐步将现有的应用程序迁移到微服务架构，从而采用云原生模式，如横向扩展、复原能力和独立部署。

Dapr 是平台无关的，这意味着您可以运行您的应用程序：

- 本地
- 在任何 Kubernetes 集群上
- 在虚拟机或物理机上
- 在其他 Dapr 集成的托管环境中。

这使您能够构建可在云和边缘上运行的微服务应用程序。

## 用于云和边缘的微服务构建块

<img src="/images/building_blocks.png" width=1200 style="padding-bottom:15px;">

Dapr 提供分布式系统构建块，以便以标准方式构建微服务应用程序并部署到任何环境。

这些构建块API的每个都是独立的，这意味着您可以在您的应用程序中使用任意数量的它们。

| 构建块                                                                                                                                                | 说明                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**服务之间的调用**]({{< ref "service-invocation-overview.md" >}}) | 服务间调用允许进行远程方法调用(包括重试)，无论远程服务处于任何位置，只需该服务托管于受支持的环境即可。                                                                                   |
| [**状态管理**]({{< ref "state-management-overview.md" >}})      | 通过采用存储和查询键/值对机制的状态管理，可以轻松的使长时运行、高可用的有状态服务和无状态服务共同运行在您的应用程序中。 状态存储是可插拔的，示例包括AWS DynamoDB、Azure CosmosDB、Azure SQL Server、GCP Firebase、PostgreSQL或Redis，等等。 |
| [**发布和订阅**]({{< ref "pubsub-overview.md" >}})               | 在服务之间发布事件和订阅主题，使事件驱动的架构能够简化水平可伸缩性，并使其能够灵活应对故障。 Dapr 提供至少一次的消息传递保证，消息TTL，消费者组等高级功能。                                                                        |
| [**资源绑定**]({{< ref "bindings-overview.md" >}})              | 通过接收和发送事件到任何外部来源，如数据库、队列、文件系统等，带触发器的资源绑定进一步加强了事件驱动架构的规模和弹性。                                                                                               |
| [**Actors**]({{< ref "actors-overview.md" >}})              | 一种用于有状态和无状态对象的模式，它通过对方法和状态的封装使并发变得简单。 Dapr 在 Actor 模式中提供了很多功能，包括并发，状态管理，用于 actor 激活/停用的生命周期管理，以及唤醒 actor 的计时器和提醒器。                                        |
| [**secrets**]({{< ref "secrets-overview.md" >}})            | Dapr 提供了密钥管理，支持与公有云和本地的 Secret 存储集成，以供应用检索使用。                                                                                                             |
| [**配置**]({{< ref "configuration-api-overview.md" >}})       | 配置 API 使您能够从配置存储中检索和订阅应用程序配置项。                                                                                                                            |
| [**分布式锁**]({{< ref "distributed-lock-api-overview.md" >}})  | 分布式锁 API 使应用程序能够获取任何资源的锁，该资源会授予其独占访问权限，直到应用程序释放锁或发生租约超时。                                                                                                  |
| [**工作流程**]({{< ref "workflow-overview.md" >}})              | 工作流 API 可以与其他 Dapr 构建块结合使用，做到使用 Dapr 工作流或工作流组件定义跨多个微服务的长时间运行的持久进程或数据流。                                                                                    |
| [**密码学**]({{< ref "cryptography-overview.md" >}})           | 加密 API 在密钥保管库等安全基础结构之上提供抽象层。 它包含允许您执行加密操作（例如加密和解密消息）的 API，而无需向应用程序公开密钥。                                                                                   |

### 跨领域接口

除了构建基块之外，Dapr 还提供适用于你使用的所有构建基块的跨领域 API。

| 构建块                                                                                                                                       | 说明                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [**弹性**]({{< ref "resiliency-concept.md" >}})      | Dapr 提供了通过弹性规范定义和应用容错弹性策略的能力。 支持的规范定义弹性模式的策略，例如超时、重试/退避和断路器。                                                          |
| [**可观测性**]({{< ref "observability-concept.md" >}}) | Dapr会发出各种指标、日志、链路以调试和监控 Dapr 和用户应用的运行状况。 Dapr 支持分布式跟踪，通过使用 W3C 跟踪上下文标准和 Open Telemetry 发送到不同的监控工具，以方便诊断和服务于生产中的服务间调用。 |
| [**安全**]({{< ref "security-concept.md" >}})        | Dapr 支持使用 Dapr 控制平面哨兵服务对 Dapr 实例之间的通信进行传输中加密。 您可以引入自己的证书，也可以让 Dapr 自动创建和保留自签名根证书和颁发者证书。                               |

## Sidecar 架构

Dapr 以 sidecar 架构的方式公开其 HTTP 和 gRPC API，无论是作为容器还是作为进程，不需要应用代码包含任何 Dapr 运行时代码。 这使得 Dapr 与其他运行时的集成变得容易，同时也提供了应用逻辑的分离，改善可支持性。

<img src="/images/overview-sidecar-model.png" width=900>

## 托管环境

Dapr 可以托管在多个环境中，包括：

- 自托管在 Windows/Linux/macOS 计算机上，用于本地开发
- 在 Kubernetes 或生产中的物理或虚拟机集群上

### 自托管模式本地开发

在[自托管模式]({{< ref self-hosted-overview.md >}})，Dapr作为一个独立的sidecar进程运行，你的服务代码可以通过HTTP或gRPC调用。 每个运行的服务都有一个 Dapr 运行时进程 (或 sidecar) ，配置为使用状态存储， pub/sub，绑定组件和其他构建块。

您可以使用[Dapr CLI](https://github.com/dapr/cli#launch-dapr-and-your-app)在本地计算机上运行一个启用了 Dapr 的应用程序。 在下图中，使用 CLI `init` 命令配置了Dapr的本地开发环境。 使用[入门示例]({{< ref getting-started >}}) 来尝试一下。

<img src="/images/overview-standalone.png" width=1200 alt="Architecture diagram of Dapr in self-hosted mode">

### Kubernetes

Kubernetes 可用于：

- 本地开发（例如，使用[minikube](https://minikube.sigs.k8s.io/docs/)和[k3S](https://k3s.io/)），或者
- 在[生产环境]({{< ref kubernetes >}}) 中。

在容器托管环境（如 Kubernetes）中，Dapr 作为 sidecar 容器运行，和应用程序容器在同一个 pod 中。

Dapr的`dapr-sidecar-injector`和`dapr-operator`控制面板服务提供一流的集成：

- 将 Dapr 作为 sidercar 容器与服务容器位于同一容器中启动
- 提供群集中预配的 Dapr 组件更新的通知

<!-- IGNORE_LINKS -->

`dapr-sentry` 服务是一个认证中心，它允许 Dapr sidecar 实例之间的相互 TLS 进行安全数据加密，同时通过 [Spiffe](https://spiffe.io/) 提供身份验证。 关于 `Sentry` 服务的更多信息，请阅读 [安全概述]({{< ref "security-concept.md#dapr-to-dapr-communication" >}})

<!-- END_IGNORE -->

在你的 Kubernetes 集群中部署和运行一个启用了 Dapr 的应用程序很简单，只需在部署方案中添加一些注解即可。 访问[Dapr on Kubernetes文档]({{< ref kubernetes >}}).

<img src="/images/overview-kubernetes.png" width=1200 alt="Architecture diagram of Dapr in Kubernetes mode">

### 物理机或虚拟机集群

例如，Dapr 控制平面服务可以在高可用性 （HA） 模式下部署到生产环境中的物理机或虚拟机集群。 在下面的图表中，`Actor Placement`和安全`Sentry`服务在三个不同的VM上启动，以提供HA控制面板。 为了给在集群中运行的应用程序提供使用 DNS 名称解析，Dapr使用[Hashicorp Consul服务]({{< ref setup-nr-consul >}})，也在HA模式下运行。

<img src="/images/overview-vms-hosting.png" width=1200 alt="Architecture diagram of Dapr control plane and Consul deployed to VMs in high availability mode">

## 开发者语言 SDK 和框架

Dapr 提供各种 SDK 和框架，便于开始以您喜欢的语言与 Dapr 一起开发。

### Dapr SDK列表

为了让不同语言使用 Dapr 更加自然，它还包含了 [语言特定的 SDK]({{< ref sdks >}})：

- Go
- Java
- JavaScript
- .NET
- PHP
- Python

这些 SDK 通过特定语言 API 来暴露 Dapr 构建块的功能，而不是调用 http/gRPC API。 这使您能够用您选择的语言编写无状态和有状态函数以及 Actor 的组合。 由于这些 SDK 共享 Dapr 运行时，因此您可以获得跨语言的 actor 和功能支持。

### 开发框架

Dapr 可以与任何开发框架集成。 下面是一些已经和Dapr集成的：

#### Web

| 语言                                                                                                                | 框架                                                                                                                          | 说明                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [.NET]({{< ref dotnet >}}) | [ASP.NET Core](https://github.com/dapr/dotnet-sdk/tree/master/examples/AspNetCore)                          | 提供有状态路由控制器，相应来自其他服务的发布/订阅事件。 也可以利用[ASP.NET Core gRPC服务](https://docs.microsoft.com/aspnet/core/grpc/)。 |
| [Java]({{< ref java >}})                   | [Spring Boot](https://spring.io/)                                                                                           | 使用 Dapr API 构建 Spring boot应用程序。                                                                                        |
| [Python]({{< ref python >}})               | [Flask]({{< ref python-flask.md >}}) | 使用 Dapr API 构建 Flask 应用程序。                                                                                             |
| [Javascript](https://github.com/dapr/js-sdk)                                                                      | [Express](http://expressjs.com/)                                                                                            | 使用 Dapr API 构建 Express 应用程序。                                                                                           |
| [PHP]({{< ref php >}})                     |                                                                                                                             | 可以使用 Apache, Nginx, 或 Caddyserver 提供服务。                                                                                |

#### 集成和扩展

访问[integrations]({{< ref integrations >}}) 页面，了解Dapr对各种框架和外部产品的一流支持，包括：

- 公共云服务，如 Azure 和 AWS
- Visual Studio Code
- GitHub

## 为运维而设计

Dapr 专为[运维]({{< ref operations >}})和安全性而设计。 Dapr sidecar、运行时、组件和配置都可以轻松、安全地管理和部署，以满足组织的需求。

通过[Dapr CLI](https://github.com/dapr/dashboard)安装的仪表板，提供了基于Web的用户界面，使您能够查看运行Dapr应用程序的信息、查看日志等。

Dapr支持[监控工具]({{< ref observability >}})，以便更深入地查看Dapr系统服务和sidecar，而Dapr的[可观测性能力]({{< ref "observability-concept.md" >}})则提供了对应用程序的洞察，例如追踪和度量。
