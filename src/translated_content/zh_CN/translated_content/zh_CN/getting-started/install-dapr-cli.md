---
type: docs
title: 安装 Dapr CLI 脚手架工具
linkTitle: 安装 Dapr CLI
weight: 10
description: 安装 Dapr CLI 作为运行 Dapr 相关任务的主要工具
---

您将使用 Dapr CLI 作为各种 Dapr 相关任务的主要工具。 您可以使用它来：

- 使用 Dapr sidecar 运行应用程序。
- 查看sidecar日志。
- 列出正在运行的服务。
- 运行 Dapr 仪表板。

Dapr CLI 同时支持 [自托管]({{< ref self-hosted >}}) 和 [Kubernetes]({{< ref Kubernetes >}}) 环境。

{{% alert title="开始之前" color="primary" %}}
在Docker Desktop的高级选项中，验证您已允许使用默认的Docker套接字。 <img src="/images/docker-desktop-setting.png" width=800 style="padding-bottom:15px;">
{{% /alert %}}

### 第 1 步：安装 Dapr CLI



{{% codetab %}}

#### 从终端安装

将最新的 Linux Dapr CLI 安装到 `/usr/local/bin`:

```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
```

##### 安装特定的CLI版本

下面的示例展示了如何安装 CLI 版本 `{{% dapr-latest-version cli="true" %}}`。 您还可以通过指定版本来安装候选版本（例如，`1.10.0-rc.3`）。

```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash -s {{% dapr-latest-version cli="true" %}}
```

#### 在没有 `sudo` 的情况下安装

如果您无法访问 `sudo` 命令或您的用户名不在 `sudoers` 文件中，您可以通过 `DAPR_INSTALL_DIR` 环境变量将 Dapr 安装到另一个目录。 该目录必须已经存在并且当前用户可以访问。

```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | DAPR_INSTALL_DIR="$HOME/dapr" /bin/bash
```

##### 安装特定的CLI版本而无需`sudo`

下面的示例展示了如何安装 CLI 版本 `{{% dapr-latest-version cli="true" %}}`。 您还可以通过指定版本来安装候选版本（例如，`1.10.0-rc.3`）。

```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | DAPR_INSTALL_DIR="$HOME/dapr" /bin/bash -s {{% dapr-latest-version cli="true" %}}
```



{{% codetab %}}

#### 从命令提示安装

将最新的 Windows Dapr CLI 安装到 `$Env:SystemDrive\dapr` 并将此目录添加到用户 PATH 环境变量中：

```powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
```

\*\*注意：\*\*在重新启动终端应用程序之前，可能看不到对 PATH 的更新。

##### 安装特定的CLI版本

下面的示例展示了如何安装 CLI 版本 `{{% dapr-latest-version cli="true" %}}`。 您还可以通过指定版本来安装候选版本（例如，`1.10.0-rc.3`）。

```powershell
powershell -Command "$script=iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1; $block=[ScriptBlock]::Create($script); invoke-command -ScriptBlock $block -ArgumentList {{% dapr-latest-version cli="true" %}}"
```

#### 在没有管理权限的情况下安装

如果您没有管理员权限，您可以通过 `DAPR_INSTALL_DIR` 环境变量将 Dapr 安装到备用目录。 如果目录不存在，则下面的脚本将创建该目录。

```powershell
$Env:DAPR_INSTALL_DIR = "<your_alt_install_dir_path>"
$script=iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1; $block=[ScriptBlock]::Create($script); invoke-command -ScriptBlock $block -ArgumentList "", "$Env:DAPR_INSTALL_DIR"
```

#### 安装特定的 CLI 版本而不使用管理员权限

下面的示例展示了如何安装 CLI 版本 `{{% dapr-latest-version cli="true" %}}`。 您还可以通过指定版本来安装候选版本（例如，`1.10.0-rc.3`）。

```powershell
$Env:DAPR_INSTALL_DIR = "<your_alt_install_dir_path>"
$script=iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1; $block=[ScriptBlock]::Create($script); invoke-command -ScriptBlock $block -ArgumentList "{{% dapr-latest-version cli="true" %}}", "$Env:DAPR_INSTALL_DIR"
```

#### 使用 winget 安装

将最新的 Windows Dapr CLI 安装到 `$Env:SystemDrive\dapr` 并将此目录添加到用户 PATH 环境变量中：

```powershell
winget install Dapr.CLI
```

**对于预览版本：**

安装最新的预览版本：

```powershell
winget install Dapr.CLI.Preview
```

#### 使用 MSI 安装程序安装

每个 Dapr CLI 的发布版本还包括一个适用于 Windows 的安装程序。 您可以手动下载MSI：

1. 从最新的[Dapr发布页面](https://github.com/dapr/cli/releases)下载MSI安装包`dapr.msi`。
2. 导航到下载的MSI文件，双击文件运行它。
3. 按照安装提示接受许可证和安装目录。 所选文件夹已添加到用户的PATH环境变量中。 默认值设置为`$Env:SystemDrive\dapr`。
4. 点击 `Install` 开始安装。 安装完成后，您将看到一条最终消息。



{{% codetab %}}

### 从终端安装

将最新的 Darwin Dapr CLI 安装到 `/usr/local/bin`:

```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | /bin/bash
```

##### 安装特定的CLI版本

下面的示例展示了如何安装 CLI 版本 `{{% dapr-latest-version cli="true" %}}`。 您还可以通过指定版本来安装候选版本（例如，`1.10.0-rc.3`）。

```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | /bin/bash -s {{% dapr-latest-version cli="true" %}}
```

**ARM64 Mac 的注意事项:**

从终端安装时，可以使用本机 ARM64 二进制文件。

要安装 Rosetta 模拟器：

```bash
softwareupdate --install-rosetta
```

#### 从 Homebrew 安装

通过[Homebrew](https://brew.sh)进行安装：

```bash
brew install dapr/tap/dapr-cli
```

**ARM64 Mac 的注意事项:**

ARM64 架构的 Mac 系统只支持 Homebrew 3.0 和更高版本。 请更新 Homebrew 到 3.0.0 或更高版本，然后运行下面的命令：

```bash
arch -arm64 brew install dapr/tap/dapr-cli
```

#### 在没有 `sudo` 的情况下安装

如果您无法访问 `sudo` 命令或您的用户名不在 `sudoers` 文件中，您可以通过 `DAPR_INSTALL_DIR` 环境变量将 Dapr 安装到另一个目录。 该目录必须已经存在并且当前用户可以访问。

```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | DAPR_INSTALL_DIR="$HOME/dapr" /bin/bash
```

##### 安装特定的CLI版本而无需`sudo`

下面的示例展示了如何安装 CLI 版本 `{{% dapr-latest-version cli="true" %}}`。 您还可以通过指定版本来安装候选版本（例如，`1.10.0-rc.3`）。

```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | DAPR_INSTALL_DIR="$HOME/dapr" -s {{% dapr-latest-version cli="true" %}}
```



{{% codetab %}}
每次发行的Dapr CLI包括各种操作系统和架构。 您可以手动下载并安装这些二进制版本。

1. 从最新的[Dapr Release](https://github.com/dapr/cli/releases)下载所需的Dapr CLI。
2. 解压缩 (例如，dapr_linux_amd64.tar.gz, dapr_windows_amd64.zip).
3. 将其移动到你想要的位置。
   - 对于Linux/MacOS，我们推荐使用`/usr/local/bin`。
   - 对于 Windows，请创建一个目录并将其添加到系统路径中。 例如：
     - 创建一个名为 `C:\dapr` 的目录。
     - 通过编辑系统环境变量，将新创建的目录添加到用户 PATH。



{{< /tabs >}}

### 步骤 2：验证安装

通过重新启动您的终端/命令提示和运行以下操作来验证CLI：

```bash
dapr -h
```

**Output:**

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
  version        Print the Dapr runtime and CLI version

Flags:
  -h, --help      help for dapr
  -v, --version   version for dapr

Use "dapr [command] --help" for more information about a command.
```

{{< button text="下一步: 初始化 Dapr " page="install-dapr-selfhost" >}}
