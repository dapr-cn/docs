---
type: docs
title: "尝试 Dapr 快速入门以学习核心概念"
linkTitle: "Dapr 快速入门"
weight: 60
description: "教程与代码样本，旨在让你快速上手使用Dapr。"
---

[Dapr 快速启动](https://github.com/dapr/quickstarts/tree/v1.0.0) 是代码样本的教程集合，旨在让您从 Dapr 快速入门，每个教程都突出了不同的 Dapr 功能。

- 一个好的起点是 hello-world 快速入门，它演示了如何在本地机器上以独立模式运行Dapr，并在一个简单的应用程序中演示了状态管理和服务调用。
- 接下来，如果您熟悉Kubernetes，想要看看如何在Kubernetes环境中运行相同的应用程序 寻找hello-kubernetes 快速入门。 其他快速入门，如pub-sub、bindings和distributed-calculator快速启动，探索不同的Dapr功能，包括本地和Kubernetes上运行的说明，可以按照任何顺序完成。 快速入门的完整列表可在下方找到。
- 在任何时候，您可以浏览 Dapr 文档或 SDK 特定样本，然后回来尝试其他快速入门。
- 当你完成后，可以考虑探索[Dapr样例库](https://github.com/dapr/samples)，查看由社区贡献的更多的代码样本，展示Dapr的更多高级或特定用途。

## 快速入门

| 快速启动                                                                                             | 描述                                                                 |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| [Hello World](https://github.com/dapr/quickstarts/tree/v1.0.0/hello-world)                       | 演示如何在本地运行Dapr。 重点介绍服务调用和状态管理。                                      |
| [Hello Kubernetes](https://github.com/dapr/quickstarts/tree/v1.0.0/hello-kubernetes)             | 演示如何在Kubernetes中运行Dapr。 重点介绍服务调用和状态管理。                             |
| [Distributed Calculator](https://github.com/dapr/quickstarts/tree/v1.0.0/distributed-calculator) | 展示了一个分布式计算器应用，该应用使用Dapr服务来驱动React web应用。 重点介绍多语言（多语言）编程、服务调用和状态管理。 |
| [发布/订阅](https://github.com/dapr/quickstarts/tree/v1.0.0/pub-sub)                                 | 演示如何使用Dapr启用 发布-订阅 应用程序。 使用Redis作为 发布-订阅 组件。                       |
| [绑定](https://github.com/dapr/quickstarts/tree/v1.0.0/bindings)                                   | 演示如何使用Dapr创建与其他组件的输入和输出绑定。 使用与Kafka的绑定。                            |
| [中间件](https://github.com/dapr/quickstarts/tree/v1.0.0/middleware)                                | 演示使用Dapr中间件来实现OAuth 2.0授权。                                         |
| [可观测性](https://github.com/dapr/quickstarts/tree/v1.0.0/observability)                            | 展示Dapr跟踪能力。 使用Zipkin作为跟踪组件。                                        |
| [Secret Store](https://github.com/dapr/quickstarts/tree/v1.0.0/secretstore)                      | 演示使用Dapr Secrets API来访问密钥存储。                                       |
