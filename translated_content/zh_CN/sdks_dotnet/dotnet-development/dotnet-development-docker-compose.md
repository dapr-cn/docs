---
type: docs
title: "使用Docker-Compose进行Dapr .NET SDK开发"
linkTitle: "Docker Compose"
weight: 40000
description: 学习如何使用Docker-Compose进行本地开发
---

## Docker-Compose

*这篇文章是一篇与 .NET 相关的文章，另见 [使用 Docker 进行 Dapr 自托管]({{ ref self-hosted-with-docker.md }}))*

`docker-compose ` 是一个脚手架工具，它被包含在Docker的桌面版本中，可以用来一次同时运行多个容器。 它是将多个容器的生命周期自动化管理的一种方式，并为 Kubernetes 的应用程序提供类似于生产环境的开发体验。

- **优势:** 由于`docker-compose` 为接管了容器管理，所以我们可以将依赖关系作为为应用程序定义的一部分，并停止在机器上的长运行容器。
- **缺点：** 需要更多资源，服务需要被容器化才能使用。
- **缺点：** 不熟悉Docker的情况下，可能对调试和问题诊断造成困难。

### 使用docker-compose

从.NET的角度来看，使用 `docker-compose` 配合 Dapr 不需要专门的指导。 `docker-compose` 运行容器，一旦您的服务放在容器中，它的配置与其他任意的编程技术都是相似的。

{{% alert title="💡 App Port" color="primary" %}}
在容器中，ASP.NET Core应用默认监听80端口。 当有需要时，您可在晚些时候进行`--app-port`的配置。
{{% /alert %}}

总结一下：

- 为每个服务创建一个 `Dockerfile`
- 创建一个 `docker-compose.yaml` 并将其添加到源码仓库中

要了解如何编写 `docker-compose.yaml` ，请查阅： [Hello, docker-compose sample](https://github.com/dapr/samples/tree/master/hello-docker-compose) 。

就像为每个服务在本地运行 `dapr run` 一样，你需要选择一个唯一的app-id。 将此app-id作为容器名称简单易记。

Compose 文件应至少包含：

- 容器使用的网络
- 每个服务的容器
- 一个指定服务端口和app-id的`<service>-daprd` 边车容器。
- 在容器中运行的其他依赖组件 (例如redis)
- 可选：Dapr placement容器 (适用于 Actors)

您也可以在 [eShopOnContainers](https://github.com/dotnet-architecture/eShopOnDapr/blob/master/docker-compose.yml) 示例应用程序中查看一个更大规模的示例。
