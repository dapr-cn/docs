---
type: docs
title: "Dapr .NET SDK 与 Dapr CLI 进行开发"
linkTitle: "Dapr CLI"
weight: 30000
description: 通过 Dapr CLI 学习本地开发
---

## Dapr CLI

*这篇文章是一篇与 .NET 相关的文章，另见 [使用 Docker 进行 Dapr 自托管]({{ ref self-hosted-overview.md }})*

Dapr CLI 为您提供了一个很好的工作基础，通过初始化本地重新分配容器、拉取容器、放置服务和用于重新分配的组件清单。 这将使您能够在没有额外设置的新安装中处理以下构建块：

- [调用逻辑]({{< ref service-invocation >}})
- [状态存储]({{< ref state-management >}})
- [Pub/Sub]({{< ref pubsub >}})
- [Actors]({{< ref actors >}})

您可以用 `dapr run` 来运行.NET 服务，作为您在本地开发的策略。 为每个服务的这些命令，以便启动您的应用程序。

- **好处：** ，这是很容易设置，因为它的默认Dapr安装的一部分
- **坏处：** 这在你的机器上使用长期运行的 docker 容器，这可能是不可取的
- **坏处：** 这种方法的可伸缩性很差，因为它需要每个服务运行一个单独的命令

### 使用 Dapr CLI

对于您需要选择的每个服务，需要如下内容：

- 一个唯一的地址应用程序ID(`app-id`)
- 一个唯一的 HTTP 监听端口 (`port`)

您还应该决定将组件配置存储在哪里（`components-path`）。

以下命令可以从多个终端运行以启动每个服务，并替换相应的值。

```sh
dapr run --app-id <app-id> --app-port <port> --components-path <components-path> -- dotnet run -p <project> --urls http://localhost:<port>
```

**说明：** 此命令将使用 `dapr run` 来启动每个服务及其 sidecar。 命令的前半部分（在 `--`之前） 将所需的配置传递给 Dapr CLI。 命令的后半部分（ `--`之后）将所需的配置传递给 `dotnet run` 命令。

{{% alert title="💡 Ports" color="primary" %}}
因为您需要为每个服务配置一个独特的端口， 您可以使用此命令将该端口值传递到 **同时**传递给 Dapr 和应用服务。 `--urls http://localhost：<port>` 将配置 ASP.NET Core 来监听所提供端口上的流量。 在命令行处使用配置比在其他地方硬编码监听端口更灵活。
{{% /alert %}}

如果您的服务都不接受任何HTTP流量， 然后通过删除 `--app-port` 和 `--urls` 参数来修改上面的命令。

### 下一步

如果您需要调试，请使用调试器的附加功能将其附加到正在运行的进程中。

如果您想要伸缩这个方法，以部署更多的应用，可以考虑构建一个脚本，为您的整个应用程序自动化此过程。
