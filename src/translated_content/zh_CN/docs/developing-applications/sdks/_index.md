---
type: docs
title: "Dapr 软件开发工具包 (SDKs)"
linkTitle: "SDKs"
weight: 30
description: "使用您喜欢的语言与 Dapr 一起工作"
no_list: true
---

Dapr SDKs 是将 Dapr 集成到应用程序中的最简单方法。选择您喜欢的语言，几分钟内即可开始使用 Dapr。

## SDK 包

选择您[偏好的语言]({{< ref "#sdk-languages" >}})以了解有关客户端、服务扩展、actor 和工作流包的更多信息。

- **客户端**: Dapr 客户端允许您调用 Dapr 构建块 API 并执行每个构建块的操作。
- **服务扩展**: Dapr 服务扩展使您能够创建可被其他服务调用的服务并订阅主题。
- **actor**: Dapr actor SDK 允许您构建具有方法、状态、计时器和持久性提醒的虚拟 actor。
- **工作流**: Dapr 工作流使您能够可靠地编写长时间运行的业务逻辑和集成。

## SDK 语言

| 语言 | 状态 | 客户端 | 服务扩展 | actor | 工作流 |
|----------|:------|:----------:|:-----------:|:---------:|:---------:|
| [.NET]({{< ref dotnet >}}) | 稳定 | ✔ |  [ASP.NET Core](https://github.com/dapr/dotnet-sdk/tree/master/examples/AspNetCore) | ✔ | ✔ |
| [Python]({{< ref python >}}) | 稳定 | ✔ | [gRPC]({{< ref python-grpc.md >}}) <br />[FastAPI]({{< ref python-fastapi.md >}})<br />[Flask]({{< ref python-flask.md >}})| ✔ | ✔ |
| [Java]({{< ref java >}}) | 稳定 | ✔ | Spring Boot  <br /> Quarkus| ✔ | ✔ |
| [Go]({{< ref go >}}) | 稳定 | ✔ | ✔ | ✔ | ✔ |
| [PHP]({{< ref php >}}) | 稳定 | ✔ | ✔ | ✔ | |
| [JavaScript]({{< ref js >}}) | 稳定| ✔ | | ✔ | ✔  |
| [C++](https://github.com/dapr/cpp-sdk) | 开发中 | ✔ | | |
| [Rust]({{< ref rust >}}) | 开发中 | ✔ | | ✔ | |

## 进一步阅读

- [Dapr SDKs 中的序列化]({{< ref sdk-serialization.md >}})
