---
type: docs
title: "常见问题及解答"
linkTitle: "FAQs"
weight: 1000
description: "关于 Dapr 的常见问题"
---

## 网络和服务网格：

### 了解 Dapr 如何使用服务网格

Dapr 是分布式应用程序运行时。  与专注于网络问题的服务网络不同， Dapr 专注于提供构建块，使开发者更容易构建微服务。  Dapr 以开发者为中心，服务网格以基础设施为中心。

Dapr可以与任何服务网格（如Istio和Linkerd）一起使用。 服务网格是专用的网络设施层，旨在将服务彼此连接并提供有见地的遥测数据。 服务网格不会向应用程序引入新功能。

这就是Dapr所要解决的。 Dapr是建立在http和gRPC基础上与语言无关的编程模型，它通过开放 API 提供分布式系统构建块，用于异步 pub-sub、有状态服务、服务发现和调用、Actor和分布式跟踪。 Dapr 将新功能引入到应用程序的运行时。 服务网格和 Dapr 都作为针对应用程序的 sidecar 服务运行，一个提供网络功能部件，另一个则提供分布式应用程序功能。

观看关于 Dapr 和服务网格如何协同工作的 [视频](https://www.youtube.com/watch?v=xxU68ewRmz8&feature=youtu.be&t=140)。

### 了解 Dapr 如何与服务网格接口 (SMI) 进行互操作

SMI 是一个抽象层，它提供跨不同服务网格技术的公共 API 。  Dapr 可以利用包括 SMI在内的任何服务网格技术。

### Dapr， Istio 和 Linkerd 之间的差异

阅读 [Dapr 如何使用服务网?](https://github.com/dapr/dapr/wiki/FAQ#how-does-dapr-work-with-service-meshes) Istio是一个开源的服务网状结构实现，主要关注服务之间的7层路由、流量管理和mTLS认证。 Istio使用边车来拦截进出容器的流量，并对它们执行一套网络策略。

Istio 不是编程模型，不关注应用程序级别的功能，如状态管理， pub-sub，绑定等。 这就是Dapr所要解决的。

## 性能基准
Dapr项目专注于性能，因为 Dapr 作为您的应用程序的 sidecar ，性能是一个经常被讨论的话题。 请参阅 [这里]({{< ref perf-service-invocation.md >}}) 以获取最新的性能数字。

## Actors

### Dapr，Orleans 和 Service Fabric Reliable Actors之间的关系是什么?

Dapr 中的Actors基于同一个虚拟Actor概念， [Orleans](https://www.microsoft.com/research/project/orleans-virtual-actors/) ，简单来说，当被调用时就会被激活，一段时间后就会被停用。 如果您熟悉Orleans，那你就会很熟悉Dapr中 C# 的actor。 Dapr C# Actors 基于 [Service Fabric Reliable Actors](https://docs.microsoft.com/azure/service-fabric/service-fabric-reliable-actors-introduction) (也来自Orleans) ，使您能够在 Service Fabric 中使用 Reliable Actors ，并将其迁移到其他托管平台，例如 Kubernetes 或其他本地环境。 Dapr 不仅仅是Actors。 它为您提供了一套最佳实践构建模块，以构建到任何微服务应用程序中。 请参阅 [Dapr 概述]({{< ref overview.md >}})。

### Actor 框架与 Dapr 之间的差异

虚拟 actors 功能是 Dapr 在其运行时提供的构建块之一。 对于 Dapr，因为它使用 http/gRPC API 对语言无关，因此可以从任何语言调用actors。 这允许用一种语言编写的actors调用以不同语言编写的actors。

创建一个新的actor遵循本地调用，如`http://localhost:3500/v1.0/actors/<actorType>/<actorId>/…`, 比如 `http://localhost:3500/v1.0/actors/myactor/50/method/getData` ，就是在新创建的 id 等于 `50` 的 `myactor ` 的 actor 上调用 `getData` 方法。

Dapr 运行时 SDK 具有特定于语言的 actor 框架。 例如， .NET SDK 具有 C# Actors。 目标是所有 Dapr 语言 SDK 都具有Actor架。 当前 .NET， Java 和 Python SDK 具有Actor框架。

## 开发者语言 SDK 和框架

### 如果我想使用特定的编程语言或框架，Dapr是否有任何语言的SDK？

为了使不同语言使用 Dapr 更加自然，它包括 [特定语言的 SDK]({{X32X}}) 用于 Go、Java、JavaScript、.NET、Python、PHP、Rust 和C++。

这些 SDK 通过类型化的语言 API 而不是通过调用 API 来使用 Dapr 构建块中的功能，例如，保存状态，发布事件或创建Actor。 这使您能够以自己选择的语言编写无状态和有状态功能和 actors 的组合。 由于这些 SDK 共享 Dapr 运行时，因此您可以获得跨语言 actor 和功能支持。

### Dapr 集成了哪些框架?
Dapr 可以与任何开发者框架集成。 例如，在 Dapr .NET SDK 中，您可以与 ASP.NET Core集成，它带来了有状态的路由控制器来响应来自其他服务的 pub/sub 事件。

Dapr 集成了以下框架：

- 基于Dapr[工作流](https://github.com/dapr/workflows)的 Logic Apps
- 基于 Dapr[Azure Functions Extension](https://github.com/dapr/azure-functions-extension)的函数
- Java SDK中的Spring Boot Web应用
- .NET SDK中的ASP.NET Core
- [Azure API 管理](https://cloudblogs.microsoft.com/opensource/2020/09/22/announcing-dapr-integration-azure-api-management-service-apim/)
