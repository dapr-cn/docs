---
type: docs
title: "W3C 跟踪上下文概述"
linkTitle: "W3C 跟踪上下文"
weight: 20
description: 了解如何在 Dapr 中使用 W3C 跟踪上下文和头信息进行分布式跟踪
---

Dapr 采用 [Open Telemetry 协议](https://opentelemetry.io/)，该协议利用 [W3C 跟踪上下文](https://www.w3.org/TR/trace-context/) 来实现服务调用和发布/订阅消息的分布式跟踪。Dapr 生成并传播跟踪上下文信息，可以将其发送到可观测性工具进行可视化和查询。

## 背景

分布式跟踪是一种由跟踪工具实现的方法，用于跟踪、分析和调试跨多个软件组件的事务。

通常，分布式跟踪会跨越多个服务，因此需要一个唯一的标识符来标识每个事务。**跟踪上下文传播**就是传递这种唯一标识符的过程。

过去，不同的跟踪供应商各自实现自己的跟踪上下文传播方式。在多供应商环境中，这会导致互操作性的问题，例如：

- 不同供应商收集的跟踪数据无法关联，因为没有共享的唯一标识符。
- 跨越不同供应商边界的跟踪无法传播，因为没有统一的标识符集。
- 中间商可能会丢弃供应商特定的元数据。
- 云平台供应商、中间商和服务提供商无法保证支持跟踪上下文传播，因为没有标准可循。

以前，大多数应用程序由单一的跟踪供应商监控，并保持在单一平台提供商的边界内，因此这些问题没有显著影响。

如今，越来越多的应用程序是分布式的，并利用多个中间件服务和云平台。这种现代应用程序的转变需要一个分布式跟踪上下文传播标准。

[W3C 跟踪上下文规范](https://www.w3.org/TR/trace-context/) 定义了一种通用格式，用于交换跟踪上下文数据（称为跟踪上下文）。通过提供以下内容，跟踪上下文解决了上述问题：

- 为单个跟踪和请求提供唯一标识符，允许将多个供应商的跟踪数据链接在一起。
- 提供一种机制来转发供应商特定的跟踪数据，避免在单个事务中多个跟踪工具参与时出现断裂的跟踪。
- 一个中间商、平台和硬件供应商可以支持的行业标准。

这种统一的跟踪数据传播方法提高了对分布式应用程序行为的可见性，促进了问题和性能分析。

## W3C 跟踪上下文和头格式

### W3C 跟踪上下文

Dapr 使用标准的 W3C 跟踪上下文头。

- 对于 HTTP 请求，Dapr 使用 `traceparent` 头。
- 对于 gRPC 请求，Dapr 使用 `grpc-trace-bin` 头。

当请求到达时没有跟踪 ID，Dapr 会创建一个新的。否则，它会沿调用链传递跟踪 ID。

### W3C 跟踪头

这些是 Dapr 为 HTTP 和 gRPC 生成和传播的特定跟踪上下文头。

{{< tabs "HTTP" "gRPC" >}}
 <!-- HTTP -->
{{% codetab %}}

在从 HTTP 响应传播跟踪上下文头到 HTTP 请求时复制这些头：

**Traceparent 头**

Traceparent 头以所有供应商都能理解的通用格式表示跟踪系统中的传入请求：

```
traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
```

[了解更多关于 traceparent 字段的详细信息](https://www.w3.org/TR/trace-context/#traceparent-header)。

**Tracestate 头**

Tracestate 头以可能是供应商特定的格式包含父级：

```
tracestate: congo=t61rcWkgMzE
```

[了解更多关于 tracestate 字段的详细信息](https://www.w3.org/TR/trace-context/#tracestate-header)。

{{% /codetab %}}


 <!-- gRPC -->
{{% codetab %}}

在 gRPC API 调用中，跟踪上下文通过 `grpc-trace-bin` 头传递。

{{% /codetab %}}

{{< /tabs >}}

## 相关链接

- [了解更多关于 Dapr 中的分布式跟踪]({{< ref tracing-overview.md >}})
- [W3C 跟踪上下文规范](https://www.w3.org/TR/trace-context/)
