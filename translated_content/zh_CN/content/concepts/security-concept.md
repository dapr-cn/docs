---
type: docs
title: "安全"
linkTitle: "Security"
weight: 600
description: >
  Dapr在设计时是如何考虑安全的
---

本文介绍在分布式应用程序中使用 Dapr 时涉及的多个安全注意事项，包括：

上述几个领域是通过对传输中的数据进行加密解决的。 Dapr 用于加密传输中数据的安全机制之一是 [相互认证（mutual authentication）TLS](https://en.wikipedia.org/wiki/Mutual_authentication) 或简写为 mTLS。 mTLS 为应用程序内的网络流量提供了一些关键功能：

- 双向身份验证 - 客户端向服务器证明其身份，反之亦然
- 建立双向认证后，所有进行中通信都走加密通道

在几乎所有场景中，相互 TLS 都很有用，尤其是对于受法规约束的系统，例如 [HIPAA](https://en.wikipedia.org/wiki/Health_Insurance_Portability_and_Accountability_Act) 和 [ PCI](https://en.wikipedia.org/wiki/Payment_Card_Industry_Data_Security_Standard)。

Dapr 支持 mTLS 和本文档中描述的应用程序中的所有功能，在生产系统中几乎不需要额外的代码或复杂配置。

## Sidecar与应用程序之间的通信

Dapr sidecar通过 **localhost** 运行在应用程序附近，建议在与应用程序相同的网络边界下运行。 尽管如今许多云原生系统将 Pod 级别（例如 Kubernetes 上）视为可信任的安全边界，但 Dapr 还是可以为用户提供使用令牌的 API 级别身份验证。 此功能保证即使在 localhost 上，也只有经过身份验证的调用方才能调用 Dapr。

## Sidecar之间的通信

Dapr 包括一个"默认开启"，自动相互 TLS，为 Dapr sidecar之间的流量提供传输加密。 为此，Dapr 利用名为 `Sentry` 的系统服务，该服务充当证书颁发机构 （Certificate Authority/CA），并为来自 Dapr sidecar的工作负载 （app） 签署证书请求。

Dapr 还管理工作负载证书轮换，并且这样做时应用程序不会停机。

除非用户提供了现有的根证书，否则，作为 CA 服务的 Sentry 会自动创建并持有自签名根证书，有效期为一年。

更换根证书（Kubernetes 模式下的 secret 和自托管模式的文件系统）时，Sentry 会提取它们并重新构建信任链，而无需重新启动，而 Sentry 的停机时间为零。

当新的 Dapr sidecar 初始化时，它首先检查 mTLS 是否启用。 如果是，则生成 ECDSA 私钥和证书签名请求，然后通过 gRPC 接口发送到 Sentry。 Dapr sidecar 和 Sentry 之间的通信使用信任链证书进行身份验证，该证书由 Dapr Sidecar Injector 系统服务注入到每个 Dapr 实例中。

在 Kubernetes 集群中，保存根证书的密钥的范围是 Dapr 组件部署所在的命名空间，并且只有 Dapr 系统 pod才能访问。

在 Kubernetes 上部署时，Dapr 还支持强标识，它依赖于Pod 的 Service Account 令牌，而这个令牌会作为证书签名请求 （CSR） 的一部分发送到 Sentry。

默认情况下，工作负荷证书的有效期为 24 小时，时钟偏差设置为 15 分钟。

编辑与 Dapr 一起部署的默认配置中的 `spec.mtls.enabled` 字段，可以关闭/开启相互TLS。 这既可用于 Kubernetes 模式，也可以用于自托管模式。 有关如何做到这一点的详细信息，[在这里]({{< ref mtls.md >}})。

### 自托管中的 mTLS
下图显示了 Sentry 系统服务如何根据运维人员提供或由 Sentry 服务生成的根证书/颁发者证书（这些证书存储在文件中）为应用程序颁发证书。

<img src="/images/security-mTLS-sentry-selfhosted.png" width=1000>

### kubernetes 中的 mTLS
下图显示了 Sentry 系统服务如何根据运维人员提供的，或者由 Sentry 服务生成（存储为 Kubernetes sucret ）的根证书/颁发者证书为应用程序颁发证书。

<img src="/images/security-mTLS-sentry-kubernetes.png" width=1000>

## Sidecar与系统服务之间的通信

除了 Dapr Sidecar 之间的自动 mTLS 之外，Dapr 还提供 Dapr sidecar 和 Dapr 系统服务之间的强制性 mTLS，这些系统服务包括 Sentry 服务（证书颁发机构）、 Placement 服务（Actor安置）和 Kubernetes Operator。

启用 mTLS 时， Sentry 将根证书和颁发者证书写入 Kubernetes secret，该密钥的作用域限定为部署控制平面的名称空间。 在自托管模式下，Sentry 将证书写入可配置的文件系统路径下。

在 Kubernetes 中，当 Dapr 系统服务启动时，它们会自动装载包含根证书和颁发证书的 secret，并使用这些secret 来加固 Dapr sidecar 使用的 gRPC 服务器。

在自托管模式下，每个系统服务都可以装载文件系统路径以获取证书。

当 Dapr sidecar 初始化时，它使用挂载的叶证书和颁发者私钥对系统 pod 进行身份验证。 这些作为环境变量挂载在 sidecar 容器上。

### Kubernetes 中系统服务的 mTLS
下图显示了 Dapr Sidecar 与 Dapr Sentry（证书颁发机构）、Placement（Actor 安置）和 Kubernetes Operator 系统服务之间的安全通信

<img src="/images/security-mTLS-dapr-system-services.png" width=1000>

## 组件命名空间的作用域和密钥

Dapr 组件是受限于命名空间的。 这意味着 Dapr runtime sidecar 的实例只能访问部署到同一命名空间的组件。 更多详细信息请参阅 [组件范围文档]({{<ref "component-scopes.md">}})。

Dapr 组件使用 Dapr 的内置密钥管理功能来管理密钥。 有关详细信息，请参阅 [密钥存储概述]({{<ref "secrets-overview.md">}}) 。

此外，Dapr 通过允许用户指定哪些应用程序可以使用给定组件，为组件提供应用程序级的范围限制。有关应用程序级别范围设置，[请参阅]({{<ref "component-scopes.md#application-access-to-components-with-scopes">}})。

## 网络安全

您可以采用常见的网络安全技术，如网络安全组 （NSG）、非军事区 （DMZ） 和防火墙，以便为您的网络资源提供层层保护。

例如，除非配置为与外部绑定目标通讯，否则 Dapr sidecar 不会打开到 Internet 的连接。 而大多数绑定实现仅使用出站连接。 您可以设计防火墙规则，只允许通过指定的端口进行出站连接。

## 绑定安全性

具有绑定目标的身份验证由绑定的配置文件配置。 通常，应配置所需的最低访问权限。 例如，如果仅从绑定目标读取，则应配置绑定以使用具有只读访问权限的帐户。

## 状态存储安全

Dapr 不会转换来自应用程序的状态数据。 这意味着 Dapr 不会尝试加密/解密状态数据。 但是，您的应用程序可以采用您选择的加密/解密方法，而且状态数据对 Dapr 保持不透明。

Dapr 不存储任何数据。

Dapr 使用配置的身份验证方法来与底层状态存储进行身份验证。 许多状态存储实现都使用官方客户端库，这些客户端库通常使用安全通信通道和服务器通讯。

## 管理安全

在 Kubernetes 上部署时，您可以使用 [Kubernetes RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) 控制对管理活动的访问。

在 Azure Kubernetes Service （AKS） 上部署时，可以使用 [Azure Active Directory （AD） 服务主体](https://docs.microsoft.com/en-us/azure/active-directory/develop/app-objects-and-service-principals) 控制对管理活动和资源管理的访问。

## 威胁模型
威胁建模是一个过程，通过该过程可以识别、枚举潜在威胁（如结构漏洞或缺乏适当的安全措施），并确定缓解措施的优先级。 Dapr 威胁模型如下：

<img src="/images/security-threat-model.png" alt="Dapr 威胁模型" width=1000>

## 安全审核

### 2021 年 2 月

2021 年 2 月，Dapr 进行了第二次安全审计，目标是 Cure53 发布的 1.0。 测试的重点是：

* 自上次审计以来的 Dapr 运行时间代码基础评估
* 访问控制列表
* 密钥管理
* 渗透测试
* 流量欺骗

完整的报告可以在找到 [这里](/docs/Dapr-february-2021-security-audit-report.pdf)。

测试期间修复了两个问题，一个是关键问题，一个是高优先级问题。 截至2021年2月16日，Dapr有0个严重问题，0个高风险，0个中度风险，2个低风险，2个信息级别问题。

### 2020年6月

2020 年 6 月，Dapr 接受了 CNCF 核定的网络安全公司 Cure53 的安全审计。 测试的重点是：

* Dapr 运行时代码库评估
* Dapr 组件代码基础评估
* Dapr CLI 代码基础评估
* 权限升级
* 流量欺骗
* 密钥管理
* RBAC
* 验证基本假设：mTLS、作用域、API 身份验证
* 编排强化 ( Kubernetes)
* DoS 攻击
* 渗透测试

完整的报告可以 [在这里](/docs/Dapr-july-2020-security-audit-report.pdf) 找到。

## 报告安全问题

访问 [此页面]({{< ref support-security-issues.md >}}) 向 Dapr 维护者报告安全问题。
