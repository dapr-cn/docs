---
type: docs
title: "Dapr与服务网格"
linkTitle: "服务网格"
weight: 200
description: >
  Dapr与服务网格的比较及协作
---

Dapr 采用 sidecar 架构，作为独立进程与应用程序并行运行，提供服务调用、网络安全和[分布式追踪](https://middleware.io/blog/what-is-distributed-tracing/)等功能。这常常引发一个问题：Dapr 与 Linkerd、Istio 和 Open Service Mesh 等服务网格解决方案相比如何？

## Dapr与服务网格的比较
虽然 Dapr 和服务网格确实有一些功能重叠，但**Dapr 不是一个服务网格**。服务网格主要关注网络层面的问题，而 Dapr 则专注于为开发者提供构建微服务的工具。Dapr 是以开发者为中心的，而服务网格则是以基础设施为中心的。

通常情况下，开发者无需关心应用程序是否部署在包含服务网格的环境中，因为服务网格会自动处理网络流量。服务网格主要由系统运维人员管理和部署，而 Dapr 的构建块 API 则是供开发者在代码中直接使用的。

Dapr 与服务网格共享的一些常见功能包括：
- 使用 mTLS 加密进行安全的服务间通信
- 服务间的指标收集
- 服务间的分布式追踪
- 通过重试实现的弹性

值得注意的是，Dapr 提供基于名称的服务发现和调用，这对开发者来说非常友好。通过 Dapr 的 service-invocation API，开发者可以直接调用服务名称，而服务网格则处理 IP 地址和 DNS 地址等网络细节。然而，Dapr 不提供流量路由或流量拆分等功能，这些通常由应用程序的入口代理来解决。此外，Dapr 还提供其他应用程序级别的构建块，如状态管理、发布订阅消息传递、actor 模型等。

Dapr 与服务网格在可观测性（追踪和指标）方面也有所不同。服务网格在网络层面操作，追踪服务之间的网络调用，而 Dapr 则通过 service-invocation 实现这一点。此外，Dapr 通过将追踪 ID 写入 Cloud Events 信封，提供对发布订阅调用的可观测性。这意味着对于同时使用服务间调用和发布订阅进行通信的应用程序，Dapr 的指标和追踪范围更广。

下图展示了 Dapr 和服务网格提供的重叠功能和独特能力：

<img src="/images/service-mesh.png" width=1000>

## 将Dapr与服务网格一起使用
Dapr 可以与服务网格协同工作。在两者同时部署的情况下，Dapr 和服务网格的 sidecar 都在应用程序环境中运行。在这种情况下，建议仅配置 Dapr 或服务网格来执行 mTLS 加密和分布式追踪。

观看这些来自 Dapr 社区电话会议的录音，展示了 Dapr 与不同服务网格一起运行的演示：
- [Dapr 和 Linkerd](https://youtu.be/xxU68ewRmz8?t=142)的概述和演示
- 运行 [Dapr 和 Istio](https://youtu.be/ngIDOQApx8?t=335)的演示

## 何时使用Dapr或服务网格或两者
您应该使用 Dapr、服务网格还是两者？这取决于您的具体需求。例如，如果您希望使用 Dapr 的一个或多个构建块，如状态管理或发布订阅，并且仅考虑使用服务网格来增强网络安全或可观测性，您可能会发现仅使用 Dapr 就足够了。

通常，您会在有公司政策要求所有应用程序的网络流量必须加密的情况下，将服务网格与 Dapr 一起使用。例如，您可能仅在应用程序的一部分中使用 Dapr，而其他未使用 Dapr 的服务和进程也需要加密流量。在这种情况下，服务网格是更好的选择，您可能需要在服务网格上启用 mTLS 和分布式追踪，并在 Dapr 上禁用这些功能。

如果您需要流量拆分以进行 A/B 测试，使用服务网格会更有利，因为 Dapr 不提供这些功能。

在某些情况下，当您需要两者的独特功能时，您会发现同时利用 Dapr 和服务网格是有益的；如上所述，使用它们在一起没有限制。