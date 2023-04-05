---
type: docs
title: "可观测性"
linkTitle: "可观测性"
weight: 500
description: >
  Observe applications through tracing, metrics, logs and health
---

When building an application, understanding how the system is behaving is an important part of operating it - this includes having the ability to observe the internal calls of an application, gauging its performance and becoming aware of problems as soon as they occur. This is challenging for any system, but even more so for a distributed system comprised of multiple microservices where a flow, made of several calls, may start in one microservice but continue in another. 可观察性不仅在生产环境中至关重要，在发开期间也同样有用，可以了解瓶颈所在，提高性能并在整个微服务范围内进行基本的调试。

While some data points about an application can be gathered from the underlying infrastructure (for example memory consumption, CPU usage), other meaningful information must be collected from an "application-aware" layer–one that can show how an important series of calls is executed across microservices. 这通常意味着开发人员必须添加一些代码来检测应用程序以实现此目的。 Often, instrumentation code is simply meant to send collected data such as traces and metrics to observability tools or services that can help store, visualize and analyze all this information.

Having to maintain this code, which is not part of the core logic of the application, is a burden on the developer, sometimes requiring understanding the observability tools' APIs, using additional SDKs etc. 此检测需求可能会增加应用程序的可移植性难度，比如在不同地方部署时，该应用程序可能需要不同的检测代码。 For example, different cloud providers offer different observability tools and an on-premises deployment might require a self-hosted solution.

## 通过 Dapr 进行观测

When building an application which leverages Dapr API building blocks to perform service-to-service calls and pub/sub messaging, Dapr offers an advantage with respect to [distributed tracing]({{<ref tracing>}}). Because this inter-service communication flows through the Dapr runtime (or "sidecar"), Dapr is in a unique position to offload the burden of application-level instrumentation.

### Distributed tracing

Dapr can be [configured to emit tracing data]({{<ref setup-tracing.md>}}), and because Dapr does so using the widely adopted protocols of [Open Telemetry (OTEL)](https://opentelemetry.io/) and [Zipkin](https://zipkin.io), it can be easily integrated with multiple observability tools.

<img src="/images/observability-tracing.png" width=1000 alt="使用 Dapr 进行分布式跟踪">

### Automatic tracing context generation

Dapr uses [W3C tracing]({{<ref w3c-tracing-overview>}}) specification for tracing context, included as part Open Telemetry (OTEL), to generate and propagate the context header for the application or propagate user-provided context headers. This means that you get tracing by default with Dapr.

## Observability for the Dapr sidecar and control plane

You also want to be able to observe Dapr itself, by collecting metrics on performance, throughput and latency and logs emitted by the Dapr sidecar, as well as the Dapr control plane services. Dapr sidecars have a health endpoint that can be probed to indicate their health status.

<img src="/images/observability-sidecar.png" width=1000 alt="Dapr sidecar metrics, logs and health checks">

### Logging

Dapr generates [logs]({{<ref "logs.md">}}) to provide visibility into sidecar operation and to help users identify issues and perform debugging. Log events contain warning, error, info, and debug messages produced by Dapr system services. Dapr can also be configured to send logs to collectors such as [Fluentd]({{< ref fluentd.md >}}), [Azure Monitor]({{< ref azure-monitor.md >}}), and other observability tools, so that logs can be searched and analyzed to provide insights.

### Metrics

Metrics are the series of measured values and counts that are collected and stored over time. [Dapr metrics]({{<ref "metrics">}}) provide monitoring capabilities to understand the behavior of the Dapr sidecar and control plane. For example, the metrics between a Dapr sidecar and the user application show call latency, traffic failures, error rates of requests, etc. Dapr [control plane metrics](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md) show sidecar injection failures and the health of control plane services, including CPU usage, number of actor placements made, etc.

### Health checks

The Dapr sidecar exposes an HTTP endpoint for [health checks]({{<ref sidecar-health.md>}}). With this API, user code or hosting environments can probe the Dapr sidecar to determine its status and identify issues with sidecar readiness.

Conversely, Dapr can be configured to probe for the [health of your application]({{<ref app-health.md >}}), and react to changes in the app's health, including stopping pub/sub subscriptions and short-circuiting service invocation calls.
