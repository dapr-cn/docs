---
type: docs
title: 加密概述
linkTitle: Overview
weight: 1000
description: Dapr 加密概述
---

有了密码学构建模块，您就能以安全、一致的方式利用密码学。 Dapr 提供的应用程序接口允许您在密钥库或 Dapr sidecar 中执行加密和解密信息等操作，而无需向应用程序公开加密密钥。

## 为什么需要 Cryptography 构建块？

应用程序广泛使用加密技术，如果实施得当，即使数据被泄露，也能使解决方案更加安全。 在某些情况下，您可能需要使用加密技术来遵守行业法规（例如金融行业）或法律要求（包括隐私法规，如 GDPR）。

然而，正确利用加密技术可能很困难。 您需要

- 选择正确的算法和选项
- 学习管理和保护密钥的正确方法
- 当您希望限制对加密密钥材料的访问时，如何应对复杂的操作问题

安全的一个重要要求是限制对加密密钥（通常称为 "原始密钥材料"）的访问。 Dapr 可以与 Azure Key Vault 等密钥保管库集成（未来还会有更多组件），这些密钥保管库会将密钥存储在安全飞地中，并在保管库中执行加密操作，而不会将密钥暴露给应用程序或 Dapr。

另外，您也可以配置 Dapr 来为您管理加密密钥，在侧卡中执行操作，同样不会向您的应用程序暴露原始密钥材料。

## Dapr 中的加密技术

使用 Dapr，您可以执行加密操作，而无需向应用程序公开加密密钥。

<img src="/images/cryptography-overview.png" width=1000 style="padding-bottom:15px;" alt="Diagram showing how Dapr cryptography works with your app">

通过使用密码学构件，您可以

- 更容易以安全的方式执行加密操作。 Dapr 提供了防止使用不安全算法或使用带有不安全选项的算法的保障措施。
- 将钥匙放在应用程序之外。 应用程序永远看不到 "原始密钥材料"，但可以请求保险库对密钥执行操作。 使用 Dapr 的加密引擎时，可在 Dapr sidecar 内安全地执行操作。
- 体验更大程度的关注分离。 通过使用外部保险库或加密组件，只有经过授权的团队才能访问私人密钥材料。
- 更轻松地管理和更换 key 密钥在保险库和应用程序之外进行管理，无需开发人员参与（甚至无需重启应用程序）即可轮换密钥。
- 启用更好的审计日志，以监控对保管库中的密钥执行操作时的情况。

{{% alert title="注意" color="primary" %}}
虽然 alpha 版支持 HTTP 和 gRPC，但建议使用受支持的 Dapr SDK 和 gRPC API 进行加密。
{{% /alert %}}

## 特性

### 加密组件

Dapr 密码学构建块包括两种组件：

- **允许与管理服务或保管库（"密钥库"）交互的组件。**\
  与 Dapr 在各种秘密存储或状态存储之上提供 "抽象层 "的方式类似，这些组件允许与 Azure Key Vault 等各种密钥库进行交互（在未来的 Dapr 版本中还会有更多）。 有了这些组件，私钥的加密操作在保管库内进行，Dapr 不会看到您的私钥。

- **基于Dapr自身加密引擎的组件。**
  当密钥库不可用时，您可以利用基于Dapr自身加密引擎的组件。 这些组件，名称中包含`.dapr.`，在Dapr sidecar内执行加密操作，密钥存储在文件、Kubernetes秘密或其他来源中。 虽然 Dapr 知道私钥，但您的应用程序仍无法使用它们。

无论是利用密钥库还是使用 Dapr 中的加密引擎，这两种组件都提供了相同的抽象层。 这样，您的解决方案就可以根据需要在各种保险库和/或加密组件之间进行切换。 例如，您可以在开发过程中使用本地存储的密钥，而在生产过程中使用云保管库。

### 加密应用程序接口

加密 API 允许使用[Dapr 加密方案 v1](https://github.com/dapr/kit/blob/main/schemes/enc/v1/README.md)对数据进行加密和解密。 这是一种有主见的加密方案，旨在使用现代安全加密标准，以数据流的形式高效处理数据（即使是大文件）。

## 试用加密技术

### 快速启动和教程

想测试一下 Dapr 加密 API 吗？ 通过以下快速入门和教程了解密码学的实际应用：

| 快速入门/教程                                                                                                                  | 说明                                    |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| [密码学快速入门]({{< ref cryptography-quickstart.md >}}) | 利用加密 API，使用 RSA 和 AES 密钥加密和解密信息和大型文件。 |

### 开始直接在应用程序中使用加密技术

想跳过快速入门？ Not a problem. 您可以直接在应用程序中试用加密构建模块，对应用程序进行加密和解密。 安装[Dapr]({{< ref "getting-started/_index.md" >}})之后，您可以开始使用加密 API，从[加密操作方法指南]({{< ref howto-cryptography.md >}})开始。

## 例子

请观看 [Dapr Community Call #83](https://youtu.be/PRWYX4lb2Sg?t=1148) 中的密码学 API 演示视频：

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/PRWYX4lb2Sg?start=1148" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 下一步

{{< button text="使用密码学API>>" page="howto-cryptography.md" >}}

## 相关链接

- [密码学概述]({{< ref cryptography-overview\.md >}})
- [支持的加密组件列表]({{< ref supported-cryptography >}})
- [密码学 API 参考文档]({{< ref cryptography_api >}})
