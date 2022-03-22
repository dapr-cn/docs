---
type: docs
title: "安装 Dapr CLI"
linkTitle: "安装 Dapr CLI"
weight: 10
---

Dapr CLI 是您用于各种 Dapr 相关任务的主要工具。 您可以使用它来运行一个带有Dapr sidecar的应用程序， 以及查看sidecar日志、列出运行中的服务、运行 Dapr 仪表板。 The Dapr CLI works with both [self-hosted]({{< ref self-hosted >}}) and [Kubernetes]({{< ref Kubernetes >}}) environments.

开始下载并安装 Dapr CLI：

{{< tabs Linux Windows MacOS Binaries>}}

{{% codetab %}}
### 从终端安装

此命令将安装最新的 Linux Dapr CLI 到 `/usr/local/bin`：
```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
```

### 安装时不使用 `sudo`
如果您无法访问 `sudo` 命令或您的用户名不在 `sudoers` 文件中，您可以通过 `DAPR_INSTALL_DIR` 环境变量来安装 Dapr 到另一个目录。

```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | DAPR_INSTALL_DIR="$HOME/dapr" /bin/bash
```
{{% /codetab %}}

{{% codetab %}}
### 从命令提示安装
This Command Prompt command installs the latest windows Dapr cli to `C:\dapr` and adds this directory to User PATH environment variable.
```powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
```

### 安装时没有管理权限
如果您没有管理员权限，您可以通过 `DAPR_INSTALL_DIR` 环境变量安装达普到备用目录。

```powershell
$script=iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1; $block=[ScriptBlock]::Create($script); invoke-command -ScriptBlock $block -ArgumentList "", "$HOME/dapr"
```
{{% /codetab %}}

{{% codetab %}}
### 从终端安装
This command installs the latest darwin Dapr CLI to `/usr/local/bin`:
```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | /bin/bash
```
#### ARM64 Mac 的注意事项
对ARM64 Macs的支持是作为预览功能提供的。 当从终端安装时，如果有原生 ARM64 二进制文件，就会下载。 对于较旧的版本，将下载 AMD64 二进制文件，这些二进制文件必须在启用 Rosetta2 模拟器的情况下运行。 要安装 Rosetta 模拟器：
```bash
softwareupdate --install-rosetta
```

### 从 Homebrew 安装
或者您可以通过 [Homebrew](https://brew.sh) 进行安装：
```bash
brew install dapr/tap/dapr-cli
```

#### ARM64 Mac 的注意事项
ARM64 架构的 Mac 系统只支持 Homebrew 3.0 和更高版本。 请更新 Homebrew 到 3.0.0 或更高版本，然后运行下面的命令：

```bash
arch -arm64 brew install dapr/tap/dapr-cli
```

### 安装时不使用 `sudo`
如果您无法访问 `sudo` 命令或您的用户名不在 `sudoers` 文件中，您可以通过 `DAPR_INSTALL_DIR` 环境变量来安装 Dapr 到另一个目录。

```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | DAPR_INSTALL_DIR="$HOME/dapr" /bin/bash
```
{{% /codetab %}}

{{% codetab %}}
Each release of Dapr CLI includes various OSes and architectures. These binary versions can be manually downloaded and installed.

1. 从最新的 [Dapr Releases](https://github.com/dapr/cli/releases)中下载所需的 Dapr CLI
2. 解压它(例如，dapr_linux_amd64.tar.gz, dapr_windows_amd64.zip)
3. 将其移动到你想要的位置。
   - 建议用于 Linux/MacOS `/usr/local/bin`。
   - 对于Windows，创建一个目录并将其添加到系统PATH。 例如，通过编辑系统环境变量，创建一个名为 `C:\dapr` 的目录，并将此目录添加到您的用户PATH。
{{% /codetab %}}
{{< /tabs >}}


### Step 2: Verify the installation

You can verify the CLI is installed by restarting your terminal/command prompt and running the following:

```bash
dapr
```

The output should look like this:


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

{{< button text="Next step: Initialize Dapr >>" page="install-dapr-selfhost" >}}