---
type: docs
title: "密钥管理概览"
linkTitle: "概述"
weight: 1000
description: "机密管理 API 构建基块概述"
---

应用程序通常通过使用专用的密钥存储将敏感信息存储在密钥中。 例如，您可以使用连接字符串、密钥、令牌和其他应用程序级别的秘密在秘密存储中对数据库、服务和外部系统进行身份验证，例如 [AWS Secrets Manager、Azure Key Vault、Hashicorp Vault等]({{< ref supported-secret-stores >}})。

要访问这些密钥存储，应用程序会导入密钥存储 SDK，通常需要相当数量的无关的样板代码。 这在多云场景中带来了更大的挑战，因为可能会使用不同的供应商特定的密钥存储。

## 密钥管理 API

Dapr的专用密钥构建块API使开发人员更容易从密钥存储中获取应用程序密钥。 要使用 Dapr 的密钥存储构建块，您需要：

1. 设置一个特定的密钥存储解决方案的组件。
1. 在应用程序代码中使用 Dapr 密钥 API 检索密钥。
1. 可选，在 Dapr 组件文件中引用密钥。

[以下概述视频和演示](https://www.youtube.com/live/0y7ne6teHT4?si=3bmNSSyIEIVSF-Ej&t=9931) 展示了Dap密钥管理的工作原理。 

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/0y7ne6teHT4?si=3bmNSSyIEIVSF-Ej&amp;start=9931" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 特性

密钥管理 API 构建块为您的应用程序提供了下面几个功能。

### 配置密钥而不更改应用程序代码

您可以在应用程序代码中调用 secrets API 从 Dapr 支持的密钥存储中检索和使用密钥。 观看 [这个视频](https://www.youtube.com/watch?v=OtbYCBt9C34&t=1818) 以了解如何在您的应用程序中使用密钥管理 API。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/OtbYCBt9C34?start=1818" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

例如，下图显示了一个应用程序从配置的云密钥存储中请求名为"mysecret"的密钥存储"vault"。

<img src="/images/secrets-overview-cloud-stores.png" width=600>

应用程序还可以使用密钥 API 从 Kubernetes 密钥存储访问秘密。 默认情况下，Dapr 启用内置的 [Kubernetes 模式下的 Kubernetes 密钥存储]({{< ref "kubernetes-secret-store.md" >}})，通过以下方式部署：

- Helm 的默认值，或者
- `dapr init -k`

如果您使用的是其他的密钥存储，您可以通过 Helm 设置 `disable-builtin-k8s-secret-store` 为 `true`。 默认值为 `false`。

在下面的示例中，应用程序会从 Kubernetes 密钥存储检索相同的密钥“mysecret”。

<img src="/images/secrets-overview-kubernetes-store.png" width=600>

在Azure中，您可以配置Dapr使用托管标识来通过Azure Key Vault进行身份验证以检索密钥。 在下面的示例中：

1. An [Azure Kubernetes Service (AKS) cluster](https://docs.microsoft.com/azure/aks) is configured to use managed identities.
1. Dapr 使用 [pod identities](https://docs.microsoft.com/azure/aks/operator-best-practices-identity#use-pod-identities) 代表应用程序从 Azure Key Vault 中检索机密。

<img src="/images/secrets-overview-azure-aks-keyvault.png" width=600>

在上面的示例中，应用程序代码不必更改以获取相同的密钥。 Dapr 使用密钥管理构建块 API 来管理密钥。

[尝试使用我们的快速入门或教程之一，使用secrets API]({{< ref "#try-out-secrets-management" >}}) 。

### 在 Dapr 组件中引用密钥存储

在配置 Dapr 组件（如状态存储）时，通常需要在组件文件中包含凭证。 除此之外，您可以将凭证放在 Dapr 支持的密钥存储中，并在 Dapr 组件中引用该密钥。 这是首选方法，是推荐的最佳做法，尤其是在生产环境中。

欲了解更多信息，请阅读 [引用组件中的密钥存储]({{< ref component-secrets.md >}}).

### 限制对密钥的访问

为了对访问密钥提供更精细的控制，Dapr 提供了定义范围和限制访问权限的能力。 了解有关使用秘密作用域的 [的更多信息]({{< ref secrets-scopes >}})

## 尝试密钥管理

### 快速入门和教程

想要测试 Dapr 密钥管理 API？ 通过以下快速入门和教程了解Dapr secrets的实际操作：

| 快速入门/教程                                                                         | 说明                                |
| ------------------------------------------------------------------------------- | --------------------------------- |
| [密钥管理快速入门]({{< ref secrets-quickstart.md >}})                                   | 使用密钥管理 API 从配置的密钥存储中检索应用程序代码中的密钥。 |
| [密钥存储教程](https://github.com/dapr/quickstarts/tree/master/tutorials/secretstore) | 演示使用 Dapr Secrets API 来访问密钥存储。    |

### 开始直接在应用程序中管理密钥

想跳过快速入门？ 没问题。 您可以直接在应用程序中试用密钥管理构建块，以检索和管理密钥。 After [Dapr is installed]({{< ref "getting-started/_index.md" >}}), you can begin using the secrets management API starting with [the secrets how-to guide]({{< ref howto-secrets.md >}}).

## 下一步

- [学习如何使用密钥范围]({{< ref secrets-scopes.md >}})。
- 阅读 [secrets API 引用文档]({{< ref secrets_api.md >}})。