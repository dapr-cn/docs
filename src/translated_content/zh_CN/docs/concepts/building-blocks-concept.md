---
type: docs
title: "构建模块"
linkTitle: "构建模块"
weight: 200
description: "通过标准 HTTP 或 gRPC API 访问的模块化最佳实践"
---

[构建模块]({{< ref building-blocks >}}) 是一个 HTTP 或 gRPC API，可以从您的代码中调用，并使用一个或多个 Dapr 组件。Dapr 由一组 API 构建模块组成，并且可以扩展以添加新的构建模块。Dapr 的构建模块：
- 解决构建弹性微服务应用程序中的常见挑战
- 编码最佳实践和模式

下图展示了构建模块如何通过公共 API 暴露，并从您的代码中调用，使用组件来实现其功能。

<img src="/images/concepts-building-blocks.png" width=250>

Dapr 提供以下构建模块：

<img src="/images/building_blocks.png" width=1200>

| 构建模块 | 端点 | 描述 |
|----------------|----------|-------------|
| [**服务间调用**]({{< ref "service-invocation-overview.md" >}}) | `/v1.0/invoke` | 服务调用使应用程序能够通过 HTTP 或 gRPC 消息形式的已知端点相互通信。Dapr 提供一个端点，结合内置服务发现的反向代理，同时利用分布式追踪和错误处理。
| [**发布和订阅**]({{< ref "pubsub-overview.md" >}}) | `/v1.0/publish` `/v1.0/subscribe`| 发布/订阅是一种松耦合的消息传递模式，发送者（或发布者）将消息发布到主题，订阅者订阅该主题。Dapr 支持应用程序之间的发布/订阅模式。
| [**工作流**]({{< ref "workflow-overview.md" >}}) | `/v1.0/workflow` | 工作流 API 允许您定义长时间运行的、持久的流程或数据流，这些流程或数据流跨越多个微服务，使用 Dapr 工作流或工作流组件。工作流 API 可以与其他 Dapr API 构建模块结合使用。例如，工作流可以通过服务调用调用另一个服务或检索 secret，提供灵活性和可移植性。
| [**状态管理**]({{< ref "state-management-overview.md" >}}) | `/v1.0/state` | 应用程序状态是应用程序希望在单个会话之外保留的任何内容。Dapr 提供基于键/值的状态和查询 API，具有可插拔的状态存储以实现持久性。
| [**绑定**]({{< ref "bindings-overview.md" >}}) | `/v1.0/bindings` | 绑定提供与外部云/本地服务或系统的双向连接。Dapr 允许您通过 Dapr 绑定 API 调用外部服务，并允许您的应用程序被连接服务发送的事件触发。
| [**Actors**]({{< ref "actors-overview.md" >}}) | `/v1.0/actors` | actor 是一个隔离的、独立的计算和状态单元，具有单线程执行。Dapr 提供基于虚拟 actor 模式的 actor 实现，提供单线程编程模型，并且当不使用时，actor 会被垃圾回收。
| [**Secrets**]({{< ref "secrets-overview.md" >}}) | `/v1.0/secrets` | Dapr 提供一个 secret 构建模块 API，并与 secret 存储集成，如公共云存储、本地存储和 Kubernetes 来存储 secret。服务可以调用 secret API 来检索 secret，例如获取数据库的连接字符串。
| [**配置**]({{< ref "configuration-api-overview.md" >}}) | `/v1.0/configuration` | 配置 API 使您能够检索和订阅支持的配置存储的应用程序配置项。这使应用程序能够在启动时或在存储中进行配置更改时检索特定的配置信息。
| [**分布式锁**]({{< ref "distributed-lock-api-overview.md" >}}) | `/v1.0-alpha1/lock` | 分布式锁 API 使您能够对资源进行锁定，以便应用程序的多个实例可以在不发生冲突的情况下访问资源，并提供一致性保证。
| [**加密**]({{< ref "cryptography-overview.md" >}}) | `/v1.0-alpha1/crypto` | 加密 API 使您能够执行加密操作，例如加密和解密消息，而不将密钥暴露给您的应用程序。
| [**作业**]({{< ref "jobs-overview.md" >}}) | `/v1.0-alpha1/jobs` | 作业 API 使您能够调度和编排作业。示例场景包括：<ul><li>安排批处理作业在每个工作日运行</li><li>安排各种维护脚本进行清理</li><li>安排 ETL 作业在特定时间（每小时、每天）运行以获取新数据，处理它，并使用最新信息更新数据仓库。</li></ul>
| [**对话**]({{< ref "conversation-overview.md" >}}) | `/v1.0-alpha1/conversation` | 对话 API 使您能够提供提示与不同的大型语言模型（LLM）进行对话，并包括提示缓存和个人身份信息（PII）模糊化等功能。