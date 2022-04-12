---
type: docs
title: "Dapr Tutorials"
linkTitle: "Dapr Tutorials"
weight: 70
description: "Walk through in-depth examples to learn more about how to work with Dapr concepts"
no_list: true
---

Now that you've already initialized Dapr and experimented with some of Dapr's building blocks, walk through our more detailed tutorials.

#### Before you begin

- [Set up your local Dapr environment]({{< ref "install-dapr-cli.md" >}}).
- [Explore one of Dapr's building blocks via our quickstarts]({{< ref "getting-started/quickstarts/_index.md" >}}).

## Tutorials

Thanks to our expansive Dapr community, we offer tutorials hosted both on Dapr Docs and on our [GitHub repository](https://github.com/dapr/quickstarts).

| Dapr Docs tutorials                                                | 说明                                                                              |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| [定义一个组件]({{< ref get-started-component.md >}})                     | Create a component definition file to interact with the Secrets building block. |
| [Configure State & Pub/sub]({{< ref configure-state-pubsub.md >}}) | Configure State Store and Pub/sub message broker components for Dapr.           |

| GitHub tutorials                                                                                     | 说明                                                                                  |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [Hello World](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world)                 | *Recommended* <br> Demonstrates how to run Dapr locally. 重点介绍服务调用和状态管理。       |
| [Hello World Kubernetes](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes) | *Recommended* <br> Demonstrates how to run Dapr in Kubernetes. 重点介绍服务调用和状态管理。 |
| [分布式计算](https://github.com/dapr/quickstarts/tree/master/tutorials/distributed-calculator)            | 展示了一个分布式计算器应用，该应用使用Dapr服务来驱动React web应用。 重点介绍多语言（多语言）编程、服务调用和状态管理。                  |
| [Pub/Sub](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub)                         | 演示如何使用Dapr启用 发布-订阅 应用程序。 使用Redis作为 发布-订阅 组件。                                        |
| [绑定](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings)                             | 演示如何使用Dapr创建与其他组件的输入和输出绑定。 使用与Kafka的绑定。                                             |
| [可观测性](https://github.com/dapr/quickstarts/tree/master/tutorials/observability)                      | 展示Dapr跟踪能力。 使用Zipkin作为跟踪组件。                                                         |
| [密钥存储](https://github.com/dapr/quickstarts/tree/master/tutorials/secretstore)                        | 演示使用Dapr Secrets API来访问密钥存储。                                                        |