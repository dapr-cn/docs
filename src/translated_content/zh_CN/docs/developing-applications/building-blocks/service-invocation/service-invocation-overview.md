---
type: docs
title: "服务调用概述"
linkTitle: "概述"
weight: 10
description: "服务调用API模块的概述"
---

通过服务调用，您的应用程序可以使用标准的[gRPC](https://grpc.io)或[HTTP](https://www.w3.org/Protocols/)协议可靠且安全地与其他应用程序进行通信。

在许多基于微服务的应用程序中，多个服务需要能够相互通信。这种服务间通信要求应用程序开发人员处理以下问题：

- **服务发现。** 如何找到我的不同服务？
- **标准化服务间的API调用。** 如何在服务之间调用方法？
- **安全的服务间通信。** 如何通过加密安全地调用其他服务并对方法应用访问控制？
- **缓解请求超时或失败。** 如何处理重试和瞬态错误？
- **实现可观测性和追踪。** 如何使用追踪查看带有指标的调用图以诊断生产中的问题？

## 服务调用API

Dapr通过提供一个类似反向代理的服务调用API来解决这些挑战，该API内置了服务发现，并利用了分布式追踪、指标、错误处理、加密等功能。

Dapr采用sidecar架构。要使用Dapr调用应用程序：
- 您在Dapr实例上使用`invoke` API。
- 每个应用程序与其自己的Dapr实例通信。
- Dapr实例相互发现并通信。

[以下概述视频和演示](https://www.youtube.com/live/0y7ne6teHT4?si=mtLMrajE5wVXJYz8&t=3598)展示了Dapr服务调用的工作原理。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/0y7ne6teHT4?si=Flsd8PRlF8nYu693&amp;start=3598" title="YouTube视频播放器" style="padding-bottom:25px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

下图概述了Dapr的服务调用在两个集成Dapr的应用程序之间的工作原理。

<img src="/images/service-invocation-overview.png" width=800 alt="显示服务调用步骤的图示">

1. 服务A发起一个HTTP或gRPC调用，目标是服务B。调用发送到本地Dapr sidecar。
2. Dapr使用正在运行的[名称解析组件]({{< ref supported-name-resolution >}})在给定的[托管平台]({{< ref "hosting" >}})上发现服务B的位置。
3. Dapr将消息转发到服务B的Dapr sidecar
   - **注意**：所有Dapr sidecar之间的调用都通过gRPC进行以提高性能。只有服务与Dapr sidecar之间的调用可以是HTTP或gRPC。
4. 服务B的Dapr sidecar将请求转发到服务B上的指定端点（或方法）。服务B然后运行其业务逻辑代码。
5. 服务B向服务A发送响应。响应发送到服务B的sidecar。
6. Dapr将响应转发到服务A的Dapr sidecar。
7. 服务A接收响应。

您还可以使用服务调用API调用非Dapr HTTP端点。例如，您可能只在整个应用程序的一部分中使用Dapr，可能无法访问代码以迁移现有应用程序以使用Dapr，或者只是需要调用外部HTTP服务。阅读["如何：使用HTTP调用非Dapr端点"]({{< ref howto-invoke-non-dapr-endpoints.md >}})以获取更多信息。

## 功能
服务调用提供了多种功能，使您可以轻松地在应用程序之间调用方法或调用外部HTTP端点。

### HTTP和gRPC服务调用
- **HTTP**：如果您已经在应用程序中使用HTTP协议，使用Dapr HTTP头可能是最简单的入门方式。您无需更改现有的端点URL；只需添加`dapr-app-id`头即可开始。有关更多信息，请参阅[使用HTTP调用服务]({{< ref howto-invoke-discover-services.md >}})。
- **gRPC**：Dapr允许用户保留自己的proto服务并以gRPC的方式工作。这意味着您可以使用服务调用来调用现有的gRPC应用程序，而无需包含任何Dapr SDK或自定义gRPC服务。有关更多信息，请参阅[Dapr和gRPC的操作教程]({{< ref howto-invoke-services-grpc.md >}})。

### 服务到服务的安全性

通过Dapr Sentry服务，所有Dapr应用程序之间的调用都可以通过托管平台上的相互（mTLS）认证来实现安全，包括自动证书轮换。

有关更多信息，请阅读[服务到服务的安全性]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}})文章。

### 包括重试的弹性

在调用失败和瞬态错误的情况下，服务调用提供了一种弹性功能，可以在回退时间段内自动重试。要了解更多信息，请参阅[弹性文章]({{< ref resiliency-overview.md >}})。

### 具有可观测性的追踪和指标

默认情况下，所有应用程序之间的调用都会被追踪，并收集指标以提供应用程序的洞察和诊断。这在生产场景中特别重要，提供了服务之间调用的调用图和指标。有关更多信息，请阅读[可观测性]({{< ref observability-concept.md >}})。

### 访问控制

通过访问策略，应用程序可以控制：

- 哪些应用程序被允许调用它们。
- 应用程序被授权做什么。

例如，您可以限制包含人员信息的敏感应用程序不被未授权的应用程序访问。结合服务到服务的安全通信，您可以提供软多租户部署。

有关更多信息，请阅读[服务调用的访问控制允许列表]({{< ref invoke-allowlist.md >}})文章。

### 命名空间范围

您可以将应用程序限定到命名空间以进行部署和安全，并在部署到不同命名空间的服务之间进行调用。有关更多信息，请阅读[跨命名空间的服务调用]({{< ref "service-invocation-namespaces.md" >}})文章。

### 使用mDNS的轮询负载均衡

Dapr通过mDNS协议提供服务调用请求的轮询负载均衡，例如在单台机器或多台联网的物理机器上。

下图显示了其工作原理的示例。如果您有一个应用程序实例，应用程序ID为`FrontEnd`，以及三个应用程序实例，应用程序ID为`Cart`，并且您从`FrontEnd`应用程序调用`Cart`应用程序，Dapr在三个实例之间进行轮询。这些实例可以在同一台机器上或不同的机器上。

<img src="/images/service-invocation-mdns-round-robin.png" width=600 alt="显示服务调用步骤的图示" style="padding-bottom:25px;">

**注意**：应用程序ID在_应用程序_中是唯一的，而不是应用程序实例。无论该应用程序存在多少个实例（由于扩展），它们都将共享相同的应用程序ID。

### 可交换的服务发现

Dapr可以在多种[托管平台]({{< ref hosting >}})上运行。为了启用可交换的服务发现，Dapr使用[名称解析组件]({{< ref supported-name-resolution >}})。例如，Kubernetes名称解析组件使用Kubernetes DNS服务来解析在集群中运行的其他应用程序的位置。

自托管机器可以使用mDNS名称解析组件。作为替代方案，您可以使用SQLite名称解析组件在单节点环境中运行Dapr，并用于本地开发场景。属于集群的Dapr sidecar将其信息存储在本地机器上的SQLite数据库中。

Consul名称解析组件特别适合多机部署，并且可以在任何托管环境中使用，包括Kubernetes、多台虚拟机或自托管。

### HTTP服务调用的流式处理

您可以在HTTP服务调用中将数据作为流处理。这可以在使用Dapr通过HTTP调用另一个服务时提供性能和内存利用率的改进，尤其是在请求或响应体较大的情况下。

下图演示了数据流的六个步骤。

<img src="/images/service-invocation-simple.webp" width=600 alt="显示表中描述的服务调用步骤的图示" />

1. 请求："应用程序A"到"Dapr sidecar A"
2. 请求："Dapr sidecar A"到"Dapr sidecar B"
3. 请求："Dapr sidecar B"到"应用程序B"
4. 响应："应用程序B"到"Dapr sidecar B"
5. 响应："Dapr sidecar B"到"Dapr sidecar A"
6. 响应："Dapr sidecar A"到"应用程序A"

## 示例架构

按照上述调用顺序，假设您有如[Hello World教程](https://github.com/dapr/quickstarts/blob/master/tutorials/hello-world/README.md)中描述的应用程序，其中一个Python应用程序调用一个Node.js应用程序。在这种情况下，Python应用程序将是"服务A"，Node.js应用程序将是"服务B"。

下图再次显示了本地机器上的1-7序列，显示了API调用：

<img src="/images/service-invocation-overview-example.png" width=800 style="padding-bottom:25px;">

1. Node.js应用程序的Dapr应用程序ID为`nodeapp`。Python应用程序通过POST `http://localhost:3500/v1.0/invoke/nodeapp/method/neworder`调用Node.js应用程序的`neworder`方法，该请求首先发送到Python应用程序的本地Dapr sidecar。
2. Dapr使用名称解析组件（在这种情况下是自托管时的mDNS）发现Node.js应用程序的位置，该组件在您的本地机器上运行。
3. Dapr使用刚刚接收到的位置将请求转发到Node.js应用程序的sidecar。
4. Node.js应用程序的sidecar将请求转发到Node.js应用程序。Node.js应用程序执行其业务逻辑，记录传入消息，然后将订单ID持久化到Redis（图中未显示）。
5. Node.js应用程序通过Node.js sidecar向Python应用程序发送响应。
6. Dapr将响应转发到Python Dapr sidecar。
7. Python应用程序接收响应。

## 试用服务调用 
### 快速入门和教程
Dapr文档包含多个利用服务调用构建模块的快速入门，适用于不同的示例架构。为了直观地理解服务调用API及其功能，我们建议从我们的快速入门开始：

| 快速入门/教程 | 描述 |
| ------------------- | ----------- |
| [服务调用快速入门]({{< ref serviceinvocation-quickstart.md >}}) | 这个快速入门让您直接与服务调用构建模块进行交互。 |
| [Hello World教程](https://github.com/dapr/quickstarts/blob/master/tutorials/hello-world/README.md) | 本教程展示了如何在本地机器上运行服务调用和状态管理构建模块。 |
| [Hello World Kubernetes教程](https://github.com/dapr/quickstarts/blob/master/tutorials/hello-kubernetes/README.md) | 本教程演示了如何在Kubernetes中使用Dapr，并涵盖了服务调用和状态管理构建模块。 |

### 直接在您的应用程序中开始使用服务调用
想跳过快速入门？没问题。您可以直接在应用程序中试用服务调用构建模块，以安全地与其他服务通信。在[Dapr安装完成](https://docs.dapr.io/getting-started)后，您可以通过以下方式开始使用服务调用API。

使用以下方式调用服务：
- **HTTP和gRPC服务调用**（推荐的设置方法）
  - *HTTP* - 只需添加`dapr-app-id`头即可开始。有关更多信息，请阅读[使用HTTP调用服务]({{< ref howto-invoke-discover-services.md >}})。
  - *gRPC* - 对于基于gRPC的应用程序，服务调用API也可用。运行gRPC服务器，然后使用Dapr CLI调用服务。有关更多信息，请阅读[配置Dapr以使用gRPC]({{< ref grpc >}})和[使用gRPC调用服务]({{< ref howto-invoke-services-grpc.md >}})。
- **直接调用API** - 除了代理，还有一个选项可以直接调用服务调用API以调用GET端点。只需将您的地址URL更新为`localhost:<dapr-http-port>`，您就可以直接调用API。您还可以在上面链接的HTTP代理文档中阅读更多关于此的信息。
- **SDKs** - 如果您正在使用Dapr SDK，您可以直接通过SDK使用服务调用。选择您需要的SDK，并使用Dapr客户端调用服务。有关更多信息，请阅读[Dapr SDKs]({{< ref sdks.md >}})。

为了快速测试，尝试使用Dapr CLI进行服务调用：
- **Dapr CLI命令** - 一旦设置了Dapr CLI，使用`dapr invoke --method <method-name>`命令以及方法标志和感兴趣的方法。有关更多信息，请阅读[Dapr CLI]({{< ref dapr-invoke.md >}})。

## 下一步
- 阅读[服务调用API规范]({{< ref service_invocation_api.md >}})。此服务调用参考指南描述了如何调用其他服务上的方法。
- 了解[服务调用性能数据]({{< ref perf-service-invocation.md >}})。
- 查看[可观测性]({{< ref observability >}})。在这里，您可以深入了解Dapr的监控工具，如追踪、指标和日志记录。
- 阅读我们的[安全实践]({{< ref security-concept.md >}})，了解mTLS加密、令牌认证和端点授权。