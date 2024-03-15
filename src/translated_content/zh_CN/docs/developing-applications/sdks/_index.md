---
type: docs
title: Dapr 开发套件 (SDKs)
linkTitle: SDKs
weight: 20
description: 使用你最喜欢的语言来开发 Dapr 应用
no_list: true
---

Dapr SDK 是将 Dapr 应用到您的应用程序中最简单的方法。 选择你最喜欢的语言，并在几分钟内开始使用 Dapr。

## SDK 软件包

选择您的[首选语言如下]({{< ref "#sdk-languages" >}})了解有关客户端、服务器、actor和工作流包的详细信息。

- **客户端**：Dapr 客户端允许您调用 Dapr 构件块的 API，并执行每个构建块的操作
- **服务扩展**：Dapr 服务扩展允许你创建可以被其他服务调用并订阅主题的服务
- **Actor**: Dapr Actor SDK 允许您使用方法、状态、定时器和持久提醒构建虚拟 actor
- **工作流**：Dapr工作流使您能够以可靠的方式编写长时间运行的业务逻辑和集成

## SDK 语言

| 语言                                                                                                  | 状态             | Client |                                                                                                                                                                       服务扩展                                                                                                                                                                       | Actor | Workflow |
| --------------------------------------------------------------------------------------------------- | :------------- | :----: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---: | :------: |
| [.NET]({{< ref dotnet >}})   | 已发布            |    ✔   |                                                                                                                                [ASP.NET Core](https://github.com/dapr/dotnet-sdk/tree/master/examples/AspNetCore)                                                                                                                                |   ✔   |     ✔    |
| [Python]({{< ref python >}}) | 已发布            |    ✔   | [gRPC]({{< ref python-grpc.md >}}) <br />[FastAPI]({{< ref python-fastapi.md >}})<br />[Flask]({{< ref python-flask.md >}}) |   ✔   |     ✔    |
| [Java]({{< ref java >}})     | 已发布            |    ✔   |                                                                                                                                                                    Spring Boot                                                                                                                                                                   |   ✔   |          |
| [前往]({{< ref go >}})         | 已发布            |    ✔   |                                                                                                                                                                         ✔                                                                                                                                                                        |   ✔   |          |
| [PHP]({{< ref php >}})       | 已发布            |    ✔   |                                                                                                                                                                         ✔                                                                                                                                                                        |   ✔   |          |
| [Javascript]({{< ref js >}}) | 已发布            |    ✔   |                                                                                                                                                                                                                                                                                                                                                  |   ✔   |          |
| [C++](https://github.com/dapr/cpp-sdk)                                                              | In development |    ✔   |                                                                                                                                                                                                                                                                                                                                                  |       |          |
| [Rust](https://github.com/dapr/rust-sdk)                                                            | In development |    ✔   |                                                                                                                                                                                                                                                                                                                                                  |       |          |

## 深入阅读

- [Dapr SDK中的序列化]({{< ref sdk-serialization.md >}})
