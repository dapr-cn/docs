---
type: docs
title: "概述"
linkTitle: "概述"
weight: 100
description: >
  分布式应用运行时简介
---

Dapr 是一个便于移植的事件驱动运行时，帮助开发者轻松构建在云和边缘环境中运行的弹性应用，无论是无状态还是有状态的，并支持多种编程语言和开发框架。

<div class="embed-responsive embed-responsive-16by9">
  <iframe width="1120" height="630" src="https://www.youtube-nocookie.com/embed/9o9iDAgYBA8" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 支持任何语言、框架和环境

<img src="/images/overview.png" width=1200 style="padding-bottom:15px;">

随着云技术的普及，传统的 Web + 数据库应用架构（如经典的三层设计）正逐渐向微服务架构转变，这些架构本质上是分布式的。开发微服务应用不应要求您成为分布式系统的专家。

这正是 Dapr 的优势所在。Dapr 将构建微服务应用的*最佳实践*转化为开放且独立的 API，称为[构建块]({{< ref "#microservice-building-blocks-for-cloud-and-edge" >}})。Dapr 的构建块：
- 允许您使用任意语言和框架构建可移植的应用。
- 完全独立
- 在应用中使用的数量没有限制

通过 Dapr，您可以逐步将现有应用迁移到微服务架构，采用云原生模式，如扩展/缩减、弹性和独立部署。

Dapr 是平台无关的，这意味着您可以在以下环境中运行您的应用：
- 本地
- 任何 Kubernetes 集群
- 虚拟或物理机器
- Dapr 集成的其他托管环境

这使您能够构建可以在云和边缘运行的微服务应用。

## 云和边缘的微服务构建块

<img src="/images/building_blocks.png" width=1200 style="padding-bottom:15px;">

Dapr 提供分布式系统构建块，使您能够以标准方式构建微服务应用并部署到任何环境。

每个构建块 API 都是独立的，这意味着您可以在应用中使用任意数量的它们。

| 构建块 | 描述 |
|----------------|-------------|
| [**服务间调用**]({{< ref "service-invocation-overview.md" >}})  | 提供弹性的服务间调用功能，无论远程服务位于何处，都可以进行方法调用，包括重试。
| [**发布和订阅**]({{< ref "pubsub-overview.md" >}}) | 在服务之间发布事件和订阅主题，简化事件驱动架构的水平扩展并增强其故障弹性。Dapr 提供至少一次消息传递保证、消息 TTL、消费者组和其他高级功能。
| [**工作流**]({{< ref "workflow-overview.md" >}}) | 工作流 API 可以与其他 Dapr 构建块结合使用，定义跨多个微服务的长时间运行、持久化的流程或数据流，使用 Dapr 工作流或工作流组件。
| [**状态管理**]({{< ref "state-management-overview.md" >}}) | 通过状态管理存储和查询键/值对，您可以轻松地在应用中编写长时间运行、高可用的有状态服务和无状态服务。状态存储是可插拔的，示例包括 AWS DynamoDB、Azure Cosmos DB、Azure SQL Server、GCP Firebase、PostgreSQL 或 Redis 等。
| [**资源绑定**]({{< ref "bindings-overview.md" >}}) | 资源绑定与触发器在事件驱动架构上进一步构建，以通过接收和发送事件到任何外部源（如数据库、队列、文件系统等）来实现扩展和弹性。
| [**Actors**]({{< ref "actors-overview.md" >}}) | 一种用于有状态和无状态对象的模式，使并发变得简单，具有方法和状态封装。Dapr 在其 actor 运行时中提供许多功能，包括并发、状态和生命周期管理，用于 actor 激活/停用，以及定时器和提醒以唤醒 actor。
| [**Secrets**]({{< ref "secrets-overview.md" >}}) | 秘密管理 API 与公共云和本地秘密存储集成，以检索用于应用代码的秘密。
| [**Configuration**]({{< ref "configuration-api-overview.md" >}})  | 配置 API 使您能够从配置存储中检索和订阅应用配置项。
| [**分布式锁**]({{< ref "distributed-lock-api-overview.md" >}})  | 分布式锁 API 使您的应用能够获取任何资源的锁，从而在锁被应用释放或租约超时发生之前，给予其独占访问权限。
| [**Cryptography**]({{< ref "cryptography-overview.md" >}}) | 加密 API 提供了一个在安全基础设施（如密钥库）之上的抽象层。它包含允许您执行加密操作的 API，如加密和解密消息，而不将密钥暴露给您的应用。
| [**Jobs**]({{< ref "jobs-overview.md" >}}) | 作业 API 使您能够在特定时间或间隔安排作业。
| [**Conversation**]({{< ref "conversation-overview.md" >}}) | 对话 API 使您能够抽象与大型语言模型（LLM）交互的复杂性，并包括提示缓存和个人身份信息（PII）模糊化等功能。使用[对话组件]({{< ref supported-conversation >}})，您可以提供提示与不同的 LLM 进行对话。

### 跨领域 API

除了其构建块，Dapr 还提供适用于您使用的所有构建块的跨领域 API。

| 构建块 | 描述 |
|----------------|-------------|
|  [**弹性**]({{< ref "resiliency-concept.md" >}}) | Dapr 提供通过弹性规范定义和应用容错弹性策略的能力。支持的规范定义了弹性模式的策略，如超时、重试/回退和断路器。
|  [**可观测性**]({{< ref "observability-concept.md" >}}) | Dapr 发出指标、日志和跟踪以调试和监控 Dapr 和用户应用。Dapr 支持分布式跟踪，以便使用 W3C Trace Context 标准和 Open Telemetry 轻松诊断和服务生产中的服务间调用，并发送到不同的监控工具。
|  [**安全性**]({{< ref "security-concept.md" >}}) | Dapr 支持使用 Dapr 控制平面 Sentry 服务在 Dapr 实例之间的通信进行传输加密。您可以引入自己的证书，或让 Dapr 自动创建和持久化自签名根和颁发者证书。

## Sidecar 架构

Dapr 以 sidecar 架构暴露其 HTTP 和 gRPC API，作为容器或进程，不需要应用代码包含任何 Dapr 运行时代码。这使得从其他运行时集成 Dapr 变得容易，同时提供应用逻辑的分离以提高支持性。

<img src="/images/overview-sidecar-model.png" width=900>

## 托管环境

Dapr 可以在多种环境中托管，包括：
- 在 Windows/Linux/macOS 机器上自托管用于本地开发和生产
- 在 Kubernetes 或物理或虚拟机集群上用于生产

### 自托管本地开发

在[自托管模式]({{< ref self-hosted-overview.md >}})中，Dapr 作为一个独立的 sidecar 进程运行，您的服务代码可以通过 HTTP 或 gRPC 调用。每个运行的服务都有一个 Dapr 运行时进程（或 sidecar），配置为使用状态存储、pub/sub、绑定组件和其他构建块。

您可以使用 [Dapr CLI](https://github.com/dapr/cli#launch-dapr-and-your-app) 在本地机器上运行启用 Dapr 的应用。在下图中，Dapr 的本地开发环境通过 CLI `init` 命令进行配置。通过[入门示例]({{< ref getting-started >}})尝试一下。

<img src="/images/overview-standalone.png" width=1200 alt="Dapr 自托管模式的架构图">

### Kubernetes

Kubernetes 可以用于：
- 本地开发（例如，使用 [minikube](https://minikube.sigs.k8s.io/docs/) 和 [k3S](https://k3s.io/)），或
- 在[生产]({{< ref kubernetes >}})中。

在 Kubernetes 等容器托管环境中，Dapr 作为 sidecar 容器与应用容器在同一个 pod 中运行。

Dapr 的 `dapr-sidecar-injector` 和 `dapr-operator` 控制平面服务提供一流的集成：
- 在与服务容器相同的 pod 中启动 Dapr 作为 sidecar 容器
- 提供集群中 Dapr 组件更新的通知

<!-- IGNORE_LINKS -->
`dapr-sentry` 服务是一个证书颁发机构，启用 Dapr sidecar 实例之间的相互 TLS 以实现安全数据加密，并通过 [Spiffe](https://spiffe.io/) 提供身份。有关 `Sentry` 服务的更多信息，请阅读[安全概述]({{< ref "security-concept.md#dapr-to-dapr-communication" >}})
<!-- END_IGNORE -->

将启用 Dapr 的应用部署并运行到您的 Kubernetes 集群中，只需在部署方案中添加几个注释即可。访问 [Dapr on Kubernetes 文档]({{< ref kubernetes >}})。

<img src="/images/overview-kubernetes.png" width=1200 alt="Dapr 在 Kubernetes 模式下的架构图">

### 物理或虚拟机集群

Dapr 控制平面服务可以在生产中以高可用性（HA）模式部署到物理或虚拟机集群中。在下图中，actor `Placement` 和安全 `Sentry` 服务在三台不同的虚拟机上启动，以提供 HA 控制平面。为了为集群中运行的应用提供使用 DNS 的名称解析，Dapr 默认使用多播 DNS，但也可以选择支持 [Hashicorp Consul 服务]({{< ref setup-nr-consul >}})。

<img src="/images/overview-vms-hosting.png" width=1200 alt="Dapr 控制平面和 Consul 部署到高可用性模式下的虚拟机的架构图">

## 开发者语言 SDK 和框架

Dapr 提供多种 SDK 和框架，使您能够轻松地用您喜欢的语言开始使用 Dapr 进行开发。

### Dapr SDK

为了使 Dapr 在不同语言中使用更自然，它还包括[特定语言的 SDK]({{< ref sdks >}})：
- Go
- Java
- JavaScript
- .NET
- PHP
- Python

这些 SDK 通过类型化语言 API 暴露 Dapr 构建块的功能，而不是调用 http/gRPC API。这使您能够用您选择的语言编写无状态和有状态函数和 actor 的组合。由于这些 SDK 共享 Dapr 运行时，您可以获得跨语言的 actor 和函数支持。

### 开发者框架

Dapr 可以从任何开发者框架中使用。以下是一些已与 Dapr 集成的框架：

#### Web

| 语言 | 框架 | 描述 |
|----------|------------|-------------|
| [.NET]({{< ref dotnet >}}) | [ASP.NET Core](https://github.com/dapr/dotnet-sdk/tree/master/examples/AspNetCore) | 提供响应来自其他服务的 pub/sub 事件的有状态路由控制器。还可以利用 [ASP.NET Core gRPC 服务](https://docs.microsoft.com/aspnet/core/grpc/)。
| [Java]({{< ref java >}}) | [Spring Boot](https://spring.io/) | 使用 Dapr API 构建 Spring Boot 应用
| [Python]({{< ref python >}}) | [Flask]({{< ref python-flask.md >}}) | 使用 Dapr API 构建 Flask 应用
| [JavaScript](https://github.com/dapr/js-sdk) | [Express](https://expressjs.com/) | 使用 Dapr API 构建 Express 应用
| [PHP]({{< ref php >}}) | | 您可以使用 Apache、Nginx 或 Caddyserver 提供服务。

#### 集成和扩展

访问[集成]({{< ref integrations >}})页面，了解 Dapr 对各种框架和外部产品的一流支持，包括：
- 公共云服务，如 Azure 和 AWS
- Visual Studio Code
- GitHub

## 为操作而设计

Dapr 是为[操作]({{< ref operations >}})和安全性而设计的。Dapr 的 sidecar、运行时、组件和配置都可以轻松且安全地管理和部署，以满足您组织的需求。

通过 Dapr CLI 安装的[仪表板](https://github.com/dapr/dashboard)提供了一个基于 Web 的 UI，使您能够查看信息、查看日志等，以运行 Dapr 应用。

Dapr 支持[监控工具]({{< ref observability >}})，以便更深入地了解 Dapr 系统服务和 sidecar，而 Dapr 的[可观测性功能]({{< ref "observability-concept.md" >}})提供了对您的应用的洞察，如跟踪和指标。
`