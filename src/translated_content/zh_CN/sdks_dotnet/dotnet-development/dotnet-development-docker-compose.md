---
type: docs
title: "使用 Docker-Compose 进行 Dapr .NET SDK 开发"
linkTitle: "Docker Compose"
weight: 40000
description: 学习如何使用 Docker-Compose 进行本地开发
---

## Docker-Compose

*Consider this to be a .NET companion to the [Dapr Self-Hosted with Docker Guide]({{< ref self-hosted-with-docker.md >}})*.

`docker-compose` 是 Docker Desktop 附带的 CLI 工具，可用于一次运行多个容器。 它是一种将多个容器的生命周期自动化在一起的方法，并为面向 Kubernetes 的应用程序提供了类似于生产环境的开发体验。

- **Pro:** Since `docker-compose` manages containers for you, you can make dependencies part of the application definition and stop the long-running containers on your machine.
- **Con:** most investment required, services need to be containerized to get started.
- **Con:** can be difficult to debug and troubleshoot if you are unfamilar with Docker.

### 使用 Docker-Compose

从 .NET 的角度来看，一起使用 Dapr 和 `docker-compose` 并不需要专门的指导。 `docker-compose` 运行容器，一旦您的服务放在容器中，它的配置与其他任何编程技术都是相似的。

{{% alert title="💡 App Port" color="primary" %}}
在容器中，ASP.NET Core 应用默认监听80端口。 必要时，可以对 `--app-port` 配置项进行修改。
{{% /alert %}}

总结一下方法：

- Create a `Dockerfile` for each service
- 创建一个 `docker-compose.yaml` 并将其添加到源码仓库中

要了解如何编写 `docker-compose.yaml` ，请查阅： [Hello, docker-compose sample](https://github.com/dapr/samples/tree/master/hello-docker-compose) 。

与本地运行 `dapr run` 类似，对于每个服务，你需要选择唯一的 app-id。 选择容器的名称作为 app-id，将使其易于记忆。

Compose 文件应至少包含：

- 容器用于通信的网络
- 每个服务的容器
- 指定了服务端口和 app-id 的 `<service>-daprd` sidecar 容器。
- 在容器中运行的额外依赖项（例如redis）
- 可选：Dapr placement 容器 (适用于 Actor)

您也可以在 [eShopOnContainers](https://github.com/dotnet-architecture/eShopOnDapr/blob/master/docker-compose.yml) 示例应用程序中查看一个更大的示例。
