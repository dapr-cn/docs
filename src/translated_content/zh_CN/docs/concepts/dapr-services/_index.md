---
type: docs
title: "Dapr 服务概述"
linkTitle: "Dapr 服务"
weight: 800
description: "了解构成 Dapr 运行时的服务"
---

Dapr 是一个开源项目，旨在简化微服务应用程序的构建过程。它提供了一系列构建模块，这些模块通过标准化的 API 进行访问，使开发人员能够轻松实现常见的分布式系统模式。

Dapr 的核心服务包括：

- **Actor**：Dapr 支持 actor 模型，方便开发人员实现有状态的 actor。
- **Secret**：Dapr 提供与机密信息存储的集成，帮助开发人员安全管理应用程序的敏感信息。
- **Configuration**：Dapr 提供配置管理功能，允许应用程序动态获取和更新配置。
- **Service Invocation**：Dapr 支持服务调用，使服务之间可以通过 HTTP 或 gRPC 进行通信。
- **Pub/Sub**：Dapr 支持发布/订阅模式，简化事件驱动的应用程序开发。
- **Workflow**：Dapr 提供工作流支持，帮助开发人员编排复杂的业务流程。
- **Cryptography**：Dapr 提供加密功能，帮助开发人员实现数据加密和解密。
- **Bindings**：Dapr 提供与外部系统的绑定集成，简化与外部服务的交互。
- **Timer 和 Reminder**：Dapr 提供定时器和提醒功能，帮助开发人员实现定时任务和提醒。
- **Job**：Dapr 支持任务调度，帮助开发人员管理和执行后台任务。
- **Conversation**：Dapr 提供对话支持，帮助开发人员实现对话式应用程序。
- **State**：Dapr 提供状态管理功能，帮助开发人员管理应用程序的状态。

通过这些服务，Dapr 使开发人员能够专注于业务逻辑，而不必担心底层基础设施的细节。