---
type: docs
title: "Actor 激活性能"
linkTitle: "Actor 激活性能"
weight: 20000
description: ""
---

This article provides service invocation API performance benchmarks and resource utilization for actors in Dapr on Kubernetes.

## System overview

对于在 Dapr 中使用 Actor 的应用程序，需要考虑两个方面。 首先是路由，由 Dapr sidecar 处理 actor 调用的路由。 其次是 actor 运行时，actor 运行时是在应用程序端实现和处理的，并依赖于 SDK。 目前，性能测试使用 Java SDK 在应用程序中提供 Actor 运行时。

### Kubernetes 组件

* Sidecar (data plane)
* Placement (required for actors, control plane mapping actor types to hosts)
* Operator（控制平面）
* Sidecar Injector（控制平面）
* Sentry (optional, control plane)

## Dapr v1.0 的性能摘要

Dapr sidecar 中的 actor API 将标识哪些主机是为给定 actor 类型注册的，并将请求路由到给定 actor ID 的相应主机。 主机运行应用程序的实例，并使用 Dapr SDK（.Net，Java，Python 或 PHP）通过 HTTP 处理 Actor 请求。

此测试使用直接通过 Dapr 的 HTTP API 调用 actor。

有关详细信息，请参阅 [Actor 概述]({{< ref actors-overview.md >}})。

### Kubernetes 性能测试设置

该测试在3节点 Kubernetes 集群上进行，使用运行4个内核和8GB RAM 的商用硬件，没有任何网络加速。 该设置包括一个负载测试器（[Fortio](https://github.com/fortio/fortio)）pod，其中注入了一个 Dapr sidecar，调用服务调用 API 以访问不同节点上的 pod。

测试参数

* 500 requests per second
* 1 个副本
* 1 分钟持续时间
* Sidecar 限制为 0.5 vCPU
* 启用 mTLS
* Sidecar 遥测功能已启用(取样率为0.1)
* 空 JSON 对象的负载: `{}`

### 结果

* The actual throughput was ~500 qps.
* Tp90 延迟约为 3 毫秒。
* Tp99 延迟约为 6.2 毫秒。
* Dapr 应用程序消耗约 523m CPU 和 304Mb 内存
* Dapr sidecar 消耗 2m CPU 和 18.2Mb 内存
* 无应用重启
* 无 sidecar 重启

## 相关链接
* 有关更多信息，请参阅 [Kubernetes 上的 Dapr 概述]({{< ref kubernetes-overview.md >}})