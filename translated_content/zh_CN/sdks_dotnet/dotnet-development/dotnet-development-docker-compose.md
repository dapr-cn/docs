---
type: docs
title: "使用Docker-Compose进行Dapr .NET SDK开发"
linkTitle: "Docker Compose"
weight: 40000
description: 学习如何使用Docker-Compose进行本地开发
---

## Docker-Compose

*这是一篇 .NET 使用指南，另见 [使用 Docker 进行 Dapr 自托管]({{< ref self-hosted-with-docker.md >}})*

`docker-compose` 是 Docker Desktop 附带的 CLI 工具，可用于一次运行多个容器。 它是一种将多个容器的生命周期自动化在一起的方法，并为面向 Kubernetes 的应用程序提供了类似于生产环境的开发体验。

- **优点：** 由于 `docker-compose` 为您管理容器，因此我们可以将依赖关系作为应用程序定义的一部分，并停止在机器上的长时间运行的容器。
- **缺点：** 需要更多资源，服务需要被容器化才能使用。
- **缺点：** 不熟悉Docker的情况下，可能对调试和问题诊断造成困难。

### 使用Docker-Compose

从 .NET 的角度来看，一起使用 Dapr 和 `docker-compose` 并不需要专门的指导。 `docker-compose` 运行容器，一旦您的服务放在容器中，它的配置与其他任何编程技术都是相似的。

{{% alert title="💡 App Port" color="primary" %}}
在容器中，ASP.NET Core应用默认监听80端口。 必要时，可以对`--app-port`配置项进行修改。
{{% /alert %}}

总结一下：

- 为每个服务创建一个 `Dockerfile`
- 创建一个 `docker-compose.yaml` 并将其添加到源码仓库中

要了解如何编写 `docker-compose.yaml` ，请查阅： [Hello, docker-compose sample](https://github.com/dapr/samples/tree/master/hello-docker-compose) 。

与本地运行 `dapr run` 类似，对于每个服务，你需要选择唯一的 app-id。 并且将此app-id作为容器名称以便于记忆。

Compose 文件应至少包含：

- 容器用于通信的网络
- 每个服务的容器
- 指定了服务端口和 app-id 的 `<service>-daprd` sidecar 容器。
- 在容器中运行的其他依赖组件 (例如redis)
- 可选：Dapr placement容器 (适用于 Actors)

您也可以在 [eShopOnContainers](https://github.com/dotnet-architecture/eShopOnDapr/blob/master/docker-compose.yml) 示例应用程序中查看一个更大规模的示例。
