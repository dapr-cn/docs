---
type: docs
title: "使用 GitHub Codespaces 进行贡献"
linkTitle: "GitHub Codespaces"
weight: 60
description: "如何使用 GitHub Codespaces 为 Dapr 项目做出贡献"
aliases:
  - "/zh-hans/contributing/codespaces/"
  - "/zh-hans/developing-applications/ides/codespaces/"
---

[GitHub Codespaces](https://github.com/features/codespaces) 是为 Dapr 仓库做出贡献的最简单方式。只需点击一下，您就可以在浏览器中获得一个已准备好的环境，包含所有必要的前置条件。

## 功能

- **一键运行**：获取一个专用且沙盒化的环境，所有必需的框架和包都已准备就绪。
- **按使用计费**：只需为您在 Codespaces 中开发的时间付费。当不使用时，环境会自动关闭。
- **便携性**：可以在浏览器中运行，也可以在 Visual Studio Code 中运行，或使用 SSH 连接。

## 在 Codespace 中打开 Dapr 仓库

要在 Codespace 中打开 Dapr 仓库，请从仓库主页选择“Code”并选择“Open with Codespaces”：

<img src="/images/codespaces-create.png" alt="创建 Dapr Codespace 的截图" width="300">

如果您还没有 fork 该仓库，创建 Codespace 时会自动为您创建一个 fork，并在 Codespace 中使用它。

## 支持的仓库

- [dapr/dapr](https://github.com/dapr/dapr)
- [dapr/components-contrib](https://github.com/dapr/components-contrib)
- [dapr/cli](https://github.com/dapr/cli)
- [dapr/docs](https://github.com/dapr/docs)
- [dapr/python-sdk](https://github.com/dapr/python-sdk)

## 在 Codespace 中开发 Dapr 组件

开发新的 Dapr 组件需要同时处理 [dapr/components-contrib](https://github.com/dapr/components-contrib) 和 [dapr/dapr](https://github.com/dapr/dapr) 仓库。建议将这两个文件夹并排放置在 `/workspaces` 目录中。

### 如果您从 `dapr/dapr` 创建了 Codespace

如果您的 Codespaces 是从 `dapr/dapr` 仓库或其 fork 启动的，您需要在 `/workspaces/components-contrib` 中克隆 `dapr/components-contrib` 仓库（或其 fork）。

首先，确保您已通过 GitHub CLI 进行身份验证：

```sh
# 运行此命令并按照提示进行操作
# 大多数用户应接受默认选择
gh auth login
```

克隆仓库：

```sh
# 如果您想使用您 fork 的 dapr/components-contrib，请将其替换为您的 fork（例如 "yourusername/components-contrib"）
# 确保在执行此操作之前已 fork 该仓库
REPO=dapr/components-contrib
cd /workspaces
gh repo clone "$REPO" /workspaces/components-contrib
```

然后，将文件夹添加到当前工作区：

```sh
code -a /workspaces/components-contrib
```

### 如果您从 `dapr/components-contrib` 创建了 Codespace

如果您的 Codespaces 是从 `dapr/components-contrib` 仓库或其 fork 启动的，您需要在 `/workspaces/dapr` 中克隆 `dapr/dapr` 仓库（或其 fork）。

首先，确保您已通过 GitHub CLI 进行身份验证：

```sh
# 运行此命令并按照提示进行操作
# 大多数用户应接受默认选择
gh auth login
```

克隆仓库：

```sh
# 如果您想使用您 fork 的 dapr/dapr，请将其替换为您的 fork（例如 "yourusername/dapr"）
# 确保在执行此操作之前已 fork 该仓库
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
- [GitHub 文档](https://docs.github.com/codespaces/overview)
<!-- END_IGNORE -->