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

Dapr 允许您通过一个组合了反向代理与内置服务发现的端点来克服这些挑战，同时能够利用内置的分布式跟踪，度量，错误处理等能力。

Dapr 采用边车（Sidecar）、去中心化的架构。 要使用 Dapr 来调用应用程序，请在任意 Dapr 实例上使用 `invoke` 这个API。 Sidecar 编程模型鼓励每个应用程序与自己的 Dapr 实例对话。 Dapr 实例会相互发现并进行通信。

### 调用逻辑

下图是 Dapr的服务调用如何工作的总览图

<img src="/images/service-invocation-overview.png" width=800 alt="Diagram showing the steps of service invocation">

1. 服务 A 对服务 B 发起HTTP/gRPC的调用。
2. Dapr 使用在给定 [ 托管平台]({{< ref "hosting" >}}) 上运行的 [命名解析组件](https://github.com/dapr/components-contrib/tree/master/nameresolution) 发现服务 B的位置。
3. Dapr 将消息转发至服务 B的 Dapr 边车

    **注**: Dapr 边车之间的所有调用考虑到性能都优先使用 gRPC。 仅服务与 Dapr 边车之间的调用可以是 HTTP 或 gRPC

4. 服务 B的 Dapr 边车将请求转发至服务 B 上的特定端点 (或方法) 。服务 B 随后运行其业务逻辑代码。
5. 服务 B 发送响应给服务 A。响应将转至服务 B 的边车。
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

这在 Kubernetes 集群中进行跨命名空间调用特别有用。 观看此演示视频以获取有关如何使用具有命名空间的服务调用。 <iframe width="560" height="315" src="https://www.bilibili.com/video/BV14z4y167te?p=2&t=497" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen mark="crwd-mark"></iframe>


### 服务间安全性

All calls between Dapr applications can be made secure with mutual (mTLS) authentication on hosted platforms, including automatic certificate rollover, via the Dapr Sentry service. The diagram below shows this for self hosted applications.

For more information read the [service-to-service security]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}}) article.


### 重试

Applications can control which other applications are allowed to call them and what they are authorized to do via access policies. This enables you to restrict sensitive applications, that say have personnel information, from being accessed by unauthorized applications, and combined with service-to-service secure communication, provides for soft multi-tenancy deployments.

For more information read the [access control allow lists for service invocation]({{< ref invoke-allowlist.md >}}) article.

#### Service access security
The diagram below is an example deployment on a Kubernetes cluster with a Daprized `Ingress` service that calls onto `Service A` using service invocation with mTLS encryption and an applies access control policy. `Service A` then calls onto `Service B` also using service invocation and mTLS. Each service is running in different namespaces for added isolation.

<img src="/images/service-invocation-security.png" width=800>

### 重试

在发生调用失败和瞬态错误的情况下，服务调用会在回退（backoff）时间段内执行自动重试。

导致重试的错误有：

* 网络错误，包括端点不可用和拒绝连接
* 因续订主调/被调方Dapr边车上的证书而导致的身份验证错误

每次调用重试的回退间隔是 1 秒，最多重试三次。 通过 gRPC 连接到目标 sidecar 的连接超时时间为 5 秒钟。

### Pluggable service discovery

Dapr can run on any [hosting platform]({{< ref hosting >}}). For the supported hosting platforms this means they have a [name resolution component](https://github.com/dapr/components-contrib/tree/master/nameresolution) developed for them that enables service discovery. For example, the Kubernetes name resolution component uses the Kubernetes DNS service to resolve the location of other applications running in the cluster. For local and multiple physical machines this uses the mDNS protocol.

### Observability
For more information read the [observability]({{< ref observability-concept.md >}}) article.

The diagram below shows an example of how this works. If you have 1 instance of an application with app ID `FrontEnd` and 3 instances of application with app ID `Cart` and you call from `FrontEnd` app to `Cart` app, Dapr round robins' between the 3 instances. These instance can be on the same machine or on different machines. .

<img src="/images/service-invocation-mdns-round-robin.png" width=800 alt="Diagram showing the steps of service invocation">

Note: You can have N instances of the same app with the same app ID as app ID is unique per app. And you can have multiple instances of that app where all those instances have the same app ID.

### Tracing and metrics with observability

By default, all calls between applications are traced and metrics are gathered to provide insights and diagnostics for applications, which is especially important in production scenarios. This gives you call graphs and metrics on the calls between your services. For more information read about [observability]({{< ref observability-concept.md >}}).

### 服务调用API

服务调用的 API 规范可在 [规范仓库]({{< ref service_invocation_api.md >}}) 中找到。

## Example
Following the above call sequence, suppose you have the applications as described in the [hello world quickstart](https://github.com/dapr/quickstarts/blob/master/hello-world/README.md), where a python app invokes a node.js app. In such a scenario, the python app would be "Service A" , and a Node.js app would be "Service B".

The diagram below shows sequence 1-7 again on a local machine showing the API call:

<img src="/images/service-invocation-overview-example.png" width=800>

1. The Node.js app has a Dapr app ID of `nodeapp`. The Node.js app has a Dapr app ID of `nodeapp`. The python app invokes the Node.js app's `neworder` method by POSTing `http://localhost:3500/v1.0/invoke/nodeapp/method/neworder`, which first goes to the python app's local Dapr sidecar.
2. Dapr discovers the Node.js app's location using name resolution component (in this case mDNS while self-hosted) which runs on your local machine.
3. Dapr forwards the request to the Node.js app's sidecar using the location it just received.
4. The Node.js app's sidecar forwards the request to the Node.js app. The Node.js app's sidecar forwards the request to the Node.js app. The Node.js app performs its business logic, logging the incoming message and then persist the order ID into Redis (not shown in the diagram)
5. The Node.js app sends a response to the Python app through the Node.js sidecar.
6. Dapr forwards the response to the Python Dapr sidecar
7. The Python app receives the resposne.

## 下一步

* Follow these guide on:
    * [How-to: Get started with HTTP service invocation]({{< ref howto-invoke-discover-services.md >}})
    * [How-to: Get started with Dapr and gRPC]({{< ref grpc >}})
* Try out the [hello world quickstart](https://github.com/dapr/quickstarts/blob/master/hello-world/README.md) which shows how to use HTTP service invocation or visit the samples in each of the [Dapr SDKs]({{< ref sdks >}})
* Read the [service invocation API specification]({{< ref service_invocation_api.md >}})
* See the [service invocation performance]({{< ref perf-service-invocation.md >}}) numbers
