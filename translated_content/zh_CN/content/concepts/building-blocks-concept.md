---
type: docs
title: "构建块"
linkTitle: "构建块"
weight: 200
description: "可通过标准 HTTP 或 gRPC API 访问的模块化最佳实践"
---

[构建块]({{< ref building-blocks >}}) 是可以从您的代码中调用的HTTP或gRPC API，并且由一个或多个Dapr组件组成。

构建块解决了构建弹性微服务应用程序中的常见挑战，并编纂了最佳实践和模式。 Dapr由一组构建块组成，并且具有可扩展性以添加新的构建块。

下图显示了构建块如何公开了可被代码调用的公共 API ，并使用组件来实现构建块的能力。

<img src="/images/concepts-building-blocks.png" width=250>

以下是 Dapr 提供的构建块类型:

<img src="/images/building_blocks.png" width=1000>

| 构建块                                                    | Endpoint                          | 说明                                                                                                     |
| ------------------------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [**服务调用**]({{<ref "service-invocation-overview.md">}}) | `/v1.0/invoke`                    | 服务调用使应用程序能够通过 Http 或 gRPC 消息形式相互通信。 Dapr 提供了一个终结点，它充当反向代理与内置服务发现的组合，同时内置分布式跟踪和错误处理。                    |
| [**状态管理**]({{<ref "state-management-overview.md">}})   | `/v1.0/state`                     | 应用程序状态是应用程序想要保留在单个会话之外的任何内容。 Dapr 提供基于键 / 值的状态 API ，使用可插拔的状态存储进行持久化。                                   |
| [**发布订阅**]({{<ref "pubsub-overview.md">}})             | `/v1.0/publish` `/v1.0/subscribe` | 发布/预订是松散耦合的消息传递模式，发送方 (或发布者) 将消息推送到订阅者预订的主题。 Dapr 支持应用程序之间的发布/订阅模式。                                    |
| [**资源绑定**]({{<ref "bindings-overview.md">}})           | `/v1.0/bindings`                  | 绑定提供一个外部云与本地服务或系统的双向连接。 Dapr 允许您通过 Dapr 绑定 API 调用外部服务，也可以通过已连接的服务发送的事件来触发应用程序。                         |
| [**Actors**]({{<ref "actors-overview.md">}})           | `/v1.0/actors`                    | 参与者是孤立的独立计算单元，具有单线程执行。 Dapr提供了基于Virtual Actor模式的actor实现，该模式提供了单线程编程模型，并且在不使用actor时会对其进行垃圾回收。           |
| [**可观测性**]({{<ref "observability-concept.md">}})       | `N/A`                             | Dapr 系统组件和运行时记录 metrics，log 和 trace 以调试，操作和监视 Dapr 系统服务，组件和用户应用程序。                                     |
| [**Secrets**]({{<ref "secrets-overview.md">}})         | `/v1.0/secrets`                   | Dapr 提供一个机密构建块 API ，并与 Azure Key Vault 和 Kubernetes 等机密商店集成，以存储机密。 服务代码可以调用密钥 API 从 Dapr 支持的密钥存储中检索密钥。 |
