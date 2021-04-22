---
type: 文档
title: "使用Docker-Compose进行Dapr .NET SDK开发"
linkTitle: "Docker Compose"
weight: 40000
description: 学习如何使用Docker-Compose进行本地开发
---

## Docker-Compose

*Consider this to be a .NET companion to the [Dapr Self-Hosted with Docker Guide]({{ ref self-hosted-with-docker.md }}))*.

`docker-compose ` 是一个脚手架工具，它被包含在Docker的桌面版本中，可以用来一次同时运行多个容器。 它是将多个容器的生命周期自动化管理的一种方式，并为 Kubernetes 的应用程序提供类似于生产环境的开发体验。

- **Pro:** 因为 `docker-compose` 为您管理容器，所以您可以使依赖关系成为应用程序定义的一部分，并停止在您的机器上的长运行容器。
- **缺点：** 需要更多资源，服务需要被容器化才能使用。
- **Con:** can be difficult to debug and troubleshoot if you are unfamilar with Docker.

### Using docker-compose

From the .NET perspective, there is no specialized guidance needed for `docker-compose` with Dapr. `docker-compose` runs containers, and once your service is in a container, configuring it similar to any other programming technology.

{{% alert title="💡 App Port" color="primary" %}}
In a container, an ASP.NET Core app will listen on port 80 by default. Remember this for when you need to configure the `--app-port` later.
{{% /alert %}}

To summarize the approach:

- Create a `Dockerfile` for each service
- Create a `docker-compose.yaml` and place check it in to the source code repository

To understand the authoring the `docker-compose.yaml` you should start with the [Hello, docker-compose sample](https://github.com/dapr/samples/tree/master/hello-docker-compose).

Similar to running locally with `dapr run` for each service you need to choose a unique app-id. Choosing the container name as the app-id will make this simple to remember.

The compose file will contain at a minimum:

- A network that the containers use to communiate
- Each service's container
- A `<service>-daprd` sidecar container with the service's port and app-id specified
- Additional dependencies that run in containers (redis for example)
- optional: Dapr placement container (for actors)

You can also view a larger example from the [eShopOnContainers](https://github.com/dotnet-architecture/eShopOnDapr/blob/master/docker-compose.yml) sample application.
