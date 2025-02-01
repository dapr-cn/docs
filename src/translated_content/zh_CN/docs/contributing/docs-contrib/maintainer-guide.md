---
type: docs
title: "维护者指南"
linkTitle: "维护者指南"
weight: 20
description: "成为 Dapr 文档维护者和审批者的入门指南。"
---

在本指南中，您将学习如何履行 Dapr 文档维护者和审批者的日常职责。要成功完成这些任务，您需要在 [`dapr/docs`](https://github.com/dapr/docs) 仓库中拥有审批者或维护者的权限。

如果您想了解如何为 Dapr 文档做出贡献，请查看 [贡献者指南]({{< ref contributing-docs.md >}})。

## 分支管理指南

Dapr 文档的分支管理与大多数代码仓库不同。没有 `main` 分支，每个分支都与运行时发布的主要和次要版本相对应。

完整的分支列表请访问 [文档仓库](https://github.com/dapr/docs#branch-guidance)。

阅读 [贡献者指南]({{< ref "contributing-docs.md#branch-guidance" >}}) 以获取有关发布分支的更多信息。

## 从当前发布分支合并到预发布分支

作为文档审批者或维护者，您需要定期进行合并操作，以确保预发布分支与当前发布分支保持同步。建议每周将当前分支的更新合并到预发布分支。

以下步骤中，将 `v1.0` 视为当前发布版本，将 `v1.1` 视为即将发布版本。

1. 在 Visual Studio Code 中打开 Dapr 文档仓库。
1. 在本地仓库中，切换到最新分支 (`v1.0`) 并同步更改：

   ```bash
   git pull upstream v1.0
   git push origin v1.0
   ```

1. 切换到即将发布的分支 (`v1.1`) 并同步更改：

   ```bash
   git pull upstream v1.1
   git push origin v1.1
   ```

1. 基于即将发布的版本创建一个新分支：

   ```bash
   git checkout -b upmerge_MM-DD
   ```

1. 在终端中，从最新发布分支合并到新建的合并分支：

   ```bash
   git merge --no-ff --no-commit v1.0
   ```

1. 在终端中，确保合并的文件准确无误。在 VS Code 中检查是否有合并冲突。删除不需要合并的配置更改或版本信息。
1. 提交暂存的更改并推送到合并分支 (`upmerge_MM-DD`)。
1. 从合并分支创建一个 PR 到即将发布的分支 (`v1.1`)。
1. 审查 PR，确保没有意外更改被推送到合并分支。

## 发布流程

Dapr 文档必须与 Dapr 项目发布中包含的功能和更新保持一致。在 Dapr 发布日期之前，请确保：

- 所有新功能或更新都已充分记录和审查。
- 即将发布的文档 PR 指向发布分支。

以下步骤中，将 `v1.0` 视为最新发布版本，将 `v1.1` 视为即将发布版本。

文档的发布流程包括以下内容：

- 将最新发布版本合并到即将发布的分支
- 更新最新和即将发布的 Hugo 配置文件
- 为下一个版本创建新的 Azure 静态 Web 应用
- 为下一个版本的网站创建新的 DNS 条目
- 为下一个版本创建新的 git 分支

### 合并操作

首先，从最新发布版本合并到即将发布的分支，执行 [文档合并操作](#upmerge-from-current-release-branch-to-the-pre-release-branch)。

### 更新 Hugo 配置

合并后，准备文档分支以进行发布。在两个单独的 PR 中，您需要：

- 存档最新发布版本。
- 将预览/发布分支作为文档的当前在线版本。
- 创建一个新的预览分支。

#### 最新发布版本

这些步骤将准备最新发布分支以进行存档。

1. 在 VS Code 中打开 Dapr 文档仓库。
1. 切换到最新分支 (`v1.0`) 并同步更改：

   ```bash
   git pull upstream v1.0
   git push origin v1.0
   ```

1. 基于最新发布创建一个新分支：

   ```bash
   git checkout -b release_v1.0
   ```

1. 在 VS Code 中，导航到 `/daprdocs/config.toml`。
1. 在 `# Versioning` 部分（大约第 154 行）添加以下 TOML：

   ```toml
   version_menu = "v1.0"
   version = "v1.0"
   archived_version = true
   url_latest_version = "https://docs.dapr.io"

   [[params.versions]]
     version = "v1.2 (preview)"
     url = "v1-2.docs.dapr.io"
   [[params.versions]]
     version = "v1.1 (latest)"
     url = "#"
   [[params.versions]]
     version = "v1.0"
     url = "https://v1-0.docs.dapr.io"
   ```

1. 删除 `.github/workflows/website-root.yml`。
1. 提交暂存的更改并推送到您的分支 (`release_v1.0`)。
1. 从 `release_v1.0` 打开一个 PR 到 `v1.0`。
1. 让文档维护者或审批者进行审查。等待合并 PR 直到发布。

#### 即将发布版本

这些步骤将准备即将发布的分支以提升为最新发布。

1. 在 VS Code 中打开 Dapr 文档仓库。
1. 切换到即将发布的分支 (`v1.1`) 并同步更改：

   ```bash
   git pull upstream v1.1
   git push origin v1.1
   ```

1. 基于即将发布的版本创建一个新分支：

   ```bash
   git checkout -b release_v1.1
   ```

1. 在 VS Code 中，导航到 `/daprdocs/config.toml`。
1. 更新第 1 行为 `baseURL - https://docs.dapr.io/`。
1. 更新 `# Versioning` 部分（大约第 154 行）以显示正确的版本和标签：

   ```toml
   # Versioning
   version_menu = "v1.1 (latest)"
   version = "v1.1"
   archived_version = false
   url_latest_version = "https://docs.dapr.io"

   [[params.versions]]
     version = "v1.2 (preview)"
     url = "v1-2.docs.dapr.io"
   [[params.versions]]
     version = "v1.1 (latest)"
     url = "#"
   [[params.versions]]
     version = "v1.0"
     url = "https://v1-0.docs.dapr.io"
   ```

1. 导航到 `.github/workflows/website-root.yml`。
1. 更新触发工作流的分支：

   ```yml
   name: Azure Static Web App Root

   on:
     push:
       branches:
         - v1.1
     pull_request:
       types: [opened, synchronize, reopened, closed]
       branches:
         - v1.1
   ```

1. 导航到 `/README.md`。
1. 更新版本表：

```markdown
| Branch                                                       | Website                    | Description                                                                                      |
| ------------------------------------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------ |
| [v1.1](https://github.com/dapr/docs) (primary)               | https://docs.dapr.io       | 最新 Dapr 发布文档。拼写错误修正、澄清和大多数文档都在这里。 |
| [v1.2](https://github.com/dapr/docs/tree/v1.2) (pre-release) | https://v1-2.docs.dapr.io/ | 预发布文档。仅适用于 v1.2+ 的文档更新在这里。                |
```

1. 更新 `dapr-latest-version.html` 短代码部分为新的次要/补丁版本（在此示例中为 `1.1.0` 和 `1.1`）。
1. 提交暂存的更改并推送到您的分支 (`release_v1.1`)。
1. 从 `release/v1.1` 打开一个 PR 到 `v1.1`。
1. 让文档维护者或审批者进行审查。等待合并 PR 直到发布。

#### 未来预览分支

##### 创建预览分支

1. 在 GitHub UI 中，选择分支下拉菜单并选择 **查看所有分支**。
1. 点击 **新建分支**。
1. 在 **新分支名称** 中，输入预览分支版本号。在此示例中，它将是 `v1.2`。
1. 选择 **v1.1** 作为来源。
1. 点击 **创建新分支**。

##### 配置预览分支

1. 在终端窗口中，导航到 `docs` 仓库。
1. 切换到即将发布的分支 (`v1.1`) 并同步更改：

   ```bash
   git pull upstream v1.1
   git push origin v1.1
   ```

1. 基于 `v1.1` 创建一个新分支并命名为 `v1.2`：

  ```bash
  git checkout -b release_v1.1
  ```

1. 重命名 `.github/workflows/website-v1-1.yml` 为 `.github/workflows/website-v1-2.yml`。
1. 在 VS Code 中打开 `.github/workflows/website-v1-2.yml` 并更新名称、触发器和部署目标为 1.2：

   ```yml
   name: Azure Static Web App v1.2
   
   on:
     push:
       branches:
         - v1.2
     pull_request:
       types: [opened, synchronize, reopened, closed]
       branches:
         - v1.2
   
    ...
   
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_V1_2 }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
   
    ...
   
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_V1_2 }}
          skip_deploy_on_missing_secrets: true
   ```

1. 导航到 `daprdocs/config.toml` 并更新 `baseURL` 以指向新的预览网站：

   ```toml
   baseURL = "https://v1-2.docs.dapr.io"
   ```

1. 更新 `# GitHub Information` 和 `# Versioning` 部分（大约第 148 行）以显示正确的版本和标签：

   ```toml
   # GitHub Information
   github_repo = "https://github.com/dapr/docs"
   github_project_repo = "https://github.com/dapr/dapr"
   github_subdir = "daprdocs"
   github_branch = "v1.2"
   
   # Versioning
   version_menu = "v1.2 (preview)"
   version = "v1.2"
   archived_version = false
   url_latest_version = "https://docs.dapr.io"
   
   [[params.versions]]
     version = "v1.2 (preview)"
     url = "#"
   [[params.versions]]
     version = "v1.1 (latest)"
     url = "https://docs.dapr.io"
   [[params.versions]]
     version = "v1.0"
     url = "https://v1-0.docs.dapr.io"
   ```

1. 提交暂存的更改并推送到针对 v1.2 分支的新 PR。
1. 在发布后以及其他 `v1.0` 和 `v1.1` PR 合并后再合并 PR。

### 为未来发布创建新网站

接下来，为未来的 Dapr 发布创建一个新网站。为此，您需要：

- 部署一个 Azure 静态 Web 应用。
- 通过 CNCF 请求配置 DNS。

#### 先决条件
- 在 `dapr/docs` 仓库中拥有文档维护者身份。
- 访问活动的 Dapr Azure 订阅，并具有创建资源的贡献者或所有者访问权限。
- 在您的机器上安装 [Azure Developer CLI](https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd?tabs=winget-windows%2Cbrew-mac%2Cscript-linux&pivots=os-windows)。
- 您自己的 [`dapr/docs` 仓库](https://github.com/dapr/docs) 的分叉已克隆到您的机器。

#### 部署 Azure 静态 Web 应用

为未来的 Dapr 发布部署一个新的 Azure 静态 Web 应用。在此示例中，我们使用 v1.1 作为未来发布。

1. 在终端窗口中，导航到 `dapr/docs` 目录中的 `iac/swa` 文件夹。

   ```bash
   cd .github/iac/swa
   ```
   
1. 使用 Dapr Azure 订阅登录 Azure Developer CLI (`azd`)。

   ```bash
   azd login
   ```

1. 在浏览器提示中，验证您正在以 Dapr 身份登录并完成登录。

1. 在新终端中，替换以下值为您偏好的网站值。

   ```bash
   export AZURE_RESOURCE_GROUP=rg-dapr-docs-test
   export IDENTITY_RESOURCE_GROUP=rg-my-identities
   export AZURE_STATICWEBSITE_NAME=daprdocs-latest
   ```
   
1. 创建一个新的 [`azd` 环境](https://learn.microsoft.com/azure/developer/azure-developer-cli/faq#what-is-an-environment-name)。
 
   ```bash
   azd env new
   ```

1. 当提示时，输入一个新的环境名称。在此示例中，您可以将环境命名为：`dapr-docs-v1-1`。

1. 环境创建完成后，使用以下命令将 Dapr 文档 SWA 部署到新环境中：

   ```bash
   azd up
   ```
   
1. 当提示时，选择一个 Azure 订阅和位置。将这些与 Dapr Azure 订阅匹配。

#### 在 Azure 门户中配置 SWA

前往 [Azure 门户](https://portal.azure.com) 中的 Dapr 订阅，并验证您的新 Dapr 文档站点是否已部署。

可选地，使用门户中的 **静态 Web 应用** > **访问控制 (IAM)** 刀片授予正确的最小权限以进行入站发布和对依赖项的出站访问。

#### 配置 DNS

1. 在 Azure 门户中，从您刚刚创建的新 SWA 中，导航到左侧菜单中的 **自定义域**。
1. 复制 Web 应用的 "CNAME" 值。
1. 使用您自己的帐户，[提交 CNCF 工单](https://jira.linuxfoundation.org/secure/Dashboard.jspa) 以创建一个新的域名映射到您复制的 CNAME 值。对于此示例，要为 Dapr v1.1 创建一个新域，您将请求映射到 `v1-1.docs.dapr.io`。

   请求解决可能需要一些时间。

1. 确认新域后，返回到门户中的静态 Web 应用。
1. 导航到 **自定义域** 刀片并选择 **+ 添加**。
1. 选择 **其他 DNS 上的自定义域**。
1. 在 **域名** 下输入 `v1-1.docs.dapr.io`。点击 **下一步**。
1. 将 **主机名记录类型** 保持为 `CNAME`，并复制 **值** 的值。
1. 点击 **添加**。
1. 导航到 `https://v1-1.docs.dapr.io` 并验证空白网站是否正确加载。

您可以为任何预览版本重复这些步骤。

### 在新的 Dapr 发布日期

1. 等待所有代码/容器/Helm 图表发布。
1. 合并从 `release_v1.0` 到 `v1.0` 的 PR。删除 release/v1.0 分支。
1. 合并从 `release_v1.1` 到 `v1.1` 的 PR。删除 release/v1.1 分支。
1. 合并从 `release_v1.2` 到 `v1.2` 的 PR。删除 release/v1.2 分支。

恭喜发布新文档！🚀 🎉 🎈

## 拉取 SDK 文档更新

SDK 文档位于每个 SDK 仓库中。对 SDK 文档所做的更改会推送到相关的 SDK 仓库。例如，要更新 Go SDK 文档，您需要将更改推送到 `dapr/go-sdk` 仓库。在您将最新的 `dapr/go-sdk` 提交拉入 `dapr/docs` 当前版本分支之前，您的 Go SDK 文档更新不会反映在 Dapr 文档站点上。

要将 SDK 文档更新带到 Dapr 文档站点，您需要执行一个简单的 `git pull`。此示例涉及 Go SDK，但适用于所有 SDK。

1. 将最新的上游拉入您的本地 `dapr/docs` 版本分支。

1. 切换到 `dapr/docs` 目录的根目录。

1. 切换到 Go SDK 仓库。此命令将您从 `dapr/docs` 上下文切换到 `dapr/go-sdk` 上下文。

   ```bash
   cd sdkdocs/go
   ```

1. 切换到 `dapr/go-sdk` 中的 `main` 分支。

   ```bash
   git checkout main
   ```

1. 拉取最新的 Go SDK 提交。

   ```bash
   git pull upstream main
   ```

1. 切换到 `dapr/docs` 上下文以提交、推送并创建 PR。

## 下一步

有关为 Dapr 文档做出贡献的指导，请阅读 [贡献者指南]({{< ref contributing-docs.md >}})。