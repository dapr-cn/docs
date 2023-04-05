---
type: docs
title: "使用 GitHub Codespaces 进行贡献"
linkTitle: "GitHub Codespaces"
weight: 60
description: "How to contribute to the Dapr project with GitHub Codespaces"
aliases:
  - "/zh-hans/contributing/codespaces/"
  - "/zh-hans/developing-applications/ides/codespaces/"
---

[GitHub Codespaces](https://github.com/features/codespaces) is the easiest way to get up and running for contributing to a Dapr repo. In as little as a single click, you can have an environment with all of the prerequisites ready to go in your browser.

## Features

- **Click and Run**: Get a dedicated and sandboxed environment with all of the required frameworks and packages ready to go.
- **Usage-based Billing**: Only pay for the time you spend developing in the Codespaces. Environments are spun down automatically when not in use.
- **Portable**: Run in your browser or in Visual Studio Code, or connect to it using SSH.

## 在 Codespace 中打开 Dapr

To open a Dapr repository in a Codespace, select "Code" from the repo homepage and "Open with Codespaces":

<img src="/images/codespaces-create.png" alt="Screenshot of creating a Dapr Codespace" width="300" />

如果您尚未 fork 仓库，创建 Codespace 还将为您创建一个 fork，并在 Codespace 内使用它。

## Supported repos

- [dapr/dapr](https://github.com/dapr/dapr)
- [dapr/components-contrib](https://github.com/dapr/components-contrib)
- [dapr/cli](https://github.com/dapr/cli)
- [dapr/python-sdk](https://github.com/dapr/python-sdk)

## Developing Dapr Components in a Codespace

Developing a new Dapr component requires working with both the [dapr/components-contrib](https://github.com/dapr/components-contrib) and [dapr/dapr](https://github.com/dapr/dapr) repos. It is recommended to place both folders inside the `/workspaces` directory, side-by-side.

### If you created a Codespace from `dapr/dapr`

If your Codespaces was started from the `dapr/dapr` repo or a fork of that, you will need to clone the `dapr/components-contrib` repository (or your fork of that) inside `/workspaces/components-contrib`.

First, make sure you've authenticated with the GitHub CLI:

```sh
# Run this command and follow the prompts
# Most users should accept the default choices
gh auth login
```

Clone the repo:

```sh
# If you want to use your fork of dapr/components-contrib, replace this with your fork (e.g. "yourusername/components-contrib")
# Make sure you've forked the repo before doing this
REPO=dapr/components-contrib
cd /workspaces
gh repo clone "$REPO" /workspaces/components-contrib
```

Then, add the folder to current workspace:

```sh
code -a /workspaces/components-contrib
```

### If you created a Codespace from `dapr/components-contrib`

If your Codespaces was started from the `dapr/components-contrib` repo or a fork of that, you will need to clone the `dapr/dapr` repository (or your fork of that) inside `/workspaces/dapr`.

First, make sure you've authenticated with the GitHub CLI:

```sh
# Run this command and follow the prompts
# Most users should accept the default choices
gh auth login
```

Clone the repo:

```sh
# If you want to use your fork of dapr/dapr, replace this with your fork (e.g. "yourusername/dapr")
# Make sure you've forked the repo before doing this
REPO=dapr/dapr
cd /workspaces
gh repo clone "$REPO" /workspaces/dapr
```

Then, add the folder to current workspace:

```sh
code -a /workspaces/dapr
```


## 相关链接
<!-- IGNORE_LINKS -->
- [GitHub documentation](https://docs.github.com/codespaces/overview)
<!-- END_IGNORE -->
