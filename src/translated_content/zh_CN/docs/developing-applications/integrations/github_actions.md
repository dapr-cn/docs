---
type: docs
weight: 5000
title: 如何在 GitHub Actions 工作流中使用 Dapr CLI
linkTitle: 如何使用：GitHub Actions
description: 将 Dapr CLI 添加到您的 GitHub Actions，以在您的环境中部署和管理 Dapr。
---

Dapr 可以通过 [Dapr 工具安装程序](https://github.com/marketplace/actions/dapr-tool-installer) 在 GitHub Marketplace 中与 GitHub Actions 集成。 此安装程序将 Dapr CLI 添加到您的工作流中，允许您跨环境部署、管理和升级 Dapr。

## 通过Dapr工具安装Dapr CLI

将以下安装程序片段复制并粘贴到您的应用程序的YAML文件中：

```yaml
- name: Dapr tool installer
  uses: dapr/setup-dapr@v1
```

[`dapr/setup-dapr`操作](https://github.com/dapr/setup-dapr)将在macOS、Linux和Windows的运行器上安装指定版本的Dapr CLI。 安装后，您可以运行任何[Dapr CLI命令]({{< ref cli >}})来管理您的Dapr环境。

请参考[`action.yml`元数据文件](https://github.com/dapr/setup-dapr/blob/main/action.yml)了解所有输入的详细信息。

## 如何使用Dapr扩展来开发和运行Dapr应用程序

例如，对于使用[Dapr扩展适用于Azure Kubernetes服务（AKS）]({{< ref azure-kubernetes-service-extension.md >}})的应用程序，您的应用程序YAML将如下所示：

```yaml
- name: Install Dapr
  uses: dapr/setup-dapr@v1
  with:
    version: '{{% dapr-latest-version long="true" %}}'

- name: Initialize Dapr
  shell: bash
  run: |
    # Get the credentials to K8s to use with dapr init
    az aks get-credentials --resource-group ${{ env.RG_NAME }} --name "${{ steps.azure-deployment.outputs.aksName }}"

    # Initialize Dapr    
    # Group the Dapr init logs so these lines can be collapsed.
    echo "::group::Initialize Dapr"
    dapr init --kubernetes --wait --runtime-version ${{ env.DAPR_VERSION }}
    echo "::endgroup::"

    dapr status --kubernetes
  working-directory: ./demos/demo3
```

## 下一步

- 了解有关[GitHub Actions](https://docs.github.com/en/actions)的更多信息。
- 按照教程学习如何使用 [GitHub Actions 与你的 Dapr 容器应用程序 (Azure Container Apps)](https://learn.microsoft.com/azure/container-apps/dapr-github-actions?tabs=azure-cli)
