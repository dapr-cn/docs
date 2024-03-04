---
type: docs
title: "维护者指南"
linkTitle: "维护者指南"
weight: 20
description: "开始作为 Dapr 文档的维护者和批准者。"
---

在本指南中，您将学习如何执行常规 Dapr 文档维护者和批准者的责任。 为了成功完成这些任务，您需要在 [`dapr/docs`](https://github.com/dapr/docs) 存储库中拥有审批者或维护者身份。

要了解如何为 Dapr 文档做出贡献，请查看 [投稿人指南]({{< ref contributing-docs.md >}}).

## 分支指南

Dapr 文档处理分支的方式与大多数代码仓库不同。 没有 `main` 分支，而是给每个分支贴上标签，以匹配运行时版本的主版本和次要版本。

完整列表，请访问 [Docs repo](https://github.com/dapr/docs#branch-guidance)

阅读 [贡献者指南]({{< ref "contributing-docs.md#branch-guidance" >}}) 有关发布分支的详细信息。

## 从当前发布分支向上合并到预发布分支

作为文档审批者或维护者，您需要执行例行的上行合并，以使预发布分支与当前发布分支的更新保持一致。 建议每周将当前分支合并到预发布分支。

对于以下步骤，请将`v1.0`视为当前版本，将`v1.1`视为即将发布的版本。

1. 打开 Visual Studio Code 到 Dapr 文档存储库。
1. 从您的本地存储库切换到最新的分支（`v1.0`）并同步更改：

   ```bash
   git pull upstream v1.0
   git push origin v1.0
   ```

1. 切换到即将到来的分支（`v1.1`）并同步更改：

   ```bash
   git pull upstream v1.1
   git push origin v1.1
   ```

1. 基于即将发布的版本创建一个新分支：

   ```bash
   git checkout -b upmerge_MM-DD
   ```

1. 打开终端并暂存从最新版本到 upmerge 分支的合并：

   ```bash
   git merge --no-ff --no-commit v1.0
   ```

1. 在终端中，确保包含的文件看起来准确无误。 检查 VS Code 中的任何合并冲突。 删除不需要合并的配置更改或版本信息。
1. 提交已暂存的更改并推送到 upmerge 分支（`upmerge_MM-DD`）。
1. 从 upmerge 分支向即将发布的分支（`v1.1`）打开一个 PR。
1. 审查 PR 并仔细检查是否有意外更改被推送到了 upmerge 分支。

## 发布流程

Dapr 文档必须与 Dapr 项目发布中包含的功能和更新保持一致。 在 Dapr 发布日期前，请确保：

- 所有新功能或更新都已经充分记录和审查。
- 即将发布的文档 PR 指向发布分支。

对于以下步骤，请将`v1.0`视为当前版本，将`v1.1`视为即将发布的版本。

文档发布流程需要以下步骤：

- 将最新版本合并到即将发布的版本分支中
- 更新到最新和即将发布的 Hugo 配置文件
- 为下一个版本创建一个新的Azure静态Web应用程序
- 下一个版本网站的新DNS条目
- 为下一个版本创建一个新的git分支

### 向上合并

首先，从最新版本执行[文档 upmerge](#upmerge-from-current-release-branch-to-the-pre-release-branch)到即将发布的版本分支。

### 更新 Hugo 配置

upmerge 后，为发布准备 docs 分支。 在两个单独的 PR 中，您需要：

- 存档最新版本。
- 将预览/发布分支作为当前文档的实时版本。

#### 最新发行版

这些步骤将准备最新的发布分支进行归档。

1. 打开 VS Code 到 Dapr 文档存储库。
1. 从您的本地存储库切换到最新的分支（`v1.0`）并同步更改：

   ```bash
   git pull upstream v1.0
   git push origin v1.0
   ```

1. 基于最新发布的版本创建一个新分支：

   ```bash
   git checkout -b release_v1.0
   ```

1. 在 VS Code 中，导航到 `/daprdocs/config.toml`。
1. 将以下TOML添加到`# Versioning`部分（大约在第154行附近）：

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

1. 删除`.github/workflows/website-root.yml`。
1. 提交已暂存的更改并推送到您的分支（`release_v1.0`）。
1. 从 `release_v1.0` 到 `v1.0` 打开一个 PR。
1. 请让文档维护者或批准者审查。 等待发布之前合并PR。

#### 未来发布

这些步骤将准备即将发布的分支以便提升为最新版本。

1. 打开 VS Code 到 Dapr 文档存储库。
1. 从您的本地存储库切换到即将发布的版本分支（`v1.1`）并同步更改：

   ```bash
   git pull upstream v1.1
   git push origin v1.1
   ```

1. 基于即将发布的版本创建一个新分支：

   ```bash
   git checkout -b release_v1.1
   ```

1. 在 VS Code 中，导航到 `/daprdocs/config.toml`。
1. 将第 1 行更新为 `baseURL - https://docs.dapr.io/`.
1. 更新`# Versioning`部分（大约在第154行附近），以显示正确的版本和标签：

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

1. 导航到`.github/workflows/website-root.yml`。
1. 更新触发工作流程的分支：

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

1. 导航至`/README.md`。
1. 更新版本表：

```markdown
| 分支                                                         | 网站                       | 描述                                                                                           |
| ------------------------------------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------ |
| [v1.1](https://github.com/dapr/docs) (primary)               | https://docs.dapr.io       | 最新 Dapr 发行版文档。 拼写错误修正，澄清和大部分文档在这里。 |
| [v1.2](https://github.com/dapr/docs/tree/v1.2) (pre-release) | https://v1-2.docs.dapr.io/ | 预发布文档. 仅适用于 v1.2+ 的文档更新在此处进行。                |
```

1. 在 VS Code 中，搜索任何 `v1.0` 引用，并根据需要将其替换为 `v1.1`。
1. 提交已暂存的更改并推送到您的分支（`release_v1.1`）。
1. 从 `release_v1.1` 到 `v1.1` 打开一个 PR。
1. 请让文档维护者或批准者审查。 等待发布之前合并PR。

### 为未来发布创建新网站

接下来，为将来的 Dapr 发布创建一个新网站，您可以从最新的网站指向它。 为此，您需要：

- 部署到 Azure Static Web Apps
- 通过CNCF的请求配置DNS。

这些步骤需要身份验证。

#### 部署到 Azure Static Web Apps

为将来的 Dapr 版本部署新的 Azure Static Web 应用。 在这个例子中，我们使用v1.2作为未来的发布版本。

{{% alert title="Important" color="primary" %}}
需要 Microsoft 员工访问权限才能创建新的 Azure 静态 Web 应用。
{{% /alert %}}

1. 使用 Azure PIM 执行以下操作 [提升为“所有者”角色](https://eng.ms/docs/cloud-ai-platform/devdiv/devdiv-azure-service-dmitryr/azure-devex-philon/dapr/dapr/assets/azure) 用于 Dapr Prod 订阅。
1. 导航到[docs-website](https://ms.portal.azure.com/#@microsoft.onmicrosoft.com/resource/subscriptions/38875a89-0178-4f27-a141-dc6fc01f183d/resourceGroups/docs-website/overview)资源组。
1. 选择 **+ Create** 并搜索 **Static Web App**。 点击**Create**。
1. 输入以下信息：
   - Subscription: `Dapr Prod`
   - Resource Group: `docs-website`
   - Name: `daprdocs-v1-2`
   - Hosting Plan: `Free`
   - Region: `West US 2`
   - Source: `Other`
1. 选择 **Review + create**，然后部署静态 Web 应用。
1. 等待部署，并导航到新的静态 Web 应用资源。
1. 选择**Manage deployment token**并复制该值。
1. 导航到文档存储库 **Secrets management** 页面下 **设置** 并创建一个名为 `AZURE_STATIC_WEB_APPS_V1_2`，并提供部署令牌的值。

#### 配置 DNS

{{% alert title="Important" color="primary" %}}
 此部分只能在 Secure Admin Workstation（SAW）上完成。 如果您没有SAW设备，请向拥有该设备的团队成员寻求帮助。

{{% /alert %}}

1. 确保您是IDWeb中`DMAdaprweb`安全组的成员。
1. 在SAW上导航至[https://prod.msftdomains.com/dns/form?environment=0](https://prod.msftdomains.com/dns/form?environment=0)
1. 在左侧窗格中输入以下详细信息：
   - Team Owning Alias: `DMAdaprweb`
   - Business Justification/Notes: `Configuring DNS for new Dapr docs website`
   - Environment: `Internet/Public-facing`
   - Zone: `dapr.io`
   - Action: `Add`
   - Incident ID: Leave blank

1. 在您刚刚部署的新静态 Web 应用程序中，导航到 **Custom domains** 部分，并选择 **+ Add**
1. 进入 `v1-2.docs.dapr.io` 下 **Domain name**. 点击 **下一个**。
1. 保持 **主机名记录类型** 为 `CNAME`，并复制 **值** 的数值。
1. 返回域门户，在主窗格中输入以下信息：
   - Name: `v1-2.docs`
   - Type: `CNAME`
   - Data：您刚从静态网站应用程序中复制的值

1. 点击**提交**在右上角。
1. 等待两封电子邮件：
   - 一个说你的请求已收到。
   - 一个说请求已经完成。
1. 回到 Azure 门户，单击 **Add**。 您可能需要点击几次以解决DNS延迟。
1. 现在为您生成了一个TLS证书，并保存了DNS记录。 这可能需要 2-3 分钟。
1. 导航到 `https://v1-2.docs.dapr.io` 并验证空白网站是否正确加载。

### 配置未来的网站分支

1. 打开 VS Code 到 Dapr 文档存储库。
1. 从您的本地存储库切换到即将发布的版本分支（`v1.1`）并同步更改：

   ```bash
   git pull upstream v1.1
   git push origin v1.1
   ```

1. 基于`v1.1`创建一个新分支，并将其命名为`v1.2`：

  ```bash
  git checkout -b release_v1.1
  ```

1. 将`.github/workflows/website-v1-1.yml`重命名为`.github/workflows/website-v1-2.yml`。
1. 在 VS Code 中打开 `.github/workflows/website-v1-2.yml` 并将名称、触发器和部署目标更新为 1.2：

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

1. 导航至`daprdocs/config.toml`并更新`baseURL`指向新的预览网站：

   ```toml
   baseURL = "https://v1-2.docs.dapr.io"
   ```

1. 更新`# GitHub Information`和`# Versioning`部分（大约在第148行附近），以显示正确的版本和标签:

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

1. 提交暂存更改并推送到 v1.2 分支。
1. 导航到[docs Actions 页面](https://github.com/dapr/docs/actions)，确保构建和发布成功完成。
1. 导航到新的 `https://v1-2.docs.dapr.io` 网站，并验证新版本是否显示。

### 在 Dapr 发布的那天

1. 等待所有代码/容器/Helm charts 发布。
1. 合并从 `release_v1.0` 到 `v1.0` 的 PR。 删除 release/v1.0 分支。
1. 合并来自 `release_v1.1` 到 `v1.1` 的 PR。 删除 release/v1.1 分支。

祝贺新文档发布！ 🚀 🎉 🎈

## 拉取SDK文档更新

SDK文档存储在每个SDK存储库中。 对 SDK 文档所做的更改已推送到相关的 SDK 存储库。 例如，要更新 Go SDK 文档，您需要将更改推送到 `dapr/go-sdk` 存储库。 直到您将最新的 `dapr/go-sdk` 提交到 `dapr/docs` 当前版本分支中，您的 Go SDK 文档更新将不会在 Dapr 文档站点上反映出来。

要将 SDK 文档的更新实时带到 Dapr 文档站点，您需要执行一个简单的 `git pull`。 这个示例是关于 Go SDK 的，但适用于所有 SDK。

1. 将最新的上游拉入到您本地的`dapr/docs`版本分支。

1. 切换到 `dapr/docs` 目录的根目录。

1. 切换到 Go SDK 存储库。 此命令将带您退出 `dapr/docs` 上下文并进入 `dapr/go-sdk` 的上下文。

   ```bash
   cd sdkdocs/go
   ```

1. 切换到 `dapr/go-sdk` 中的 `main` 分支。

   ```bash
   git checkout main
   ```

1. 拉取最新的Go SDK提交。

   ```bash
   git pull upstream main
   ```

1. 切换到 `dapr/docs` 上下文以提交、推送和创建 PR。

## 下一步

有关为 Dapr 文档做出贡献的指南，请阅读 [投稿人指南]({{< ref contributing-docs.md >}}).