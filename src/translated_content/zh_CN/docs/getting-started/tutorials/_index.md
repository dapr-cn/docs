---
type: docs
title: Dapr 教程
linkTitle: Dapr 教程
weight: 70
description: 浏览深入的示例，以了解更多有关如何使用 Dapr 的概念
no_list: true
---

现在您已经初始化了 Dapr，并尝试了 Dapr 的一些构建块，请浏览我们更详细的教程。

#### 在您开始之前

- [设置本地 Dapr 环境]({{< ref "install-dapr-cli.md" >}})。
- [通过我们的快速入门，探索 Dapr 的一个构建块]({{< ref "getting-started/quickstarts/_index.md" >}})。

## 教程

感谢我们庞大的Dapr社区，我们在Dapr Docs和我们的[GitHub仓库](https://github.com/dapr/quickstarts)上提供教程。

| Dapr 文档教程                                                                                                                  | 说明                          |
| -------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| [定义一个组件]({{< ref get-started-component.md >}})      | 创建组件定义文件以与 Secrets 构建块进行交互。 |
| [配置状态和发布/订阅]({{< ref configure-state-pubsub.md >}}) | 为 Dapr 配置状态存储和发布/订阅消息代理组件.  |

| GitHub 教程                                                                                         | 说明                                                                |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [Hello world 教程](https://github.com/dapr/quickstarts/blob/master/tutorials/hello-world/README.md) | _推荐_ <br> 演示如何在本地运行Dapr。 重点介绍服务调用和状态管理。                           |
| [你好，世界 Kubernetes](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)    | _推荐_ <br> 演示如何在 Kubernetes 中运行 Dapr。 重点介绍服务调用和状态管理。               |
| [分布式计算器](https://github.com/dapr/quickstarts/tree/master/tutorials/distributed-calculator)        | 展示了一个分布式计算器应用，该应用使用 Dapr 服务来驱动 React web 应用。 重点介绍多语言编程、服务调用和状态管理。 |
| [Pub/Sub](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub)                      | 演示如何使用 Dapr 来启用 pub-sub 应用程序。 使用 Redis 作为发布-订阅组件。                 |
| [绑定](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings)                          | 演示如何使用 Dapr 创建与其他组件的输入和输出绑定。 使用与 Kafka 的绑定。                       |
| [可观测性](https://github.com/dapr/quickstarts/tree/master/tutorials/observability)                   | 展示 Dapr 跟踪能力。 使用 Zipkin 作为跟踪组件。                                   |
| [密钥存储](https://github.com/dapr/quickstarts/tree/master/tutorials/secretstore)                     | 演示使用 Dapr Secrets API 来访问密钥存储。                                    |
