---
type: docs
title: "概述"
linkTitle: "Overview"
weight: 100
description: >
  分布式应用程序运行时介绍
---

Dapr 是一个可移植的、事件驱动的运行时，它使任何开发人员能够轻松构建出弹性的、无状态和有状态的应用程序，并可运行在云平台或边缘计算中，它同时也支持多种开发语言和开发框架。

<iframe src="//player.bilibili.com/player.html?aid=586108726&bvid=BV1xz4y167XA&cid=277928385&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>

## 任何语言，任何框架，任何地方

<img src="/images/overview.png" width=1000>

如今，我们正经历着云应用浪潮。 开发人员对 Web + 数据库应用结构（例如经典 3 层设计）非常熟悉，并且使用得手，但对本身能支持分布式的微服务应用结构却感觉很陌生。 成为分布式系统专家很难，并且你也不需要这么做。 开发人员希望专注于业务逻辑，同时希望平台为其提供可伸缩的、弹性的、可维护性和云原生架构的其他功能。

这就是Dapr所要解决的。 Dapr 将构建微服务应用的 *最佳实践* 设计成开放、独立和模块化的方式，让你能够选择的任意开发语言和框架构建可移植应用程序。 每个模块都是完全独立的，您可以采用其中一个或多个或全部来构建你的应用。

此外，Dapr 是和平台无关的，这意味着您可以在本地、Kubernetes 群集或者其它集成 Dapr 的托管环境中运行应用程序。 这使你能够在云平台和边缘计算中运行微服务应用。

使用 Dapr，您可以使用任何语言、任何框架轻松构建微服务应用，并运行在任何地方。

## 云平台和边缘计算的微服务基础模块

<img src="/images/building_blocks.png" width=1000>

在构建微服务应用时，需要考虑很多。 Dapr 在构建微服务应用时为常见功能提供了最佳实践，开发人员可以使用标准方式并部署到任何环境。 它提供分布式系统模块来执行此工作。

每个模块都是完全独立的，这意味着您可以采用其中一个或多个或全部来构建你的应用。 在此 Dapr 的初始版本中，提供了以下基础模块：

| 基础模块                                   | 描述                                                                                                                                                                                                                                                                                                          |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**服务之间互相调用**]({{X18X}})              | 弹性的服务间调用能在远程服务上进行方法调用（包括检索），无论它们是否位于受支持的托管环境中的。                                                                                                                                                                                                                                                             |
| [**状态管理**]({{X21X}})                  | With state management for storing key/value pairs, long running, highly available, stateful services can be easily written alongside stateless services in your application. The state store is pluggable and can include Azure CosmosDB, Azure SQL Server, PostgreSQL, AWS DynamoDB or Redis among others. |
| [**Publish and subscribe**]({{X24X}}) | Publishing events and subscribing to topics | tween services enables event-driven architectures to simplify horizontal scalability and make them | silient to failure. Dapr provides at least once message delivery guarantee.                                                                              |
| [**Resource bindings**]({{X27X}})     | Resource bindings with triggers builds further on event-driven architectures for scale and resiliency by receiving and sending events to and from any external source such as databases, queues, file systems, etc.                                                                                         |
| [**Actors**]({{X30X}})                | A pattern for stateful and stateless objects that make concurrency simple with method and state encapsulation. Dapr provides many capabilities in its actor runtime including concurrency, state, life-cycle management for actor activation/deactivation and timers and reminders to wake-up actors.       |
| [**Observability**]({{X33X}})         | Dapr emit metrics, logs, and traces to debug and monitor both Dapr and user applications. Dapr supports distributed tracing to easily diagnose and serve inter-service calls in production using the W3C Trace Context standard and Open Telemetry to send to different monitoring tools.                   |
| [**Secrets**]({{X36X}})               | Dapr provides secrets management and integrates with public cloud and local secret stores to retrieve the secrets for use in application code.                                                                                                                                                              |

## Sidecar architecture

Dapr exposes its APIs as a sidecar architecture, either as a container or as a process, not requiring the application code to include any Dapr runtime code. This makes integration with Dapr easy from other runtimes, as well as providing separation of the application logic for improved supportability.

## Hosting Environments
Dapr can be hosted in multiple environments, including self hosted for local development or to deploy to a group of VMs, Kubernetes and edge environments such as Azure IoT Edge.

### Self hosted

In self hosted mode Dapr runs as a separate side-car process which your service code can call via HTTP or gRPC. In self hosted mode, you can  also deploy Dapr onto a set of VMs.

<img src="/images/overview-sidecar.png" width=1000>

### Kubernetes hosted

In container hosting environments such as Kubernetes, Dapr runs as a side-car container with the application container in the same pod.

<img src="/images/overview-sidecar-kubernetes.png" width=1000>

## Developer language SDKs and frameworks

To make using Dapr more natural for different languages, it also includes language specific SDKs for Go, Java, JavaScript, .NET and Python. These SDKs expose the functionality in the Dapr building blocks, such as saving state, publishing an event or creating an actor, through a typed, language API rather than calling the http/gRPC API. This enables you to write a combination of stateless and stateful functions and actors all in the language of their choice. And because these SDKs share the Dapr runtime, you get cross-language actor and functions support.

### SDKs

- **[C++ SDK](https://github.com/dapr/cpp-sdk)**
- **[Go SDK](https://github.com/dapr/go-sdk)**
- **[Java SDK](https://github.com/dapr/java-sdk)**
- **[Javascript SDK](https://github.com/dapr/js-sdk)**
- **[Python SDK](https://github.com/dapr/python-sdk)**
- **[RUST SDK](https://github.com/dapr/rust-sdk)**
- **[.NET SDK](https://github.com/dapr/dotnet-sdk)**

> Note: Dapr is language agnostic and provides a [RESTful HTTP API]({{< ref api >}}) in addition to the protobuf clients.

### Developer frameworks
Dapr can be used from  any developer framework. Here are some that have been integrated with Dapr.

#### Web
 In the Dapr [.NET SDK](https://github.com/dapr/dotnet-sdk) you can find ASP.NET Core integration, which brings stateful routing controllers that respond to pub/sub events from other services.

 In the Dapr [Java SDK](https://github.com/dapr/java-sdk) you can find [Spring Boot](https://spring.io/) integration.

Dapr integrates easily with Python [Flask](https://pypi.org/project/Flask/) and node [Express](http://expressjs.com/). See examples in the [Dapr quickstarts](https://github.com/dapr/quickstarts).

#### Actors
Dapr SDKs support for [virtual actors]({{< ref actors >}}) which are stateful objects that make concurrency simple, have method and state encapsulation, and are designed for scalable, distributed applications.

#### Azure Functions
Dapr integrates with the Azure Functions runtime via an extension that lets a function seamlessly interact with Dapr. Azure Functions provides an event-driven programming model and Dapr provides cloud-native building blocks. With this  extension, you can bring both together for serverless and event-driven apps. For more information read [Azure Functions extension for Dapr](https://cloudblogs.microsoft.com/opensource/2020/07/01/announcing-azure-functions-extension-for-dapr/) and visit the [Azure Functions extension](https://github.com/dapr/azure-functions-extension) repo to try out the samples.

#### Dapr workflows
To enable developers to easily build workflow applications that use Dapr’s capabilities including diagnostics and multi-language support, you can use Dapr workflows. Dapr integrates with workflow engines such as Logic Apps.  For more information read [cloud-native workflows using Dapr and Logic Apps](https://cloudblogs.microsoft.com/opensource/2020/05/26/announcing-cloud-native-workflows-dapr-logic-apps/) and visit the [Dapr workflow](https://github.com/dapr/workflows) repo to try out the samples.

## Designed for Operations
Dapr is designed for [operations](/operations/). The [services dashboard](https://github.com/dapr/dashboard), installed via the Dapr CLI, provides a web-based UI enabling you to see information, view logs and more for the Dapr sidecars.

The [monitoring tools support](/operations/monitoring/) provides deeper visibility into the Dapr system services and side-cars and the [observability capabilities]({{X75X}}) of Dapr provide insights into your application such as tracing and metrics.

## Run anywhere

### Running Dapr on a local developer machine in self hosted mode

Dapr can be configured to run on your local developer machine in [self-hosted mode]({{< ref self-hosted >}}). Each running service has a Dapr runtime process (or sidecar) which is configured to use state stores, pub/sub, binding components and the other building blocks.

You can use the [Dapr CLI](https://github.com/dapr/cli#launch-dapr-and-your-app) to run a Dapr enabled application on your local machine. Try this out with the [getting started samples]({{< ref getting-started >}}).

<img src="/images/overview_standalone.png" width=800>

### Running Dapr in Kubernetes mode

Dapr can be configured to run on any [Kubernetes cluster]({{< ref kubernetes >}}). In Kubernetes the `dapr-sidecar-injector` and `dapr-operator` services provide first class integration to launch Dapr as a sidecar container in the same pod as the service container and provide notifications of Dapr component updates provisioned into the cluster.

The `dapr-sentry` service is a certificate authority that enables mutual TLS between Dapr sidecar instances for secure data encryption. For more information on the `Sentry` service read the [security overview]({{< ref "security-concept.md#dapr-to-dapr-communication" >}})

<img src="/images/overview_kubernetes.png" width=800>

Deploying and running a Dapr enabled application into your Kubernetes cluster is as simple as adding a few annotations to the deployment schemes. You can see some examples [here](https://github.com/dapr/quickstarts/tree/master/hello-kubernetes/deploy) in the Kubernetes getting started sample. Try this out with the [Kubernetes quickstart](https://github.com/dapr/quickstarts/tree/master/hello-kubernetes).
