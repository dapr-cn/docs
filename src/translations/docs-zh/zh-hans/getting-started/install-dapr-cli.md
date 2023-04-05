---
type: docs
title: "安装 Dapr CLI 脚手架工具"
linkTitle: "安装 Dapr CLI"
weight: 10
---

Dapr CLI 是您用于各种 Dapr 相关任务的主要工具。 您可以使用它来运行一个带有Dapr sidecar的应用程序， 以及查看sidecar日志、列出运行中的服务、运行 Dapr 仪表板。 The Dapr CLI works with both [self-hosted]({{< ref self-hosted >}}) and [Kubernetes]({{< ref Kubernetes >}}) environments.

开始下载并安装 Dapr CLI：

{{< tabs Linux Windows MacOS Binaries>}}

{{% codetab %}}
此命令将安装最新的 Linux Dapr CLI 到 `/usr/local/bin`：
```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
```
{{% /codetab %}}

{{% codetab %}}
此命令提示命令将安装最新的 Windows Dapr CLI 到 `C:\dapr` 并将此目录添加到用户PATH 环境变量。
```powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
```
{{% /codetab %}}

{{% codetab %}}
此命令将安装最新的 darwin Dapr CLI 到 `/usr/local/bin`:
```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | /bin/bash
```

或者您可以通过 [Homebrew](https://brew.sh) 进行安装：
```bash
brew install dapr/tap/dapr-cli
```

{{% alert title="Note for M1 Macs" color="primary" %}}
M1 Mac不支持homebrew 您需要使用 Dapr 安装脚本并安装 rosetta amd64 兼容层。 如果你没有安装它，你可以运行：

```bash
softwareupdate --install-rosetta
```

{{% /alert %}}


{{% /codetab %}}

{{% codetab %}}
每次发行的Dapr CLI包括各种操作系统和架构。 这些二进制版本可以手动下载和安装。

1. 从最新的 [Dapr Releases](https://github.com/dapr/cli/releases)中下载所需的 Dapr CLI
2. 解压它(例如，dapr_linux_amd64.tar.gz, dapr_windows_amd64.zip)
3. 将其移动到你想要的位置。
   - 用于 Linux/MacOS - `/usr/local/bin`
   - 对于Windows，创建一个目录并将其添加到系统PATH。 例如，通过编辑系统环境变量，创建一个名为 `C:\dapr` 的目录，并将此目录添加到您的用户PATH。
{{% /codetab %}}
{{< /tabs >}}


### 步骤 2：验证安装

您可以通过重新启动您的终端/命令提示和运行以下操作来验证CLI：

```bash
dapr
```

输出显示应该如下方所示：


```md
         __
    ____/ /___ _____  _____
   / __  / __ '/ __ \/ ___/
  / /_/ / /_/ / /_/ / /
  \__,_/\__,_/ .___/_/
              /_/

===============================
Distributed Application Runtime

Usage:
  dapr [command]

Available Commands:
  completion     Generates shell completion scripts
  components     List all Dapr components. Supported platforms: Kubernetes
  configurations List all Dapr configurations. Supported platforms: Kubernetes
  dashboard      Start Dapr dashboard. Supported platforms: Kubernetes and self-hosted
  help           Help about any command
  init           Install Dapr on supported hosting platforms. Supported platforms: Kubernetes and self-hosted
  invoke         Invoke a method on a given Dapr application. Supported platforms: Self-hosted
  list           List all Dapr instances. Supported platforms: Kubernetes and self-hosted
  logs           Get Dapr sidecar logs for an application. Supported platforms: Kubernetes
  mtls           Check if mTLS is enabled. Supported platforms: Kubernetes
  publish        Publish a pub-sub event. Supported platforms: Self-hosted
  run            Run Dapr and (optionally) your application side by side. Supported platforms: Self-hosted
  status         Show the health status of Dapr services. Supported platforms: Kubernetes
  stop           Stop Dapr instances and their associated apps. . Supported platforms: Self-hosted
  uninstall      Uninstall Dapr runtime. Supported platforms: Kubernetes and self-hosted
  upgrade        Upgrades a Dapr control plane installation in a cluster. Supported platforms: Kubernetes

Flags:
  -h, --help      help for dapr
  -v, --version   version for dapr

Use "dapr [command] --help" for more information about a command.
```

{{< button text="下一步: 初始化 Dapr >>" page="install-dapr-selfhost" >}}
