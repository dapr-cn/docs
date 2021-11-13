---
type: docs
title: "密钥管理概览"
linkTitle: "概述"
weight: 1000
description: "密钥管理构建块概览"
---

应用程序通常会通过使用专用的密钥存储来秘密存储敏感信息，如连接字符串、密钥和用于与数据库、服务和外部系统进行验证的令牌。

通常这需要建立一个密钥存储，如Azure Key Vault、Hashicorp 保险库和其他仓库，并在那里存储应用程序级别的密钥。 要访问这些密钥存储，应用程序需要导入密钥存储SDK，并使用它访问这些密钥。 这可能需要相当数量的模板代码，这些代码与应用的实际业务领域无关，因此在多云场景中，可能会使用不同厂商特定的密钥存储，这就成为一个更大的挑战。

让开发人员在任何地方更容易消耗应用程序密钥， Dapr 有一个专用的密钥构建块 API ，允许开发人员从一个密钥存储获得密钥。

使用 Dapr 的密钥存储构建块通常涉及以下内容：
1. 设置一个特定的密钥存储解决方案的组件。
1. 在应用程序代码中使用 Dapr 密钥 API 获取密钥。
1. 可选，在Dapr组件文件中引用密钥。

## 设置一个密钥存储

请参阅 [设置密钥存储]({{< ref howto-secrets.md >}}) 以了解如何设置一个密钥存储。

## 在您的应用程序中使用密钥

应用程序代码可以调用密钥构建块API，从Dapr支持的密钥存储中检索密钥，并可以在您的代码中使用。 请观看此 [视频](https://www.bilibili.com/video/BV1QK4y1p7fn?p=9&t=1818) ，以获取有关如何在应用程序中使用秘密 API 的示例。

例如，下图显示了一个应用程序从配置的云密钥存储中请求名为 "mysecret "的密钥存储 "vault"。

<img src="/images/secrets-overview-cloud-stores.png" width=600>

应用程序可以使用密钥API访问Kubernetes密钥存储的秘密。 在下面的示例中，应用程序会从 Kubernetes 密钥存储检索相同的密钥“mysecret”。

<img src="/images/secrets-overview-kubernetes-store.png" width=600>

在 Azure 中，Dapr 可以配置为使用管理身份验证的 Azure Key Vault，以便获取密钥。 在下面的示例中，Azure Kubernetes 服务 (AKS) 集群被配置为使用托管标识。 Then Dapr uses [pod identities](https://docs.microsoft.com/azure/aks/operator-best-practices-identity#use-pod-identities) to retrieve secrets from Azure Key Vault on behalf of the application.

<img src="/images/secrets-overview-azure-aks-keyvault.png" width=600>

请注意，在以上所有示例中，应用程序代码不必更改以获取相同的密钥。 Dapr在这里通过密钥构建块API和使用密钥组件完成了所有的重任。

请参阅 [使用 密钥API 访问应用程序密钥]({{< ref howto-secrets.md >}}) 以了解如何在您的应用程序中使用密钥。

有关详细的API信息，请阅读 [密钥API]({{< ref secrets_api.md >}})。

## 在Dapr组件中引用密钥存储

在配置Dapr组件（如状态存储）时，通常需要在组件文件中包含凭证。 与此相反，您可以将凭证放在Dapr支持的密钥存储中，并在Dapr组件中引用该密钥。 这是首选方法，是推荐的最佳做法，尤其是在生产环境中。

欲了解更多信息，请阅读 [引用组件中的密钥存储]({{< ref component-secrets.md >}})

## 限制访问密钥

为了对访问密钥提供更精细的控制，Dapr 提供了定义范围和限制访问权限的能力。 请参阅 [密钥的范围]({{<ref secrets-scopes>}})


