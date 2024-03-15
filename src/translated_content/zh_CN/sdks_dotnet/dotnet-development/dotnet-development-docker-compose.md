---
type: docs
title: 使用 Docker-Compose 进行 Dapr .NET SDK 开发
linkTitle: Docker Compose
weight: 50000
description: 学习如何使用 Docker-Compose 进行本地开发
---

## Docker-Compose

_将此视为[Dapr自托管与Docker指南]({{< ref self-hosted-with-docker.md >}})的.NET指导_。

`docker-compose` 是 Docker Desktop 附带的 CLI 工具，可用于一次运行多个容器。 它是一种将多个容器的生命周期自动化在一起的方法，并为面向 Kubernetes 的应用程序提供了类似于生产环境的开发体验。

- \*\*优点：\*\*由于 `docker-compose` 为您管理容器，因此您可以将依赖项作为应用程序定义的一部分，并停止在您的机器上长时间运行的容器。
- **缺点：** 需要更多投资，服务需要被容器化才能开始使用。
- \*\*缺点：\*\*如果你对Docker不熟悉，可能很难进行调试和故障排除。

### 使用 Docker-Compose

从 .NET 的角度来看，一起使用 `docker-compose` 和 Dapr 并不需要专门的指导。 `docker-compose`运行容器，一旦您的服务放在容器中，它的配置与其他任何编程技术都是相似的。

{{% alert title="💡 App Port" color="primary" %}}
在一个容器中，一个ASP.NET Core应用默认会监听端口80。 记住这个，以备日后需要配置 `--app-port` 时使用。
{{% /alert %}}

总结一下方法：

- 为每个服务创建一个 `Dockerfile`
- 创建一个 `docker-compose.yaml` 并将其添加到源码仓库中

要了解如何编写 `docker-compose.yaml`，请从[Hello, docker-compose sample](https://github.com/dapr/samples/tree/master/hello-docker-compose)开始。

与本地运行 `dapr run` 类似，对于每个服务，你需要选择唯一的 app-id。 选择容器的名称作为 app-id，将使其易于记忆。

Compose 文件应至少包含：

- 容器用于通信的网络
- 每个服务的容器
- 一个 `<service>-daprd` sidecar 容器，指定了服务的端口和 app-id
- 在容器中运行的额外依赖项（例如redis）
- 可选：Dapr placement 容器 (适用于 Actor)

您还可以从[eShopOnContainers](https://github.com/dotnet-architecture/eShopOnDapr/blob/master/docker-compose.yml)示例应用程序中查看更大的示例。
