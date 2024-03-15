---
type: docs
title: 组件
linkTitle: 组件
weight: 300
description: 构建模块和应用所使用的模块化功能
---

Dapr采用模块化设计，功能以组件形式交付。 每个组件都有接口定义。 所有组件都是可互换的，因此您可以将组件换成具有相同接口的另一个组件。

您可以通过以下方式贡献实现并扩展 Dapr 的组件接口功能：

- [components-contrib代码库](https://github.com/dapr/components-contrib)
- [可插拔组件]({{< ref "components-concept.md#built-in-and-pluggable-components" >}})。

构建块可以使用组件的任意组合。 例如，[Actors]({{< ref "actors-overview\.md" >}})和[状态管理]({{< ref "state-management-overview\.md" >}})构建块都使用[state components](https://github.com/dapr/components-contrib/tree/master/state)。

作为另一个例子，[发布/订阅]({{< ref "pubsub-overview\.md" >}}) 构建块使用[发布/订阅组件](https://github.com/dapr/components-contrib/tree/master/pubsub)。

您可以使用 `dapr components` CLI 命令查看当前托管环境中可用组件的列表。

{{% alert title="注意" color="primary" %}}
对于将数据返回到应用的任何组件，建议相应地设置 Dapr sidecar 的内存容量（进程或容器），以避免潜在的 OOM 恐慌。 例如，在docker中使用`--memory`选项。 对于 Kubernetes，请使用 `dapr.io/sidecar-memory-limit` 注解。 对于进程，这取决于操作系统和/或进程编排工具。
{{% /alert %}}

## 组件规范

每个组件都有一个符合的规范（或规范）。 组件在设计时使用存储在以下任一位置的 YAML 文件进行配置：

- 解决方案中的 `components/local` 文件夹，或
- 调用 `dapr init` 时创建的全局 `.dapr` 文件夹。

这些 YAML 文件遵循通用的[Dapr组件模式]({{< ref "component-schema.md" >}})，但每个文件都特定于组件规范。

重要的是要理解组件规范值，特别是规范 `metadata`，可以在相同组件类型的组件之间更改，例如在不同的状态存储之间，并且一些设计时规范值可以在运行时被覆盖对组件 API 的请求。 因此，强烈建议查看[组件规范]({{< ref "components-reference" >}})，请特别注意请求的示例有效负载，以设置用于与组件交互的元数据。

下图显示了每种组件类型的一些组件示例 <img src="/images/concepts-components.png" width=1200>

## 内置和可插拔组件

Dapr 具有内置组件，作为运行时的一部分而被包含在内。 这些是由社区开发和捐赠的公共组件，可在每个版本中使用。

Dapr 还允许用户创建自己的私有组件，称为可插拔组件。 这些组件是自托管的（进程或容器），不需要用 Go 编写，存在于 Dapr 运行时之外，并且能够“插入”到 Dapr 中以利用构建块 API。

在可能的情况下，鼓励向 Dapr 项目和社区捐赠内置组件。

不过，可插拔组件非常适合想要创建自己的私有组件的方案，这些组件不包含在 Dapr 项目中。
例如：

- 你的组件可能特定于你的公司或带来 IP 问题，因此它不能包含在 Dapr component 存储库中。
- 您希望组件更新与 Dapr 发布周期解耦。

了解更多信息，请阅读[可插拔组件概述]({{< ref "pluggable-components-overview" >}})

## 热重载

启用[`HotReload`功能]({{< ref "support-preview-features.md" >}})，组件可以在运行时进行"热重载"。
这意味着您可以在不重新启动 Dapr 运行时的情况下更新组件配置。
当在Kubernetes API中或在自托管模式下更改`resources`目录中的文件时，组件重新加载会发生在创建、更新或删除组件资源时。
当组件更新时，首先关闭组件，然后使用新的配置重新初始化。
在重新加载和重新初始化期间，该组件暂时不可用。

## 可用的组件类型

以下是 Dapr 提供的组件：

### 状态存储

状态存储组件是存储键值对的数据存储（数据库、文件、内存），其作为[状态管理]({{< ref "state-management-overview\.md" >}})的构建块之一。

- [状态存储列表]({{< ref supported-state-stores >}})
- [状态存储实现](https://github.com/dapr/components-contrib/tree/master/state)

### 命名解析

命名解析组件与[服务调用]({{< ref "service-invocation-overview\.md" >}})构建块配合使用，与托管环境集成以提供服务到服务的发现。 例如，Kubernetes 命名解析组件与 Kubernetes DNS 服务集成，自托管使用 mDNS，VM 集群可以使用 Consul 命名解析组件。

- [名称解析组件列表]({{< ref supported-name-resolution >}})
- [名称解析实现](https://github.com/dapr/components-contrib/tree/master/nameresolution)

### 发布/订阅代理

发布/订阅组件是消息分发器，可以作为[发布和订阅](pubsub-overview.md)构建块的一部分来传递消息给/从服务。

- [支持的发布/订阅代理列表]({{< ref supported-pubsub >}})
- [发布/订阅代理实现](https://github.com/dapr/components-contrib/tree/master/pubsub)

### 绑定

外部资源可以连接到Dapr，以便触发应用程序上的方法或作为[绑定]({{< ref bindings-overview\.md >}})构建块的一部分从应用程序调用。

- [支持的绑定列表]({{< ref supported-bindings >}})
- [绑定实现](https://github.com/dapr/components-contrib/tree/master/bindings)

### Secret stores（密钥存储）

一个[秘密]({{< ref "secrets-overview\.md" >}})是任何你想保护的私人信息，以防止不需要的访问。 秘密存储用来存储可在应用中检索和使用的密钥。

- [支持的密钥存储列表]({{< ref supported-secret-stores >}})
- [密钥存储实现](https://github.com/dapr/components-contrib/tree/master/secretstores)

### 配置存储

配置存储用于保存应用数据，配置可在应用启动或者配置更改的时候被应用读取。 配置存储支持动态加载（热更新）。

- [支持的配置存储列表]({{< ref supported-configuration-stores >}})
- [配置存储实现](https://github.com/dapr/components-contrib/tree/master/configuration)

### 锁

锁组件用作分布式锁，以提供对资源（如队列或数据库）的互斥访问。

- [支持的锁列表]({{< ref supported-locks >}})
- [锁实现](https://github.com/dapr/components-contrib/tree/master/lock)

### Workflows

一个[工作流程]({{< ref workflow-overview\.md >}})是定义可靠业务流程或数据流的自定义应用程序逻辑。 工作流组件是工作流运行时（或引擎），运行为该工作流编写的业务逻辑并将其状态存储到状态存储中。

<!--- [List of supported workflows]()
- [Workflow implementations](https://github.com/dapr/components-contrib/tree/master/workflows)-->

### Cryptography

[加密]({{< ref cryptography-overview\.md >}})组件用于执行加密操作，包括加密和解密消息，而不会将密钥暴露给您的应用程序。

- [支持的加密组件列表]({{< ref supported-cryptography >}})
- [加密实现](https://github.com/dapr/components-contrib/tree/master/crypto)

### 中间件

Dapr允许将自定义[中间件]({{< ref "middleware.md" >}})插入到HTTP请求处理管道中。 中间件可以在将请求路由到用户代码或将响应返回到客户端之前对 HTTP 请求执行其他操作（例如身份验证、加密和消息转换）。 中间件组件与[服务调用]({{< ref "service-invocation-overview\.md" >}})构建块一起使用。

- [支持的中间件组件列表]({{< ref supported-middleware >}})
- [中间件实现](https://github.com/dapr/components-contrib/tree/master/middleware)

{{% alert title="注意" color="primary" %}}
由于可插拔组件不需要用Go编写，因此它们遵循与内置Dapr组件不同的实现过程。 了解有关开发内置组件的更多信息，请阅读[开发新组件](https://github.com/dapr/components-contrib/blob/master/docs/developing-component.md)。
{{% /alert %}}
