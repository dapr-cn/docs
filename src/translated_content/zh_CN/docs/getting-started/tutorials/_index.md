
---
type: docs
title: "Dapr 教程"
linkTitle: "Dapr 教程"
weight: 70
description: "通过深入的示例学习如何使用 Dapr 概念"
no_list: true
---

您已经初始化了 Dapr 并尝试了一些构建块，现在可以浏览我们更详细的教程。

#### 在您开始之前

- [设置本地 Dapr 环境]({{< ref "install-dapr-cli.md" >}})。
- [通过我们的快速入门探索 Dapr 的一个构建块]({{< ref "getting-started/quickstarts/_index.md" >}})。

## 教程

得益于我们庞大的 Dapr 社区，我们提供的教程既托管在 Dapr 文档上，也托管在我们的 [GitHub 仓库](https://github.com/dapr/quickstarts)上。

| Dapr 文档教程               | 描述                                                                                                                                                                                    |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [定义一个组件]({{< ref get-started-component.md >}})       | 创建一个组件定义文件以与 Secrets 构建块交互。 |
| [配置 State & Pub/sub]({{< ref configure-state-pubsub.md >}}) | 为 Dapr 配置状态存储和发布/订阅消息代理组件。 |

| GitHub 教程               | 描述                                                                                                                                                                                    |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Hello World](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world)            | *推荐* <br> 演示如何在本地运行 Dapr，主要展示服务调用和状态管理。  |
| [Hello World Kubernetes](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)       | *推荐* <br> 演示如何在 Kubernetes 中运行 Dapr，主要展示服务调用和状态管理。  |
| [分布式计算器](https://github.com/dapr/quickstarts/tree/master/tutorials/distributed-calculator) | 演示一个分布式计算器应用，使用 Dapr 服务驱动 React Web 应用。主要展示多语言编程、服务调用和状态管理。 |
| [Pub/Sub](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub)                | 演示如何使用 Dapr 启用发布/订阅应用，使用 Redis 作为发布/订阅组件的实现。  |
| [Bindings](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings)            | 演示如何使用 Dapr 创建与其他组件的输入和输出绑定，使用 Kafka 作为绑定的实现。                                                                            |
| [可观测性](https://github.com/dapr/quickstarts/tree/master/tutorials/observability) | 演示 Dapr 的追踪能力，使用 Zipkin 作为追踪组件。 |
| [Secret Store](https://github.com/dapr/quickstarts/tree/master/tutorials/secretstore) | 演示使用 Dapr Secrets API 访问密钥存储。 |
`