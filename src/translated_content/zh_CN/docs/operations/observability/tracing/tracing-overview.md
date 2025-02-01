---
type: docs
title: "分布式追踪概述"
linkTitle: "概述"
weight: 10
description: "使用追踪技术获取应用程序可见性的概述"
---

Dapr 通过 Open Telemetry (OTEL) 和 Zipkin 协议来实现分布式追踪。OTEL 是行业标准，并且是推荐使用的追踪协议。

大多数可观测性工具支持 OTEL，包括：
- [Google Cloud Operations](https://cloud.google.com/products/operations)
- [AWS X-ray](https://aws.amazon.com/xray/)
- [New Relic](https://newrelic.com)
- [Azure Monitor](https://azure.microsoft.com/services/monitor/)
- [Datadog](https://www.datadoghq.com)
- [Zipkin](https://zipkin.io/)
- [Jaeger](https://www.jaegertracing.io/)
- [SignalFX](https://www.signalfx.com/)

下图展示了 Dapr（使用 OTEL 和 Zipkin 协议）如何与多个可观测性工具集成。

<img src="/images/observability-tracing.png" width=1000 alt="Dapr 的分布式追踪">

## 场景

追踪用于服务调用和发布/订阅（pubsub）API。您可以在使用这些 API 的服务之间传递追踪上下文。追踪的使用有两种场景：

1. Dapr 生成追踪上下文，您将追踪上下文传递到另一个服务。
2. 您生成追踪上下文，Dapr 将追踪上下文传递到服务。

### 场景 1：Dapr 生成追踪上下文头

#### 顺序服务调用的传递

Dapr 负责创建追踪头。然而，当有两个以上的服务时，您需要负责在它们之间传递追踪头。让我们通过示例来了解这些场景：

##### 单一服务调用

例如，`服务 A -> 服务 B`。

Dapr 在 `服务 A` 中生成追踪头，然后从 `服务 A` 传递到 `服务 B`。不需要进一步的传递。

##### 多个顺序服务调用

例如，`服务 A -> 服务 B -> 传递追踪头到 -> 服务 C`，以及其他启用 Dapr 的服务。

Dapr 在请求开始时在 `服务 A` 中生成追踪头，然后传递到 `服务 B`。您现在需要负责获取头并将其传递到 `服务 C`，因为这与您的应用程序特定相关。

换句话说，如果应用程序调用 Dapr 并希望使用现有的追踪头（span）进行追踪，它必须始终传递到 Dapr（在此示例中，从 `服务 B` 到 `服务 C`）。Dapr 始终将追踪 span 传递到应用程序。

{{% alert title="注意" color="primary" %}}
Dapr SDK 中没有公开的辅助方法来传递和检索追踪上下文。您需要使用 HTTP/gRPC 客户端通过 HTTP 头和 gRPC 元数据传递和检索追踪头。
{{% /alert %}}

##### 请求来自外部端点

例如，`从网关服务到启用 Dapr 的服务 A`。

外部网关入口调用 Dapr，Dapr 生成追踪头并调用 `服务 A`。`服务 A` 然后调用 `服务 B` 和其他启用 Dapr 的服务。

您必须从 `服务 A` 传递头到 `服务 B`。例如：`入口 -> 服务 A -> 传递追踪头 -> 服务 B`。这类似于[案例 2]({{< ref "tracing-overview.md#multiple-sequential-service-invocation-calls" >}})。

##### 发布/订阅消息

Dapr 在发布的消息主题中生成追踪头。对于 `rawPayload` 消息，可以指定 `traceparent` 头以传递追踪信息。这些追踪头会传递到任何监听该主题的服务。

#### 多个不同服务调用的传递

在以下场景中，Dapr 为您完成了一些工作，您需要创建或传递追踪头。

##### 从单个服务调用多个不同的服务

当您从单个服务调用多个服务时，您需要传递追踪头。例如：

```
服务 A -> 服务 B
[ .. 一些代码逻辑 ..]
服务 A -> 服务 C
[ .. 一些代码逻辑 ..]
服务 A -> 服务 D
[ .. 一些代码逻辑 ..]
```

在这种情况下：
1. 当 `服务 A` 首次调用 `服务 B` 时，Dapr 在 `服务 A` 中生成追踪头。
1. `服务 A` 中的追踪头被传递到 `服务 B`。
1. 这些追踪头作为响应头的一部分在 `服务 B` 的响应中返回。
1. 然后，您需要将返回的追踪上下文传递到下一个服务，如 `服务 C` 和 `服务 D`，因为 Dapr 不知道您想要重用相同的头。

### 场景 2：您从非 Dapr 化应用程序生成自己的追踪上下文头

生成您自己的追踪上下文头较为少见，并且在调用 Dapr 时通常不需要。

然而，在某些场景中，您可能会特别选择在服务调用中添加 W3C 追踪头。例如，您有一个不使用 Dapr 的现有应用程序。在这种情况下，Dapr 仍然为您传递追踪上下文头。

如果您决定自己生成追踪头，可以通过三种方式完成：

1. 标准 OpenTelemetry SDK

   您可以使用行业标准的 [OpenTelemetry SDKs](https://opentelemetry.io/docs/instrumentation/) 生成追踪头，并将这些追踪头传递到启用 Dapr 的服务。_这是首选方法_。

1. 供应商 SDK

   您可以使用提供生成 W3C 追踪头的方法的供应商 SDK，并将其传递到启用 Dapr 的服务。

1. W3C 追踪上下文

   您可以根据 [W3C 追踪上下文规范](https://www.w3.org/TR/trace-context/) 手工制作追踪上下文，并将其传递到启用 Dapr 的服务。

   阅读 [追踪上下文概述]({{< ref w3c-tracing-overview >}}) 以获取有关 W3C 追踪上下文和头的更多背景和示例。

## 相关链接

- [可观测性概念]({{< ref observability-concept.md >}})
- [用于分布式追踪的 W3C 追踪上下文]({{< ref w3c-tracing-overview >}})
- [W3C 追踪上下文规范](https://www.w3.org/TR/trace-context/)
- [可观测性快速入门](https://github.com/dapr/quickstarts/tree/master/tutorials/observability)
