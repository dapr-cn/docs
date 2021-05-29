---
type: docs
title: "Dapr 开发套件 (SDKs)"
linkTitle: "SDKs"
weight: 20
description: "使用你最喜欢的语言来开发Dapr应用"
no_list: true
---

Dapr SDK是将Dapr应用到您的应用程序中最简单的方法。 选择你最喜欢的语言，并在几分钟内开始使用Dapr。

## SDK软件包

- **客户端SDK**：Dapr客户端允许您调用Dapr构件的API，并执行下例操作:
   - [Invoke]({{< ref service-invocation >}}) methods on other services
   - Store and get [state]({{< ref state-management >}})
   - [Publish and subscribe]({{< ref pubsub >}}) to message topics
   - Interact with external resources through input and output [bindings]({{< ref bindings >}})
   - Get [secrets]({{< ref secrets >}}) from secret stores
   - Interact with [virtual actors]({{< ref actors >}})
- **服务扩展**：Dapr服务扩展允许你创建具有以下功能的服务:
   - Be [invoked]({{< ref service-invocation >}}) by other services
   - [Subscribe]({{< ref pubsub >}}) to topics
- **Actor SDK**: Dapr Actor SDK允许你使用以下方法构建virtual actors:
   - Methods that can be [invoked]({{< ref "howto-actors.md#actor-method-invocation" >}}) by other services
   - [State]({{< ref "howto-actors.md#actor-state-management" >}}) that can be stored and retrieved
   - [Timers]({{< ref "howto-actors.md#actor-timers" >}}) with callbacks
   - Persistent [reminders]({{< ref "howto-actors.md#actor-reminders" >}})

## SDK 语言

| 语言                                           | 状态             | 客户端 SDK |                   服务扩展                    |                                        Actor SDK                                         |
| -------------------------------------------- |:-------------- |:-------:|:-----------------------------------------:|:----------------------------------------------------------------------------------------:|
| [.NET]({{< ref dotnet >}})                   | Stable         |    ✔    | [ASP.NET Core]({{< ref dotnet-aspnet >}}) |                                            ✔                                             |
| [Python]({{< ref python >}})                 | Stable         |    ✔    |    [gRPC]({{< ref python-grpc.md >}})     | [FastAPI]({{< ref python-fastapi.md >}})<br />[Flask]({{< ref python-flask.md >}}) |
| [Java](https://github.com/dapr/java-sdk)     | Stable         |    ✔    |                Spring Boot                |                                            ✔                                             |
| [Go](https://github.com/dapr/go-sdk)         | Stable         |    ✔    |                     ✔                     |                                                                                          |
| [PHP]({{< ref php >}})                       | Stable         |    ✔    |                     ✔                     |                                            ✔                                             |
| [C++](https://github.com/dapr/cpp-sdk)       | In development |    ✔    |                                           |                                                                                          |
| [Rust](https://github.com/dapr/rust-sdk)     | In development |    ✔    |                                           |                                                                                          |
| [Javascript](https://github.com/dapr/js-sdk) | In development |    ✔    |                                           |                                                                                          |

## 深入阅读

- [Dapr SDK中的序列化]({{< ref sdk-serialization.md >}})
