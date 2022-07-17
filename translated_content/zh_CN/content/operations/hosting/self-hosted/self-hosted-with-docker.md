---
type: docs
title: "入门指南: 使用 Docker 在自托管模式下运行 Dapr"
linkTitle: "使用 Docker 运行"
weight: 20000
description: "如何使用 Docker 在自托管模式下部署和运行 Dapr"
---

本文提供了关于在 Kubernetes 之外与Docker一起运行 Dapr 的指导。 有许多不同的配置，你可能希望用Docker来运行Dapr，这些配置被记录在下面。

## 先决条件
- [Docker](https://docs.docker.com/get-docker/)
- [Docker-Compose](https://docs.docker.com/compose/install/) (可选)

## 选择Docker镜像
Dapr 为不同的组件提供了许多预构建的 Docker 镜像，您应该为所需的二进制、架构和 标签/版本 选择相关镜像。

### Images
[Docker Hub](https://hub.docker.com/u/daprio)上，每个 Dapr 组件都有已发布的 Docker 镜像。
- [daprio/dapr](https://hub.docker.com/r/daprio/dapr) (包含所有Dapr binaries)
- [daprio/daprd](https://hub.docker.com/r/daprio/daprd)
- [daprio/placement](https://hub.docker.com/r/daprio/placement)
- [daprio/sentry](https://hub.docker.com/r/daprio/sentry)
- [daprio/dapr-dev](https://hub.docker.com/r/daprio/dapr-dev)

### 标签
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

## 以进程运行应用
> 仅用于开发目的

如果您在 Docker 容器中运行 Dapr，并且您的应用程序在主机上作为一个进程运行，那么您需要配置一下 Docker来使用主机网络，这样Dapr和应用程序就可以共享一个本地host网络接口。 遗憾的是，Docker的主机网络驱动只在Linux主机上支持。 如果您在Linux主机上运行Docker守护进程，您应该能够运行以下内容来启动Dapr。
```shell
docker run --net="host" --mount type=bind,source="$(pwd)"/components,target=/components daprio/daprd:edge ./daprd -app-id <my-app-id> -app-port <my-app-port>
```
然后，你可以在主机上运行你的应用程序，他们应该通过localhost网络接口连接。

但是，如果你没有在Linux主机上运行Docker守护进程，建议你按照以下步骤运行 您的应用程序和[Docker容器中使用Docker Compose的Dapr运行时](#run-dapr-in-a-docker-container-using-docker-compose)。

## 在单个Docker容器中运行应用程序和Dapr。
> 仅用于开发目的

不建议在同一容器内运行 Dapr 运行时和应用程序。 但是，对于本地开发的场景，可以这样做。 为了做到这一点，你需要编写一个Docker文件，安装Dapr运行时、Dapr CLI和你的应用代码。 然后，您可以使用 Dapr CLI 调用Dapr 运行时和您的应用代码。

下面是实现这一目标的Docker文件的例子。
```
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
如果您有多个Dapr实例运行在Docker容器中，并希望它们能够 互相通信，即服务调用，那么你就需要创建一个共享的Docker网络。 并确保那些Dapr容器与之相连。

您可以使用以下方法创建一个简单的Docker网络
```
docker network create my-dapr-network
```
当运行您的 Docker 容器时，您可以通过以下方式将其附加到网络
```
docker run --net=my-dapr-network ...
```
每个容器将在该网络上获得一个唯一的IP，并能与该网络上的其他容器进行通信。

## 使用 Docker-Compose 运行
[Docker Compose](https://docs.docker.com/compose/)可以用来定义多容器应用配置。 如果您希望在没有Kubernetes的情况下，在本地使用Dapr sidecars运行多个应用程序，那么建议使用Docker Compose定义（`docker-compose.yml`）。

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
如果你的部署目标是Kubernetes，那么你可能最好直接在Kubernetes平台上运行你的applicationaiton和Dapr sidecars。 在Kubernetes上运行Dapr是一等一的体验，并有单独的文档。 Please refer to the [Dapr on Kubernetes docs]({{< ref "kubernetes-overview.md" >}})

