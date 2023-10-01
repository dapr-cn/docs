---
type: docs
title: "Dapr 开发套件 (SDKs)"
linkTitle: "SDK"
weight: 20
description: "使用你最喜欢的语言来开发 Dapr 应用"
no_list: true
---

Dapr SDK 是将 Dapr 应用到您的应用程序中最简单的方法。 选择你最喜欢的语言，并在几分钟内开始使用 Dapr。

## SDK 软件包

- **客户端 SDK**：Dapr 客户端允许您调用 Dapr 构件块的 API，并执行下例操作:
   - 在其他服务上[调用]({{< ref service-invocation >}}) 方法
   - 存储和获取 [状态]({{< ref state-management >}})
   - [发布和订阅]({{< ref pubsub >}}) 消息主题
   - 通过输入和输出[绑定]({{< ref bindings >}})与外部资源交互
   - 从密钥存储中获取[密钥]({{< ref secrets >}})
   - 与 [virtual actors]({{< ref actors >}})进行交互
- **服务扩展**：Dapr 服务扩展允许你创建具有以下功能的服务:
   - 被其他服务[调用]({{< ref service-invocation >}})
   - [订阅]({{< ref pubsub >}})主题
- **Actor SDK**: Dapr Actor SDK 允许你使用以下方法构建 virtual actors:
   - 可以被其他服务 [调用]({{< ref "howto-actors.md#actor-method-invocation" >}})的方法
   - 可以被存储和检索的[状态]({{< ref "howto-actors.md#actor-state-management" >}})
   - 带回调的[定时器]({{< ref "howto-actors.md#actor-timers" >}})
   - 持久化的[提醒器]({{< ref "howto-actors.md#actor-reminders" >}})

## SDK 语言

| 语言                                                 | 状态  | 客户端 SDK |                                                                  服务扩展                                                                   | Actor SDK |
| -------------------------------------------------- |:--- |:-------:|:---------------------------------------------------------------------------------------------------------------------------------------:|:---------:|
| [.NET]({{< ref dotnet >}})                         | 已发布 |    ✔    |                           [ASP.NET Core](https://github.com/dapr/dotnet-sdk/tree/master/examples/AspNetCore)                            |     ✔     |
| [Python]({{< ref python >}})                       | 已发布 |    ✔    | [gRPC]({{< ref python-grpc.md >}}) <br />[FastAPI]({{< ref python-fastapi.md >}})<br />[Flask]({{< ref python-flask.md >}}) |     ✔     |
| [Java]({{< ref java >}})                           | 已发布 |    ✔    |                                                               Spring Boot                                                               |     ✔     |
| [Go]({{< ref go >}})                               | 已发布 |    ✔    |                                                                    ✔                                                                    |     ✔     |
| [PHP]({{< ref php >}})                             | 已发布 |    ✔    |                                                                    ✔                                                                    |     ✔     |
| [Javascript]({{< ref js >}})                       | 已发布 |    ✔    |                                                                                                                                         |     ✔     |
| [C++](https://github.com/dapr/cpp-sdk)             | 开发中 |    ✔    |                                                                                                                                         |           |
| [In development](https://github.com/dapr/rust-sdk) | 开发中 |    ✔    |                                                                                                                                         |           |

## 深入阅读

- [Dapr SDK 中的序列化]({{< ref sdk-serialization.md >}})
