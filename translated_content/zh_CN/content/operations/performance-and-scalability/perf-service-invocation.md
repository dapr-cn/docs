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
* Placement (optional, control plane)

有关详细信息，请参阅 [自承载模式下的 Dapr 概述]({{< ref self-hosted-overview.md >}})。

### Kubernetes组件

* Sidecar (数据平面)
* Sentry (optional, control plane)
* Placement (optional, control planee)
* Operator (control plane)
* Sidecar Injector (control plane)

For more information see [overview of Dapr on Kubernetes]({{< ref kubernetes-overview.md >}}).

## Performance summary for Dapr v1.0

The service invocation API is a reverse proxy with built-in service discovery to connect to other services. This includes tracing, metrics, mTLS for in-transit encryption of traffic, together with resiliency in the form of retries for network partitions and connection errors.

Using service invocation you can call from HTTP to HTTP, HTTP to gRPC, gRPC to HTTP, and gRPC to gRPC. Dapr does not use HTTP for the communication between sidecars, always using gRPC, while carrying over the semantics of the protocol used when called from the app. Service invocation is the underlying mechanism of communicating with Dapr Actors.

For more information see [service invocation overview]({{< ref service-invocation-overview.md >}}).

### Kubernetes performance test setup

The test was conducted on a 3 node Kubernetes cluster, using commodity hardware running 4 cores and 8GB of RAM, without any network acceleration. The setup included a load tester ([Fortio](https://github.com/fortio/fortio)) pod with a Dapr sidecar injected into it that called the service invocation API to reach a pod on a different node.

Test parameters:

* 1000 requests per second
* Sidecar limited to 0.5 vCPU
* Sidecar mTLS enabled
* Sidecar telemetry enabled (tracing with a sampling rate of 0.1)
* Payload of 1KB

The baseline test included direct, non-encrypted traffic, without telemetry, directly from the load tester to the target app.

### Control plane performance

The Dapr control plane uses a total of 0.009 vCPU and 61.6 Mb when running in non-HA mode, meaning a single replica per system compoment. When running in a highly available production setup, the Dapr control plane consumes ~0.02 vCPU and 185 Mb.

| Component (组件)   | vCPU  | Memory  |
| ---------------- | ----- | ------- |
| Operator         | 0.001 | 12.5 Mb |
| Sentry           | 0.005 | 13.6 Mb |
| Sidecar Injector | 0.002 | 14.6 Mb |
| 放置               | 0.001 | 20.9 Mb |

There are a number of variants that affect the CPU and memory consumption for each of the system components. These variants are shown in the table below.

| Component (组件)   | vCPU                                                                   | Memory                          |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------- |
| Operator         | Number of pods requesting components, configurations and subscriptions |                                 |
| Sentry           | Number of certificate requests                                         |                                 |
| Sidecar Injector | Number of admission requests                                           |                                 |
| 放置               | Number of actor rebalancing operations                                 | Number of connected actor hosts |

### Data plane performance

The Dapr sidecar uses 0.48 vCPU and 23Mb per 1000 requests per second. End-to-end, the Dapr sidecars (client and server) add ~1.40 ms to the 90th percentile latency, and ~2.10 ms to the 99th percentile latency. End-to-end here is a call from one app to another app receiving a response. This is shown by steps 1-7 in [this diagram]({{< ref service-invocation-overview.md >}}).

This performance is on par or better than commonly used service meshes.

### Latency

In the test setup, requests went through the Dapr sidecar both on the client side (serving requests from the load tester tool) and the server side (the target app). mTLS and telemetry (tracing with a sampling rate of 0.1) and metrics were enabled on the Dapr test, and disabled for the baseline test.

<img src="/images/perf_invocation_p90.png" alt="Latency for 90th percentile" />

<br>

<img src="/images/perf_invocation_p99.png" alt="Latency for 99th percentile" />
