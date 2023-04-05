---
type: docs
title: "常见问题及解答"
linkTitle: "FAQs"
weight: 1000
description: "关于 Dapr 的常见问题"
---

## Dapr 与 Istio 、Linkerd 或 OSM 等服务网格相比如何？
Dapr 不是一个服务网格。 虽然服务网侧重于细粒度网络控制，但 Dapr 专注于帮助开发人员构建分布式应用程序。 Dapr 和服务网格都使用 sidecar 模式，并随应用程序一起运行。 它们确实具有一些重叠的功能，但也提供独特的优势。 欲了解更多信息，请阅读 [Dapr & 服务网格]({{<ref service-mesh>}}) 概念页面。

## 性能基准
Dapr项目的重点是性能，因为其固有的讨论是Dapr作为您的应用程序的侧面。 请参阅 [这里]({{< ref perf-service-invocation.md >}}) 以获取最新的性能数字。

## Actors

### Dapr，Orleans 和 Service Fabric Reliable Actors之间的关系是什么?

Dapr 中的Actors基于同一个虚拟Actor概念， [Orleans](https://www.microsoft.com/research/project/orleans-virtual-actors/) ，简单来说，当被调用时就会被激活，一段时间后就会被停用。 如果您熟悉Orleans，那你就会很熟悉Dapr中 C# 的actor。 Dapr C# actor 基于 [Service Fabric Reliable Actor](https://docs. microsoft. com/azure/service-fabric/service-fabric-reliable-actors-introduction) （也来自Orleans），使你能够在 Service Fabric 中获取 Reliable Actor 并将其迁移到其他托管平台，如 Kubernetes 或其他本地环境。 Dapr 不仅仅是Actors。 它为您提供了一套最佳实践构建模块，以构建到任何微服务应用程序中。 请参阅 [Dapr 概述]({{< ref overview.md >}})。

### Actor 框架与 Dapr 之间的差异

虚拟 actors 功能是 Dapr 在其运行时提供的构建块之一。 对于 Dapr，因为它使用 http/gRPC API 对语言无关，因此可以从任何语言调用actors。 这允许用一种语言编写的actors调用以不同语言编写的actors。

通过本地调用来创建一个新的 actor ，比如`http://localhost:3500/v1.0/actors/<actorType>/<actorId>/…`。 例如， `http://localhost:3500/v1.0/actors/myactor/50/method/getData` 将在新创建的以 id 为`50`的 `myactor` 上调用 `getData` 方法。

Dapr 运行时 SDK 具有特定于语言的 actor 框架。 例如，.NET SDK 具有 C# Actors。 目标是所有 Dapr 语言 SDK 都具有Actor架。 目前，.NET，Java，Go 和 Python SDK 都有 actor 框架。

## 开发者语言 SDK 和框架

### 如果我想使用特定的编程语言或框架，Dapr是否有任何SDK可以使用？

为了使不同语言使用 Dapr 更加自然，它包括 [特定语言的 SDK]({{<ref sdks>}}) 用于 Go、Java、JavaScript、.NET、Python、PHP、Rust 和C++。 这些 SDK 通过类型化的语言 API 而不是通过调用 API 来使用 Dapr 构建块中的功能，例如，保存状态，发布事件或创建Actor。 这使您能够用您选择的语言编写无状态和状态功能以及 Actors 的组合。 由于这些 SDK 共享 Dapr 运行时，因此您可以获得跨语言 actor 和功能支持。

### Dapr 集成了哪些框架?
Dapr 可以与任何开发者框架集成。 例如，在 Dapr .NET SDK 中，您可以与 ASP.NET Core集成，它带来了有状态的路由控制器来响应来自其他服务的 pub/sub 事件。

Dapr 集成了以下框架：

- 基于Dapr[工作流](https://github.com/dapr/workflows)的 Logic Apps
- 基于 Dapr[Azure Functions Extension](https://github.com/dapr/azure-functions-extension)的函数
- Java SDK中的Spring Boot Web应用
- .NET SDK中的ASP.NET Core
- [Azure API 管理](https://cloudblogs.microsoft.com/opensource/2020/09/22/announcing-dapr-integration-azure-api-management-service-apim/)
