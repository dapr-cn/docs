---
type: docs
title: "W3C 跟踪上下文概述"
linkTitle: "概述"
weight: 10000
description: 使用Dapr进行W3C追踪的背景和场景
---

## 介绍
Dapr 使用 W3C 追踪上下文对服务调用和 pub/sub 消息传递进行分布式跟踪。 在很大程度上，Dapr 负责生成和传播跟踪上下文信息的所有繁重工作，这些信息可以发送到许多不同的诊断工具进行可视化和查询。 作为开发者，您只有在极少数情况下需要传播或生成跟踪标头。

## 背景
分布式跟踪是一种由跟踪工具实现的方法，用于跟踪、分析和调试跨多个软件组件的事务。 通常情况下，分布式跟踪会游历多个服务，这要求它是唯一可识别的。 跟踪上下文的传播依托于这个唯一标识。

在过去，跟踪上下文传播通常由每个不同的跟踪供应商单独实现。 在多供应商环境中，这会导致互操作性问题，例如：

- 由于没有共享的唯一标识，因此不同跟踪供应商收集的跟踪无法相互关联。
- 跨越不同跟踪供应商之间边界的跟踪无法传播，因为没有统一协商的标识集可以转发。
- 供应商特定的元数据可能会被中介丢弃。
- 因为没有可遵循的标准，云平台供应商，中介和服务提供商无法保证支持跟踪上下文的传播。

在过去，这些问题没有产生重大影响，因为大多数应用程序都由单个跟踪供应商监控，并停留在单个平台提供者的边界内。 如今，越来越多的应用程序被分发到并使用多个中间件服务和云平台。

现代应用的这种转变呼唤建立一种分布式跟踪上下文传播标准。 [W3C 跟踪上下文规范](https://www.w3.org/TR/trace-context) 定义了一种普遍认可的交换跟踪上下文传播数据的格式 - 称为跟踪上下文。 跟踪上下文解决了上述问题：

* 为单个跟踪和请求提供唯一标识符，允许将多个供应商的跟踪数据连接起来。
* 提供一个商定的机制，以转发供应商特有的跟踪数据，并在多个跟踪工具参与单个事务时避免出现跟踪中断的情况。
* 提供中介、平台和硬件提供商都可以支持的行业标准。

传播跟踪数据的统一方法提高了分布式应用程序行为的可见性，从而有助于问题分析和性能分析。

## 场景
您需要了解如何使用跟踪的两种情况：
 1. Dapr生成并在服务之间传播跟踪上下文。
 2. Dapr 生成跟踪上下文，您需要将跟踪上下文传播到另一个服务，或者你生成跟踪上下文，Dapr 将跟踪上下文传播到服务。

### Dapr生成并在服务之间传播跟踪上下文。
在这些场景下，Dapr 会为您完成所有工作。 您不需要创建和传播任何跟踪头。 Dapr 负责创建所有跟踪头并传播它们。 让我们用示例来了解一下这些场景：

1. 单个服务调用 (`service A -> service B` )

    Dapr 在服务A 中生成跟踪标头，这些跟踪标头从服务A 传播到服务B。

2. 多个顺序的服务调用 （ `服务 A -> 服务 B -> 服务 C`）

    Dapr 在服务 A 中请求开始时生成跟踪标头，这些跟踪标头从 `服务 A-> 服务 B -> 服务 C` 一路传播到进一步启用了 Dapr 的服务。

3. 请求来自外部端点 （例如从网关服务到启用 Dapr 的服务 A）

    Dapr 在服务 A 中生成跟踪标头，这些跟踪标头从服务 A 传播到进一步启用了 Dapr 的服务 `服务 A -> 服务 B -> 服务 C`。 这与上面的场景 2 类似。

4. Pub/sub消息：Dapr 在发布的消息主题中生成跟踪头，而这些跟踪头被传播到任何监听该主题的服务。

### 您需要在服务之间传播或生成跟踪上下文
在这些场景下，Dapr 会为您完成一些工作，您需要创建或传播跟踪标头。

1. 从单个服务到不同服务的多次服务调用

   当您从一个服务调用多个服务时，比如像这样从服务A中调用，你需要传播跟踪头。
   
        service A -> service B
        [ .. some code logic ..]
        service A -> service C
        [ .. some code logic ..]
        service A -> service D
        [ .. some code logic ..]

    在这种情况下，当服务 A 首先调用服务 B 时，Dapr 会在服务 A 中生成跟踪标头，然后这些跟踪标头将传播到服务 B。 这些跟踪标头作为响应标头的一部分在服务 B 的响应中返回。 但是，您需要将返回的跟踪上下文传播到下一个服务，如服务 C 和服务 D，因为 Dapr 不知道您希望重用相同的标头。

     若要了解如何从响应中提取跟踪标头并将跟踪标头添加到请求中，请参阅 [如何使用跟踪上下文]({{< ref w3c-tracing >}}) 一文.

2. 您已选择生成自己的跟踪上下文标头。 这是很少会遇到的。 There may be occasions where you specifically chose to add W3C trace headers into a service call, for example if you have an existing application that does not currently use Dapr. 在这种情况下，Dapr 仍然会为您传播跟踪上下文标头。 如果您决定自己生成跟踪标头，有三种方法可以实现：

     1. 您可以使用行业标准的 OpenCensus/ OpenTelemetry SDKs 生成跟踪头，并将这些跟踪头传递到启用的Dapr 服务。 这是首选的建议。

     2. 您可以使用供应商SDK来生成W3C跟踪标头，如DynaTrace SDK，并将这些跟踪标头传递给启用Dapr的服务。

     3. 您可以遵循 [ W3C 跟踪上下文规范 ](https://www.w3.org/TR/trace-context/) 来处理跟踪上下文，将这些跟踪标头传递给启用 Dapr 的服务。

## W3C 跟踪标头
这些是 Dapr 为 HTTP 和 gRPC 生成和传播的特定跟踪上下文标头。

### 跟踪上下文 HTTP 标头格式
When propagating a trace context header from an HTTP response to an HTTP request, these are the headers that you need to copy.

#### Traceparent 标头
Traceparent 头以所有供应商都能理解的通用格式在追踪系统中表示收到的请求。 下面是 Traceparent 标头的示例。

`traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01`

 关于 traceparent 字段的详情可见[此处](https://www.w3.org/TR/trace-context/#traceparent-header)

#### Tracestate 标头
Tracestate 标头包含特定于供应商格式的父级（parent）。

`tracestate: congo=t61rcWkgMzE`

Tracestate 字段的详细信息 [ 在这里 ](https://www.w3.org/TR/trace-context/#tracestate-header) 。

### 跟踪上下文 gRPC 标头格式
在 gRPC API 调用中，跟踪上下文通过 `grpc-trace-bin` 标头传递。

## 相关链接
- [如何使用 OpenTelemetry 为分布式跟踪设置 Application Insights]({{< ref open-telemetry-collector.md >}})
- [操作方法: 为分布式跟踪安装 Zipkin]({{< ref zipkin.md >}})
- [W3C 跟踪上下文规范](https://www.w3.org/TR/trace-context/)
- [可观测性示例](https://github.com/dapr/quickstarts/tree/master/observability)
