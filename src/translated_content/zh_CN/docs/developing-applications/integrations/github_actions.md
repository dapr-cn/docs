---
type: docs
weight: 5000
title: "如何：在 GitHub Actions 工作流中使用 Dapr CLI"
linkTitle: "GitHub Actions"
description: "将 Dapr CLI 集成到您的 GitHub Actions 中，以便在您的环境中部署和管理 Dapr。"
---

Dapr 可以通过 GitHub Marketplace 上的 [Dapr 工具安装器](https://github.com/marketplace/actions/dapr-tool-installer)与 GitHub Actions 进行集成。这个安装器会将 Dapr CLI 添加到您的工作流中，使您能够在不同环境中部署、管理和升级 Dapr。

## 使用 Dapr 工具安装器安装 Dapr CLI

请将以下代码片段复制并粘贴到您的应用程序的 YAML 文件中：

```yaml
- name: Dapr 工具安装器
  uses: dapr/setup-dapr@v1
```

[`dapr/setup-dapr` action](https://github.com/dapr/setup-dapr) 可以在 macOS、Linux 和 Windows 运行器上安装指定版本的 Dapr CLI。安装完成后，您可以运行任何 [Dapr CLI 命令]({{< ref cli >}}) 来管理您的 Dapr 环境。

有关所有输入的详细信息，请参阅 [`action.yml` 元数据文件](https://github.com/dapr/setup-dapr/blob/main/action.yml)。

## 示例

例如，如果您的应用程序使用了 [Azure Kubernetes Service (AKS) 的 Dapr 扩展]({{< ref azure-kubernetes-service-extension.md >}})，那么您的应用程序 YAML 文件可能如下所示：

```yaml
- name: 安装 Dapr
  uses: dapr/setup-dapr@v1
  with:
    version: '{{% dapr-latest-version long="true" %}}'

- name: 初始化 Dapr
  shell: bash
  run: |
    # 获取用于 dapr init 的 K8s 凭据
    az aks get-credentials --resource-group ${{ env.RG_NAME }} --name "${{ steps.azure-deployment.outputs.aksName }}"

    # 初始化 Dapr    
    # 将 Dapr init 日志分组，以便可以折叠这些行。
    echo "::group::初始化 Dapr"
    dapr init --kubernetes --wait --runtime-version ${{ env.DAPR_VERSION }}
    echo "::endgroup::"

    dapr status --kubernetes
  working-directory: ./demos/demo3
```

## 下一步

- 了解更多关于 [GitHub Actions](https://docs.github.com/en/actions) 的信息。
- 通过教程学习 [GitHub Actions 如何与您的 Dapr 容器应用程序（Azure 容器应用程序）协作](https://learn.microsoft.com/azure/container-apps/dapr-github-actions?tabs=azure-cli)。
