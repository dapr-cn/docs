---
type: docs
title: "常见问题及解答"
linkTitle: "常见问题"
weight: 1000
description: "关于 Dapr 的常见问题"
---

## Dapr 与 Istio 、Linkerd 或 OSM 等服务网格相比如何？
Dapr 不是服务网格。 服务网格专注于细粒度的网络控制，而 Dapr 则专注于帮助开发者构建分布式应用。 Dapr 和服务网格都使用 sidecar 模式，并随应用程序一起运行。 它们确实具有一些重叠的功能，但也提供独特的优势。 有关更多信息，请阅读 [Dapr & 服务网格]({{<ref service-mesh>}})概念页面。

## 性能基准
Dapr 项目专注于性能，因为在固有的讨论中 Dapr 是应用程序的 sidecar。 请参阅[这里]({{< ref perf-service-invocation.md >}})以获取最新的性能数字。

## Actors

### Dapr，Orleans 和 Service Fabric Reliable Actors 之间的关系是什么?

Dapr中 的Actor 基于相同的由 [Orleans](https://www.microsoft.com/research/project/orleans-virtual-actors/) 开启的虚拟 actor 的概念，这意味着它们在被调用时被激活，并在一段时间后停用。 如果您熟悉 Orleans，那你就会很熟悉 Dapr C# actor。 Dapr C# Actors 基于 [Service Fabric Reliable Actors](https://docs.microsoft.com/azure/service-fabric/service-fabric-reliable-actors-introduction) (也来自 Orleans) ，使您能够在 Service Fabric 中使用 Reliable Actors ，并将其迁移到其他托管平台，例如 Kubernetes 或其他本地环境。 此外，Dapr不仅仅是 actor。 它为您提供了一套最佳实践构建块，以构建任何微服务应用。 请参阅 [Dapr 概述]({{< ref overview.md >}})。

### Dapr 和 actor 框架之间的差异

虚拟 actors 功能是 Dapr 在其运行时提供的构建块之一。 对于 Dapr，因为它使用 http/gRPC API ，与语言无关，因此可以从任何语言调用 actor。 这允许用一种语言编写的 actor 调用以不同语言编写的 actor。

通过本地调用来创建一个新的 actor ，比如`http://localhost:3500/v1.0/actors/<actorType>/<actorId>/…`。 例如， `http://localhost:3500/v1.0/actors/myactor/50/method/getData` 将在新创建的 id 为`50`的 `myactor` 上调用 `getData` 方法。

Dapr 运行时 SDK 具有特定于语言的 actor 框架。 例如，.NET SDK 具有 C# Actors。 目标是所有 Dapr 语言 SDK 都具有Actor框架。 目前，.NET，Java，Go 和 Python SDK 都有 actor 框架。

## 开发者语言 SDK 和框架

### 如果我想使用特定的编程语言或框架，Dapr 是否有 SDK 可供使用？

为了让不同语言更加自然的使用 Dapr ，Dapr 为 Go、Java、JavaScript、.NET、Python、PHP、Rust 和 C++ 提供了[特定语言 SDK]({{<ref sdks>}}) 。 这些 SDK 通过类型化的语言 API 来使用 Dapr 构建块中的功能，例如保存状态，发布事件或创建Actor，而不是通过调用 http/gRPC API 。 这使您能够用您选择的语言编写无状态和有状态函数以及 Actor 的组合。 而且，由于这些SDK共享 Dapr 运行时，你可以得到跨语言的 actor 和函数支持。

### Dapr 集成了哪些框架?
Dapr 可以与任何开发者框架集成。 例如，在 Dapr .NET SDK 中，您可以与 ASP.NET Core 集成，它带来了有状态的路由控制器，对来自其他服务的 pub/sub 事件作出响应。

Dapr 集成了以下框架：

- 集成 Dapr [Workflows ](https://github.com/dapr/workflows)的 Logic Apps
- 集成 Dapr [Azure Functions Extension](https://github.com/dapr/azure-functions-extension) 的函数
- Java SDK 中的 Spring Boot Web 应用
- .NET SDK 中的 ASP.NET Core
- [Azure API 管理](https://cloudblogs.microsoft.com/opensource/2020/09/22/announcing-dapr-integration-azure-api-management-service-apim/)
