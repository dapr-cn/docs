---
type: docs
title: "操作方法: 使用 Docker 在自托管模式下运行 Dapr"
linkTitle: "使用 Docker 运行"
weight: 20000
description: "如何使用 Docker 在自托管模式下部署和运行 Dapr"
---

This article provides guidance on running Dapr with Docker on a Windows/Linux/macOS machine or VM.

## Prerequisites

- [Dapr CLI]({{< ref install-dapr-cli.md >}})
- [Docker](https://docs.docker.com/get-docker/)
- [Docker-Compose](https://docs.docker.com/compose/install/) (optional)

## 初始化 Dapr 环境

要初始化 Dapr 控制平面容器并创建默认配置文件，请运行：

```bash
dapr init
```

## 将应用和 sidecar 作为进程运行

[`dapr run` CLI 命令行]({{< ref dapr-run.md >}}) 用于启动 Dapr sidecar 和您的应用程序：

```bash
dapr run --app-id myapp --app-port 5000 -- dotnet run
```

此命令将同时启动 daprd sidecar 二进制文件，并执行 `dotnet run` 以启动您的应用程序。

## 将应用作为进程运行，将 sidecar 作为 Docker 容器运行

如果您在 Docker 容器中运行 Dapr，并且您的应用程序在主机上作为一个进程运行，那么您需要配置一下 Docker 来使用主机网络，这样Dapr和应用程序就可以共享一个 localhost 网络接口。

{{% alert title="Note" color="warning" %}}
Docker 的主机网络驱动只在 Linux 主机上支持。
{{% /alert %}}

如果您在 Linux 上运行 Docker，运行下述命令以启动 Dapr。

```shell
docker run --net="host" --mount type=bind,source="$(pwd)"/components,target=/components daprio/daprd:edge ./daprd -app-id <my-app-id> -app-port <my-app-port>
```

然后，你可以在主机上运行你的应用程序，他们应该通过 localhost 网络接口连接。

## 在单个 Docker 容器中同时运行应用和 Dapr
> For development purposes ONLY

不建议在同一容器内运行 Dapr 运行时和应用程序。 但是，对于本地开发的场景，可以这样做。

为了做到这一点，你需要编写 Docker 文件，安装 Dapr 运行时、Dapr CLI 和你的应用代码。 然后，您可以使用 Dapr CLI 调用Dapr 运行时和您的应用代码。

下面是实现这一目标的 Docker 文件的例子。

```docker
FROM python:3.7.1
# Install dapr CLI
RUN wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash

# Install daprd
ARG DAPR_BUILD_DIR
COPY $DAPR_BUILD_DIR /opt/dapr
ENV PATH="/opt/dapr/:${PATH}"
RUN dapr init --slim

# Install your app
WORKDIR /app
COPY python .
RUN pip install requests
ENTRYPOINT ["dapr"]
CMD ["run", "--app-id", "nodeapp", "--app-port", "3000", "node", "app.js"]
```

请记住，如果 Dapr 需要与其他组件通信，即： Redis，这些也需要让它访问。 Redis，这些也需要让它访问。

## 在 Docker 网络运行

如果您有多个 Dapr 实例运行在在 Docker 容器中，并且希望他们能够互相通讯 *例如，服务调用*，那么您就需要创建一个共享的 Docker 网络，并且确保这些 Dapr 容器与之相连。

您可以使用以下方法创建一个简单的 Docker 网络:
```bash
docker network create my-dapr-network
```
当运行您的 Docker 容器时，您可以通过以下方式将其附加到网络:
```bash
docker run --net=my-dapr-network ...
```
每个容器将在该网络上获得一个唯一的IP，并能与该网络上的其他容器进行通信。

## 使用 Docker-Compose 运行

[Docker Compose](https://docs.docker.com/compose/) 可以用来定义多容器应用配置。 如果您希望在没有 Kubernetes 的情况下，在本地使用 Dapr sidecar 运行多个应用程序，那么建议使用 Docker Compose 定义（`docker-compose.yml`）。

Docker Compose 的语法和工具超出了本文的范围，但是，建议你参考[官方 Docker 文档](https://docs.docker.com/compose/)了解更多细节。

为了使用 Dapr 和 Docker Compose 运行您的应用程序，您需要在您的`docker-compose.yml`中定义 sidecar 模式。 例如：

```yaml
version: '3'
services:
  nodeapp:
    build: ./node
    ports:
      - "50001:50001" # Dapr instances communicate over gRPC so we need to expose the gRPC port
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
     "--placement-host-address", "placement:50006", # Dapr's placement service can be reach via the docker DNS entry
     "--resources-path", "./components"
     ]
    volumes:
        - "./components/:/components" # Mount our components folder for the runtime to use. The mounted location must match the --resources-path argument.
    depends_on:
      - nodeapp
    network_mode: "service:nodeapp" # Attach the nodeapp-dapr service to the nodeapp network namespace

  ... # Deploy other daprized services and components (i.e. Redis)

  placement:
    image: "daprio/dapr"
    command: ["./placement", "--port", "50006"]
    ports:
      - "50006:50006"

  networks:
    hello-dapr: null
```

> 对于那些在 Linux 主机上运行 Docker 守护进程的用户，如果需要的话，还可以使用 `network_mode: host` 来利用主机网络。

要进一步了解如何使用 Docker Compose 运行 Dapr，请参见 [Docker-Compose Sample](https://github.com/dapr/samples/tree/master/hello-docker-compose)。

## 在 Kubernetes 运行

如果您的部署目标是 Kubernetes，请使用 Dapr 的一流集成。 请参阅 [Dapr on Kubernetes 文档]({{< ref "kubernetes-overview.md" >}})。

## 名称解析

默认情况下，Dapr 使用 mDNS 作为自托管模式下的名称解析组件进行服务调用。 如果您在虚拟机或者其他不支持 mTLS 的场景下运行 Dapr，您可以使用 [HashiCorp Consul]({{< ref setup-nr-consul.md >}}) 组件用于名称解析。

## Docker 镜像

Dapr 为不同的组件提供了许多预构建的 Docker 镜像，您应该为所需的二进制、架构和 标签/版本 选择相关镜像。

### Images
[Docker Hub](https://hub.docker.com/u/daprio)上，每个 Dapr 组件都有已发布的 Docker 镜像。
- [daprio/dapr](https://hub.docker.com/r/daprio/dapr) (contains all Dapr binaries)
- [daprio/daprd](https://hub.docker.com/r/daprio/daprd)
- [daprio/placement](https://hub.docker.com/r/daprio/placement)
- [daprio/sentry](https://hub.docker.com/r/daprio/sentry)
- [daprio/dapr-dev](https://hub.docker.com/r/daprio/dapr-dev)

### Tags

#### Linux/amd64
- `latest`: The latest release version, **ONLY** use for development purposes.
- `edge`: 最新的 edge 构建(master)。
- `major.minor.patch`: 发布版本。
- `major.patch-rc.iteration`: 候选发布。
#### Linux/arm/v7
- `latest-arm`: The latest release version for ARM, **ONLY** use for development purposes.
- `edge-arm`: ARM 的最新的 edge 构建(master)。
- `major.minor.patch-arm`: ARM的发布版本。
- `major.patch-rc.iteration`: ARM的候选发布。
