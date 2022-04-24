---
type: docs
title: "安装 Dapr CLI"
linkTitle: "安装 Dapr CLI"
weight: 10
description: "Install the Dapr CLI as the main tool for running Dapr-related tasks"
---

You'll use the Dapr CLI as the main tool for various Dapr-related tasks. You can use it to:

- Run an application with a Dapr sidecar.
- Review sidecar logs.
- List running services.
- Run the Dapr dashboard.

Dapr CLI 同时支持 [自托管]({{< ref self-hosted >}}) 和 [Kubernetes]({{< ref Kubernetes >}}) 环境。

### Step 1: Install the Dapr CLI

{{< tabs Linux Windows MacOS Binaries>}}

{{% codetab %}}

#### 从终端安装

Install the latest Linux Dapr CLI to `/usr/local/bin`:

```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
```

#### 安装时不使用 `sudo`

If you do not have access to the `sudo` command or your username is not in the `sudoers` file, you can install Dapr to an alternate directory via the `DAPR_INSTALL_DIR` environment variable.

```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | DAPR_INSTALL_DIR="$HOME/dapr" /bin/bash
```

{{% /codetab %}}

{{% codetab %}}

#### 从命令提示安装

Install the latest windows Dapr cli to `C:\dapr` and add this directory to the User PATH environment variable:

```powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
```

#### 安装时没有管理权限

If you do not have admin rights, you can install Dapr to an alternate directory via the `DAPR_INSTALL_DIR` environment variable.

```powershell
$script=iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1; $block=[ScriptBlock]::Create($script); invoke-command -ScriptBlock $block -ArgumentList "", "$HOME/dapr"
```

{{% /codetab %}}

{{% codetab %}}

### 从终端安装

Install the latest Darwin Dapr CLI to `/usr/local/bin`:

```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | /bin/bash
```

**For ARM64 Macs:**

ARM64 Macs support is available as a *preview feature*. When installing from the terminal, native ARM64 binaries are downloaded once available. For older releases, AMD64 binaries are downloaded and must be run with Rosetta2 emulation enabled.

要安装 Rosetta 模拟器：

```bash
softwareupdate --install-rosetta
```

#### 从 Homebrew 安装

Install via [Homebrew](https://brew.sh):

```bash
brew install dapr/tap/dapr-cli
```

**For ARM64 Macs:**

ARM64 架构的 Mac 系统只支持 Homebrew 3.0 和更高版本。 请更新 Homebrew 到 3.0.0 或更高版本，然后运行下面的命令：

```bash
arch -arm64 brew install dapr/tap/dapr-cli
```

#### 安装时不使用 `sudo`
If you do not have access to the `sudo` command or your username is not in the `sudoers` file, you can install Dapr to an alternate directory via the `DAPR_INSTALL_DIR` environment variable.

```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | DAPR_INSTALL_DIR="$HOME/dapr" /bin/bash
```

{{% /codetab %}}

{{% codetab %}}
每次发行的Dapr CLI包括各种操作系统和架构。 You can manually download and install these binary versions.

1. 从最新的 [Dapr Releases](https://github.com/dapr/cli/releases) 中下载所需的 Dapr CLI.
2. 解压缩 (例如，dapr_linux_amd64.tar.gz, dapr_windows_amd64.zip).
3. 将其移动到你想要的位置。
   - For Linux/MacOS, we recommend `/usr/local/bin`.
   - 对于Windows，创建一个目录并将其添加到系统PATH。 例如:
     - Create a directory called `C:\dapr`.
     - Add your newly created directory to your User PATH, by editing your system environment variable.

{{% /codetab %}}

{{< /tabs >}}

### 步骤 2：验证安装

Verify the CLI is installed by restarting your terminal/command prompt and running the following:

```bash
dapr
```

**输出:**

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