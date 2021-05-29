---
type: docs
title: "入门指南: 使用 Docker 在自托管模式下运行 Dapr"
linkTitle: "使用 Docker 运行"
weight: 20000
description: "如何使用 Docker 在自托管模式下部署和运行 Dapr"
---

This article provides guidance on running Dapr with Docker on a Windows/Linux/macOS machine or VM.

## 先决条件

- [Dapr CLI]({{< ref install-dapr-cli.md >}})
- [Docker](https://docs.docker.com/get-docker/)
- [Docker-Compose](https://docs.docker.com/compose/install/) (可选)

## Initialize Dapr environment

To initialize the Dapr control-plane containers and create a default configuration file, run:

```bash
dapr init
```

## Run both app and sidecar as a process

The [`dapr run` CLI command]({{< ref dapr-run.md >}}) can be used to launch a Dapr sidecar along with your application:

```bash
dapr run --app-id myapp --app-port 5000 -- dotnet run
```

This command will launch both the daprd sidecar binary and run `dotnet run`, launching your application.

## Run app as a process and sidecar as a Docker container

Alternately, if you are running Dapr in a Docker container and your app as a process on the host machine, then you need to configure Docker to use the host network so that Dapr and the app can share a localhost network interface.

{{% alert title="Note" color="warning" %}}
The host networking driver for Docker is only supported on Linux hosts.
{{% /alert %}}

If you are running your Docker daemon on a Linux host, you can run the following to launch Dapr:

```shell
docker run --net="host" --mount type=bind,source="$(pwd)"/components,target=/components daprio/daprd:edge ./daprd -app-id <my-app-id> -app-port <my-app-port>
```

然后，你可以在主机上运行你的应用程序，他们应该通过localhost网络接口连接。

## Run both app and Dapr in a single Docker container
> 仅用于开发目的

不建议在同一容器内运行 Dapr 运行时和应用程序。 但是，对于本地开发的场景，可以这样做。

为了做到这一点，你需要编写一个Docker文件，安装Dapr运行时、Dapr CLI和你的应用代码。 然后，您可以使用 Dapr CLI 调用Dapr 运行时和您的应用代码。

下面是实现这一目标的Docker文件的例子。

```docker
FROM python:3.7.1
# Install dapr CLI
RUN wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash

# Install daprd
ARG DAPR_BUILD_DIR
COPY $DAPR_BUILD_DIR /opt/dapr
ENV PATH="/opt/dapr/:${PATH}"

# Install your app
WORKDIR /app
COPY python .
RUN pip install requests
ENTRYPOINT ["dapr"]
CMD ["run", "--app-id", "nodeapp", "--app-port", "3000", "node", "app.js"]
```

请记住，如果Dapr需要与其他组件通信，即： Redis，这些也需要让它访问。 Redis，这些也需要让它访问。

## 在 Docker 网络运行

If you have multiple instances of Dapr running in Docker containers and want them to be able to communicate with each other *i.e. for service invocation*, then you'll need to create a shared Docker network and make sure those Dapr containers are attached to it.

您可以使用以下方法创建一个简单的Docker网络:
```bash
docker network create my-dapr-network
```
当运行您的 Docker 容器时，您可以通过以下方式将其附加到网络:
```bash
docker run --net=my-dapr-network ...
```
每个容器将在该网络上获得一个唯一的IP，并能与该网络上的其他容器进行通信。

## 使用 Docker-Compose 运行

[Docker Compose](https://docs.docker.com/compose/) can be used to define multi-container application configurations. 如果您希望在没有Kubernetes的情况下，在本地使用Dapr sidecars运行多个应用程序，那么建议使用Docker Compose定义（`docker-compose.yml`）。

Docker Compose的语法和工具超出了本文的范围，但是，建议你参考[官方Docker文档](https://docs.docker.com/compose/)了解更多细节。

为了使用Dapr和Docker Compose运行您的应用程序，您需要在您的`docker-compose.yml`中定义sidecar模式。 例如:

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
     "-app-id", "nodeapp",
     "-app-port", "3000",
     "-placement-host-address", "placement:50006" # Dapr's placement service can be reach via the docker DNS entry
     ]
    volumes:
        - "./components/:/components" # Mount our components folder for the runtime to use
    depends_on:
      - nodeapp
    network_mode: "service:nodeapp" # Attach the nodeapp-dapr service to the nodeapp network namespace

  ... # Deploy other daprized services and components (i.e. Redis)

  placement:
    image: "daprio/dapr"
    command: ["./placement", "-port", "50006"]
    ports:
      - "50006:50006"
    networks:
      - hello-dapr Redis)

  placement:
    image: "daprio/dapr"
    command: ["./placement", "-port", "50006"]
    ports:
      - "50006:50006"
    networks:
      - hello-dapr
```

> 对于那些在Linux主机上运行Docker守护进程的用户，如果需要的话，还可以使用`network_mode: host`来利用主机联网。

要进一步了解如何使用 Docker Compose 运行 Dapr，请参见 [Docker-Compose Sample](https://github.com/dapr/samples/tree/master/hello-docker-compose)。

## 在 Kubernetes 运行

If your deployment target is Kubernetes please use Dapr's first-class integration. Refer to the [Dapr on Kubernetes docs]({{< ref "kubernetes-overview.md" >}}).

## Docker images

Dapr 为不同的组件提供了许多预构建的 Docker 镜像，您应该为所需的二进制、架构和 标签/版本 选择相关镜像。

### Images
[Docker Hub](https://hub.docker.com/u/daprio)上，每个 Dapr 组件都有已发布的 Docker 镜像。
- [daprio/dapr](https://hub.docker.com/r/daprio/dapr) (包含所有Dapr binaries)
- [daprio/daprd](https://hub.docker.com/r/daprio/daprd)
- [daprio/placement](https://hub.docker.com/r/daprio/placement)
- [daprio/sentry](https://hub.docker.com/r/daprio/sentry)
- [daprio/dapr-dev](https://hub.docker.com/r/daprio/dapr-dev)

### Tags

#### Linux/amd64
- `latest`：最新版本，**仅** 用于开发目的。
- `edge`: 最新的edge构建(master)。
- `major.minor.patch`: 发布版本。
- `major.patch-rc.iteration`: 候选发布。
#### Linux/arm/v7
- `latest-arm`：最新的ARM版本， **只** 用于开发目的。
- `edge-arm`: ARM的最新的edge构建(master)。
- `major.minor.patch-arm`: ARM的发布版本。
- `major.patch-rc.iteration`: ARM的候选发布。