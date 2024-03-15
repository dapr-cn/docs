---
type: docs
title: 在本地环境中初始化 Dapr
linkTitle: 本地初始化 Dapr
weight: 20
description: 获取 Dapr sidecar 二进制文件并使用 `dapr init` 在本地安装它们
aliases:
  - /zh-hans/getting-started/set-up-dapr/install-dapr/
---

现在您已经 [安装了 Dapr CLI]({{<ref install-dapr-cli.md>}})，使用 CLI 在本地计算机上初始化 Dapr。

Dapr 作为 sidecar 与您的应用程序一起运行。 在自托管模式下，这意味着它是本地计算机上的一个进程。 通过初始化 Dapr，您可以：

- 在本地获取并安装 Dapr sidecar 二进制文件。
- 创建一个开发环境，用Dapr简化应用开发。

Dapr 初始化包括：

1. 运行 **Redis 容器实例** 以用作本地状态存储和消息代理。
2. 运行一个**Zipkin容器实例**以提供可观测性。
3. 创建一个**默认组件文件夹**，其中包含上述的组件定义。
4. 运行 **Dapr Placement 服务容器实例**以获得本地 actor 支持。

{{% alert title="Kubernetes开发环境" color="primary" %}}
要在本地或远程**Kubernetes**集群中初始化Dapr以进行开发（包括上面列出的Redis和Zipkin容器），请参阅[如何在Kubernetes上初始化Dapr进行开发]({{\<ref "kubernetes-deploy.md#install-dapr-from-the-official-dapr-helm-chart-with-development-flag">}})
{{% /alert %}}

{{% alert title="Docker" color="primary" %}}
推荐的开发环境需要[Docker](https://docs.docker.com/install/)。 虽然您可以在不依赖 Docker 的情况下[初始化 Dapr]({{< ref self-hosted-no-docker.md >}})，但本指南中的后续步骤将假定使用推荐的 Docker 开发环境。

您还可以安装[Podman](https://podman.io/)代替docker。 阅读更多关于[使用 Podman 初始化 Dapr]({{< ref dapr-init.md >}})。
{{% /alert %}}

### 第 1 步：打开提升权限终端



{{% codetab %}}

如果您符合以下条件，您将需要使用 `sudo` 运行此快速入门：

- 您使用 `sudo` 运行 Docker 命令，或者
- 安装路径为 `/usr/local/bin` （默认安装路径）。



{{% codetab %}}

以管理员身份运行 Windows 终端或命令提示符。

1. 右键单击 Windows 终端或命令提示符图标。
2. 选择**以管理员身份运行**。



{{< /tabs >}}

### 第 2 步：运行 init CLI 命令



{{% codetab %}}

安装最新的 Dapr 运行时二进制程序:

```bash
dapr init
```

**如果您正在使用 Docker 在 Mac OS Silicon 上安装，请执行以下解决方法，以使 `dapr init` 在不使用 Kubernetes 的情况下与 Docker 通信。**

1. 导航到**Docker Desktop** > **设置** > **高级**。
2. 选择\*\*允许使用默认的 Docker 套接字（需要密码）\*\*复选框。



{{% codetab %}}

安装最新的 Dapr 运行时二进制程序:

```bash
dapr init
```



{{< /tabs >}}

[如果遇到关于 Docker 未安装或未运行的错误消息，请参阅故障排除指南。]({{< ref "common_issues.md#dapr-cant-connect-to-docker-when-installing-the-dapr-cli" >}})

### 第 3 步：验证 Dapr 版本

```bash
dapr --version
```

**Output:**

`命令行工具版本: {{% dapr-latest-version cli="true" %}}` <br>
`运行时版本: {{% dapr-latest-version long="true" %}}`

### 第 4 步：验证容器是否运行

如前所述，`dapr init`命令启动了几个容器，这将帮助你开始使用Dapr。 请确保你有运行着 `daprio/dapr`、`openzipkin/zipkin` 和 `redis` 镜像的容器实例：

```bash
docker ps
```

**Output:**

<img src="/images/install-dapr-selfhost/docker-containers.png" width=800>

### 第 5 步：验证组件目录已初始化

在`dapr init`时，CLI还会创建一个默认的组件文件夹，其中包含了几个YAML文件，用于定义状态存储、发布/订阅和Zipkin。 Dapr sidecar 将读取这些组件并使用：

- 用于状态管理和消息传递的 Redis 容器。
- 用于收集trace的 Zipkin 容器。

通过打开您的组件目录进行验证：

- 在Windows上，在 `%UserProfile%\.dapr`
- 在Linux/MacOS上，在`~/.dapr`下



{{% codetab %}}

```bash
ls $HOME/.dapr
```

**Output:**

`bin  components  config.yaml`

<br>



{{% codetab %}}
您可以使用PowerShell或命令行进行验证。 如果使用PowerShell，请运行：

```powershell
explorer "$env:USERPROFILE\.dapr"
```

如果使用命令行，请运行：

```cmd
explorer "%USERPROFILE%\.dapr"
```

**结果:**

<img src="/images/install-dapr-selfhost/windows-view-components.png" width=600>



{{< /tabs >}}

<br>

{{< button text="下一步: 定义一个组件 >>" page="getting-started/get-started-api.md" >}}
