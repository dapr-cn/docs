---
type: docs
title: "组件"
linkTitle: "组件"
weight: 300
description: "由构建块和应用程序使用的模块化功能"
---

Dapr 采用模块化设计，功能以组件形式提供。每个组件都有一个接口定义。所有组件都是可互换的，因此您可以用具有相同接口的另一个组件替换掉一个组件。

您可以通过以下方式贡献实现并扩展 Dapr 的组件接口功能：

- [components-contrib 仓库](https://github.com/dapr/components-contrib)
- [可插拔组件]({{< ref "components-concept.md#built-in-and-pluggable-components" >}})。

一个构建块可以使用任意组合的组件。例如，[actors]({{< ref "actors-overview.md" >}}) 和 [state management]({{< ref "state-management-overview.md" >}}) 构建块都使用 [state 组件](https://github.com/dapr/components-contrib/tree/master/state)。

另一个例子是，[pub/sub]({{< ref "pubsub-overview.md" >}}) 构建块使用 [pub/sub 组件](https://github.com/dapr/components-contrib/tree/master/pubsub)。

您可以使用 `dapr components` CLI 命令获取当前在托管环境中可用的组件列表。

{{% alert title="注意" color="primary" %}} 
对于任何向应用程序返回数据的组件，建议相应地设置 Dapr sidecar 的内存容量（进程或容器）以避免潜在的内存不足崩溃。例如，在 Docker 中使用 `--memory` 选项。在 Kubernetes 中，使用 `dapr.io/sidecar-memory-limit` 注释。对于进程，这取决于操作系统和/或进程编排工具。
{{% /alert %}}

## 组件规范

每个组件都有一个规范（或称为 spec）。组件在设计时通过一个 YAML 文件进行配置，该文件存储在以下位置之一：

- 您解决方案中的 `components/local` 文件夹，或
- 在调用 `dapr init` 时创建的 `.dapr` 文件夹中全局存储。

这些 YAML 文件遵循通用的 [Dapr 组件架构]({{< ref "component-schema.md" >}})，但每个文件都特定于组件规范。

重要的是要理解组件规范值，特别是规范 `metadata`，在相同组件类型的不同组件之间可能会有所不同，例如在不同的 state 存储之间，并且某些设计时规范值可以在运行时通过向组件的 API 发出请求来覆盖。因此，强烈建议查看 [组件的规范]({{< ref "components-reference" >}})，特别注意用于设置与组件交互的元数据的请求示例负载。

下图显示了每种组件类型的一些组件示例
<img src="/images/concepts-components.png" width=1200>

## 内置和可插拔组件

Dapr 具有作为运行时一部分包含的内置组件。这些是由社区开发和捐赠的公共组件，并在每个版本中可用。

Dapr 还允许用户创建自己的私有组件，称为可插拔组件。这些组件是自托管的（进程或容器），不需要用 Go 编写，存在于 Dapr 运行时之外，并能够“插入”到 Dapr 中以利用构建块 API。

在可能的情况下，鼓励将内置组件捐赠给 Dapr 项目和社区。

然而，可插拔组件在您希望创建不包含在 Dapr 项目中的私有组件的场景中是理想的。
例如：
- 您的组件可能特定于您的公司或存在知识产权问题，因此无法包含在 Dapr 组件仓库中。
- 您希望将组件更新与 Dapr 发布周期解耦。

有关更多信息，请阅读 [可插拔组件概述]({{< ref "pluggable-components-overview" >}})

## 热重载

启用 [`HotReload` 功能]({{< ref "support-preview-features.md" >}})后，组件可以在运行时“热重载”。
这意味着您可以在不重启 Dapr 运行时的情况下更新组件配置。
当在 Kubernetes API 中创建、更新或删除组件资源时，或者在自托管模式下更改 `resources` 目录中的文件时，会发生组件重载。
当组件更新时，组件首先关闭，然后使用新配置重新初始化。
在重载和重新初始化期间，组件在短时间内不可用。

## 可用组件类型

以下是 Dapr 提供的组件类型：

### 名称解析

名称解析组件与 [service-invocation]({{< ref "service-invocation-overview.md" >}}) 构建块一起使用，以与托管环境集成并提供服务到服务的发现。例如，Kubernetes 名称解析组件与 Kubernetes DNS 服务集成，自托管使用 mDNS，VM 集群可以使用 Consul 名称解析组件。

- [名称解析组件列表]({{< ref supported-name-resolution >}})
- [名称解析实现](https://github.com/dapr/components-contrib/tree/master/nameresolution)

### Pub/sub 代理

Pub/sub 代理组件是消息代理，可以作为 [发布和订阅]({{< ref pubsub-overview.md >}}) 构建块的一部分传递消息到/从服务。

- [Pub/sub 代理列表]({{< ref supported-pubsub >}})
- [Pub/sub 代理实现](https://github.com/dapr/components-contrib/tree/master/pubsub)

### 工作流

[工作流]({{< ref workflow-overview.md >}}) 是定义可靠业务流程或数据流的自定义应用程序逻辑。工作流组件是运行该工作流的业务逻辑并将其状态存储到 state 存储中的工作流运行时（或引擎）。

<!--- [支持的工作流列表]()
- [工作流实现](https://github.com/dapr/components-contrib/tree/master/workflows)-->

### 状态存储

状态存储组件是数据存储（数据库、文件、内存），作为 [state management]({{< ref "state-management-overview.md" >}}) 构建块的一部分存储键值对。

- [状态存储列表]({{< ref supported-state-stores >}})
- [状态存储实现](https://github.com/dapr/components-contrib/tree/master/state)

### 绑定

外部资源可以连接到 Dapr，以便触发应用程序上的方法或作为 [bindings]({{< ref bindings-overview.md >}}) 构建块的一部分从应用程序调用。

- [支持的绑定列表]({{< ref supported-bindings >}})
- [绑定实现](https://github.com/dapr/components-contrib/tree/master/bindings)

### 秘密存储

[秘密]({{< ref "secrets-overview.md" >}}) 是您希望防止未经授权访问的任何私密信息。秘密存储用于存储可以在应用程序中检索和使用的秘密。

- [支持的秘密存储列表]({{< ref supported-secret-stores >}})
- [秘密存储实现](https://github.com/dapr/components-contrib/tree/master/secretstores)

### 配置存储

配置存储用于保存应用程序数据，应用程序实例可以在启动时读取这些数据或在发生更改时收到通知。这允许动态配置。

- [支持的配置存储列表]({{< ref supported-configuration-stores >}})
- [配置存储实现](https://github.com/dapr/components-contrib/tree/master/configuration)

### 锁

锁组件用作分布式锁，以提供对资源（如队列或数据库）的互斥访问。

- [支持的锁列表]({{< ref supported-locks >}})
- [锁实现](https://github.com/dapr/components-contrib/tree/master/lock)

### 加密

[加密]({{< ref cryptography-overview.md >}}) 组件用于执行加密操作，包括加密和解密消息，而不将密钥暴露给您的应用程序。

- [支持的加密组件列表]({{< ref supported-cryptography >}})
- [加密实现](https://github.com/dapr/components-contrib/tree/master/crypto) 

### 对话

Dapr 为开发人员提供了一种抽象与大型语言模型（LLMs）交互的方法，具有内置的安全性和可靠性功能。使用 [conversation]({{< ref conversation-overview.md >}}) 组件将提示发送到不同的 LLMs，以及对话上下文。

- [支持的对话组件列表]({{< ref supported-conversation >}})
- [对话实现](https://github.com/dapr/components-contrib/tree/main/conversation)

### 中间件

Dapr 允许自定义 [中间件]({{< ref "middleware.md" >}}) 插入到 HTTP 请求处理管道中。中间件可以在 HTTP 请求被路由到用户代码之前或响应返回给客户端之前对其执行额外的操作（如身份验证、加密和消息转换）。中间件组件与 [service-invocation]({{< ref "service-invocation-overview.md" >}}) 构建块一起使用。

- [支持的中间件组件列表]({{< ref supported-middleware >}})
- [中间件实现](https://github.com/dapr/components-contrib/tree/master/middleware)

{{% alert title="注意" color="primary" %}} 
由于可插拔组件不需要用 Go 编写，因此它们遵循与内置 Dapr 组件不同的实现过程。有关开发内置组件的更多信息，请阅读 [开发新组件](https://github.com/dapr/components-contrib/blob/master/docs/developing-component.md)。
{{% /alert %}}