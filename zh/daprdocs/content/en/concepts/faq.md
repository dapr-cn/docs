---
type: docs
title: "常见问题及解答"
linkTitle: "FAQs"
weight: 1000
description: "关于 Dapr 的常见问题"
---

## 联网和服务网

### 了解 Dapr 如何使用服务网

Dapr 是分布式应用程序运行时。  与专注于网络问题的服务网络不同， Dapr 专注于提供构建块，使开发者更容易构建微服务。  Dapr 以开发者为中心，服务网格以基础架构为中心。

Dapr可以与任何服务网状结构（如Istio和Linkerd）一起使用。 服务网格是专门的网络基础结构层，旨在将服务连接到彼此并提供有洞察力的遥测。 服务网格不会向应用程序引入新功能。

这就是Dapr所要解决的。 Dapr是建立在http和gRPC基础上的语言不可知编程模型，它通过开放的API为异步pub-sub、有状态服务、服务发现和调用、演员和分布式跟踪提供分布式系统构件。 Dapr 将新功能引入到应用程序的运行时。 服务网格和 Dapr 都作为针对应用程序的侧车服务运行，一个提供网络功能部件和另一个分布式应用程序功能。

观看关于 Dapr 和服务网如何协同工作的 [视频](https://www.youtube.com/watch?v=xxU68ewRmz8&feature=youtu.be&t=140)。

### 了解 Dapr 如何与服务网格接口 (SMI) 进行互操作

SMI 是一个抽象层，它提供跨不同服务网格技术的公共 API 表面。  Dapr 可以利用包括 SMI在内的任何服务网格技术。

### Dapr， Istio 和 Linkerd 之间的差异

阅读 [Dapr 如何使用服务网?](https://github.com/dapr/dapr/wiki/FAQ#how-does-dapr-work-with-service-meshes) Istio是一个开源的服务网状结构实现，主要关注服务之间的Layer7路由、流量管理和mTLS认证。 Istio使用sidecar来拦截进出容器的流量，并对它们执行一套网络策略。

Istio 不是编程模型，不关注应用程序级别的功能，如状态管理， pub-sub，绑定等。 这就是Dapr所要解决的。

## 性能基准
Dapr项目的重点是性能，因为其固有的讨论是Dapr作为您的应用程序的侧面。 此 [性能基准视频](https://youtu.be/4kV3SHs1j2k?t=783) 讨论并演示到目前为止所做的工作。 业绩基准数据计划定期公布。 你也可以在自己的环境中运行perf测试来获得perf数字。

## Actors

### Dapr，Orleans 和 Service Fabric Reliable Actors之间的关系是什么?

Dapr 中的Actors基于同一个虚拟Actor概念， [Orleans](https://www.microsoft.com/research/project/orleans-virtual-actors/) ，也就是说，当被调用时就会被激活，一段时间后就会被停用。 如果您熟悉Orleans，Dapr C# 行为者将会很熟悉。 Dapr C# Actors 基于 [Service Fabric Reliable Actors](https://docs.microsoft.com/azure/service-fabric/service-fabric-reliable-actors-introduction) (也来自Orleans) ，使您能够在 Service Fabric 中使用 Reliable Actors ，并将其迁移到其他托管平台，例如 Kubernetes 或其他本地环境。 Dapr 不仅仅是Actors。 它为您提供了一套最佳实践构建模块，以构建到任何微服务应用程序中。 请参阅 * [Actor 概述](https://github.com/dapr/docs/blob/master/overview/README.md).

### 来自参与者框架的 Dapr 之间的差异

虚拟角色功能是 Dapr 在其运行时提供的构建块之一。 对于 Dapr ，因为它是与 API 无关的编程语言，所以可以从任何语言调用参与者。 这允许用一种语言编写的参与者调用以不同语言编写的参与者。

创建一个新的Actor遵循本地调用，如`http://localhost:3500/v1.0/actors/<actorType>/<actorId>/…`, 比如 `http://localhost:3500/v1.0/actors/myactor/50/method/getData` 调用 `getData` 方法，在新创建的 `myactor` 带着id `50`.

Dapr 运行时 SDK 具有特定于语言的参与者框架。 例如， .NET SDK 具有 C# Actors。 目标是所有 Dapr 语言 SDK 都具有Actor架。 当前 .NET， Java 和 Python SDK 具有Actor框架。

## 开发者语言 SDK 和框架

### 如果我想使用特定的编程语言或框架，Dapr是否有任何SDK？

为了使Dapr在不同的语言中使用更加自然，它包括了针对Go、Java、JavaScript、.NET、Python、Rust和C++的语言专用SDK。

这些 SDK 通过类型化的语言 API 而不是调用 API 来显示 Dapr 构建块中的功能，例如，保存状态，发布事件或创建Actor。 这使您能够以自己选择的语言编写无状态和有状态功能和参与者的组合。 由于这些 SDK 共享 Dapr 运行时，因此您可以获得跨语言参与者和功能支持。

### Dapr 集成了哪些框架?
Dapr 可以与任何开发者框架集成。 例如，在 Dapr .NET SDK 中，您可以找到 ASP.NET 核心集成，它带来了有状态的路由控制器来响应来自其他服务的 pub/sub 事件。

Dapr 集成了以下框架;

- 使用Dapr的逻辑应用程序 [Workflows](https://github.com/dapr/workflows)
- Functions with Dapr [Azure Functions Extension](https://github.com/dapr/azure-functions-extension)
- Java SDK中的Spring Boot Web应用
- .NET SDK中的ASP.NET Core
- [Azure API Management](https://cloudblogs.microsoft.com/opensource/2020/09/22/announcing-dapr-integration-azure-api-management-service-apim/)
