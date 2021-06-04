---
type: docs
title: "服务调用概述"
linkTitle: "概述"
weight: 1000
description: "服务调用构建块概述"
---

## 介绍

通过服务调用，应用程序可以使用 [gRPC](https://grpc.io) 或 [HTTP](https://www.w3.org/Protocols/) 这样的标准协议来发现并可靠地与其他应用程序通信。

在许多具有多个需要相互通信的服务的环境中，开发者经常会问自己以下问题：

* 我如何发现和调用不同服务上的方法？
* 我如何安全地调用其他服务？
* 我如何处理重试和瞬态错误？
* 我如何使用分布式跟踪来查看调用图来诊断生产中的问题？

Dapr 通过提供服务调用 API 来应对这些问题，这种调用 API 作为反向代理与内置的服务发现相结合， 同时利用内置分布式跟踪、计量、错误处理、加密等功能。

Dapr 采用边车（Sidecar）、去中心化的架构。 要使用 Dapr 来调用应用程序，请在任意 Dapr 实例上使用 `invoke` 这个API。 sidecar 编程模型鼓励每个应用程序与自己的 Dapr 实例对话。 Dapr 实例会相互发现并进行通信。

### 调用逻辑

下图是 Dapr的服务调用如何工作的总览图

<img src="/images/service-invocation-overview.png" width=800 alt="显示服务调用步骤的图表">

1. 服务 A 对服务 B 发起HTTP/gRPC的调用。
2. Dapr 使用在给定 [ 托管平台]({{< ref "hosting" >}}) 上运行的 [命名解析组件](https://github.com/dapr/components-contrib/tree/master/nameresolution) 发现服务 B的位置。
3. Dapr 将消息转发至服务 B的 Dapr 边车

    **注**: Dapr 边车之间的所有调用考虑到性能都优先使用 gRPC。 仅服务与 Dapr 边车之间的调用可以是 HTTP 或 gRPC

4. 服务 B的 Dapr 边车将请求转发至服务 B 上的特定端点 (或方法) 。 服务 B 随后运行其业务逻辑代码。
5. 服务 B 发送响应给服务 A。 响应将转至服务 B 的边车。
6. Dapr 将消息转发至服务 A 的 Dapr 边车。
7. 服务 A 接收响应。

## 特性
服务调用提供了一系列特性，使您可以方便地调用远程应用程序上的方法。

### 命名空间作用域

服务调用支持跨命名空间调用。 在所有受支持的托管平台上， Dapr 应用程序标识（ID）遵循包含了目标命名空间的有效 FQDN 格式。

例如，以下字符串包含应用程序标识 `nodeapp` 以及应用程序在 `production` 中运行的名称空间。

```
localhost:3500/v1.0/invoke/nodeapp.production/method/neworder
```

这在 Kubernetes 集群中进行跨命名空间调用特别有用。 观看此演示视频以获取有关如何使用具有命名空间的服务调用。 <iframe width="560" height="315" src="//player.bilibili.com/player.html?aid=586106724&bvid=BV14z4y167te&cid=280150508&page=2&t=497" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen mark="crwd-mark"></iframe>


### 服务间安全性

Dapr 应用程序之间的所有调用都可以通过托管平台上的相互(mTLS) 身份验证来安全，包括通过 Dapr 哨兵服务来自动证书翻转（certificate rollover）。 下面的图表显示了自托管的应用程序。

更多信息查看 [服务间安全]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}})。


### 重试

应用程序可以控制哪些其他应用程序允许调用它们，以及通过访问策略授权它们做什么。 这使您能够限制敏感应用，也就是说有人员信息的应用被未经授权的应用访问。 与服务间安全通信相结合，提供软多租户部署。

更多信息参考 [服务调用的访问控制允许列表]({{< ref invoke-allowlist.md >}})。

#### 服务调用安全示例
下图是 Kubernetes 集群上的一个部署示例，使用 Dapr 化的`Ingress`服务，该服务调用`Service A`，使用mTLS加密服务调用，并应用访问控制策略。 `Service A` 接下来调用 `Service B` 并也使用服务调用和 mTLS。 每个服务都在不同的名称空间中运行，以增加隔离。

<img src="/images/service-invocation-security.png" width=800>

### 重试

在发生调用失败和瞬态错误的情况下，服务调用会在回退（backoff）时间段内执行自动重试。

导致重试的错误有：

* 网络错误，包括端点不可用和拒绝连接
* 因续订主调/被调方Dapr边车上的证书而导致的身份验证错误

每次调用重试的回退间隔是 1 秒，最多重试三次。 通过 gRPC 连接目标 sidecar 的超时时间为5秒。

### 可插拔的服务发现

Dapr 可以运行在任何[托管平台]({{< ref hosting >}})。 对于支持的托管平台，这意味着他们有一个能够发现服务的 [名称解析组件](https://github.com/dapr/components-contrib/tree/master/nameresolution)。 例如，Kubernetes 名称解析组件使用 Kubernetes DNS 服务来解析在集群中运行的其他应用程序的位置。 对于本地和多个物理机器，这将使用 mDNS 协议。

> 注意： [对于本地和物理机器，请确保 mDNS 正常工作。]({{< ref "common_issues.md#service-invocation-is-failing-and-my-dapr-service-is-missing-an-appId-macos" >}})

### 使用 mDNS 轮询负载均衡
Dapr 使用 mDNS 协议提供轮询负载均衡的服务调用请求，例如用于本地或多个联网的物理机器。

下面的图表显示了如何运作的一个例子。 如果您有一个应用程序实例，其中包含 app ID 为 `FrontEnd` 和 3 个 app ID 为 `Cart` 的应用程序实例，并且您从 `FrontEnd` 应用程序到 `Cart` 应用程序的3个实例之间的进行轮询。 这些实例可以在同一机器上或不同的机器上。 .

<img src="/images/service-invocation-mdns-round-robin.png" width=800 alt="显示服务调用步骤的图表">

注意：您可以有 N 个相同app ID的实例，对于每个应用程序来说 app ID 都是唯一的。 而且您可以有多个此应用程序的实例，其中所有这些实例都有相同的 app ID。

### 具有可观测性的追踪和指标

默认情况下，所有应用程序之间的调用都会被追踪，也会收集到度量（metrics），以便为应用程序提供洞察力（insights）和诊断。 这在生产场景中尤其重要。 这给您的服务之间的调用提供了调用链图和度量（metrics）。 更多信息参考 [观测性]({{< ref observability-concept.md >}})。

### 服务调用 API

服务调用的 API 规范可在 [服务调用 API 引用]({{< ref service_invocation_api.md >}}) 中找到。

## Example
按照上述调用顺序，假定您有 [Hello World 快速入门](https://github.com/dapr/quickstarts/blob/master/hello-world/README.md)中描述的应用程序，在 python 应用程序调用一个 node.js 应用的地方。 这种情况下，python应用将是“service A”，Node.js应用将是“service B”。

下面的图表展示本地机器上 API 调用的顺序 1-7：

<img src="/images/service-invocation-overview-example.png" width=800>

1. Node.js 应用程序有一个 app ID 为 `nodeapp` 的 Dapr 应用程序。 当 python 应用程序通过 POST `http://localhost:3500/v1.0/invoke/nodeapp/method/neworder` 调用 Node.js 应用程序的 `neworder` 方法时, 首先会到达 python app 的本地 dapr sidecar。
2. Dapr 使用本地机器运行的名称解析组件(在这种情况下自动运行的 mDNS)，发现 Node.js 应用的位置。
3. Dapr 使用刚刚收到的位置将请求转发到 Node.js 应用的 sidecar。
4. Node.js 应用的 sidecar 将请求转发到 Node.js 应用程序。 Node.js 应用执行其业务逻辑，记录收到的消息，然后将订单 ID 存储到 Redis (未在图表中显示)中
5. Node.js应 用程序通过 Node.js sidecar 向 Python 应用程序发送一个响应。
6. Dapr 转发响应到 Python 的 Dapr sidecar
7. Python 应用程序收到响应。

## 下一步

* 遵循这些指南：
    * [入门指南：发现并调用服务]({{< ref howto-invoke-discover-services.md >}})
    * [指南：配置 Dapr 来使用 gRPC]({{< ref grpc >}})
* 试试 [hello World 快速入门](https://github.com/dapr/quickstarts/blob/master/hello-world/README.md) ，它会显示如何使用 HTTP 服务调用或试试 [Dapr SDK]({{< ref sdks >}}) 中的 Sample。
* 阅读 [服务调用 API 规范]({{< ref service_invocation_api.md >}})
* 了解 [服务调用性能]({{< ref perf-service-invocation.md >}}) 数字
