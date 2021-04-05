---
type: docs
title: "常见问题及解答"
linkTitle: "FAQs"
weight: 1000
description: "关于 Dapr 的常见问题"
---

## How does Dapr compare to service meshes such as Istio, Linkerd or OSM?
Dapr is not a service mesh. While service meshes focus on fine grained network control, Dapr is focused on helping developers build distributed applications. Both Dapr and service meshes use the sidecar pattern and run alongside the application and they do have some overlapping features but also offer unique benefits. For more information please read the [Dapr & service meshes]({{X13X}}) concept page.

## 性能基准
The Dapr project is focused on performance due to the inherent discussion of Dapr being a sidecar to your application. See [here]({{< ref perf-service-invocation.md >}}) for updated performance numbers.

## Actors

### What is the relationship between Dapr, Orleans and Service Fabric Reliable Actors?

The actors in Dapr are based on the same virtual actor concept that [Orleans](https://www.microsoft.com/research/project/orleans-virtual-actors/) started, meaning that they are activated when called and deactivated after a period of time. If you are familiar with Orleans, Dapr C# actors will be familiar. Dapr C# actors are based on [Service Fabric Reliable Actors](https://docs.microsoft.com/azure/service-fabric/service-fabric-reliable-actors-introduction) (which also came from Orleans) and enable you to take Reliable Actors in Service Fabric and migrate them to other hosting platforms such as Kubernetes or other on-premise environments. Also Dapr is about more than just actors. It provides you with a set of best practice building blocks to build into any microservices application. See [Dapr overview]({{< ref overview.md >}}).

### Differences between Dapr from an actor framework

Virtual actors capabilities are one of the building blocks that Dapr provides in its runtime. With Dapr because it is programming language agnostic with an http/gRPC API, the actors can be called from any language. This allows actors written in one language to invoke actors written in a different language.

Creating a new actor follows a local call like `http://localhost:3500/v1.0/actors/<actorType>/<actorId>/…`, for example `http://localhost:3500/v1.0/actors/myactor/50/method/getData` to call the `getData` method on the newly created `myactor` with id `50`.

The Dapr runtime SDKs have language specific actor frameworks. The .NET SDK for example has C# actors. The goal is for all the Dapr language SDKs to have an actor framework. Currently .NET, Java and Python SDK have actor frameworks.

## 开发者语言 SDK 和框架

### Does Dapr have any SDKs if I want to work with a particular programming language or framework?

To make using Dapr more natural for different languages, it includes [language specific SDKs]({{X29X}}) for Go, Java, JavaScript, .NET,  Python, PHP, Rust and C++.

These SDKs expose the functionality in the Dapr building blocks, such as saving state, publishing an event or creating an actor, through a typed, language API rather than calling the http/gRPC API. This enables you to write a combination of stateless and stateful functions and actors all in the language of their choice. And because these SDKs share the Dapr runtime, you get cross-language actor and functions support.

### What frameworks does Dapr integrated with?
Dapr can be integrated with any developer framework. For example, in the Dapr .NET SDK you can find ASP.NET Core integration, which brings stateful routing controllers that respond to pub/sub events from other services.

Dapr is integrated with the following frameworks;

- 基于Dapr[工作流](https://github.com/dapr/workflows)的 Logic Apps
- 基于 Dapr[Azure Functions Extension](https://github.com/dapr/azure-functions-extension)的函数
- Java SDK中的Spring Boot Web应用
- .NET SDK中的ASP.NET Core
- [Azure API 管理](https://cloudblogs.microsoft.com/opensource/2020/09/22/announcing-dapr-integration-azure-api-management-service-apim/)
