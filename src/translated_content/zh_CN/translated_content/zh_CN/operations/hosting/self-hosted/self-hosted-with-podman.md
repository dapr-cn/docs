---
type: docs
title: "How-To: Run Dapr in self-hosted mode with Podman"
linkTitle: "Run with Podman"
weight: 20000
description: "How to deploy and run Dapr in self-hosted mode using Podman"
---

This article provides guidance on running Dapr with Podman on a Windows/Linux/macOS machine or VM.

## Prerequisites

- [Dapr CLI]({{< ref install-dapr-cli.md >}})
- [Podman](https://podman.io/getting-started/installation.html)

## 初始化 Dapr 环境

要初始化 Dapr 控制平面容器并创建默认配置文件，请运行：

```bash
dapr init --container-runtime podman
```

## 将应用和 sidecar 作为进程运行

[`dapr run` CLI 命令行]({{< ref dapr-run.md >}}) 用于启动 Dapr sidecar 和您的应用程序：

```bash
dapr run --app-id myapp --app-port 5000 -- dotnet run
```

This command launches both the daprd sidecar and your application.

## 将应用作为进程运行，将 sidecar 作为 Docker 容器运行

Alternately, if you are running Dapr in a Docker container and your app as a process on the host machine, then you need to configure Podman to use the host network so that Dapr and the app can share a localhost network interface.

If you are running Podman on Linux host then you can run the following to launch Dapr:

```shell
podman run --network="host" --mount type=bind,source="$(pwd)"/components,target=/components daprio/daprd:edge ./daprd -app-id <my-app-id> -app-port <my-app-port>
```

然后，你可以在主机上运行你的应用程序，他们应该通过 localhost 网络接口连接。

## Uninstall Dapr environment

To uninstall Dapr completely, run:

```bash
dapr uninstall --container-runtime podman --all
```
