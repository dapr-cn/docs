---
type: docs
title: "安全性"
linkTitle: "安全性"
weight: 600
description: Dapr在设计中如何考虑安全性
---

安全性是Dapr的核心。本文介绍了在分布式应用中使用Dapr时的安全特性和功能。这些可以分为以下几类：

- 使用service-invocation和pubsub API进行安全通信。
- 通过配置应用于组件的安全策略。
- 操作安全实践。
- 状态安全，专注于静态数据。

一个示例应用程序用于说明Dapr中可用的多种安全特性。

# 安全通信

Dapr通过service-invocation API提供端到端的安全性，支持应用程序身份验证并设置访问策略。下图展示了这一点。

<img src="/images/security-end-to-end-communication.png" width=1000>

## service-invocation范围访问策略

Dapr应用程序可以被限定在命名空间中进行部署和安全管理。您可以在不同命名空间的服务之间进行调用。阅读[跨命名空间的service-invocation]({{< ref "service-invocation-namespaces.md" >}})以获取更多信息。

Dapr应用程序可以限制哪些操作可以被调用，包括哪些应用程序被允许（或拒绝）调用它。阅读[如何：为service-invocation应用访问控制列表配置]({{< ref invoke-allowlist.md >}})以获取更多信息。

## pubsub主题范围访问策略

对于pubsub组件，您可以限制哪些主题类型和应用程序被允许发布和订阅特定主题。阅读[范围pubsub主题访问]({{< ref "pubsub-scopes.md" >}})以获取更多信息。

## 使用mTLS加密数据

Dapr使用的一种加密传输中数据的安全机制是[双向认证TLS](https://en.wikipedia.org/wiki/Mutual_authentication)或mTLS。mTLS为应用程序内部的网络流量提供了一些关键特性：

- **双向认证**，客户端和服务器相互验证身份。
- **加密通道**，用于所有在途通信，在建立双向认证后。

mTLS在几乎所有场景中都很有用，尤其是对于需要遵循法规的系统，如[HIPAA](https://en.wikipedia.org/wiki/Health_Insurance_Portability_and_Accountability_Act)和[PCI](https://en.wikipedia.org/wiki/Payment_Card_Industry_Data_Security_Standard)。

## Dapr之间的安全通信

在生产系统中，Dapr无需额外代码或复杂配置即可启用mTLS。此外，Dapr sidecar默认只允许`localhost`访问，阻止其他IP地址，除非明确配置。

Dapr包含一个“默认开启”的自动mTLS，为Dapr sidecar之间的流量提供在途加密。为实现这一点，Dapr利用一个名为`Sentry`的系统服务，该服务充当证书颁发机构（CA）/身份提供者，并签署来自Dapr sidecar的工作负载（应用程序）证书请求。

默认情况下，工作负载证书有效期为24小时，时钟偏差设置为15分钟。

除非您提供了现有的根证书，否则Sentry服务会自动创建并持久化有效期为一年的自签名根证书。Dapr管理工作负载证书的轮换；如果您自带证书，Dapr会在不影响应用程序正常运行的情况下进行。

当根证书被替换时（Kubernetes模式下为secret，自托管模式下为文件系统），Sentry会获取它们并重建信任链，无需重启且对Sentry无停机时间。

当一个新的Dapr sidecar初始化时，它会检查是否启用了mTLS。如果是，则生成一个ECDSA私钥和证书签名请求，并通过gRPC接口发送给Sentry。Dapr sidecar和Sentry之间的通信使用信任链证书进行认证，该证书由Dapr Sidecar Injector系统服务注入到每个Dapr实例中。

### 配置mTLS

可以通过编辑Dapr部署的默认配置中的`spec.mtls.enabled`字段来开启/关闭mTLS。

[您可以在Kubernetes和自托管模式下进行此操作]({{< ref mtls.md >}})。

#### 自托管模式下的mTLS

下图显示了Sentry系统服务如何根据操作员提供的或由Sentry服务生成并存储在文件中的根/颁发者证书为应用程序颁发证书。

<img src="/images/security-mTLS-sentry-selfhosted.png" width=1000>

#### Kubernetes模式下的mTLS

在Kubernetes集群中，保存根证书的secret是：

- 限定在部署Dapr组件的命名空间中。
- 仅由Dapr控制平面系统pod访问。

Dapr在Kubernetes上部署时还支持强身份验证，依赖于作为证书签名请求（CSR）一部分发送给Sentry的pod的服务账户令牌。

下图显示了Sentry系统服务如何根据操作员提供的或由Sentry服务生成并存储为Kubernetes secret的根/颁发者证书为应用程序颁发证书。

<img src="/images/security-mTLS-sentry-kubernetes.png" width=1000>

### 防止Dapr被IP地址访问

为了防止Dapr sidecar在任何IP地址上被调用（尤其是在Kubernetes等生产环境中），Dapr将其监听IP地址限制为`localhost`。如果您需要启用外部地址的访问，请使用[dapr-listen-addresses]({{<ref arguments-annotations-overview>}})设置。

## 安全的Dapr到应用程序通信

Dapr sidecar通过`localhost`运行在应用程序附近，建议在与应用程序相同的网络边界内运行。虽然许多现代云原生系统将pod级别（例如在Kubernetes上）视为可信的安全边界，但Dapr通过令牌为应用程序提供API级别的身份验证。此功能保证，即使在`localhost`上：

- 只有经过身份验证的应用程序可以调用Dapr
- 应用程序可以检查Dapr是否在回调它

有关配置API令牌安全性的更多详细信息，请阅读：

- [使用API令牌对来自应用程序到Dapr的请求进行身份验证]({{< ref api-token.md >}})。
- [使用API令牌对来自Dapr到应用程序的请求进行身份验证]({{< ref app-api-token.md >}})

## 安全的Dapr到控制平面通信

除了Dapr sidecar之间的自动mTLS，Dapr还提供以下之间的强制mTLS：

- Dapr sidecar
- Dapr控制平面系统服务，即：
  - Sentry服务（证书颁发机构）
  - Placement服务（actor放置）
  - Kubernetes Operator服务

当启用mTLS时，Sentry将根和颁发者证书写入限定在安装控制平面的命名空间的Kubernetes secret中。在自托管模式下，Sentry将证书写入可配置的文件系统路径。

在Kubernetes中，当Dapr系统服务启动时，它们会自动挂载并使用包含根和颁发者证书的secret来保护Dapr sidecar使用的gRPC服务器。在自托管模式下，每个系统服务可以挂载到文件系统路径以获取凭据。

当Dapr sidecar初始化时，它使用挂载的叶证书和颁发者私钥对系统pod进行身份验证。这些作为环境变量挂载在sidecar容器上。

### Kubernetes中到系统服务的mTLS

下图显示了Dapr sidecar与Dapr Sentry（证书颁发机构）、Placement（actor放置）和Kubernetes Operator系统服务之间的安全通信。

<img src="/images/security-mTLS-dapr-system-services.png" width=1000>
</br>

# 操作安全

Dapr设计用于让操作员管理mTLS证书并强制执行OAuth策略。

## mTLS证书部署和轮换

虽然操作员和开发人员可以将自己的证书引入Dapr，但Dapr会自动创建并持久化自签名的根和颁发者证书。阅读[设置和配置mTLS证书]({{< ref mtls.md >}})以获取更多信息。

## 使用OAuth进行中间件端点授权

使用Dapr OAuth 2.0中间件，您可以在Dapr端点上为您的API启用OAuth授权。阅读[使用OAuth配置端点授权]({{< ref oauth.md >}})以获取详细信息。Dapr还有其他中间件组件，您可以用于OpenID Connect和OPA策略。有关更多详细信息，请[阅读支持的中间件]({{< ref supported-middleware.md >}})。

## 网络安全

您可以采用常见的网络安全技术，如网络安全组（NSG）、非军事区（DMZ）和防火墙，为您的网络资源提供多层保护。例如，除非配置为与外部绑定目标通信，否则Dapr sidecar不会打开到互联网的连接，并且大多数绑定实现仅使用出站连接。您可以设计防火墙规则，仅通过指定端口允许出站连接。

# 安全策略

Dapr有一套广泛的安全策略，您可以应用于您的应用程序。您可以通过sidecar配置中的策略设置或组件规范来限定它们能够做什么。

## API访问策略

在某些场景中，例如在零信任网络中或通过前端将Dapr sidecar暴露给外部流量时，建议仅启用应用程序当前使用的Dapr sidecar API。这减少了攻击面，并将Dapr API限定在应用程序的实际需求范围内。您可以通过在配置中设置API允许列表来控制哪些API对应用程序可访问，如下图所示。

<img src="/images/security-dapr-API-scoping.png" width=1000>

阅读[如何：选择性启用Dapr sidecar上的Dapr API]({{< ref api-allowlist.md >}})以获取更多信息。

## secret范围访问策略

为了限制Dapr应用程序对secret的访问，您可以定义secret范围。在应用程序配置中添加一个secret范围策略，具有限制性权限。阅读[如何：使用secret范围]({{< ref secret-scope.md >}})以获取更多信息。

## 组件应用程序范围访问策略和secret使用

Dapr组件可以被命名空间化。这意味着一个Dapr sidecar实例只能访问部署到相同命名空间的组件。阅读[如何：使用命名空间将组件限定到一个或多个应用程序]({{< ref component-scopes.md >}})以获取更多信息。

Dapr通过允许您指定哪些应用程序可以使用特定组件并拒绝其他应用程序来提供组件的应用程序级别范围。阅读[使用范围限制应用程序对组件的访问]({{< ref "component-scopes.md#application-access-to-components-with-scopes" >}})以获取更多信息。

Dapr组件可以使用Dapr的内置secret管理功能来管理secret。阅读[secret存储概述]({{< ref secrets-overview.md >}})和[如何：在组件中引用secret]({{< ref component-secrets.md >}})以获取更多信息。

## 绑定安全性

与绑定目标的身份验证由绑定的配置文件配置。通常，您应该配置最低所需的访问权限。例如，如果您只从绑定目标读取，您应该将绑定配置为使用具有只读访问权限的帐户。

# 状态安全

## 状态存储静态加密

默认情况下，Dapr不会转换来自应用程序的状态数据。这意味着：

- Dapr不会尝试加密/解密状态数据
- 您的应用程序可以采用您选择的加密/解密方法，其中状态数据对Dapr保持不透明。

Dapr组件可以使用配置的身份验证方法与底层状态存储进行身份验证。许多状态存储实现使用官方客户端库，这些库通常使用与服务器的安全通信通道。

然而，应用程序状态通常需要在静态时加密，以在企业工作负载或受监管环境中提供更强的安全性。Dapr提供基于AES256的自动客户端状态加密。阅读[如何：加密应用程序状态]({{< ref howto-encrypt-state.md >}})以获取更多信息。

## Dapr运行时状态

Dapr运行时不存储任何静态数据，这意味着Dapr运行时对其操作没有任何状态存储的依赖，可以被视为无状态。

# 在示例应用程序中使用安全功能

下图显示了在Kubernetes上托管的示例应用程序中放置的许多安全功能。在示例中，Dapr控制平面、Redis状态存储和每个服务都被部署到它们自己的命名空间中。在Kubernetes上部署时，您可以使用常规的Kubernetes RBAC来控制管理活动的访问。

在应用程序中，请求由运行在其旁边的Dapr sidecar的入口反向代理接收。从反向代理开始，Dapr使用service-invocation调用服务A，然后将消息发布到服务B。服务B检索一个secret以读取和保存到Redis状态存储。

<img src="/images/security-overview-capabilities-example.png" width=1000>

让我们逐一介绍每个安全功能，并描述它们如何保护此应用程序。

1. API令牌身份验证确保反向代理知道它正在与正确的Dapr sidecar实例通信。这可以防止将消息转发到除此Dapr sidecar之外的任何地方。
2. service-invocation mTLS用于反向代理和服务A之间的身份验证。服务A上配置的服务访问策略限制其仅接收来自反向代理的特定端点的调用，而不是其他服务。
3. 服务B使用pubsub主题安全策略来指示它只能接收从服务A发布的消息。
4. Redis组件定义使用组件范围安全策略来表示只有服务B被允许调用它。
5. 服务B限制Dapr sidecar仅使用pubsub、状态管理和secret API。所有其他API调用（例如，service-invocation）将失败。
6. 在配置中设置的secret安全策略限制了服务B可以访问的secret。在这种情况下，服务B只能读取连接到Redis状态存储组件所需的secret，而不能读取其他secret。
7. 服务B被部署到命名空间“B”，这进一步将其与其他服务隔离。即使在其上启用了service-invocation API，也不能因为与服务A在同一命名空间中而被意外调用。服务B必须在其组件YAML文件中显式设置Redis主机命名空间以调用“Redis”命名空间，否则此调用也会失败。
8. Redis状态存储中的数据在静态时被加密，并且只能使用正确配置的Dapr Redis状态存储组件读取。

# 威胁模型

威胁建模是一个过程，通过该过程：

- 可以识别和列举潜在威胁，如结构性漏洞或缺乏适当的保护措施。
- 可以优先考虑缓解措施。

Dapr的威胁模型如下。

<img src="/images/security-threat-model.png" alt="Dapr威胁模型" width=1000>

## 安全审计

### 2023年9月

2023年9月，Dapr完成了由Ada Logics进行的安全审计。

审计是一次全面的安全审计，目标如下：

- 形式化Dapr的威胁模型
- 执行手动代码审查
- 根据形式化的威胁模型评估Dapr的模糊测试套件
- 进行Dapr的SLSA审查。

您可以在[这里](/docs/Dapr-september-2023-security-audit-report.pdf)找到完整报告。

审计发现了7个问题，其中没有一个是高或关键严重性。一个CVE是由于Dapr组件贡献中的第三方依赖问题而分配的。

### 2023年6月

2023年6月，Dapr完成了由Ada Logics进行的模糊测试审计。

审计实现了以下目标：

- OSS-Fuzz集成
- 为Dapr创建了39个新的模糊测试器
- Dapr运行时、Kit和组件贡献的模糊测试覆盖
- 所有模糊测试器在审计完成后持续运行

您可以在[这里](/docs/Dapr-june-2023-fuzzing-audit-report.pdf)找到完整报告。

审计期间发现了3个问题。

### 2021年2月

2021年2月，Dapr进行了由Cure53针对其1.0版本的第二次安全审计。

测试重点如下：

- 自上次审计以来的Dapr运行时代码库评估
- 访问控制列表
- secret管理
- 渗透测试
- 验证先前高/中问题的修复

您可以在[这里](/docs/Dapr-february-2021-security-audit-report.pdf)找到完整报告。

在测试期间检测到并修复了一个高问题。

截至2021年2月16日，Dapr有0个关键问题，0个高问题，0个中问题，2个低问题，2个信息问题。

### 2020年6月

2020年6月，Dapr接受了来自Cure53的安全审计，这是一家CNCF批准的网络安全公司。

测试重点如下：

- Dapr运行时代码库评估
- Dapr组件代码库评估
- Dapr CLI代码库评估
- 权限提升
- 流量欺骗
- secret管理
- RBAC
- 验证基本假设：mTLS、范围、API身份验证
- 编排加固（Kubernetes）
- DoS攻击
- 渗透测试

完整报告可以在[这里](/docs/Dapr-july-2020-security-audit-report.pdf)找到。

## 报告安全问题

访问[此页面]({{< ref support-security-issues.md >}})向Dapr维护者报告安全问题。

## 相关链接

[操作安全]({{< ref "security.md" >}})
`