---
type: docs
title: "服务调用概述"
linkTitle: "概述"
weight: 900
description: "服务调用 API 构建块概述"
---

Using service invocation, your application can reliably and securely communicate with other applications using the standard [gRPC](https://grpc.io) or [HTTP](https://www.w3.org/Protocols/) protocols.

In many microservice-based applications multiple services need the ability to communicate with one another. This inter-service communication requires that application developers handle problems like:

- **Service discovery.** How do I discover my different services?
- **Standardizing API calls between services.** How do I invoke methods between services?
- **Secure inter-service communication.** How do I call other services securely with encryption and apply access control on the methods?
- **Mitigating request timeouts or failures.** How do I handle retries and transient errors?
-  **Implementing observability and tracing.** How do I use tracing to see a call graph with metrics to diagnose issues in production?

## 服务调用 API

Dapr addresses these challenges by providing a service invocation API that acts similar to a reverse proxy with built-in service discovery, while leveraging built-in distributed tracing, metrics, error handling, encryption and more.

Dapr 采用边车（Sidecar）、去中心化的架构。 To invoke an application using Dapr:
- You use the `invoke` API on the Dapr instance.
- Each application communicates with its own instance of Dapr.
- The Dapr instances discover and communicate with each other.

下图是 Dapr的服务调用如何工作的总览图

<img src="/images/service-invocation-overview.png" width=800 alt="显示服务调用步骤的图表">

1. Service A makes an HTTP or gRPC call targeting Service B. The call goes to the local Dapr sidecar.
2. Dapr discovers Service B's location using the [name resolution component]({{< ref supported-name-resolution >}}) which is running on the given [hosting platform]({{< ref "hosting" >}}).
3. Dapr forwards the message to Service B's Dapr sidecar
   - **Note**: All calls between Dapr sidecars go over gRPC for performance. Only calls between services and Dapr sidecars can be either HTTP or gRPC.
4. Service B's Dapr sidecar forwards the request to the specified endpoint (or method) on Service B.  Service B then runs its business logic code.
5. Service B sends a response to Service A.  The response goes to Service B's sidecar.
6. Dapr forwards the response to Service A's Dapr sidecar.
7. Service A receives the response.

## 特性
服务调用提供了一系列特性，使您可以方便地调用远程应用程序上的方法。

### HTTP and gRPC service invocation
- **HTTP**: If you're already using HTTP protocols in your application, using the Dapr HTTP header might be the easiest way to get started. You don't need to change your existing endpoint URLs; just add the `dapr-app-id` header and you're ready to go. For more information, see [Invoke Services using HTTP]({{< ref howto-invoke-discover-services.md >}}).
- **gRPC**: Dapr allows users to keep their own proto services and work natively with gRPC. This means that you can use service invocation to call your existing gRPC apps without having to include any Dapr SDKs or include custom gRPC services. For more information, see the [how-to tutorial for Dapr and gRPC]({{< ref howto-invoke-services-grpc.md >}}).

### Service-to-service security

With the Dapr Sentry service, all calls between Dapr applications can be made secure with mutual (mTLS) authentication on hosted platforms, including automatic certificate rollover.

For more information read the [service-to-service security]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}}) article.

### Resiliency including retries

In the event of call failures and transient errors, service invocation provides a resiliency feature that performs automatic retries with backoff time periods. To find out more, see the [Resiliency article here]({{< ref resiliency-overview.md >}}).

### Tracing and metrics with observability

默认情况下，所有应用程序之间的调用都会被追踪，并且会收集度量值（metrics），以便提供针对应用程序的报告及诊断。 This is especially important in production scenarios, providing call graphs and metrics on the calls between your services. For more information read about [observability]({{< ref observability-concept.md >}}).


### Access control

With access policies, applications can control:

- Which applications are allowed to call them.
- What applications are authorized to do.

For example, you can restrict sensitive applications with personnel information from being accessed by unauthorized applications. Combined with service-to-service secure communication, you can provide for soft multi-tenancy deployments.

更多信息参考 [服务调用的访问控制允许列表]({{< ref invoke-allowlist.md >}})。

### Namespace scoping

应用程序的范围可以限定在命名空间内以实现部署和安全性，并且可以在部署到不同命名空间的服务之间进行调用。 For more information, read the [Service invocation across namespaces]({{< ref "service-invocation-namespaces.md" >}}) article.

### 使用 mDNS 轮询负载均衡

Dapr provides round robin load balancing of service invocation requests with the mDNS protocol, for example with a single machine or with multiple, networked, physical machines.

The diagram below shows an example of how this works. If you have 1 instance of an application with app ID `FrontEnd` and 3 instances of application with app ID `Cart` and you call from `FrontEnd` app to `Cart` app, Dapr round robins' between the 3 instances. These instance can be on the same machine or on different machines. .

<img src="/images/service-invocation-mdns-round-robin.png" width=600 alt="Diagram showing the steps of service invocation">

**Note**: App ID is unique per _application_, not application instance. Regardless how many instances of that application exist (due to scaling), all of them will share the same app ID.

### Pluggable service discovery

Dapr can run on a variety of [hosting platforms]({{< ref hosting >}}). To enable service discovery and service invocation, Dapr uses pluggable [name resolution components]({{< ref supported-name-resolution >}}). 例如，Kubernetes 名称解析组件使用 Kubernetes DNS 服务来解析在集群中运行的其他应用程序的位置。 Self-hosted machines can use the mDNS name resolution component. The Consul name resolution component can be used in any hosting environment, including Kubernetes or self-hosted.

## Example Architecture

Following the above call sequence, suppose you have the applications as described in the [Hello World tutorial](https://github.com/dapr/quickstarts/blob/master/tutorials/hello-world/README.md), where a python app invokes a node.js app. In such a scenario, the python app would be "Service A" , and a Node.js app would be "Service B".

The diagram below shows sequence 1-7 again on a local machine showing the API calls:

<img src="/images/service-invocation-overview-example.png" width=800 />

1. The Node.js app has a Dapr app ID of `nodeapp`. The python app invokes the Node.js app's `neworder` method by POSTing `http://localhost:3500/v1.0/invoke/nodeapp/method/neworder`, which first goes to the python app's local Dapr sidecar.
2. Dapr 使用本地机器运行的名称解析组件(在这种情况下自动运行的 mDNS)，发现 Node.js 应用的位置。
3. Dapr 使用刚刚收到的位置将请求转发到 Node.js 应用的 sidecar。
4. Node.js 应用的 sidecar 将请求转发到 Node.js 应用程序。 The Node.js app performs its business logic, logging the incoming message and then persist the order ID into Redis (not shown in the diagram).
5. Node.js应 用程序通过 Node.js sidecar 向 Python 应用程序发送一个响应。
6. Dapr forwards the response to the Python Dapr sidecar.
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
Want to skip the quickstarts? Not a problem. You can try out the service invocation building block directly in your application to securely communicate with other services. After [Dapr is installed](https://docs.dapr.io/getting-started), you can begin using the service invocation API in the following ways.

Invoke services using:
- **HTTP and gRPC service invocation** (recommended set up method)
  - *HTTP* - Allows you to just add the `dapr-app-id` header and you're ready to get started. Read more on this here, [Invoke Services using HTTP.]({{< ref howto-invoke-discover-services.md >}})
  - *gRPC* - For gRPC based applications, the service invocation API is also available. Run the gRPC server, then invoke services using the Dapr CLI. Read more on this in [Configuring Dapr to use gRPC]({{< ref grpc >}}) and [Invoke services using gRPC]({{< ref howto-invoke-services-grpc.md >}}).
- **Direct call to the API** - In addition to proxying, there's also an option to directly call the service invocation API to invoke a GET endpoint. Just update your address URL to `localhost:<dapr-http-port>` and you'll be able to directly call the API. You can also read more on this in the _Invoke Services using HTTP_ docs linked above under HTTP proxying.
- **SDKs** - If you're using a Dapr SDK, you can directly use service invocation through the SDK. Select the SDK you need and use the Dapr client to invoke a service. Read more on this in [Dapr SDKs]({{< ref sdks.md >}}).


For quick testing, try using the Dapr CLI for service invocation:
- **Dapr CLI command** - Once the Dapr CLI is set up, use `dapr invoke --method <method-name>` command along with the method flag and the method of interest. Read more on this in [Dapr CLI]({{< ref dapr-invoke.md >}}).

## 下一步
- Read the [service invocation API specification]({{< ref service_invocation_api.md >}}). This reference guide for service invocation describes how to invoke methods on other services.
- Understand the [service invocation performance numbers]({{< ref perf-service-invocation.md >}}).
- Take a look at [observability]({{< ref monitoring.md >}}). Here you can dig into Dapr's monitoring tools like tracing, metrics and logging.
- Read up on our [security practices]({{< ref security-concept.md >}}) around mTLS encryption, token authentication, and endpoint authorization.
