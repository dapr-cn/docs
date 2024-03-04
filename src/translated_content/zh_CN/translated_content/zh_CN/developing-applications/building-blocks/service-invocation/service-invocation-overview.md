---
type: docs
title: "服务调用概述"
linkTitle: "概述"
weight: 10
description: "服务调用 API 构建块概述"
---

通过服务调用，您的应用程序可以可靠且安全地使用标准 [gRPC](https://grpc.io) 或 [HTTP](https://www.w3.org/Protocols/) 协议与其他应用程序通信。

在许多基于微服务的应用程序中，多个服务需要相互通信的能力。 此跨服务通信要求应用程序开发人员处理诸如：

- **服务发现。**我如何发现我的不同服务？
- **在服务之间标准化API调用。**如何在服务之间调用方法？
- **安全的服务间通信。**如何使用加密安全地调用其他服务，并在方法上应用访问控制？
- **缓解请求超时或失败。** 如何处理重试和暂时性错误？
-  **实施可观测性和跟踪。** 如何使用跟踪来查看具有指标的调用图，以诊断生产中的问题？

## 服务调用 API

Dapr 通过提供一个类似于具有内置服务发现的反向代理的服务调用 API 来解决这些挑战，同时利用内置的分布式跟踪、metrics、错误处理、加密等功能。

Dapr 采用边车（Sidecar）、去中心化的架构。 使用 Dapr 调用应用程序:
- 您在 Dapr 实例上使用 `invoke` API。
- 每个应用程序与其自己的 Dapr 实例进行通信。
- Dapr 实例发现并相互通信。

[以下概述视频和演示](https://www.youtube.com/live/0y7ne6teHT4?si=mtLMrajE5wVXJYz8&t=3598) 演示了 Dapr 服务调用的工作原理。 

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/0y7ne6teHT4?si=Flsd8PRlF8nYu693&amp;start=3598" title="YouTube 视频播放器" style="padding-bottom:25px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

下图是 Dapr的服务调用如何工作的总览图，介绍了两个 Dapr 化应用程序之间的服务调用。

<img src="/images/service-invocation-overview.png" width=800 alt="显示服务调用步骤的图表">

1. 服务 A 对服务 B 发起 HTTP/gRPC 的调用。 调用发送到本地 Dapr sidercar。
2. Dapr 使用在给定 [ 托管平台]({{< ref "hosting" >}}) 上运行的 [命名解析组件]({{< ref supported-name-resolution >}}) 发现服务 B的位置。
3. Dapr 将消息转发到服务 B 的 Dapr sidecar
   - **注意**：Dapr sidecar 之间的所有调用都通过 gRPC 以提高性能。 只有服务和 Dapr sidecar 之间的调用可以是 HTTP 或 gRPC。
4. 服务 B 的 Dapr sidecar 将请求转发到服务 B 上的指定终结点（或方法）。 然后，服务 B 运行其业务逻辑代码。
5. 服务 B 向服务 A 发送响应。 响应转到服务 B 的 sidecar。
6. Dapr 将响应转发到服务 A 的 Dapr sidecar。
7. 服务 A 接收响应。

您还可以使用服务调用 API 调用非 Dapr HTTP 终端点。 例如，您可能只在整个应用程序的一部分中使用 Dapr，可能无法访问代码以迁移现有应用程序以使用 Dapr，或者只需要调用外部 HTTP 服务。 读 [“操作方法：使用 HTTP 调用非 Dapr 端点”]({{< ref howto-invoke-non-dapr-endpoints.md >}}) 了解更多信息。

## 特性
服务调用提供了一系列特性，使您可以方便地调用应用程序之间的方法或调用外部HTTP端点。

### HTTP 和 gRPC 服务调用
- **HTTP**: 如果您的应用程序已经在使用 HTTP 协议，使用 Dapr HTTP headers 可能是开始的最简单方式。 您无需更改现有的端点URL；只需添加`dapr-app-id`标头，您就可以开始了。 有关更多信息，请参阅 。 [使用 HTTP 调用服务]({{< ref howto-invoke-discover-services.md >}}).
- **gRPC**: Dapr允许用户保留他们自己的proto服务，并与gRPC原生工作。 这意味着你可以使用服务调用你现有的gRPC应用程序，而不需要包括任何Dapr SDK或包括自定义gRPC服务。 有关详细信息，请参阅 Dapr 和 gRPC</a>的
操作方法教程。</li> </ul> 
  
  

### 服务调用安全

通过 Dapr 哨兵服务，Dapr 应用程序之间的所有调用都可以通过托管平台上的相互(mTLS) 身份验证来安全，包括通过 Dapr 哨兵服务来自动证书翻转（certificate rollover）。

更多信息查看 [服务间安全]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}})。



### 包括重试的弹性

在呼叫失败和瞬态错误的情况下，服务调用提供了一种弹性功能，可以在退避时间段内自动重试。 要了解更多信息，请参阅 [此处的复原能力文章]({{< ref resiliency-overview.md >}}).



### 具有可观测性的追踪和指标

默认情况下，所有应用程序之间的调用都会被追踪，并且会收集度量值（metrics），以便提供针对应用程序的报告及诊断。 这在生产场景中尤为重要，提供服务之间调用的调用图和指标。 更多信息参考 [观测性]({{< ref observability-concept.md >}})。



### 访问控制

通过访问策略，应用程序可以控制：

- 哪些应用程序被允许调用它们。
- 授权执行哪些应用程序。

例如，您可以限制包含人员信息的敏感应用程序被未经授权的应用程序访问。 结合服务到服务的安全通信，您可以为软多租户部署提供支持。

更多信息参考 [服务调用的访问控制允许列表]({{< ref invoke-allowlist.md >}})。



### 命名空间作用域

应用程序的范围可以限定在命名空间内以实现部署和安全性，并且可以在部署到不同命名空间的服务之间进行调用。 有关详细信息，请阅读 [ 跨命名空间服务调用]({{< ref "service-invocation-namespaces.md" >}}) 章节。



### 使用 mDNS 轮询负载均衡

Dapr 使用 mDNS 协议提供轮询负载均衡的服务调用请求，例如用于本地或多个联网的物理机器。

下面的图表显示了这个工作原理的一个例子。 如果您有一个应用程序实例，其中包含 app ID 为 `FrontEnd` 和 3 个 app ID 为 `Cart` 的应用程序实例，并且您从 `FrontEnd` 应用程序到 `Cart` 应用程序的3个实例之间的进行轮询。 这些实例可以在同一机器上或不同的机器上。 。

<img src="/images/service-invocation-mdns-round-robin.png" width=600 alt="显示服务调用步骤的图表" style="padding-bottom:25px;">

**注意**：应用程序ID是每个_应用程序_唯一的，而不是应用程序实例。 无论该应用程序存在多少个实例（由于扩展），它们都将共享相同的应用程序ID。



### 可插拔的服务发现

Dapr可以在各种 [托管平台上运行]({{< ref hosting >}})。 为了实现服务发现和服务调用，Dapr使用可插拔的 [名称解析组件]({{< ref supported-name-resolution >}})。 例如，Kubernetes 名称解析组件使用 Kubernetes DNS 服务来解析在集群中运行的其他应用程序的位置。 自承载计算机可以使用 mDNS 名称解析组件。 Consul 名称解析组件可用于任何托管环境，包括 Kubernetes 或自托管环境。



### HTTP服务调用的流式传输

您可以在HTTP服务调用中将数据作为流处理。 当使用 Dapr 通过 HTTP 调用另一个服务时，可以在性能和内存利用方面提供改进，特别是在请求或响应体积较大时。

下图展示了数据流的六个步骤。 

<img src="/images/service-invocation-simple.webp" width=600 alt="Diagram showing the steps of service invocation described in the table below" />

1. 请求：从"App A"到"Dapr sidecar A"
1. 请求: "Dapr sidecar A" 到 "Dapr sidecar B"
1. 请求："Dapr sidecar B" 到 "App B"
1. 响应："App B"到"Dapr sidecar B"
1. 响应: "Dapr sidecar B" 到 "Dapr sidecar A"
1. 响应："Dapr sidecar A" 到 "App A"



## 示例架构

按照上述调用顺序，假定您有 [Hello World 教程](https://github.com/dapr/quickstarts/blob/master/tutorials/hello-world/README.md)中描述的应用程序，在 python 应用程序调用一个 node.js 应用的地方。 这种情况下，python应用将是“Service A”，Node.js应用将是“Service B”。

下面的图表展示本地机器上 API 调用的顺序 1-7：

<img src="/images/service-invocation-overview-example.png" width=800 style="padding-bottom:25px;">

1. Node.js 应用程序有一个 app ID 为 `nodeapp` 的 Dapr 应用程序。 当 python 应用程序通过 POST `http://localhost:3500/v1.0/invoke/nodeapp/method/neworder` 调用 Node.js 应用程序的 `neworder` 方法时, 首先会到达 python app 的本地 Dapr sidecar。
2. Dapr 使用本地机器运行的名称解析组件(在这种情况下自动运行的 mDNS)，发现 Node.js 应用的位置。
3. Dapr 使用刚刚收到的位置将请求转发到 Node.js 应用的 sidecar。
4. Node.js 应用的 sidecar 将请求转发到 Node.js 应用程序。 Node.js 应用执行其业务逻辑，记录收到的消息，然后将订单 ID 存储到 Redis (未在图表中显示)中
5. Node.js应 用程序通过 Node.js sidecar 向 Python 应用程序发送一个响应。
6. Dapr 转发响应到 Python 的 Dapr sidecar.
7. Python 应用程序收到响应。



## 尝试服务调用


### 快速入门 & 教程

Dapr 文档包含多个快速入门，利用不同示例架构中的服务调用构建块。 为了对服务调用 Api 及其功能有一个直观的了解，我们建议从我们的快速入门开始： 

| 快速入门/教程                                                                                                          | 说明                                            |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| [服务调用快速入门]({{< ref serviceinvocation-quickstart.md >}})                                                          | 这个快速入门让您直接与服务调用构建块进行交互。                       |
| [Hello world 教程](https://github.com/dapr/quickstarts/blob/master/tutorials/hello-world/README.md)                | 本教程展示了如何在本地计算机上同时使用服务调用和状态管理构建块。              |
| [Hello World Kubernetes教程](https://github.com/dapr/quickstarts/blob/master/tutorials/hello-kubernetes/README.md) | 本教程介绍了在 Kubernetes 中使用 Dapr，并涵盖了服务调用和状态管理构建块。 |





### 直接在应用中开始使用服务调用

想跳过快速入门？ 没问题。 您可以直接在应用程序中尝试服务调用构建块，与其他服务进行安全通信。 安装[Dapr](https://docs.dapr.io/getting-started)之后，您可以通过以下方式开始使用服务调用 API。

使用以下方式调用服务:

- **HTTP 和 gRPC 服务调用**（推荐设置方法） 
    - *HTTP* - 允许您只需添加`dapr-app-id`标头，您就可以开始了。 在这里阅读更多关于这个的信息， [使用 HTTP 调用服务。]({{< ref howto-invoke-discover-services.md >}})
  - *gRPC* - 对于基于 gRPC 的应用程序，服务调用 API 也可用。 使用 Dapr CLI 运行 gRPC 服务器，然后调用服务。 阅读更多相关信息 [配置 Dapr 以使用 gRPC]({{< ref grpc >}}) 和 [使用 gRPC 调用服务]({{< ref howto-invoke-services-grpc.md >}}).
- **直接调用API** - 除了代理之外，还可以选择直接调用服务调用API来调用GET端点。 只需将您的地址 URL 更新为 `本地主机：<dapr-http-port>` 您将能够直接调用 API。 您还可以在上面链接的_使用 HTTP 调用服务_文档中阅读更多关于此的信息，有关 HTTP 代理的内容。
- **SDKs** - 如果您正在使用 Dapr SDK，您可以通过 SDK 直接使用服务调用。 选择您需要的 SDK 并使用 Dapr 客户端调用服务。 阅读更多相关信息 [Dapr SDK]({{< ref sdks.md >}}).

为了快速测试，请尝试使用 Dapr CLI 进行服务调用：

- **Dapr CLI 命令** - 设置 Dapr CLI 后，使用 `dapr invoke --method <method-name>` 命令以及方法标志和感兴趣的方法。 阅读更多相关信息 [Dapr CLI]({{< ref dapr-invoke.md >}}).



## 下一步

- 阅读 [服务调用 API 规范]({{< ref service_invocation_api.md >}}). 此服务调用参考指南描述了如何调用其他服务上的方法。
- 了解 [服务调用性能表现]({{< ref perf-service-invocation.md >}})。
- 看一看 [可观察性]({{< ref observability >}}). 在这里，您可以深入了解 Dapr 的监控工具，例如跟踪、指标和日志记录。
- 阅读我们的 [安全实践]({{< ref security-concept.md >}}) 围绕 mTLS 加密、令牌身份验证和端点授权。
