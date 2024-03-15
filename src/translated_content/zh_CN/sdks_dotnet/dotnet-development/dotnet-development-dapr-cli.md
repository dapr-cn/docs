---
type: docs
title: Dapr .NET SDK 与 Dapr CLI 进行开发
linkTitle: Dapr CLI
weight: 30000
description: 学习使用 Dapr CLI 进行本地开发
---

## Dapr CLI

_将此视为[Dapr自托管与Docker指南]({{< ref self-hosted-with-docker.md >}})的.NET指导_。

Dapr CLI 通过初始化本地 redis 容器、zipkin 容器、放置服务和 redis 的组件清单，为您提供了良好的工作基础。 这将使您能够在全新安装中使用以下构建块，而无需进行其他设置：

- [服务调用]({{< ref service-invocation >}})
- [状态存储]({{< ref state-management >}})
- [Pub/Sub]({{< ref pubsub >}})
- [Actors]({{< ref actors >}})

您可以使用 `dapr run` 来运行 .NET 服务，作为您在本地开发的策略。 计划在每个服务上运行这些命令中的一个，以便启动你的应用程序。

- \*\*优点：\*\*这很容易设置，因为它是默认 Dapr 安装的一部分
- \*\*缺点：\*\*这会在您的机器上使用长期运行的docker容器，这可能是不可取的
- \*\*缺点：\*\*此方法的可伸缩性很差，因为它需要为每个服务运行单独的命令

### 使用 Dapr CLI

对于每项服务，您需要选择：

- 用于寻址的唯一应用 Id （`app-id`）
- 唯一的 HTTP 监听端口 (`port`)

您还应该决定将组件配置存储在哪里（components-path）。

以下命令可以从多个终端运行，以启动每个服务，并替换相应的值。

```sh
dapr run --app-id <app-id> --app-port <port> --components-path <components-path> -- dotnet run -p <project> --urls http://localhost:<port>
```

**说明：** 此命令将使用 `dapr run` 来启动每个服务及其 sidecar。 命令的前半部分（`--`之前）将所需的配置传递给 Dapr CLI。 命令的第二部分（在 `--` 之后）将所需的配置传递给 `dotnet run` 命令。

{{% alert title="💡 端口" color="primary" %}}
由于您需要为每个服务配置唯一的端口，您可以使用此命令将该端口值同时传递给**Dapr**和服务。 `--urls http://localhost:<port>`将配置ASP.NET Core来监听所提供端口上的流量。 在命令行处使用配置比在其他地方硬编码监听端口更灵活。
{{% /alert %}}

如果您的任何服务不接受HTTP流量，则通过删除`--app-port`和`--urls`参数来修改上述命令。

### 下一步

如果您需要调试，请使用调试器的附加功能将其附加到正在运行的进程中。

如果你想扩大这种方法的规模，那么可以考虑建立一个脚本，为你的整个应用自动完成这一过程。
