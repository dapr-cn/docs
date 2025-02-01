---
type: docs
title: "安装 Dapr CLI"
linkTitle: "安装 Dapr CLI"
weight: 10
description: "安装 Dapr CLI 作为运行 Dapr 相关任务的主要工具"
---

Dapr CLI 是执行各种 Dapr 相关任务的主要工具。您可以使用它来：

- 运行带有 Dapr 边车的应用程序。
- 查看边车日志。
- 列出正在运行的服务。
- 运行 Dapr 仪表板。

Dapr CLI 可在 [自托管]({{< ref self-hosted >}}) 和 [Kubernetes]({{< ref Kubernetes >}}) 环境中使用。

{{% alert title="开始之前" color="primary" %}}
请在 Docker Desktop 的高级选项中确认已启用默认的 Docker socket。如果您在 Windows 上使用 WSL 集成，则此选项不可用。
   <img src="/images/docker-desktop-setting.png" width=800 style="padding-bottom:15px;">
{{% /alert %}}

### 步骤 1：安装 Dapr CLI

{{< tabs Linux Windows MacOS Binaries>}}

{{% codetab %}}

#### 从终端安装

将最新的 Linux Dapr CLI 安装到 `/usr/local/bin`：

```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
```

##### 安装特定的 CLI 版本

以下示例展示如何安装 CLI 版本 `{{% dapr-latest-version cli="true" %}}`。您还可以通过指定版本来安装候选版本（例如，`1.10.0-rc.3`）。

```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash -s {{% dapr-latest-version cli="true" %}}
```

#### 无需 `sudo` 安装

如果您无法使用 `sudo` 命令或您的用户名不在 `sudoers` 文件中，可以通过 `DAPR_INSTALL_DIR` 环境变量将 Dapr 安装到其他目录。此目录必须已存在并且当前用户可访问。

```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | DAPR_INSTALL_DIR="$HOME/dapr" /bin/bash
```

##### 无需 `sudo` 安装特定的 CLI 版本

以下示例展示如何安装 CLI 版本 `{{% dapr-latest-version cli="true" %}}`。您还可以通过指定版本来安装候选版本（例如，`1.10.0-rc.3`）。

```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | DAPR_INSTALL_DIR="$HOME/dapr" /bin/bash -s {{% dapr-latest-version cli="true" %}}
```

{{% /codetab %}}

{{% codetab %}}

#### 从命令提示符安装

将最新的 Windows Dapr CLI 安装到 `$Env:SystemDrive\dapr` 并将此目录添加到用户 PATH 环境变量：

```powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
```

**注意：** PATH 的更新可能在您重新启动终端应用程序之前不可见。

##### 安装特定的 CLI 版本

以下示例展示如何安装 CLI 版本 `{{% dapr-latest-version cli="true" %}}`。您还可以通过指定版本来安装候选版本（例如，`1.10.0-rc.3`）。

```powershell
powershell -Command "$script=iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1; $block=[ScriptBlock]::Create($script); invoke-command -ScriptBlock $block -ArgumentList {{% dapr-latest-version cli="true" %}}"
```

#### 无需管理员权限安装

如果您没有管理员权限，可以通过 `DAPR_INSTALL_DIR` 环境变量将 Dapr 安装到其他目录。以下脚本将在目录不存在时创建它。

```powershell
$Env:DAPR_INSTALL_DIR = "<your_alt_install_dir_path>"
$script=iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1; $block=[ScriptBlock]::Create($script); invoke-command -ScriptBlock $block -ArgumentList "", "$Env:DAPR_INSTALL_DIR"
```

#### 无需管理员权限安装特定的 CLI 版本

以下示例展示如何安装 CLI 版本 `{{% dapr-latest-version cli="true" %}}`。您还可以通过指定版本来安装候选版本（例如，`1.10.0-rc.3`）。

```powershell
$Env:DAPR_INSTALL_DIR = "<your_alt_install_dir_path>"
$script=iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1; $block=[ScriptBlock]::Create($script); invoke-command -ScriptBlock $block -ArgumentList "{{% dapr-latest-version cli="true" %}}", "$Env:DAPR_INSTALL_DIR"
```

#### 使用 winget 安装

将最新的 Windows Dapr CLI 安装到 `$Env:SystemDrive\dapr` 并将此目录添加到用户 PATH 环境变量：

```powershell
winget install Dapr.CLI
```

**对于预览版本：**

安装最新的预览版本：

```powershell
winget install Dapr.CLI.Preview
```

#### 使用 MSI 安装程序安装

每个 Dapr CLI 版本还包括一个 Windows 安装程序。您可以手动下载 MSI：

1. 从最新的 [Dapr 版本](https://github.com/dapr/cli/releases) 下载 MSI 包 `dapr.msi`。
2. 导航到下载的 MSI 文件并双击文件以运行它。
3. 按照安装提示接受许可和安装目录。所选文件夹将添加到用户 PATH 环境变量。默认值设置为 `$Env:SystemDrive\dapr`。
4. 点击 `Install` 开始安装。安装完成后，您将看到最终消息。

{{% /codetab %}}

{{% codetab %}}

### 从终端安装

将最新的 Darwin Dapr CLI 安装到 `/usr/local/bin`：

```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | /bin/bash
```

##### 安装特定的 CLI 版本

以下示例展示如何安装 CLI 版本 `{{% dapr-latest-version cli="true" %}}`。您还可以通过指定版本来安装候选版本（例如，`1.10.0-rc.3`）。

```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | /bin/bash -s {{% dapr-latest-version cli="true" %}}
```

**对于 ARM64 Mac：**

从终端安装时，原生 ARM64 二进制文件可用。

要安装 Rosetta 仿真：

```bash
softwareupdate --install-rosetta
```

#### 从 Homebrew 安装

通过 [Homebrew](https://brew.sh) 安装：

```bash
brew install dapr/tap/dapr-cli
```

**对于 ARM64 Mac：**

对于 ARM64 Mac，支持 Homebrew 3.0 及更高版本。更新 Homebrew 至 3.0.0 或更高版本，然后运行以下命令：

```bash
arch -arm64 brew install dapr/tap/dapr-cli
```

#### 无需 `sudo` 安装
如果您无法使用 `sudo` 命令或您的用户名不在 `sudoers` 文件中，可以通过 `DAPR_INSTALL_DIR` 环境变量将 Dapr 安装到其他目录。此目录必须已存在并且当前用户可访问。

```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | DAPR_INSTALL_DIR="$HOME/dapr" /bin/bash
```

##### 无需 `sudo` 安装特定的 CLI 版本

以下示例展示如何安装 CLI 版本 `{{% dapr-latest-version cli="true" %}}`。您还可以通过指定版本来安装候选版本（例如，`1.10.0-rc.3`）。

```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | DAPR_INSTALL_DIR="$HOME/dapr" -s {{% dapr-latest-version cli="true" %}}
```

{{% /codetab %}}

{{% codetab %}}
每个 Dapr CLI 版本都包括各种操作系统和架构。您可以手动下载并安装这些二进制版本。

1. 从最新的 [Dapr 版本](https://github.com/dapr/cli/releases) 下载所需的 Dapr CLI。
2. 解压缩它（例如，dapr_linux_amd64.tar.gz，dapr_windows_amd64.zip）。
3. 将其移动到您想要的位置。
   - 对于 Linux/MacOS，我们推荐 `/usr/local/bin`。
   - 对于 Windows，创建一个目录并将其添加到您的系统 PATH。例如：
     - 创建一个名为 `C:\dapr` 的目录。
     - 通过编辑系统环境变量，将新创建的目录添加到用户 PATH。

{{% /codetab %}}

{{< /tabs >}}

### 步骤 2：验证安装

通过重新启动您的终端/命令提示符并运行以下命令来验证 CLI 是否已安装：

```bash
dapr -h
```

**输出：**

```md
         __
    ____/ /___ _____  _____
   / __  / __ '/ __ \/ ___/
  / /_/ / /_/ / /_/ / /
  \__,_/\__,_/ .___/_/
              /_/

===============================
分布式应用程序运行时

用法：
  dapr [命令]

可用命令：
  completion     生成 shell 补全脚本
  components     列出所有 Dapr 组件。支持的平台：Kubernetes
  configurations 列出所有 Dapr 配置。支持的平台：Kubernetes
  dashboard      启动 Dapr 仪表板。支持的平台：Kubernetes 和自托管
  help           获取任何命令的帮助
  init           在支持的托管平台上安装 Dapr。支持的平台：Kubernetes 和自托管
  invoke         调用给定 Dapr 应用程序上的方法。支持的平台：自托管
  list           列出所有 Dapr 实例。支持的平台：Kubernetes 和自托管
  logs           获取应用程序的 Dapr 边车日志。支持的平台：Kubernetes
  mtls           检查是否启用了 mTLS。支持的平台：Kubernetes
  publish        发布一个 pub-sub 事件。支持的平台：自托管
  run            运行 Dapr 并（可选）与您的应用程序并排运行。支持的平台：自托管
  status         显示 Dapr 服务的健康状态。支持的平台：Kubernetes
  stop           停止 Dapr 实例及其关联的应用程序。支持的平台：自托管
  uninstall      卸载 Dapr 运行时。支持的平台：Kubernetes 和自托管
  upgrade        升级集群中的 Dapr 控制平面安装。支持的平台：Kubernetes
  version        打印 Dapr 运行时和 CLI 版本

标志：
  -h, --help      获取 dapr 的帮助
  -v, --version   获取 dapr 的版本

使用 "dapr [命令] --help" 获取有关命令的更多信息。
```

{{< button text="下一步：初始化 Dapr >>" page="install-dapr-selfhost" >}}
