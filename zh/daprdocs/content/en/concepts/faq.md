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

The actors in Dapr are based on the same virtual actor concept that [Orleans](https://www.microsoft.com/research/project/orleans-virtual-actors/) started, meaning that they are activated when called and deactivated after a period of time. If you are familiar with Orleans, Dapr C# actors will be familiar. Dapr C# actors are based on [Service Fabric Reliable Actors](https://docs.microsoft.com/azure/service-fabric/service-fabric-reliable-actors-introduction) (which also came from Orleans) and enable you to take Reliable Actors in Service Fabric and migrate them to other hosting platforms such as Kubernetes or other on-premise environments. Also Dapr is about more than just actors. It provides you with a set of best practice building blocks to build into any microservices application. See [Dapr overview](https://github.com/dapr/docs/blob/master/overview/README.md).

### Differences between Dapr from an actor framework

Virtual actors capabilities are one of the building blocks that Dapr provides in its runtime. With Dapr because it is programming language agnostic with an http/gRPC API, the actors can be called from any language. This allows actors written in one language to invoke actors written in a different language.

Creating a new actor follows a local call like `http://localhost:3500/v1.0/actors/<actorType>/<actorId>/…`, for example `http://localhost:3500/v1.0/actors/myactor/50/method/getData` to call the `getData` method on the newly created `myactor` with id `50`.

The Dapr runtime SDKs have language specific actor frameworks. The .NET SDK for example has C# actors. The goal is for all the Dapr language SDKs to have an actor framework. Currently .NET, Java and Python SDK have actor frameworks.

## Developer language SDKs and frameworks

### Does Dapr have any SDKs if I want to work with a particular programming language or framework?

To make using Dapr more natural for different languages, it includes language specific SDKs for Go, Java, JavaScript, .NET,  Python, Rust and C++.

These SDKs expose the functionality in the Dapr building blocks, such as saving state, publishing an event or creating an actor, through a typed, language API rather than calling the http/gRPC API. This enables you to write a combination of stateless and stateful functions and actors all in the language of their choice. And because these SDKs share the Dapr runtime, you get cross-language actor and functions support.

### What frameworks does Dapr integrated with?
Dapr can be integrated with any developer framework. For example, in the Dapr .NET SDK you can find ASP.NET Core integration, which brings stateful routing controllers that respond to pub/sub events from other services.

Dapr is integrated with the following frameworks;

- Logic Apps with Dapr [Workflows](https://github.com/dapr/workflows)
- Functions with Dapr [Azure Functions Extension](https://github.com/dapr/azure-functions-extension)
- Spring Boot Web apps in Java SDK
- ASP.NET Core in .NET SDK
- [Azure API Management](https://cloudblogs.microsoft.com/opensource/2020/09/22/announcing-dapr-integration-azure-api-management-service-apim/)
