---
type: docs
title: "Dapr 常见问题解答"
linkTitle: "常见问题"
weight: 100
description: "关于 Dapr 的常见问题"
---

## Dapr 与 Istio、Linkerd 或 OSM 等服务网格有何不同？
Dapr 并非服务网格。服务网格主要关注细粒度的网络控制，而 Dapr 则致力于帮助开发人员构建分布式应用程序。Dapr 和服务网格都采用 sidecar 模式，与应用程序共同运行。虽然它们有一些功能重叠，但各自也提供了独特的优势。有关更多信息，请阅读 [Dapr & 服务网格]({{<ref service-mesh>}}) 概念页面。

## 性能基准
由于 Dapr 作为应用程序的 sidecar，Dapr 项目对性能非常重视。请参阅 [此处]({{< ref perf-service-invocation.md >}}) 以获取最新的性能数据。

## actors

### Dapr、Orleans 和 Service Fabric Reliable Actors 之间有什么关系？

Dapr 中的 actors 源于 [Orleans](https://www.microsoft.com/research/project/orleans-virtual-actors/) 的虚拟 actor 概念，这意味着它们在被调用时会激活，并在一段时间后自动停用。如果您熟悉 Orleans，Dapr 的 C# actors 会让您感到熟悉。Dapr 的 C# actors 基于 [Service Fabric Reliable Actors](https://docs.microsoft.com/azure/service-fabric/service-fabric-reliable-actors-introduction)（同样源于 Orleans），这使得您可以将 Service Fabric 中的 Reliable Actors 迁移到其他托管平台，如 Kubernetes 或其他本地环境。此外，Dapr 不仅仅局限于 actors。它为您提供了一套最佳实践的构建模块，可以集成到任何微服务应用程序中。请参阅 [Dapr 概述]({{< ref overview.md >}})。

### Dapr 与其他 actor 框架有何区别？

虚拟 actor 功能是 Dapr 运行时提供的众多构建模块之一。由于 Dapr 是编程语言无关的，并提供 http/gRPC API，因此可以从任何语言调用 actors。这允许用一种语言编写的 actors 调用用不同语言编写的 actors。

创建新的 actor 类似于本地调用，例如 `http://localhost:3500/v1.0/actors/<actorType>/<actorId>/…`。例如，`http://localhost:3500/v1.0/actors/myactor/50/method/getData` 调用新创建的 `myactor` 的 `getData` 方法，id 为 `50`。

Dapr 运行时 SDK 提供了特定语言的 actor 框架。例如，.NET SDK 提供了 C# actors。目标是让所有 Dapr 语言 SDK 都具备 actor 框架。目前 .NET、Java、Go 和 Python SDK 已具备 actor 框架。

### 如果我想使用特定的编程语言或框架，Dapr 是否有任何 SDK 可以使用？

为了使 Dapr 在不同语言中使用更自然，它包括 Go、Java、JavaScript、.NET、Python、PHP、Rust 和 C++ 的[特定语言 SDK]({{<ref sdks>}})。这些 SDK 通过类型化语言 API 而不是直接调用 http/gRPC API 来提供 Dapr 构建模块的功能，例如保存状态、发布事件或创建 actor。这使您能够用您选择的语言编写无状态和有状态函数及 actors 的组合。并且由于这些 SDK 共享 Dapr 运行时，您可以获得跨语言的 actor 和函数支持。

### Dapr 可以与哪些框架集成？
Dapr 可以与任何开发者框架集成。例如，在 Dapr .NET SDK 中，您可以找到 ASP.NET Core 集成，它提供了响应其他服务的发布/订阅事件的有状态路由控制器。

Dapr 集成了以下框架：

- 使用 Dapr 的函数 [Azure Functions 扩展](https://github.com/dapr/azure-functions-extension)
- Java SDK 中的 Spring Boot Web 应用
- .NET SDK 中的 ASP.NET Core
- [Azure API 管理](https://cloudblogs.microsoft.com/opensource/2020/09/22/announcing-dapr-integration-azure-api-management-service-apim/)
