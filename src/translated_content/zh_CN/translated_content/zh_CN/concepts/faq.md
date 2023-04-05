---
type: docs
title: "常见问题及解答"
linkTitle: "常见问题"
weight: 1000
description: "关于 Dapr 的常见问题"
---

## How does Dapr compare to service meshes such as Istio, Linkerd or OSM?
Dapr is not a service mesh. While service meshes focus on fine-grained network control, Dapr is focused on helping developers build distributed applications. Both Dapr and service meshes use the sidecar pattern and run alongside the application. They do have some overlapping features, but also offer unique benefits. For more information please read the [Dapr & service meshes]({{<ref service-mesh>}}) concept page.

## 性能基准
Dapr 项目专注于性能，因为 Dapr 是应用程序的 sidecar。 请参阅[这里]({{< ref perf-service-invocation.md >}})以获取最新的性能数字。

## Actors

### What is the relationship between Dapr, Orleans and Service Fabric Reliable Actors?

Dapr 中的 Actor 基于 [Orleans](https://www.microsoft.com/research/project/orleans-virtual-actors/) 开始的相同 virtual actors 概念，这意味着它们在被调用时被激活并在一段时间后被停用。 如果您熟悉 Orleans，那你就会很熟悉 Dapr 中 C# actor。 Dapr C# actor 基于 [Service Fabric Reliable Actor](https://docs. microsoft. com/azure/service-fabric/service-fabric-reliable-actors-introduction) （也来自Orleans），使你能够在 Service Fabric 中获取 Reliable Actor 并将其迁移到其他托管平台，如 Kubernetes 或其他本地环境。 Dapr 不仅仅是 Actors。 它为您提供了一套最佳实践构建块，以构建到任何微服务应用程序中。 请参阅 [Dapr 概述]({{< ref overview.md >}})。

### Dapr 和 actor 框架之间的差异

Virtual actors 功能是 Dapr 在其运行时提供的构建块之一。 对于 Dapr，因为它使用 http/gRPC API 对语言无关，因此可以从任何语言调用 actors。 这允许用一种语言编写的 actors 调用以不同语言编写的 actors。

通过本地调用来创建一个新的 actor ，比如`http://localhost:3500/v1.0/actors/<actorType>/<actorId>/…`。 例如， `http://localhost:3500/v1.0/actors/myactor/50/method/getData` 将在新创建的 id 为`50`的 `myactor` 上调用 `getData` 方法。

Dapr 运行时 SDK 具有特定于语言的 actor 框架。 例如，.NET SDK 具有 C# Actors。 目标是所有 Dapr 语言 SDK 都具有 Actor 框架。 目前，.NET，Java，Go 和 Python SDK 都有 actor 框架。

### 如果我想使用特定的编程语言或框架，Dapr 是否有任何 SDK 可以使用？

为了使不同语言使用 Dapr 更加自然，它包括 [特定语言的 SDK]({{<ref sdks>}}) 用于 Go、Java、JavaScript、.NET、Python、PHP、Rust 和 C++。 这些 SDK 通过类型化的语言 API 而不是通过调用 API 来使用 Dapr 构建块中的功能，例如，保存状态，发布事件或创建 actor。 这使您能够用您选择的语言编写无状态和有状态函数以及actor的组合。 由于这些 SDK 共享 Dapr 运行时，因此您可以获得跨语言 actor 和功能支持。

### Dapr 集成了哪些框架?
Dapr 可以与任何开发者框架集成。 例如，在 Dapr .NET SDK 中，您可以与 ASP.NET Core 集成，它带来了有状态的路由控制器来响应来自其他服务的 pub/sub 事件。

Dapr 集成了以下框架：

- Logic Apps with Dapr [Workflows](https://github.com/dapr/workflows)
- 使用 Dapr [Azure Functions Extension](https://github.com/dapr/azure-functions-extension) 的函数
- Java SDK 中的 Spring Boot Web 应用
- .NET SDK 中的 ASP.NET Core
- [Azure API 管理](https://cloudblogs.microsoft.com/opensource/2020/09/22/announcing-dapr-integration-azure-api-management-service-apim/)
