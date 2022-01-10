---
type: docs
title: "Actors激活性能"
linkTitle: "Actors激活性能"
weight: 20000
description: ""
---

本文为 Kubernetes 上的 Dapr 中的Actors提供了服务调用 API 性能基准和资源利用率。

## 系统概述

对于在 Dapr 中使用 Actor 的应用程序，需要考虑两个方面。 首先，actor调用路由是由Dapr sidecar 处理 其次，是在应用程序端实现和处理并依赖于 SDK 的 actor 运行时。 目前，性能测试使用 Java SDK 在应用程序中提供Actors运行时。

### Kubernetes 组件

* Sidecar (data plane)
* Placement (required for actors, control plane mapping actor types to hosts)
* Operator (control plane)
* Sidecar Injector (control plane)
* Sentry (optional, control plane)

## Dapr v1.0 的性能摘要

Dapr sidecar 中的 actor API 将标识哪些主机是为给定执行组件类型注册的，并将请求路由到给定actor ID 的相应主机。 主机运行应用程序的实例，并使用Dapr SDK（.Net，Java，Python或PHP）通过HTTP处理Actor请求。

此测试使用直接通过 Dapr 的 HTTP API 调用参与者。

有关详细信息，请参 阅 [Actor概述]({{< ref actors-overview.md >}})。

### Kubernetes 性能测试设置

该测试在3节点Kubernetes集群上进行，使用运行4个内核和8GB RAM的商用硬件，没有任何网络加速。 该设置包括一个负载测试器（[Fortio](https://github.com/fortio/fortio)）pod，其中注入了一个Dapr sidecar，调用服务调用API以访问不同节点上的pod。

测试参数

* 500 requests per second
* 1 replica
* 1 minute duration
* Sidecar limited to 0.5 vCPU
* mTLS enabled
* Sidecar telemetry enabled (tracing with a sampling rate of 0.1)
* Payload of an empty JSON object: `{}`

### 结果

* The actual throughput was ~500 qps.
* The tp90 latency was ~3ms.
* The tp99 latency was ~6.2ms.
* Dapr app consumed ~523m CPU and ~304.7Mb of Memory
* Dapr sidecar consumed 2m CPU and ~18.2Mb of Memory
* No app restarts
* No sidecar restarts

## 相关链接
* 有关更多信息，请参阅 [Kubernetes 上的 Dapr 概述]({{< ref kubernetes-overview.md >}})