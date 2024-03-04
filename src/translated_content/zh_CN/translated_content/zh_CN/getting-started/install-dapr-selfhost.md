---
type: docs
title: "在本地环境中初始化 Dapr"
linkTitle: "本地初始化 Dapr"
weight: 20
description: "获取 Dapr sidecar 二进制文件并使用 `dapr init` 在本地安装它们"
aliases:
  - /zh-hans/getting-started/set-up-dapr/install-dapr/
---

现在您已经 [安装了 Dapr CLI]({{<ref install-dapr-cli.md>}})，使用 CLI 在本地计算机上初始化 Dapr。

Dapr 作为 sidecar 与您的应用程序一起运行。 在自托管模式下，这意味着它是本地计算机上的一个进程。 通过初始化 Dapr，您可以：

- 在本地获取并安装 Dapr sidecar 二进制文件。
- 创建一个开发环境，用Dapr简化应用开发。

Dapr 初始化包括：

1. 运行一个用于状态存储和消息代理的** Redis 容器实例**.
1. 运行一个用于提供可观察性的** Zipkin 容器实例**.
1. 创建具有上述组件定义的**默认组件文件夹**.
1. 运行用于本地 actor 支持的** Dapr placement 服务容器实例**.

{{% alert title="Docker" color="primary" %}}
推荐的开发环境需要 [Docker](https://docs.docker.com/install/)。 虽然你可以 [在不依赖Docker的情况下初始化Dapr]({{<ref self-hosted-no-docker.md>}})，但本指南接下来的步骤都是假设推荐的Docker开发环境。

您还可以安装 [Podman](https://podman.io/) 代替 Docker。 阅读更多关于 [使用 Podman 初始化 Dapr]({{<ref dapr-init.md>}}).
{{% /alert %}}

### 第 1 步：打开提升权限终端

{{< tabs "Linux/MacOS" "Windows">}}

{{% codetab %}}

在以下情况下，您将需要使用 `sudo` 进行此快速入门：

- 您使用 `sudo`运行 Docker 命令，或者
- 安装路径为 `/usr/local/bin` （默认安装路径）。

{{% /codetab %}}

{{% codetab %}}

以管理员身份运行 Windows 终端或命令提示符。

1. 右键单击 Windows 终端或命令提示符图标。
1. 选择 **以管理员身份运行**。

{{% /codetab %}}

{{< /tabs >}}

### 第 2 步：运行 init CLI 命令

安装最新的 Dapr 运行时二进制程序:

```bash
dapr init
```

### 第 3 步：验证 Dapr 版本

```bash
dapr --version
```

**输出:**

`CLI version: {{% dapr-latest-version cli="true" %}}` <br> `Runtime version: {{% dapr-latest-version long="true" %}}`

### 第 4 步：验证容器是否运行

如上所述， `dapr init` 命令启动了几个容器，这将有助于你开始使用 Dapr。 验证您有是否有运行 `daprio/dapr`、 `openzipkin/zipkin` 和 `redis` 映像的容器实例：

```bash
docker ps
```

**输出:**

<img src="/images/install-dapr-selfhost/docker-containers.png" width=800>

### 第 5 步：验证组件目录已初始化

在 `dapr init`上，CLI 还会创建一个默认组件文件夹，其中包含多个 YAML 文件，其中包含状态存储、Pub/sub（发布/订阅）和 Zipkin 的定义。 Dapr sidecar 将读取这些组件并使用：

- 用于状态管理和消息传递的 Redis 容器。
- 用于收集trace的 Zipkin 容器。

通过打开您的组件目录进行验证：

- 在Windows上，在 `%UserProfile%\.dapr`
- 在Linux/MacOS上，在 `~/.dapr`

{{< tabs "Linux/MacOS" "Windows">}}

{{% codetab %}}

```bash
ls $HOME/.dapr
```

**输出:**

`bin  components  config.yaml`

<br>

{{% /codetab %}}

{{% codetab %}}

```powershell
explorer "%USERPROFILE%\.dapr\"
```

**结果:**

<img src="/images/install-dapr-selfhost/windows-view-components.png" width=600>

{{% /codetab %}}

{{< /tabs >}}

<br>

{{< button text="下一步：使用 Dapr API >>" page="getting-started/get-started-api.md" >}}

