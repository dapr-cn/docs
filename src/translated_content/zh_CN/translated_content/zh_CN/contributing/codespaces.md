---
type: docs
title: 使用 GitHub Codespaces 进行贡献
linkTitle: GitHub Codespaces
weight: 60
description: 如何使用 GitHub Codespaces 为 Dapr 项目做出贡献
aliases:
  - /zh-hans/contributing/codespaces/
  - /zh-hans/developing-applications/ides/codespaces/
---

[GitHub Codespaces](https://github.com/features/codespaces) 是启动和运行 Dapr 环境最简单的方式。 只需点击一下，您就可以在浏览器中访问所有准备就绪的环境。

## 特性

- **单击并运行**：获得一个专用和沙盒化的环境，并且所有所需的框架和包都已准备就绪。
- **基于使用情况的计费**：只为您在 Codespaces 上花费的开发时间支付费用。 环境在不使用时自动关闭。
- **便携**: 在您的浏览器或 Visual Studio Code 中运行，或使用 SSH 连接到它。

## 在 Codespace 中打开 Dapr

要在 Codespace 中打开一个Dapr 仓库，只需从repo 主页中选择"Code"和"Open with Codespaces"：

<img src="/images/codespaces-create.png" alt="Screenshot of creating a Dapr Codespace" width="300">

如果您尚未 forked 仓库，创建代码空间还将为您创建一个 fork，并在 Codespace 内使用它。

## 支持的仓库

- [dapr/dapr](https://github.com/dapr/dapr)
- [dapr/components-contrib](https://github.com/dapr/components-contrib)
- [dapr/cli](https://github.com/dapr/cli)
- [dapr/docs](https://github.com/dapr/docs)
- [dapr/python-sdk](https://github.com/dapr/python-sdk)

## 在 Codespace 中开发 Dapr 组件

开发新的Dapr组件需要同时使用[dapr/components-contrib](https://github.com/dapr/components-contrib)和[dapr/dapr](https://github.com/dapr/dapr)存储库。 建议将两个文件夹都放在 `/workspaces` 目录中，相邻放置。

### 如果您从 `dapr/dapr` 创建了一个 Codespace

如果您的 Codespaces 是从 `dapr/dapr` 存储库或其分支启动的，则需要在 `/workspaces/components-contrib` 内克隆 `dapr/components-contrib` 存储库（或其分支）。

首先，请确保您已通过 GitHub CLI 进行了身份验证：

```sh
# Run this command and follow the prompts
# Most users should accept the default choices
gh auth login
```

克隆存储库：

```sh
# If you want to use your fork of dapr/components-contrib, replace this with your fork (e.g. "yourusername/components-contrib")
# Make sure you've forked the repo before doing this
REPO=dapr/components-contrib
cd /workspaces
gh repo clone "$REPO" /workspaces/components-contrib
```

然后，将文件夹添加到当前工作区：

```sh
code -a /workspaces/components-contrib
```

### 如果您从 `dapr/components-contrib` 创建了一个 Codespace

如果您的 Codespaces 是从 `dapr/components-contrib` 存储库或其分支启动的，则需要在 `/workspaces/dapr` 内克隆 `dapr/dapr` 存储库（或其分支）。

首先，请确保您已通过 GitHub CLI 进行了身份验证：

```sh
# Run this command and follow the prompts
# Most users should accept the default choices
gh auth login
```

克隆存储库：

```sh
# If you want to use your fork of dapr/dapr, replace this with your fork (e.g. "yourusername/dapr")
# Make sure you've forked the repo before doing this
REPO=dapr/dapr
cd /workspaces
gh repo clone "$REPO" /workspaces/dapr
```

然后，将文件夹添加到当前工作区：

```sh
code -a /workspaces/dapr
```

## 相关链接

<!-- IGNORE_LINKS -->

- [GitHub文档](https://docs.github.com/codespaces/overview)

<!-- END_IGNORE -->
