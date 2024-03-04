---
type: docs
title: 在 Docker Compose 中运行的 Dapr 应用程序调试
linkTitle: Debugging Docker Compose
weight: 300
description: 本地调试 Dapr 应用程序，这些应用程序是 Docker Compose 部署的一部分
---

本文的目标是演示一种调试一种或多种daprised应用程序（通过您的IDE，在本地）的方法，同时保持与部署在docker compose环境中的其他应用程序集成。

让我们以一个最简单的 docker compose 文件示例为例，其中只包含两个服务：

- `nodeapp` - 您的应用程序
- `nodeapp-dapr` - 将 dapr sidecar 进程添加到您的 `nodeapp` 服务中

#### compose.yml

```yaml
services:
  nodeapp:
    build: ./node
    ports:
      - "50001:50001"
    networks:
      - hello-dapr
  nodeapp-dapr:
    image: "daprio/daprd:edge"
    command: [
      "./daprd",
     "--app-id", "nodeapp",
     "--app-port", "3000",
     "--resources-path", "./components"
     ]
    volumes:
        - "./components/:/components"
    depends_on:
      - nodeapp
    network_mode: "service:nodeapp"
networks:
  hello-dapr
```

当您使用 `docker compose -f compose.yml up` 运行此 docker 文件时，它将部署到 Docker 并正常运行。

但是我们如何在仍与正在运行的 dapr sidecar 进程集成的情况下调试 `nodeapp`，以及您可能通过 Docker compose 文件部署的任何其他内容？

让我们首先介绍一个名为`compose.debug.yml`的_第二_个docker compose文件。 当运行 `up` 命令时，这个第二个组合文件将会与第一个组合文件合并。

#### compose.debug.yml

```yaml
services:
  nodeapp: # Isolate the nodeapp by removing its ports and taking it off the network
    ports: !reset []
    networks: !reset
      - ""
  nodeapp-dapr:
    command: ["./daprd",
     "--app-id", "nodeapp",
     "--app-port", "8080", # This must match the port that your app is exposed on when debugging in the IDE
     "--resources-path", "./components",
     "--app-channel-address", "host.docker.internal"] # Make the sidecar look on the host for the App Channel
    network_mode: !reset "" # Reset the network_mode...
    networks: # ... so that the sidecar can go into the normal network
      - hello-dapr
    ports:
      - "3500:3500" # Expose the HTTP port to the host
      - "50001:50001" # Expose the GRPC port to the host (Dapr Worfklows depends upon the GRPC channel)

```

接下来，确保您选择的IDE中正在运行/调试您的`nodeapp`，并且在`compose.debug.yml`中指定的端口上公开 - 在上面的示例中，该端口设置为`8080`。

接下来，停止您可能已启动的任何现有 compose 会话，并运行以下命令以运行组合在一起的两个 docker compose 文件：

`docker compose -f compose.yml -f compose.debug.yml up`

现在，您应该发现 dapr sidecar 和您的调试应用程序将彼此具有双向通信，就好像它们在 Docker compose 环境中正常运行一样。

**注意**：需要强调的是，在 Docker Compose 环境中，`nodeapp` 服务实际上仍在运行，但已从 Docker 网络中移除，因此它实际上是一个孤立的实例，无法与其通信。

**演示** ： 观看此视频，了解如何使用 Docker Compose 调试本地 Dapr 应用程序

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/nWatANwaAik?start=1738" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
