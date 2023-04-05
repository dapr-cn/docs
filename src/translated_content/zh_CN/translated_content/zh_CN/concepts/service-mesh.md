---
type: docs
title: "Dapr 和服务网格"
linkTitle: "服务网格"
weight: 900
description: >
  Dapr 与服务网格的比较和配合使用
---

Dapr 使用 sidecar 架构，与应用程序一起作为单独的进程运行，包括服务调用、网络安全和分布式跟踪等功能。 This often raises the question: how does Dapr compare to service mesh solutions such as [Linkerd](https://linkerd.io/), [Istio](https://istio.io/) and [Open Service Mesh](https://openservicemesh.io/) among others?

## How Dapr and service meshes compare
虽然 Dapr 和服务网格确实存在一些重叠功能，但 Dapr **不是服务网格** ，尤其服务网格被定义为 *"网络"* 服务网格。 与专注于网络问题的服务网格不同，Dapr 专注于提供构建块，使开发人员更容易将应用程序构建为微服务。 Dapr 以开发人员为中心，而服务网格以基础设施为中心。

在大多数情况下，开发人员不需要意识到他们正在构建的应用程序将部署在包括服务网格在内的环境中，因为服务网格会拦截网络流量。 服务网格大多由系统运维人员管理和部署，而 Dapr 构建块 API 则打算由开发人员在其代码中明确使用。

Dapr 与服务网格都有的一些常见功能包括：
- Secure service-to-service communication with mTLS encryption
- Service-to-service metric collection
- Service-to-service distributed tracing
- Resiliency through retries

 Importantly, Dapr provides service discovery and invocation via names, which is a developer-centric concern. This means that through Dapr's service invocation API, developers call a method on a service name, whereas service meshes deal with network concepts such as IP addresses and DNS addresses. However, Dapr does not provide capabilities for traffic behavior such as routing or traffic splitting. Traffic routing is often addressed with ingress proxies to an application and does not have to use a service mesh. In addition, Dapr provides other application-level building blocks for state management, pub/sub messaging, actors, and more.

Dapr 和服务网格之间的另一个区别是可观察性(跟踪和度量)。 服务网格在网络级别运行，并跟踪服务间的网络调用。 Dapr 是通过服务调用的方式来实现的。 此外，Dapr 还使用写入 Cloud Events 信封的 trace ID，在发布/订阅中提供可观察性（跟踪和 metrics ）。 这意味着，对于同时使用服务间调用和发布/订阅进行通信的应用程序，使用 Dapr 的指标和跟踪比使用服务网格更广泛。

下图展示了 Dapr 和服务网格提供的重叠特性和独特功能：

<img src="/images/service-mesh.png" width=1000>

## 将 Dapr 与服务网格一起使用
Dapr 也适用于服务网格。 如果两者部署在一起，Dapr 和服务网格的 sidecar 都在应用环境中运行。 在这种情况下，建议 mTLS 加密和分布式跟踪功能仅在 Dapr 或服务网格中的一方进行配置。

如需了解更多关于同时运行 Dapr 及服务网格的信息，可参阅以下来自 Dapr 社区的相关资料：
- General overview and a demo of [Dapr and Linkerd](https://youtu.be/xxU68ewRmz8?t=142)
- 运行 dapr 和 Istio</a>

 的演示</li> 
  
  - 了解更多关于[一起使用 Open Service Mesh（OSM）和 Dapr 的信息]({{<ref open-service-mesh>}})。</ul> 



## 何时选择使用 Dapr、服务网格或者并存

您应该使用 Dapr、服务网格还是两者兼而有之？ 答案取决于您的需求。 例如，如果您希望将 Dapr 用于一个或多个构建块，例如状态管理或发布/订阅，同时考虑仅针对网络安全或可观察性使用服务网格，那您可能会发现 Dapr 已经非常合适，并不需要使用服务网格。

一个需要同时使用 Dapr 和服务网格的典型场景是：所有应用程序的通信作为一个整体策略，都需要进行加密处理的时候。 例如，您可能仅在应用程序的一部分中使用 Dapr，而应用程序中未使用 Dapr 的其他服务和处理也需要加密通信。 在这种场景下，使用服务网格是更好的选择。且最好您在服务网格中启用 mTLS 及分布式跟踪功能，并在 Dapr 中禁用掉它们。

如果您为了A/B 测试，需要进行流量拆分，使用服务网格将使您受益，因为 Dapr 并没有提供这些功能。

在某些情况下，如果您需要两者都独有的功能，您会发现同时使用 Dapr 和服务网格是很有用的 - 如上所述，同时使用它们是没有任何限制的。
