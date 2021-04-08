---
type: docs
title: "Dapr .NET SDK 与 Dapr CLI 进行开发"
linkTitle: "Dapr CLI"
weight: 50000
description: 通过 Dapr CLI 学习本地开发
---

## Dapr CLI

*这篇文章是一篇与 .NET 相关的文章，另见 [使用 Docker 进行 Dapr 自托管]({{ ref self-hosted-overview.md }})*

Dapr CLI 为您提供了一个很好的工作基础，通过初始化本地重新分配容器、拉取容器、放置服务和用于重新分配的组件清单。 这将使您能够在没有额外设置的新安装中处理以下构建块：

- [Service invocation]({{< ref service-invocation >}})
- [状态存储]({{< ref state-management >}})
- [发布/订阅]({{< ref pubsub >}})
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
Since you need to configure a unique port for each service, you can use this command to pass that port value to **both** Dapr and the service. `--urls http://localhost:<port>` will configure ASP.NET Core to listen for traffic on the provided port. Using configuration at the commandline is a more flexible approach than hardcoding a listening port elsewhere.
{{% /alert %}}

If any of your services do not accept HTTP traffic, then modify the command above by removing the `--app-port` and `--urls` arguments.

### 下一步

If you need to debug, then use the attach feature of your debugger to attach to one of the running processes.

If you want to scale up this approach, then consider building a script which automates this process for your whole application.
