---
type: docs
title: "如何使用 Docker 自托管 Dapr"
linkTitle: "使用 Docker 运行"
weight: 20000
description: "在自托管模式下，如何通过 Docker 部署和运行 Dapr"
---

本文介绍如何在 Windows/Linux/macOS 机器或虚拟机上使用 Docker 运行 Dapr。

## 前提条件

- [Dapr CLI]({{< ref install-dapr-cli.md >}})
- [Docker](https://docs.docker.com/get-docker/)
- [Docker-Compose](https://docs.docker.com/compose/install/)（可选）

## 设置 Dapr 环境

运行以下命令以初始化 Dapr 控制平面并创建默认配置文件：

```bash
dapr init
```

## 以进程形式运行应用和 sidecar

使用 [`dapr run` CLI 命令]({{< ref dapr-run.md >}}) 启动 Dapr sidecar 和您的应用程序：

```bash
dapr run --app-id myapp --app-port 5000 -- dotnet run
```

此命令将启动 daprd sidecar 并运行 `dotnet run`，从而启动您的应用程序。

## 应用以进程形式运行，sidecar 以 Docker 容器形式运行

如果您希望在 Docker 容器中运行 Dapr，而应用程序在主机上以进程形式运行，则需要配置 Docker 使用主机网络，以便 Dapr 和应用程序可以共享 localhost 网络接口。

{{% alert title="注意" color="warning" %}}
Docker 的 host 网络模式仅支持 Linux 主机。
{{% /alert %}}

在 Linux 主机上运行 Docker 守护进程时，可以使用以下命令启动 Dapr：

```shell
docker run --net="host" --mount type=bind,source="$(pwd)"/components,target=/components daprio/daprd:edge ./daprd -app-id <my-app-id> -app-port <my-app-port>
```

然后，您可以在主机上运行您的应用程序，它们应通过 localhost 网络接口进行连接。

## 在单个 Docker 容器中运行应用和 Dapr
> 仅用于开发目的

不建议在同一个容器中同时运行 Dapr 运行时和应用程序。然而，在本地开发场景中可以这样做。

为此，您需要编写一个 Dockerfile 来安装 Dapr 运行时、Dapr CLI 和您的应用程序代码。然后您可以使用 Dapr CLI 调用 Dapr 运行时和您的应用程序代码。

下面是一个实现此目的的 Dockerfile 示例：

```docker
FROM python:3.7.1
# 安装 dapr CLI
RUN wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash

# 安装 daprd
ARG DAPR_BUILD_DIR
COPY $DAPR_BUILD_DIR /opt/dapr
ENV PATH="/opt/dapr/:${PATH}"
RUN dapr init --slim

# 安装您的应用
WORKDIR /app
COPY python .
RUN pip install requests
ENTRYPOINT ["dapr"]
CMD ["run", "--app-id", "nodeapp", "--app-port", "3000", "node", "app.js"]
```

请记住，如果 Dapr 需要与其他组件通信，例如 Redis，这些也需要对其可访问。

## 在 Docker 网络上运行

如果您有多个 Dapr 实例在 Docker 容器中运行，并希望它们能够相互通信（例如用于服务调用），那么您需要创建一个共享的 Docker 网络，并确保这些 Dapr 容器连接到该网络。

您可以使用以下命令创建一个简单的 Docker 网络：
```bash
docker network create my-dapr-network
```
在运行您的 Docker 容器时，您可以使用以下命令将它们连接到网络：
```bash
docker run --net=my-dapr-network ...
```
每个容器将在该网络上接收一个唯一的 IP，并能够与该网络上的其他容器通信。

## 使用 Docker-Compose 运行

[Docker Compose](https://docs.docker.com/compose/) 可用于定义多容器应用程序配置。如果您希望在本地运行多个带有 Dapr sidecar 的应用程序而不使用 Kubernetes，建议使用 Docker Compose 定义（`docker-compose.yml`）。

Docker Compose 的语法和工具超出了本文的范围，建议您参考[官方 Docker 文档](https://docs.docker.com/compose/)以获取更多详细信息。

为了使用 Dapr 和 Docker Compose 运行您的应用程序，您需要在 `docker-compose.yml` 中定义 sidecar 模式。例如：

```yaml
version: '3'
services:
  nodeapp:
    build: ./node
    ports:
      - "50001:50001" # Dapr 实例通过 gRPC 通信，因此我们需要暴露 gRPC 端口
    depends_on:
      - redis
      - placement
    networks:
      - hello-dapr
  nodeapp-dapr:
    image: "daprio/daprd:edge"
    command: [
      "./daprd",
     "--app-id", "nodeapp",
     "--app-port", "3000",
     "--placement-host-address", "placement:50006", # Dapr 的 placement 服务可以通过 docker DNS 条目访问
     "--resources-path", "./components"
     ]
    volumes:
        - "./components/:/components" # 挂载我们的组件文件夹供运行时使用。挂载位置必须与 --resources-path 参数匹配。
    depends_on:
      - nodeapp
    network_mode: "service:nodeapp" # 将 nodeapp-dapr 服务附加到 nodeapp 网络命名空间

  ... # 部署其他 daprized 服务和组件（例如 Redis）

  placement:
    image: "daprio/dapr"
    command: ["./placement", "--port", "50006"]
    ports:
      - "50006:50006"

  scheduler:
    image: "daprio/dapr"
    command: ["./scheduler", "--port", "50007"]
    ports:
      - "50007:50007"
    # 警告 - 这是一个 tmpfs 卷，您的状态不会在重启后持久化
    volumes:
    - type: tmpfs
      target: /data
      tmpfs:
        size: "10000"
  
  networks:
    hello-dapr: null
```

> 对于在 Linux 主机上运行 Docker 守护进程的用户，您还可以使用 `network_mode: host` 来利用主机网络（如果需要）。

要进一步了解如何使用 Docker Compose 运行 Dapr，请参阅 [Docker-Compose 示例](https://github.com/dapr/samples/tree/master/hello-docker-compose)。

上述示例还包括一个使用非持久性数据存储进行测试和开发目的的调度器定义。

## 在 Kubernetes 上运行

如果您的部署目标是 Kubernetes，请使用 Dapr 的一流集成。请参阅
[Dapr 在 Kubernetes 上的文档]({{< ref "kubernetes-overview.md" >}})。

## 名称解析

Dapr 默认使用 mDNS 作为自托管模式下的名称解析组件进行服务调用。如果您在虚拟机上运行 Dapr 或 mDNS 不可用的地方运行 Dapr，则可以使用 [HashiCorp Consul]({{< ref setup-nr-consul.md >}}) 组件进行名称解析。

## Docker 镜像

Dapr 提供了多个不同组件的预构建 Docker 镜像，您应选择适合您所需二进制文件、架构和标签/版本的相关镜像。

### 镜像
在 [Docker Hub](https://hub.docker.com/u/daprio) 上提供了每个 Dapr 组件的已发布 Docker 镜像。
- [daprio/dapr](https://hub.docker.com/r/daprio/dapr)（包含所有 Dapr 二进制文件）
- [daprio/daprd](https://hub.docker.com/r/daprio/daprd)
- [daprio/placement](https://hub.docker.com/r/daprio/placement)
- [daprio/sentry](https://hub.docker.com/r/daprio/sentry)
- [daprio/dapr-dev](https://hub.docker.com/r/daprio/dapr-dev)

### 标签

#### Linux/amd64
- `latest`: 最新发布版本，**仅**用于开发目的。
- `edge`: 最新的 edge 构建（master）。
- `major.minor.patch`: 发布版本。
- `major.minor.patch-rc.iteration`: 发布候选版本。
#### Linux/arm/v7
- `latest-arm`: ARM 的最新发布版本，**仅**用于开发目的。
- `edge-arm`: ARM 的最新 edge 构建（master）。
- `major.minor.patch-arm`: ARM 的发布版本。
- `major.minor.patch-rc.iteration-arm`: ARM 的发布候选版本。
