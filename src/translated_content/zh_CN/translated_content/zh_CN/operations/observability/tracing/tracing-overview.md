---
type: docs
title: "Distributed tracing overview"
linkTitle: "概述"
weight: 10
description: "Overview on using tracing to get visibility into your application"
---

Dapr 使用 Open Telemetry (OTEL) 和 Zipkin 协议进行分布式跟踪。 OTEL 是行业标准，推荐使用的跟踪协议。

Most observability tools support OTEL, including:
- [Google Cloud Operations](https://cloud.google.com/products/operations)
- [AWS X-ray](https://aws.amazon.com/xray/)
- [New Relic](https://newrelic.com)
- [Azure Monitor](https://azure.microsoft.com/services/monitor/)
- [Datadog](https://www.datadoghq.com)
- [Zipkin](https://zipkin.io/)
- [Jaeger](https://www.jaegertracing.io/)
- [SignalFX](https://www.signalfx.com/)

The following diagram demonstrates how Dapr (using OTEL and Zipkin protocols) integrates with multiple observability tools.

<img src="/images/observability-tracing.png" width=1000 alt="使用 Dapr 进行分布式跟踪">

## Scenarios

使用跟踪与服务调用和 Pub/sub（发布/订阅）APIs. 您可以在使用这些 API 的服务之间传递跟踪上下文。 您需要了解如何使用跟踪的两种情况：

 1. Dapr生成跟踪上下文，并将跟踪上下文传播到另一个服务。
 1. 您生成跟踪上下文，Dapr将跟踪上下文传播到一个服务。

### Scenario 1: Dapr generates trace context headers

#### 传播连续的服务调用

Dapr负责创建跟踪头。 然而，当存在两个以上的服务时，您需要负责在它们之间传播跟踪标头。 让我们用示例来了解一下这些场景：

##### Single service invocation call

For example, `service A -> service B`.

Dapr generates the trace headers in `service A`, which are then propagated from `service A` to `service B`. No further propagation is needed.

##### Multiple sequential service invocation calls

For example, `service A -> service B -> propagate trace headers to -> service C` and so on to further Dapr-enabled services.

Dapr generates the trace headers at the beginning of the request in `service A`, which are then propagated to `service B`. You are now responsible for taking the headers and propagating them to `service C`, since this is specific to your application.

In other words, if the app is calling to Dapr and wants to trace with an existing trace header (span), it must always propagate to Dapr (from `service B` to `service C`, in this example). Dapr 始终将 trace span 传播到应用程序。

{{% alert title="Note" color="primary" %}}
No helper methods are exposed in Dapr SDKs to propagate and retrieve trace context. 您需要使用HTTP/gRPC客户端通过HTTP标头和gRPC元数据传播和检索跟踪标头。
{{% /alert %}}

##### Request is from external endpoint

For example, `from a gateway service to a Dapr-enabled service A`.

An external gateway ingress calls Dapr, which generates the trace headers and calls `service A`. `Service A` then calls `service B` and further Dapr-enabled services.

You must propagate the headers from `service A` to `service B`. For example: `Ingress -> service A -> propagate trace headers -> service B`. This is similar to [case 2]({{< ref "tracing-overview.md#multiple-sequential-service-invocation-calls" >}}).

##### Pub/sub messages

Dapr generates the trace headers in the published message topic. 这些追踪标头会传播到监听该主题的任何服务。

#### 传播多个不同的服务调用

In the following scenarios, Dapr does some of the work for you, with you then creating or propagating trace headers.

##### 从单个服务到不同服务的多次服务调用

When you are calling multiple services from a single service, you need to propagate the trace headers. For example:

```
service A -> service B
[ .. some code logic ..]
service A -> service C
[ .. some code logic ..]
service A -> service D
[ .. some code logic ..]
```

本例中：
1. When `service A` first calls `service B`, Dapr generates the trace headers in `service A`.
1. The trace headers in `service A` are propagated to `service B`.
1. These trace headers are returned in the response from `service B` as part of response headers.
1. You then need to propagate the returned trace context to the next services, like `service C` and `service D`, as Dapr does not know you want to reuse the same header.

### Scenario 2: You generate your own trace context headers from non-Daprized applications

生成自己的跟踪上下文标头是比较不常见的，通常在调用 Dapr 时不需要。

However, there are scenarios where you could specifically choose to add W3C trace headers into a service call. For example, you have an existing application that does not use Dapr. 在这种情况下，Dapr仍然会为您传播跟踪上下文标头。

如果您决定自己生成跟踪标头，有三种方法可以实现：

1. Standard OpenTelemetry SDK

   您可以使用行业标准的 [OpenTelemetry SDKs](https://opentelemetry.io/docs/instrumentation/) 生成跟踪头，并将这些跟踪头传递到启用的Dapr服务。 _This is the preferred method_.

1. Vendor SDK

   您可以使用供应商提供的 SDK 来生成 W3C 跟踪头，并将它们传递给启用了 Dapr 的服务。

1. W3C跟踪上下文

   您可以手工制作一个跟踪上下文，遵循 [W3C 跟踪上下文规范](https://www.w3.org/TR/trace-context/) 并将它们传递给启用 Dapr 的服务。

   Read [the trace context overview]({{< ref w3c-tracing-overview >}}) for more background and examples on W3C trace context and headers.

## 相关链接

- [可观测性概念]({{< ref observability-concept.md >}})
- [用于分布式跟踪的 W3C 跟踪上下文]({{< ref w3c-tracing-overview >}})
- [W3C 跟踪上下文规范](https://www.w3.org/TR/trace-context/)
- [可观测性快速入门](https://github.com/dapr/quickstarts/tree/master/tutorials/observability)
