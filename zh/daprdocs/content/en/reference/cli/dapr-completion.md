---
type: docs
title: "completion CLI 命令参考"
linkTitle: "completion"
description: "有关 completion CLI 命令的详细信息"
---

## 说明

生成 shell 补全脚本

## 用法

```bash
dapr completion [flags]
dapr completion [command]
```

## 参数

| 名称             | 环境变量 | 默认值 | 说明      |
| -------------- | ---- | --- | ------- |
| `--help`, `-h` |      |     | 显示此帮助消息 |

## 示例

### 使用 HomeBrew 在 macOS 上安装 bash completion

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

### 在 Linux 上安装 bash completion

If bash-completion is not installed on Linux, please install the bash-completion' package via your distribution's package manager.

Load the dapr completion code for bash into the current shell:
```bash
source <(dapr completion bash)
```

Write bash completion code to a file and source if from .bash_profile:
```bash
dapr completion bash > ~/.dapr/completion.bash.inc
printf "source '$HOME/.dapr/completion.bash.inc'" >> $HOME/.bash_profile
source $HOME/.bash_profile
```

### Installing zsh completion on macOS using homebrew

If zsh-completion is not installed on macOS, please install the 'zsh-completion' package:
```bash
brew install zsh-completions
```

Set the dapr completion code for zsh[1] to autoload on startup:
```bash
dapr completion zsh > "${fpath[1]}/_dapr"
source ~/.zshrc
```

### Installing zsh completion on Linux

If zsh-completion is not installed on Linux, please install the 'zsh-completion' package via your distribution's package manager.

Load the dapr completion code for zsh into the current shell:
```bash
source <(dapr completion zsh)
```

Set the dapr completion code for zsh[1] to autoload on startup:
```bash
dapr completion zsh > "${fpath[1]}/_dapr"
```

### Installing Powershell completion on Windows

Create $PROFILE if it not exists:
```bash
if (!(Test-Path -Path $PROFILE )){ New-Item -Type File -Path $PROFILE -Force }
```

Add the completion to your profile:
```bash
dapr completion powershell >> $PROFILE
```

## Available Commands

```txt
bash        Generates bash completion scripts
powershell  Generates powershell completion scripts
zsh         Generates zsh completion scripts
```
