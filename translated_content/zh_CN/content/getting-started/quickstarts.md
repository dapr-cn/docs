---
type: docs
title: "尝试Dapr快速入门以学习核心概念"
linkTitle: "Dapr 快速入门"
weight: 60
description: "教程与代码样本，旨在让你快速上手使用Dapr。"
---

[Dapr 快速入门](https://github.com/dapr/quickstarts/tree/v1.0.0) 是代码样本的教程集合，旨在让您从 Dapr 快速入门，每个教程都突出了不同的 Dapr 功能。

- 一合适的入门起点是 hello-world 快速入门，它演示了如何在本地机器上以自托管模式运行Dapr，并使用一个简单的应用程序中演示了状态管理和服务调用。
- 接下来，如果您熟悉Kubernetes，想了解如何在Kubernetes环境中运行相同的应用程序，请阅读hello-kubernetes快速入门。 其他的快速入门教程皆在探索Dapr的不同功能，如发布/订阅、绑定和分布式计算，同时教程内包括本地和Kubernetes上运行的说明，可以无序完成。 快速入门的完整列表可在下方找到。
- 您可以随时浏览 Dapr 文档或 SDK 特定例子，还可以尝试额外的快速入门。
- 当你完成所有入门后，可以考虑探索[Dapr样例库](https://github.com/dapr/samples)，查看由社区贡献的更多的代码样本，其中展示Dapr的更多高阶或特定的用法。

## 快速入门

| 入门项                                                                                  | 说明                                                                 |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| [Hello World](https://github.com/dapr/quickstarts/tree/v1.3.0/hello-world)           | 演示如何在本地运行Dapr。 重点介绍服务调用和状态管理。                                      |
| [Hello Kubernetes](https://github.com/dapr/quickstarts/tree/v1.3.0/hello-kubernetes) | 演示如何在Kubernetes中运行Dapr。 重点介绍服务调用和状态管理。                             |
| [分布式计算](https://github.com/dapr/quickstarts/tree/v1.3.0/distributed-calculator)      | 展示了一个分布式计算器应用，该应用使用Dapr服务来驱动React web应用。 重点介绍多语言（多语言）编程、服务调用和状态管理。 |
| [Pub/Sub](https://github.com/dapr/quickstarts/tree/v1.3.0/pub-sub)                   | 演示如何使用Dapr启用 发布-订阅 应用程序。 使用Redis作为 发布-订阅 组件。                       |
| [绑定](https://github.com/dapr/quickstarts/tree/v1.3.0/bindings)                       | 演示如何使用Dapr创建与其他组件的输入和输出绑定。 使用与Kafka的绑定。                            |
| [中间件](https://github.com/dapr/quickstarts/tree/v1.3.0/middleware)                    | 演示使用Dapr中间件来实现OAuth 2.0授权。                                         |
| [可观测性](https://github.com/dapr/quickstarts/tree/v1.3.0/observability)                | 展示Dapr跟踪能力。 使用Zipkin作为跟踪组件。                                        |
| [密钥存储](https://github.com/dapr/quickstarts/tree/v1.3.0/secretstore)                  | 演示使用Dapr Secrets API来访问密钥存储。                                       |
