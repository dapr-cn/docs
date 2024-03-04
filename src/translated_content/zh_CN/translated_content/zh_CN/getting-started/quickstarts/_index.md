---
type: docs
title: "Dapr 快速入门"
linkTitle: "Dapr 快速入门"
weight: 70
description: "试用Dapr的快速入门，这些示例代码旨帮助您快速上手Dapr"
no_list: true
---

试用我们的Dapr快速入门，包含了旨在帮助您快速上手Dapr的示例代码。

{{% alert title="Note" color="primary" %}}
 我们正在积极努力增加我们的快速入门库。 同时，你可以通过我们的[教程]({{< ref "getting-started/tutorials/_index.md" >}})探索Dapr。

{{% /alert %}}

#### 在您开始之前

- [设置你的本地Dapr环境]({{< ref "install-dapr-cli.md" >}})。

## 快速入门

| 快速入门                                                | 说明                                             |
| --------------------------------------------------- | ---------------------------------------------- |
| [发布与订阅]({{< ref pubsub-quickstart.md >}})           | 使用消息传递实现两个服务之间的异步通信。                           |
| [服务调用]({{< ref serviceinvocation-quickstart.md >}}) | 使用HTTP或gRPC进行两个服务之间的同步通信。                      |
| [状态管理]({{< ref statemanagement-quickstart.md >}})   | 在支持的状态存储中将服务的数据存储为键/值对。                        |
| [绑定]({{< ref bindings-quickstart.md >}})            | 使用输入绑定响应事件，使用输出绑定调用操作，与外部系统协作。                 |
| [Actors]({{< ref actors-quickstart.md >}})          | 运行一个微服务和一个简单的控制台客户端，以演示 Dapr Actors 中的有状态对象模式。 |
| [密钥管理]({{< ref secrets-quickstart.md >}})           | 安全地获取密钥。                                       |
| [配置]({{< ref configuration-quickstart.md >}})       | 获取配置项并订阅配置更新。                                  |
| [弹性]({{< ref resiliency >}})                        | 定义并应用容错策略到你的 Dapr API 请求。                      |
| [工作流]({{< ref workflow-quickstart.md >}})           | 在长时间运行、容错、有状态的应用程序中编排业务工作流活动。                  |
| [密码学]({{< ref cryptography-quickstart.md >}})       | 使用 Dapr 的加密 API 对数据进行加密和解密。                    |
