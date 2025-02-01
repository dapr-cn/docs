
---
type: docs
title: "Dapr 快速入门"
linkTitle: "Dapr 快速入门"
weight: 70
description: "通过代码示例快速掌握 Dapr，帮助您轻松上手"
no_list: true
---

通过我们的 Dapr 快速入门指南，结合代码示例，帮助您轻松掌握 Dapr。

{{% alert title="注意" color="primary" %}}
我们正在不断丰富快速入门指南。同时，您可以通过我们的[教程]({{< ref "getting-started/tutorials/_index.md" >}})进一步探索 Dapr。

{{% /alert %}}

#### 开始之前

- [安装本地 Dapr 环境]({{< ref "install-dapr-cli.md" >}})。

## 快速入门

| 快速入门 | 描述 |
| ----------- | ----------- |
| [服务调用]({{< ref serviceinvocation-quickstart.md >}}) | 通过 HTTP 或 gRPC 实现两个服务之间的同步通信。 |
| [发布和订阅]({{< ref pubsub-quickstart.md >}}) | 通过消息实现两个服务之间的异步通信。 |
| [工作流]({{< ref workflow-quickstart.md >}}) | 在长时间运行的应用中协调业务流程，确保容错和状态管理。 |
| [状态管理]({{< ref statemanagement-quickstart.md >}}) | 以键/值对形式存储服务数据，支持多种状态存储。 |
| [绑定]({{< ref bindings-quickstart.md >}}) | 使用输入绑定响应外部事件，使用输出绑定执行操作。 |
| [参与者]({{< ref actors-quickstart.md >}}) | 运行微服务和简单客户端，展示 Dapr 参与者的状态化对象模式。 |
| [秘密管理]({{< ref secrets-quickstart.md >}}) | 安全获取和管理敏感信息。 |
| [配置]({{< ref configuration-quickstart.md >}}) | 获取配置项并监听配置更新。 |
| [弹性]({{< ref resiliency >}}) | 为 Dapr API 请求定义和应用容错策略。 |
| [加密]({{< ref cryptography-quickstart.md >}}) | 使用 Dapr 的加密 API 进行数据加密和解密。 |
| [作业]({{< ref jobs-quickstart.md >}}) | 使用 Dapr 的作业 API 进行作业调度、检索和删除。 |

