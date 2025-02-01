---
type: docs
title: "使用 Dapr CLI 进行 Dapr .NET SDK 开发"
linkTitle: "Dapr CLI"
weight: 30000
description: 了解如何使用 Dapr CLI 进行本地开发
---

## Dapr CLI

*可以将其视为 [.NET 伴侣指南：使用 Docker 的 Dapr 自托管指南]({{< ref self-hosted-with-docker.md >}})的补充*。

Dapr CLI 通过初始化本地的 Redis 容器、Zipkin 容器、placement 服务和 Redis 的组件清单，为您提供了一个良好的基础环境。这使您能够在全新安装且无需额外设置的情况下使用以下功能模块：

- [服务调用]({{< ref service-invocation >}})
- [状态存储]({{< ref state-management >}})
- [发布/订阅]({{< ref pubsub >}})
- [actor]({{< ref actors >}})

您可以使用 `dapr run` 命令来运行 .NET 服务，作为本地开发的一种策略。为每个服务运行此命令以启动您的应用程序。

- **优势：** 由于这是 Dapr 默认安装的一部分，因此设置简单
- **劣势：** 这会在您的机器上运行长时间的 Docker 容器，可能不太理想
- **劣势：** 这种方法的可扩展性较差，因为需要为每个服务运行一个单独的命令

### 使用 Dapr CLI

对于每个服务，您需要选择：

- 用于寻址的唯一应用 ID (`app-id`)
- 用于 HTTP 的唯一监听端口 (`port`)

您还应该决定存储组件的位置 (`components-path`)。

可以从多个终端运行以下命令以启动每个服务，并替换相应的值。

```sh
dapr run --app-id <app-id> --app-port <port> --components-path <components-path> -- dotnet run -p <project> --urls http://localhost:<port>
```

**解释：** 此命令使用 `dapr run` 启动每个服务及其附属进程。命令的前半部分（在 `--` 之前）将所需的配置传递给 Dapr CLI。命令的后半部分（在 `--` 之后）将所需的配置传递给 `dotnet run` 命令。

{{% alert title="💡 端口" color="primary" %}}
由于您需要为每个服务配置一个唯一的端口，您可以使用此命令将该端口值传递给 **Dapr 和服务**。`--urls http://localhost:<port>` 将配置 ASP.NET Core 以监听提供的端口上的流量。在命令行中配置比在代码中硬编码监听端口更灵活。
{{% /alert %}}

如果您的任何服务不接受 HTTP 流量，请通过删除 `--app-port` 和 `--urls` 参数来修改上述命令。

### 下一步

如果您需要调试，请使用调试器的附加功能附加到其中一个正在运行的进程。

如果您想扩展这种方法，请考虑编写一个脚本来为您的整个应用程序自动化此过程。