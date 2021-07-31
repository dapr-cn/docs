---
type: docs
title: "Contributing with GitHub Codespaces"
linkTitle: "GitHub Codespaces"
weight: 2500
description: "How to work with Dapr repos in GitHub Codespaces"
aliases:
  - "/developing-applications/ides/codespaces/"
---

[GitHub Codespaces](https://github.com/features/codespaces) are the easiest way to get up and running for contributing to a Dapr repo. In as little as a single click, you can have an environment with all of the prerequisites ready to go in your browser.

{{% alert title="Private Beta" color="warning" %}}
GitHub Codespaces目前处于内测阶段。 在 [这里](https://github.com/features/codespaces/signup) 注册。
{{% /alert %}}

## 特性

- **单击并运行**: 获得一个专用和沙盒化的环境，并且所有所需的框架和包件已准备就绪。
- **基于使用情况的计费**: 只为您在 Codespace 上花费的开发时间支付费用。 环境在不使用时自动关闭。
- **便携**: 在您的浏览器或 Visual Studio Code 中运行

## 在 Codespace 中打开 Dapr

要在 Codespace 中打开一个Dapr 仓库，只需从repo 主页中选择"Code"和"Open with Codespaces"：

<img src="/images/codespaces-create.png" alt="创建 Dapr Codespace 的截图" width="300" />

If you haven't already forked the repo, creating the Codespace will also create a fork for you and use it inside the Codespace.

### 支持的 Repo

- [Dapr](https://github.com/dapr/dapr)
- [Components-contrib](https://github.com/dapr/components-contrib)
- [Python SDK](https://github.com/dapr/python-sdk)

### Developing Dapr Components in a Codespace

Developing a new Dapr component requires working with both the [components-contrib](https://github.com/dapr/components-contrib) and [dapr](https://github.com/dapr/dapr) repos together under the `$GOPATH` tree for testing purposes. To facilitate this, the `/go/src/github.com/dapr` folder in the components-contrib Codespace will already be set up with your fork of components-contrib, and a clone of the dapr repo as described in the [component development documentation](https://github.com/dapr/components-contrib/blob/master/docs/developing-component.md). A few things to note in this configuration:

- The components-contrib and dapr repos only define Codespaces for the Linux amd64 environment at the moment.
- The `/go/src/github.com/dapr/components-contrib` folder is a soft link to Codespace's default `/workspace/components-contrib` folder, so changes in one will be automatically reflected in the other.
- Since the `/go/src/github.com/dapr/dapr` folder uses a clone of the official dapr repo rather than a fork, you will not be able to make a pull request from changes made in that folder directly. You can use the dapr Codespace separately for that PR, or if you would like to use the same Codespace for the dapr changes as well, you should remap the dapr repo origin to your fork in the components-contrib Codespace. For example, to use a dapr fork under `my-git-alias`:

```bash
cd /go/src/github.com/dapr/dapr
git remote set-url origin https://github.com/my-git-alias/dapr
git fetch
git reset --hard
```

## 相关链接
- [GitHub 文档](https://docs.github.com/en/github/developing-online-with-codespaces/about-codespaces)
