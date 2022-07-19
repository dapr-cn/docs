---
type: docs
title: "安全"
linkTitle: "Security"
weight: 600
description: Dapr 在设计时是如何考虑安全的
---

安全是 Dapr 的基础。 本文介绍在分布式应用程序中使用 Dapr 时的安全功能和能力。 这些可分为：

- 使用服务调用和发布/订阅 APIs 安全通信
- 组件的安全策略，并通过配置应用。
- 操作安全实践。
- 状态安全，专注于静态数据。

一个示例应用程序用于说明 Dapr 中许多可用的安全功能。

# 安全通信
Dapr 具有服务调用 API 的端到端安全性，使用 Dapr 对应用程序进行身份验证和设置端点访问策略的能力。 如下图所示。

<img src="/images/security-end-to-end-communication.png" width=1000>

## 服务调用范围的访问策略
Dapr 应用程序的范围可以限定为命名空间以实现部署和安全性，并且可以在部署到不同命名空间的服务之间进行调用。 请阅读 [跨命名空间的服务调用]({{< ref "service-invocation-namespaces.md" >}}) 以了解更多详细信息。

Dapr 应用程序可以限制哪些操作可以被调用，包括允许（或拒绝）哪些应用程序可以调用它。 请阅读 [操作方法：为服务调用应用访问控制列表配置]({{<ref "invoke-allowlist.md">}}) 以了解更多详细信息。

## Pub/Sub topic 范围的访问策略
对于 Pub/Sub 组件，您可以限制哪些 topic 类型和应用程序可以发布和订阅到特定的topic. 请阅读 [限定 Pub/Sub topic 访问]({{< ref "pubsub-scopes.md" >}}) 了解更多详细信息。

## 使用 mTLS 加密数据
Dapr 用于加密传输中数据的安全机制之一是 [相互认证（mutual authentication）TLS](https://en.wikipedia.org/wiki/Mutual_authentication) 或简写为 mTLS。 mTLS 为应用程序内的网络流量提供了一些关键功能：

- 双向身份验证，客户端向服务器证明其身份，反之亦然
- 建立双向认证后，所有进行中通信都走加密通道

在几乎所有场景中，相互 TLS 都很有用，尤其是对于受法规约束的系统，例如 [HIPAA](https://en.wikipedia.org/wiki/Health_Insurance_Portability_and_Accountability_Act) 和 [ PCI](https://en.wikipedia.org/wiki/Payment_Card_Industry_Data_Security_Standard)。

## 保护 Dapr 到 Dapr 的通信
Dapr 在您的生产系统中无需额外代码或复杂配置即可启用 mTLS。 同样，Dapr sidecar 默认情况下会阻止除 localhost 之外的所有 IP 地址调用它，除非明确列出。

Dapr 包括一个"默认开启"，自动相互 TLS，为 Dapr sidecar之间的流量提供传输加密。 为此，Dapr 利用名为 `Sentry` 的系统服务，该服务充当证书颁发机构(CA)/身份提供者(Identity Provider) 并为来自 Dapr sidecar 的工作负载 (app) 证书请求签名。

默认情况下，工作负荷证书的有效期为 24 小时，时钟偏差设置为 15 分钟。

除非用户提供了现有的根证书，否则，作为 Ca 服务的 Sentry 会自动创建并保留有效期为一年的自签名根证书。 Dapr管理工作负荷的证书轮换，如果你提供了自己的证书，那么在应用中就可以做到零停机。

更换根证书（Kubernetes 模式下的 secret 和自托管模式的文件系统）时，Sentry 会提取它们并重新构建信任链，而无需重新启动，而 Sentry 的停机时间为零。

当新的 Dapr sidecar 初始化时，它首先检查 mTLS 是否启用。 如果是，则生成 ECDSA 私钥和证书签名请求，然后通过 gRPC 接口发送到 Sentry。 Dapr sidecar 和 Sentry 之间的通信使用信任链证书进行身份验证，该证书由 Dapr Sidecar Injector 系统服务注入到每个 Dapr 实例中。

### 配置 mTLS
编辑与 Dapr 一起部署的默认配置中的 `spec.mtls.enabled` 字段，可以关闭/开启双向 TLS。

这既可用于 Kubernetes 模式，也可以用于自托管模式。 有关如何做到这一点的详细信息，可以在 [在这里]({{< ref mtls.md >}}) 找到。

#### 自托管模式下的 mTLS
下图显示了 Sentry 系统服务如何根据运维人员提供或由 Sentry 服务生成的根证书/颁发者证书（这些证书存储在文件中）为应用程序颁发证书。

<img src="/images/security-mTLS-sentry-selfhosted.png" width=1000>

#### kubernetes 模式下的 mTLS
在 Kubernetes 集群中，保存根证书的密钥的作用域是部署 Dapr 组件的命名空间，并且只能由 Dapr 控制平面系统 pod 访问。

在 Kubernetes 上部署时，Dapr 还支持强标识，它依赖于Pod 的 Service Account 令牌，而这个令牌会作为证书签名请求 （CSR） 的一部分发送到 Sentry。

下图显示了 Sentry 系统服务如何根据运维人员提供的，或者由 Sentry 服务生成（存储为 Kubernetes sucret ）的根证书/颁发者证书为应用程序颁发证书。

<img src="/images/security-mTLS-sentry-kubernetes.png" width=1000>

### 在 Dapr 上阻止 IP 地址
为了防止在任何 IP 地址上调用 Dapr sidecar，尤其是在 Kubernetes 等生产环境中，Dapr 将其监听 IP 地址限制为仅本地主机。 在 v1.4 版本之前，默认情况下，任何 Dapr sidecar 都可以调用集群中的任何其他 sidecar。 这不再可能，需要显式启用。 如果您需要启用其他地址，请使用 [dapr-listen-addresses](https://docs.dapr.io/reference/arguments-annotations-overview/) 设置。

## 保护 Dapr 到应用程序的通信
Dapr sidecar 通过 **localhost** 运行在应用程序附近，建议在与应用程序相同的网络边界下运行。 尽管当今许多云原生系统将 pod 级别（例如在 Kubernetes 上）视为受信任的安全边界，但 Dapr 为应用程序提供了使用令牌的 API 级别身份验证。 此功能保证即使在 localhost 上，也只有经过身份验证的应用程序可以调用 Dapr，同样，在 Dapr 回调时应用程序也可以检查。 有关配置 API 令牌安全性的更多详细信息，请阅读，

- [使用 API 令牌来验证从应用程序到 Dapr 的请求]({{< ref api-token.md >}})。
- [使用 API 令牌来验证从 Dapr 到应用程序的请求。]({{< ref app-api-token.md >}})

## 保护 Dapr 到控制平面的通信

除了 Dapr Sidecar 之间的自动 mTLS 之外，Dapr 还提供 Dapr sidecar 和 Dapr 控制平面系统服务之间的强制性 mTLS，即 Sentry 服务（证书颁发机构）、 Placement 服务（Actor安置）和 Kubernetes Operator。

启用 mTLS 时， Sentry 将根证书和颁发者证书写入 Kubernetes secret，该密钥的作用域限定为部署控制平面的名称空间。 在自托管模式下，Sentry 将证书写入可配置的文件系统路径下。

在 Kubernetes 中，当 Dapr 系统服务启动时，它们会自动装载包含根证书和颁发证书的 secret，并使用这些 secret 来加固 Dapr sidecar 使用的 gRPC 服务器。

在自托管模式下，每个系统服务都可以装载文件系统路径以获取证书。

当 Dapr sidecar 初始化时，它使用挂载的叶证书和颁发者私钥对系统 pod 进行身份验证。 这些作为环境变量挂载在 sidecar 容器上。

### Kubernetes 中系统服务的 mTLS
下图显示了 Dapr Sidecar 与 Dapr Sentry（证书颁发机构）、Placement（Actor placement）和 Kubernetes Operator 系统服务之间的安全通信

<img src="/images/security-mTLS-dapr-system-services.png" width=1000>
</br>


# 操作安全性
Dapr 为运维人员管理 mTLS 证书和执行 OAuth 策略而设计。

## mTLS 证书部署和轮换
Dapr 允许运维和开发人员引入自己的证书，或者让 Dapr 自动创建和保留自签名的根证书和颁发者证书。 请阅读 [设置 & 配置 mTLS 证书]({{<ref "mtls.md">}}) 了解更多详细信息。

## 使用 OAuth 的中间件端点授权
Dapr OAuth 2.0 中间件允许你在 Dapr 端点为你的 APIs 启用 OAuth 身份验证。 请阅读 [使用 OAuth 配置端点授权]({{<ref "oauth.md">}}) 以了解详细信息。 Dapr 还有其他可用于 OpenID Connect 和 OPA 策略的中间件组件，您可以 [阅读关于]({{<ref "supported-middleware.md">}}) 了解更多详细信息。

## 网络安全
您可以采用常见的网络安全技术，如网络安全组 （NSG）、隔离区（DMZ） 和防火墙，以便为您的网络资源提供层层保护。 例如，除非配置为与外部绑定目标通讯，否则 Dapr sidecar 不会打开到 Internet 的连接。 而大多数绑定实现仅使用出站连接。 您可以设计防火墙规则，只允许通过指定的端口进行出站连接。

# 安全策略
Dapr 具有一组广泛的安全策略，这些策略可以应用于您的应用程序，以通过 sidecar 配置中的策略设置或组件规范来限定它们能够执行的操作的范围。

## API 访问策略
在某些情况下，如零信任网络或当通过前端将 Dapr sidecar 暴露在外部流量中时，建议仅启用应用正在使用的 Dapr sidecar API。 这样做可减少攻击面，并有助于将 Dapr API 范围控制在应用程序的实际需求范围内。 您可以通过在配置中设置 API 允许列表来控制应用程序可以访问哪些 API，如下图所示。

<img src="/images/security-dapr-API-scoping.png" width=1000>

请阅读 [操作方法：在 Dapr sidecar 上选择性地启用 Dapr API ]({{<ref "api-allowlist.md">}}) 以了解更多详细信息。

## 秘密范围访问策略
要限制 Dapr 应用程序访问密钥的话， 您可以通过向应用程序配置添加密钥作用域政策并限制权限来定义密钥作用域。 请阅读 [操作方法：使用秘密范围]({{<ref "secret-scope.md">}}) 了解更多详细信息。

## 组件应用程序范围访问策略和秘密使用
Dapr 组件是受限于命名空间的。 这意味着 Dapr sidecar 的实例只能访问部署到同一命名空间的组件。 请阅读 [操作方法：使用命名空间将组件范围限定到一个或多个应用程序]({{<ref "component-scopes.md">}}) 以了解更多详细信息。

Dapr 允许您指定哪些应用程序可以使用特定组件并拒绝其他组件，从而为组件提供应用程序级别的范围。 请阅读 [限制应用程序访问组件的范围]({{<ref "component-scopes.md#application-access-to-components-with-scopes">}}) 以获取更多详细信息。

Dapr 组件可以使用 Dapr 的内置秘密管理功能来管理秘密。 阅读 [密钥存储概述]({{<ref "secrets-overview.md">}}) 和 [操作方法：在组件中引用秘密]({{<ref "component-secrets.md">}}) 以了解更多详细信息。

## 绑定安全性
具有绑定目标的身份验证由绑定的配置文件配置。 通常，应配置所需的最低访问权限。 例如，如果仅从绑定目标读取，则应配置绑定以使用具有只读访问权限的帐户。

# 状态安全性

## 静态状态存储加密
默认情况下，Dapr 不会转换应用程序的状态数据。 这意味着 Dapr 不会尝试加密/解密状态数据，并且您的应用程序可以采用您选择的加密/解密方法，其中状态数据对 Dapr 保持不透明。 Dapr 组件可以使用配置的身份验证方法与底层状态存储进行身份验证。 许多状态存储实现都使用官方客户端库，这些客户端库通常使用安全通信通道和服务器通讯。

然而，应用程序状态通常需要进行静态加密，以在企业工作负载或受监管的环境中提供更强的安全性，而 Dapr 确实提供了基于 AES256 的自动客户端状态加密。 阅读 [操作方法：加密应用程序状态]({{< ref howto-encrypt-state.md >}}) 了解更多详细信息。

## Dapr Runtime 状态
重要的是，Dapr 运行时不存储任何静态数据，这意味着 Dapr 运行时不依赖于任何状态存储的操作，并且可以被认为是无状态的。

# 在示例应用程序中使用安全功能
下图显示了将许多安全功能整合到托管在 Kubernetes 上的示例应用程序中。 您可以看到 Dapr 控制平面、Redis 状态存储和每个服务都已部署到各自的命名空间中。 此外，在 Kubernetes 上部署时，您可以使用常规 Kubernetes RBAC 来控制对管理活动的访问。

在应用程序中，请求由入口反向代理接收，它旁边运行着一个 Dapr sidecar。 从反向代理，Dapr 使用服务调用调用服务 A，然后服务 A 将消息发布到服务 B。服务 B 检索秘密，以便从 Redis 状态存储中读取和保存状态。

<img src="/images/security-overview-capabilities-example.png" width=1000>

让我们回顾一下每个安全功能，并描述它们如何保护此应用程序。

1. API 令牌身份验证用于确保反向代理知道它正在与正确的 Dapr sidecar 实例通信。 这可以防止它将消息转发到除此 Dapr 边车之外的任何东西。
2. 服务调用 mTLS 用于反向代理和服务 A 之间的身份验证，此外，服务 A 上配置的服务访问策略将其限制为仅接收来自反向代理的特定端点上的调用，而不接收其他服务。
3. 服务 B 使用发布/订阅主题安全策略来指示它只能接收从服务 A 发布的消息。
4. Redis 组件定义使用组件范围安全策略来说明只允许服务 B 调用它。
5. 服务 B 将 Dapr sidecar 限制为仅使用发布/订阅、状态管理和秘密 API。 所有其他 API 调用，例如服务调用，都会失败。
6. 配置中设置的秘密安全策略限制了服务 B 能访问的秘密，在这种情况下，它只能读取连接到 Redis 状态存储组件所需的秘密，而不能读取其他秘密。
7. 服务 B 被部署到命名空间“B”，这进一步将其与其他服务隔离，这意味着即使在其上启用了服务调用 API，也不会因为作为服务 A 在空间命名空间中而意外调用它。此外，服务 B 必须明确在其组件 YAML 文件中设置 Redis Host 命名空间以调用“Redis”命名空间，否则此调用也会失败。
8. Redis 状态存储中的数据是静态加密的，只能使用正确配置的 Dapr Redis 状态存储组件读取。

# 威胁模型
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

测试期间修复了两个问题，一个是关键问题，一个是高优先级问题。 截至2021年2月16日，Dapr 有0个严重问题，0个高风险，0个中度风险，2个低风险，2个信息级别问题。

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

## 相关链接
 - [操作安全性]({{< ref "security.md" >}})