---
type: docs
title: "Dapr 开发套件 (SDKs)"
linkTitle: "SDK"
weight: 20
description: "使用你最喜欢的语言来开发Dapr应用"
no_list: true
---

Dapr SDK是将Dapr应用到您的应用程序中最简单的方法。 选择你最喜欢的语言，并在几分钟内开始使用Dapr。

## SDK软件包

- **客户端SDK**：Dapr客户端允许您调用Dapr构件的API，并执行下例操作:
   - [调用]({{< ref service-invocation >}})其他服务中的方法
   - 存储和获取[状态]({< ref statemanagement >}})
   - [发布和订阅]({{< ref pubsub >}})消息主题
   - 通过 [绑定]({{< ref bindings >}})输入和输出与外部资源进行交互
   - 从密钥存储中获取[密钥]({{< ref secrets >}})
   - 与 [virtual actors]({{< ref actors >}})进行交互
- **服务扩展**：Dapr服务扩展允许你创建具有以下功能的服务:
   - 被其他服务[调用]({{< ref service-invocation >}})
   - [订阅]({{< ref pubsub >}})主题
- **Actor SDK**: Dapr Actor SDK允许你使用以下方法构建virtual actors:
   - 可以被其他服务 [调用]({{< ref "howto-actors.md#actor-method-invocation" >}})的方法
   - 可以被存储和检索的[状态]({{< ref "howto-actors.md#actor-state-management" >}})
   - 带回调的[定时器]({{< ref "howto-actors.md#actor-timers" >}})
   - 持久化的[reminders]({{< ref "howto-actors.md#actor-reminders" >}})

## SDK 语言

| 语言                                       | 状态             | 客户端 SDK |                   服务扩展                    |                                        Actor SDK                                         |
| ---------------------------------------- |:-------------- |:-------:|:-----------------------------------------:|:----------------------------------------------------------------------------------------:|
| [.NET]({{< ref dotnet >}})               | Stable         |    ✔    | [ASP.NET Core]({{< ref dotnet-aspnet >}}) |                                            ✔                                             |
| [Python]({{< ref python >}})             | Stable         |    ✔    |    [gRPC]({{< ref python-grpc.md >}})     | [FastAPI]({{< ref python-fastapi.md >}})<br />[Flask]({{< ref python-flask.md >}}) |
| [Java](https://github.com/dapr/java-sdk) | Stable         |    ✔    |                Spring Boot                |                                            ✔                                             |
| [Go](https://github.com/dapr/go-sdk)     | Stable         |    ✔    |                     ✔                     |                                                                                          |
| [PHP]({{< ref php >}})                   | Stable         |    ✔    |                     ✔                     |                                            ✔                                             |
| [C++](https://github.com/dapr/cpp-sdk)   | In development |    ✔    |                                           |                                                                                          |
| [Rust]()                                 | In development |    ✔    |                                           |                                                                                          |
| [Javascript]()                           | In development |    ✔    |                                           |                                                                                          |

## 深入阅读

- [Dapr SDK中的序列化]({{< ref sdk-serialization.md >}})
