---
type: docs
title: "Dapr 开发套件 (SDKs)"
linkTitle: "SDK"
weight: 20
description: "使用你最喜欢的语言来开发 Dapr 应用"
no_list: true
---

Dapr SDK 是将 Dapr 应用到您的应用程序中最简单的方法。 选择你最喜欢的语言，并在几分钟内开始使用 Dapr。

## SDK packages

- **Client SDK**: The Dapr client allows you to invoke Dapr building block APIs and perform actions such as:
   - [Invoke]({{< ref service-invocation >}}) methods on other services
   - Store and get [state]({{< ref state-management >}})
   - [Publish and subscribe]({{< ref pubsub >}}) to message topics
   - Interact with external resources through input and output [bindings]({{< ref bindings >}})
   - Get [secrets]({{< ref secrets >}}) from secret stores
   - Interact with [virtual actors]({{< ref actors >}})
- **Server extensions**: The Dapr service extensions allow you to create services that can:
   - Be [invoked]({{< ref service-invocation >}}) by other services
   - [Subscribe]({{< ref pubsub >}}) to topics
- **Actor SDK**: The Dapr Actor SDK allows you to build virtual actors with:
   - Methods that can be [invoked]({{< ref "howto-actors.md#actor-method-invocation" >}}) by other services
   - [State]({{< ref "howto-actors.md#actor-state-management" >}}) that can be stored and retrieved
   - [Timers]({{< ref "howto-actors.md#actor-timers" >}}) with callbacks
   - Persistent [reminders]({{< ref "howto-actors.md#actor-reminders" >}})

## SDK 语言

| Language                                 | 状态             | 客户端 SDK |                                                                  服务扩展                                                                   | Actor SDK |
| ---------------------------------------- |:-------------- |:-------:|:---------------------------------------------------------------------------------------------------------------------------------------:|:---------:|
| [.NET]({{< ref dotnet >}})               | Stable         |    ✔    |                           [ASP.NET Core](https://github.com/dapr/dotnet-sdk/tree/master/examples/AspNetCore)                            |     ✔     |
| [Python]({{< ref python >}})             | Stable         |    ✔    | [gRPC]({{< ref python-grpc.md >}}) <br />[FastAPI]({{< ref python-fastapi.md >}})<br />[Flask]({{< ref python-flask.md >}}) |     ✔     |
| [Java]({{< ref java >}})                 | Stable         |    ✔    |                                                               Spring Boot                                                               |     ✔     |
| [Go]({{< ref go >}})                     | Stable         |    ✔    |                                                                    ✔                                                                    |     ✔     |
| [PHP]({{< ref php >}})                   | Stable         |    ✔    |                                                                    ✔                                                                    |     ✔     |
| [Javascript]({{< ref js >}})             | Stable         |    ✔    |                                                                                                                                         |     ✔     |
| [C++](https://github.com/dapr/cpp-sdk)   | In development |    ✔    |                                                                                                                                         |           |
| [Rust](https://github.com/dapr/rust-sdk) | In development |    ✔    |                                                                                                                                         |           |

## 深入阅读

- [Dapr SDK 中的序列化]({{< ref sdk-serialization.md >}})
