---
type: docs
title: "使用Docker-Compose进行Dapr .NET SDK开发"
linkTitle: "Docker Compose"
weight: 40000
description: 学习如何使用Docker-Compose进行本地开发
---

## Docker-Compose

*这篇文章是一篇与 .NET 相关的文章，另见 [使用 Docker 进行 Dapr 自托管]({{ ref self-hosted-with-docker.md }})*

`Docker-compose` 是一个 CLI 工具包含在 Docker Desktop 上，您可以一次使用它来运行多个容器。 它是将多个容器的生命周期自动化的一种方式，并为针对 Kubernetes 的应用程序提供类似于生产环境的开发体验。

- **好处:** 因为 `docker-compose` 为您管理容器，所以您可以使依赖关系成为应用程序定义的一部分，并停止在您的机器上的长运行容器。
- **缺点：** 需要更多资源，服务需要被容器化才能使用。
- **缺点: ** 如果您与 Docker不熟悉，可能很难调试和诊断问题。

### 使用 docker-compose

从.NET的角度来看，使用 `docker-compose` 配合 Dapr 不需要专门指导。 `docker-compose` 运行容器，一旦您的服务放在容器中，配置它就类似于其他编程技术。

{{% alert title="💡 App Port" color="primary" %}}
在容器中，一个 ASP.NET Core 应用默认将监听端口 80 。 记住这个，后续当您需要配置 `--app-port` 时需要这个。
{{% /alert %}}

总结一下：

- 为每个服务创建一个 `Dockerfile`
- 创建一个 `docker-compose.yaml` 并将其放置到源代码仓库中

要了解如何编写 `docker-compose.yaml` 您应该从 [Hello, docker-compose sample](https://github.com/dapr/samples/tree/master/hello-docker-compose) 开始。

类似于在本地运行的 `dapr run` 为每个服务您需要选择一个唯一的 app-id。 选择容器名称作为 app-id 将更容易记住。

Compose 文件至少包含：

- 容器使用的网络配置
- 每个服务的容器
- 一个带有服务端口和 app-id 指定的 `<service>-daprd` sidecar 容器
- 在容器中运行的其他依赖关系（例如redis）
- 可选：Dapr placement容器 (适用于 Actors)

您也可以从 [eShopOnContainers](https://github.com/dotnet-architecture/eShopOnDapr/blob/master/docker-compose.yml) 示例应用程序中查看一个更大规模的示例。
