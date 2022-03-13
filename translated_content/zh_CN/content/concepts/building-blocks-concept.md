---
type: docs
title: "构建块"
linkTitle: "构建块"
weight: 200
description: "可通过标准 HTTP 或 gRPC API 访问的模块化最佳实践"
---

[构建块]({{< ref building-blocks >}}) 是 HTTP 或 gRPC API，可以从您的代码中调用，并使用一个或多个 Dapr 组件。

构建块解决了构建弹性微服务应用程序中的常见挑战，并编纂了最佳实践和模式。 Dapr由一组构建块组成，并且具有可扩展性以添加新的构建块。

下图显示了构建块如何暴露可供代码调用的公共 AP，以及如何使用组件来实现构建块的功能。

<img src="/images/concepts-building-blocks.png" width=250>

以下是 Dapr 提供的构建块:

<img src="/images/building_blocks.png" width=1200>

| 构建块                                                    | 端点                                | 描述                                                                                                           |
| ------------------------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [**服务调用**]({{<ref "service-invocation-overview.md">}}) | `/v1.0/invoke`                    | 服务调用使应用程序能够以 http 或 gRPC 消息的形式通过已知的端点相互通信。 Dapr提供了端点，作为反向代理与内置服务发现的组合，同时利用内置的分布式跟踪和错误处理。                     |
| [**状态管理**]({{<ref "state-management-overview.md">}})   | `/v1.0/state`                     | 应用程序状态是应用程序想要在单个会话之外保留的任何内容。 Dapr 提供基于键/值的状态和查询API ，使用可插拔的状态存储进行持久化。                                         |
| [**发布订阅**]({{<ref "pubsub-overview.md">}})             | `/v1.0/publish` `/v1.0/subscribe` | 发布/订阅是松耦合的消息传递模式，发送方 (或发布者) 将消息推送到订阅者订阅的主题。 Dapr 支持应用程序之间的发布/订阅模式。                                           |
| [**资源绑定**]({{<ref "bindings-overview.md">}})           | `/v1.0/bindings`                  | 绑定提供与外部云/本地服务或系统的双向连接。 Dapr 允许您通过 Dapr binding API 调用外部服务，也可以通过已连接的服务发送的事件来触发应用程序。                           |
| [**Actors**]({{<ref "actors-overview.md">}})           | `/v1.0/actors`                    | Actor 组件是具有单线程执行能力的隔离、独立的计算和状态单元。 Dapr 提供了基于 Virtual Actor 模式的 actor 实现，该模式提供了单线程编程模型，并且 actor 在不使用时会进行垃圾回收。 |
| [**可观测性**]({{<ref "observability-concept.md">}})       | `N/A`                             | Dapr 系统组件和运行时发出 metrics，log 和 trace 以调试，操作和监控 Dapr 系统服务，组件和用户应用程序。                                           |
| [**Secrets**]({{<ref "secrets-overview.md">}})         | `/v1.0/secrets`                   | Dapr提供密钥构建块API ，并与公共云存储、本地存储和 Kubernetes 等密钥存储集成，以存储密钥。 服务可以调用 secrets API 来获取密钥，例如，获取数据库的连接字符串。             |
| [**配置**]({{<ref "configuration-api-overview.md">}})    | `/v1.0-alpha1/configuration`      | Dapr提供配置API ，使您能够从支持的配置存储检索和订阅应用程序配置项。 这使应用程序能够设置特定的配置信息，例如在启动时或在存储进行配置更改时。                                  | 
