---
type: docs
title: "Secrets 管理概述"
linkTitle: "概述"
weight: 1000
description: "Secrets 管理 API 构建块概述"
---

应用程序通常使用专用的 secret 存储来保存敏感信息。例如，您可以使用存储在 secret 存储中的连接字符串、密钥、令牌和其他应用程序级别的 secret 来对数据库、服务和外部系统进行身份验证，例如 [AWS Secrets Manager, Azure Key Vault, Hashicorp Vault 等]({{< ref supported-secret-stores >}})。

为了访问这些 secret 存储，应用程序需要导入 secret 存储的 SDK。在多云场景中，这种情况更具挑战性，因为可能会使用不同供应商特定的 secret 存储。

## Secrets 管理 API

Dapr 的专用 secrets 构建块 API 使开发人员更容易从 secret 存储中使用应用程序 secret。要使用 Dapr 的 secret 存储构建块，您需要：

1. 为特定的 secret 存储解决方案设置一个组件。
1. 在应用程序代码中使用 Dapr secrets API 检索 secret。
1. 可选地，在 Dapr 组件文件中引用 secret。

[以下概述视频和演示](https://www.youtube.com/live/0y7ne6teHT4?si=3bmNSSyIEIVSF-Ej&t=9931)展示了 Dapr secrets 管理的工作原理。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/0y7ne6teHT4?si=3bmNSSyIEIVSF-Ej&amp;start=9931" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 功能

Secrets 管理 API 构建块为您的应用程序带来了多种功能。

### 在不更改应用程序代码的情况下配置 secret

您可以在应用程序代码中调用 secrets API，从 Dapr 支持的 secret 存储中检索和使用 secret。观看[此视频](https://www.youtube.com/watch?v=OtbYCBt9C34&t=1818)以了解如何在应用程序中使用 secrets 管理 API 的示例。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/OtbYCBt9C34?start=1818" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

例如，下图显示了一个应用程序从配置的云 secret 存储中请求名为 "mysecret" 的 secret，该 secret 存储名为 "vault"。

<img src="/images/secrets-overview-cloud-stores.png" width=600>

应用程序还可以使用 secrets API 从 Kubernetes secret 存储中访问 secret。默认情况下，Dapr 在 Kubernetes 模式下启用了内置的 [Kubernetes secret 存储]({{< ref "kubernetes-secret-store.md" >}})，可以通过以下方式部署：

- 使用 Helm 的默认设置，或
- 运行 `dapr init -k`

如果您使用其他 secret 存储，可以通过在 deployment.yaml 文件中添加注释 `dapr.io/disable-builtin-k8s-secret-store: "true"` 来禁用（不配置）Dapr Kubernetes secret 存储。默认值为 `false`。

在下面的示例中，应用程序从 Kubernetes secret 存储中检索相同的 secret "mysecret"。

<img src="/images/secrets-overview-kubernetes-store.png" width=600>

在 Azure 中，您可以配置 Dapr 使用托管身份通过 Azure Key Vault 检索 secret。在下面的示例中：

1. 配置了一个 [Azure Kubernetes Service (AKS) 集群](https://docs.microsoft.com/azure/aks) 以使用托管身份。
1. Dapr 使用 [pod 身份](https://docs.microsoft.com/azure/aks/operator-best-practices-identity#use-pod-identities) 代表应用程序从 Azure Key Vault 检索 secret。

<img src="/images/secrets-overview-azure-aks-keyvault.png" width=600>

在上述示例中，应用程序代码无需更改即可获取相同的 secret。Dapr 通过 secrets 管理构建块 API 使用 secret 管理组件。

[尝试使用 secrets API]({{< ref "#try-out-secrets-management" >}}) 通过我们的快速入门或教程之一。

### 在 Dapr 组件中引用 secret 存储

在配置 Dapr 组件（如 state 存储）时，通常需要在组件文件中包含凭据。或者，您可以将凭据放在 Dapr 支持的 secret 存储中，并在 Dapr 组件中引用该 secret。这是首选方法和推荐的最佳实践，尤其是在生产环境中。

有关更多信息，请阅读[在组件中引用 secret 存储]({{< ref component-secrets.md >}})。

### 限制对 secret 的访问

为了对 secret 的访问提供更细粒度的控制，Dapr 提供了定义范围和限制访问权限的能力。了解更多关于[使用 secret 范围]({{< ref secrets-scopes >}})的信息。

## 尝试 secrets 管理

### 快速入门和教程

想要测试 Dapr secrets 管理 API 吗？通过以下快速入门和教程来查看 Dapr secrets 的实际应用：

| 快速入门/教程 | 描述 |
| ------------------- | ----------- |
| [Secrets 管理快速入门]({{< ref secrets-quickstart.md >}}) | 使用 secrets 管理 API 从配置的 secret 存储中在应用程序代码中检索 secret。 |
| [Secret Store 教程](https://github.com/dapr/quickstarts/tree/master/tutorials/secretstore) | 演示如何使用 Dapr Secrets API 访问 secret 存储。 |

### 直接在您的应用中开始管理 secret

想要跳过快速入门？没问题。您可以直接在应用程序中尝试使用 secret 管理构建块来检索和管理 secret。在[安装 Dapr]({{< ref "getting-started/_index.md" >}})后，您可以从[secrets 使用指南]({{< ref howto-secrets.md >}})开始使用 secrets 管理 API。

## 下一步

- 了解[如何使用 secret 范围]({{< ref secrets-scopes.md >}})。
- 阅读 [secrets API 参考文档]({{< ref secrets_api.md >}})。