---
type: docs
title: "试试Dapr的快速入门课程，学习核心概念"
linkTitle: "Dapr 快速入门"
weight: 60
description: "包含代码示例的教程，旨在帮助您快速上手 Dapr"
---

[Dapr 快速入门](https://github.com/dapr/quickstarts/tree/v1.5.0) 是教程的集合，其中包含旨在帮助你快速开始使用 Dapr 的代码示例，每个教程都突出展示了不同的 Dapr 功能。

- 一合适的入门起点是 hello-world 快速入门，它演示了如何在本地机器上以自托管模式运行Dapr，并使用一个简单的应用程序中演示了状态管理和服务调用。
- 接下来，如果您熟悉 Kubernetes，并希望了解如何在 Kubernetes 环境中运行相同的应用程序，请阅读 hello-kubernetes 快速入门。 其他的快速入门教程皆在探索 Dapr 的不同功能，如发布/订阅、绑定和分布式计算，同时教程内包括本地和 Kubernetes 上运行的说明，可以按任意顺序完成。 快速入门的完整列表可在下方找到。
- 你可以随时浏览 Dapr 文档或特定于 SDK 的示例，然后回来尝试其他快速入门。
- 当你完成所有入门后，可以考虑探索 [Dapr 样例仓库](https://github.com/dapr/samples)，查看由社区贡献的更多的代码样本，这些示例展示了 Dapr 的更高级或特定的用法。

## 快速入门

| 快速入门                                                                                 | 说明                                                                |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| [Hello World](https://github.com/dapr/quickstarts/tree/v1.5.0/hello-world)           | 演示如何在本地运行 Dapr。 重点介绍服务调用和状态管理。                                    |
| [Hello Kubernetes](https://github.com/dapr/quickstarts/tree/v1.5.0/hello-kubernetes) | 演示如何在 Kubernetes 中运行 Dapr。 重点介绍服务调用和状态管理。                         |
| [分布式计算器](https://github.com/dapr/quickstarts/tree/v1.5.0/distributed-calculator)     | 展示了一个分布式计算器应用，该应用使用 Dapr 服务来驱动 React web 应用。 重点介绍多语言编程、服务调用和状态管理。 |
| [Pub/Sub](https://github.com/dapr/quickstarts/tree/v1.5.0/pub-sub)                   | 演示如何使用 Dapr 来启用 pub-sub 应用程序。 使用 Redis 作为发布-订阅组件。                 |
| [绑定](https://github.com/dapr/quickstarts/tree/v1.5.0/bindings)                       | 演示如何使用 Dapr 来创建与其他组件的输入和输出绑定。 使用与 Kafka 的绑定。                      |
| [中间件](https://github.com/dapr/quickstarts/tree/v1.5.0/middleware)                    | 展示如何使用 Dapr 中间件来实现 OAuth 2.0授权。                                   |
| [可观测性](https://github.com/dapr/quickstarts/tree/v1.5.0/observability)                | 展示 Dapr 跟踪能力。 使用 Zipkin 作为跟踪组件。                                   |
| [秘密存储](https://github.com/dapr/quickstarts/tree/v1.5.0/secretstore)                  | 演示使用 Dapr Secrets API 来访问秘密存储。                                    |

