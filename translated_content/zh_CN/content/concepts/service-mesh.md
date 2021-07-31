---
type: docs
title: "Dapr 和服务网格"
linkTitle: "服务网格"
weight: 100
description: >
  How Dapr compares to, and works with, service meshes
---

Dapr uses a sidecar architecture, running as a separate process alongside the application and includes features such as service invocation, network security, and distributed tracing. This often raises the question: how does Dapr compare to service mesh solutions such as Linkerd, Istio and Open Service Mesh (OSM)?

## Dapr 和服务网格的比较
While Dapr and service meshes do offer some overlapping capabilities, **Dapr is not a service mesh**, where a service mesh is defined as a *networking* service mesh. 与专注于网络问题的服务网格不同，Dapr 专注于提供构建基块，使开发人员更容易将应用程序构建为微服务。 Dapr is developer-centric, versus service meshes which are infrastructure-centric.

In most cases, developers do not need to be aware that the application they are building will be deployed in an environment which includes a service mesh, since a service mesh intercepts network traffic. Service meshes are mostly managed and deployed by system operators, whereas Dapr building block APIs are intended to be used by developers explicitly in their code.

Dapr 与服务网格都有的一些常见功能包括：
- 基于 mTLS 加密的服务到服务安全通信
- 服务到服务的度量指标收集
- 服务到服务分布式跟踪
- 故障重试恢复能力

 Importantly, Dapr provides service discovery and invocation via names, which is a developer-centric concern. This means that through Dapr's service invocation API, developers call a method on a service name, whereas service meshes deal with network concepts such as IP addresses and DNS addresses. 但是，Dapr 不提供路由或流量分配等关于流量控制的功能。 流量路由通常在应用程序的入口代理中处理，不必使用服务网格。 In addition, Dapr provides other application-level building blocks for state management, pub/sub messaging, actors, and more.

Another difference between Dapr and service meshes is observability (tracing and metrics). 服务网格在网络级别运行，并跟踪服务之间的网络调用。 Dapr does this with service invocation. Moreover, Dapr also provides observability (tracing and metrics) over pub/sub calls using trace IDs written into the Cloud Events envelope. This means that metrics and tracing with Dapr is more extensive than with a service mesh for applications that use both service-to-service invocation and pub/sub to communicate.

下图展示了 Dapr 和服务网格提供的重叠功能和独特功能：

<img src="/images/service-mesh.png" width=1000>

## 使用Dapr与一个服务网格连接
Dapr 也适用于服务网格。 如果两者部署在一起，Dapr 和服务网格的 sidecar 都在应用环境中运行。 在这种情况下，建议mTLS 加密和分布式跟踪功能仅在 Dapr 或 服务网格中的一方进行配置。

如需了解更多关于同时运行Dapr及服务网格的信息，可参阅以下来自Dapr社区的相关资料：
- [Dapr 和 Linkerd](https://youtu.be/xxU68ewRmz8?t=142)
- [Dapr 和 Istio](https://youtu.be/ngIDOQApx8g?t=335)

## When to choose using Dapr, a service mesh, or both
Should you be using Dapr, a service mesh, or both? 答案取决于您的需求。 If, for example, you are looking to use Dapr for one or more building blocks such as state management or pub/sub, and you are considering using a service mesh just for network security or observability, you may find that Dapr is a good fit and that a service mesh is not required.

Typically you would use a service mesh with Dapr where there is a corporate policy that traffic on the network must be encrypted for all applications. For example, you may be using Dapr in only part of your application, and other services and processes that are not using Dapr in your application also need their traffic encrypted. In this scenario a service mesh is the better option, and most likely you should use mTLS and distributed tracing on the service mesh and disable this on Dapr.

如果您为了A/B测试，需要进行流量拆分，使用服务网格将使您受益，因为Dapr并没有提供这些功能。

In some cases, where you require capabilities that are unique to both, you will find it useful to leverage both Dapr and a service mesh; as mentioned above, there is no limitation to using them together.
