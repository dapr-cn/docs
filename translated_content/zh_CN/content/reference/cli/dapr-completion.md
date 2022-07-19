---
type: docs
title: "completion CLI 命令参考文档"
linkTitle: "completion"
description: "有关 completion CLI 命令的详细信息"
---

### 说明

生成 shell 补全脚本

### 用法

```bash
dapr completion [flags]
dapr completion [command]
```

### 参数

| Name           | 环境变量 | 默认值 | 说明      |
| -------------- | ---- | --- | ------- |
| `--help`, `-h` |      |     | 显示此帮助消息 |

### 示例

#### 使用 HomeBrew 在 macOS 上安装 bash completion

如果运行 macOS 包含的 Bash 3.2:

```bash
brew install bash-completion
```

或者，如果运行 Bash 4.1+:

```bash
brew install bash-completion@2
```

将 completion 添加到您的 completion 目录：

```bash
dapr completion bash > $(brew --prefix)/etc/bash_completion.d/dapr
source ~/.bash_profile
```

#### 在 Linux 上安装 bash completion

如果未在 Linux 上安装 bash-completion ，请通过包管理器安装 bash-completion 包。

将用于 bash 的 dapr completion 加载到当前 shell 中：

```bash
source <(dapr completion bash)
```

将 bash completion 载入代码写入文件并使用 source 载入 ( 例如使用 .bash_profile) :

```bash
dapr completion bash > ~/.dapr/completion.bash.inc
printf "source '$HOME/.dapr/completion.bash.inc'" >> $HOME/.bash_profile
source $HOME/.bash_profile
```

#### 使用 HomeBrew 在 macOS 上安装 zsh completion

如果未在 macOS 上安装 zsh-completion ，请安装"zsh-completion"包：

```bash
brew install zsh-completions
```

将用于 zsh 的 dapr completion 代码[1] 启动时自动加载：
```bash
dapr completion zsh > "${fpath[1]}/_dapr"
source ~/.zshrc
```

#### 在 Linux 上安装 zsh completion

如果未在 Linux 上安装 zsh-completion ，请通过包管理器安装 zsh-completion 包。

将用于 zsh 的 dapr completion 加载到当前 shell 中：

```bash
source <(dapr completion zsh)
```

将用于 zsh 的 dapr completion 代码[1] 启动时自动加载：

```bash
dapr completion zsh > "${fpath[1]}/_dapr"
```

#### 在 Windows 上安装 Powershell completion

创建 $PROFILE ，如果它不存在：

```bash
if (!(Test-Path -Path $PROFILE )){ New-Item -Type File -Path $PROFILE -Force }
```

将 completion 添加到您的 profile：

```bash
dapr completion powershell >> $PROFILE
```

### 可用命令

```txt
bash        Generates bash completion scripts
powershell  Generates powershell completion scripts
zsh         Generates zsh completion scripts
```
