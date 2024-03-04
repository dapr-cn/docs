---
type: docs
title: "W3C trace context overview"
linkTitle: "W3C跟踪上下文"
weight: 20
description: Background and scenarios for using W3C tracing context and headers with Dapr
---

Dapr 使用 [Open Telemetry 协议](https://opentelemetry.io/)，而后者又使用 [W3C 跟踪上下文](https://www.w3.org/TR/trace-context/) 用于服务调用和发布/订阅消息传递的分布式跟踪。 Dapr 生成并传播跟踪上下文信息，这些信息可以发送到可观测性工具进行可视化和查询。

## 背景

分布式跟踪是一种由跟踪工具实现的方法，用于跟踪、分析和调试跨多个软件组件的事务。

Typically, a distributed trace traverses more than one service, which requires it to be uniquely identifiable. **Trace context propagation** passes along this unique identification.

In the past, trace context propagation was implemented individually by each different tracing vendor. 在多供应商环境中，这会导致互操作性问题，例如：

- Traces collected by different tracing vendors can't be correlated, as there is no shared unique identifier.
- Traces crossing boundaries between different tracing vendors can't be propagated, as there is no forwarded, uniformly agreed set of identification.
- 供应商特定的元数据可能会被中介丢弃。
- Cloud platform vendors, intermediaries, and service providers cannot guarantee to support trace context propagation, as there is no standard to follow.

Previously, most applications were monitored by a single tracing vendor and stayed within the boundaries of a single platform provider, so these problems didn't have a significant impact.

如今，越来越多的应用程序被分发到并使用多个中间件服务和云平台。 This transformation of modern applications requires a distributed tracing context propagation standard.

The [W3C trace context specification](https://www.w3.org/TR/trace-context/) defines a universally agreed-upon format for the exchange of trace context propagation data (referred to as trace context). Trace context solves the above problems by providing:

- A unique identifier for individual traces and requests, allowing trace data of multiple providers to be linked together.
- An agreed-upon mechanism to forward vendor-specific trace data and avoid broken traces when multiple tracing tools participate in a single transaction.
- An industry standard that intermediaries, platforms, and hardware providers can support.

This unified approach for propagating trace data improves visibility into the behavior of distributed applications, facilitating problem and performance analysis.

## W3C trace context and headers format

### W3C跟踪上下文

Dapr 使用标准的 W3C 跟踪上下文标头。

- 对于HTTP请求，Dapr使用 `traceparent` header。
- 对于 gRPC 请求，Dapr 使用 `grpc-trace-bin` headers。

当请求到达时，如果没有 trace ID ，Dapr 将创建一个新的 trace ID。 否则，它将沿调用链传递 trace ID。

### W3C 跟踪标头
这些是 Dapr 为 HTTP 和 gRPC 生成和传播的特定跟踪上下文标头。

{{< tabs "HTTP" "gRPC" >}}
 <!-- HTTP -->
{{% codetab %}}

Copy these headers when propagating a trace context header from an HTTP response to an HTTP request:

**Traceparent 标头**

The traceparent header represents the incoming request in a tracing system in a common format, understood by all vendors:

```
traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
```

[Learn more about the traceparent fields details](https://www.w3.org/TR/trace-context/#traceparent-header).

**Tracestate 标头**

Tracestate 标头包含特定于供应商格式的父级（parent）。

```
tracestate: congo=t61rcWkgMzE
```

[Learn more about the tracestate fields details](https://www.w3.org/TR/trace-context/#tracestate-header).

{{% /codetab %}}


 <!-- gRPC -->
{{% codetab %}}

在 gRPC API 调用中，跟踪上下文通过 `grpc-trace-bin` header 传递。

{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Learn more about distributed tracing in Dapr]({{< ref tracing-overview.md >}})
- [W3C 跟踪上下文规范](https://www.w3.org/TR/trace-context/)
