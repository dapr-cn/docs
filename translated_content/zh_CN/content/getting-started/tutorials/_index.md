---
type: docs
title: "Dapr 教程"
linkTitle: "Dapr 教程"
weight: 70
description: "浏览深入的示例，以了解更多有关如何使用 Dapr 的概念"
no_list: true
---

现在您已经初始化了 Dapr，并尝试了 Dapr 的一些构建块，请浏览我们更详细的教程。

#### 在您开始之前

- [设置你的本地Dapr环境]({{< ref "install-dapr-cli.md" >}})。
- [通过我们的快速入门探索 Dapr 的构建块之一]({{< ref "getting-started/quickstarts/_index.md" >}})。

## 教程

感谢我们庞大的Dapr社区，我们在Dapr Docs和我们的 [GitHub仓库](https://github.com/dapr/quickstarts) 上提供教程。

| Dapr 文档教程                                             | 说明                          |
| ----------------------------------------------------- | --------------------------- |
| [定义一个组件]({{< ref get-started-component.md >}})        | 创建组件定义文件以与 Secrets 构建块进行交互。 |
| [配置状态 & 发布/订阅]({{< ref configure-state-pubsub.md >}}) | 为 Dapr 配置状态存储和发布/订阅消息代理组件.  |

| GitHub 教程                                                                                      | 说明                                                                 |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [Hello World](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world)           | *推荐* <br> 演示如何在本地运行 Dapr。 重点介绍服务调用和状态管理。                     |
| [Hello Kubernetes](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes) | *推荐* <br> 演示如何在 Kubernetes 中运行 Dapr。 重点介绍服务调用和状态管理。          |
| [分布式计算](https://github.com/dapr/quickstarts/tree/master/tutorials/distributed-calculator)      | 展示了一个分布式计算器应用，该应用使用Dapr服务来驱动React web应用。 重点介绍多语言（多语言）编程、服务调用和状态管理。 |
| [发布/订阅](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub)                     | 演示如何使用Dapr启用 发布-订阅 应用程序。 使用Redis作为 发布-订阅 组件。                       |
| [绑定](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings)                       | 演示如何使用Dapr创建与其他组件的输入和输出绑定。 使用与Kafka的绑定。                            |
| [可观测性](https://github.com/dapr/quickstarts/tree/master/tutorials/observability)                | 展示Dapr跟踪能力。 使用Zipkin作为跟踪组件。                                        |
| [密钥存储](https://github.com/dapr/quickstarts/tree/master/tutorials/secretstore)                  | 演示使用Dapr Secrets API来访问密钥存储。                                       |