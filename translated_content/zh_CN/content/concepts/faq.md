---
type: docs
title: "常见问题及解答"
linkTitle: "FAQs"
weight: 1000
description: "关于 Dapr 的常见问题"
---

## Dapr 与 Istio 、Linkerd 或 OSM 等服务网格相比如何？
Dapr 不是一个服务网格。 While service meshes focus on fine-grained network control, Dapr is focused on helping developers build distributed applications. Both Dapr and service meshes use the sidecar pattern and run alongside the application. They do have some overlapping features, but also offer unique benefits. 欲了解更多信息，请阅读 [Dapr & 服务网格]({{<ref service-mesh>}}) 概念页面。

## 性能基准
Dapr项目的重点是性能，因为其固有的讨论是Dapr作为您的应用程序的侧面。 请参阅 [这里]({{< ref perf-service-invocation.md >}}) 以获取最新的性能数字。

## Actors

### Dapr，Orleans 和 Service Fabric Reliable Actors之间的关系是什么?

Dapr 中的Actors基于同一个虚拟Actor概念， [Orleans](https://www.microsoft.com/research/project/orleans-virtual-actors/) ，简单来说，当被调用时就会被激活，一段时间后就会被停用。 如果您熟悉Orleans，那你就会很熟悉Dapr中 C# 的actor。 Dapr C# actors are based on [Service Fabric Reliable Actors](https://docs.microsoft.com/azure/service-fabric/service-fabric-reliable-actors-introduction) (which also came from Orleans) and enable you to take Reliable Actors in Service Fabric and migrate them to other hosting platforms such as Kubernetes or other on-premisis environments. Moreover, Dapr is about more than just actors. It provides you with a set of best-practice building blocks to build into any microservices application. 请参阅 [Dapr 概述]({{< ref overview.md >}})。

### Differences between Dapr and an actor framework

Virtual actor capabilities are one of the building blocks that Dapr provides in its runtime. With Dapr, because it is programming-language agnostic with an http/gRPC API, the actors can be called from any language. 这允许用一种语言编写的actors调用以不同语言编写的actors。

Creating a new actor follows a local call like `http://localhost:3500/v1.0/actors/<actorType>/<actorId>/…`. For example, `http://localhost:3500/v1.0/actors/myactor/50/method/getData` calls the `getData` method on the newly created `myactor` with id `50`.

The Dapr runtime SDKs have language-specific actor frameworks. For example, the .NET SDK has C# actors. 目标是所有 Dapr 语言 SDK 都具有Actor架。 当前 .NET， Java 和 Python SDK 具有Actor框架。

## 开发者语言 SDK 和框架

### Does Dapr have any SDKs I can use if I want to work with a particular programming language or framework?

为了使不同语言使用 Dapr 更加自然，它包括 [特定语言的 SDK]({{<ref sdks>}}) 用于 Go、Java、JavaScript、.NET、Python、PHP、Rust 和C++。 These SDKs expose the functionality in the Dapr building blocks, such as saving state, publishing an event or creating an actor, through a typed language API rather than calling the http/gRPC API. This enables you to write a combination of stateless and stateful functions and actors all in the language of your choice. 由于这些 SDK 共享 Dapr 运行时，因此您可以获得跨语言 actor 和功能支持。

### What frameworks does Dapr integrate with?
Dapr 可以与任何开发者框架集成。 例如，在 Dapr .NET SDK 中，您可以与 ASP.NET Core集成，它带来了有状态的路由控制器来响应来自其他服务的 pub/sub 事件。

Dapr 集成了以下框架：

- 基于Dapr[工作流](https://github.com/dapr/workflows)的 Logic Apps
- 基于 Dapr[Azure Functions Extension](https://github.com/dapr/azure-functions-extension)的函数
- Java SDK中的Spring Boot Web应用
- .NET SDK中的ASP.NET Core
- [Azure API 管理](https://cloudblogs.microsoft.com/opensource/2020/09/22/announcing-dapr-integration-azure-api-management-service-apim/)
