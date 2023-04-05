---
type: docs
title: "Trace context"
linkTitle: "Trace context"
weight: 4000
description: 使用 Dapr 进行 W3C 追踪的背景和场景
---

Dapr uses the [Open Telemetry protocol](https://opentelemetry.io/), which in turn uses the [W3C trace context](https://www.w3.org/TR/trace-context/) for distributed tracing for both service invocation and pub/sub messaging. Dapr generates and propagates the trace context information, which can be sent to observability tools for visualization and querying.

## 背景
Distributed tracing is a methodology implemented by tracing tools to follow, analyze, and debug a transaction across multiple software components. 通常情况下，分布式跟踪会游历多个服务，这要求它是唯一可识别的。 跟踪上下文的传播依托于这个唯一标识。

In the past, trace context propagation has typically been implemented individually by each different tracing vendor. In multi-vendor environments, this causes interoperability problems, such as:

- Traces that are collected by different tracing vendors cannot be correlated as there is no shared unique identifier.
- Traces that cross boundaries between different tracing vendors can not be propagated as there is no forwarded, uniformly agreed set of identification.
- Vendor-specific metadata might be dropped by intermediaries.
- Cloud platform vendors, intermediaries, and service providers cannot guarantee to support trace context propagation as there is no standard to follow.

In the past, these problems did not have a significant impact, as most applications were monitored by a single tracing vendor and stayed within the boundaries of a single platform provider. 如今，越来越多的应用程序被分发到并使用多个中间件服务和云平台。

现代应用的这种转变呼唤建立一种分布式跟踪上下文传播标准。 [W3C 跟踪上下文规范](https://www.w3.org/TR/trace-context) 定义了一种普遍认可的交换跟踪上下文传播数据的格式 - 称为跟踪上下文。 Trace context solves the problems described above by:

* Providing a unique identifier for individual traces and requests, allowing trace data of multiple providers to be linked together.
* 提供一个商定的机制，以转发供应商特有的跟踪数据，并在多个跟踪工具参与单个事务时避免出现跟踪中断的情况。
* 提供中介、平台和硬件提供商都可以支持的行业标准。

传播跟踪数据的统一方法提高了分布式应用程序行为的可见性，从而有助于问题分析和性能分析。

## 相关链接
- [W3C Trace Context specification](https://www.w3.org/TR/trace-context/)
