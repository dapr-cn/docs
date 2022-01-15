---
type: docs
title: "服务调用性能"
linkTitle: "服务调用性能"
weight: 10000
description: ""
---

本文提供了在不同托管环境中运行 Dapr 所需的组件的服务调用 API 性能基准和资源利用率。

## 系统概述

Dapr 由一个数据平面、在应用旁边运行的 sidecar 以及一个配置 sidecar 并提供证书和身份管理等功能的控制平面组成。

### 自托管组件

* Sidecar (数据平面)
* Sentry（可选，控制平面）
* Placement（可选，控制平面）

有关详细信息，请参阅 [自承载模式下的 Dapr 概述]({{< ref self-hosted-overview.md >}})。

### Kubernetes组件

* Sidecar (数据平面)
* Sentry（可选，控制平面）
* Placement（可选，控制平面）
* Operator（控制平面）
* Sidecar Injector（控制平面）

有关更多信息，请参阅 [Kubernetes 上的 Dapr 概述]({{< ref kubernetes-overview.md >}}).

## Dapr v1.0 的性能摘要

服务调用 API 是具有内置服务发现的反向代理，用于连接到其他服务。 这包括 tracing、metrics、用于传输中流量加密的 mTLS，以及对网络分区和连接错误提供弹性重试。

使用服务调用，您可以从 HTTP 调用到 HTTP，从 HTTP 调用到 gRPC，从 gRPC 调用到 HTTP，从 gRPC 调用到 gRPC。 Dapr 不使用 HTTP 进行 sidecar 之间的通信，而是始终使用 gRPC，同时继承从应用程序调用时所用协议的语义。 服务调用是与 Dapr Actor 通信的基本机制。

有关详细信息，请参 阅 [服务调用概述]({{< ref service-invocation-overview.md >}})。

### Kubernetes性能测试设置

该测试在3节点Kubernetes集群上进行，使用运行4个内核和8GB RAM的商用硬件，没有任何网络加速。 该设置包括一个负载测试器（[Fortio](https://github.com/fortio/fortio)）pod，其中注入了一个Dapr sidecar，调用服务调用API以访问不同节点上的pod。

测试参数

* 每秒 1000 个请求
* Sidecar 限制为 0.5 vCPU
* Sidecar mTLS已启用
* Sidecar遥测功能已启用(取样率为0.1)
* 1KB的载荷量

基线测试包括直接从负载测试程序到目标应用的直接、非加密流量（无需遥测）。

### 控制平面性能

在非 HA 模式下运行时，Dapr 控制平面总共使用 0.009 个 vCPU 和 61.6 Mb，这意味着每个系统组件只有一个副本。 在高可用性生产设置中运行时，Dapr 控制平面消耗约 0.02 个 vCPU 和 185 Mb。

| Component (组件)   | vCPU  | Memory  |
| ---------------- | ----- | ------- |
| Operator         | 0.001 | 12.5 Mb |
| Sentry           | 0.005 | 13.6 Mb |
| Sidecar Injector | 0.002 | 14.6 Mb |
| 放置               | 0.001 | 20.9 Mb |

有一些变体会影响每个系统组件的CPU和内存消耗。 下表列出了这些变体。

| Component (组件)   | vCPU            | Memory        |
| ---------------- | --------------- | ------------- |
| Operator         | 请求组件、配置和订阅的容器次数 |               |
| Sentry           | 证书请求次数          |               |
| Sidecar Injector | Admission 请求次数  |               |
| 放置               | Actor 重新平衡操作的次数 | 连接的 Actor 主机数 |

### 数据平面性能

Dapr sidecar 每秒1000 个请求使用 0.48 个 vCPU 和 23Mb 。 端到端，Dapr sidecar（客户端和服务器）在第 90 百分位延迟的基础上增加了约 1.40 毫秒，在第 99 百分位延迟的基础上增加了约 2.10 毫秒。 此处的端到端是从一个应用到另一个应用的调用，以接收响应。 这通过 [此图形]({{< ref service-invocation-overview.md >}}) 中的步骤1-7显示。

这种性能优于通常使用的服务网格。

### 延迟

在测试设置中，请求通过客户端（为来自负载测试器工具的请求提供服务）和服务器端（目标应用）通过 Dapr sidecar。 在 Dapr 测试上启用了 mTLS 和遥测（采样率为 0.1）和 metrics ，并在基线测试中禁用了这些功能。

<img src="/images/perf_invocation_p90.png" alt="Latency for 90th percentile" />

<br>

<img src="/images/perf_invocation_p99.png" alt="Latency for 99th percentile" />
