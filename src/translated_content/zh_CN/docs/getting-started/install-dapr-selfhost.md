---
type: docs
title: "在本地环境中配置 Dapr"
linkTitle: "本地配置 Dapr"
weight: 20
description: "使用 `dapr init` 获取并在本地安装 Dapr sidecar 二进制文件"
aliases:
  - /zh-hans/getting-started/set-up-dapr/install-dapr/
---

现在您已经[安装了 Dapr CLI]({{<ref install-dapr-cli.md>}})，可以使用 CLI 在本地计算机上配置 Dapr。

Dapr 作为一个附属进程与您的应用程序一起运行。在自托管模式下，这意味着它在您的本地计算机上作为一个进程运行。通过配置 Dapr，您可以：

- 获取并在本地安装 Dapr sidecar 的二进制文件。
- 创建一个简化应用程序开发的环境。

Dapr 的配置过程包括：

1. 启动一个 **Redis 容器实例** 作为本地状态存储和消息代理。
2. 启动一个 **Zipkin 容器实例** 以实现可观测性。
3. 创建一个包含上述组件定义的 **默认组件文件夹**。
4. 启动一个 **Dapr placement service 容器实例** 以支持本地 actor。
5. 启动一个 **Dapr scheduler service 容器实例** 以进行任务调度。

{{% alert title="Kubernetes 开发环境" color="primary" %}}
要在本地或远程 **Kubernetes** 集群中配置 Dapr 进行开发（包括上面列出的 Redis 和 Zipkin 容器），请参阅[如何在 Kubernetes 上配置 Dapr 进行开发]({{<ref "kubernetes-deploy.md#install-dapr-from-the-official-dapr-helm-chart-with-development-flag" >}})
{{% /alert %}}

{{% alert title="Docker" color="primary" %}}
推荐的开发环境需要 [Docker](https://docs.docker.com/install/)。虽然您可以[在没有 Docker 依赖的情况下配置 Dapr]({{< ref self-hosted-no-docker.md >}})，但本指南的下一步假设您使用推荐的 Docker 开发环境。

您也可以安装 [Podman](https://podman.io/) 代替 Docker。阅读更多关于[使用 Podman 配置 Dapr]({{< ref dapr-init.md >}})的信息。
{{% /alert %}}

### 步骤 1：打开具有管理员权限的终端

{{< tabs "Linux/MacOS" "Windows">}}

{{% codetab %}}

如果您在运行 Docker 命令时使用 `sudo`，或者安装路径是 `/usr/local/bin`（默认安装路径），则需要在此快速入门中使用 `sudo`。

{{% /codetab %}}

{{% codetab %}}

以管理员身份运行 Windows Terminal 或命令提示符。

1. 右键单击 Windows Terminal 或命令提示符图标。
2. 选择 **以管理员身份运行**。

{{% /codetab %}}

{{< /tabs >}}

### 步骤 2：运行 init CLI 命令

{{< tabs "Linux/MacOS" "Windows">}}

{{% codetab %}}

安装最新的 Dapr 运行时二进制文件：

```bash
dapr init
```

如果您在运行 Docker 命令时使用 sudo，则需要使用：

```bash
sudo dapr init
```

如果您在 **Mac OS Silicon** 上使用 Docker 安装，可能需要执行以下变通方法以使 `dapr init` 能够在不使用 Kubernetes 的情况下与 Docker 通信。
1. 导航到 **Docker Desktop** > **Settings** > **Advanced**。
2. 选中 **允许使用默认 Docker 套接字（需要密码）** 复选框。

{{% /codetab %}}

{{% codetab %}}

安装最新的 Dapr 运行时二进制文件：

```bash
dapr init
```

{{% /codetab %}}

{{< /tabs >}}

**预期输出：**

<img src="/images/install-dapr-selfhost/dapr-init-output.png" style=
"padding-bottom: 5px" >

[如果您遇到任何关于 Docker 未安装或未运行的错误消息，请参阅故障排除指南。]({{< ref "common_issues.md#dapr-cant-connect-to-docker-when-installing-the-dapr-cli" >}})

### 步骤 3：验证 Dapr 版本

```bash
dapr --version
```

**输出：**  

`CLI version: {{% dapr-latest-version cli="true" %}}` <br>
`Runtime version: {{% dapr-latest-version long="true" %}}`

### 步骤 4：验证容器是否正在运行

如前所述，`dapr init` 命令启动了几个容器，这些容器将帮助您开始使用 Dapr。通过 `daprio/dapr`、`openzipkin/zipkin` 和 `redis` 镜像验证您是否有容器实例在运行：

```bash
docker ps
```

**输出：**  

<img src="/images/install-dapr-selfhost/docker-containers.png">

### 步骤 5：验证组件目录是否已初始化

在 `dapr init` 时，CLI 还会创建一个默认组件文件夹，其中包含几个 YAML 文件，这些文件定义了状态存储、发布/订阅和 Zipkin。Dapr sidecar 将读取这些组件并使用：

- Redis 容器进行状态管理和消息传递。
- Zipkin 容器用于收集跟踪。

通过打开您的组件目录进行验证：

- 在 Windows 上，位于 `%UserProfile%\.dapr`
- 在 Linux/MacOS 上，位于 `~/.dapr`

{{< tabs "Linux/MacOS" "Windows">}}

{{% codetab %}}

```bash
ls $HOME/.dapr
```

**输出：**  

`bin  components  config.yaml`

<br>

{{% /codetab %}}

{{% codetab %}}
您可以使用 PowerShell 或命令行进行验证。如果使用 PowerShell，运行：
```powershell
explorer "$env:USERPROFILE\.dapr"
```

如果使用命令行，运行： 
```cmd
explorer "%USERPROFILE%\.dapr"
```

**结果：**

<img src="/images/install-dapr-selfhost/windows-view-components.png" width=600>

{{% /codetab %}}

{{< /tabs >}}

<br>

### 精简初始化

要安装没有任何默认配置文件或 Docker 容器的 CLI，请使用 `--slim` 标志。[了解更多关于 `init` 命令及其标志的信息。]({{< ref dapr-init.md >}})

```bash
dapr init --slim
```

{{< button text="下一步：使用 Dapr API >>" page="getting-started/get-started-api.md" >}}
