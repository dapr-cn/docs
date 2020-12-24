---
type: docs
title: "服务调用概述"
linkTitle: "Overview"
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

Dapr 采用一种边车（Sidecar）、去中心化的架构。 要使用 Dapr 来调用应用程序，请在任意 Dapr 实例上使用 `invoke` 这个API。 Sidecar 编程模型鼓励每个应用程序与自己的 Dapr 实例对话。 Dapr 实例会相互发现并进行通信。

### 调用逻辑

下图是 Dapr的服务调用如何工作的总览图

<img src="/images/service-invocation-overview.png" width=800 alt="Diagram showing the steps of service invocation">

1. Service A makes an http/gRPC call targeting Service B. The call goes to the local Dapr sidecar.
2. Dapr discovers Service B's location using the [name resolution component](https://github.com/dapr/components-contrib/tree/master/nameresolution) which is running on the given [hosting platform]({{< ref "hosting" >}}).
3. Dapr forwards the message to Service B's Dapr sidecar

    **Note**: All calls between Dapr sidecars go over gRPC for performance. Only calls between services and Dapr sidecars can be either HTTP or gRPC

4. Service B's Dapr sidecar forwards the request to the specified endpoint (or method) on Service B.  Service B then runs its business logic code.
5. Service B sends a response to Service A.  The response goes to Service B's sidecar.
6. Dapr forwards the response to Service A's Dapr sidecar.
7. Service A receives the response.

## Features
Service invocation provides several features to make it easy for you to call methods on remote applications.

### Service invocation API

The API for Pservice invocation can be found in the [spec repo]({{< ref service_invocation_api.md >}}).

### Namespaces scoping

Service invocation supports calls across namespaces. On all supported hosting platforms, Dapr app IDs conform to a valid FQDN format that includes the target namespace.

For example, the following string contains the app ID `nodeapp` in addition to the namespace the app runs in `production`.

```
localhost:3500/v1.0/invoke/nodeapp.production/method/neworder
```

This is especially useful in cross namespace calls in a Kubernetes cluster. Watch this video for a demo on how to use namespaces with service invocation. <iframe width="560" height="315" src="https://www.youtube.com/embed/LYYV_jouEuA?start=497" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen mark="crwd-mark"></iframe>

### Retries

Service invocation performs automatic retries with backoff time periods in the event of call failures and transient errors.

Errors that cause retries are:

* Network errors including endpoint unavailability and refused connections
* Authentication errors due to a renewing certificate on the calling/callee Dapr sidecars

Per call retries are performed with a backoff interval of 1 second up to a threshold of 3 times. Connection establishment via gRPC to the target sidecar has a timeout of 5 seconds.

### Service-to-service security

All calls between Dapr applications can be made secure with mutual (mTLS) authentication on hosted platforms, including automatic certificate rollover, via the Dapr Sentry service. The diagram below shows this for self hosted applications.

For more information read the [service-to-service security]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}}) article.

<img src="/images/security-mTLS-sentry-selfhosted.png" width=800>

### Service access security

Applications can control which other applications are allowed to call them and what they are authorized to do via access policies. This enables you to restrict sensitive applications, that say have personnel information, from being accessed by unauthorized applications, and combined with service-to-service secure communication, provides for soft multi-tenancy deployments.

For more information read the [access control allow lists for service invocation]({{< ref invoke-allowlist.md >}}) article.

### Observability

By default, all calls between applications are traced and metrics are gathered to provide insights and diagnostics for applications, which is especially important in production scenarios.

For more information read the [observability]({{< ref observability-concept.md >}}) article.

### Pluggable service discovery

Dapr can run on any [hosting platform]({{< ref hosting >}}). For the supported hosting platforms this means they have a [name resolution component](https://github.com/dapr/components-contrib/tree/master/nameresolution) developed for them that enables service discovery. For example, the Kubernetes name resolution component uses the Kubernetes DNS service to resolve the location of other applications running in the cluster.

## Example
Following the above call sequence, suppose you have the applications as described in the [hello world quickstart](https://github.com/dapr/quickstarts/blob/master/hello-world/README.md), where a python app invokes a node.js app. In such a scenario, the python app would be "Service A" , and a Node.js app would be "Service B".

The diagram below shows sequence 1-7 again on a local machine showing the API call:

<img src="/images/service-invocation-overview-example.png" width=800>

1. The Node.js app has a Dapr app ID of `nodeapp`. The python app invokes the Node.js app's `neworder` method by POSTing `http://localhost:3500/v1.0/invoke/nodeapp/method/neworder`, which first goes to the python app's local Dapr sidecar.
2. Dapr discovers the Node.js app's location using name resolution component (in this case mDNS while self-hosted) which runs on your local machine.
3. Dapr forwards the request to the Node.js app's sidecar using the location it just received.
4. The Node.js app's sidecar forwards the request to the Node.js app. The Node.js app performs its business logic, logging the incoming message and then persist the order ID into Redis (not shown in the diagram)
5. The Node.js app sends a response to the Python app through the Node.js sidecar.
6. Dapr forwards the response to the Python Dapr sidecar
7. The Python app receives the resposne.

## Next steps

* Follow these guide on:
    * [How-to: Get started with HTTP service invocation]({{< ref howto-invoke-discover-services.md >}})
    * [How-to: Get started with Dapr and gRPC]({{< ref grpc >}})
* Try out the [hello world quickstart](https://github.com/dapr/quickstarts/blob/master/hello-world/README.md) which shows how to use HTTP service invocation or visit the samples in each of the [Dapr SDKs]({{< ref sdks >}})
* Read the [service invocation API specification]({{< ref service_invocation_api.md >}})
* See the [service invocation performance]({{< ref perf-service-invocation.md >}}) numbers
