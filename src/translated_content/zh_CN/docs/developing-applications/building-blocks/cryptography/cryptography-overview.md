---
type: docs
title: 加密概述
linkTitle: 概述
weight: 1000
description: "Dapr 加密概述"
---

使用加密构建块，您可以安全且一致地利用加密技术。Dapr 提供的 API 允许您在密钥库或 Dapr sidecar 中执行加密和解密操作，而无需将加密密钥暴露给您的应用程序。

## 为什么需要加密？

加密技术在应用程序中被广泛使用，正确实施可以在数据泄露时提高安全性。在某些情况下，您可能需要使用加密技术以符合行业法规（如金融领域）或法律要求（如 GDPR 等隐私法规）。

然而，正确使用加密技术可能很复杂。您需要：

- 选择合适的算法和选项
- 学习正确的密钥管理和保护方法
- 在希望限制对加密密钥材料的访问时，处理操作复杂性

安全的一个重要要求是限制对加密密钥的访问，这通常被称为“原始密钥材料”。Dapr 可以与密钥库集成，如 Azure Key Vault（未来将支持更多组件），这些密钥库将密钥存储在安全的环境中，并在库中执行加密操作，而不将密钥暴露给您的应用程序或 Dapr。

或者，您可以配置 Dapr 为您管理加密密钥，在 sidecar 中执行操作，同样不将原始密钥材料暴露给您的应用程序。

## Dapr 中的加密

使用 Dapr，您可以在不将加密密钥暴露给应用程序的情况下执行加密操作。

<img src="/images/cryptography-overview.png" width=1000 style="padding-bottom:15px;" alt="显示 Dapr 加密如何与您的应用程序协作的图示">

通过使用加密构建块，您可以：

- 更轻松地以安全的方式执行加密操作。Dapr 提供了防止使用不安全算法或不安全选项的保护措施。
- 将密钥保存在应用程序之外。应用程序从未看到“原始密钥材料”，但可以请求库使用密钥执行操作。当使用 Dapr 的加密引擎时，操作在 Dapr sidecar 中安全地执行。
- 实现更好的关注点分离。通过使用外部库或加密组件，只有授权团队可以访问私钥材料。
- 更轻松地管理和轮换密钥。密钥在库中管理并在应用程序之外，它们可以在不需要开发人员参与（甚至不需要重启应用程序）的情况下轮换。
- 启用更好的审计日志记录，以监控何时在库中使用密钥执行操作。

{{% alert title="注意" color="primary" %}}
虽然在 alpha 版本中同时支持 HTTP 和 gRPC，但使用支持的 Dapr SDK 的 gRPC API 是加密的推荐方法。
{{% /alert %}}

## 功能

### 加密组件

Dapr 加密构建块包括两种组件：

- **允许与管理服务或库（“密钥库”）交互的组件。**  
  类似于 Dapr 在各种 secret 存储或 state 存储之上的“抽象层”，这些组件允许与各种密钥库（如 Azure Key Vault）交互（未来 Dapr 版本中会有更多）。通过这些组件，对私钥的加密操作在库中执行，Dapr 从未看到您的私钥。

- **基于 Dapr 自身加密引擎的组件。**  
  当密钥库不可用时，您可以利用基于 Dapr 自身加密引擎的组件。这些组件名称中带有 `.dapr.`，在 Dapr sidecar 中执行加密操作，密钥存储在文件、Kubernetes secret 或其他来源中。虽然 Dapr 知道私钥，但它们仍然对您的应用程序不可用。

这两种组件，无论是利用密钥库还是使用 Dapr 中的加密引擎，都提供相同的抽象层。这允许您的解决方案根据需要在各种库和/或加密组件之间切换。例如，您可以在开发期间使用本地存储的密钥，而在生产中使用云库。

### 加密 API

加密 API 允许使用 [Dapr Crypto Scheme v1](https://github.com/dapr/kit/blob/main/schemes/enc/v1/README.md) 加密和解密数据。这是一种有见地的加密方案，旨在使用现代、安全的加密标准，并以流的方式高效处理数据（甚至是大文件）。

## 试用加密

### 快速入门和教程

想要测试 Dapr 加密 API 吗？通过以下快速入门和教程，看看加密如何实际运作：

| 快速入门/教程 | 描述 |
| ------------------- | ----------- |
| [加密快速入门]({{< ref cryptography-quickstart.md >}}) | 使用加密 API 使用 RSA 和 AES 密钥加密和解密消息和大文件。 |

### 直接在您的应用程序中开始使用加密

想要跳过快速入门？没问题。您可以直接在应用程序中试用加密构建块来加密和解密您的应用程序。在 [安装 Dapr]({{< ref "getting-started/_index.md" >}}) 后，您可以从 [加密操作指南]({{< ref howto-cryptography.md >}}) 开始使用加密 API。

## 演示

观看此 [Dapr 社区电话 #83 中的加密 API 演示视频](https://youtu.be/PRWYX4lb2Sg?t=1148)：

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/PRWYX4lb2Sg?start=1148" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 下一步

{{< button text="使用加密 API >>" page="howto-cryptography.md" >}}

## 相关链接
- [加密概述]({{< ref cryptography-overview.md >}})
- [加密组件规范]({{< ref supported-cryptography >}})
- [加密 API 参考文档]({{< ref cryptography_api >}})