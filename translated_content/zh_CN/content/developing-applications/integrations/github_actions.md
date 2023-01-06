---
type: docs
weight: 5000
title: "在 GitHub 操作工作流中使用 Dapr CLI"
linkTitle: "GitHub Actions"
description: "了解如何将 Dapr CLI 添加到 GitHub 操作中，以便在您的环境中部署和管理 Dapr。"
---

Dapr 可以通过 GitHub Marketplace 中提供的 [Dapr 工具安装程序](https://github.com/marketplace/actions/dapr-tool-installer) 与 GitHub Actions 集成。 此安装程序将 Dapr CLI 添加到您的工作流中，允许您跨环境部署、管理和升级 Dapr。

## 概述

`dapr/setup-dapr` 操作将在 macOS、Linux 和 Windows 运行器上安装指定版本的 Dapr CLI。 安装后，您可以运行任何 [Dapr CLI 命令]({{< ref cli >}}) 来管理 Dapr 环境。

## 示例

```yaml
- name: Install Dapr
  uses: dapr/setup-dapr@v1
  with:
    version: '{{% dapr-latest-version long="true" %}}'

- name: Initialize Dapr
  shell: pwsh
  run: |
    # Get the credentials to K8s to use with dapr init
    az aks get-credentials --resource-group ${{ env.RG_NAME }} --name "${{ steps.azure-deployment.outputs.aksName }}"

    # Initialize Dapr    
    # Group the Dapr init logs so these lines can be collapsed.
    Write-Output "::group::Initialize Dapr"
    dapr init --kubernetes --wait --runtime-version ${{ env.DAPR_VERSION }}
    Write-Output "::endgroup::"

    dapr status --kubernetes
  working-directory: ./twitter-sentiment-processor/demos/demo3
```