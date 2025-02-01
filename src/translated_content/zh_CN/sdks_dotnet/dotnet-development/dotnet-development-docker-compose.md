---
type: docs
title: "使用 Docker-Compose 进行 Dapr .NET SDK 开发"
linkTitle: "Docker Compose"
weight: 60000
description: 了解如何使用 Docker-Compose 进行本地开发
---

## Docker-Compose

*这可以看作是 [.NET 伴侣指南：使用 Docker 的 Dapr 自托管指南]({{< ref self-hosted-with-docker.md >}}) 的补充。*

`docker-compose` 是 Docker Desktop 附带的一个命令行工具，您可以用它同时运行多个容器。它提供了一种自动化管理多个容器生命周期的方法，为面向 Kubernetes 的应用程序提供类似于生产环境的开发体验。

- **优势在于：** `docker-compose` 帮助您管理容器，您可以将依赖项作为应用程序的一部分进行定义，并停止机器上长时间运行的容器。
- **劣势在于：** 需要较多的前期投入，服务需要先容器化。
- **劣势在于：** 如果您不熟悉 Docker，可能会遇到调试和故障排除的困难。

### 使用 docker-compose

从 .NET 的角度来看，使用 Dapr 的 `docker-compose` 并不需要特别的指导。`docker-compose` 负责运行容器，一旦您的服务在容器中，配置它就和其他编程技术类似。

{{% alert title="💡 应用端口" color="primary" %}}
在容器中，ASP.NET Core 应用程序默认监听 80 端口。请记住这一点，以便在配置 `--app-port` 时使用。
{{% /alert %}}

总结这种方法：

- 为每个服务创建一个 `Dockerfile`
- 创建一个 `docker-compose.yaml` 并将其提交到源代码库

要了解如何编写 `docker-compose.yaml`，您可以从 [Hello, docker-compose 示例](https://github.com/dapr/samples/tree/master/hello-docker-compose) 开始。

类似于使用 `dapr run` 本地运行，对于每个服务，您需要选择一个唯一的 app-id。选择容器名称作为 app-id 可以帮助您更容易记住。

compose 文件至少应包含以下内容：

- 容器之间通信所需的网络
- 每个服务的容器
- 一个 `<service>-daprd` sidecar 容器，指定服务的端口和 app-id
- 在容器中运行的其他依赖项（例如 redis）
- 可选：Dapr placement 容器（用于 actor）

您还可以查看 [eShopOnContainers](https://github.com/dotnet-architecture/eShopOnDapr/blob/master/docker-compose.yml) 示例应用程序中的更大示例。