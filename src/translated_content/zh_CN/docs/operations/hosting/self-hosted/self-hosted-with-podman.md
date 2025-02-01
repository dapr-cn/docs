---
type: docs
title: "如何使用 Podman 在自托管模式下运行 Dapr"
linkTitle: "Podman 自托管运行"
weight: 20000
description: "使用 Podman 在自托管模式下部署和运行 Dapr 的方法"
---

本文介绍了如何在 Windows/Linux/macOS 机器或虚拟机上使用 Podman 运行 Dapr。

## 准备工作

- [Dapr CLI]({{< ref install-dapr-cli.md >}})
- [Podman](https://podman-desktop.io/downloads)

## 设置 Dapr 环境

要设置 Dapr 控制平面容器并创建默认配置文件，请执行以下命令：

```bash
dapr init --container-runtime podman
```

## 以进程方式运行应用程序和 sidecar

可以使用 [`dapr run` CLI 命令]({{< ref dapr-run.md >}}) 启动 Dapr sidecar 和您的应用程序：

```bash
dapr run --app-id myapp --app-port 5000 -- dotnet run
```

此命令会启动 daprd sidecar 和您的应用程序。

## 以进程方式运行应用程序，sidecar 作为 Docker 容器运行

如果您希望在 Docker 容器中运行 Dapr，而应用程序在主机上以进程方式运行，则需要配置 Podman 使用主机网络，以便 Dapr 和应用程序可以共享 localhost 网络接口。

在 Linux 主机上运行 Podman 时，可以使用以下命令启动 Dapr：

```shell
podman run --network="host" --mount type=bind,source="$(pwd)"/components,target=/components daprio/daprd:edge ./daprd -app-id <my-app-id> -app-port <my-app-port>
```

然后，您可以在主机上运行您的应用程序，它们可以通过 localhost 网络接口进行连接。

## 卸载 Dapr 环境

要卸载 Dapr，请运行：

```bash
dapr uninstall --container-runtime podman --all
```