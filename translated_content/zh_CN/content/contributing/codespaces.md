---
type: docs
title: "使用 GitHub Codespaces 贡献"
linkTitle: "GitHub Codespaces"
weight: 2500
description: "如何在 GitHub Codespaces 中与 Dapr 仓库协同工作"
aliases:
  - "/zh-hans/developing-applications/ides/codespaces/"
---

[GitHub Codespaces](https://github.com/features/codespaces) 是启动和运行 Dapr 环境最简单的方式。 只需点击一下，您就可以在浏览器中访问所有准备就绪的环境。

## 特性

- **单击并运行**: 获得一个专用和沙盒化的环境，并且所有所需的框架和包件已准备就绪。
- **基于使用情况的计费**: 只为您在 Codespace 上花费的开发时间支付费用。 环境在不使用时自动关闭。
- **便携**: 在您的浏览器或 Visual Studio Code 中运行

## 在 Codespace 中打开 Dapr

要在 Codespace 中打开一个Dapr 仓库，只需从repo 主页中选择"Code"和"Open with Codespaces"：

<img src="/images/codespaces-create.png" alt="创建 Dapr Codespace 的截图" width="300" />

如果您尚未 forked 仓库，创建代码空间还将为您创建一个 fork，并在 Codespace 内使用它。

### 支持的 Repo

- [Dapr](https://github.com/dapr/dapr)
- [组件概念](https://github.com/dapr/components-contrib)
- [Python SDK](https://github.com/dapr/python-sdk)

### 在 Codespace 中开发 Dapr 组件

开发新的 Dapr 组件需要与 [components-contrib](https://github.com/dapr/components-contrib) 和 [dapr](https://github.com/dapr/dapr) 一起存放在 `$GOPATH` 代码树下进行测试。 为了方便，在你的Codespace components-contrib 分支中已经设置好`/go/src/github.com/dapr`文件夹以及一个dapr的克隆版本，就像[组件开发文档](https://github.com/dapr/components-contrib/blob/master/docs/developing-component.md)中描述的一样。 在这个配置中需要注意以下事项：

- Components-contrib 和dapr仓库目前仅支持Linux amd64环境的Codespaces。
- `/go/src/github.com/dapr/components-contrib` 只是Codespace的默认 `/workspace/components-contrib` 文件夹的一个软链接，所以变更其中一个会自动对另一个产生影响。
- 因为 `/go/src/github. om/dapr/dapr` 文件夹使用的是官方的 dapr repo 克隆而不是fork。 所以您无法直接在该文件夹中提出拉取请求。 您可以为此PR使用单独的 Dapr Codespace 或者如果您想要使用相同的 Codespace 。 你应该重新映射dapr库源到你的components-contrib Codespace中的fork。 例如，使用 `my-git-alias` 下的 dapr 分支：

```bash
cd /go/src/github.com/dapr/dapr
git remote set-url origin https://github.com/my-git-alias/dapr
git fetch
git reset --hard
```

## 相关链接
- [GitHub 文档](https://docs.github.com/en/github/developing-online-with-codespaces/about-codespaces)
