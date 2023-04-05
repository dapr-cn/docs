---
type: docs
title: "Dapr 教程"
linkTitle: "Dapr 教程"
weight: 70
description: "浏览深入的示例，以了解更多有关如何使用 Dapr 的概念"
no_list: true
---

Now that you've already initialized Dapr and experimented with some of Dapr's building blocks, walk through our more detailed tutorials.

#### 在您开始之前

- [Set up your local Dapr environment]({{< ref "install-dapr-cli.md" >}}).
- [通过我们的快速入门探索 Dapr 的构建块之一]({{< ref "getting-started/quickstarts/_index.md" >}})。

## 教程

感谢我们庞大的Dapr社区，我们在Dapr Docs和我们的 [GitHub仓库](https://github.com/dapr/quickstarts) 上提供教程。

| Dapr Docs tutorials                                                | 说明                                                                              |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| [定义组件]({{< ref get-started-component.md >}})                       | Create a component definition file to interact with the Secrets building block. |
| [Configure State & Pub/sub]({{< ref configure-state-pubsub.md >}}) | Configure State Store and Pub/sub message broker components for Dapr.           |

| GitHub tutorials                                                                                           | 说明                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Hello World](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world)                       | *Recommended* <br> Demonstrates how to run Dapr locally. Highlights service invocation and state management.                                                                             |
| [Hello World Kubernetes](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)       | *推荐* <br> 演示如何在 Kubernetes 中运行 Dapr。 Highlights service invocation and state management.                                                                                                 |
| [Distributed Calculator](https://github.com/dapr/quickstarts/tree/master/tutorials/distributed-calculator) | Demonstrates a distributed calculator application that uses Dapr services to power a React web app. Highlights polyglot (multi-language) programming, service invocation and state management. |
| [Pub/sub（发布/订阅）](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub)                        | Demonstrates how to use Dapr to enable pub-sub applications. Uses Redis as a pub-sub component.                                                                                                |
| [绑定](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings)                                   | Demonstrates how to use Dapr to create input and output bindings to other components. Uses bindings to Kafka.                                                                                  |
| [可观测性](https://github.com/dapr/quickstarts/tree/master/tutorials/observability)                            | Demonstrates Dapr tracing capabilities. Uses Zipkin as a tracing component.                                                                                                                    |
| [Secret Store](https://github.com/dapr/quickstarts/tree/master/tutorials/secretstore)                      | Demonstrates the use of Dapr Secrets API to access secret stores.                                                                                                                              |