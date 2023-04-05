---
type: docs
title: "服务调用概述"
linkTitle: "概述"
weight: 900
description: "服务调用API构建块概述"
---

## 介绍

通过服务调用，应用程序可以使用 [gRPC](https://grpc.io) 或 [HTTP](https://www.w3.org/Protocols/) 这样的标准协议来发现并可靠地与其他应用程序通信。

In many microservice-based applications multiple services need the ability to communicate with one another. This inter-service communication requires that application developers handle problems like:

- **Service discovery.** How do I discover my different services?
- **Standardizing API calls between services.** How do I invoke methods between services?
- **Secure inter-service communication.** How do I call other services securely with encryption and apply access control on the methods?
- **Mitigating request timeouts or failures.** How do I handle retries and transient errors?
-  **Implementing observability and tracing.** How do I use tracing to see a call graph with metrics to diagnose issues in production?

Dapr addresses these challenges by providing a service invocation API that acts similar to a reverse proxy with built-in service discovery, while leveraging built-in distributed tracing, metrics, error handling, encryption and more.

Dapr 采用边车（Sidecar）、去中心化的架构。 To invoke an application using Dapr:
- You use the `invoke` API on the Dapr instance.
- Each application communicates with its own instance of Dapr.
- The Dapr instances discover and communicate with each other.

### Service invocation diagram

下图是 Dapr的服务调用如何工作的总览图

<img src="/images/service-invocation-overview.png" width=800 alt="显示服务调用步骤的图表">

1. 服务 A 对服务 B 发起HTTP/gRPC的调用。
2. Dapr 使用在给定 [ 托管平台]({{< ref "hosting" >}}) 上运行的 [命名解析组件]({{< ref supported-name-resolution >}}) 发现服务 B的位置。
3. Dapr 将消息转发至服务 B的 Dapr 边车
   - **注**: Dapr 边车之间的所有调用考虑到性能都优先使用 gRPC。 仅服务与 Dapr 边车之间的调用可以是 HTTP 或 gRPC.
4. 服务 B的 Dapr 边车将请求转发至服务 B 上的特定端点 (或方法) 。 服务 B 随后运行其业务逻辑代码。
5. 服务 B 发送响应给服务 A。 响应将转至服务 B 的边车。
6. Dapr 将消息转发至服务 A 的 Dapr 边车。
7. 服务 A 接收响应。

## 特性
服务调用提供了一系列特性，使您可以方便地调用远程应用程序上的方法。

### HTTP and gRPC service invocation
- **HTTP**: If you're already using HTTP protocols in your application, using the Dapr HTTP header might be the easiest way to get started. You don't need to change your existing endpoint URLs; just add the `dapr-app-id` header and you're ready to go. For more information, see [Invoke Services using HTTP]({{< ref howto-invoke-discover-services.md >}}).
- **gRPC**: Dapr allows users to keep their own proto services and work natively with gRPC. 这意味着你可以使用服务调用你现有的gRPC应用程序，而不需要包括任何Dapr SDK或包括自定义gRPC服务。 有关详细信息，请参阅 Dapr 和 gRPC</a>的
操作方法教程。</li> </ul> 
  
  

### 服务间安全性

With the Dapr Sentry service, all calls between Dapr applications can be made secure with mutual (mTLS) authentication on hosted platforms, including automatic certificate rollover.

更多信息查看 [服务间安全]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}})。



### Resiliency including retries

In the event of call failures and transient errors, service invocation provides a resiliency feature that performs automatic retries with backoff time periods. To find out more, see the [Resiliency article here]({{< ref resiliency-overview.md >}}).



### 具有可观测性的追踪和指标

默认情况下，所有应用程序之间的调用都会被追踪，并且会收集度量值（metrics），以便提供针对应用程序的报告及诊断。 This is especially important in production scenarios, providing call graphs and metrics on the calls between your services. 更多信息参考 [观测性]({{< ref observability-concept.md >}})。




### 访问控制

With access policies, applications can control:

- Which applications are allowed to call them.
- What applications are authorized to do.

For example, you can restrict sensitive applications with personnel information from being accessed by unauthorized applications. Combined with service-to-service secure communication, you can provide for soft multi-tenancy deployments.

更多信息参考 [服务调用的访问控制允许列表]({{< ref invoke-allowlist.md >}})。



### 命名空间作用域

应用程序的范围可以限定在命名空间内以实现部署和安全性，并且可以在部署到不同命名空间的服务之间进行调用。 有关详细信息，请阅读 [ 跨命名空间服务调用]({{< ref "service-invocation-namespaces.md" >}}) 章节。



### 使用 mDNS 轮询负载均衡

Dapr 使用 mDNS 协议提供轮询负载均衡的服务调用请求，例如用于本地或多个联网的物理机器。

下面的图表显示了如何运作的一个例子。 如果您有一个应用程序实例，其中包含 app ID 为 `FrontEnd` 和 3 个 app ID 为 `Cart` 的应用程序实例，并且您从 `FrontEnd` 应用程序到 `Cart` 应用程序的3个实例之间的进行轮询。 这些实例可以在同一机器上或不同的机器上。 .

<img src="/images/service-invocation-mdns-round-robin.png" width=600 alt="显示服务调用步骤的图表">

**Note**: App ID is unique per _application_, not application instance. Regardless how many instances of that application exist (due to scaling), all of them will share the same app ID.



### 可插拔的服务发现

Dapr可以在各种 [托管平台上运行]({{< ref hosting >}})。 为了实现服务发现和服务调用，Dapr使用可插拔的 [名称解析组件]({{< ref supported-name-resolution >}})。 例如，Kubernetes 名称解析组件使用 Kubernetes DNS 服务来解析在集群中运行的其他应用程序的位置。 自承载计算机可以使用 mDNS 名称解析组件。 The Consul name resolution component can be used in any hosting environment, including Kubernetes or self-hosted.



## Example Architecture

Following the above call sequence, suppose you have the applications as described in the [Hello World tutorial](https://github.com/dapr/quickstarts/blob/master/tutorials/hello-world/README.md), where a python app invokes a node.js app. 这种情况下，python应用将是“service A”，Node.js应用将是“service B”。

下面的图表展示本地机器上 API 调用的顺序 1-7：

<img src="/images/service-invocation-overview-example.png" width=800 />

1. Node.js 应用程序有一个 app ID 为 `nodeapp` 的 Dapr 应用程序。 当 python 应用程序通过 POST `http://localhost:3500/v1.0/invoke/nodeapp/method/neworder` 调用 Node.js 应用程序的 `neworder` 方法时, 首先会到达 python app 的本地 dapr sidecar。
2. Dapr 使用本地机器运行的名称解析组件(在这种情况下自动运行的 mDNS)，发现 Node.js 应用的位置。
3. Dapr 使用刚刚收到的位置将请求转发到 Node.js 应用的 sidecar。
4. Node.js 应用的 sidecar 将请求转发到 Node.js 应用程序。 The Node.js app performs its business logic, logging the incoming message and then persist the order ID into Redis (not shown in the diagram).
5. Node.js应 用程序通过 Node.js sidecar 向 Python 应用程序发送一个响应。
6. Dapr 转发响应到 Python 的 Dapr sidecar.
7. Python 应用程序收到响应。



## Try out service invocation


### Quickstarts & tutorials

The Dapr docs contain multiple quickstarts that leverage the service invocation building block in different example architectures. To get a straight-forward understanding of the service invocation api and it's features we recommend starting with our quickstarts: 

| 快速入门/教程                                                                                                                 | 说明                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [Service invocation quickstart]({{< ref serviceinvocation-quickstart.md >}})                                            | This quickstart gets you interacting directly with the service invocation building block.                                                 |
| [Hello world tutorial](https://github.com/dapr/quickstarts/blob/master/tutorials/hello-world/README.md)                 | This tutorial shows how to use both the service invocation and state management building blocks all running locally on your machine.      |
| [Hello world kubernetes tutorial](https://github.com/dapr/quickstarts/blob/master/tutorials/hello-kubernetes/README.md) | This tutorial walks through using Dapr in kubernetes and covers both the service invocation and state management building blocks as well. |





### Start using service invocation directly in your app

想跳过快速入门？ 没问题。 You can try out the service invocation building block directly in your application to securely communicate with other services. After [Dapr is installed](https://docs.dapr.io/getting-started), you can begin using the service invocation API in the following ways.

Invoke services using:

- **HTTP and gRPC service invocation** (recommended set up method) 
    - *HTTP* - Allows you to just add the `dapr-app-id` header and you're ready to get started. Read more on this here, [Invoke Services using HTTP.]({{< ref howto-invoke-discover-services.md >}})
  - *gRPC* - For gRPC based applications, the service invocation API is also available. Run the gRPC server, then invoke services using the Dapr CLI. Read more on this in [Configuring Dapr to use gRPC]({{< ref grpc >}}) and [Invoke services using gRPC]({{< ref howto-invoke-services-grpc.md >}}).
- **Direct call to the API** - In addition to proxying, there's also an option to directly call the service invocation API to invoke a GET endpoint. Just update your address URL to `localhost:<dapr-http-port>` and you'll be able to directly call the API. You can also read more on this in the _Invoke Services using HTTP_ docs linked above under HTTP proxying.
- **SDKs** - If you're using a Dapr SDK, you can directly use service invocation through the SDK. Select the SDK you need and use the Dapr client to invoke a service. Read more on this in [Dapr SDKs]({{< ref sdks.md >}}).

For quick testing, try using the Dapr CLI for service invocation:

- **Dapr CLI command** - Once the Dapr CLI is set up, use `dapr invoke --method <method-name>` command along with the method flag and the method of interest. Read more on this in [Dapr CLI]({{< ref dapr-invoke.md >}}).



## 下一步

- 阅读 [服务调用 API 规范]({{< ref service_invocation_api.md >}}). This reference guide for service invocation describes how to invoke methods on other services.
- Understand the [service invocation performance numbers]({{< ref perf-service-invocation.md >}}).
- Take a look at [observability]({{< ref monitoring.md >}}). Here you can dig into Dapr's monitoring tools like tracing, metrics and logging.
- Read up on our [security practices]({{< ref monitoring.md >}}) around mTLS encryption, token authentication, and endpoint authorization.
