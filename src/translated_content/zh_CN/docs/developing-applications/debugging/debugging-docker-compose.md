---
type: docs
title: "在 Docker Compose 中调试 Dapr 应用"
linkTitle: "调试 Docker Compose"
weight: 300
description: "本地调试作为 Docker Compose 部署一部分的 Dapr 应用"
---

本文旨在介绍一种方法，如何通过你的 IDE 在本地调试一个或多个使用 Dapr 的应用，同时保持与其他通过 Docker Compose 部署的应用的集成。

我们以一个包含两个服务的 Docker Compose 文件的简单示例为例：
- `nodeapp` - 你的应用
- `nodeapp-dapr` - 你的 `nodeapp` 服务的 Dapr sidecar 进程

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

当你使用 `docker compose -f compose.yml up` 运行这个 Docker 文件时，它将部署到 Docker 并正常运行。

但是，如何在保持与正在运行的 Dapr sidecar 进程以及其他通过 Docker Compose 文件部署的服务集成的情况下调试 `nodeapp` 呢？

我们可以通过引入一个名为 `compose.debug.yml` 的*第二个* Docker Compose 文件来实现。当运行 `up` 命令时，这个第二个 Compose 文件将与第一个文件结合使用。

#### compose.debug.yml
```yaml
services:
  nodeapp: # 通过移除其端口并将其从网络中移除来隔离 nodeapp
    ports: !reset []
    networks: !reset
      - ""
  nodeapp-dapr:
    command: ["./daprd",
     "--app-id", "nodeapp",
     "--app-port", "8080", # 这必须与在 IDE 中调试时应用暴露的端口匹配
     "--resources-path", "./components",
     "--app-channel-address", "host.docker.internal"] # 让 sidecar 在主机上查找应用通道
    network_mode: !reset "" # 重置 network_mode...
    networks: # ... 以便 sidecar 可以进入正常网络
      - hello-dapr
    ports:
      - "3500:3500" # 将 HTTP 端口暴露给主机
      - "50001:50001" # 将 GRPC 端口暴露给主机（Dapr 工作流依赖于 GRPC 通道）

```

接下来，确保你的 `nodeapp` 在你选择的 IDE 中运行/调试，并在你在 `compose.debug.yml` 中上面指定的相同端口上暴露 - 在上面的示例中，这设置为端口 `8080`。

接下来，停止你可能已启动的任何现有 Compose 会话，并运行以下命令以组合运行两个 Docker Compose 文件：

`docker compose -f compose.yml -f compose.debug.yml up`

现在，你应该会发现 Dapr sidecar 和你的调试应用可以相互通信，就像它们在 Docker Compose 环境中正常一起运行一样。

**注意**：需要强调的是，Docker Compose 环境中的 `nodeapp` 服务实际上仍在运行，但它已从 Docker 网络中移除，因此实际上被孤立，因为没有任何东西可以与之通信。

**演示**：观看此视频，了解如何使用 Docker Compose 调试本地 Dapr 应用

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/nWatANwaAik?start=1738" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>